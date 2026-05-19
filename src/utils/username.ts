/** Sanitize for ASP.NET Identity username (letters, digits, _, .). */
export function sanitizeUsername(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9._]/g, '')
    .replace(/\.{2,}/g, '.')
    .replace(/^\.+|\.+$/g, '');
}

/** Local candidates from full name before API availability check. */
export function buildUsernameCandidatesFromFullName(fullName: string): string[] {
  const parts = fullName
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((p) => p.replace(/[^a-z0-9]/g, ''))
    .filter(Boolean);

  if (parts.length === 0) return [];

  const first = parts[0];
  const last = parts.length > 1 ? parts[parts.length - 1] : '';

  const candidates: string[] = [];
  if (first && last && first !== last) {
    candidates.push(`${first}.${last}`, `${first}${last}`, `${first}_${last}`);
  }
  if (first) {
    candidates.push(first);
  }

  return [...new Set(candidates.map(sanitizeUsername).filter((c) => c.length >= 3))];
}
