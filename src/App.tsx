import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/guards/ProtectedRoute'
import { DashboardLayout } from './components/layout/DashboardLayout'

// Pages - usando imports corretos
import LoginPage from './pages/auth/LoginPage'
import { SuperAdminDashboard } from './pages/superadmin/SuperAdminDashboard'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import KanbanPage from './pages/kanban/KanbanPage'
import ChatwootPage from './pages/chatwoot/ChatwootPage'
import ConversationsPage from './pages/conversations/ConversationsPage'
import ContactsPage from './pages/contacts/ContactsPage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Routes */}
          <Route
            path="/superadmin/*"
            element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <DashboardLayout>
                  <Routes>
                    <Route path="dashboard" element={<SuperAdminDashboard />} />
                    <Route path="kanban" element={<KanbanPage />} />
                    <Route path="chatwoot" element={<ChatwootPage />} />
                    <Route path="conversations" element={<ConversationsPage />} />
                    <Route path="contacts" element={<ContactsPage />} />
                    <Route path="*" element={<Navigate to="/superadmin/dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="kanban" element={<KanbanPage />} />
                    <Route path="chatwoot" element={<ChatwootPage />} />
                    <Route path="conversations" element={<ConversationsPage />} />
                    <Route path="contacts" element={<ContactsPage />} />
                    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/kanban"
            element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin', 'agent']}>
                <DashboardLayout>
                  <KanbanPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/chatwoot"
            element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin', 'agent']}>
                <DashboardLayout>
                  <ChatwootPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/conversations"
            element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin', 'agent']}>
                <DashboardLayout>
                  <ConversationsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/contacts"
            element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin', 'agent']}>
                <DashboardLayout>
                  <ContactsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin', 'agent', 'client']}>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* 🚀 SISTEMA CHATFULL CUSTOMIZADO - ROTAS PROTEGIDAS */}
          <Route
            path="/chatfull/*"
            element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin', 'agent']}>
                <DashboardLayout>
                  <Routes>
                    <Route path="/" element={<ConversationsPage />} />
                    <Route path="dashboard" element={<ConversationsPage />} />
                    <Route path="conversas" element={<ConversationsPage />} />
                    <Route path="contatos" element={<ContactsPage />} />
                    <Route path="agentes" element={<ChatFullAgentsPage />} />
                    <Route path="atribuicoes" element={<ChatFullAssignmentsPage />} />
                    <Route path="relatorios" element={<ChatFullReportsPage />} />
                    <Route path="configuracoes" element={<ChatFullSettingsPage />} />
                    <Route path="*" element={<Navigate to="/chatfull/dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Default redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

// 👨‍💼 COMPONENTE: Página de Agentes
function ChatFullAgentsPage() {
  return (
    <div className="p-6">
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">👨‍💼</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Gestão de Agentes</h2>
        <p className="text-gray-600 mb-6">Página em desenvolvimento</p>
        <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-2xl mx-auto">
          <h3 className="font-semibold text-gray-900 mb-4">Funcionalidades Planejadas:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✅</span>
              <span className="text-sm">CRUD completo de agentes</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✅</span>
              <span className="text-sm">Gestão de permissões</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✅</span>
              <span className="text-sm">Status em tempo real</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✅</span>
              <span className="text-sm">Métricas de performance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 🎯 COMPONENTE: Sistema de Atribuições
function ChatFullAssignmentsPage() {
  return (
    <div className="p-6">
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🎯</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Sistema de Atribuições</h2>
        <p className="text-gray-600 mb-6">Configure as regras de distribuição de conversas</p>
        
        <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-3xl mx-auto">
          <h3 className="font-semibold text-gray-900 mb-4">Tipos de Atribuição Disponíveis:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">🔄 Round Robin</h4>
              <p className="text-sm text-gray-600">Distribui conversas igualmente entre agentes disponíveis</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">👑 Manual</h4>
              <p className="text-sm text-gray-600">Administrador escolhe o agente para cada conversa</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">⚡ Automática</h4>
              <p className="text-sm text-gray-600">Por disponibilidade e carga de trabalho</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">🎯 Por Skill</h4>
              <p className="text-sm text-gray-600">Baseada na especialidade do agente</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Implementado:</strong> Sistema de atribuição manual já disponível na lista de conversas!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 📊 COMPONENTE: Relatórios
function ChatFullReportsPage() {
  const [reportType, setReportType] = React.useState('conversas');
  const [dateRange, setDateRange] = React.useState('hoje');

  const handleDownloadReport = (format: string) => {
    // TODO: Implementar geração de relatórios
    console.log(`📊 Gerando relatório: ${reportType} | Período: ${dateRange} | Formato: ${format}`);
    alert(`Relatório "${reportType}" será gerado em ${format.toUpperCase()}! (Endpoint será implementado)`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Relatórios</h1>
          <p className="text-gray-600 mt-1">Gere relatórios detalhados do sistema</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurar Relatório</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Relatório
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="conversas">Conversas</option>
              <option value="agentes">Performance de Agentes</option>
              <option value="satisfacao">Satisfação do Cliente</option>
              <option value="tempo_resposta">Tempo de Resposta</option>
              <option value="resolucao">Taxa de Resolução</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="hoje">Hoje</option>
              <option value="ontem">Ontem</option>
              <option value="semana">Última Semana</option>
              <option value="mes">Último Mês</option>
              <option value="trimestre">Último Trimestre</option>
              <option value="ano">Último Ano</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center space-x-4">
          <button
            onClick={() => handleDownloadReport('csv')}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <span className="mr-2">📋</span>
            Baixar CSV
          </button>
          <button
            onClick={() => handleDownloadReport('xlsx')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="mr-2">📊</span>
            Baixar Excel
          </button>
          <button
            onClick={() => handleDownloadReport('pdf')}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <span className="mr-2">📄</span>
            Baixar PDF
          </button>
        </div>
      </div>

      {/* Relatórios Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-2">📈 Performance Hoje</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Conversas:</span>
              <span className="font-medium">45</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Resolvidas:</span>
              <span className="font-medium text-green-600">38</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Taxa Resolução:</span>
              <span className="font-medium">84%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-2">⏱️ Tempo Médio</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Primeira Resposta:</span>
              <span className="font-medium">3m 42s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Resolução:</span>
              <span className="font-medium">18m 15s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Satisfação:</span>
              <span className="font-medium text-green-600">92%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-2">👨‍💼 Agentes</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Online:</span>
              <span className="font-medium text-green-600">8</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ocupados:</span>
              <span className="font-medium text-yellow-600">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Disponíveis:</span>
              <span className="font-medium">5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ⚙️ COMPONENTE: Configurações
function ChatFullSettingsPage() {
  const [settings, setSettings] = React.useState({
    company_name: 'ChatFull Enterprise',
    support_email: 'suporte@chatfull.com.br',
    auto_assign: true,
    notifications: true,
    business_hours: true,
    satisfaction_survey: true
  });

  const handleSaveSettings = () => {
    // TODO: Implementar salvamento de configurações
    console.log('⚙️ Salvando configurações:', settings);
    alert('Configurações salvas com sucesso! (Endpoint será implementado)');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">⚙️ Configurações</h1>
          <p className="text-gray-600 mt-1">Configure o sistema ChatFull</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações da Empresa */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏢 Empresa</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Empresa
              </label>
              <input
                type="text"
                value={settings.company_name}
                onChange={(e) => setSettings({...settings, company_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email de Suporte
              </label>
              <input
                type="email"
                value={settings.support_email}
                onChange={(e) => setSettings({...settings, support_email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Configurações do Sistema */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 Sistema</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Atribuição Automática</h4>
                <p className="text-sm text-gray-600">Atribui conversas automaticamente</p>
              </div>
              <input
                type="checkbox"
                checked={settings.auto_assign}
                onChange={(e) => setSettings({...settings, auto_assign: e.target.checked})}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Notificações</h4>
                <p className="text-sm text-gray-600">Enviar notificações em tempo real</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Horário Comercial</h4>
                <p className="text-sm text-gray-600">Respeitar horário de funcionamento</p>
              </div>
              <input
                type="checkbox"
                checked={settings.business_hours}
                onChange={(e) => setSettings({...settings, business_hours: e.target.checked})}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Pesquisa de Satisfação</h4>
                <p className="text-sm text-gray-600">Enviar após resolução</p>
              </div>
              <input
                type="checkbox"
                checked={settings.satisfaction_survey}
                onChange={(e) => setSettings({...settings, satisfaction_survey: e.target.checked})}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span className="mr-2">💾</span>
          Salvar Configurações
        </button>
      </div>
    </div>
  );
}

export default App 