import React, { useState, useEffect } from 'react';
import { getStatistics, getAgents, getConversations, type ProxyResponse } from '../../services/chatwootProxyService';

interface DashboardStats {
  conversations: {
    total: number;
    open: number;
    pending: number;
    resolved: number;
    closed: number;
  };
  agents: {
    total: number;
    online: number;
    busy: number;
    offline: number;
  };
  metrics: {
    response_time_avg: number;
    resolution_time_avg: number;
    satisfaction_score: number;
    messages_today: number;
  };
}

export default function DashboardChatwoot() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Carregamento inicial e refresh automático
  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setError(null);
      
      // Carrega dados em paralelo
      const [conversationsResult, agentsResult, statsResult] = await Promise.all([
        getConversations(),
        getAgents(),
        getStatistics()
      ]);

      // Processa conversas
      let conversationStats = {
        total: 0,
        open: 0,
        pending: 0,
        resolved: 0,
        closed: 0
      };

      if (conversationsResult.success && conversationsResult.data) {
        conversationStats = conversationsResult.data.reduce((acc: any, conv: any) => {
          acc.total++;
          acc[conv.status] = (acc[conv.status] || 0) + 1;
          return acc;
        }, { total: 0, open: 0, pending: 0, resolved: 0, closed: 0 });
      }

      // Processa agentes
      let agentStats = {
        total: 0,
        online: 0,
        busy: 0,
        offline: 0
      };

      if (agentsResult.success && agentsResult.data) {
        agentStats = agentsResult.data.reduce((acc: any, agent: any) => {
          acc.total++;
          const status = agent.availability_status || 'offline';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, { total: 0, online: 0, busy: 0, offline: 0 });
      }

      // Métricas padrão (posteriormente virão dos endpoints)
      const metrics = {
        response_time_avg: statsResult.success ? statsResult.data?.response_time_avg || 0 : 0,
        resolution_time_avg: statsResult.success ? statsResult.data?.resolution_time_avg || 0 : 0,
        satisfaction_score: statsResult.success ? statsResult.data?.satisfaction_score || 0 : 0,
        messages_today: statsResult.success ? statsResult.data?.messages_today || 0 : 0,
      };

      setStats({
        conversations: conversationStats,
        agents: agentStats,
        metrics
      });

      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('❌ Erro ao carregar dashboard:', error);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
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
              <p className="font-medium text-gray-900">Carregando Dashboard</p>
              <p className="text-sm text-gray-500">Coletando métricas em tempo real...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header com Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            📊 Dashboard ChatFull
          </h1>
          <p className="text-gray-600 mt-1">
            Visão geral do sistema de atendimento
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
          </div>
          <button 
            onClick={loadDashboardData}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <span className={`mr-2 ${loading ? 'animate-spin' : ''}`}>🔄</span>
            {loading ? 'Atualizando...' : 'Atualizar'}
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

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Conversas Totais */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Conversas</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.conversations.total || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600">↗️</span>
            <span className="text-green-600 ml-1">Ativas hoje</span>
          </div>
        </div>

        {/* Agentes Online */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Agentes Online</p>
              <p className="text-3xl font-bold text-green-600">{stats?.agents.online || 0}</p>
              <p className="text-sm text-gray-500">de {stats?.agents.total || 0} total</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👨‍💼</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${stats?.agents.total ? (stats.agents.online / stats.agents.total) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Pendentes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversas Pendentes</p>
              <p className="text-3xl font-bold text-yellow-600">{stats?.conversations.pending || 0}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⏱️</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-yellow-600">⚠️</span>
            <span className="text-yellow-600 ml-1">Necessitam atenção</span>
          </div>
        </div>

        {/* Resolvidas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolvidas Hoje</p>
              <p className="text-3xl font-bold text-blue-600">{stats?.conversations.resolved || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-blue-600">📈</span>
            <span className="text-blue-600 ml-1">Taxa de resolução</span>
          </div>
        </div>
      </div>

      {/* Status das Conversas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Status das Conversas</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Abertas</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900">{stats?.conversations.open || 0}</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ 
                      width: `${stats?.conversations.total ? (stats.conversations.open / stats.conversations.total) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-700">Pendentes</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900">{stats?.conversations.pending || 0}</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ 
                      width: `${stats?.conversations.total ? (stats.conversations.pending / stats.conversations.total) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Resolvidas</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900">{stats?.conversations.resolved || 0}</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ 
                      width: `${stats?.conversations.total ? (stats.conversations.resolved / stats.conversations.total) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status dos Agentes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">👨‍💼 Status dos Agentes</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700">Online</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-green-600">{stats?.agents.online || 0}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-700">Ocupados</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-yellow-600">{stats?.agents.busy || 0}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                <span className="text-gray-700">Offline</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-600">{stats?.agents.offline || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Ações Rápidas</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all">
            <span className="text-2xl mb-2">💬</span>
            <span className="text-sm font-medium text-gray-700">Ver Conversas</span>
          </button>

          <button className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all">
            <span className="text-2xl mb-2">👨‍💼</span>
            <span className="text-sm font-medium text-gray-700">Gerenciar Agentes</span>
          </button>

          <button className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-all">
            <span className="text-2xl mb-2">🎯</span>
            <span className="text-sm font-medium text-gray-700">Atribuições</span>
          </button>

          <button className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-orange-500 hover:bg-orange-50 transition-all">
            <span className="text-2xl mb-2">📊</span>
            <span className="text-sm font-medium text-gray-700">Relatórios</span>
          </button>
        </div>
      </div>
    </div>
  );
} 