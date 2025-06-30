import { useEffect, useState, useRef } from 'react';
import { 
  getConversationMessages, 
  sendMessageToConversation, 
  formatMessageType,
  type ChatwootMessage
} from '../../services/chatwootProxyService';

interface ChatwootMessagesProps {
  conversationId: number;
  onClose: () => void;
  conversationTitle: string;
}

export default function ChatwootMessages({ 
  conversationId, 
  onClose, 
  conversationTitle 
}: ChatwootMessagesProps) {
  const [messages, setMessages] = useState<ChatwootMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getConversationMessages(conversationId);
        
        if (result.success) {
          // Garantir que result.data seja sempre um array
          const messagesData = result.data;
          if (Array.isArray(messagesData)) {
            setMessages(messagesData);
          } else {
            console.warn('⚠️ Dados não são array:', messagesData);
            setMessages([]);
          }
          console.log('💬 Mensagens carregadas:', Array.isArray(messagesData) ? messagesData.length : 0);
        } else {
          setError(result.error || 'Erro ao carregar mensagens');
          console.error('❌ Erro ao carregar mensagens:', result.error);
          setMessages([]); // Resetar para array vazio em caso de erro
        }
      } catch (error) {
        const errorMessage = 'Não foi possível carregar as mensagens';
        setError(errorMessage);
        setMessages([]); // Resetar para array vazio em caso de erro
        console.error('❌ Erro inesperado:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [conversationId]);

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const messageToSend = newMessage.trim();
    
    try {
      const result = await sendMessageToConversation(conversationId, messageToSend);
      
      if (result.success) {
        console.log('✅ Mensagem enviada com sucesso');
        setNewMessage('');
        
        // Recarregar mensagens para mostrar a nova mensagem
        const messagesResult = await getConversationMessages(conversationId);
        if (messagesResult.success) {
          const messagesData = messagesResult.data;
          if (Array.isArray(messagesData)) {
            setMessages(messagesData);
          } else {
            console.warn('⚠️ Dados de reload não são array:', messagesData);
            setMessages([]);
          }
        }
      } else {
        setError(result.error || 'Erro ao enviar mensagem');
        console.error('❌ Erro ao enviar:', result.error);
      }
    } catch (error) {
      setError('Não foi possível enviar a mensagem');
      console.error('❌ Erro inesperado ao enviar:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const messageTime = timestamp * 1000;
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return new Date(messageTime).toLocaleDateString('pt-BR');
  };

  const isOutgoing = (messageType: number) => messageType === 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
        
        {/* Header com Gradient Moderno */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-xl">💬</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {conversationTitle}
                </h2>
                <p className="text-blue-100 text-sm">
                  Conversa #{conversationId} • {Array.isArray(messages) ? messages.length : 0} mensagens
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>
        </div>

        {/* Área de Mensagens */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="animate-spin h-12 w-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-blue-600 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-900">Carregando mensagens</p>
                  <p className="text-sm text-gray-500">Buscando histórico da conversa...</p>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 text-xl">⚠️</span>
                </div>
                <h3 className="text-red-800 font-semibold mb-2">Erro ao Carregar</h3>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <span className="mr-2">🔄</span>
                  Tentar Novamente
                </button>
              </div>
            </div>
          ) : !Array.isArray(messages) || messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📭</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Conversa Vazia</h3>
                <p className="text-gray-500">Seja o primeiro a enviar uma mensagem!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.isArray(messages) && messages.map((message, index) => (
                <div
                  key={message.id || index}
                  className={`flex ${
                    isOutgoing(message.message_type) ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-3 rounded-2xl shadow-sm ${
                      isOutgoing(message.message_type)
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    {/* Sender Info (only for incoming messages) */}
                    {!isOutgoing(message.message_type) && message.sender && (
                      <div className="flex items-center space-x-2 mb-2">
                        {message.sender.thumbnail ? (
                          <img
                            src={message.sender.thumbnail}
                            alt="sender"
                            className="w-5 h-5 rounded-full"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-xs text-gray-600">
                              {message.sender.name?.charAt(0) || '?'}
                            </span>
                          </div>
                        )}
                        <span className="text-xs font-medium text-gray-600">
                          {message.sender.name || 'Cliente'}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({message.sender.type})
                        </span>
                      </div>
                    )}

                    {/* Message Content */}
                    <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                      {message.content || message.processed_message_content || 'Mensagem sem conteúdo'}
                    </div>

                    {/* Timestamp and Status */}
                    <div className="flex items-center justify-between mt-2">
                      <div
                        className={`text-xs ${
                          isOutgoing(message.message_type)
                            ? 'text-blue-100'
                            : 'text-gray-500'
                        }`}
                      >
                        {formatTimeAgo(message.created_at)}
                      </div>
                      <div className="flex items-center space-x-2">
                        {message.status && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            isOutgoing(message.message_type)
                              ? 'bg-blue-400 bg-opacity-30 text-blue-100'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {message.status}
                          </span>
                        )}
                        <span
                          className={`text-xs ${
                            isOutgoing(message.message_type)
                              ? 'text-blue-200'
                              : 'text-gray-400'
                          }`}
                        >
                          {formatMessageType(message.message_type)}
                        </span>
                      </div>
                    </div>

                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.attachments.map((attachment, attachIndex) => (
                          <div key={attachment.id || attachIndex} className="flex items-center space-x-2">
                            {attachment.file_type === 'image' && attachment.thumb_url ? (
                              <img
                                src={attachment.thumb_url}
                                alt="Attachment"
                                className="w-20 h-20 rounded-lg object-cover cursor-pointer"
                                onClick={() => window.open(attachment.data_url, '_blank')}
                              />
                            ) : (
                              <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg">
                                <span className="text-sm">
                                  {attachment.file_type === 'image' ? '🖼️' : '📎'}
                                </span>
                                <div className="text-xs">
                                  <div className="font-medium">{attachment.file_type}</div>
                                  {attachment.file_size && (
                                    <div className="text-gray-500">
                                      {Math.round(attachment.file_size / 1024)}KB
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Message metadata */}
                    <div className="mt-2 text-xs opacity-70">
                      <div className="flex items-center space-x-2">
                        <span>ID: {message.id}</span>
                        {message.source_id && <span>• Source: {message.source_id}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Formulário de Resposta */}
        <div className="border-t border-gray-200 p-4 bg-white rounded-b-2xl">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem... (Enter para enviar)"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={2}
                disabled={sending}
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center space-x-2 ${
                !newMessage.trim() || sending
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {sending ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <span>📤</span>
                  <span>Enviar</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>💡 Pressione Enter para enviar rapidamente</span>
            <span>
              {newMessage.length}/1000 caracteres
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
