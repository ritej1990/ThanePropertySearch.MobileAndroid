import * as SecureStore from 'expo-secure-store';

export type TokenStorage = {
  getAccessToken: () => Promise<string | null>;
  setAccessToken: (token: string | null) => Promise<void>;
};

export const AUTH_TOKEN_KEY = 'tps_access_token';
export const AUTH_PROFILE_KEY = 'tps_auth_profile';

export type AuthProfileSnapshot = {
  role: string;
  fullName: string;
  username: string;
  email: string;
  userId: string;
  emailConfirmed: boolean;
};

/** Single instance — used by API client so every request reads the latest token from secure storage. */
export const expoTokenStorage: TokenStorage = {
  async getAccessToken() {
    try {
      return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    } catch {
      return null;
    }
  },
  async setAccessToken(token) {
    try {
      if (token) {
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
      } else {
        await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      }
    } catch {
      /* simulator / misconfig */
    }
  },
};

export async function saveAuthProfile(profile: AuthProfileSnapshot): Promise<void> {
  await SecureStore.setItemAsync(AUTH_PROFILE_KEY, JSON.stringify(profile));
}

export async function loadAuthProfile(): Promise<AuthProfileSnapshot | null> {
  try {
    const raw = await SecureStore.getItemAsync(AUTH_PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthProfileSnapshot;
  } catch {
    return null;
  }
}

export async function clearAuthProfile(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(AUTH_PROFILE_KEY);
  } catch {
    /* ignore */
  }
}

export async function clearAuthSession(): Promise<void> {
  await expoTokenStorage.setAccessToken(null);
  await clearAuthProfile();
}

/** In-memory fallback for tests or scripts without SecureStore */
export function createMemoryTokenStorage(): TokenStorage {
  let token: string | null = null;
  return {
    async getAccessToken() {
      return token;
    },
    async setAccessToken(t) {
      token = t;
    },
  };
}
