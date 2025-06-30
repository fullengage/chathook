export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: number
          name: string
          email: string
          plan_id: number | null
          is_active: boolean
          billing_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          email: string
          plan_id?: number | null
          is_active?: boolean
          billing_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          email?: string
          plan_id?: number | null
          is_active?: boolean
          billing_status?: string
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: number
          auth_user_id: string | null
          account_id: number | null
          name: string
          email: string
          role: 'superadmin' | 'admin' | 'agent' | 'client'
          avatar_url: string | null
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          auth_user_id?: string | null
          account_id?: number | null
          name: string
          email: string
          role: 'superadmin' | 'admin' | 'agent' | 'client'
          avatar_url?: string | null
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          auth_user_id?: string | null
          account_id?: number | null
          name?: string
          email?: string
          role?: 'superadmin' | 'admin' | 'agent' | 'client'
          avatar_url?: string | null
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: number
          account_id: number | null
          client_id: number | null
          agent_id: number | null
          subject: string
          status: 'open' | 'pending' | 'resolved' | 'closed'
          priority: 'low' | 'normal' | 'high' | 'urgent'
          channel: 'whatsapp' | 'email' | 'chat' | 'phone'
          tags: string[]
          last_message_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          account_id?: number | null
          client_id?: number | null
          agent_id?: number | null
          subject: string
          status?: 'open' | 'pending' | 'resolved' | 'closed'
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          channel?: 'whatsapp' | 'email' | 'chat' | 'phone'
          tags?: string[]
          last_message_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          account_id?: number | null
          client_id?: number | null
          agent_id?: number | null
          subject?: string
          status?: 'open' | 'pending' | 'resolved' | 'closed'
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          channel?: 'whatsapp' | 'email' | 'chat' | 'phone'
          tags?: string[]
          last_message_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: number
          conversation_id: number | null
          sender_id: number | null
          sender_type: 'agent' | 'client' | 'system'
          content: string
          message_type: 'text' | 'image' | 'file' | 'audio'
          file_url: string | null
          file_name: string | null
          file_size: number | null
          is_internal: boolean
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: number
          conversation_id?: number | null
          sender_id?: number | null
          sender_type: 'agent' | 'client' | 'system'
          content: string
          message_type?: 'text' | 'image' | 'file' | 'audio'
          file_url?: string | null
          file_name?: string | null
          file_size?: number | null
          is_internal?: boolean
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          conversation_id?: number | null
          sender_id?: number | null
          sender_type?: 'agent' | 'client' | 'system'
          content?: string
          message_type?: 'text' | 'image' | 'file' | 'audio'
          file_url?: string | null
          file_name?: string | null
          file_size?: number | null
          is_internal?: boolean
          is_read?: boolean
          created_at?: string
        }
      }
      plans: {
        Row: {
          id: number
          name: string
          price: number
          max_users: number
          max_conversations: number
          features: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          price?: number
          max_users?: number
          max_conversations?: number
          features?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          price?: number
          max_users?: number
          max_conversations?: number
          features?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ratings: {
        Row: {
          id: number
          conversation_id: number | null
          client_id: number | null
          agent_id: number | null
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: number
          conversation_id?: number | null
          client_id?: number | null
          agent_id?: number | null
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          conversation_id?: number | null
          client_id?: number | null
          agent_id?: number | null
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
    }
  }
} 