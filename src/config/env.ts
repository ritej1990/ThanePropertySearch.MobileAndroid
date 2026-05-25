/**
 * Backend base URL (see `.env`):
 * - EXPO_PUBLIC_API_BASE_URL=https://tpsapi.azurewebsites.net
 *
 * `app.config.js` copies `.env` into `expo.extra` at `expo start` time.
 * Prefer Metro-inlined `EXPO_PUBLIC_*` so a `.env` edit + reload picks up
 * Azure without a stale manifest still pointing at a LAN IP.
 *
 * Physical devices cannot use localhost — that is the dev machine itself.
 */
import Constants from 'expo-constants';

type Extra = {
  apiBaseUrl?: string;
  mediaBaseUrl?: string;
  googleMapsApiKey?: string;
  webBaseUrl?: string;
};

const extra = Constants.expoConfig?.extra as Extra | undefined;

function readPublicEnv(key: string): string | undefined {
  if (typeof process === 'undefined') return undefined;
  const value = (process.env as Record<string, string | undefined>)[key];
  return value?.trim() || undefined;
}

const fromEnv = readPublicEnv('EXPO_PUBLIC_API_BASE_URL');
const fromExtra = extra?.apiBaseUrl?.trim();

export const API_BASE_URL = (fromEnv || fromExtra || 'https://localhost:44396').replace(
  /\/+$/,
  ''
);

const mediaFromEnv = readPublicEnv('EXPO_PUBLIC_MEDIA_BASE_URL');
const mediaFromExtra = extra?.mediaBaseUrl?.trim();

/** Base URL for /uploads and other static files (defaults to API host). */
export const MEDIA_BASE_URL = (
  mediaFromEnv || mediaFromExtra || API_BASE_URL
).replace(/\/+$/, '');

const mapsFromEnv = readPublicEnv('EXPO_PUBLIC_GOOGLE_MAPS_API_KEY');
const mapsFromExtra = extra?.googleMapsApiKey?.trim();

/** Google Maps Platform key — Places Autocomplete for property search (see `.env`). */
export const GOOGLE_MAPS_API_KEY = mapsFromEnv || mapsFromExtra || '';

export function hasGoogleMapsKey(): boolean {
  return GOOGLE_MAPS_API_KEY.length > 0;
}

const webFromEnv = readPublicEnv('EXPO_PUBLIC_WEB_BASE_URL');
const webFromExtra = extra?.webBaseUrl?.trim();

/** Public site host for Cashfree HTTPS return URLs (must match API Web:BaseUrl host). */
export const WEB_BASE_URL = (webFromEnv || webFromExtra || 'https://www.thaneflats.com').replace(
  /\/+$/,
  ''
);

if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log('[config] API_BASE_URL =', API_BASE_URL);
  // eslint-disable-next-line no-console
  console.log('[config] WEB_BASE_URL =', WEB_BASE_URL);
}

/** Bias autocomplete toward Thane district (matches thaneflats.com). */
export const THANE_MAP_CENTER = {
  latitude: 19.2183,
  longitude: 72.9781,
} as const;

export const DEFAULT_SEARCH_RADIUS_KM = 12;
