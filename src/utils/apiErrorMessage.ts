import { ApiError } from '../api/client';

type ProblemDetailsBody = {
  message?: string;
  error?: string;
  title?: string;
  errors?: Record<string, string[]>;
  retryAfterSeconds?: number;
};

/** User-facing message from API JSON error bodies. */
export function apiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof ApiError) {
    if (error.rawBody) {
      try {
        const body = JSON.parse(error.rawBody) as ProblemDetailsBody;
        const direct = body.message ?? body.error;
        if (direct) return direct;

        if (body.errors) {
          const fieldMessages = Object.entries(body.errors)
            .flatMap(([field, messages]) =>
              (messages ?? []).map((msg) => {
                if (field === 'request' && msg.toLowerCase().includes('required')) {
                  return null;
                }
                if (field.includes('visitAtLocal') || msg.includes('visitAtLocal')) {
                  return 'Enter a valid visit date and time.';
                }
                return msg;
              })
            )
            .filter((msg): msg is string => Boolean(msg));
          if (fieldMessages.length > 0) {
            return [...new Set(fieldMessages)].join('\n');
          }
        }

        if (body.title && body.title !== 'One or more validation errors occurred.') {
          return body.title;
        }
      } catch {
        /* use default */
      }
    }
    const raw = error.message?.trim();
    if (raw && !raw.startsWith('{')) return raw;
    return fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
