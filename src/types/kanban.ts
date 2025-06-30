export interface KanbanBoard {
  id: number;
  account_id: number;
  name: string;
  description?: string;
  is_default: boolean;
  visibility: 'team' | 'agents_only' | 'admins_only';
  background_color: string;
  is_active: boolean;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface KanbanColumn {
  id: number;
  board_id: number;
  account_id: number;
  name: string;
  description?: string;
  color: string;
  position: number;
  max_cards?: number;
  auto_assign_agent: boolean;
  is_final_stage: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConversationKanban {
  id: number;
  conversation_id: number;
  board_id: number;
  column_id: number;
  account_id: number;
  position: number;
  moved_by?: number;
  moved_at: string;
}

export interface KanbanLabel {
  id: number;
  account_id: number;
  name: string;
  color: string;
  board_id?: number;
  created_at: string;
}

export interface ConversationLabel {
  conversation_id: number;
  label_id: number;
  account_id: number;
  added_by?: number;
  added_at: string;
  label?: KanbanLabel;
}

export interface KanbanCard {
  id: number;
  conversation_id: number;
  subject: string;
  status: string;
  priority: string;
  channel: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  agent_id?: number;
  agent_name?: string;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  message_count: number;
  due_date?: string;
  labels: KanbanLabel[];
  estimated_time?: number;
  complexity: 'low' | 'medium' | 'high';
}

export interface KanbanFilters {
  search?: string;
  assignedTo?: number[];
  labels?: number[];
  priority?: string[];
  channel?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  dueDate?: {
    overdue: boolean;
    today: boolean;
    thisWeek: boolean;
  };
  customer?: string;
}

export interface DragState {
  isDragging: boolean;
  draggedCard?: KanbanCard;
  draggedFrom?: {
    columnId: number;
    position: number;
  };
  draggedOver?: {
    columnId: number;
    position: number;
  };
}

export interface KanbanState {
  boards: KanbanBoard[];
  currentBoard: KanbanBoard | null;
  columns: KanbanColumn[];
  cards: KanbanCard[];
  filters: KanbanFilters;
  dragState: DragState;
  loading: boolean;
  error: string | null;
}

export type KanbanAction = 
  | { type: 'LOAD_BOARD'; payload: { board: KanbanBoard; columns: KanbanColumn[]; cards: KanbanCard[] } }
  | { type: 'MOVE_CARD'; payload: { cardId: number; columnId: number; position: number } }
  | { type: 'ADD_FILTER'; payload: Partial<KanbanFilters> }
  | { type: 'UPDATE_CARD'; payload: KanbanCard }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'START_DRAG'; payload: { card: KanbanCard; from: { columnId: number; position: number } } }
  | { type: 'END_DRAG' }
  | { type: 'DRAG_OVER'; payload: { columnId: number; position: number } };

export interface ColumnMetrics {
  cardCount: number;
  avgTimeInColumn: number;
  oldestCard?: Date;
  wipLimit?: number;
  wipUtilization: number;
  throughput: {
    daily: number;
    weekly: number;
    monthly: number;
  };
} 