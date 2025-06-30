import React from 'react'
import { SimpleSidebar } from './SimpleSidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <SimpleSidebar />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
} 