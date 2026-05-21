import type { AuthResponse } from '../api/types';

/** Accept camelCase or PascalCase JSON from ASP.NET. */
export function normalizeAuthResponse(raw: unknown): AuthResponse {
  const o = (raw ?? {}) as Record<string, unknown>;
  return {
    token: String(o.token ?? o.Token ?? ''),
    fullName: String(o.fullName ?? o.FullName ?? ''),
    username: String(o.username ?? o.Username ?? ''),
    email: String(o.email ?? o.Email ?? ''),
    role: String(o.role ?? o.Role ?? 'User'),
    userId: String(o.userId ?? o.UserId ?? ''),
    emailConfirmed: Boolean(o.emailConfirmed ?? o.EmailConfirmed ?? false),
  };
}
