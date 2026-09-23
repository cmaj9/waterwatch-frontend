import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { AuthUser } from '../types';
import { loginApi } from '../services/apiService';
import { mockUsers } from '../data/mockData';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<AuthUser>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('wl_auth_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem('wl_auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // 1. Try real login via Backend API (PostgreSQL + bcrypt)
      const authUser = await loginApi(email, password);
      setUser(authUser);
      localStorage.setItem('wl_auth_user', JSON.stringify(authUser));
      setIsLoading(false);
      return true;
    } catch (err: unknown) {
      console.warn('[AuthContext] Backend login attempt failed:', err);

      // Fallback: in case backend is temporarily unreachable
      const emailLower = email.toLowerCase().trim();
      const foundUser = mockUsers.find((u) => u.email.toLowerCase() === emailLower);
      if (foundUser && password === 'demo1234') {
        const authUser: AuthUser = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role,
          stationIds: foundUser.stationIds,
          phone: foundUser.phone,
          district: foundUser.district,
        };
        setUser(authUser);
        localStorage.setItem('wl_auth_user', JSON.stringify(authUser));
        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('wl_auth_user');
  }, []);

  const updateProfile = useCallback((data: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      localStorage.setItem('wl_auth_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
