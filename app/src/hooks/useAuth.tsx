import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { users } from '@/data/sampleData';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((email: string, password: string): boolean => {
    // Demo authentication - check against sample users
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // In a real app, you'd hash and compare passwords
    // For demo, any password works for existing users
    if (foundUser && password.length > 0) {
      setUser(foundUser);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
