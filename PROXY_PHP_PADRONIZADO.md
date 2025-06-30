# 📋 **GUIA: Padrão Proxy PHP Padronizado**

## ✅ **PADRÃO DE RESPOSTA UNIFICADO**

```json
{
  "success": boolean,
  "data": any,
  "error": string | null
}
```

---

## 🚀 **IMPLEMENTAÇÃO FRONTEND (React/TypeScript)**

### **1. Serviço Base**

```typescript
// src/services/chatwootProxyService.ts

interface ProxyResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// ✅ Função genérica para chamadas
async function callPhpProxy<T>(endpoint: string, options?: RequestInit): Promise<ProxyResponse<T>> {
  try {
    const response = await fetch(`/php-proxy/${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'ChatFull-System/1.0',
        'X-Requested-With': 'XMLHttpRequest',
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data as ProxyResponse<T>;
    
  } catch (error) {
    console.error(`❌ Erro no proxy ${endpoint}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro de conectividade'
    };
  }
}
```

### **2. Funções Específicas**

```typescript
// ✅ Listar Conversas
export async function getConversations(accountId: string = '1'): Promise<ProxyResponse<ChatwootConversation[]>> {
  console.log('📋 Buscando conversas...');
  const result = await callPhpProxy<ChatwootConversation[]>(`listar_conversas.php?account_id=${accountId}`);
  return result;
}

// ✅ Listar Agentes
export async function getAgents(accountId: string = '1'): Promise<ProxyResponse<ChatwootAgent[]>> {
  console.log('👨‍💼 Buscando agentes...');
  const result = await callPhpProxy<ChatwootAgent[]>(`listar_agentes.php?account_id=${accountId}`);
  return result;
}

// ✅ Listar Contatos
export async function getContacts(accountId: string = '1'): Promise<ProxyResponse<any[]>> {
  console.log('👥 Buscando contatos...');
  const result = await callPhpProxy<any[]>(`listar_contatos.php?account_id=${accountId}`);
  return result;
}

// ✅ Enviar Mensagem
export async function sendMessage(data: any): Promise<ProxyResponse<any>> {
  const result = await callPhpProxy<any>('enviar_mensagem.php', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return result;
}
```

---

## 🎯 **USO NOS COMPONENTES**

### **Exemplo Prático - Lista de Agentes**

```typescript
// src/components/ListaAgentes.tsx
import { getAgents, type ChatwootAgent, type ProxyResponse } from '../services/chatwootProxyService';

export default function ListaAgentes() {
  const [agents, setAgents] = useState<ChatwootAgent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAgents = async () => {
      setLoading(true);
      setError(null);

      const result = await getAgents('1');
      
      if (result.success) {
        setAgents(result.data || []);
      } else {
        setError(result.error || 'Erro ao carregar agentes');
      }
      
      setLoading(false);
    };

    loadAgents();
  }, []);

  // ... resto do componente
}
```

---

## 📁 **ESTRUTURA DOS ARQUIVOS PHP**

### **1. Listar Agentes**
```php
<?php
// /php-proxy/listar_agentes.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: *');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $account_id = $_GET['account_id'] ?? '1';
    $api_url = "https://chat.fullweb.com.br/api/v1/accounts/{$account_id}/agents";
    
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => [
                'Accept: application/json',
                'api_access_token: tNhW1BVczaPLXihqyKi8T3ki'
            ]
        ]
    ]);
    
    $response = file_get_contents($api_url, false, $context);
    
    if ($response === false) {
        throw new Exception('Erro ao conectar com API');
    }
    
    $data = json_decode($response, true);
    
    echo json_encode([
        'success' => true,
        'data' => $data['payload'] ?? $data,
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
```

### **2. Listar Conversas**
```php
<?php
// /php-proxy/listar_conversas.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: *');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $account_id = $_GET['account_id'] ?? '1';
    $api_url = "https://chat.fullweb.com.br/api/v1/accounts/{$account_id}/conversations";
    
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => [
                'Accept: application/json',
                'api_access_token: tNhW1BVczaPLXihqyKi8T3ki'
            ]
        ]
    ]);
    
    $response = file_get_contents($api_url, false, $context);
    
    if ($response === false) {
        throw new Exception('Erro ao conectar com API');
    }
    
    $data = json_decode($response, true);
    
    echo json_encode([
        'success' => true,
        'data' => $data['data']['payload'] ?? $data['payload'] ?? [],
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
```

### **3. Enviar Mensagem**
```php
<?php
// /php-proxy/enviar_mensagem.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: *');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $account_id = $input['account_id'] ?? '1';
    $conversation_id = $input['conversation_id'];
    $content = $input['content'];
    $message_type = $input['message_type'] ?? 'outgoing';
    
    $api_url = "https://chat.fullweb.com.br/api/v1/accounts/{$account_id}/conversations/{$conversation_id}/messages";
    
    $post_data = json_encode([
        'content' => $content,
        'message_type' => $message_type,
        'private' => false
    ]);
    
    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => [
                'Content-Type: application/json',
                'Accept: application/json',
                'api_access_token: tNhW1BVczaPLXihqyKi8T3ki'
            ],
            'content' => $post_data
        ]
    ]);
    
    $response = file_get_contents($api_url, false, $context);
    
    if ($response === false) {
        throw new Exception('Erro ao enviar mensagem');
    }
    
    $data = json_decode($response, true);
    
    echo json_encode([
        'success' => true,
        'data' => $data
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
```

---

## 🔧 **CONFIGURAÇÃO VITE (Proxy Local)**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/php-proxy': {
        target: 'https://fullweb.com.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/php-proxy/, '/php-proxy')
      }
    }
  }
})
```

---

## ✨ **VANTAGENS DO PADRÃO**

### ✅ **Frontend Benefits**
- **Estrutura consistente**: Sempre `{ success, data, error }`
- **TypeScript friendly**: Tipagem clara e reutilizável
- **Error handling**: Tratamento de erros padronizado
- **Loading states**: Estados de carregamento simplificados
- **Reusabilidade**: Função base reutilizável

### ✅ **Backend Benefits**
- **CORS resolvido**: Headers configurados uma vez
- **Estrutura padrão**: Mesmo formato em todos endpoints
- **Error catching**: Tratamento consistente de erros
- **Fácil manutenção**: Código limpo e organizado

### ✅ **Development Benefits**
- **Debug simples**: Logs padronizados
- **Escalabilidade**: Fácil adicionar novos endpoints
- **Testing**: Testes mais simples
- **Documentation**: Padrão claro para equipe

---

## 📋 **CHECKLIST DE IMPLEMENTAÇÃO**

### **Frontend**
- [ ] Criar `chatwootProxyService.ts`
- [ ] Implementar `callPhpProxy<T>()` genérica
- [ ] Criar funções específicas (getAgents, getConversations, etc.)
- [ ] Adaptar componentes para usar novo serviço
- [ ] Implementar tratamento de erros padronizado
- [ ] Adicionar loading states consistentes

### **Backend PHP**
- [ ] Criar pasta `/php-proxy/`
- [ ] Implementar `listar_agentes.php`
- [ ] Implementar `listar_conversas.php`
- [ ] Implementar `listar_mensagens.php`
- [ ] Implementar `enviar_mensagem.php`
- [ ] Implementar `listar_contatos.php`
- [ ] Configurar headers CORS em todos
- [ ] Testar todos endpoints

### **Configuração**
- [ ] Configurar proxy no Vite
- [ ] Testar em development
- [ ] Configurar para production
- [ ] Documentar endpoints

---

## 🎯 **ENDPOINTS DISPONÍVEIS**

| Endpoint | Método | Parâmetros | Retorna |
|----------|--------|------------|---------|
| `listar_agentes.php` | GET | `account_id` | Array de agentes |
| `listar_conversas.php` | GET | `account_id` | Array de conversas |
| `listar_mensagens.php` | GET | `account_id`, `conversation_id` | Array de mensagens |
| `enviar_mensagem.php` | POST | JSON body | Mensagem enviada |
| `listar_contatos.php` | GET | `account_id` | Array de contatos |
| `buscar_conversas.php` | GET | `account_id`, `q` | Array filtrado |
| `atualizar_status.php` | POST | JSON body | Conversa atualizada |
| `estatisticas.php` | GET | `account_id` | Objeto estatísticas |

---

## 🔄 **MIGRAÇÃO DO CÓDIGO EXISTENTE**

### **Antes (Antigo)**
```typescript
useEffect(() => {
  fetch('https://fullweb.com.br/chathook/conversas.php')
    .then(res => res.json())
    .then(data => {
      if (data.data?.payload) {
        setConversas(data.data.payload);
      } else {
        alert('Erro na estrutura de dados');
      }
    })
    .catch(err => {
      console.error(err);
      alert('Erro de conectividade');
    });
}, []);
```

### **Depois (Novo Padrão)**
```typescript
useEffect(() => {
  const loadConversations = async () => {
    const result = await getConversations('1');
    
    if (result.success) {
      setConversas(result.data || []);
    } else {
      setError(result.error || 'Erro ao carregar');
    }
  };

  loadConversations();
}, []);
```

---

## 🚀 **PRÓXIMOS PASSOS**

1. **Implementar todos endpoints PHP** listados
2. **Migrar componentes existentes** para novo padrão
3. **Adicionar testes automatizados** para endpoints
4. **Configurar monitoring** para APIs
5. **Documentar para equipe** de desenvolvimento

---

*✅ **Sistema atualizado com padrão moderno, escalável e maintível!*** 