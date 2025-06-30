import React, { useState } from 'react';
import { useKanban } from '../../hooks/useKanban';
import { KanbanFilters } from '../../types/kanban';
import KanbanColumnComponent from './KanbanColumn';

interface KanbanBoardProps {
  boardId: number;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ boardId }) => {
  const {
    state,
    moveCard,
    applyFilter,
    clearFilters,
    startDrag,
    endDrag,
  } = useKanban(boardId);

  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { currentBoard, columns, cards, loading, error, dragState } = state;

  // Agrupar cards por coluna
  const getCardsForColumn = (columnId: number) => {
    return cards.filter(card => {
      // TODO: Implementar lógica real de posicionamento
      // Por enquanto, distribuir os cards mockados entre as colunas
      const cardPosition = card.id % columns.length;
      const columnPosition = columns.findIndex(col => col.id === columnId);
      return cardPosition === columnPosition;
    });
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    applyFilter({ search: term });
  };

  const handleFilterChange = (newFilters: Partial<KanbanFilters>) => {
    applyFilter(newFilters);
  };

  const handleCardDrop = (cardId: number, columnId: number, position: number) => {
    moveCard(cardId, columnId, position);
    endDrag();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando board...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">❌</div>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600">Board não encontrado</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Cabeçalho do Board */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              📋 {currentBoard.name}
            </h1>
            {currentBoard.description && (
              <p className="text-gray-600 text-sm mt-1">
                {currentBoard.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Estatísticas */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>📊 {cards.length} tickets</span>
              <span>📈 {columns.length} colunas</span>
              <span>👥 {new Set(cards.map(c => c.agent_id).filter(Boolean)).size} agentes</span>
            </div>

            {/* Ações */}
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              ➕ Novo Ticket
            </button>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="flex items-center gap-4">
          {/* Busca */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="🔍 Buscar tickets..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
          </div>

          {/* Filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            🏷️ Filtros
          </button>

          {/* Visualização */}
          <div className="flex items-center gap-1 border border-gray-300 rounded-lg">
            <button className="px-3 py-2 bg-blue-100 text-blue-700 rounded-l-lg">
              📋 Kanban
            </button>
            <button className="px-3 py-2 hover:bg-gray-50">
              📋 Lista
            </button>
            <button className="px-3 py-2 hover:bg-gray-50 rounded-r-lg">
              📅 Calendar
            </button>
          </div>

          {/* Configurações */}
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            ⚙️
          </button>
        </div>

        {/* Painel de Filtros Expandido */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Filtro por Agente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  👨‍💼 Agente
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="">Todos os agentes</option>
                  <option value="2">Maria Santos</option>
                  <option value="3">Pedro Oliveira</option>
                </select>
              </div>

              {/* Filtro por Prioridade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔥 Prioridade
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="">Todas</option>
                  <option value="high">Alta</option>
                  <option value="normal">Normal</option>
                  <option value="low">Baixa</option>
                </select>
              </div>

              {/* Filtro por Canal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📱 Canal
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="">Todos</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="chat">Chat</option>
                  <option value="phone">Telefone</option>
                </select>
              </div>

              {/* Filtro por Data */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📅 Período
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="">Todos</option>
                  <option value="today">Hoje</option>
                  <option value="week">Esta semana</option>
                  <option value="month">Este mês</option>
                  <option value="overdue">Atrasados</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {cards.length} tickets encontrados
                </span>
              </div>
              
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                🗑️ Limpar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Board Kanban */}
      <div className="flex-1 overflow-x-auto bg-gray-100">
        <div className="flex gap-4 p-4 min-w-max h-full">
          {columns
            .sort((a, b) => a.position - b.position)
            .map((column) => {
              const columnCards = getCardsForColumn(column.id);
              
              return (
                <KanbanColumnComponent
                  key={column.id}
                  column={column}
                  cards={columnCards}
                  onCardDragStart={startDrag}
                  onCardDragEnd={endDrag}
                  onCardDrop={handleCardDrop}
                  draggedCard={dragState.draggedCard}
                  isDraggedOver={dragState.draggedOver?.columnId === column.id}
                />
              );
            })}

          {/* Coluna para adicionar nova coluna */}
          <div className="min-w-80 max-w-80">
            <div className="h-full flex items-center justify-center bg-gray-200 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer">
              <div className="text-center text-gray-500">
                <div className="text-3xl mb-2">➕</div>
                <p className="text-sm font-medium">Adicionar Coluna</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé com Estatísticas */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-6">
            <span>⏱️ Lead time médio: 4.2h</span>
            <span>🔄 Cycle time médio: 2.1h</span>
            <span>📈 Throughput: 12 tickets/dia</span>
            <span>⚡ Flow efficiency: 65%</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Última atualização: há 2min</span>
            <button className="text-blue-600 hover:text-blue-800">
              📊 Ver relatório completo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard; 