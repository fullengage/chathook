import React, { useEffect, useState } from "react";
import ChatwootMessages from './ChatwootMessages';
import { getConversations, getAgents, updateConversationStatus, type ChatwootConversation, type ChatwootAgent, type ProxyResponse } from '../../services/chatwootProxyService';

export default function ConversasChatwootSimples() {
  const [conversas, setConversas] = useState<ChatwootConversation[]>([]);
  const [agentes, setAgentes] = useState<ChatwootAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<string>('all');
  const [busca, setBusca] = useState<string>('');
  
  // Estados para modal de mensagens
  const [selectedConversation, setSelectedConversation] = useState<ChatwootConversation | null>(null);
  const [showMessages, setShowMessages] = useState(false);
  
  // Estados para sistema de atribuições
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignConversation, setAssignConversation] = useState<ChatwootConversation | null>(null);

  const accountId = '1';

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    console.log('🔄 Carregando dados do Chatwoot...');
    setLoading(true);
    setError(null);

    try {
      const [conversasResult, agentesResult] = await Promise.all([
        getConversations(),
        getAgents()
      ]);

      if (conversasResult.success) {
        setConversas(conversasResult.data || []);
        console.log('✅ Conversas carregadas:', conversasResult.data?.length || 0);
      } else {
        throw new Error(`Erro ao carregar conversas: ${conversasResult.error}`);
      }

      if (agentesResult.success) {
        setAgentes(agentesResult.data || []);
        console.log('✅ Agentes carregados:', agentesResult.data?.length || 0);
      } else {
        console.warn('⚠️ Erro ao carregar agentes:', agentesResult.error);
      }

    } catch (err) {
      console.error('❌ Erro ao carregar dados:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleViewConversation = (conversa: ChatwootConversation) => {
    console.log('👁️ Abrindo conversa:', conversa);
    setSelectedConversation(conversa);
    setShowMessages(true);
  };

  const handleCloseMessages = () => {
    setShowMessages(false);
    setSelectedConversation(null);
  };

  // 🎯 NOVA FUNCIONALIDADE: Sistema de Atribuições
  const handleAssignConversation = (conversa: ChatwootConversation) => {
    setAssignConversation(conversa);
    setShowAssignModal(true);
  };

  const handleAssignToAgent = async (agentId: number) => {
    if (!assignConversation) return;

    try {
      // TODO: Implementar endpoint de atribuição
      console.log(`🎯 Atribuindo conversa ${assignConversation.id} para agente ${agentId}`);
      
      // Simula sucesso
      alert('Conversa atribuída com sucesso! (Endpoint será implementado)');
      
      setShowAssignModal(false);
      setAssignConversation(null);
      
      // Recarrega conversas para mostrar mudanças
      window.location.reload();
      
    } catch (error) {
      console.error('❌ Erro ao atribuir conversa:', error);
      alert('Erro ao atribuir conversa');
    }
  };

  const handleStatusChange = async (conversa: ChatwootConversation, newStatus: string) => {
    if (!['open', 'pending', 'resolved', 'closed'].includes(newStatus)) {
      console.error('❌ Status inválido:', newStatus);
      return;
    }

    try {
      console.log(`🔄 Alterando status da conversa ${conversa.id} para ${newStatus}...`);
      
      const result = await updateConversationStatus(conversa.id, newStatus as 'open' | 'pending' | 'resolved' | 'closed');
      
      if (result.success) {
        console.log('✅ Status alterado com sucesso');
        
        // Atualizar o estado local
        setConversas(prev => prev.map(c =>
          c.id === conversa.id ? { ...c, status: newStatus as 'open' | 'pending' | 'resolved' | 'closed' } : c
        ));
      } else {
        throw new Error(result.error || 'Erro ao alterar status');
      }
    } catch (err) {
      console.error('❌ Erro ao alterar status:', err);
      alert(`Erro ao alterar status: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      open: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-blue-100 text-blue-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return badges[status as keyof typeof badges] || badges.closed;
  };

  // Função para filtrar conversas
  const conversasFiltradas = conversas.filter(conversa => {
    const matchFiltro = filtro === 'all' || conversa.status === filtro;
    const matchBusca = busca === '' || 
      conversa.meta?.sender?.name?.toLowerCase().includes(busca.toLowerCase()) ||
      conversa.meta?.sender?.email?.toLowerCase().includes(busca.toLowerCase()) ||
      conversa.id.toString().includes(busca);
    
    return matchFiltro && matchBusca;
  });

  // Estatísticas das conversas
  const stats = {
    total: conversas.length,
    open: conversas.filter(c => c.status === 'open').length,
    pending: conversas.filter(c => c.status === 'pending').length,
    resolved: conversas.filter(c => c.status === 'resolved').length,
    closed: conversas.filter(c => c.status === 'closed').length,
  };

  // Estatísticas dos agentes
  const agentStats = {
    total: agentes.length,
    online: agentes.filter(a => a.availability_status === 'online').length,
    busy: agentes.filter(a => a.availability_status === 'busy').length,
    offline: agentes.filter(a => a.availability_status === 'offline').length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Carregando conversas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
        <h3 className="text-red-800 font-semibold mb-2">❌ Erro</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={carregarDados}
          className="bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200 transition-colors"
        >
          🔄 Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            💬 Conversas Chatwoot (Simples)
          </h2>
          <p className="text-gray-600 mt-1">
            Gerenciamento básico de conversas
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={carregarDados}
            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
          >
            🔄 Atualizar
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">
            {conversas.filter(c => c.status === 'open').length}
          </div>
          <div className="text-sm text-gray-600">Abertas</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-yellow-600">
            {conversas.filter(c => c.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pendentes</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">
            {conversas.filter(c => c.status === 'resolved').length}
          </div>
          <div className="text-sm text-gray-600">Resolvidas</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-gray-600">
            {conversas.filter(c => c.status === 'closed').length}
          </div>
          <div className="text-sm text-gray-600">Fechadas</div>
        </div>
      </div>

      {/* Lista de Conversas */}
      {conversas.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma conversa encontrada
          </h3>
          <p className="text-gray-500">
            As conversas aparecerão aqui quando estiverem disponíveis.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="divide-y divide-gray-200">
            {conversas.map((c) => (
              <div key={c.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header da Conversa */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-mono text-sm text-gray-500">#{c.id}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(c.status)}`}>
                        {c.status.toUpperCase()}
                      </span>
                      {c.inbox_id && (
                        <span className="text-sm text-gray-600">
                          📥 Inbox: {c.inbox_id}
                        </span>
                      )}
                    </div>

                    {/* Informações do Contato */}
                    <div className="mb-3">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        👤 {c.meta?.sender?.name || 'Contato sem nome'}
                      </h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        {c.meta?.sender?.email && (
                          <div>📧 {c.meta.sender.email}</div>
                        )}
                        {c.meta?.sender?.phone_number && (
                          <div>📱 {c.meta.sender.phone_number}</div>
                        )}
                      </div>
                    </div>

                    {/* Agente Atribuído */}
                    {c.meta?.assignee && (
                      <div className="mb-3">
                        <div className="text-sm text-gray-600">
                          👨‍💼 <span className="font-medium">{c.meta.assignee.name}</span> ({c.meta.assignee.role})
                        </div>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>⏰ Criada: {formatDate(c.created_at)}</div>
                      <div>📈 Última atividade: {formatDate(c.last_activity_at)}</div>
                    </div>

                    {/* Informações Adicionais */}
                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                      <span>💬 {c.messages?.length || 0} mensagens</span>
                      {c.unread_count > 0 && (
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded">
                          {c.unread_count} não lidas
                        </span>
                      )}
                      {c.can_reply && <span className="text-green-600">✅ Pode responder</span>}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-col gap-2 ml-6">
                    <select
                      value={c.status}
                      onChange={(e) => handleStatusChange(c, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="open">🟢 Aberta</option>
                      <option value="pending">🟡 Pendente</option>
                      <option value="resolved">🔵 Resolvida</option>
                      <option value="closed">⚫ Fechada</option>
                    </select>
                    
                    <button className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 transition-colors">
                      👁️ Ver Detalhes
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Informações dos Agentes */}
      {agentes.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            👥 Agentes Disponíveis ({agentes.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agentes.map((agente) => (
              <div key={agente.id} className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center gap-3">
                  {agente.thumbnail && (
                    <img
                      src={agente.thumbnail}
                      alt={agente.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">{agente.name}</div>
                    <div className="text-sm text-gray-600">{agente.role}</div>
                    <div className="text-xs text-gray-500">{agente.availability_status}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rodapé */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <div className="text-center text-sm text-gray-600">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Sistema conectado via proxy PHP</span>
          </div>
          <div className="mt-2">
            Total de conversas: {conversas.length} • Agentes: {agentes.length}
          </div>
        </div>
      </div>
    </div>
  );
} 