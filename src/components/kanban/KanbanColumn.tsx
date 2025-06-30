import React, { useState } from 'react';
import { KanbanColumn, KanbanCard } from '../../types/kanban';
import KanbanCardComponent from './KanbanCard';

interface KanbanColumnProps {
  column: KanbanColumn;
  cards: KanbanCard[];
  onCardDragStart: (card: KanbanCard, from: { columnId: number; position: number }) => void;
  onCardDragEnd: () => void;
  onCardDrop: (cardId: number, columnId: number, position: number) => void;
  draggedCard?: KanbanCard;
  isDraggedOver?: boolean;
}

const KanbanColumnComponent: React.FC<KanbanColumnProps> = ({
  column,
  cards,
  onCardDragStart,
  onCardDragEnd,
  onCardDrop,
  draggedCard,
  isDraggedOver = false,
}) => {
  const [draggedOverPosition, setDraggedOverPosition] = useState<number | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Calcular posição baseada na coordenada Y
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const cardHeight = 200; // Altura aproximada do card
    const position = Math.floor(y / cardHeight);
    
    setDraggedOverPosition(position);
  };

  const handleDragLeave = () => {
    setDraggedOverPosition(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (draggedCard) {
      const position = draggedOverPosition || cards.length;
      onCardDrop(draggedCard.id, column.id, position);
    }
    
    setDraggedOverPosition(null);
  };

  const getWipStatus = () => {
    const currentCount = cards.length;
    const maxCards = column.max_cards;
    
    if (!maxCards) return null;
    
    const percentage = (currentCount / maxCards) * 100;
    
    if (percentage >= 100) {
      return { color: 'text-red-600', bg: 'bg-red-100', text: 'Limite atingido' };
    } else if (percentage >= 80) {
      return { color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'Próximo do limite' };
    } else {
      return { color: 'text-green-600', bg: 'bg-green-100', text: 'Normal' };
    }
  };

  const wipStatus = getWipStatus();

  return (
    <div className="flex flex-col h-full min-w-80 max-w-80">
      {/* Cabeçalho da Coluna */}
      <div 
        className="p-4 rounded-t-lg border-b"
        style={{ 
          backgroundColor: column.color + '10',
          borderColor: column.color + '30' 
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">
            {column.name}
          </h3>
          
          {/* Contador de cards */}
          <div className="flex items-center gap-2">
            <span 
              className="px-2 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: column.color + '20',
                color: column.color,
              }}
            >
              {cards.length}
            </span>
            
            {/* Limite WIP */}
            {column.max_cards && (
              <span className={`px-2 py-1 rounded-full text-xs ${wipStatus?.bg} ${wipStatus?.color}`}>
                {cards.length}/{column.max_cards}
              </span>
            )}
          </div>
        </div>

        {/* Descrição */}
        {column.description && (
          <p className="text-sm text-gray-600 mb-2">
            {column.description}
          </p>
        )}

        {/* Indicadores */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {column.auto_assign_agent && (
            <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
              🤖 Auto-atribuição
            </span>
          )}
          
          {column.is_final_stage && (
            <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full">
              ✅ Estágio final
            </span>
          )}
          
          {wipStatus && wipStatus.color === 'text-red-600' && (
            <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full">
              🚫 {wipStatus.text}
            </span>
          )}
        </div>
      </div>

      {/* Área de Drop */}
      <div
        className={`
          flex-1 p-2 bg-gray-50 rounded-b-lg min-h-96 overflow-y-auto
          ${isDraggedOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Indicador de drop position */}
        {draggedOverPosition !== null && (
          <div 
            className="h-2 bg-blue-300 rounded-full mb-2 opacity-50"
            style={{ 
              marginTop: draggedOverPosition * 200 
            }}
          />
        )}

        {/* Lista de Cards */}
        <div className="space-y-2">
          {cards.map((card, index) => (
            <React.Fragment key={card.id}>
              {/* Drop zone antes do card */}
              {draggedOverPosition === index && (
                <div className="h-2 bg-blue-300 rounded-full opacity-50" />
              )}
              
              <KanbanCardComponent
                card={card}
                onDragStart={onCardDragStart}
                onDragEnd={onCardDragEnd}
                isDragging={draggedCard?.id === card.id}
                columnId={column.id}
                position={index}
              />
            </React.Fragment>
          ))}

          {/* Drop zone no final */}
          {draggedOverPosition === cards.length && (
            <div className="h-2 bg-blue-300 rounded-full opacity-50" />
          )}
        </div>

        {/* Mensagem quando vazio */}
        {cards.length === 0 && !isDraggedOver && (
          <div className="flex items-center justify-center h-32 text-gray-400">
            <div className="text-center">
              <div className="text-3xl mb-2">📭</div>
              <p className="text-sm">Nenhum ticket nesta coluna</p>
            </div>
          </div>
        )}

        {/* Mensagem de drop */}
        {isDraggedOver && (
          <div className="flex items-center justify-center h-32 text-blue-500">
            <div className="text-center">
              <div className="text-3xl mb-2">📤</div>
              <p className="text-sm font-medium">Solte o ticket aqui</p>
            </div>
          </div>
        )}
      </div>

      {/* Rodapé da Coluna */}
      <div className="p-3 bg-gray-100 rounded-b-lg border-t">
        <div className="flex items-center justify-between text-xs text-gray-500">
          {/* Estatísticas */}
          <div className="flex items-center gap-3">
            <span>⏱️ Tempo médio: 2.5h</span>
            <span>📈 Vazão: 5/dia</span>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2">
            <button 
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Adicionar ticket"
            >
              ➕
            </button>
            <button 
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Configurações da coluna"
            >
              ⚙️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanbanColumnComponent; 