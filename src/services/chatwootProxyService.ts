// 🔄 CHATWOOT PROXY SERVICE - VERSÃO CORRIGIDA PARA MENSAGENS
// Estrutura real do endpoint: https://fullweb.com.br/chathook/chatwoot-proxy.php

// 🔗 CONFIGURAÇÃO DE ENDPOINTS
const REMOTE_ENDPOINT = 'https://fullweb.com.br/chathook/chatwoot-proxy.php';
const LOCAL_ENDPOINT = '/chathook/chatwoot-proxy.php';

// 📋 INTERFACES BASEADAS NOS DADOS REAIS DO ENDPOINT
interface ChatwootApiResponse {
  data: {
    meta: {
      mine_count: number;
      assigned_count: number;
      unassigned_count: number;
      all_count: number;
    };
    payload: ChatwootConversation[];
  };
}

interface ChatwootConversation {
  id: number;
  display_id?: number;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  created_at: number;
  last_activity_at: number;
  account_id: number;
  uuid: string;
  inbox_id: number;
  priority?: string | null;
  waiting_since: number;
  can_reply: boolean;
  unread_count: number;
  assignee_last_seen_at: number;
  agent_last_seen_at: number;
  contact_last_seen_at: number;
  
  meta: {
    sender: {
      id: number;
      name: string;
      email?: string | null;
      phone_number?: string;
      identifier?: string;
      thumbnail?: string;
      availability_status: string;
      additional_attributes: Record<string, any>;
      custom_attributes: Record<string, any>;
      last_activity_at: number;
      created_at: number;
    };
    assignee?: {
      id: number;
      account_id: number;
      name: string;
      available_name: string;
      email: string;
      role: string;
      availability_status: string;
      thumbnail?: string;
      auto_offline: boolean;
      confirmed: boolean;
      custom_role_id?: number | null;
    };
    channel: string;
    hmac_verified: boolean;
  };
  
  messages: ChatwootMessage[];
  additional_attributes: Record<string, any>;
  custom_attributes: Record<string, any>;
  labels: any[];
  muted: boolean;
  snoozed_until?: number | null;
  sla_policy_id?: number | null;
  first_reply_created_at?: number;
  last_non_activity_message?: ChatwootMessage;
  
  // Campo de conveniência para fácil acesso
  assignee?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

interface ChatwootMessage {
  id: number;
  content: string | null;
  account_id: number;
  inbox_id: number;
  conversation_id: number;
  message_type: 0 | 1; // 0 = incoming, 1 = outgoing
  created_at: number;
  updated_at: string;
  private: boolean;
  status: string;
  source_id?: string | null;
  content_type: string;
  content_attributes: Record<string, any>;
  sender_type: 'Contact' | 'User';
  sender_id: number;
  external_source_ids: Record<string, any>;
  additional_attributes: Record<string, any>;
  processed_message_content?: string | null;
  sentiment: Record<string, any>;
  
  conversation?: {
    assignee_id?: number | null;
    unread_count: number;
    last_activity_at: number;
    contact_inbox: {
      source_id: string;
    };
  };
  
  attachments?: ChatwootAttachment[];
  
  sender: {
    id: number;
    name: string;
    available_name?: string;
    email?: string | null;
    phone_number?: string;
    identifier?: string | null;
    thumbnail?: string;
    avatar_url?: string;
    type: 'contact' | 'user';
    availability_status?: string;
    additional_attributes?: Record<string, any>;
    custom_attributes?: Record<string, any>;
  };
}

interface ChatwootAttachment {
  id: number;
  message_id: number;
  file_type: string;
  account_id: number;
  extension?: string | null;
  data_url: string;
  thumb_url?: string;
  file_size: number;
  width?: number;
  height?: number;
}

interface ChatwootAgent {
  id: number;
  name: string;
  available_name: string;
  email: string;
  role: string;
  availability_status: string;
  thumbnail?: string;
  account_id: number;
  auto_offline: boolean;
  confirmed: boolean;
  custom_role_id?: number | null;
}

// 👥 INTERFACES PARA CONTATOS
interface ChatwootContact {
  id: number;
  name: string;
  email?: string | null;
  phone_number?: string;
  identifier?: string;
  thumbnail?: string;
  availability_status: string;
  additional_attributes: Record<string, any>;
  custom_attributes: Record<string, any>;
  last_activity_at?: number;
  created_at: number;
  contact_inboxes?: ContactInbox[];
  conversations_count?: number;
  last_conversation?: {
    id: number;
    created_at: number;
    status: string;
  };
}

interface ContactInbox {
  id: number;
  contact_id: number;
  inbox_id: number;
  source_id: string;
  created_at: number;
  updated_at: string;
  hmac_verified?: boolean;
  pubsub_token?: string;
  inbox?: {
    id: number;
    name: string;
    channel_type: string;
  };
}

interface ContactsApiResponse {
  data: {
    meta: {
      count: number;
      current_page: number;
      next_page?: number;
      prev_page?: number;
      total_count: number;
      total_pages: number;
    };
    payload: ChatwootContact[];
  };
}

// 🔄 INTERFACE DE RESPOSTA PADRONIZADA
interface ProxyResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    mine_count: number;
    assigned_count: number;
    unassigned_count: number;
    all_count: number;
  };
}

// ✅ FUNÇÃO GENÉRICA PARA PROXY PHP - VERSÃO MELHORADA
async function callPhpProxy<T>(
  chatwootEndpoint: string,
  params?: Record<string, string | number | boolean>,
  options?: RequestInit
): Promise<ProxyResponse<T>> {
  
  const endpointsToTry = [REMOTE_ENDPOINT, LOCAL_ENDPOINT];
  let lastError: Error | null = null;

  for (const baseEndpoint of endpointsToTry) {
    try {
      console.log(`🔄 Tentando endpoint: ${baseEndpoint}`);
      
      let url = `${baseEndpoint}?endpoint=${chatwootEndpoint}`;
      
      if (params) {
        const queryParams = new URLSearchParams();
        for (const key in params) {
          if (Object.prototype.hasOwnProperty.call(params, key)) {
            queryParams.append(key, String(params[key]));
          }
        }
        if (queryParams.toString()) {
          url += `&${queryParams.toString()}`;
        }
      }

      console.log('📡 URL completa:', url);

      const defaultOptions: RequestInit = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'ChatFull-System/1.0',
          'X-Requested-With': 'XMLHttpRequest',
        },
        mode: 'cors',
      };

      const fetchOptions = { ...defaultOptions, ...options };
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erro HTTP ${response.status}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const rawData = await response.json();
      console.log(`✅ Dados recebidos de ${baseEndpoint}:`, {
        type: typeof rawData,
        keys: Object.keys(rawData || {}),
        hasData: !!rawData.data,
        hasPayload: !!rawData.data?.payload
      });

      return processApiResponse<T>(rawData, chatwootEndpoint);
      
    } catch (error) {
      console.warn(`⚠️ Falha com ${baseEndpoint}:`, error);
      lastError = error instanceof Error ? error : new Error('Erro desconhecido');
      continue;
    }
  }

  console.error(`❌ Todos os endpoints falharam para ${chatwootEndpoint}`);
  return {
    success: false,
    error: lastError ? lastError.message : 'Erro de conectividade - todos os endpoints falharam'
  };
}

// 🔧 FUNÇÃO PARA PROCESSAR RESPOSTA DA API - NOVA E MELHORADA
function processApiResponse<T>(rawData: any, endpoint: string): ProxyResponse<T> {
  console.log(`🔧 Processando resposta para endpoint: ${endpoint}`);
  console.log(`🔧 Dados brutos:`, rawData);

  // Verifica se é uma resposta de erro estruturada
  if (rawData && rawData.success === false) {
    console.warn('⚠️ Resposta com erro:', rawData.error);
    return {
      success: false,
      error: rawData.error || 'Erro desconhecido'
    };
  }

  // Processamento específico para conversations
  if (endpoint === 'conversations') {
    return processConversationsResponse<T>(rawData);
  }

  // Processamento específico para mensagens
  if (endpoint.includes('/messages')) {
    return processMessagesResponse<T>(rawData);
  }

  // Processamento genérico para outros endpoints
  return processGenericResponse<T>(rawData);
}

// 📋 FUNÇÃO PARA PROCESSAR RESPOSTA DE CONVERSAS
function processConversationsResponse<T>(rawData: any): ProxyResponse<T> {
  console.log('📋 Processando conversas...');

  // Estrutura padrão: { data: { meta: {...}, payload: [...] } }
  if (rawData.data && rawData.data.payload && Array.isArray(rawData.data.payload)) {
    console.log('✅ Estrutura data.payload encontrada:', rawData.data.payload.length, 'conversas');
    
    // Processa cada conversa para garantir que as mensagens estão corretas
    const processedConversations = rawData.data.payload.map((conv: any) => {
      console.log(`🔍 Processando conversa ${conv.id}:`, {
        id: conv.id,
        hasMessages: !!conv.messages,
        messagesCount: Array.isArray(conv.messages) ? conv.messages.length : 0,
        hasLastMessage: !!conv.last_non_activity_message
      });

      return {
        ...conv,
        messages: Array.isArray(conv.messages) ? conv.messages : [],
        display_id: conv.display_id || conv.id
      };
    });
    
    return {
      success: true,
      data: processedConversations as T,
      meta: rawData.data.meta
    };
  }

  // Estrutura alternativa: { data: [...] }
  if (rawData.data && Array.isArray(rawData.data)) {
    console.log('✅ Estrutura data array encontrada:', rawData.data.length, 'conversas');
    return {
      success: true,
      data: rawData.data as T
    };
  }

  // Array direto
  if (Array.isArray(rawData)) {
    console.log('✅ Array direto encontrado:', rawData.length, 'conversas');
    return {
      success: true,
      data: rawData as T
    };
  }

  console.warn('⚠️ Estrutura inesperada para conversations:', rawData);
  return {
    success: false,
    error: 'Estrutura de dados inesperada para conversas'
  };
}

// 💬 FUNÇÃO PARA PROCESSAR RESPOSTA DE MENSAGENS
function processMessagesResponse<T>(rawData: any): ProxyResponse<T> {
  console.log('💬 Processando mensagens...');

  // Estrutura padrão: { data: [...] }
  if (rawData.data && Array.isArray(rawData.data)) {
    console.log('✅ Mensagens encontradas:', rawData.data.length);
    return {
      success: true,
      data: rawData.data as T
    };
  }

  // Array direto
  if (Array.isArray(rawData)) {
    console.log('✅ Array de mensagens direto:', rawData.length);
    return {
      success: true,
      data: rawData as T
    };
  }

  // Estrutura com payload
  if (rawData.payload && Array.isArray(rawData.payload)) {
    console.log('✅ Mensagens em payload:', rawData.payload.length);
    return {
      success: true,
      data: rawData.payload as T
    };
  }

  console.warn('⚠️ Estrutura inesperada para mensagens:', rawData);
  return {
    success: false,
    error: 'Estrutura de dados inesperada para mensagens'
  };
}

// 🔧 FUNÇÃO PARA PROCESSAR RESPOSTA GENÉRICA
function processGenericResponse<T>(rawData: any): ProxyResponse<T> {
  console.log('🔧 Processamento genérico...');

  if (rawData.data) {
    return {
      success: true,
      data: rawData.data as T
    };
  }

  return {
    success: true,
    data: rawData as T
  };
}

// 🤖 FUNÇÃO: Listar Conversas - MELHORADA
export async function getConversations(status?: string): Promise<ProxyResponse<ChatwootConversation[]>> {
  console.log('📋 Buscando conversas via proxy...');
  
  const params: Record<string, string | number | boolean> = {};
  if (status) {
    params.status = status;
  }
  
  const result = await callPhpProxy<ChatwootConversation[]>('conversations', params);
  
  if (result.success) {
    console.log('✅ Conversas carregadas com sucesso:', result.data?.length || 0);
    
    // Debug das mensagens em cada conversa
    if (Array.isArray(result.data)) {
      result.data.forEach((conv, index) => {
        console.log(`📱 Conversa ${index + 1} (ID: ${conv.id}):`, {
          sender: conv.meta?.sender?.name,
          messages: conv.messages?.length || 0,
          lastActivity: new Date(conv.last_activity_at * 1000).toLocaleString()
        });
      });
    }
  } else {
    console.error('❌ Erro ao carregar conversas:', result.error);
  }
  
  return result;
}

// 💬 FUNÇÃO: Listar Mensagens de uma Conversa - MELHORADA
export async function getConversationMessages(conversationId: number): Promise<ProxyResponse<ChatwootMessage[]>> {
  console.log(`💬 Buscando mensagens da conversa ${conversationId}...`);
  
  const result = await callPhpProxy<ChatwootMessage[]>(`conversations/${conversationId}/messages`);
  
  if (result.success) {
    console.log('✅ Mensagens carregadas:', result.data?.length || 0);
    
    // Debug das mensagens
    if (Array.isArray(result.data) && result.data.length > 0) {
      console.log('📱 Sample da primeira mensagem:', {
        id: result.data[0].id,
        content: result.data[0].content?.substring(0, 50) + '...',
        sender: result.data[0].sender?.name,
        type: result.data[0].sender_type,
        attachments: result.data[0].attachments?.length || 0
      });
    }
  } else {
    console.error('❌ Erro ao carregar mensagens:', result.error);
  }
  
  return result;
}

// 📤 FUNÇÃO: Enviar Mensagem - MELHORADA
export async function sendMessageToConversation(
  conversationId: number, 
  message: string,
  messageType: 'outgoing' | 'incoming' = 'outgoing'
): Promise<ProxyResponse<ChatwootMessage>> {
  console.log(`📤 Enviando mensagem para conversa ${conversationId}...`);
  
  const result = await callPhpProxy<ChatwootMessage>(`conversations/${conversationId}/messages`, {}, {
    method: 'POST',
    body: JSON.stringify({
      content: message,
      message_type: messageType === 'outgoing' ? 1 : 0,
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

// 🧪 FUNÇÃO PARA TESTAR CORS
export async function testCorsConnectivity(): Promise<ProxyResponse<any>> {
  console.log('🧪 Testando CORS...');
  
  try {
    const testUrl = `${REMOTE_ENDPOINT.replace('chatwoot-proxy.php', 'test-cors.php')}`;
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Teste CORS bem-sucedido:', data);
    
    return {
      success: true,
      data: data,
    };
    
  } catch (error) {
    console.error('❌ Erro no teste CORS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro de CORS'
    };
  }
}

// 👨‍💼 FUNÇÃO: Listar Agentes
export async function getAgents(): Promise<ProxyResponse<ChatwootAgent[]>> {
  console.log('👨‍💼 Buscando agentes...');
  
  const result = await callPhpProxy<ChatwootAgent[]>('agents');
  
  if (result.success) {
    console.log('✅ Agentes carregados:', result.data?.length || 0);
  } else {
    console.error('❌ Erro ao carregar agentes:', result.error);
  }
  
  return result;
}

// 🔄 FUNÇÃO: Atualizar Status da Conversa
export async function updateConversationStatus(
  conversationId: number, 
  status: 'open' | 'pending' | 'resolved' | 'closed'
): Promise<ProxyResponse<ChatwootConversation>> {
  console.log(`🔄 Atualizando status da conversa ${conversationId} para ${status}`);
  
  const result = await callPhpProxy<ChatwootConversation>(`conversations/${conversationId}`, {}, {
    method: 'PATCH',
    body: JSON.stringify({
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

// 👨‍💼 FUNÇÃO: Atribuir Conversa a Agente
export async function assignConversationToAgent(
  conversationId: number,
  agentId: number
): Promise<ProxyResponse<ChatwootConversation>> {
  console.log(`👨‍💼 Atribuindo conversa ${conversationId} ao agente ${agentId}`);
  
  const result = await callPhpProxy<ChatwootConversation>(`conversations/${conversationId}`, {}, {
    method: 'PATCH',
    body: JSON.stringify({
      assignee_id: agentId
    }),
  });
  
  if (result.success) {
    console.log('✅ Conversa atribuída com sucesso');
  } else {
    console.error('❌ Erro ao atribuir conversa:', result.error);
  }
  
  return result;
}

// 🔧 FUNÇÃO: Testar Conectividade
export async function testConnection(): Promise<ProxyResponse<{ status: string; timestamp: number }>> {
  console.log('🔧 Testando conectividade...');
  
  const result = await callPhpProxy<ChatwootConversation[]>('conversations', { page: 1, per_page: 1 });
  
  if (result.success) {
    console.log('✅ Conexão testada com sucesso');
    return { 
      success: true, 
      data: { status: 'ok', timestamp: Date.now() },
      meta: result.meta
    };
  } else {
    console.error('❌ Erro no teste de conexão:', result.error);
    return { success: false, error: result.error };
  }
}

// 🎯 FUNÇÕES UTILITÁRIAS
export function formatMessageType(messageType: number): 'incoming' | 'outgoing' {
  return messageType === 0 ? 'incoming' : 'outgoing';
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString('pt-BR');
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'open': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'resolved': return 'bg-blue-100 text-blue-800';
    case 'closed': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export function getPriorityIcon(priority?: string | null): string {
  switch (priority) {
    case 'urgent': return '🔴';
    case 'high': return '🟠';
    case 'medium': return '🟡';
    case 'low': return '🟢';
    default: return '⚪';
  }
}

// 👥 FUNÇÃO: Listar Contatos - NOVA IMPLEMENTAÇÃO COMPLETA
export async function getContacts(
  page: number = 1, 
  perPage: number = 25,
  sort: string = '-created_at',
  searchQuery?: string
): Promise<ProxyResponse<{ contacts: ChatwootContact[]; meta: any }>> {
  console.log('👥 Buscando contatos via proxy...');
  console.log(`📊 Parâmetros: página=${page}, por_página=${perPage}, ordenação=${sort}`);
  
  const params: Record<string, string | number | boolean> = {
    page,
    per_page: perPage,
    sort
  };
  
  if (searchQuery && searchQuery.trim()) {
    params.q = searchQuery.trim();
  }
  
  const result = await callPhpProxy<ContactsApiResponse>('contacts', params);
  
  console.log('📊 Resultado bruto da API de contatos:', result);
  
  if (result.success) {
    const apiResponse = result.data as ContactsApiResponse;
    
    const anyResponse = apiResponse as any;
    
    console.log('🔍 Analisando estrutura da resposta:', {
      hasData: !!apiResponse,
      type: typeof apiResponse,
      keys: apiResponse ? Object.keys(apiResponse) : [],
      hasDataProp: !!anyResponse?.data,
      hasPayload: !!anyResponse?.data?.payload,
      hasDirectPayload: !!anyResponse?.payload,
      isDirectArray: Array.isArray(apiResponse)
    });
    
    // Estrutura esperada: { data: { meta: {...}, payload: [...] } }
    if (apiResponse?.data?.payload && Array.isArray(apiResponse.data.payload)) {
      console.log('✅ Estrutura padrão encontrada - data.payload');
      return {
        success: true,
        data: {
          contacts: apiResponse.data.payload,
          meta: apiResponse.data.meta
        }
      };
    }
    
    // Estrutura alternativa: { payload: [...], meta: {...} }
    if (anyResponse?.payload && Array.isArray(anyResponse.payload)) {
      console.log('✅ Estrutura alternativa encontrada - payload direto');
      return {
        success: true,
        data: {
          contacts: anyResponse.payload,
          meta: anyResponse.meta
        }
      };
    }
    
    // Array direto
    if (Array.isArray(apiResponse)) {
      console.log('✅ Array direto encontrado');
      return {
        success: true,
        data: {
          contacts: apiResponse,
          meta: null
        }
      };
    }
    
    // Se tem propriedade 'data' que é um array
    if (anyResponse?.data && Array.isArray(anyResponse.data)) {
      console.log('✅ Array em data encontrado');
      return {
        success: true,
        data: {
          contacts: anyResponse.data,
          meta: null
        }
      };
    }
    
    // Log para debug da estrutura não reconhecida
    console.warn('⚠️ Estrutura não reconhecida na resposta de contatos:');
    console.warn('Dados completos:', JSON.stringify(apiResponse, null, 2));
    
    return {
      success: false,
      error: 'Estrutura de dados inesperada para contatos - verifique o console para detalhes'
    };
  } else {
    console.error('❌ Erro ao carregar contatos:', result.error);
    return {
      success: false,
      error: result.error || 'Erro ao carregar contatos'
    };
  }
}

// 👤 FUNÇÃO: Obter Detalhes de um Contato
export async function getContactDetails(contactId: number): Promise<ProxyResponse<ChatwootContact>> {
  console.log(`👤 Buscando detalhes do contato ${contactId}...`);
  
  const result = await callPhpProxy<ChatwootContact>(`contacts/${contactId}`);
  
  if (result.success) {
    console.log('✅ Detalhes do contato carregados');
  } else {
    console.error('❌ Erro ao carregar detalhes do contato:', result.error);
  }
  
  return result;
}

// 👥 FUNÇÃO: Buscar Contatos
export async function searchContacts(query: string): Promise<ProxyResponse<{ contacts: ChatwootContact[]; meta: any }>> {
  console.log(`🔍 Buscando contatos: "${query}"`);
  
  return getContacts(1, 25, '-created_at', query);
}

// 👤 FUNÇÃO: Criar Novo Contato
export async function createContact(contactData: {
  name: string;
  email?: string;
  phone_number?: string;
  additional_attributes?: Record<string, any>;
  custom_attributes?: Record<string, any>;
}): Promise<ProxyResponse<ChatwootContact>> {
  console.log('👤 Criando novo contato...');
  
  const result = await callPhpProxy<ChatwootContact>('contacts', {}, {
    method: 'POST',
    body: JSON.stringify(contactData),
  });
  
  if (result.success) {
    console.log('✅ Contato criado com sucesso');
  } else {
    console.error('❌ Erro ao criar contato:', result.error);
  }
  
  return result;
}

// 🔄 FUNÇÃO: Atualizar Contato
export async function updateContact(
  contactId: number,
  contactData: Partial<{
    name: string;
    email: string;
    phone_number: string;
    additional_attributes: Record<string, any>;
    custom_attributes: Record<string, any>;
  }>
): Promise<ProxyResponse<ChatwootContact>> {
  console.log(`🔄 Atualizando contato ${contactId}...`);
  
  const result = await callPhpProxy<ChatwootContact>(`contacts/${contactId}`, {}, {
    method: 'PATCH',
    body: JSON.stringify(contactData),
  });
  
  if (result.success) {
    console.log('✅ Contato atualizado com sucesso');
  } else {
    console.error('❌ Erro ao atualizar contato:', result.error);
  }
  
  return result;
}

// 💬 FUNÇÃO: Obter Conversas de um Contato
export async function getContactConversations(contactId: number): Promise<ProxyResponse<ChatwootConversation[]>> {
  console.log(`💬 Buscando conversas do contato ${contactId}...`);
  
  const result = await callPhpProxy<ChatwootConversation[]>(`contacts/${contactId}/conversations`);
  
  if (result.success) {
    console.log('✅ Conversas do contato carregadas:', result.data?.length || 0);
  } else {
    console.error('❌ Erro ao carregar conversas do contato:', result.error);
  }
  
  return result;
}

// 🎯 FUNÇÕES UTILITÁRIAS PARA CONTATOS
export function formatContactStatus(status?: string | null): string {
  if (!status) return '⚪ Desconhecido';
  
  switch (status.toLowerCase()) {
    case 'online': return '🟢 Online';
    case 'offline': return '⚪ Offline';
    case 'away': return '🟡 Ausente';
    case 'busy': return '🔴 Ocupado';
    default: return '⚪ Desconhecido';
  }
}

export function getContactInitials(name?: string | null): string {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return '??';
  }
  
  return name
    .trim()
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function formatPhoneNumber(phone?: string | null): string {
  if (!phone || typeof phone !== 'string') return '';
  
  // Remove caracteres não numéricos
  const numbers = phone.replace(/\D/g, '');
  
  // Se não tem números, retorna vazio
  if (!numbers) return '';
  
  // Formato brasileiro: +55 (11) 99999-9999
  if (numbers.length === 13 && numbers.startsWith('55')) {
    const ddd = numbers.substring(2, 4);
    const firstPart = numbers.substring(4, 9);
    const secondPart = numbers.substring(9);
    return `+55 (${ddd}) ${firstPart}-${secondPart}`;
  }
  
  // Formato simples para outros casos
  return phone;
}

export function getTimeSinceLastActivity(timestamp?: number | null): string {
  if (!timestamp || typeof timestamp !== 'number' || timestamp <= 0) return 'Nunca';
  
  const now = Date.now();
  const lastActivity = timestamp * 1000;
  const diffInMinutes = (now - lastActivity) / (1000 * 60);
  
  if (diffInMinutes < 1) return 'Agora';
  if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}min atrás`;
  
  const diffInHours = diffInMinutes / 60;
  if (diffInHours < 24) return `${Math.floor(diffInHours)}h atrás`;
  
  const diffInDays = diffInHours / 24;
  if (diffInDays < 7) return `${Math.floor(diffInDays)}d atrás`;
  
  return new Date(lastActivity).toLocaleDateString('pt-BR');
}

// 🎯 EXPORTS ATUALIZADOS
export { 
  type ProxyResponse, 
  type ChatwootConversation, 
  type ChatwootMessage, 
  type ChatwootAgent,
  type ChatwootAttachment,
  type ChatwootApiResponse,
  type ChatwootContact,
  type ContactInbox,
  type ContactsApiResponse
};