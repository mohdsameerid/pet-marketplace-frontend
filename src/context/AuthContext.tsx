'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, AuthResponse } from '@/types';
import { tokenUtils, userUtils } from '@/lib/utils/auth';
import { authApi } from '@/lib/api/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (response: AuthResponse) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (tokenUtils.isValid()) {
        try {
          const response = await authApi.getMe();
          setUser(response.data.data);
          userUtils.set(response.data.data);
        } catch {
          tokenUtils.remove();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      router.push('/login');
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [router]);

  const login = (response: AuthResponse) => {
    tokenUtils.set(response.token);
    const userData: User = {
      id: response.id,
      fullName: response.fullName,
      email: response.email,
      role: response.role as User['role'],
      isVerified: response.isVerified,
      createdAt: new Date().toISOString(),
    };
    setUser(userData);
    userUtils.set(userData);
  };

  const logout = () => {
    tokenUtils.remove();
    setUser(null);
    router.push('/');
  };

  const refreshUser = async () => {
    try {
      const response = await authApi.getMe();
      setUser(response.data.data);
      userUtils.set(response.data.data);
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
