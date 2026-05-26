/** User-facing message from API error body. */
export function parseApiErrorMessage(text: string, status: number): string {
  const trimmed = text?.trim();
  if (!trimmed) {
    return status === 401
      ? 'Invalid username or password.'
      : `Request failed (${status}).`;
  }

  try {
    const body = JSON.parse(trimmed) as {
      message?: string;
      title?: string;
      errors?: Record<string, string[]>;
    };
    if (body.message) return body.message;
    if (body.title && body.errors) {
      const first = Object.values(body.errors).flat()[0];
      return first ? `${body.title}: ${first}` : body.title;
    }
    if (body.title) return body.title;
  } catch {
    /* plain text e.g. "Invalid credentials." */
  }

  if (status === 401) {
    return trimmed.includes('credential') ? trimmed : 'Invalid username or password.';
  }

  return trimmed.length > 200 ? `${trimmed.slice(0, 200)}…` : trimmed;
}
