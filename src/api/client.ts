import { API_BASE_URL } from '../config/env';
import type { TokenStorage } from '../storage/tokenStorage';

export type ApiRequestInit = RequestInit & {
  /** When false, do not attach Bearer token (default true). */
  auth?: boolean;
};

function joinUrl(base: string, path: string): string {
  const b = base.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

/**
 * Central HTTP helper — aligns with JWT Bearer used in ThanePropertySearch.Api (Program.cs).
 * Token lifetime ~4h (JwtTokenService); no refresh endpoint — re-login on 401.
 */
export function createApiClient(tokenStorage: TokenStorage) {
  async function request<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
    const url = joinUrl(API_BASE_URL, path);
    const headers = new Headers(init.headers);
    if (!headers.has('Content-Type') && init.body != null && !(init.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const useAuth = init.auth !== false;
    if (useAuth) {
      const token = await tokenStorage.getAccessToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    let res: Response;
    try {
      res = await fetch(url, { ...init, headers });
    } catch (err) {
      const baseHint = [
        `Network request failed for ${url}.`,
        `Current API base URL: ${API_BASE_URL}.`,
        'If using Expo Go on a physical phone, set EXPO_PUBLIC_API_BASE_URL to your computer LAN IP (for example: http://192.168.1.10:44396) and restart Expo.',
      ].join(' ');
      const message = err instanceof Error ? `${baseHint} Original error: ${err.message}` : baseHint;
      throw new Error(message);
    }

    const text = await res.text();
    const ct = res.headers.get('content-type') ?? '';
    const asJson = ct.includes('application/json') && text.length > 0;

    if (!res.ok) {
      let message = text || res.statusText;
      if (asJson) {
        try {
          const errBody = JSON.parse(text) as { message?: string; error?: string };
          message = errBody.message ?? errBody.error ?? message;
        } catch {
          /* keep raw */
        }
      }
      throw new ApiError(res.status, message, text);
    }

    if (!text) {
      return undefined as T;
    }

    if (asJson) {
      return JSON.parse(text) as T;
    }

    return text as unknown as T;
  }

  return {
    request,
    get: <T>(path: string, init?: ApiRequestInit) =>
      request<T>(path, { ...init, method: 'GET' }),
    post: <T>(path: string, body?: unknown, init?: ApiRequestInit) =>
      request<T>(path, {
        ...init,
        method: 'POST',
        body:
          body instanceof FormData
            ? body
            : body !== undefined
              ? JSON.stringify(body)
              : undefined,
      }),
    delete: <T>(path: string, init?: ApiRequestInit) =>
      request<T>(path, { ...init, method: 'DELETE' }),
  };
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly rawBody: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
