#!/bin/bash

# ========================================
# INSTALADOR AUTOMÁTICO - SISTEMA GSA Créditus
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
PROJECT_DIR="/home/deploy/gsasolucoes"

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
    clear
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

install_postgresql() {
    print_status "Instalando PostgreSQL..."
    apt install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
    
    sudo -u postgres psql -c "CREATE USER consulta WITH PASSWORD 'consulta';" 2>/dev/null || true
    sudo -u postgres psql -c "ALTER USER consulta WITH PASSWORD 'consulta';"
    sudo -u postgres psql -c "CREATE DATABASE consulta OWNER consulta;" 2>/dev/null || true
}

# ----------------------------------------
# EXECUÇÃO PRINCIPAL
# ----------------------------------------

if [ "$EUID" -ne 0 ]; then
    print_error "Execute como root (sudo su)"
    exit 1
fi

TOTAL_STEPS=10

show_step 1 "PREPARAÇÃO"
apt update && apt upgrade -y
apt install -y curl git build-essential openssl nginx redis-server
mkdir -p "$PROJECT_DIR"
setup_swap

show_step 2 "FERRAMENTAS"
install_nodejs
install_postgresql

show_step 3 "DOWNLOAD DO REPOSITÓRIO"
if [ -d "$PROJECT_DIR/.git" ]; then
    print_status "Diretório já é um repositório git, atualizando..."
    cd "$PROJECT_DIR"
    git reset --hard
    git pull https://$GITHUB_TOKEN@$REPO_URL
else
    print_status "Clonando repositório para $PROJECT_DIR..."
    rm -rf "$PROJECT_DIR"
    git clone https://$GITHUB_TOKEN@$REPO_URL "$PROJECT_DIR"
    cd "$PROJECT_DIR"
fi

show_step 4 "CONFIGURAÇÃO BACKEND"
cd "$PROJECT_DIR/backend"
print_status "Criando .env do Backend..."
cat > .env << EOF
DATABASE_URL="postgresql://consulta:consulta@localhost:5432/consulta?schema=public"
JWT_SECRET="$(openssl rand -base64 32)"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=production
EOF
pnpm install

show_step 5 "DATABASE"
npx prisma generate
npx prisma migrate deploy

show_step 6 "BUILD BACKEND"
pnpm run build

show_step 7 "FRONTEND"
cd "$PROJECT_DIR"
pnpm install
pnpm run build

show_step 8 "NGINX"
cat > /etc/nginx/sites-available/gsa << EOF
server {
    listen 80;
    server_name _;
    root $PROJECT_DIR/dist;
    index index.html;
    location / { try_files \$uri \$uri/ /index.html; }
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF
ln -sf /etc/nginx/sites-available/gsa /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

show_step 9 "SERVIÇO SYSTEMD"
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

show_step 10 "FINALIZAÇÃO"
chown -R www-data:www-data "$PROJECT_DIR"
systemctl restart gsa

print_header "INSTALAÇÃO CONCLUÍDA!"
echo "Localização: $PROJECT_DIR"
echo "Backend: systemctl status gsa"
echo "Logs: journalctl -u gsa -f"
echo "✅ Pronto!"
