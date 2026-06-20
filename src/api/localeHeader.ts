import type { AppLocale } from '../i18n/types';
import { DEFAULT_LOCALE, localeToCulture } from '../i18n/types';

let currentLocale: AppLocale = DEFAULT_LOCALE;

export function setApiCulture(locale: AppLocale): void {
  currentLocale = locale;
}

export function getAppLocale(): AppLocale {
  return currentLocale;
}

export function getAcceptLanguageHeader(): string {
  return localeToCulture(currentLocale);
}

/** Google Places `language` param — `en` or `mr`. */
export function getGooglePlacesLanguage(): string {
  return currentLocale === 'mr' ? 'mr' : 'en';
}
