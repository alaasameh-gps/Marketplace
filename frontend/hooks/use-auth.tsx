'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import type { AppUser, Role } from '@/types';
import { ApiError } from '@/lib/api-client';
import * as authService from '@/services/auth';

interface AuthContextValue {
  user: AppUser | null;
  status: 'loading' | 'authenticated' | 'guest';
  isAuthenticated: boolean;
  hasRole: (roles: Role[]) => boolean;
  login: (email: string, password: string) => Promise<AppUser>;
  register: (input: authService.RegisterInput) => Promise<AppUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'guest'>('loading');

  const refreshUser = useCallback(async () => {
    try {
      const current = await authService.getMe();
      setUser(current);
      setStatus('authenticated');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setUser(null);
        setStatus('guest');
      } else {
        setStatus('guest');
      }
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const session = await authService.login({ email, password });
    setUser(session.user);
    setStatus('authenticated');
    return session.user;
  }, []);

  const register = useCallback(async (input: authService.RegisterInput) => {
    const result = await authService.register(input);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setStatus('guest');
  }, []);

  const hasRole = useCallback(
    (roles: Role[]) => (user ? roles.includes(user.role) : false),
    [user],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        isAuthenticated: status === 'authenticated' && !!user,
        hasRole,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}