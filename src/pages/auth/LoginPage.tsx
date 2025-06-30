import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@test.com')
  const [password, setPassword] = useState('123456')
  const [error, setError] = useState('')
  
  const { signIn, user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      console.log('👤 Usuário já logado, redirecionando para dashboard...')
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos')
      return
    }

    try {
      setError('')
      console.log('🚀 Iniciando processo de login...')
      await signIn(email, password)
      
      console.log('✅ Login realizado, aguardando redirecionamento...')
      
    } catch (err: any) {
      console.error('❌ Falha no login:', err)
      setError(err.message || 'Erro ao fazer login')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <span className="text-white text-2xl">💬</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">ChatFull</h2>
          <p className="mt-2 text-gray-600">Sistema de Atendimento SaaS</p>
          <p className="mt-1 text-sm text-blue-600">Acesse o Kanban completo!</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-sm font-bold text-green-800 mb-2">✅ Login Direto Ativo</h3>
            <div className="text-sm text-green-700">
              <p><strong>Email:</strong> admin@test.com</p>
              <p><strong>Senha:</strong> 123456</p>
              <p className="mt-2 text-xs text-green-600">
                ⚡ Clique em "Entrar" para acessar o sistema!
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">❌ {error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Sua senha"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Entrando...
                </div>
              ) : (
                '🔓 Entrar no Sistema'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className="text-xs text-gray-500 space-y-1">
              <p>🎯 Sistema Kanban completo implementado</p>
              <p>📋 Drag & Drop funcional</p>
              <p>⚡ Interface moderna e responsiva</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © 2024 ChatFull SaaS - Sistema multiempresa completo
          </p>
        </div>
      </div>
    </div>
  )
} 