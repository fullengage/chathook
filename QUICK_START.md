# 🚀 Guia de Início Rápido - ChatFull

Coloque o sistema funcionando em **10 minutos** seguindo este guia.

## ⚡ Instalação Rápida

### 1. Clone e Configure (2 min)

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd chatfull

# Execute o script de setup
# Linux/Mac:
chmod +x setup.sh && ./setup.sh

# Windows:
setup.bat
```

### 2. Configure Supabase (3 min)

1. **Crie conta no Supabase**: https://app.supabase.com
2. **Crie novo projeto**
3. **Copie as credenciais**:
   - Vá em Settings > API
   - Copie `URL` e `anon public key`

### 3. Configure Variáveis (1 min)

Edite o arquivo `.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 4. Configure Banco de Dados (3 min)

**OPÇÃO A - Script Completo** (recomendado se não houver erros):
1. No painel do Supabase, vá para SQL Editor
2. Cole todo o conteúdo de `database/setup.sql`
3. Execute o script

**OPÇÃO B - Passo a Passo** (se houver erros de permissão):
1. No painel do Supabase, vá para SQL Editor
2. Abra o arquivo `database/step-by-step.sql`
3. Execute cada "PASSO" separadamente na ordem:
   - PASSO 1: Criar tabelas principais
   - PASSO 2: Criar índices
   - PASSO 3: Criar funções
   - PASSO 4: Criar triggers
   - PASSO 5: Habilitar RLS e criar políticas
   - PASSO 6: Inserir dados iniciais

### 5. Criar Usuário de Teste (1 min)

No SQL Editor do Supabase, execute:

```sql
-- Criar usuário Admin de teste
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'admin@test.com',
    crypt('123456', gen_salt('bf')),
    NOW(),
    '{"name": "Admin Teste", "role": "admin", "account_id": "1"}'::jsonb,
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);
```

### 6. Inicie o Sistema (1 min)

```bash
npm run dev
```

**Acesse**: http://localhost:5173

## 🔑 Dados de Login

Use estas credenciais para testar:

- **Email**: `admin@test.com`
- **Senha**: `123456`

## ✅ Verificação Rápida

Após login, você deve ver:

1. ✅ **Dashboard do Admin** carregado
2. ✅ **Sidebar** com navegação
3. ✅ **Métricas** sendo exibidas
4. ✅ **Nome do usuário** no perfil

## 🚨 Solução de Problemas Comuns

### ❌ Erro: "permission denied to set parameter"
**Solução**: Use o arquivo `database/step-by-step.sql` e execute cada passo separadamente.

### ❌ Erro: "relation already exists"
**Solução**: As tabelas já existem. Pule para os próximos passos ou delete as tabelas primeiro.

### ❌ Erro de conexão com Supabase
- ✅ Verifique se as variáveis `.env` estão corretas
- ✅ Confirme se o projeto Supabase está ativo
- ✅ Teste a conexão no painel do Supabase

### ❌ Erro de login "User not found"
**Solução**: Execute o SQL para criar o usuário de teste:

```sql
-- Se o usuário não foi criado automaticamente, force a criação:
INSERT INTO public.users (auth_user_id, name, email, role, account_id)
SELECT 
    au.id,
    'Admin Teste',
    'admin@test.com',
    'admin',
    1
FROM auth.users au 
WHERE au.email = 'admin@test.com'
AND NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.auth_user_id = au.id
);
```

### ❌ Página em branco após login
- ✅ Abra Developer Tools (F12) e verifique erros no Console
- ✅ Verifique se o trigger `handle_new_user` foi criado
- ✅ Confirme se o usuário tem `account_id` configurado

## 🎯 Criar Mais Usuários para Teste

```sql
-- Super Admin
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, 
    email_confirmed_at, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
    gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
    'superadmin@test.com', crypt('123456', gen_salt('bf')),
    NOW(), '{"name": "Super Admin", "role": "superadmin"}'::jsonb,
    NOW(), NOW(), '', '', '', ''
);

-- Agente
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
    gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
    'agent@test.com', crypt('123456', gen_salt('bf')),
    NOW(), '{"name": "Agente Teste", "role": "agent", "account_id": "1"}'::jsonb,
    NOW(), NOW(), '', '', '', ''
);

-- Cliente
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
    gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
    'client@test.com', crypt('123456', gen_salt('bf')),
    NOW(), '{"name": "Cliente Teste", "role": "client", "account_id": "1"}'::jsonb,
    NOW(), NOW(), '', '', '', ''
);
```

### Testar Diferentes Papéis

1. **Super Admin**: `superadmin@test.com` / `123456`
   - Dashboard global do sistema
   - Métricas de todas as empresas

2. **Admin**: `admin@test.com` / `123456`
   - Dashboard da empresa
   - Gerenciamento de usuários

3. **Agente**: `agent@test.com` / `123456`
   - Inbox de conversas
   - Interface simplificada

4. **Cliente**: `client@test.com` / `123456`
   - Área do cliente
   - Próprias conversas

## 🔧 Debug Avançado

### Verificar se RLS está funcionando

```sql
-- Verificar tabelas com RLS habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### Verificar usuários criados

```sql
-- Ver usuários na tabela auth
SELECT email, raw_user_meta_data FROM auth.users;

-- Ver usuários na tabela public
SELECT name, email, role, account_id FROM public.users;
```

### Verificar funções

```sql
-- Testar função de papel do usuário
SELECT public.get_user_role(auth.uid());

-- Testar função de account_id
SELECT public.get_user_account_id(auth.uid());
```

## 🎉 Parabéns!

Você tem agora um **sistema SaaS multiempresa completo** funcionando!

### O que você tem:
- ✅ 4 tipos de usuário com permissões específicas
- ✅ Isolamento completo de dados por empresa
- ✅ Autenticação segura
- ✅ Interface responsiva e moderna
- ✅ Sistema preparado para escalar

### Próximas features recomendadas:
1. Sistema de mensagens completo
2. Upload de arquivos
3. Relatórios avançados
4. Integrações (WhatsApp, Email)
5. Notificações em tempo real

## 📞 Ainda com Problemas?

1. **Verifique** o arquivo `CHECKLIST.md`
2. **Consulte** o `README.md` para detalhes
3. **Revise** os logs no console do navegador
4. **Execute** os comandos de debug acima
5. **Confirme** se seguiu todos os passos na ordem

---

**🚀 Seu MVP está pronto! Agora é só evoluir conforme sua necessidade.** 