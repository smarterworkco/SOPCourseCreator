import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Org } from '@shared/schema';
import { AuthContextType, AuthState, isAdmin, isLearner } from '@/lib/auth';
import { apiRequest } from '@/lib/queryClient';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    org: null,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      
      if (response.ok) {
        const { user, org } = await response.json();
        setState(prev => ({ ...prev, user, org, isLoading: false }));
      } else {
        setState(prev => ({ ...prev, user: null, org: null, isLoading: false }));
      }
    } catch (error) {
      setState(prev => ({ ...prev, user: null, org: null, isLoading: false, error: 'Failed to check authentication' }));
    }
  };

  const login = async (email: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await apiRequest('POST', '/api/auth/login', { email });
      const { user, org } = await response.json();
      setState(prev => ({ ...prev, user, org, isLoading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
      setState({ user: null, org: null, isLoading: false, error: null });
    } catch (error) {
      // Even if logout fails, clear local state
      setState({ user: null, org: null, isLoading: false, error: null });
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    isAuthenticated: !!state.user,
    isAdmin: isAdmin(state.user),
    isLearner: isLearner(state.user)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
