#!/bin/bash

echo "🚀 Configurando ChatFull - Sistema SaaS Multiempresa"
echo "================================================"

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js 18+ antes de continuar."
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node --version | sed 's/v//')
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js versão $NODE_VERSION encontrada. Versão 18+ é necessária."
    exit 1
fi

echo "✅ Node.js versão $NODE_VERSION detectado"

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências. Verifique sua conexão com a internet e tente novamente."
    exit 1
fi

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "📄 Criando arquivo .env..."
    cp .env.example .env
    echo "⚠️  IMPORTANTE: Configure as variáveis do Supabase no arquivo .env"
else
    echo "✅ Arquivo .env já existe"
fi

echo ""
echo "🎉 Configuração inicial concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure as variáveis do Supabase no arquivo .env"
echo "2. Execute o script SQL database/setup.sql no seu projeto Supabase"
echo "3. Execute 'npm run dev' para iniciar o servidor de desenvolvimento"
echo ""
echo "📚 Consulte o README.md para instruções detalhadas"
echo ""
echo "🔗 Links úteis:"
echo "- Supabase Dashboard: https://app.supabase.com"
echo "- Documentação: README.md"
echo "" 