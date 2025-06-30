export type UserRole = 'superadmin' | 'admin' | 'agent' | 'client'

export type ConversationStatus = 'open' | 'pending' | 'resolved' | 'closed'
export type ConversationPriority = 'low' | 'normal' | 'high' | 'urgent'
export type ConversationChannel = 'whatsapp' | 'email' | 'chat' | 'phone'

export type MessageType = 'text' | 'image' | 'file' | 'audio'
export type SenderType = 'agent' | 'client' | 'system'

export interface User {
  id: number
  auth_user_id: string | null
  account_id: number | null
  name: string
  email: string
  role: UserRole
  avatar_url: string | null
  is_active: boolean
  last_login: string | null
  created_at: string
  updated_at: string
}

export interface Account {
  id: number
  name: string
  email: string
  plan_id: number | null
  is_active: boolean
  billing_status: string
  created_at: string
  updated_at: string
}

export interface Plan {
  id: number
  name: string
  price: number
  max_users: number
  max_conversations: number
  features: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: number
  account_id: number | null
  client_id: number | null
  agent_id: number | null
  subject: string
  status: ConversationStatus
  priority: ConversationPriority
  channel: ConversationChannel
  tags: string[]
  last_message_at: string | null
  created_at: string
  updated_at: string
  client?: User
  agent?: User
}

export interface Message {
  id: number
  conversation_id: number | null
  sender_id: number | null
  sender_type: SenderType
  content: string
  message_type: MessageType
  file_url: string | null
  file_name: string | null
  file_size: number | null
  is_internal: boolean
  is_read: boolean
  created_at: string
  sender?: User
}

export interface Rating {
  id: number
  conversation_id: number | null
  client_id: number | null
  agent_id: number | null
  rating: number
  comment: string | null
  created_at: string
}

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  user_metadata: Record<string, any>
  app_metadata: Record<string, any>
}

export interface AuthContextType {
  user: User | null
  authUser: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: any) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
}

export interface DashboardStats {
  totalConversations: number
  openConversations: number
  resolvedConversations: number
  avgResponseTime: number
  totalUsers?: number
  totalAccounts?: number
  revenue?: number
}

export interface ConversationFilters {
  status?: ConversationStatus[]
  priority?: ConversationPriority[]
  channel?: ConversationChannel[]
  agent_id?: number[]
  search?: string
  date_from?: string
  date_to?: string
}

export interface MessageFilters {
  conversation_id?: number
  sender_type?: SenderType[]
  message_type?: MessageType[]
  is_internal?: boolean
  date_from?: string
  date_to?: string
} 