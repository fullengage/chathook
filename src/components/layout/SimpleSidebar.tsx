import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

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
    name: 'Contatos',
    icon: '👥',
    href: '/contacts',
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

export function SimpleSidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getVisibleItems = () => {
    if (!user?.role) return [];
    return sidebarItems.filter(item => item.roles.includes(user.role));
  };

  const isActive = (href: string) => {
    return location.pathname === href || (href !== '/dashboard' && location.pathname.startsWith(href));
  };

  const handleNavigation = (href: string, itemName: string) => {
    console.log(`🔗 Navegando para: ${itemName} (${href})`);
    navigate(href);
  };

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 h-full flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">💬</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">ChatFull</h1>
            <p className="text-xs text-gray-500">Sistema de Atendimento</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {getVisibleItems().map((item) => (
            <li key={item.name}>
              <button
                onClick={() => handleNavigation(item.href, item.name)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left
                  ${isActive(item.href) 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 text-sm">👤</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || 'Usuário'}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role || 'guest'}
            </p>
          </div>
          <button 
            onClick={() => handleNavigation('/settings', 'Configurações')}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="text-lg">⚙️</span>
          </button>
        </div>
      </div>
    </div>
  );
} 