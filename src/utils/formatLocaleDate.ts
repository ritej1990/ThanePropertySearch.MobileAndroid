import type { AppLocale } from '../i18n/types';
import { localeToCulture } from '../i18n/types';

export function formatShortDate(iso: string, locale: AppLocale): string {
  return new Date(iso).toLocaleDateString(localeToCulture(locale), {
    day: 'numeric',
    month: 'short',
  });
}

export function formatLocaleDate(iso: string, locale: AppLocale): string {
  return new Date(iso).toLocaleDateString(localeToCulture(locale));
}
