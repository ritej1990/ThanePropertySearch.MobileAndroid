import { ApiError } from '../api/client';

/** User-facing message from API JSON error bodies. */
export function apiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof ApiError) {
    if (error.rawBody) {
      try {
        const body = JSON.parse(error.rawBody) as {
          message?: string;
          error?: string;
          retryAfterSeconds?: number;
        };
        const msg = body.message ?? body.error;
        if (msg) return msg;
      } catch {
        /* use default */
      }
    }
    return error.message || fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
