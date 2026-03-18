'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi, setToken, removeToken, getToken } from '@/lib/api';

interface User {
  id: number;
  username: string;
  nickname: string;
  role: string;
  balance: string;
  bonus_balance: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { username: string; password: string; nickname: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, isLoading: true, isLoggedIn: false,
  login: async () => ({ success: false }), register: async () => ({ success: false }),
  logout: () => {}, refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user from token on page load
  useEffect(() => {
    const token = getToken();
    if (token) {
      authApi.me().then(res => {
        if (res.success && res.data) {
          setUser(res.data);
        } else {
          removeToken();
        }
        setIsLoading(false);
      }).catch(() => { removeToken(); setIsLoading(false); });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await authApi.login(username, password);
    if (res.success && res.data) {
      setToken(res.data.token);
      setUser(res.data.user);
      return { success: true };
    }
    return { success: false, error: res.error || 'Login failed' };
  }, []);

  const register = useCallback(async (data: { username: string; password: string; nickname: string; phone?: string }) => {
    const res = await authApi.register(data);
    if (res.success && res.data) {
      // Auto login after register
      const loginRes = await authApi.login(data.username, data.password);
      if (loginRes.success && loginRes.data) {
        setToken(loginRes.data.token);
        setUser(loginRes.data.user);
      }
      return { success: true };
    }
    return { success: false, error: res.error || 'Registration failed' };
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
    window.location.href = '/';
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await authApi.me();
    if (res.success && res.data) {
      setUser(res.data);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isLoggedIn: !!user, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
