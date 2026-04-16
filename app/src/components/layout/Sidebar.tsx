import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  Building2,
  CalendarClock,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'accounts', label: 'Accounts', icon: Building2 },
  { id: 'activities', label: 'Activities', icon: CalendarClock },
  { id: 'renewals', label: 'Renewals', icon: RefreshCw },
  { id: 'escalations', label: 'Escalations', icon: AlertTriangle },
  { id: 'expansion', label: 'Expansion', icon: TrendingUp },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ activeView, onViewChange, onLogout }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  return (
    <div
      className={cn(
        'relative flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CS</span>
            </div>
            <span className="font-semibold text-gray-900">Command</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-sm">CS</span>
          </div>
        )}
        
        {/* Collapse/Expand Button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-8 w-8 transition-all',
            collapsed && 'absolute -right-3 top-4 bg-white border border-gray-200 shadow-sm hover:bg-gray-100 z-50'
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  'flex items-center w-full gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  collapsed && 'justify-center px-2'
                )}
              >
                <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-blue-600')} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        {!collapsed && (
          <div className="flex items-center gap-2 mb-3">
            <Button variant="ghost" size="icon" className="h-9 w-9 relative">
              <Bell className="h-5 w-5 text-gray-500" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Search className="h-5 w-5 text-gray-500" />
            </Button>
          </div>
        )}
        
        {/* User Profile */}
        <div
          className={cn(
            'flex items-center gap-3 p-2 rounded-lg bg-gray-50',
            collapsed && 'justify-center'
          )}
        >
          <img
            src={user?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
            alt={user ? `${user.first_name} ${user.last_name}` : 'User'}
            className="w-8 h-8 rounded-full bg-white"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user ? `${user.first_name} ${user.last_name}` : 'User'}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role.replace('_', ' ') || 'User'}</p>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
            onClick={onLogout}
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
