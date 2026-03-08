@echo off
TITLE GSA Solucoes - Ultra Dev Mode
echo ==========================================
echo    INICIANDO GSA SOLUCOES (ULTRA DEV)
echo ==========================================

:: Verifica se a pasta node_modules existe, se nao, instala
if not exist "node_modules" (
    echo [FRONT] Instalando dependencias...
    call pnpm install
)

if not exist "backend\node_modules" (
    echo [BACK] Instalando dependencias...
    cd backend
    call pnpm install
    echo [DB] Gerando Prisma Client...
    call pnpm prisma generate
    cd ..
)

echo [SISTEMA] Iniciando Backend e Frontend em paralelo...

:: Inicia o Backend em uma nova janela
start cmd /k "TITLE GSA BACKEND && cd backend && pnpm dev"

:: Inicia o Frontend na janela atual
TITLE GSA FRONTEND
pnpm dev

pause
