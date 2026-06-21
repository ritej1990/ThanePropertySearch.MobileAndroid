import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const KEY = 'tps_email_verify_banner_dismissed';

function webStorageAvailable(): boolean {
  return Platform.OS === 'web' && typeof localStorage !== 'undefined';
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function readDismissed(): Promise<string[]> {
  try {
    const raw = webStorageAvailable()
      ? localStorage.getItem(KEY)
      : await SecureStore.getItemAsync(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((e): e is string => typeof e === 'string').map(normalizeEmail);
  } catch {
    return [];
  }
}

async function writeDismissed(emails: string[]): Promise<void> {
  const payload = JSON.stringify([...new Set(emails.map(normalizeEmail))]);
  try {
    if (webStorageAvailable()) {
      localStorage.setItem(KEY, payload);
      return;
    }
    await SecureStore.setItemAsync(KEY, payload);
  } catch {
    /* ignore */
  }
}

export async function isEmailVerifyBannerDismissed(email: string): Promise<boolean> {
  const list = await readDismissed();
  return list.includes(normalizeEmail(email));
}

export async function dismissEmailVerifyBanner(email: string): Promise<void> {
  const list = await readDismissed();
  const normalized = normalizeEmail(email);
  if (list.includes(normalized)) return;
  await writeDismissed([...list, normalized]);
}
