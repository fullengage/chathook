import { useReducer, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  KanbanState, 
  KanbanAction, 
  KanbanBoard, 
  KanbanColumn, 
  KanbanCard,
  KanbanFilters 
} from '../types/kanban';

const initialState: KanbanState = {
  boards: [],
  currentBoard: null,
  columns: [],
  cards: [],
  filters: {},
  dragState: {
    isDragging: false,
  },
  loading: false,
  error: null,
};

function kanbanReducer(state: KanbanState, action: KanbanAction): KanbanState {
  switch (action.type) {
    case 'LOAD_BOARD':
      return {
        ...state,
        currentBoard: action.payload.board,
        columns: action.payload.columns,
        cards: action.payload.cards,
        loading: false,
        error: null,
      };

    case 'MOVE_CARD':
      const { cardId, columnId, position } = action.payload;
      return {
        ...state,
        cards: state.cards.map(card => 
          card.id === cardId 
            ? { ...card, /* Atualizar posição */ }
            : card
        ),
      };

    case 'ADD_FILTER':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };

    case 'UPDATE_CARD':
      return {
        ...state,
        cards: state.cards.map(card =>
          card.id === action.payload.id ? action.payload : card
        ),
      };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'START_DRAG':
      return {
        ...state,
        dragState: {
          isDragging: true,
          draggedCard: action.payload.card,
          draggedFrom: action.payload.from,
        },
      };

    case 'END_DRAG':
      return {
        ...state,
        dragState: { isDragging: false },
      };

    case 'DRAG_OVER':
      return {
        ...state,
        dragState: {
          ...state.dragState,
          draggedOver: action.payload,
        },
      };

    default:
      return state;
  }
}

export function useKanban(boardId?: number) {
  const [state, dispatch] = useReducer(kanbanReducer, initialState);

  // Carregar board
  const loadBoard = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Dados mockados para desenvolvimento
      const mockBoard: KanbanBoard = {
        id: 1,
        account_id: 1,
        name: 'Atendimento Geral',
        description: 'Board principal para gerenciamento de tickets',
        is_default: true,
        visibility: 'team',
        background_color: '#f8f9fa',
        is_active: true,
        created_by: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockColumns: KanbanColumn[] = [
        {
          id: 1,
          board_id: 1,
          account_id: 1,
          name: '📥 Novos',
          description: 'Tickets recém-criados',
          color: '#8b5cf6',
          position: 1,
          auto_assign_agent: false,
          is_final_stage: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          board_id: 1,
          account_id: 1,
          name: '👀 Triagem',
          description: 'Em análise/classificação',
          color: '#06b6d4',
          position: 2,
          auto_assign_agent: true,
          is_final_stage: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 3,
          board_id: 1,
          account_id: 1,
          name: '🔄 Em Andamento',
          description: 'Sendo atendidos',
          color: '#f59e0b',
          position: 3,
          auto_assign_agent: false,
          is_final_stage: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 4,
          board_id: 1,
          account_id: 1,
          name: '⏳ Aguardando Cliente',
          description: 'Esperando resposta',
          color: '#6b7280',
          position: 4,
          auto_assign_agent: false,
          is_final_stage: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 5,
          board_id: 1,
          account_id: 1,
          name: '✅ Resolvidos',
          description: 'Finalizados com sucesso',
          color: '#10b981',
          position: 5,
          auto_assign_agent: false,
          is_final_stage: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const mockCards: KanbanCard[] = [
        {
          id: 1,
          conversation_id: 1,
          subject: 'Problema com pagamento PIX',
          status: 'open',
          priority: 'high',
          channel: 'whatsapp',
          client_name: 'João Silva',
          client_email: 'joao@email.com',
          client_phone: '+55 11 99999-9999',
          agent_id: 2,
          agent_name: 'Maria Santos',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h atrás
          updated_at: new Date().toISOString(),
          last_message_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          message_count: 3,
          due_date: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6h a partir de agora
          labels: [
            { id: 1, account_id: 1, name: 'Urgente', color: '#ef4444', created_at: new Date().toISOString() },
            { id: 6, account_id: 1, name: 'Pagamento', color: '#8b5cf6', created_at: new Date().toISOString() },
          ],
          complexity: 'medium',
        },
        {
          id: 2,
          conversation_id: 2,
          subject: 'Não consigo fazer login',
          status: 'open',
          priority: 'normal',
          channel: 'email',
          client_name: 'Ana Costa',
          client_email: 'ana@email.com',
          agent_id: 2,
          agent_name: 'Pedro Oliveira',
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
          last_message_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          message_count: 1,
          labels: [
            { id: 7, account_id: 1, name: 'Técnico', color: '#6b7280', created_at: new Date().toISOString() },
          ],
          complexity: 'low',
        },
        {
          id: 3,
          conversation_id: 3,
          subject: 'Sugestão de melhoria',
          status: 'pending',
          priority: 'low',
          channel: 'chat',
          client_name: 'Carlos Mendes',
          client_email: 'carlos@email.com',
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
          last_message_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          message_count: 2,
          labels: [
            { id: 5, account_id: 1, name: 'Sugestão', color: '#10b981', created_at: new Date().toISOString() },
          ],
          complexity: 'low',
        },
      ];

      dispatch({
        type: 'LOAD_BOARD',
        payload: {
          board: mockBoard,
          columns: mockColumns,
          cards: mockCards,
        },
      });

    } catch (error) {
      console.error('Error loading board:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Erro ao carregar board' 
      });
    }
  }, []);

  // Mover card
  const moveCard = useCallback(async (
    cardId: number, 
    targetColumnId: number, 
    position: number
  ) => {
    try {
      // Atualização otimista
      dispatch({
        type: 'MOVE_CARD',
        payload: { cardId, columnId: targetColumnId, position },
      });

      // TODO: Implementar chamada para API
      console.log('Moving card:', { cardId, targetColumnId, position });

    } catch (error) {
      console.error('Error moving card:', error);
      // Reverter mudança otimista se necessário
    }
  }, []);

  // Aplicar filtros
  const applyFilter = useCallback((filters: Partial<KanbanFilters>) => {
    dispatch({ type: 'ADD_FILTER', payload: filters });
  }, []);

  // Limpar filtros
  const clearFilters = useCallback(() => {
    dispatch({ type: 'ADD_FILTER', payload: {} });
  }, []);

  // Drag and Drop handlers
  const startDrag = useCallback((card: KanbanCard, from: { columnId: number; position: number }) => {
    dispatch({
      type: 'START_DRAG',
      payload: { card, from },
    });
  }, []);

  const endDrag = useCallback(() => {
    dispatch({ type: 'END_DRAG' });
  }, []);

  const dragOver = useCallback((columnId: number, position: number) => {
    dispatch({
      type: 'DRAG_OVER',
      payload: { columnId, position },
    });
  }, []);

  // Carregar board inicial
  useEffect(() => {
    if (boardId) {
      loadBoard(boardId);
    }
  }, [boardId, loadBoard]);

  // Filtrar cards baseado nos filtros aplicados
  const filteredCards = state.cards.filter(card => {
    const { filters } = state;

    // Filtro de busca
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        card.subject.toLowerCase().includes(searchLower) ||
        card.client_name?.toLowerCase().includes(searchLower) ||
        card.client_email?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Filtro por agente
    if (filters.assignedTo && filters.assignedTo.length > 0) {
      if (!card.agent_id || !filters.assignedTo.includes(card.agent_id)) {
        return false;
      }
    }

    // Filtro por prioridade
    if (filters.priority && filters.priority.length > 0) {
      if (!filters.priority.includes(card.priority)) {
        return false;
      }
    }

    // Filtro por canal
    if (filters.channel && filters.channel.length > 0) {
      if (!filters.channel.includes(card.channel)) {
        return false;
      }
    }

    return true;
  });

  return {
    state: { ...state, cards: filteredCards },
    loadBoard,
    moveCard,
    applyFilter,
    clearFilters,
    startDrag,
    endDrag,
    dragOver,
  };
} 