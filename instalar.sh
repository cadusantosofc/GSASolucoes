#!/bin/bash

# ========================================
# INSTALADOR AUTOMÁTICO - SISTEMA GSA SOLUÇÕES
# COMPATÍVEL COM UBUNTU 22.04+ / DEBIAN 11+
# ========================================

set -e

# Arquivo de log
LOG_FILE="/var/log/gsa-install.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Token GitHub (Privado) e Link do Repositório
GITHUB_TOKEN="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"
REPO_URL="github.com/cadusantosofc/GSASolucoes.git"

# Diretório de Instalação (Conforme solicitado)
PROJECT_DIR="/home/deploy/buscas"

# Funções de Status
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

show_step() {
    print_header "🚀 PASSO $1/$TOTAL_STEPS: $2"
    echo ""
}

# Funções Utilitárias
setup_swap() {
    print_status "Verificando Swap..."
    if [ $(free -m | awk '/^Swap:/{print $2}') -lt 2048 ]; then
        print_status "Criando arquivo swap de 2GB..."
        swapoff /swapfile 2>/dev/null || true
        rm -f /swapfile
        fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
        chmod 600 /swapfile
        mkswap /swapfile
        swapon /swapfile
        grep -q "/swapfile" /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
    fi
}

install_nodejs() {
    print_status "Instalando Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    npm install -g pnpm
}

# DATABASE CONFIGURATION
install_postgresql() {
    print_status "Instalando e Configurando PostgreSQL..."
    apt install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql

    # Configuração de usuário e banco dedicado
    sudo -u postgres psql -c "CREATE USER whazing WITH PASSWORD 'rpYZtq1S3oq4s8Zj';" 2>/dev/null || true
    sudo -u postgres psql -c "ALTER USER whazing WITH PASSWORD 'rpYZtq1S3oq4s8Zj';"
    sudo -u postgres psql -c "ALTER USER whazing WITH SUPERUSER;"
    
    sudo -u postgres psql -c "CREATE DATABASE consultas_buscas OWNER whazing;" 2>/dev/null || true
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE consultas_buscas TO whazing;"
}

install_redis() {
    print_status "Instalando e Configurando Redis na porta 6383..."
    apt install -y redis-server
    sed -i 's/port 6379/port 6383/' /etc/redis/redis.conf
    # Se houver senha configurada
    if [ ! -z "rpYZtq1S3oq4s8Zj" ]; then
        sed -i 's/# requirepass foobared/requirepass rpYZtq1S3oq4s8Zj/' /etc/redis/redis.conf
    fi
    systemctl restart redis-server
}

# ----------------------------------------
# FUNÇÕES DE EXECUÇÃO
# ----------------------------------------

executar_instalar() {
    TOTAL_STEPS=10
    show_step 1 "PREPARAÇÃO"
    apt update && apt upgrade -y
    apt install -y curl git build-essential openssl
    mkdir -p "$PROJECT_DIR"
    setup_swap

    show_step 2 "FERRAMENTAS"
    install_nodejs
    install_postgresql
    install_redis

    show_step 3 "DOWNLOAD DO REPOSITÓRIO"
    if [ -d "$PROJECT_DIR/.git" ]; then
        print_status "Diretório já é um repositório git, atualizando..."
        cd "$PROJECT_DIR"
        git reset --hard
        git pull https://$GITHUB_TOKEN@$REPO_URL
    else
        print_status "Clonando repositório para $PROJECT_DIR..."
        cd /
        rm -rf "$PROJECT_DIR"
        git clone https://$GITHUB_TOKEN@$REPO_URL "$PROJECT_DIR"
        cd "$PROJECT_DIR"
    fi

    show_step 4 "CONFIGURAÇÃO BACKEND"
    cd "$PROJECT_DIR/backend"
    print_status "Criando .env do Backend..."
    cat > .env << EOF
DATABASE_URL="postgresql://whazing:rpYZtq1S3oq4s8Zj@localhost:5432/consultas_buscas?schema=public"
JWT_SECRET="dFVtQhh+x+UTFMfCCZuIkAbgdy4uFGT5koU7jyM2Obg="
JWT_EXPIRES_IN="15d"
PORT=3001
NODE_ENV=production
REDIS_URL="redis://:rpYZtq1S3oq4s8Zj@localhost:6383/2"
BACKEND_URL="https://api.gsacreditus.com.br"
FRONTEND_URL="https://app.gsacreditus.com.br"
EOF
    pnpm install

    show_step 5 "DATABASE"
    npx prisma generate
    npx prisma db push --accept-data-loss
    npx prisma db seed

    show_step 6 "BUILD BACKEND"
    pnpm run build

    show_step 7 "FRONTEND"
    cd "$PROJECT_DIR"
    print_status "Configurando .env do Frontend..."
    cat > .env << EOF
VITE_API_URL="https://api.gsacreditus.com.br/api"
EOF
    pnpm install
    pnpm run build

    show_step 8 "SERVIÇO FRONTEND (VITE PREVIEW)"
    cat > /etc/systemd/system/gsa-front.service << EOF
[Unit]
Description=GSA Solucoes Frontend
After=network.target
[Service]
Type=simple
User=www-data
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/pnpm preview --port 8080 --host
Restart=always
[Install]
WantedBy=multi-user.target
EOF
    systemctl daemon-reload
    systemctl enable gsa-front
    systemctl start gsa-front

    print_status "Configuração para Cloudflare Tunnel:"
    echo "----------------------------------------"
    echo "Aponte seu túnel do Cloudflare para:"
    echo "Frontend: http://localhost:8080"
    echo "Backend:  http://localhost:3001"
    echo "----------------------------------------"
    sleep 5

    show_step 9 "SERVIÇO SYSTEMD BACKEND"
    cat > /etc/systemd/system/gsa.service << EOF
[Unit]
Description=GSA Solucoes Backend
After=network.target postgresql.service
[Service]
Type=simple
User=www-data
WorkingDirectory=$PROJECT_DIR/backend
ExecStart=/usr/bin/pnpm start
Restart=always
Environment=NODE_ENV=production
[Install]
WantedBy=multi-user.target
EOF
    systemctl daemon-reload
    systemctl enable gsa
    systemctl start gsa

    show_step 10 "FINALIZAÇÃO"
    chown -R www-data:www-data "$PROJECT_DIR"
    systemctl restart gsa
    systemctl restart gsa-front

    print_header "INSTALAÇÃO CONCLUÍDA!"
    echo "Localização: $PROJECT_DIR"
    echo "Backend: systemctl status gsa"
    echo "Frontend: systemctl status gsa-front"
    echo "✅ Pronto!"
}

executar_atualizar() {
    print_header "🔄 ATUALIZANDO SISTEMA..."
    cd "$PROJECT_DIR"
    
    print_status "Baixando atualizações do Git..."
    git reset --hard
    git pull https://$GITHUB_TOKEN@$REPO_URL
    
    print_status "Atualizando dependências e build do Backend..."
    cd "$PROJECT_DIR/backend"
    
    # Garantir que o .env esteja correto
    cat > .env << EOF
DATABASE_URL="postgresql://whazing:rpYZtq1S3oq4s8Zj@localhost:5432/consultas_buscas?schema=public"
JWT_SECRET="dFVtQhh+x+UTFMfCCZuIkAbgdy4uFGT5koU7jyM2Obg="
JWT_EXPIRES_IN="15d"
PORT=3001
NODE_ENV=production
REDIS_URL="redis://:rpYZtq1S3oq4s8Zj@localhost:6383/2"
BACKEND_URL="https://api.gsacreditus.com.br"
FRONTEND_URL="https://app.gsacreditus.com.br"
EOF

    pnpm install
    npx prisma generate
    npx prisma db push --accept-data-loss
    npx prisma db seed
    pnpm run build
    
    print_status "Atualizando dependências e build do Frontend..."
    cd "$PROJECT_DIR"
    
    # Atualizar .env do Frontend
    cat > .env << EOF
VITE_API_URL="https://api.gsacreditus.com.br/api"
EOF

    pnpm install
    pnpm run build
    
    print_status "Reiniciando serviços..."
    systemctl daemon-reload
    systemctl restart gsa
    systemctl restart gsa-front
    
    print_header "✅ ATUALIZAÇÃO CONCLUÍDA COM SUCESSO!"
}

# ----------------------------------------
# EXECUÇÃO PRINCIPAL (MENU)
# ----------------------------------------

if [ "$EUID" -ne 0 ]; then
    print_error "Execute como root (sudo su)"
    exit 1
fi

clear
print_header "SISTEMA GSA SOLUÇÕES - CONSULTAS"
echo -e "Escolha uma opção:"
echo -e "${GREEN}1)${NC} Instalar do Zero (Ubuntu 24)"
echo -e "${GREEN}2)${NC} Atualizar Sistema Existente"
echo -e "${RED}0)${NC} Sair"
echo ""
read -p "Opção: " OPTION

case $OPTION in
    1) executar_instalar ;;
    2) executar_atualizar ;;
    0) exit 0 ;;
    *) print_error "Opção Inválida"; exit 1 ;;
esac
