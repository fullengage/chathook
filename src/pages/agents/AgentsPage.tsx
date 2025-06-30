import React, { useState, useEffect } from 'react';
import { getAgents, type ChatwootAgent, type ProxyResponse } from '../../services/chatwootProxyService';

interface Agent extends ChatwootAgent {
  created_at?: string;
  last_activity?: string;
  conversations_count?: number;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getAgents();
      
      if (result.success) {
        setAgents(result.data || []);
        console.log('👨‍💼 Agentes carregados:', result.data?.length || 0);
      } else {
        setError(result.error || 'Erro ao carregar agentes');
      }
    } catch (error) {
      setError('Não foi possível carregar os agentes');
      console.error('❌ Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = () => {
    setSelectedAgent(null);
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEditAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDeleteAgent = async (agentId: number) => {
    if (!confirm('Tem certeza que deseja excluir este agente?')) return;

    // TODO: Implementar endpoint de exclusão
    console.log('🗑️ Excluindo agente:', agentId);
    alert('Funcionalidade de exclusão será implementada');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAgent(null);
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'busy': return 'Ocupado';
      case 'offline': return 'Offline';
      default: return 'Indeterminado';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'administrator': return 'bg-purple-100 text-purple-800';
      case 'agent': return 'bg-blue-100 text-blue-800';
      case 'supervisor': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'administrator': return 'Administrador';
      case 'agent': return 'Agente';
      case 'supervisor': return 'Supervisor';
      default: return role;
    }
  };

  // Filtrar agentes
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || agent.availability_status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Estatísticas dos agentes
  const stats = {
    total: agents.length,
    online: agents.filter(a => a.availability_status === 'online').length,
    busy: agents.filter(a => a.availability_status === 'busy').length,
    offline: agents.filter(a => a.availability_status === 'offline').length,
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="animate-spin h-12 w-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 bg-blue-600 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-900">Carregando Agentes</p>
              <p className="text-sm text-gray-500">Buscando informações dos agentes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            👨‍💼 Gestão de Agentes
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie os agentes e suas permissões
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={loadAgents}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <span className={`mr-2 ${loading ? 'animate-spin' : ''}`}>🔄</span>
            Atualizar
          </button>
          <button 
            onClick={handleCreateAgent}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="mr-2">➕</span>
            Novo Agente
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">⚠️</span>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.online}</div>
          <div className="text-sm text-green-700">Online</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.busy}</div>
          <div className="text-sm text-yellow-700">Ocupados</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{stats.offline}</div>
          <div className="text-sm text-gray-700">Offline</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os Status</option>
            <option value="online">Online</option>
            <option value="busy">Ocupado</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      {/* Lista de Agentes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Agentes ({filteredAgents.length})
          </h3>
        </div>

        {filteredAgents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agente encontrado</h3>
            <p className="text-gray-500 mb-4">Tente ajustar os filtros ou termos de busca</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAgents.map((agent) => (
              <div key={agent.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="relative">
                      {agent.thumbnail ? (
                        <img
                          src={agent.thumbnail}
                          alt={agent.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-lg">
                            {agent.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      
                      {/* Status Indicator */}
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(agent.availability_status)}`}></div>
                    </div>

                    {/* Informações */}
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="text-lg font-semibold text-gray-900">{agent.name}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(agent.role)}`}>
                          {getRoleText(agent.role)}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          agent.availability_status === 'online' ? 'bg-green-100 text-green-800' :
                          agent.availability_status === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {getStatusText(agent.availability_status)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <span>📧</span>
                          <span>{agent.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>🆔</span>
                          <span>ID: {agent.id}</span>
                        </div>
                        {agent.conversations_count && (
                          <div className="flex items-center space-x-1">
                            <span>💬</span>
                            <span>{agent.conversations_count} conversas</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleEditAgent(agent)}
                      className="inline-flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <span className="mr-1">✏️</span>
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDeleteAgent(agent.id)}
                      className="inline-flex items-center px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <span className="mr-1">🗑️</span>
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Criação/Edição */}
      {showModal && (
        <AgentModal
          agent={selectedAgent}
          isEditing={isEditing}
          onClose={handleCloseModal}
          onSave={() => {
            handleCloseModal();
            loadAgents();
          }}
        />
      )}
    </div>
  );
}

// Componente Modal para Criar/Editar Agente
function AgentModal({ 
  agent, 
  isEditing, 
  onClose, 
  onSave 
}: {
  agent: Agent | null;
  isEditing: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    name: agent?.name || '',
    email: agent?.email || '',
    role: agent?.role || 'agent',
    availability_status: agent?.availability_status || 'offline'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Implementar endpoints de criação/edição
    console.log(isEditing ? '✏️ Editando agente:' : '➕ Criando agente:', formData);
    
    alert(`Agente ${isEditing ? 'editado' : 'criado'} com sucesso! (Endpoint será implementado)`);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? '✏️ Editar Agente' : '➕ Novo Agente'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cargo
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="agent">Agente</option>
              <option value="supervisor">Supervisor</option>
              <option value="administrator">Administrador</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.availability_status}
              onChange={(e) => setFormData({ ...formData, availability_status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="online">Online</option>
              <option value="busy">Ocupado</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Salvar Alterações' : 'Criar Agente'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 