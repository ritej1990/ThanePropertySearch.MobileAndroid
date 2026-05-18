const path = require('path');

// Load .env before Expo reads config so `extra` is set reliably (also helps Metro's EXPO_PUBLIC_* injection).
require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });

const appJson = require('./app.json');

const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

module.exports = {
  expo: {
    ...appJson.expo,
    ios: {
      ...appJson.expo.ios,
      config: {
        ...appJson.expo.ios?.config,
        googleMapsApiKey,
      },
    },
    android: {
      ...appJson.expo.android,
      config: {
        ...appJson.expo.android?.config,
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
    },
    extra: {
      ...(appJson.expo.extra || {}),
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
      mediaBaseUrl:
        process.env.EXPO_PUBLIC_MEDIA_BASE_URL ||
        process.env.EXPO_PUBLIC_API_BASE_URL,
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      webBaseUrl: process.env.EXPO_PUBLIC_WEB_BASE_URL,
    },
  },
};
