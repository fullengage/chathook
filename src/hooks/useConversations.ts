import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Conversation, ConversationFilters } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

export function useConversations(filters?: ConversationFilters) {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    loadConversations()
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('conversations')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'conversations',
          filter: buildRealtimeFilter()
        }, 
        () => {
          loadConversations()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, filters])

  const buildRealtimeFilter = () => {
    if (!user) return ''
    
    switch (user.role) {
      case 'superadmin':
        return ''
      case 'admin':
      case 'agent':
        return `account_id=eq.${user.account_id}`
      case 'client':
        return `client_id=eq.${user.id}`
      default:
        return ''
    }
  }

  const loadConversations = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('conversations')
        .select(`
          *,
          client:users!conversations_client_id_fkey(id, name, email, avatar_url),
          agent:users!conversations_agent_id_fkey(id, name, email, avatar_url)
        `)
        .order('last_message_at', { ascending: false })

      // Apply filters based on user role
      if (user.role === 'client') {
        query = query.eq('client_id', user.id)
      } else if (user.role === 'agent') {
        query = query
          .eq('account_id', user.account_id)
          .or(`agent_id.eq.${user.id},agent_id.is.null`)
      } else if (user.role === 'admin') {
        query = query.eq('account_id', user.account_id)
      }
      // superadmin sees all conversations

      // Apply additional filters
      if (filters) {
        if (filters.status && filters.status.length > 0) {
          query = query.in('status', filters.status)
        }
        if (filters.priority && filters.priority.length > 0) {
          query = query.in('priority', filters.priority)
        }
        if (filters.channel && filters.channel.length > 0) {
          query = query.in('channel', filters.channel)
        }
        if (filters.agent_id && filters.agent_id.length > 0) {
          query = query.in('agent_id', filters.agent_id)
        }
        if (filters.search) {
          query = query.ilike('subject', `%${filters.search}%`)
        }
        if (filters.date_from) {
          query = query.gte('created_at', filters.date_from)
        }
        if (filters.date_to) {
          query = query.lte('created_at', filters.date_to)
        }
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      setConversations(data || [])
    } catch (err: any) {
      console.error('Error loading conversations:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createConversation = async (conversationData: {
    subject: string
    priority?: string
    channel?: string
  }) => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          ...conversationData,
          client_id: user.role === 'client' ? user.id : undefined,
          account_id: user.account_id,
          status: 'open'
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      console.log('Conversa criada com sucesso!')
      loadConversations()
      return data
    } catch (err: any) {
      console.error('Error creating conversation:', err)
      throw err
    }
  }

  const updateConversation = async (id: number, updates: Partial<Conversation>) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update(updates)
        .eq('id', id)

      if (error) {
        throw error
      }

      console.log('Conversa atualizada com sucesso!')
      loadConversations()
    } catch (err: any) {
      console.error('Error updating conversation:', err)
      throw err
    }
  }

  const assignAgent = async (conversationId: number, agentId: number) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ agent_id: agentId })
        .eq('id', conversationId)

      if (error) {
        throw error
      }

      console.log('Agente atribuído com sucesso!')
      loadConversations()
    } catch (err: any) {
      console.error('Error assigning agent:', err)
      throw err
    }
  }

  const closeConversation = async (conversationId: number) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ status: 'closed' })
        .eq('id', conversationId)

      if (error) {
        throw error
      }

      console.log('Conversa encerrada com sucesso!')
      loadConversations()
    } catch (err: any) {
      console.error('Error closing conversation:', err)
      throw err
    }
  }

  return {
    conversations,
    loading,
    error,
    loadConversations,
    createConversation,
    updateConversation,
    assignAgent,
    closeConversation
  }
} 