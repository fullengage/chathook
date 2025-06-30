-- =========================================
-- PASSO 1: CRIAR TABELAS PRINCIPAIS
-- Execute este bloco primeiro
-- =========================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PLANOS
CREATE TABLE public.plans (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    max_users INTEGER NOT NULL DEFAULT 5,
    max_conversations INTEGER NOT NULL DEFAULT 100,
    features JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. CONTAS/EMPRESAS
CREATE TABLE public.accounts (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    plan_id BIGINT REFERENCES public.plans(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    billing_status TEXT NOT NULL DEFAULT 'active' CHECK (billing_status IN ('active', 'suspended', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. USUÁRIOS
CREATE TABLE public.users (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id BIGINT REFERENCES public.accounts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('superadmin', 'admin', 'agent', 'client')),
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CONVERSAS
CREATE TABLE public.conversations (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    account_id BIGINT REFERENCES public.accounts(id) ON DELETE CASCADE,
    client_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    agent_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'pending', 'resolved', 'closed')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    channel TEXT NOT NULL DEFAULT 'chat' CHECK (channel IN ('whatsapp', 'email', 'chat', 'phone')),
    tags TEXT[] DEFAULT '{}',
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. MENSAGENS
CREATE TABLE public.messages (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    conversation_id BIGINT REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('agent', 'client', 'system')),
    content TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'audio')),
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    is_internal BOOLEAN NOT NULL DEFAULT false,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. AVALIAÇÕES
CREATE TABLE public.ratings (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    conversation_id BIGINT REFERENCES public.conversations(id) ON DELETE CASCADE,
    client_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    agent_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================
-- PASSO 2: CRIAR ÍNDICES
-- Execute este bloco após as tabelas
-- =========================================

CREATE INDEX idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX idx_users_account_id ON public.users(account_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_conversations_account_id ON public.conversations(account_id);
CREATE INDEX idx_conversations_client_id ON public.conversations(client_id);
CREATE INDEX idx_conversations_agent_id ON public.conversations(agent_id);
CREATE INDEX idx_conversations_status ON public.conversations(status);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

-- =========================================
-- PASSO 3: CRIAR FUNÇÕES
-- Execute este bloco após os índices
-- =========================================

-- Função para obter o papel do usuário
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role
        FROM public.users
        WHERE auth_user_id = user_id
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter o account_id do usuário
CREATE OR REPLACE FUNCTION public.get_user_account_id(user_id UUID)
RETURNS BIGINT AS $$
BEGIN
    RETURN (
        SELECT account_id
        FROM public.users
        WHERE auth_user_id = user_id
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- PASSO 4: CRIAR TRIGGERS
-- Execute este bloco após as funções
-- =========================================

-- Trigger para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (auth_user_id, name, email, role, account_id)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
        (NEW.raw_user_meta_data->>'account_id')::BIGINT
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

DROP TRIGGER IF EXISTS update_accounts_updated_at ON public.accounts;
CREATE TRIGGER update_accounts_updated_at
    BEFORE UPDATE ON public.accounts
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- =========================================
-- PASSO 5: HABILITAR RLS E CRIAR POLÍTICAS
-- Execute este bloco após os triggers
-- =========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA PLANS
CREATE POLICY "Superadmins podem ver todos os planos"
    ON public.plans FOR SELECT
    USING (public.get_user_role(auth.uid()) = 'superadmin');

-- POLÍTICAS PARA ACCOUNTS
CREATE POLICY "Superadmins podem ver todas as contas"
    ON public.accounts FOR SELECT
    USING (public.get_user_role(auth.uid()) = 'superadmin');

CREATE POLICY "Admins podem ver própria conta"
    ON public.accounts FOR SELECT
    USING (
        public.get_user_role(auth.uid()) IN ('admin', 'agent', 'client') AND
        id = public.get_user_account_id(auth.uid())
    );

-- POLÍTICAS PARA USERS
CREATE POLICY "Usuários podem ver próprio perfil"
    ON public.users FOR SELECT
    USING (auth_user_id = auth.uid());

CREATE POLICY "Superadmins podem ver todos os usuários"
    ON public.users FOR SELECT
    USING (public.get_user_role(auth.uid()) = 'superadmin');

CREATE POLICY "Admins podem ver usuários da sua conta"
    ON public.users FOR SELECT
    USING (
        public.get_user_role(auth.uid()) = 'admin' AND
        account_id = public.get_user_account_id(auth.uid())
    );

CREATE POLICY "Usuários podem atualizar próprio perfil"
    ON public.users FOR UPDATE
    USING (auth_user_id = auth.uid());

-- POLÍTICAS PARA CONVERSATIONS
CREATE POLICY "Clientes veem próprias conversas"
    ON public.conversations FOR SELECT
    USING (
        public.get_user_role(auth.uid()) = 'client' AND
        client_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

CREATE POLICY "Agentes veem conversas da conta"
    ON public.conversations FOR SELECT
    USING (
        public.get_user_role(auth.uid()) = 'agent' AND
        account_id = public.get_user_account_id(auth.uid())
    );

CREATE POLICY "Admins veem todas as conversas da conta"
    ON public.conversations FOR SELECT
    USING (
        public.get_user_role(auth.uid()) = 'admin' AND
        account_id = public.get_user_account_id(auth.uid())
    );

CREATE POLICY "Superadmins veem todas as conversas"
    ON public.conversations FOR SELECT
    USING (public.get_user_role(auth.uid()) = 'superadmin');

-- POLÍTICAS PARA MESSAGES
CREATE POLICY "Usuários veem mensagens de suas conversas"
    ON public.messages FOR SELECT
    USING (
        conversation_id IN (
            SELECT id FROM public.conversations
            WHERE (
                (public.get_user_role(auth.uid()) = 'client' AND 
                 client_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())) OR
                (public.get_user_role(auth.uid()) IN ('admin', 'agent') AND 
                 account_id = public.get_user_account_id(auth.uid()))
            )
        ) AND
        (is_internal = false OR public.get_user_role(auth.uid()) IN ('admin', 'agent', 'superadmin'))
    );

-- =========================================
-- PASSO 6: INSERIR DADOS INICIAIS
-- Execute este bloco por último
-- =========================================

-- Inserir planos básicos
INSERT INTO public.plans (name, price, max_users, max_conversations, features) VALUES
('Básico', 29.90, 3, 100, '{"chat": true, "email": false, "whatsapp": false}'),
('Profissional', 89.90, 10, 500, '{"chat": true, "email": true, "whatsapp": false}'),
('Empresarial', 199.90, 50, 2000, '{"chat": true, "email": true, "whatsapp": true}'),
('Premium', 499.90, 100, 10000, '{"chat": true, "email": true, "whatsapp": true, "api": true}');

-- Inserir conta de demonstração
INSERT INTO public.accounts (name, email, plan_id) VALUES
('Empresa Demo', 'demo@chatfull.com', 1); 