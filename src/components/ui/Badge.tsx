import React from 'react'
import { cn } from '@/utils/cn'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full'
  
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800'
  }
  
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm'
  }

  return (
    <span
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  )
}

// Status-specific badges for conversations
interface StatusBadgeProps {
  status: 'open' | 'pending' | 'resolved' | 'closed'
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    open: { variant: 'primary' as const, label: 'Aberto' },
    pending: { variant: 'warning' as const, label: 'Pendente' },
    resolved: { variant: 'success' as const, label: 'Resolvido' },
    closed: { variant: 'default' as const, label: 'Fechado' }
  }

  const config = statusConfig[status]

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  )
}

interface PriorityBadgeProps {
  priority: 'low' | 'normal' | 'high' | 'urgent'
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const priorityConfig = {
    low: { variant: 'default' as const, label: 'Baixa' },
    normal: { variant: 'primary' as const, label: 'Normal' },
    high: { variant: 'warning' as const, label: 'Alta' },
    urgent: { variant: 'danger' as const, label: 'Urgente' }
  }

  const config = priorityConfig[priority]

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  )
} 