import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authApi, usersApi } from '../api/singleton';
import { ApiError } from '../api/client';
import { resetSessionExpiryGuard, notifySessionExpired } from '../auth/sessionManager';
import { resetEmailVerificationToastSession } from '../utils/emailVerificationSession';
import type { AuthResponse } from '../api/types';
import { normalizeAuthResponse } from '../utils/normalizeAuthResponse';
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
  loginWithOtp: (phoneNumber: string, otpCode: string) => Promise<AuthResponse>;
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
        let t = await expoTokenStorage.getAccessToken();
        let p = await loadAuthProfile();
        if (t) {
          try {
            await usersApi.getMe({ skipSessionExpiry: true });
          } catch (e) {
            if (e instanceof ApiError && e.status === 401) {
              await clearAuthSession();
              t = null;
              p = null;
            }
          }
        }
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

  const applyAuthSession = useCallback(async (raw: AuthResponse) => {
    const normalized = normalizeAuthResponse(raw);
    const accessToken = normalized.token.trim();
    if (!accessToken) {
      throw new Error('Login succeeded but no token was returned from the API.');
    }
    const snap = toProfile({ ...normalized, token: accessToken });
    await expoTokenStorage.setAccessToken(accessToken);
    await saveAuthProfile(snap);
    resetSessionExpiryGuard();
    setToken(accessToken);
    setProfile(snap);
    return { ...normalized, token: accessToken };
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      const res = await authApi.login({ username: username.trim(), password });
      return applyAuthSession(res);
    },
    [applyAuthSession]
  );

  const loginWithOtp = useCallback(
    async (phoneNumber: string, otpCode: string) => {
      const res = await authApi.verifyLoginOtp({
        phoneNumber,
        otpCode: otpCode.trim(),
      });
      return applyAuthSession(res);
    },
    [applyAuthSession]
  );

  const logout = useCallback(async () => {
    await clearAuthSession();
    resetEmailVerificationToastSession();
    resetSessionExpiryGuard();
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
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        notifySessionExpired();
      }
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
      loginWithOtp,
      logout,
      refreshProfile,
      patchProfile,
    }),
    [token, profile, ready, login, loginWithOtp, logout, refreshProfile, patchProfile]
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
