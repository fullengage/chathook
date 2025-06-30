import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Message, MessageFilters } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

export function useMessages(conversationId?: number, filters?: MessageFilters) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !conversationId) return

    loadMessages()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        () => {
          loadMessages()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, conversationId, filters])

  const loadMessages = async () => {
    if (!user || !conversationId) return

    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(id, name, email, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      // Filter internal messages for clients
      if (user.role === 'client') {
        query = query.eq('is_internal', false)
      }

      // Apply additional filters
      if (filters) {
        if (filters.sender_type && filters.sender_type.length > 0) {
          query = query.in('sender_type', filters.sender_type)
        }
        if (filters.message_type && filters.message_type.length > 0) {
          query = query.in('message_type', filters.message_type)
        }
        if (filters.is_internal !== undefined) {
          query = query.eq('is_internal', filters.is_internal)
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

      setMessages(data || [])
    } catch (err: any) {
      console.error('Error loading messages:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (messageData: {
    content: string
    message_type?: string
    file_url?: string
    file_name?: string
    file_size?: number
    is_internal?: boolean
  }) => {
    if (!user || !conversationId) return null

    try {
      const senderType = user.role === 'client' ? 'client' : 'agent'

      const { data, error } = await supabase
        .from('messages')
        .insert({
          ...messageData,
          conversation_id: conversationId,
          sender_id: user.id,
          sender_type: senderType,
          message_type: messageData.message_type || 'text',
          is_internal: messageData.is_internal || false
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      // Mark message as read for sender
      await markAsRead(data.id)

      return data
    } catch (err: any) {
      console.error('Error sending message:', err)
      throw err
    }
  }

  const markAsRead = async (messageId: number) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId)

      if (error) {
        throw error
      }
    } catch (err: any) {
      console.error('Error marking message as read:', err)
    }
  }

  const markAllAsRead = async () => {
    if (!user || !conversationId) return

    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)

      if (error) {
        throw error
      }

      loadMessages()
    } catch (err: any) {
      console.error('Error marking all messages as read:', err)
    }
  }

  const deleteMessage = async (messageId: number) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)

      if (error) {
        throw error
      }

      console.log('Mensagem excluída com sucesso!')
      loadMessages()
    } catch (err: any) {
      console.error('Error deleting message:', err)
      throw err
    }
  }

  const uploadFile = async (file: File) => {
    if (!user) return null

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `messages/${user.account_id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath)

      return {
        url: publicUrl,
        name: file.name,
        size: file.size
      }
    } catch (err: any) {
      console.error('Error uploading file:', err)
      throw err
    }
  }

  return {
    messages,
    loading,
    error,
    loadMessages,
    sendMessage,
    markAsRead,
    markAllAsRead,
    deleteMessage,
    uploadFile
  }
} 