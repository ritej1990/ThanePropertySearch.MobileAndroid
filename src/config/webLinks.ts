import { WEB_BASE_URL } from './env';

export function webUrl(path: string): string {
  const base = WEB_BASE_URL.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

/** Human-readable host for UI copy (e.g. localhost:7046 or www.thaneflats.com). */
export function webHostLabel(): string {
  try {
    return new URL(WEB_BASE_URL).host;
  } catch {
    return 'thaneflats.com';
  }
}

export const WEB_BUILDER_INDEX = webUrl('/Builder');
export const WEB_BUILDER_DASHBOARD = webUrl('/Builder/Dashboard');
export const WEB_BUILDER_PROJECT = (id: number) => webUrl(`/Builder/Details/${id}`);
export const WEB_PROPERTY_DETAIL = (id: number) => webUrl(`/Property/Details/${id}`);
export const WEB_FORGOT_PASSWORD = webUrl('/Account/ForgotPassword');