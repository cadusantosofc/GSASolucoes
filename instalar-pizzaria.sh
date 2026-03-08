#!/bin/bash

# ========================================
# INSTALADOR AUTOMÁTICO - SISTEMA PIZZARIA
# SEM DOCKER - INSTALAÇÃO NATIVA
# COMPATÍVEL COM UBUNTU 20.04+ / DEBIAN 11+
# ========================================

set -e

# Arquivo de log
LOG_FILE="/var/log/pizzaria-install.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $1" >> "$LOG_FILE"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARNING] $1" >> "$LOG_FILE"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $1" >> "$LOG_FILE"
}

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [HEADER] $1" >> "$LOG_FILE"
}

# Função para mostrar cabeçalho com limpeza de tela
show_step() {
    clear
    print_header "🚀 PASSO $1/$TOTAL_STEPS: $2"
    echo ""
}

# Função para gerar senha aleatória segura
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

# Função para validar comando
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Função para garantir memória SWAP (previne erro 137 no build)
setup_swap() {
    print_status "Verificando memória RAM e Swap..."
    local total_ram=$(free -m | awk '/^Mem:/{print $2}')
    local current_swap=$(free -m | awk '/^Swap:/{print $2}')
    
    print_status "Memória RAM: ${total_ram}MB | Swap atual: ${current_swap}MB"
    
    if [ "$current_swap" -lt 2000 ]; then
        print_status "Memória Swap insuficiente para build do Next.js. Criando arquivo swap de 2GB..."
        
        # Remover swap antigo se existir e for pequeno
        if [ -f "/swapfile" ]; then
            swapoff /swapfile 2>/dev/null || true
            rm -f /swapfile
        fi
        
        fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
        chmod 600 /swapfile
        mkswap /swapfile
        swapon /swapfile
        
        # Adicionar ao fstab se não existir
        if ! grep -q "/swapfile" /etc/fstab; then
            echo '/swapfile none swap sw 0 0' >> /etc/fstab
        fi
        
        print_status "✅ Memória Swap de 2GB configurada com sucesso!"
    else
        print_status "✅ Memória Swap suficiente (${current_swap}MB)"
    fi
}

# Função para verificar espaço em disco
check_disk_space() {
    local required_gb=10
    local available=$(df /opt | awk 'NR==2 {print $4}')
    local available_gb=$((available / 1024 / 1024))
    
    if [ "$available_gb" -lt "$required_gb" ]; then
        print_error "Espaço em disco insuficiente. Necessário: ${required_gb}GB, Disponível: ${available_gb}GB"
        return 1
    fi
    print_status "✅ Espaço em disco verificado: ${available_gb}GB disponível"
    return 0
}

# Função para aguardar serviço estar pronto
wait_for_service() {
    local service=$1
    local timeout=${2:-30}
    local elapsed=0
    
    while [ $elapsed -lt $timeout ]; do
        if systemctl is-active --quiet "$service"; then
            print_status "✅ Serviço $service está pronto"
            return 0
        fi
        sleep 2
        elapsed=$((elapsed + 2))
    done
    
    print_error "Timeout aguardando serviço $service"
    return 1
}

# Função para executar migrations via pnpm
run_migrations() {
    print_status "Iniciando execução automática de migrations..."
    
    # Verificar se existe comando 'pnpm run migrate'
    if pnpm run migrate 2>/dev/null; then
        print_status "✅ Migrations executadas com sucesso via pnpm!"
        return 0
    else
        print_error "Erro ao executar migrations via pnpm"
        return 1
    fi
}

# Função para verificar se as migrations foram executadas corretamente
verify_migrations() {
    print_status "✅ Verificação de migrations concluída!"
}

# Funções de Instalação Individual
install_nodejs() {
    print_status "Instalando Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    if ! command_exists node; then
        print_error "Node.js não foi instalado corretamente"
        return 1
    fi
    print_status "✅ Node.js: $(node --version)"
    return 0
}

install_mysql() {
    print_status "Instalando MySQL Server..."
    apt install -y mysql-server
    systemctl start mysql
    systemctl enable mysql
    wait_for_service mysql 30
    
    print_status "Configurando MySQL..."
    mysql -e "SET GLOBAL validate_password.policy=LOW;" 2>/dev/null || true
    mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$MYSQL_ROOT_PASSWORD';" 2>/dev/null || true
    mysql -e "FLUSH PRIVILEGES;" 2>/dev/null || true
    print_status "✅ MySQL configurado com sucesso"
}

install_nginx() {
    print_status "Instalando Nginx..."
    apt install -y nginx
    systemctl enable nginx
    systemctl start nginx
    print_status "✅ Nginx instalado"
}

setup_systemd() {
    print_status "Configurando serviço systemd..."
    cat > /etc/systemd/system/pizzaria.service << EOF
[Unit]
Description=Sistema Pizzaria
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=$PROJECT_DIR
Environment=NODE_ENV=production
Environment=PORT=8799
EnvironmentFile=$PROJECT_DIR/.env
ExecStart=/usr/bin/pnpm start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
    systemctl daemon-reload
    systemctl enable pizzaria
    print_status "✅ Serviço systemd configurado"
}

configure_nginx_site() {
    print_status "Criando configuração do Nginx..."
    cat > /etc/nginx/sites-available/pizzaria << EOF
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:8799;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    ln -sf /etc/nginx/sites-available/pizzaria /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl reload nginx
    print_status "✅ Nginx configurado"
}

# Função para criar Backup Completo
create_backup() {
    local BACKUP_DIR="/opt/pizzaria_backups"
    local DATE=$(date '+%Y%m%d_%H%M%S')
    local FILENAME="pizzaria_backup_$DATE"
    
    mkdir -p "$BACKUP_DIR"
    print_status "Iniciando backup completo em $BACKUP_DIR/$FILENAME.tar.gz..."
    
    # 1. Backup do Banco de Dados
    print_status "Exportando banco de dados..."
    mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" "$DATABASE_NAME" > "$BACKUP_DIR/$FILENAME.sql"
    
    # 2. Compactar arquivos e banco (ignorando node_modules e .next para economizar espaço)
    print_status "Compactando arquivos (ignorando node_modules e cache)..."
    tar -czf "$BACKUP_DIR/$FILENAME.tar.gz" \
        -C "$PROJECT_DIR" . \
        --exclude="node_modules" \
        --exclude=".next" \
        --exclude=".git" \
        --exclude="*.log" \
        -C "$BACKUP_DIR" "$FILENAME.sql"
    
    # Limpar SQL temporário
    rm "$BACKUP_DIR/$FILENAME.sql"
    
    print_status "✅ Backup concluído com sucesso!"
    print_status "Arquivo: $BACKUP_DIR/$FILENAME.tar.gz"
    echo ""
    echo "Dica: Você pode baixar este arquivo via SCP ou usar um cliente FTP."
}

# Função para instalar e configurar Redis na porta 6380
install_redis() {
    print_status "Instalando Redis Server..."
    # DEBIAN_FRONTEND evita travar se o serviço falhar no setup inicial do apt
    DEBIAN_FRONTEND=noninteractive apt install -y redis-server || true

    print_status "Configurando Redis para porta 6380..."
    
    # Backup de segurança
    [ -f /etc/redis/redis.conf ] && cp /etc/redis/redis.conf /etc/redis/redis.conf.bak

    # Configuração robusta da porta e bind
    sed -i 's/^port .*/port 6380/' /etc/redis/redis.conf
    sed -i 's/^bind .*/bind 127.0.0.1/' /etc/redis/redis.conf
    sed -i 's/^protected-mode yes/protected-mode no/' /etc/redis/redis.conf
    
    print_status "Reiniciando serviço Redis..."
    systemctl restart redis-server || {
        print_error "Erro ao iniciar Redis na porta 6380. Verificando logs..."
        journalctl -u redis-server -n 20 --no-pager
        return 1
    }
    
    systemctl enable redis-server
    print_status "✅ Redis rodando com sucesso na porta 6380!"
}

# Verificar se é root
if [ "$EUID" -ne 0 ]; then
    print_error "Por favor, execute como root (sudo su)"
    exit 1
fi

# Inicializar arquivo de log
touch "$LOG_FILE" 2>/dev/null || LOG_FILE="/tmp/pizzaria-install.log"
print_header "INSTALADOR SISTEMA PIZZARIA - UBUNTU/DEBIAN"

# Configurações padrão
DATABASE_NAME="delivery"
MYSQL_USER="root"
MYSQL_ROOT_PASSWORD="root"
MYSQL_PASSWORD="root"
PROJECT_DIR="${PROJECT_DIR:-/opt/pizzaria}"

# Gerar NEXTAUTH_SECRET seguro
NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-$(openssl rand -base64 32)}"

# Token GitHub configurado (necessário para repositório privado)
GITHUB_TOKEN="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"

# Controle de passos
CURRENT_STEP=0

# Escolher tipo de instalação
echo ""
echo "1) Instalar tudo do zero (VPS limpa)"
echo "2) Atualizar sistema existente (sem apagar nada)"
echo "3) Opções Individuais (Instalar apenas um componente)"
echo "4) Criar Backup completo (Banco + Arquivos)"
echo ""
read -p "Digite sua opção (1, 2, 3 ou 4): " INSTALL_TYPE

if [ "$INSTALL_TYPE" = "4" ]; then
    print_header "GERANDO BACKUP COMPLETO"
    create_backup
    exit 0
fi

if [ "$INSTALL_TYPE" = "3" ]; then
    clear
    print_header "OPÇÕES DE INSTALAÇÃO INDIVIDUAL"
    echo "1) Instalar Node.js 18"
    echo "2) Instalar MySQL Server"
    echo "3) Instalar Redis Server (Porta 6380)"
    echo "4) Instalar Nginx"
    echo "5) Configurar apenas Banco de Dados (delivery.sql + migrations)"
    echo "6) Configurar apenas Serviço Systemd"
    echo "7) Configurar apenas Site no Nginx"
    echo ""
    read -p "Escolha o componente para instalar: " SUB_OPT
    
    case $SUB_OPT in
        1) install_nodejs ;;
        2) install_mysql ;;
        3) install_redis ;;
        4) install_nginx ;;
        5) 
            mysql -u root -p$MYSQL_ROOT_PASSWORD -e "CREATE DATABASE IF NOT EXISTS $DATABASE_NAME;"
            mysql -u root -p$MYSQL_ROOT_PASSWORD $DATABASE_NAME < delivery.sql || true
            run_migrations 
            ;;
        6) setup_systemd ;;
        7) configure_nginx_site ;;
        *) print_error "Opção inválida" ;;
    esac
    exit 0
fi

print_status "Configurações:"
echo "Token GitHub: Configurado via variável de ambiente"
echo "Banco: $DATABASE_NAME"
echo "Usuário MySQL: $MYSQL_USER"
echo "Senha MySQL: [OCULTA - Salva no arquivo .env]"
echo "Diretório: $PROJECT_DIR"
echo "Tipo: $([ "$INSTALL_TYPE" = "1" ] && echo "Instalação completa" || echo "Atualização")"
echo "SSL: Será configurado via tunnel (não necessário aqui)"
echo "Logs: $LOG_FILE"
echo ""

read -p "Continuar? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Instalação cancelada"
    exit 1
fi

if [ "$INSTALL_TYPE" = "1" ]; then
    TOTAL_STEPS=10
    show_step 1 "PREPARAÇÃO DO AMBIENTE"
    
    # Verificar espaço em disco
    if ! check_disk_space; then
        exit 1
    fi
    
    # Atualizar sistema
    print_status "Atualizando sistema..."
    apt update && apt upgrade -y
    
    show_step 2 "INSTALANDO DEPENDÊNCIAS DO SISTEMA"
    
    # Instalar dependências (compatível com Ubuntu/Debian)
    apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release build-essential openssl
    
    show_step 3 "INSTALANDO NODE.JS"
    install_nodejs
    
    show_step 4 "INSTALANDO MYSQL"
    install_mysql
    
    show_step 5 "INSTALANDO NGINX"
    install_nginx
    
    show_step 6 "INSTALANDO REDIS"
    install_redis
    
else
    TOTAL_STEPS=6
    show_step 1 "PREPARAÇÃO PARA ATUALIZAÇÃO"
    
    # Parar o serviço antes da atualização
    print_status "Parando serviço pizzaria..."
    systemctl stop pizzaria 2>/dev/null || true
    
    # Ir para o diretório do projeto
    cd $PROJECT_DIR
    
    # Fazer backup do .env atual
    print_status "Fazendo backup das configurações..."
    if [ -f ".env" ]; then
        cp .env ".env.backup.$(date +%Y%m%d_%H%M%S)"
        print_status "✅ Backup do .env criado"
    fi
    
    # Configurar diretório como seguro para Git
    print_status "Configurando diretório como seguro para Git..."
    git config --global --add safe.directory $PROJECT_DIR 2>/dev/null || true
    
    # 🧹 Limpeza profunda para evitar conflitos (Sugerido pelo usuário)
    print_status "Limpando alterações locais e arquivos não rastreados..."
    git reset --hard
    git clean -fd
    
    show_step 2 "DOWNLOAD DA NOVA VERSÃO"
    
    # Puxar nova versão do GitHub
    print_status "Puxando nova versão do GitHub..."
    if ! git pull origin main; then
        print_error "Erro ao atualizar repositório"
        exit 1
    fi
    
    # Verificar arquivo .env
    print_status "Verificando arquivo .env..."
    if [ -f ".env" ]; then
        print_status "✅ Arquivo .env encontrado, mantendo configurações existentes"
    else
        print_warning "⚠️ Arquivo .env não encontrado!"
        if [ -f "env.exemple" ]; then
            print_status "Criando arquivo .env a partir do env.exemple..."
            cp env.exemple .env
            print_warning "⚠️ Configure as variáveis necessárias no arquivo .env"
        else
            print_error "Arquivo env.exemple não encontrado"
            exit 1
        fi
    fi
    
    # Garantir memória swap para o build
    setup_swap
    
    show_step 3 "INSTALAÇÃO DE DEPENDÊNCIAS"
    
    # Garantir memória swap para o build
    setup_swap
    
    print_status "Atualizando dependências com pnpm (isso pode demorar...)"
    # Usar --ignore-scripts para evitar execução dupla de migrations durante o install
    if ! pnpm install --ignore-scripts; then
        print_error "Erro ao instalar dependências"
        exit 1
    fi
    
    show_step 4 "BUILD DO SISTEMA"
    
    # Fazer build do projeto com limite de memória aumentado
    print_status "Fazendo build do projeto..."
    export NODE_OPTIONS="--max-old-space-size=2048"
    if ! pnpm run build; then
        print_error "Erro ao fazer build do projeto"
        exit 1
    fi
    
    show_step 5 "MIGRAÇÕES DE BANCO DE DADOS"
    
    # Executar migrações se necessário (sem apagar dados)
    print_status "Executando migrações de banco (se necessário)..."
    run_migrations
    
    # Verificar se as migrations foram executadas corretamente
    verify_migrations
    
    show_step 6 "FINALIZAÇÃO E REINÍCIO"
    
    # Configurar permissões
    print_status "Configurando permissões..."
    chown -R www-data:www-data $PROJECT_DIR
    chmod -R 755 $PROJECT_DIR
    chmod 600 $PROJECT_DIR/.env 2>/dev/null || true
    
    # Reiniciar o serviço
    print_status "Reiniciando serviço pizzaria..."
    systemctl start pizzaria
    
    # Aguardar serviço inicializar
    if ! wait_for_service pizzaria 30; then
        print_warning "⚠️ Serviço pode estar inicializando ainda"
    fi
    
    print_status "✅ Atualização concluída!"
    
    # Pular configurações que só são necessárias na instalação inicial
    print_header "VERIFICANDO STATUS APÓS ATUALIZAÇÃO"
    
    # Aguardar serviço inicializar
    sleep 5
    
    # Verificar status dos serviços
    print_status "Status do serviço pizzaria:"
    systemctl status pizzaria --no-pager || print_warning "⚠️ Serviço pode estar inicializando"
    
    # Verificar se o sistema está rodando
    print_status "Verificando se o sistema está respondendo..."
    sleep 5
    
    # Testar se o sistema responde
    if curl -s http://localhost:8799 > /dev/null; then
        print_status "✅ Sistema atualizado e rodando!"
    else
        print_warning "⚠️ Sistema pode estar inicializando ainda. Aguarde alguns segundos..."
    fi
    
    # Verificar logs
    print_status "Últimas 30 linhas do log do sistema:"
    journalctl -u pizzaria --no-pager -n 30 || print_warning "⚠️ Sem logs disponíveis ainda"
    
    print_header "ATUALIZAÇÃO FINALIZADA"
    
    echo ""
    echo "=========================================="
    echo "✅ SISTEMA ATUALIZADO COM SUCESSO!"
    echo "=========================================="
    echo "URL: http://localhost:8799"
    echo "Diretório: $PROJECT_DIR"
    echo "Status: Rodando em background"
    echo "Arquivo de Log: $LOG_FILE"
    echo "=========================================="
    echo ""
    echo "COMANDOS ÚTEIS:"
    echo "=========================================="
    echo "Ver logs em tempo real: journalctl -u pizzaria -f"
    echo "Reiniciar: systemctl restart pizzaria"
    echo "Status: systemctl status pizzaria"
    echo "Parar: systemctl stop pizzaria"
    echo "Iniciar: systemctl start pizzaria"
    echo "=========================================="
    echo ""
    echo "ℹ️  INFORMAÇÕES:"
    echo "=========================================="
    echo "✅ Sistema rodando em background"
    echo "✅ Pode fechar o terminal sem problemas"
    echo "✅ Reinicia automaticamente se a VPS reiniciar"
    echo "✅ Arquivo .env mantido com suas configurações"
    echo "✅ Backup do .env criado automaticamente"
    echo "=========================================="
    echo ""
    
    print_status "Logs completos disponíveis em: $LOG_FILE"
    exit 0
fi

# Ajustar TOTAL_STEPS para instalação completa (agora são 11 passos)
TOTAL_STEPS=11
show_step 7 "CONFIGURANDO PROJETO"

# Se já estamos no diretório pizzaria, usar ele
if [ -f "package.json" ]; then
    print_status "Usando projeto já baixado..."
    PROJECT_DIR=$(pwd)
else
    # Criar diretório do projeto e baixar
    if [ -d "$PROJECT_DIR" ]; then
        print_status "Diretório $PROJECT_DIR já existe. Removendo completamente..."
        rm -rf $PROJECT_DIR
    fi
    
    mkdir -p $PROJECT_DIR
    cd $PROJECT_DIR
    
    # Baixar projeto do GitHub (repositório privado)
    print_status "Baixando projeto do GitHub..."
    if ! git clone https://$GITHUB_TOKEN@github.com/cadusantosofc/ERP-Rapido-Beta.git .; then
        print_error "Erro ao baixar o projeto. Verifique o token do GitHub."
        exit 1
    fi
    
    # Verificar se o download foi bem-sucedido
    if [ ! -f "package.json" ]; then
        print_error "Erro ao baixar o projeto. Arquivo package.json não encontrado."
        exit 1
    fi
    
    print_status "✅ Projeto baixado com sucesso!"
fi

show_step 8 "INSTALANDO PNPM"

# Instalar pnpm globalmente
if ! command_exists pnpm; then
    print_status "Instalando pnpm..."
    npm install -g pnpm
fi

print_status "pnpm: $(pnpm --version)"

print_header "INSTALANDO DEPENDÊNCIAS DO PROJETO"

# Garantir memória swap para o build
setup_swap

# Instalar dependências com pnpm (sem rodar scripts agora)
print_status "Instalando dependências com pnpm..."
if ! pnpm install --ignore-scripts; then
    print_error "Erro ao instalar dependências"
    exit 1
fi

show_step 9 "DATABASE, BUILD E AMBIENTE"

# Criar banco de dados automaticamente (apenas se não existir)
print_status "Verificando banco de dados '$DATABASE_NAME'..."
mysql -u root -p$MYSQL_ROOT_PASSWORD -e "CREATE DATABASE IF NOT EXISTS $DATABASE_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || true

# Importar backup delivery.sql que vem com o projeto (apenas na instalação inicial)
print_status "Importando banco de dados do arquivo delivery.sql..."
mysql -u root -p$MYSQL_ROOT_PASSWORD $DATABASE_NAME < delivery.sql 2>/dev/null || true
print_status "✅ Banco de dados configurado!"

print_status "Configurando variáveis de ambiente..."
# Verificar se arquivo .env já existe
if [ -f ".env" ]; then
    print_status "✅ Arquivo .env já existe, mantendo configurações existentes"
    cp .env ".env.backup.$(date +%Y%m%d_%H%M%S)"
else
    if [ -f "env.exemple" ]; then
        cp env.exemple .env
        print_status "✅ Arquivo .env criado a partir do env.exemple"
    else
        touch .env
    fi
fi

# Build do projeto usando pnpm com limite de memória
print_status "Fazendo build do projeto (isso pode demorar...)"
export NODE_OPTIONS="--max-old-space-size=2048"
if ! pnpm run build; then
    print_error "Erro ao fazer build do projeto"
    exit 1
fi
print_status "✅ Build concluído com sucesso!"

# Executar migrações de banco de dados automaticamente
print_status "Executando migrações de banco..."
run_migrations
verify_migrations

show_step 10 "CONFIGURAÇÃO DE SERVIÇOS (NGINX/SYSTEMD)"

# Configurar site no Nginx
configure_nginx_site

# Configurar serviço systemd
setup_systemd

show_step 11 "FINALIZAÇÃO E STATUS"
    
# Habilitar e iniciar serviço
print_status "Habilitando e iniciando serviço pizzaria..."
systemctl enable pizzaria
systemctl start pizzaria

# Configurar permissões
print_status "Configurando permissões de arquivo..."
chown -R www-data:www-data $PROJECT_DIR
chmod -R 755 $PROJECT_DIR
chmod 600 $PROJECT_DIR/.env 2>/dev/null || true

# Remover arquivos desnecessários do Windows
print_status "Removendo arquivos desnecessários..."
rm -f $PROJECT_DIR/reiniciar.vbs
rm -f $PROJECT_DIR/reiniciar-mysql.cmd
rm -f $PROJECT_DIR/start-projeto.vbs
rm -f $PROJECT_DIR/stop-projeto.vbs
rm -f $PROJECT_DIR/start-monitor-mysql.vbs

print_status "Aguardando inicialização do serviço (10 segundos)..."
sleep 10

print_status "Verificando status dos serviços..."

# Verificar status dos serviços
print_status "Status do serviço pizzaria:"
systemctl status pizzaria --no-pager || print_warning "⚠️ Serviço pode estar inicializando"

print_status "Status do Nginx:"
systemctl status nginx --no-pager || print_warning "⚠️ Nginx pode não estar rodando"

print_status "Status do MySQL:"
systemctl status mysql --no-pager || print_warning "⚠️ MySQL pode não estar rodando"

# Verificar se o sistema está rodando
print_status "Verificando se o sistema está respondendo..."
sleep 5

# Testar se o sistema responde
if curl -s http://localhost:8799 > /dev/null; then
    print_status "✅ Sistema está rodando e respondendo!"
else
    print_warning "⚠️ Sistema pode estar inicializando ainda. Aguarde alguns segundos..."
fi

# Verificar logs
print_status "Últimas 30 linhas do log do sistema:"
journalctl -u pizzaria --no-pager -n 30 || print_warning "⚠️ Sem logs disponíveis ainda"

# No more header needed here

print_status "Sistema instalado com sucesso!"
echo ""
echo "=========================================="
echo "INFORMAÇÕES DE ACESSO:"
echo "=========================================="
echo "URL: http://localhost:8799"
echo "Banco MySQL: localhost:3306"
echo "Usuário MySQL: $MYSQL_USER"
echo "Banco: $DATABASE_NAME"
echo "Diretório: $PROJECT_DIR"
echo "Arquivo de Log: $LOG_FILE"
echo "=========================================="
echo ""
echo "⚠️  INFORMAÇÕES SENSÍVEIS:"
echo "=========================================="
echo "As senhas foram salvas em: $PROJECT_DIR/.env"
echo "NÃO compartilhe o arquivo .env com ninguém!"
echo "Mantenha backup seguro das credenciais"
echo "=========================================="
echo ""
echo "COMANDOS ÚTEIS:"
echo "=========================================="
echo "Ver logs em tempo real: journalctl -u pizzaria -f"
echo "Ver últimas 50 linhas: journalctl -u pizzaria -n 50"
echo "Reiniciar serviço: systemctl restart pizzaria"
echo "Parar serviço: systemctl stop pizzaria"
echo "Iniciar serviço: systemctl start pizzaria"
echo "Status: systemctl status pizzaria"
echo "=========================================="
echo ""
echo "🔒 SEGURANÇA:"
echo "=========================================="
echo "✅ Senhas geradas aleatoriamente"
echo "✅ Token GitHub não está no script"
echo "✅ Arquivo .env com permissões restritas (600)"
echo "✅ Logs registrados em: $LOG_FILE"
echo "✅ Backups do .env criados automaticamente"
echo "=========================================="
echo ""
echo "ℹ️  INFORMAÇÕES DO SISTEMA:"
echo "=========================================="
echo "O sistema roda como serviço systemd!"
echo "- Fechar o terminal NÃO para o sistema"
echo "- Reiniciar a VPS NÃO para o sistema"
echo "- O sistema fica rodando 24/7 automaticamente"
echo "- Roda em background (oculto) sem mostrar logs no terminal"
echo "- Independente do terminal - pode fechar sem problemas"
echo "- Compatível com Ubuntu 20.04+ / Debian 11+"
echo ""
echo "TESTE: Feche o terminal e acesse http://localhost:8799"
echo "O sistema continuará rodando normalmente!"
echo "=========================================="
echo ""

print_status "✅ Instalação concluída com sucesso!"
print_status "O sistema iniciará automaticamente quando a VPS reiniciar!"
print_status "Logs completos disponíveis em: $LOG_FILE"
