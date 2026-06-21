import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { AppLocale } from '../i18n/types';
import { DEFAULT_LOCALE, isAppLocale } from '../i18n/types';

export const APP_LOCALE_KEY = 'tps_app_locale';

function webStorageAvailable(): boolean {
  return Platform.OS === 'web' && typeof localStorage !== 'undefined';
}

export async function loadAppLocale(): Promise<AppLocale> {
  try {
    const raw = webStorageAvailable()
      ? localStorage.getItem(APP_LOCALE_KEY)
      : await SecureStore.getItemAsync(APP_LOCALE_KEY);
    return isAppLocale(raw) ? raw : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

export async function saveAppLocale(locale: AppLocale): Promise<void> {
  try {
    if (webStorageAvailable()) {
      localStorage.setItem(APP_LOCALE_KEY, locale);
      return;
    }
    await SecureStore.setItemAsync(APP_LOCALE_KEY, locale);
  } catch {
    /* ignore */
  }
}
