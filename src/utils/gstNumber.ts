/** Matches web `GstNumberHelper` — optional 15-char GSTIN. */
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export function normalizeGst(value: string): string {
  return value.trim().toUpperCase().replace(/\s/g, '');
}

export function isValidOptionalGst(value: string): boolean {
  const n = normalizeGst(value);
  if (!n) return true;
  return GST_REGEX.test(n);
}
