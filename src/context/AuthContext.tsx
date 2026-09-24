import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { AuthUser } from '../types';
import { loginApi, registerCitizenApi } from '../services/apiService';
import { getLiffProfile } from '../services/liffService';
import { mockUsers } from '../data/mockData';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginAsCitizen: (guestName?: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<AuthUser>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      // 1. Check local storage first
      const saved = localStorage.getItem('wl_auth_user');
      if (saved) {
        try {
          setUser(JSON.parse(saved));
          setIsLoading(false);
          return;
        } catch {
          localStorage.removeItem('wl_auth_user');
        }
      }

      // 2. Try LIFF Auto-Authentication if inside LINE or LIFF
      try {
        const profile = await getLiffProfile();
        if (profile && profile.userId) {
          console.log('[AuthContext] Detected LIFF User:', profile.displayName, profile.userId);
          try {
            const citizen = await registerCitizenApi({
              lineUserId: profile.userId,
              displayName: profile.displayName || 'ผู้ใช้ LINE',
            });
            const citizenUser: AuthUser = {
              id: String(citizen.id || `citizen_${profile.userId.slice(-6)}`),
              name: profile.displayName || citizen.name || 'ประชาชนผู้ใช้งาน',
              email: citizen.email || `citizen_${profile.userId.slice(-6)}@waterwatch.local`,
              role: 'citizen',
              stationIds: citizen.stationIds || [],
              phone: citizen.phone || '',
              district: citizen.district || '',
              lineUserId: profile.userId,
            };
            setUser(citizenUser);
            localStorage.setItem('wl_auth_user', JSON.stringify(citizenUser));
            setIsLoading(false);
            return;
          } catch (apiErr) {
            console.warn('[AuthContext] Backend auto-register error, falling back to local citizen profile:', apiErr);
            const fallbackCitizen: AuthUser = {
              id: `citizen_${profile.userId.slice(-6)}`,
              name: profile.displayName || 'ประชาชนผู้ใช้งาน',
              email: `citizen_${profile.userId.slice(-6)}@waterwatch.local`,
              role: 'citizen',
              stationIds: [],
              phone: '',
              district: '',
              lineUserId: profile.userId,
            };
            setUser(fallbackCitizen);
            localStorage.setItem('wl_auth_user', JSON.stringify(fallbackCitizen));
            setIsLoading(false);
            return;
          }
        }
      } catch (liffErr) {
        console.warn('[AuthContext] LIFF initialization warning:', liffErr);
      }

      setIsLoading(false);
    }

    initAuth();
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

  const loginAsCitizen = useCallback((guestName?: string) => {
    const citizenUser: AuthUser = {
      id: 'citizen_guest',
      name: guestName || 'ประชาชนผู้ใช้งานทั่วไป',
      email: 'citizen@waterwatch.local',
      role: 'citizen',
      stationIds: [],
      phone: '',
      district: '',
    };
    setUser(citizenUser);
    localStorage.setItem('wl_auth_user', JSON.stringify(citizenUser));
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
    <AuthContext.Provider value={{ user, login, loginAsCitizen, logout, updateProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
