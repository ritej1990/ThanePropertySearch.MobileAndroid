export type AppLocale = 'en' | 'mr';

export const DEFAULT_LOCALE: AppLocale = 'en';

export const SUPPORTED_LOCALES: readonly AppLocale[] = ['en', 'mr'] as const;

export function isAppLocale(value: string | null | undefined): value is AppLocale {
  return value === 'en' || value === 'mr';
}

/** Maps app locale to Accept-Language / Google APIs (matches web culture codes). */
export function localeToCulture(locale: AppLocale): string {
  return locale === 'mr' ? 'mr-IN' : 'en-IN';
}
