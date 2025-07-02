// Configuração de URLs - produção e desenvolvimento
const CHATWOOT_API_URL = 'https://SEU_DOMINIO_CHATWOOT.com/api/v1';
const CHATWOOT_TOKEN = 'SEU_TOKEN_CHATWOOT_AQUI'; // token fornecido

// URL do proxy local (apenas para desenvolvimento)
const CHATWOOT_PROXY_URL = '/api/chatwoot';

// ✅ SOLUÇÃO CORS: Usando proxy PHP (ENDPOINT ATUALIZADO)
const CHATWOOT_PHP_PROXY = 'https://fullweb.com.br/chathook/conversas.php';
const CHATWOOT_MENSAGENS_PHP = 'https://fullweb.com.br/chathook/mensagens.php';
const CHATWOOT_RESPONDER_PHP = 'https://fullweb.com.br/chathook/responder.php';

// Detecta se estamos em desenvolvimento
const isDev = import.meta.env.DEV;
const baseUrl = isDev ? CHATWOOT_PROXY_URL : CHATWOOT_API_URL;

function getHeaders(): HeadersInit {
  // No proxy local, o token já é adicionado automaticamente
  if (isDev) {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }
  
  // Em produção, usamos o token normalmente
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'api_access_token': CHATWOOT_TOKEN,
  };
}

function getDevHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}

function getProdHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'api_access_token': CHATWOOT_TOKEN,
  };
}

// 🔄 PADRÃO PROXY PHP PADRONIZADO
// Estrutura de resposta: { success: boolean, data?: any, error?: string }

interface ProxyResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ChatwootConversation {
  id: number;
  status: string;
  created_at: number;
  meta?: {
    sender?: {
      name: string;
      email?: string;
      phone_number?: string;
      thumbnail?: string;
    };
    assignee?: {
      name: string;
      id: number;
    };
    channel?: string;
  };
  inbox_id?: number;
  messages_count?: number;
  priority?: string;
}

interface ChatwootMessage {
  id: number;
  content: string;
  message_type: 'outgoing' | 'incoming';
  created_at: number;
  sender?: {
    name: string;
    email?: string;
    thumbnail?: string;
  };
  attachments?: any[];
}

interface ChatwootAgent {
  id: number;
  name: string;
  email: string;
  role: string;
  availability_status: string;
  thumbnail?: string;
}

// ✅ FUNÇÃO GENÉRICA PARA PROXY PHP
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

// 🤖 FUNÇÃO: Listar Conversas
export async function getConversations(accountId: string = '1'): Promise<ProxyResponse<ChatwootConversation[]>> {
  console.log('📋 Buscando conversas via proxy padronizado...');
  
  const result = await callPhpProxy<ChatwootConversation[]>(`listar_conversas.php?account_id=${accountId}`);
  
  if (result.success) {
    console.log('✅ Conversas carregadas:', result.data?.length || 0);
  } else {
    console.error('❌ Erro ao carregar conversas:', result.error);
  }
  
  return result;
}

// 💬 FUNÇÃO: Listar Mensagens de uma Conversa
export async function getConversationMessages(accountId: string, conversationId: number): Promise<ProxyResponse<ChatwootMessage[]>> {
  console.log(`💬 Buscando mensagens da conversa ${conversationId}...`);
  
  const result = await callPhpProxy<ChatwootMessage[]>(`listar_mensagens.php?account_id=${accountId}&conversation_id=${conversationId}`);
  
  if (result.success) {
    console.log('✅ Mensagens carregadas:', result.data?.length || 0);
  } else {
    console.error('❌ Erro ao carregar mensagens:', result.error);
  }
  
  return result;
}

// 📤 FUNÇÃO: Enviar Mensagem
export async function sendMessageToConversation(
  accountId: string, 
  conversationId: number, 
  message: string,
  messageType: 'outgoing' | 'incoming' = 'outgoing'
): Promise<ProxyResponse<ChatwootMessage>> {
  console.log(`📤 Enviando mensagem para conversa ${conversationId}...`);
  
  const result = await callPhpProxy<ChatwootMessage>('enviar_mensagem.php', {
    method: 'POST',
    body: JSON.stringify({
      account_id: accountId,
      conversation_id: conversationId,
      content: message,
      message_type: messageType,
      private: false
    }),
  });
  
  if (result.success) {
    console.log('✅ Mensagem enviada com sucesso');
  } else {
    console.error('❌ Erro ao enviar mensagem:', result.error);
  }
  
  return result;
}

// 👨‍💼 FUNÇÃO: Listar Agentes
export async function getAgents(accountId: string = '1'): Promise<ProxyResponse<ChatwootAgent[]>> {
  console.log('👨‍💼 Buscando agentes...');
  
  const result = await callPhpProxy<ChatwootAgent[]>(`listar_agentes.php?account_id=${accountId}`);
  
  if (result.success) {
    console.log('✅ Agentes carregados:', result.data?.length || 0);
  } else {
    console.error('❌ Erro ao carregar agentes:', result.error);
  }
  
  return result;
}

// 👥 FUNÇÃO: Listar Contatos
export async function getContacts(accountId: string = '1'): Promise<ProxyResponse<any[]>> {
  console.log('👥 Buscando contatos...');
  
  const result = await callPhpProxy<any[]>(`listar_contatos.php?account_id=${accountId}`);
  
  if (result.success) {
    console.log('✅ Contatos carregados:', result.data?.length || 0);
  } else {
    console.error('❌ Erro ao carregar contatos:', result.error);
  }
  
  return result;
}

// 📊 FUNÇÃO: Estatísticas
export async function getStatistics(accountId: string = '1'): Promise<ProxyResponse<any>> {
  console.log('📊 Buscando estatísticas...');
  
  const result = await callPhpProxy<any>(`estatisticas.php?account_id=${accountId}`);
  
  if (result.success) {
    console.log('✅ Estatísticas carregadas');
  } else {
    console.error('❌ Erro ao carregar estatísticas:', result.error);
  }
  
  return result;
}

// 🔍 FUNÇÃO: Buscar Conversas
export async function searchConversations(accountId: string, query: string): Promise<ProxyResponse<ChatwootConversation[]>> {
  console.log(`🔍 Buscando conversas: "${query}"`);
  
  const result = await callPhpProxy<ChatwootConversation[]>(`buscar_conversas.php?account_id=${accountId}&q=${encodeURIComponent(query)}`);
  
  if (result.success) {
    console.log('✅ Busca realizada:', result.data?.length || 0, 'resultados');
  } else {
    console.error('❌ Erro na busca:', result.error);
  }
  
  return result;
}

// 🔄 FUNÇÃO: Atualizar Status da Conversa
export async function updateConversationStatus(
  accountId: string, 
  conversationId: number, 
  status: 'open' | 'pending' | 'resolved' | 'closed'
): Promise<ProxyResponse<ChatwootConversation>> {
  console.log(`🔄 Atualizando status da conversa ${conversationId} para ${status}`);
  
  const result = await callPhpProxy<ChatwootConversation>('atualizar_status.php', {
    method: 'POST',
    body: JSON.stringify({
      account_id: accountId,
      conversation_id: conversationId,
      status: status
    }),
  });
  
  if (result.success) {
    console.log('✅ Status atualizado com sucesso');
  } else {
    console.error('❌ Erro ao atualizar status:', result.error);
  }
  
  return result;
}

// 🏷️ FUNÇÃO: Listar Labels
export async function getLabels(accountId: string = '1'): Promise<ProxyResponse<any[]>> {
  console.log('🏷️ Buscando labels...');
  
  const result = await callPhpProxy<any[]>(`listar_labels.php?account_id=${accountId}`);
  
  if (result.success) {
    console.log('✅ Labels carregadas:', result.data?.length || 0);
  } else {
    console.error('❌ Erro ao carregar labels:', result.error);
  }
  
  return result;
}

// 🔧 FUNÇÃO: Testar Conectividade
export async function testConnection(): Promise<ProxyResponse<{ status: string; timestamp: number }>> {
  console.log('🔧 Testando conectividade...');
  
  const result = await callPhpProxy<{ status: string; timestamp: number }>('test_connection.php');
  
  if (result.success) {
    console.log('✅ Conexão testada com sucesso');
  } else {
    console.error('❌ Erro no teste de conexão:', result.error);
  }
  
  return result;
}

// ⚡ FUNÇÃO LEGACY: Manter compatibilidade com código existente
export async function getLastConversations(accountId: string = '1', limit = 20): Promise<any> {
  const result = await getConversations(accountId);
  
  if (result.success) {
    return {
      payload: result.data || [],
      data: result.data || [],
      meta: { all_count: result.data?.length || 0 },
      count: result.data?.length || 0
    };
  } else {
    throw new Error(result.error || 'Erro ao carregar conversas');
  }
}

// 🎯 EXPORT PARA HOOKS PERSONALIZADOS
export { type ProxyResponse, type ChatwootConversation, type ChatwootMessage, type ChatwootAgent }; 