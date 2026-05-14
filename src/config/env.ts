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

type Extra = { apiBaseUrl?: string };

const extra = Constants.expoConfig?.extra as Extra | undefined;
const fromExtra = extra?.apiBaseUrl?.trim();
const fromEnv =
  typeof process !== 'undefined'
    ? (process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined)?.trim()
    : undefined;

export const API_BASE_URL = (fromExtra || fromEnv || 'https://localhost:44396').replace(/\/+$/, '');
