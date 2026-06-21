import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  createTranslator,
  type TranslateFn,
  type TranslationKey,
  type TranslateParams,
} from '../i18n';
import type { AppLocale } from '../i18n/types';
import { DEFAULT_LOCALE } from '../i18n/types';
import { setApiCulture } from '../api/localeHeader';
import { syncWebCulture } from '../services/cultureSync';
import { loadAppLocale, saveAppLocale } from '../storage/localeStorage';

type LocaleContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: TranslateFn;
  ready: boolean;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const stored = await loadAppLocale();
      if (cancelled) return;
      setLocaleState(stored);
      setApiCulture(stored);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setLocale = useCallback((next: AppLocale) => {
    setLocaleState(next);
    setApiCulture(next);
    void saveAppLocale(next);
    void syncWebCulture(next);
  }, []);

  const t = useMemo(() => createTranslator(locale), [locale]);

  const value = useMemo(
    () => ({ locale, setLocale, t, ready }),
    [locale, setLocale, t, ready]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return ctx;
}

/** Safe for modules that may render outside provider during boot. */
export function useOptionalLocale(): LocaleContextValue | null {
  return useContext(LocaleContext);
}

export function useTranslation() {
  const { t, locale } = useLocale();
  return { t, locale };
}

export type { TranslationKey, TranslateParams };
