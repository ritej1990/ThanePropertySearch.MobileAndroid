const path = require('path');

// Load .env before Expo reads config so `extra` is set reliably (also helps Metro's EXPO_PUBLIC_* injection).
require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });

const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

/** @param {{ config: import('@expo/config-types').ExpoConfig }} ctx */
module.exports = ({ config }) => ({
  ...config,
  ios: {
    ...config.ios,
    infoPlist: {
      ...config.ios?.infoPlist,
      LSApplicationQueriesSchemes: [
        ...(config.ios?.infoPlist?.LSApplicationQueriesSchemes ?? []),
        'upi',
        'tez',
        'gpay',
        'paytmmp',
        'phonepe',
        'bhim',
        'credpay',
        'amazonpay',
      ],
    },
    config: {
      ...config.ios?.config,
      googleMapsApiKey,
    },
  },
  android: {
    ...config.android,
    config: {
      ...config.android?.config,
      googleMaps: {
        apiKey: googleMapsApiKey,
      },
    },
  },
  extra: {
    ...(config.extra || {}),
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    mediaBaseUrl:
      process.env.EXPO_PUBLIC_MEDIA_BASE_URL ||
      process.env.EXPO_PUBLIC_API_BASE_URL,
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    webBaseUrl: process.env.EXPO_PUBLIC_WEB_BASE_URL,
  },
});
