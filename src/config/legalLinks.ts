import { WEB_BASE_URL } from './env';

/** Public policy pages on thaneflats.com (same as website footer). */
export const LEGAL_LINKS = [
  { label: 'Legal', path: '/Home/Legal' },
  { label: 'Privacy', path: '/Home/Privacy' },
  { label: 'Terms', path: '/Home/Terms' },
  { label: 'Refund Policy', path: '/Home/RefundPolicy' },
] as const;

export function legalPageUrl(path: string): string {
  const base = WEB_BASE_URL.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

export const LEGAL_COPYRIGHT_YEAR = new Date().getFullYear();
