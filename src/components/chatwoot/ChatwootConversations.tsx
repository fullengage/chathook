import { useEffect, useState } from 'react';
import { 
  getConversations, 
  testConnection, 
  getStatusColor,
  getPriorityIcon,
  formatTimestamp,
  type ChatwootConversation
} from '../../services/chatwootProxyService';
import ChatwootMessages from './ChatwootMessages';

export default function ChatwootConversations() {
  const [conversations, setConversations] = useState<ChatwootConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [meta, setMeta] = useState<{
    mine_count: number;
    assigned_count: number;
    unassigned_count: number;
    all_count: number;
  } | null>(null);

  // Estados para modal de mensagens
  const [selectedConversation, setSelectedConversation] = useState<ChatwootConversation | null>(null);
  const [showMessages, setShowMessages] = useState(false);

  const loadConversations = async () => {
    console.log('🚀 Iniciando busca de conversas Chatwoot via proxy real...');
    setLoading(true);
    setError(null);
    
    try {
      const result = await getConversations(); 
      console.log('📦 Resultado do serviço proxy:', result);
      
      if (result.success) {
        const conversationsList = result.data || [];
        console.log('📋 Lista de conversas:', conversationsList);
        console.log('🔢 Total de conversas:', conversationsList.length);
        
        setConversations(Array.isArray(conversationsList) ? conversationsList : []);
        setMeta(result.meta || null);
      } else {
        throw new Error(result.error || 'Erro ao carregar conversas');
      }
    } catch (err) {
      console.error('❌ Erro ao buscar conversas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const testConnectionProxy = async () => {
    console.log('🔧 Testando conectividade via proxy real...');
    setTesting(true);
    setError(null);
    
    try {
      const result = await testConnection();
      console.log('✅ Teste de conectividade bem-sucedido:', result);
      
      if (result.success) {
        alert(`✅ Conexão com Chatwoot via PHP bem-sucedida!
        
📊 Sistema funcionando corretamente
        
Verifique o console para detalhes completos.`);
        
        await loadConversations();
      } else {
        throw new Error(result.error || 'Teste de conectividade falhou');
      }
    } catch (err) {
      console.error('❌ Teste de conectividade falhou:', err);
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`🔧 Teste de Conectividade: ${errorMsg}`);
    } finally {
      setTesting(false);
    }
  };

  const handleViewConversation = (conversation: ChatwootConversation) => {
    console.log('👁️ Abrindo conversa avançada:', conversation);
    setSelectedConversation(conversation);
    setShowMessages(true);
  };

  const handleCloseMessages = () => {
    setShowMessages(false);
    setSelectedConversation(null);
  };

  const getConversationTitle = (conversation: ChatwootConversation) => {
    const senderName = conversation.meta?.sender?.name || 'Sem nome';
    const status = conversation.status.toUpperCase();
    const assignee = conversation.meta?.assignee?.name || 'Não atribuído';
    return `${senderName} - ${status} - ${assignee}`;
  };

  useEffect(() => {
    loadConversations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        <span className="ml-2">Carregando conversas do Chatwoot via proxy real...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-medium">❌ Erro ao conectar com Chatwoot</h3>
        <p className="text-red-600 text-sm mt-1 mb-4">{error}</p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
          <h4 className="font-medium text-yellow-800 mb-2">🔍 Diagnóstico:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Verifique se o endpoint está acessível</li>
            <li>• Confirme se o CORS está configurado corretamente</li>
            <li>• Teste o endpoint diretamente: https://fullweb.com.br/chathook/chatwoot-proxy.php</li>
            <li>• Verifique se as credenciais Chatwoot estão corretas</li>
            <li>• ✅ <strong>Estrutura esperada:</strong> <code>{`{ data: { meta: {...}, payload: [...] } }`}</code></li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={testConnectionProxy}
            disabled={testing}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
          >
            {testing ? '🔄 Testando...' : '🔧 Testar Proxy Real'}
          </button>
          <button 
            onClick={loadConversations}
            disabled={loading}
            className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            🔄 Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            💬 Conversas Chatwoot (Endpoint Real) ✅
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {conversations.length} conversas encontradas
            </span>
            {meta && (
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                Total: {meta.all_count} | Atribuídas: {meta.assigned_count} | Não atribuídas: {meta.unassigned_count}
              </span>
            )}
            <button 
              onClick={testConnectionProxy}
              disabled={testing}
              className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 disabled:opacity-50"
            >
              {testing ? '🔄' : '🔧'} Testar
            </button>
            <button 
              onClick={loadConversations}
              disabled={loading}
              className="px-3 py-1 text-sm bg-gray-50 text-gray-600 rounded hover:bg-gray-100"
            >
              🔄 Atualizar
            </button>
          </div>
        </div>

        {conversations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            📭 Nenhuma conversa encontrada
            <p className="text-sm mt-2">O endpoint retornou um payload vazio</p>
            <button 
              onClick={testConnectionProxy}
              className="mt-3 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              🔍 Testar Conexão
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map(conv => (
              <div key={conv.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header da conversa */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-mono text-sm text-gray-500">#{conv.id}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(conv.status)}`}>
                        {conv.status.toUpperCase()}
                      </span>
                      <span className="text-lg">{getPriorityIcon(conv.priority)}</span>
                      {conv.meta?.channel && (
                        <span className="text-sm text-gray-600">
                          📱 {conv.meta.channel}
                        </span>
                      )}
                      <span className="text-sm text-gray-600">
                        📥 Inbox: {conv.inbox_id}
                      </span>
                      {conv.unread_count > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {conv.unread_count} não lidas
                        </span>
                      )}
                    </div>

                    {/* Informações do contato com avatar */}
                    <div className="flex items-center gap-3 mb-3">
                      {conv.meta?.sender?.thumbnail && (
                        <img
                          src={conv.meta.sender.thumbnail}
                          alt="Avatar do contato"
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          👤 {conv.meta?.sender?.name || 'Sem nome'}
                        </p>
                        <div className="text-sm text-gray-600 space-x-4">
                          {conv.meta?.sender?.email && <span>📧 {conv.meta.sender.email}</span>}
                          {conv.meta?.sender?.phone_number && <span>📱 {conv.meta.sender.phone_number}</span>}
                          {conv.meta?.sender?.identifier && <span>🆔 {conv.meta.sender.identifier}</span>}
                        </div>
                        <div className="text-xs text-gray-500">
                          Status: {conv.meta?.sender?.availability_status} | 
                          ID: {conv.meta?.sender?.id}
                        </div>
                      </div>
                    </div>

                    {/* Agente atribuído */}
                    {conv.meta?.assignee && (
                      <div className="flex items-center gap-2 mb-2">
                        {conv.meta.assignee.thumbnail && (
                          <img
                            src={conv.meta.assignee.thumbnail}
                            alt="Avatar do agente"
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        )}
                        <p className="text-sm text-gray-600">
                          👨‍💼 Atribuído para: {conv.meta.assignee.name} ({conv.meta.assignee.role})
                        </p>
                      </div>
                    )}

                    {/* Informações de tempo e estatísticas */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="space-x-4">
                        <span>⏰ Criada: {formatTimestamp(conv.created_at)}</span>
                        <span>📈 Última atividade: {formatTimestamp(conv.last_activity_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>💬 {conv.messages?.length || 0} mensagens</span>
                        {conv.waiting_since > 0 && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            ⏳ Aguardando {Math.floor((Date.now() / 1000 - conv.waiting_since) / 60)}min
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Informações adicionais */}
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                      <span>UUID: {conv.uuid}</span>
                      {conv.can_reply && <span className="text-green-600">✅ Pode responder</span>}
                      {conv.muted && <span className="text-red-600">🔇 Silenciado</span>}
                      {conv.snoozed_until && <span className="text-blue-600">😴 Soneca ativa</span>}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2 ml-4">
                    <button 
                      onClick={() => handleViewConversation(conv)}
                      className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                    >
                      👁️ Ver Mensagens
                    </button>
                    <button 
                      onClick={() => handleViewConversation(conv)}
                      className="px-3 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                    >
                      💬 Responder
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Resumo no rodapé com dados reais */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">🟢 Abertas: </span>
              <span>{conversations.filter(c => c.status === 'open').length}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">🟡 Pendentes: </span>
              <span>{conversations.filter(c => c.status === 'pending').length}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">🔵 Resolvidas: </span>
              <span>{conversations.filter(c => c.status === 'resolved').length}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">⚫ Fechadas: </span>
              <span>{conversations.filter(c => c.status === 'closed').length}</span>
            </div>
          </div>

          {/* Metadados da API */}
          {meta && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-700 mb-2">📊 Estatísticas da API:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Minhas: </span>
                  <span className="font-medium">{meta.mine_count}</span>
                </div>
                <div>
                  <span className="text-gray-600">Atribuídas: </span>
                  <span className="font-medium">{meta.assigned_count}</span>
                </div>
                <div>
                  <span className="text-gray-600">Não atribuídas: </span>
                  <span className="font-medium">{meta.unassigned_count}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total: </span>
                  <span className="font-medium">{meta.all_count}</span>
                </div>
              </div>
            </div>
          )}

          {/* Status da conexão */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
              <span className="text-green-800 font-medium text-sm">
                🟢 Conectado ao Endpoint Real: https://fullweb.com.br/chathook/chatwoot-proxy.php ✅
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Mensagens */}
      {showMessages && selectedConversation && (
        <ChatwootMessages
          conversationId={selectedConversation.id}
          onClose={handleCloseMessages}
          conversationTitle={getConversationTitle(selectedConversation)}
        />
      )}
    </>
  );
}
