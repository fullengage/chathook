# ChatFull - Sistema SaaS Multiempresa

Sistema completo de atendimento ao cliente multiempresa desenvolvido com React, TypeScript, Vite, Tailwind CSS e Supabase.

## 🚀 Características

- **Sistema Multiempresa**: Isolamento completo de dados por empresa
- **4 Papéis de Usuário**: Super Admin, Admin, Agente, Cliente
- **Autenticação Segura**: Supabase Auth com controle de sessão
- **Row Level Security**: Políticas RLS para proteção de dados
- **Interface Responsiva**: Design moderno com Tailwind CSS
- **Real-time**: Mensagens e notificações em tempo real
- **TypeScript**: Tipagem completa para maior segurança

## 🏗️ Arquitetura

### Backend
- **Supabase**: Backend as a Service
- **PostgreSQL**: Banco de dados principal
- **Row Level Security**: Proteção a nível de linha
- **Realtime**: Subscriptions para atualizações em tempo real
- **Storage**: Armazenamento de arquivos e anexos

### Frontend
- **React 18**: Biblioteca principal
- **TypeScript**: Tipagem estática
- **Vite**: Build tool moderno
- **Tailwind CSS**: Framework CSS utilitário
- **Context API**: Gerenciamento de estado
- **Hooks customizados**: Lógica de negócio reutilizável

## 📋 Funcionalidades por Papel

### Super Admin
- Gerenciar todas as empresas
- Visualizar métricas globais
- Administrar planos e preços
- Relatórios consolidados
- Configurações do sistema

### Admin (Empresa)
- Dashboard da empresa
- Gerenciar usuários (agentes e clientes)
- Visualizar todas as conversas da empresa
- Relatórios e métricas da empresa
- Configurações da conta
- Integrações (WhatsApp, email, etc.)

### Agente
- Caixa de entrada com conversas atribuídas
- Interface de chat em tempo real
- Notas internas
- Transferência de conversas
- Histórico do cliente
- Gerenciar próprio perfil

### Cliente
- Visualizar próprias conversas
- Abrir novos tickets
- Enviar mensagens e anexos
- Avaliar atendimento
- Atualizar dados pessoais

## 🗄️ Estrutura do Banco

### Principais Tabelas

1. **plans** - Planos disponíveis
2. **accounts** - Empresas/contas
3. **users** - Usuários do sistema
4. **conversations** - Conversas de atendimento
5. **messages** - Mensagens das conversas
6. **ratings** - Avaliações de atendimento

### Políticas RLS

- Isolamento por `account_id`
- Permissões baseadas em papéis
- Proteção de dados sensíveis
- Acesso controlado por função SQL

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd chatfull
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 4. Configure o banco de dados

Execute o script SQL do arquivo `database/schema.sql` no seu projeto Supabase:

1. Acesse o painel do Supabase
2. Vá para SQL Editor
3. Cole e execute o conteúdo de `database/schema.sql`

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:5173`

## 🔐 Configuração de Autenticação

### Criar usuários de teste

Para testar o sistema, crie usuários com diferentes papéis:

```sql
-- Super Admin
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  'superadmin@chatfull.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  '{"name": "Super Admin", "role": "superadmin"}'::jsonb
);

-- Admin de empresa
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  'admin@empresa.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  '{"name": "Admin Empresa", "role": "admin", "account_id": "1"}'::jsonb
);
```

### Dados de login

- **Super Admin**: `superadmin@chatfull.com` / `123456`
- **Admin**: `admin@empresa.com` / `123456`

## 📁 Estrutura do Projeto

```
src/
├── components/           # Componentes reutilizáveis
│   ├── ui/              # Componentes básicos de UI
│   ├── layout/          # Layouts e navegação
│   └── guards/          # Proteção de rotas
├── contexts/            # Context providers
├── hooks/               # Hooks customizados
├── pages/               # Páginas da aplicação
│   ├── auth/           # Páginas de autenticação
│   ├── superadmin/     # Páginas do super admin
│   ├── admin/          # Páginas do admin
│   ├── agent/          # Páginas do agente
│   └── client/         # Páginas do cliente
├── services/           # Serviços de API
├── types/              # Tipos TypeScript
├── utils/              # Utilitários
└── lib/                # Configurações de bibliotecas
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Visualizar build
npm run preview

# Linting
npm run lint

# Formatação
npm run format

# Type checking
npm run type-check
```

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório no Vercel
2. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy automático a cada push

### Netlify

1. Conecte seu repositório no Netlify
2. Configure o build command: `npm run build`
3. Configure o publish directory: `dist`
4. Adicione as variáveis de ambiente

## 🔄 Fluxo de Desenvolvimento

### Para adicionar nova funcionalidade:

1. Crie a branch: `git checkout -b feature/nova-funcionalidade`
2. Implemente a funcionalidade
3. Teste thoroughly
4. Commit: `git commit -m "feat: adicionar nova funcionalidade"`
5. Push: `git push origin feature/nova-funcionalidade`
6. Abra Pull Request

### Para corrigir bug:

1. Crie a branch: `git checkout -b fix/nome-do-bug`
2. Corrija o problema
3. Teste a correção
4. Commit: `git commit -m "fix: corrigir problema X"`
5. Push e PR

## 📚 Documentação Adicional

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 🤝 Contribuição

1. Faça fork do projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

Para suporte, entre em contato:
- Email: suporte@chatfull.com
- GitHub Issues: [Abrir issue](../../issues)

---

**ChatFull** - Plataforma completa de atendimento ao cliente 🚀 