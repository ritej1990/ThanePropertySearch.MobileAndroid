/**
 * Backend base URL (see `.env`):
 * - EXPO_PUBLIC_API_BASE_URL=https://192.168.x.x:44396
 *
 * `app.config.js` copies that into `expo.extra.apiBaseUrl` so the value is
 * available in Expo Go even when Metro's env injection looks stale.
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
const fromExtra = extra?.apiBaseUrl?.trim();
const fromEnv =
  typeof process !== 'undefined'
    ? (process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined)?.trim()
    : undefined;

export const API_BASE_URL = (fromExtra || fromEnv || 'https://localhost:44396').replace(
  /\/+$/,
  ''
);

const mediaFromExtra = extra?.mediaBaseUrl?.trim();
const mediaFromEnv =
  typeof process !== 'undefined'
    ? (process.env.EXPO_PUBLIC_MEDIA_BASE_URL as string | undefined)?.trim()
    : undefined;

/** Base URL for /uploads and other static files (defaults to API host). */
export const MEDIA_BASE_URL = (
  mediaFromEnv || mediaFromExtra || API_BASE_URL
).replace(/\/+$/, '');

const mapsFromExtra = extra?.googleMapsApiKey?.trim();
const mapsFromEnv =
  typeof process !== 'undefined'
    ? (process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY as string | undefined)?.trim()
    : undefined;

/** Google Maps Platform key — Places Autocomplete for property search (see `.env`). */
export const GOOGLE_MAPS_API_KEY = mapsFromEnv || mapsFromExtra || '';

export function hasGoogleMapsKey(): boolean {
  return GOOGLE_MAPS_API_KEY.length > 0;
}

const webFromExtra = extra?.webBaseUrl?.trim();
const webFromEnv =
  typeof process !== 'undefined'
    ? (process.env.EXPO_PUBLIC_WEB_BASE_URL as string | undefined)?.trim()
    : undefined;

/** Public site host for Cashfree HTTPS return URLs (must match API Web:BaseUrl host). */
export const WEB_BASE_URL = (webFromEnv || webFromExtra || 'https://www.thaneflats.com').replace(
  /\/+$/,
  ''
);

/** Bias autocomplete toward Thane district (matches thaneflats.com). */
export const THANE_MAP_CENTER = {
  latitude: 19.2183,
  longitude: 72.9781,
} as const;

export const DEFAULT_SEARCH_RADIUS_KM = 12;
