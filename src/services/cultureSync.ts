import { WEB_BASE_URL } from '../config/env';
import type { AppLocale } from '../i18n/types';

/** Mirrors web `/Culture/Set?culture=en|mr` — best-effort cookie sync for shared accounts. */
export async function syncWebCulture(locale: AppLocale): Promise<void> {
  const url = `${WEB_BASE_URL}/Culture/Set?culture=${encodeURIComponent(locale)}&returnUrl=%2F`;
  try {
    await fetch(url, { method: 'GET', credentials: 'include' });
  } catch {
    /* offline / blocked — local UI locale still applies */
  }
}
