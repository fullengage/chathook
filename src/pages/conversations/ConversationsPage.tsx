import React, { useState, useEffect } from 'react';
import { getConversations, getConversationMessages, type ChatwootConversation, type ChatwootMessage } from '../../services/chatwootProxyService';

const ConversationsPage: React.FC = () => {
  const [conversas, setConversas] = useState<ChatwootConversation[]>([]);
  const [conversaAtiva, setConversaAtiva] = useState<ChatwootConversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para carregar conversas
  const loadData = async () => {
    console.log('🔄 Carregando conversas...');
    setLoading(true);
    setError(null);

    try {
      const conversationsResult = await getConversations();
      console.log('📋 Resultado conversas:', conversationsResult);

      if (conversationsResult.success) {
        const conversationsData = conversationsResult.data || [];
        console.log('✅ Conversas carregadas:', conversationsData.length);
        
        // Debug das mensagens que já vêm nas conversas
        conversationsData.forEach((conv, index) => {
          console.log(`📱 Conversa ${index + 1} (ID: ${conv.id}):`, {
            id: conv.id,
            sender: conv.meta?.sender?.name,
            messagesIncluded: conv.messages?.length || 0,
            lastMessage: conv.last_non_activity_message?.content || 'Nenhuma'
          });
        });
        
        setConversas(conversationsData);
      } else {
        const errorMsg = conversationsResult.error || 'Erro ao carregar conversas';
        console.error('❌ Erro nas conversas:', errorMsg);
        throw new Error(errorMsg);
      }

    } catch (error) {
      console.error('❌ Erro crítico ao carregar dados:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao carregar dados';
      setError(errorMessage);
      setConversas([]);
      setConversaAtiva(null);
    } finally {
      setLoading(false);
    }
  };

  // Selecionar conversa - CORRIGIDO para usar mensagens existentes primeiro
  const selectConversation = async (conversa: ChatwootConversation) => {
    console.log('📱 Selecionando conversa:', conversa.id);
    console.log('📱 Mensagens já incluídas na conversa:', conversa.messages?.length || 0);
    
    // 1. PRIMEIRO: Usa as mensagens que já vêm com a conversa
    const mensagensIniciais = conversa.messages || [];
    console.log('📱 Mensagens iniciais encontradas:', mensagensIniciais);
    
    // Define a conversa ativa com as mensagens que já temos
    setConversaAtiva({
      ...conversa,
      messages: mensagensIniciais
    });
    
    // 2. SEGUNDO: Se há poucas mensagens, tenta buscar mais via API
    if (mensagensIniciais.length < 10) {
      setLoadingMessages(true);
      
      try {
        console.log('📱 Buscando mensagens adicionais para conversa:', conversa.id);
        const messagesResult = await getConversationMessages(conversa.id);
        console.log('📱 Resultado das mensagens adicionais:', messagesResult);
        
        if (messagesResult.success && Array.isArray(messagesResult.data) && messagesResult.data.length > 0) {
          console.log('✅ Mensagens adicionais encontradas:', messagesResult.data.length);
          
          // Combina mensagens existentes com as novas, removendo duplicatas por ID
          const todasMensagens = [...mensagensIniciais];
          messagesResult.data.forEach(newMsg => {
            if (!todasMensagens.find(existingMsg => existingMsg.id === newMsg.id)) {
              todasMensagens.push(newMsg);
            }
          });
          
          // Ordena por data de criação
          todasMensagens.sort((a, b) => a.created_at - b.created_at);
          
          setConversaAtiva({
            ...conversa,
            messages: todasMensagens
          });
          
          console.log('✅ Total de mensagens após merge:', todasMensagens.length);
        } else {
          console.log('ℹ️ Nenhuma mensagem adicional encontrada via API');
        }
      } catch (error) {
        console.error('❌ Erro ao carregar mensagens adicionais:', error);
        // Mantém as mensagens que já tínhamos
      } finally {
        setLoadingMessages(false);
      }
    }
  };

  // Função para pegar última mensagem - MELHORADA
  const getLastMessage = (conversa: ChatwootConversation): string => {
    // 1. Tenta usar last_non_activity_message se disponível
    if (conversa.last_non_activity_message?.content) {
      return conversa.last_non_activity_message.content;
    }
    
    // 2. Tenta usar a última mensagem do array messages
    if (conversa.messages && Array.isArray(conversa.messages) && conversa.messages.length > 0) {
      const lastMsg = conversa.messages[conversa.messages.length - 1];
      if (lastMsg.content) {
        return lastMsg.content;
      }
      if (lastMsg.attachments && lastMsg.attachments.length > 0) {
        return `📎 ${lastMsg.attachments[0].file_type}`;
      }
    }
    
    return 'Sem mensagens';
  };

  // Função para formatar timestamp
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 dias
      return date.toLocaleDateString('pt-BR', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando conversas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-4">❌ {error}</div>
          <div className="flex justify-center space-x-3">
            <button 
              onClick={loadData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Tentar Novamente
            </button>
            <button 
              onClick={async () => {
                try {
                  const response = await fetch('https://fullweb.com.br/chathook/chatwoot-proxy.php?endpoint=conversations');
                  const data = await response.json();
                  console.log('🧪 Teste direto do endpoint:', data);
                  const payloadCount = data?.data?.payload?.length || 0;
                  alert(`🧪 Teste direto:\nStatus: ${response.status}\nConversas: ${payloadCount}\nVerifique o console!`);
                } catch (error) {
                  console.error('❌ Erro no teste:', error);
                  alert('❌ Erro no teste: ' + error);
                }
              }}
              className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
            >
              🧪 Debug
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar de Conversas */}
      <aside className="w-80 border-r overflow-y-auto">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">Conversas ({conversas.length})</h2>
            <button 
              onClick={loadData}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Atualizar
            </button>
          </div>
        </div>
        
        {conversas.map(c => (
          <div
            key={c.id}
            className={`p-4 flex items-center cursor-pointer hover:bg-gray-100 border-b ${
              conversaAtiva?.id === c.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
            }`}
            onClick={() => selectConversation(c)}
          >
            <div className="w-12 h-12 rounded-full bg-gray-300 mr-3 flex items-center justify-center relative">
              {c.meta?.sender?.thumbnail ? (
                <img src={c.meta.sender.thumbnail} className="w-12 h-12 rounded-full object-cover" alt="" />
              ) : (
                <span className="text-lg font-medium text-gray-600">
                  {c.meta?.sender?.name?.[0]?.toUpperCase() || '?'}
                </span>
              )}
              {c.unread_count > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {c.unread_count}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div className="font-semibold text-sm truncate">
                  {c.meta?.sender?.name || 'Sem nome'}
                </div>
                <div className="text-xs text-gray-500 ml-2">
                  {formatTime(c.last_activity_at)}
                </div>
              </div>
              <div className="text-sm text-gray-600 truncate">
                {getLastMessage(c)}
              </div>
              <div className="flex items-center mt-1 space-x-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  c.status === 'open' ? 'bg-green-100 text-green-700' :
                  c.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {c.status}
                </span>
                {c.meta?.assignee && (
                  <span className="text-xs text-blue-600">
                    {c.meta.assignee.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </aside>

      {/* Painel Central de Mensagens */}
      <main className="flex-1 flex flex-col">
        {conversaAtiva ? (
          <>
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-300 mr-3 flex items-center justify-center">
                  {conversaAtiva.meta?.sender?.thumbnail ? (
                    <img src={conversaAtiva.meta.sender.thumbnail} className="w-10 h-10 rounded-full object-cover" alt="" />
                  ) : (
                    <span className="text-sm font-medium">
                      {conversaAtiva.meta?.sender?.name?.[0]?.toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-medium">{conversaAtiva.meta?.sender?.name || 'Conversa'}</div>
                  <div className="text-sm text-gray-500">
                    #{conversaAtiva.id} • {conversaAtiva.meta?.sender?.phone_number}
                    {loadingMessages && <span className="ml-2 text-blue-500">🔄 Carregando mensagens...</span>}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {Array.isArray(conversaAtiva.messages) && conversaAtiva.messages.length > 0 ? (
                conversaAtiva.messages.map(m => (
                  <div key={m.id} className={`flex ${m.sender_type === 'User' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                      m.sender_type === 'User' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-800'
                    }`}>
                      {m.content && (
                        <div className="mb-1">{m.content}</div>
                      )}
                      {m.attachments && m.attachments.length > 0 && (
                        <div className="mt-2">
                          {m.attachments.map(att => (
                            <div key={att.id}>
                              {att.file_type === 'image' ? (
                                <img 
                                  src={att.data_url} 
                                  className="max-w-full rounded-md cursor-pointer hover:opacity-90" 
                                  alt=""
                                  onClick={() => window.open(att.data_url, '_blank')}
                                />
                              ) : (
                                <a 
                                  href={att.data_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-300 hover:text-blue-100 underline"
                                >
                                  📎 {att.file_type} ({(att.file_size / 1024).toFixed(1)}KB)
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className={`text-xs mt-1 ${
                        m.sender_type === 'User' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(m.created_at)} • {m.sender?.name}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-2">💬</div>
                  <p>Nenhuma mensagem nesta conversa</p>
                  {loadingMessages && <p className="text-sm text-blue-500 mt-2">Carregando...</p>}
                </div>
              )}
            </div>
            
            {/* Caixa de resposta */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex space-x-2">
                <input 
                  className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Digite sua mensagem..." 
                />
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Enviar
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">💬</div>
              <p>Selecione uma conversa para começar</p>
            </div>
          </div>
        )}
      </main>

      {/* Painel de Detalhes */}
      <aside className="w-80 border-l p-6">
        {conversaAtiva && (
          <>
            <div className="text-center mb-6">
              {conversaAtiva.meta?.sender?.thumbnail ? (
                <img src={conversaAtiva.meta.sender.thumbnail} className="w-20 h-20 rounded-full mx-auto mb-4 object-cover" alt="" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-300 mx-auto mb-4 flex items-center justify-center text-2xl">
                  {conversaAtiva.meta?.sender?.name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <div className="font-bold">{conversaAtiva.meta?.sender?.name || 'Sem nome'}</div>
              <div className="text-gray-500">{conversaAtiva.meta?.sender?.phone_number}</div>
            </div>
            
            <div className="space-y-4 text-sm">
              <div className="bg-gray-50 p-3 rounded">
                <div className="font-semibold mb-2">Informações da Conversa</div>
                <div><strong>Status:</strong> <span className="capitalize">{conversaAtiva.status}</span></div>
                <div><strong>ID:</strong> #{conversaAtiva.id}</div>
                <div><strong>Criada em:</strong> {formatTime(conversaAtiva.created_at)}</div>
                <div><strong>Última atividade:</strong> {formatTime(conversaAtiva.last_activity_at)}</div>
                <div><strong>Mensagens:</strong> {conversaAtiva.messages?.length || 0}</div>
              </div>
              
              {conversaAtiva.meta?.assignee && (
                <div className="bg-blue-50 p-3 rounded">
                  <div className="font-semibold mb-2">Agente Responsável</div>
                  <div className="flex items-center">
                    {conversaAtiva.meta.assignee.thumbnail && (
                      <img src={conversaAtiva.meta.assignee.thumbnail} className="w-8 h-8 rounded-full mr-2" alt="" />
                    )}
                    <div>
                      <div className="font-medium">{conversaAtiva.meta.assignee.name}</div>
                      <div className="text-xs text-gray-500">{conversaAtiva.meta.assignee.email}</div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <button 
                  className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  onClick={() => {
                    // TODO: Implementar resolver conversa
                    console.log('🔄 Resolvendo conversa:', conversaAtiva.id);
                  }}
                >
                  ✅ Resolver
                </button>
                <button 
                  className="w-full py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  onClick={() => {
                    // TODO: Implementar marcar como pendente
                    console.log('⏳ Marcando como pendente:', conversaAtiva.id);
                  }}
                >
                  ⏳ Pendente
                </button>
                <button 
                  className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  onClick={() => selectConversation(conversaAtiva)}
                >
                  🔄 Recarregar Mensagens
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
};

export default ConversationsPage;