/** Normalize to 10-digit Indian mobile (no country code). */
export function normalizeIndianMobile(input: string | null | undefined): string | null {
  if (!input) return null;
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length >= 12) {
    digits = digits.slice(2);
  }
  if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1);
  }
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return digits;
  }
  return null;
}

/** Keep only digits while typing; cap at 10 for national entry. */
export function formatIndianMobileInput(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length > 10) {
    digits = digits.slice(2);
  }
  if (digits.startsWith('0') && digits.length > 10) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
}
