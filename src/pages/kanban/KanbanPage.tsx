import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import KanbanBoard from '../../components/kanban/KanbanBoard';

const KanbanPage: React.FC = () => {
  const { user } = useAuth();

  // Para desenvolvimento, usar board padrão ID 1
  const boardId = 1;

  return (
    <div className="h-full flex flex-col">
      {/* Header da página */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">
              📋 Kanban
            </h1>
            
            {/* Breadcrumb */}
            <nav className="text-sm text-gray-500">
              <span>Dashboard</span>
              <span className="mx-2">›</span>
              <span className="text-gray-900">Kanban</span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Seletor de Board */}
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="1">Atendimento Geral</option>
              <option value="2">Suporte Técnico</option>
              <option value="3">Vendas</option>
            </select>

            {/* Ações do usuário */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>👤 {user?.name || 'Usuário'}</span>
              <span>•</span>
              <span className="capitalize">{user?.role || 'guest'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard boardId={boardId} />
      </div>
    </div>
  );
};

export default KanbanPage; 