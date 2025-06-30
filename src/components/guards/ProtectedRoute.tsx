import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

// Placeholder Navigate component
const Navigate = ({ to, replace }: { to: string; replace?: boolean }) => {
  React.useEffect(() => {
    window.location.href = to
  }, [to])
  return null
}

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('🚫 Usuário não autenticado, redirecionando para login')
    return <Navigate to={redirectTo} replace />
  }

  // Check role permissions if specified
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log('🚫 Papel não permitido:', user.role, 'Permitidos:', allowedRoles)
    
    // Redirect based on user role
    const roleRedirects: { [key: string]: string } = {
      superadmin: '/superadmin/dashboard',
      admin: '/admin/dashboard',
      agent: '/inbox',
      client: '/client/conversations'
    }
    
    return <Navigate to={roleRedirects[user.role] || '/dashboard'} replace />
  }

  console.log('✅ Acesso permitido para:', user.email, 'Papel:', user.role)
  return <>{children}</>
}

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: string[]
  fallback?: React.ReactNode
}

export function RoleGuard({
  children,
  allowedRoles,
  fallback = null
}: RoleGuardProps) {
  const { user } = useAuth()

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
} 