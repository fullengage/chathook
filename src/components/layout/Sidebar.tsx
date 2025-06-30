import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { Avatar } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'

// Simple SVG icons
const HomeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

const MessageSquareIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const BarChartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const BuildingIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
)

const CreditCardIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
)

const LogOutIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

interface SidebarItem {
  name: string;
  icon: string;
  href: string;
  roles: string[];
}

const sidebarItems: SidebarItem[] = [
  {
    name: 'Dashboard',
    icon: '📊',
    href: '/dashboard',
    roles: ['superadmin', 'admin', 'agent', 'client']
  },
  {
    name: 'Kanban',
    icon: '📋',
    href: '/kanban',
    roles: ['superadmin', 'admin', 'agent']
  },
  {
    name: 'Chatwoot',
    icon: '🤖',
    href: '/chatwoot',
    roles: ['superadmin', 'admin', 'agent']
  },
  {
    name: 'Conversas',
    icon: '💬',
    href: '/conversations',
    roles: ['superadmin', 'admin', 'agent', 'client']
  },
  {
    name: 'Clientes',
    icon: '👥',
    href: '/clients',
    roles: ['superadmin', 'admin', 'agent']
  },
  {
    name: 'Agentes',
    icon: '👨‍💼',
    href: '/agents',
    roles: ['superadmin', 'admin']
  },
  {
    name: 'Relatórios',
    icon: '📈',
    href: '/reports',
    roles: ['superadmin', 'admin']
  },
  {
    name: 'Configurações',
    icon: '⚙️',
    href: '/settings',
    roles: ['superadmin', 'admin']
  }
];

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const menuItems = [
    // 🏠 Dashboard Principal
    {
      icon: '🏠',
      label: 'Dashboard',
      path: '/dashboard',
      roles: ['superadmin', 'admin', 'agent', 'client']
    },
    
    // 🚀 SISTEMA CHATFULL CUSTOMIZADO
    {
      icon: '🚀',
      label: 'ChatFull',
      path: '/chatfull',
      roles: ['superadmin', 'admin', 'agent'],
      submenu: [
        { icon: '📊', label: 'Dashboard', path: '/chatfull/dashboard' },
        { icon: '💬', label: 'Conversas', path: '/chatfull/conversas' },
        { icon: '👨‍💼', label: 'Agentes', path: '/chatfull/agentes' },
        { icon: '🎯', label: 'Atribuições', path: '/chatfull/atribuicoes' },
        { icon: '📈', label: 'Relatórios', path: '/chatfull/relatorios' },
        { icon: '⚙️', label: 'Configurações', path: '/chatfull/configuracoes' },
      ]
    },

    // 📋 Kanban
    {
      icon: '📋',
      label: 'Kanban',
      path: '/kanban',
      roles: ['superadmin', 'admin', 'agent']
    },

    // 🤖 Chatwoot Original
    {
      icon: '🤖',
      label: 'Chatwoot Original',
      path: '/chatwoot',
      roles: ['superadmin', 'admin', 'agent']
    },

    // 👑 Admin
    {
      icon: '👑',
      label: 'Admin Dashboard',
      path: '/admin/dashboard',
      roles: ['superadmin', 'admin']
    },

    // 🔧 Super Admin
    {
      icon: '🔧',
      label: 'Super Admin',
      path: '/superadmin/dashboard',
      roles: ['superadmin']
    }
  ];

  const userRole = user?.role || 'client';

  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white h-screen flex flex-col shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold">🚀</span>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              ChatFull
            </h1>
            <p className="text-xs text-gray-400">Sistema de Atendimento</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.email || 'Usuário'}
            </p>
            <p className="text-xs text-gray-400 capitalize">
              {userRole}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {menuItems.map((item) => {
            // Check if user has permission for this menu item
            if (!item.roles.includes(userRole)) {
              return null;
            }

            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isMenuActive = isActive(item.path);

            return (
              <div key={item.path}>
                {/* Main Menu Item */}
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isMenuActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:transform hover:scale-105'
                  }`}
                >
                  <span className="text-lg group-hover:animate-pulse">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                  {hasSubmenu && (
                    <span className={`ml-auto text-xs transition-transform duration-200 ${
                      isMenuActive ? 'rotate-90' : ''
                    }`}>
                      ▶
                    </span>
                  )}
                </Link>

                {/* Submenu */}
                {hasSubmenu && isMenuActive && (
                  <div className="ml-6 mt-2 space-y-1 pl-4 border-l-2 border-blue-500">
                    {item.submenu!.map((subItem) => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                          location.pathname === subItem.path
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        <span className="text-sm">{subItem.icon}</span>
                        <span>{subItem.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Status/Stats Bar */}
      <div className="p-4 border-t border-gray-700">
        <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400">Sistema Online</span>
            </div>
            <span className="text-gray-400">v2.0</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Powered by <span className="text-blue-400 font-medium">ChatFull</span>
          </p>
          <p className="text-xs text-gray-600 mt-1">
            © 2024 Upgrade Chatwoot
          </p>
        </div>
      </div>
    </div>
  );
}

// SVG icon components available for future use 