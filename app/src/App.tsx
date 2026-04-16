import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { ActivitiesProvider } from '@/hooks/useActivities';
import { AccountsProvider } from '@/hooks/useAccounts';
import { AuditLogProvider } from '@/hooks/useAuditLog';
import { Sidebar } from '@/components/layout/Sidebar';
import { Login } from '@/views/Login';
import { Dashboard } from '@/views/Dashboard';
import { Accounts } from '@/views/Accounts';
import { Activities } from '@/views/Activities';
import { Renewals } from '@/views/Renewals';
import { Escalations } from '@/views/Escalations';
import { Expansion } from '@/views/Expansion';
import { Reports } from '@/views/Reports';
import { Settings } from '@/views/Settings';
import { Toaster } from '@/components/ui/sonner';

function AppContent() {
  const [activeView, setActiveView] = useState('dashboard');
  const { isAuthenticated, login, logout } = useAuth();
  
  // Listen for navigation events from child components
  useEffect(() => {
    const handleNavigate = (event: CustomEvent<string>) => {
      setActiveView(event.detail);
    };
    
    window.addEventListener('navigate', handleNavigate as EventListener);
    
    return () => {
      window.removeEventListener('navigate', handleNavigate as EventListener);
    };
  }, []);

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'accounts':
        return <Accounts />;
      case 'activities':
        return <Activities />;
      case 'renewals':
        return <Renewals />;
      case 'escalations':
        return <Escalations />;
      case 'expansion':
        return <Expansion />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeView={activeView} onViewChange={setActiveView} onLogout={logout} />
      <main className="flex-1 overflow-auto">
        {renderView()}
      </main>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuditLogProvider>
        <AccountsProvider>
          <ActivitiesProvider>
            <AppContent />
          </ActivitiesProvider>
        </AccountsProvider>
      </AuditLogProvider>
    </AuthProvider>
  );
}

export default App;
