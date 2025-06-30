@echo off
chcp 65001 >nul
echo 🚀 Configurando ChatFull - Sistema SaaS Multiempresa
echo ================================================

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado. Por favor, instale Node.js 18+ antes de continuar.
    pause
    exit /b 1
)

echo ✅ Node.js encontrado
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo Versão: %NODE_VERSION%

REM Instalar dependências
echo 📦 Instalando dependências...
npm install
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependências. Verifique sua conexão com a internet e tente novamente.
    pause
    exit /b 1
)

REM Criar arquivo .env se não existir
if not exist .env (
    echo 📄 Criando arquivo .env...
    copy .env.example .env >nul
    echo ⚠️  IMPORTANTE: Configure as variáveis do Supabase no arquivo .env
) else (
    echo ✅ Arquivo .env já existe
)

echo.
echo 🎉 Configuração inicial concluída!
echo.
echo 📋 Próximos passos:
echo 1. Configure as variáveis do Supabase no arquivo .env
echo 2. Execute o script SQL database/setup.sql no seu projeto Supabase
echo 3. Execute 'npm run dev' para iniciar o servidor de desenvolvimento
echo.
echo 📚 Consulte o README.md para instruções detalhadas
echo.
echo 🔗 Links úteis:
echo - Supabase Dashboard: https://app.supabase.com
echo - Documentação: README.md
echo.
pause 