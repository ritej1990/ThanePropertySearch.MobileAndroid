import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authApi, usersApi } from '../api/singleton';
import { resetEmailVerificationToastSession } from '../utils/emailVerificationSession';
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
  refreshProfile: () => Promise<void>;
  patchProfile: (patch: Partial<AuthProfileSnapshot>) => Promise<void>;
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
    const raw = res as AuthResponse & { Token?: string };
    const accessToken = (raw.token ?? raw.Token ?? '').trim();
    if (!accessToken) {
      throw new Error('Login succeeded but no token was returned from the API.');
    }
    const normalized: AuthResponse = { ...res, token: accessToken };
    const snap = toProfile(normalized);
    await expoTokenStorage.setAccessToken(accessToken);
    await saveAuthProfile(snap);
    setToken(accessToken);
    setProfile(snap);
    return normalized;
  }, []);

  const logout = useCallback(async () => {
    await clearAuthSession();
    resetEmailVerificationToastSession();
    setToken(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const me = await usersApi.getMe();
      const snap: AuthProfileSnapshot = {
        role: me.role,
        fullName: me.fullName,
        username: me.username,
        email: me.email,
        userId: profile?.userId ?? '',
        emailConfirmed: me.emailConfirmed,
      };
      await saveAuthProfile(snap);
      setProfile(snap);
    } catch {
      /* keep cached profile */
    }
  }, [token, profile?.userId]);

  const patchProfile = useCallback(
    async (patch: Partial<AuthProfileSnapshot>) => {
      setProfile((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch };
        void saveAuthProfile(next);
        return next;
      });
    },
    []
  );

  const value = useMemo(
    () => ({
      token,
      profile,
      ready,
      login,
      logout,
      refreshProfile,
      patchProfile,
    }),
    [token, profile, ready, login, logout, refreshProfile, patchProfile]
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
