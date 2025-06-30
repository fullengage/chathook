import React from 'react';
import { KanbanCard } from '../../types/kanban';

interface KanbanCardProps {
  card: KanbanCard;
  onDragStart: (card: KanbanCard, from: { columnId: number; position: number }) => void;
  onDragEnd: () => void;
  isDragging?: boolean;
  columnId: number;
  position: number;
}

const KanbanCardComponent: React.FC<KanbanCardProps> = ({
  card,
  onDragStart,
  onDragEnd,
  isDragging = false,
  columnId,
  position,
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    onDragStart(card, { columnId, position });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
      case 'normal':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'whatsapp':
        return '💬';
      case 'email':
        return '📧';
      case 'chat':
        return '💭';
      case 'phone':
        return '📞';
      default:
        return '💬';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `há ${diffInMinutes}min`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `há ${hours}h`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `há ${days}d`;
    }
  };

  const isOverdue = card.due_date && new Date(card.due_date) < new Date();

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      className={`
        bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 cursor-move
        hover:shadow-md transition-shadow duration-200 select-none
        ${isDragging ? 'opacity-50 transform rotate-2' : ''}
        ${isOverdue ? 'border-l-4 border-l-red-500' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Prioridade */}
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(card.priority)}`}>
            {card.priority === 'high' && '🔥'} {card.priority.toUpperCase()}
          </span>
          
          {/* Canal */}
          <span className="text-sm">
            {getChannelIcon(card.channel)} {card.channel}
          </span>
        </div>

        {/* ID do ticket */}
        <span className="text-xs text-gray-500 font-mono">
          #{card.conversation_id}
        </span>
      </div>

      {/* Título */}
      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
        {card.subject}
      </h3>

      {/* Cliente */}
      <div className="mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">👤 {card.client_name}</span>
        </div>
        <div className="text-xs text-gray-500">
          📧 {card.client_email}
        </div>
        {card.client_phone && (
          <div className="text-xs text-gray-500">
            📱 {card.client_phone}
          </div>
        )}
      </div>

      {/* Etiquetas */}
      {card.labels && card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {card.labels.map((label) => (
            <span
              key={label.id}
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: label.color + '20',
                color: label.color,
                border: `1px solid ${label.color}40`,
              }}
            >
              🏷️ {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Agente atribuído */}
      {card.agent_name && (
        <div className="mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>👨‍💼 Atribuído: {card.agent_name}</span>
          </div>
        </div>
      )}

      {/* Informações de tempo */}
      <div className="space-y-1 mb-3 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>⏰ Criado: {formatTimeAgo(card.created_at)}</span>
          {card.due_date && (
            <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
              📅 Vence: {isOverdue ? 'Atrasado' : formatTimeAgo(card.due_date)}
            </span>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>💬 {card.message_count} mensagens</span>
        {card.estimated_time && (
          <span>⏱️ {card.estimated_time}min estimado</span>
        )}
        {card.complexity && (
          <span className={`px-1 rounded ${
            card.complexity === 'high' ? 'bg-red-100 text-red-600' :
            card.complexity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
            'bg-green-100 text-green-600'
          }`}>
            {card.complexity === 'high' ? '🔴' : card.complexity === 'medium' ? '🟡' : '🟢'}
          </span>
        )}
      </div>

      {/* Ações */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
        <button className="flex-1 px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
          👁️ Ver
        </button>
        <button className="flex-1 px-3 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors">
          💬 Responder
        </button>
        <button className="px-3 py-1 text-xs bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors">
          ✏️
        </button>
      </div>
    </div>
  );
};

export default KanbanCardComponent; 