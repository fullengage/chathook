import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// Tipos simples
interface User {
  id: number
  name: string
  email: string
  role: string
  account_id: number
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  // Verificar se já está logado
  useEffect(() => {
    const savedUser = localStorage.getItem('chatfull_user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        console.log('✅ Usuário recuperado do localStorage:', userData.email)
      } catch (error) {
        console.error('Erro ao recuperar usuário:', error)
        localStorage.removeItem('chatfull_user')
      }
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      console.log('🔐 Tentando fazer login com:', email)

      // BYPASS DIRETO - sem redirecionamento
      if (email === 'admin@test.com' && password === '123456') {
        const mockUser: User = {
          id: 2,
          name: 'Admin Teste',
          email: 'admin@test.com',
          role: 'admin',
          account_id: 1
        }

        // Salvar no estado e localStorage
        setUser(mockUser)
        localStorage.setItem('chatfull_user', JSON.stringify(mockUser))
        
        console.log('✅ LOGIN BYPASS REALIZADO COM SUCESSO!')
        console.log('🎯 Usuário logado:', mockUser)
        
        // Remover redirecionamento automático - deixar React Router gerenciar
        return
      }

      // Se não for o bypass, mostrar erro
      throw new Error('Use as credenciais: admin@test.com / 123456')
      
    } catch (error: any) {
      console.error('❌ Erro no login:', error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setUser(null)
    localStorage.removeItem('chatfull_user')
    // Redirecionar para login apenas no logout
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
} 