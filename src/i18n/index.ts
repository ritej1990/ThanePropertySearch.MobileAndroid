import type { AppLocale } from './types';
import { DEFAULT_LOCALE } from './types';
import { en } from './en';
import { mr } from './mr';

export type { AppLocale } from './types';
export { DEFAULT_LOCALE, SUPPORTED_LOCALES, isAppLocale, localeToCulture } from './types';

export type TranslationTable = typeof en;

const tables: Record<AppLocale, TranslationTable> = { en, mr };

type NestedKeyOf<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? NestedKeyOf<T[K], Prefix extends '' ? K : `${Prefix}.${K}`>
        : Prefix extends ''
          ? K
          : `${Prefix}.${K}`;
    }[keyof T & string]
  : never;

export type TranslationKey = NestedKeyOf<TranslationTable>;

function getNested(table: TranslationTable, key: string): string | undefined {
  const parts = key.split('.');
  let node: unknown = table;
  for (const part of parts) {
    if (node == null || typeof node !== 'object') return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === 'string' ? node : undefined;
}

export type TranslateParams = Record<string, string | number>;

export function translate(
  locale: AppLocale,
  key: TranslationKey,
  params?: TranslateParams
): string {
  const raw = getNested(tables[locale], key) ?? getNested(tables[DEFAULT_LOCALE], key) ?? key;
  if (!params) return raw;
  return raw.replace(/\{\{(\w+)\}\}/g, (_match: string, token: string) => {
    const value = params[token];
    return value != null ? String(value) : '';
  });
}

export type TranslateFn = (key: TranslationKey, params?: TranslateParams) => string;

export function createTranslator(locale: AppLocale): TranslateFn {
  return (key, params) => translate(locale, key, params);
}
