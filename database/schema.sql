-- =========================================
-- SCHEMA COMPLETO - SISTEMA SAAS MULTIEMPRESA
-- =========================================

-- Habilitar RLS e extensões necessárias
alter database postgres set "app.jwt_secret" to 'your-jwt-secret';
create extension if not exists "uuid-ossp";

-- =========================================
-- TABELAS PRINCIPAIS
-- =========================================

-- 1. PLANOS
create table public.plans (
    id bigint primary key generated always as identity,
    name text not null,
    price decimal(10,2) not null default 0,
    max_users integer not null default 5,
    max_conversations integer not null default 100,
    features jsonb not null default '{}',
    is_active boolean not null default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. CONTAS/EMPRESAS
create table public.accounts (
    id bigint primary key generated always as identity,
    name text not null,
    email text unique not null,
    plan_id bigint references public.plans(id),
    is_active boolean not null default true,
    billing_status text not null default 'active' check (billing_status in ('active', 'suspended', 'cancelled')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. USUÁRIOS
create table public.users (
    id bigint primary key generated always as identity,
    auth_user_id uuid references auth.users(id) on delete cascade,
    account_id bigint references public.accounts(id) on delete cascade,
    name text not null,
    email text unique not null,
    role text not null check (role in ('superadmin', 'admin', 'agent', 'client')),
    avatar_url text,
    is_active boolean not null default true,
    last_login timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. CONVERSAS
create table public.conversations (
    id bigint primary key generated always as identity,
    account_id bigint references public.accounts(id) on delete cascade,
    client_id bigint references public.users(id) on delete cascade,
    agent_id bigint references public.users(id) on delete set null,
    subject text not null,
    status text not null default 'open' check (status in ('open', 'pending', 'resolved', 'closed')),
    priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
    channel text not null default 'chat' check (channel in ('whatsapp', 'email', 'chat', 'phone')),
    tags text[] default '{}',
    last_message_at timestamp with time zone default timezone('utc'::text, now()),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. MENSAGENS
create table public.messages (
    id bigint primary key generated always as identity,
    conversation_id bigint references public.conversations(id) on delete cascade,
    sender_id bigint references public.users(id) on delete cascade,
    sender_type text not null check (sender_type in ('agent', 'client', 'system')),
    content text not null,
    message_type text not null default 'text' check (message_type in ('text', 'image', 'file', 'audio')),
    file_url text,
    file_name text,
    file_size integer,
    is_internal boolean not null default false,
    is_read boolean not null default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. AVALIAÇÕES
create table public.ratings (
    id bigint primary key generated always as identity,
    conversation_id bigint references public.conversations(id) on delete cascade,
    client_id bigint references public.users(id) on delete cascade,
    agent_id bigint references public.users(id) on delete cascade,
    rating integer not null check (rating >= 1 and rating <= 5),
    comment text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =========================================
-- ÍNDICES PARA PERFORMANCE
-- =========================================

create index idx_users_auth_user_id on public.users(auth_user_id);
create index idx_users_account_id on public.users(account_id);
create index idx_users_email on public.users(email);
create index idx_conversations_account_id on public.conversations(account_id);
create index idx_conversations_client_id on public.conversations(client_id);
create index idx_conversations_agent_id on public.conversations(agent_id);
create index idx_conversations_status on public.conversations(status);
create index idx_messages_conversation_id on public.messages(conversation_id);
create index idx_messages_sender_id on public.messages(sender_id);
create index idx_messages_created_at on public.messages(created_at);

-- =========================================
-- FUNÇÕES AUXILIARES
-- =========================================

-- Função para obter o papel do usuário
create or replace function public.get_user_role(user_id uuid)
returns text as $$
begin
    return (
        select role
        from public.users
        where auth_user_id = user_id
        limit 1
    );
end;
$$ language plpgsql security definer;

-- Função para obter o account_id do usuário
create or replace function public.get_user_account_id(user_id uuid)
returns bigint as $$
begin
    return (
        select account_id
        from public.users
        where auth_user_id = user_id
        limit 1
    );
end;
$$ language plpgsql security definer;

-- Função para verificar se é da mesma conta
create or replace function public.is_same_account(target_account_id bigint)
returns boolean as $$
begin
    return target_account_id = public.get_user_account_id(auth.uid());
end;
$$ language plpgsql security definer;

-- =========================================
-- TRIGGERS
-- =========================================

-- Trigger para criar perfil automaticamente após signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.users (auth_user_id, name, email, role, account_id)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        new.email,
        coalesce(new.raw_user_meta_data->>'role', 'client'),
        (new.raw_user_meta_data->>'account_id')::bigint
    );
    return new;
end;
$$ language plpgsql security definer;

-- Trigger para atualizar last_message_at em conversas
create or replace function public.update_conversation_last_message()
returns trigger as $$
begin
    update public.conversations
    set last_message_at = new.created_at,
        updated_at = timezone('utc'::text, now())
    where id = new.conversation_id;
    return new;
end;
$$ language plpgsql security definer;

-- Trigger para atualizar updated_at
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Aplicar triggers
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

drop trigger if exists on_message_created on public.messages;
create trigger on_message_created
    after insert on public.messages
    for each row execute procedure public.update_conversation_last_message();

-- Triggers de updated_at
drop trigger if exists update_accounts_updated_at on public.accounts;
create trigger update_accounts_updated_at
    before update on public.accounts
    for each row execute procedure public.update_updated_at_column();

drop trigger if exists update_users_updated_at on public.users;
create trigger update_users_updated_at
    before update on public.users
    for each row execute procedure public.update_updated_at_column();

drop trigger if exists update_conversations_updated_at on public.conversations;
create trigger update_conversations_updated_at
    before update on public.conversations
    for each row execute procedure public.update_updated_at_column();

-- =========================================
-- ROW LEVEL SECURITY (RLS)
-- =========================================

-- Habilitar RLS em todas as tabelas
alter table public.plans enable row level security;
alter table public.accounts enable row level security;
alter table public.users enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.ratings enable row level security;

-- POLÍTICAS PARA PLANS
create policy "Superadmins podem ver todos os planos"
    on public.plans for select
    using (public.get_user_role(auth.uid()) = 'superadmin');

create policy "Superadmins podem gerenciar planos"
    on public.plans for all
    using (public.get_user_role(auth.uid()) = 'superadmin');

-- POLÍTICAS PARA ACCOUNTS
create policy "Superadmins podem ver todas as contas"
    on public.accounts for select
    using (public.get_user_role(auth.uid()) = 'superadmin');

create policy "Admins podem ver própria conta"
    on public.accounts for select
    using (
        public.get_user_role(auth.uid()) in ('admin', 'agent', 'client') and
        id = public.get_user_account_id(auth.uid())
    );

create policy "Superadmins podem gerenciar contas"
    on public.accounts for all
    using (public.get_user_role(auth.uid()) = 'superadmin');

-- POLÍTICAS PARA USERS
create policy "Usuários podem ver próprio perfil"
    on public.users for select
    using (auth_user_id = auth.uid());

create policy "Superadmins podem ver todos os usuários"
    on public.users for select
    using (public.get_user_role(auth.uid()) = 'superadmin');

create policy "Admins podem ver usuários da sua conta"
    on public.users for select
    using (
        public.get_user_role(auth.uid()) = 'admin' and
        account_id = public.get_user_account_id(auth.uid())
    );

create policy "Agentes podem ver outros usuários da conta"
    on public.users for select
    using (
        public.get_user_role(auth.uid()) = 'agent' and
        account_id = public.get_user_account_id(auth.uid())
    );

create policy "Usuários podem atualizar próprio perfil"
    on public.users for update
    using (auth_user_id = auth.uid());

create policy "Superadmins podem gerenciar usuários"
    on public.users for all
    using (public.get_user_role(auth.uid()) = 'superadmin');

create policy "Admins podem gerenciar usuários da conta"
    on public.users for all
    using (
        public.get_user_role(auth.uid()) = 'admin' and
        account_id = public.get_user_account_id(auth.uid())
    );

-- POLÍTICAS PARA CONVERSATIONS
create policy "Clientes veem próprias conversas"
    on public.conversations for select
    using (
        public.get_user_role(auth.uid()) = 'client' and
        client_id = (select id from public.users where auth_user_id = auth.uid())
    );

create policy "Agentes veem conversas atribuídas da conta"
    on public.conversations for select
    using (
        public.get_user_role(auth.uid()) = 'agent' and
        account_id = public.get_user_account_id(auth.uid()) and
        (agent_id = (select id from public.users where auth_user_id = auth.uid()) or agent_id is null)
    );

create policy "Admins veem todas as conversas da conta"
    on public.conversations for select
    using (
        public.get_user_role(auth.uid()) = 'admin' and
        account_id = public.get_user_account_id(auth.uid())
    );

create policy "Superadmins veem todas as conversas"
    on public.conversations for select
    using (public.get_user_role(auth.uid()) = 'superadmin');

create policy "Clientes podem criar conversas"
    on public.conversations for insert
    with check (
        public.get_user_role(auth.uid()) = 'client' and
        client_id = (select id from public.users where auth_user_id = auth.uid()) and
        account_id = public.get_user_account_id(auth.uid())
    );

create policy "Agentes e admins podem gerenciar conversas da conta"
    on public.conversations for all
    using (
        public.get_user_role(auth.uid()) in ('admin', 'agent') and
        account_id = public.get_user_account_id(auth.uid())
    );

-- POLÍTICAS PARA MESSAGES
create policy "Usuários veem mensagens de suas conversas"
    on public.messages for select
    using (
        conversation_id in (
            select id from public.conversations
            where (
                (public.get_user_role(auth.uid()) = 'client' and 
                 client_id = (select id from public.users where auth_user_id = auth.uid())) or
                (public.get_user_role(auth.uid()) in ('admin', 'agent') and 
                 account_id = public.get_user_account_id(auth.uid()))
            )
        ) and
        (is_internal = false or public.get_user_role(auth.uid()) in ('admin', 'agent', 'superadmin'))
    );

create policy "Usuários podem enviar mensagens"
    on public.messages for insert
    with check (
        conversation_id in (
            select id from public.conversations
            where (
                (public.get_user_role(auth.uid()) = 'client' and 
                 client_id = (select id from public.users where auth_user_id = auth.uid())) or
                (public.get_user_role(auth.uid()) in ('admin', 'agent') and 
                 account_id = public.get_user_account_id(auth.uid()))
            )
        ) and
        sender_id = (select id from public.users where auth_user_id = auth.uid())
    );

create policy "Superadmins veem todas as mensagens"
    on public.messages for select
    using (public.get_user_role(auth.uid()) = 'superadmin');

-- POLÍTICAS PARA RATINGS
create policy "Usuários veem avaliações relacionadas"
    on public.ratings for select
    using (
        (public.get_user_role(auth.uid()) = 'client' and 
         client_id = (select id from public.users where auth_user_id = auth.uid())) or
        (public.get_user_role(auth.uid()) in ('admin', 'agent') and 
         agent_id = (select id from public.users where auth_user_id = auth.uid())) or
        (public.get_user_role(auth.uid()) = 'admin' and 
         exists (select 1 from public.conversations c where c.id = conversation_id and c.account_id = public.get_user_account_id(auth.uid())))
    );

create policy "Clientes podem avaliar"
    on public.ratings for insert
    with check (
        public.get_user_role(auth.uid()) = 'client' and
        client_id = (select id from public.users where auth_user_id = auth.uid())
    );

-- =========================================
-- DADOS INICIAIS
-- =========================================

-- Inserir planos básicos
insert into public.plans (name, price, max_users, max_conversations, features) values
('Básico', 29.90, 3, 100, '{"chat": true, "email": false, "whatsapp": false}'),
('Profissional', 89.90, 10, 500, '{"chat": true, "email": true, "whatsapp": false}'),
('Empresarial', 199.90, 50, 2000, '{"chat": true, "email": true, "whatsapp": true}'),
('Premium', 499.90, 100, 10000, '{"chat": true, "email": true, "whatsapp": true, "api": true}');

-- Inserir conta de teste
insert into public.accounts (name, email, plan_id) values
('Empresa Demo', 'demo@chatfull.com', 1);

-- Criar usuário superadmin (será criado via trigger quando fizer signup)
-- O usuário deve fazer signup com: email: superadmin@chatfull.com e role: superadmin no metadata 