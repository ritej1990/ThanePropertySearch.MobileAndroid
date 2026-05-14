import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authApi } from '../api/singleton';
import type { AuthResponse } from '../api/types';
import {
  clearAuthSession,
  expoTokenStorage,
  loadAuthProfile,
  saveAuthProfile,
  type AuthProfileSnapshot,
} from '../storage/tokenStorage';

type AuthState = {
  /** Mirrors secure storage after hydrate; use for UI only — API reads token from SecureStore */
  token: string | null;
  profile: AuthProfileSnapshot | null;
  ready: boolean;
  login: (username: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

function toProfile(res: AuthResponse): AuthProfileSnapshot {
  return {
    role: res.role,
    fullName: res.fullName,
    username: res.username,
    email: res.email,
    userId: res.userId,
    emailConfirmed: res.emailConfirmed,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<AuthProfileSnapshot | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [t, p] = await Promise.all([
          expoTokenStorage.getAccessToken(),
          loadAuthProfile(),
        ]);
        if (cancelled) return;
        setToken(t);
        setProfile(p);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await authApi.login({ username: username.trim(), password });
    const snap = toProfile(res);
    await expoTokenStorage.setAccessToken(res.token);
    await saveAuthProfile(snap);
    setToken(res.token);
    setProfile(snap);
    return res;
  }, []);

  const logout = useCallback(async () => {
    await clearAuthSession();
    setToken(null);
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      profile,
      ready,
      login,
      logout,
    }),
    [token, profile, ready, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
