# Guia de Deploy - ChatFull

Este documento contém instruções detalhadas para fazer deploy do sistema ChatFull em diferentes plataformas.

## 📋 Pré-requisitos

- Projeto Supabase configurado
- Banco de dados com schema aplicado
- Variáveis de ambiente configuradas

## 🌐 Deploy na Vercel (Recomendado)

### 1. Conectar Repositório

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em "New Project"
4. Selecione o repositório do ChatFull
5. Clique em "Import"

### 2. Configurar Variáveis de Ambiente

Na página de configuração do projeto:

1. Vá para "Environment Variables"
2. Adicione as seguintes variáveis:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 3. Configurações de Build

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4. Deploy

1. Clique em "Deploy"
2. Aguarde o build completar
3. Acesse o link fornecido

### 5. Configurar Domínio Personalizado (Opcional)

1. Vá para "Settings" > "Domains"
2. Adicione seu domínio personalizado
3. Configure os DNS conforme instruções

## 🔵 Deploy na Netlify

### 1. Conectar Repositório

1. Acesse [netlify.com](https://netlify.com)
2. Clique em "New site from Git"
3. Conecte com GitHub
4. Selecione o repositório

### 2. Configurações de Build

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Production branch**: `main`

### 3. Variáveis de Ambiente

1. Vá para "Site settings" > "Environment variables"
2. Adicione:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 4. Configurar Redirects

Crie um arquivo `public/_redirects`:

```
/*    /index.html   200
```

### 5. Deploy

1. Clique em "Deploy site"
2. Aguarde o build
3. Acesse o link fornecido

## 🐳 Deploy com Docker

### 1. Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2. nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
```

### 3. Build e Run

```bash
# Build da imagem
docker build -t chatfull .

# Executar container
docker run -p 80:80 chatfull
```

## ☁️ Deploy na AWS

### 1. S3 + CloudFront

1. Crie um bucket S3
2. Configure para hosting estático
3. Faça upload do build
4. Configure CloudFront
5. Configure domínio personalizado

### 2. AWS Amplify

1. Conecte repositório no AWS Amplify
2. Configure build settings
3. Adicione variáveis de ambiente
4. Deploy automático

## 🔧 Configurações Adicionais

### Supabase Edge Functions

Para funcionalidades avançadas, configure Edge Functions:

```typescript
// supabase/functions/webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  // Lógica da função
  return new Response("OK")
})
```

### Monitoramento

Configure monitoramento com:

- **Sentry**: Para tracking de erros
- **Google Analytics**: Para métricas de uso
- **LogRocket**: Para replay de sessões

### SSL/HTTPS

Todas as plataformas mencionadas fornecem SSL gratuito. Para domínios personalizados:

1. Configure CNAME ou A record
2. Ative SSL/TLS
3. Force HTTPS redirect

### Performance

Otimizações recomendadas:

1. **Cache headers** corretos
2. **Gzip compression** habilitado
3. **CDN** configurado
4. **Image optimization**

### Backup

Configure backups regulares:

1. **Banco de dados**: Backup automático no Supabase
2. **Arquivos**: Backup do storage
3. **Código**: Git com múltiplos remotes

## 🔒 Segurança

### Headers de Segurança

Configure headers importantes:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

### Supabase RLS

Certifique-se que todas as políticas RLS estão ativas:

```sql
-- Verificar RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

## 📊 Monitoramento Pós-Deploy

### Health Checks

Configure health checks para:

- Status da aplicação
- Conectividade com Supabase
- Performance das queries
- Tempo de resposta

### Alertas

Configure alertas para:

- Erros 5xx
- Alta latência
- Falha de autenticação
- Uso excessivo de recursos

### Logs

Configure logging para:

- Erros de aplicação
- Tentativas de login
- Operações críticas
- Performance metrics

## 🚀 Deploy Contínuo

### GitHub Actions

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

## 🔄 Rollback

Em caso de problemas:

1. **Vercel/Netlify**: Use rollback automático
2. **Docker**: Mantenha versões tagged
3. **Banco**: Use migrations reversíveis

## 📞 Suporte

Para problemas de deploy:

1. Verifique logs da plataforma
2. Teste localmente primeiro
3. Verifique variáveis de ambiente
4. Confirme conectividade com Supabase

---

**Nota**: Este é um guia geral. Ajuste conforme suas necessidades específicas. 