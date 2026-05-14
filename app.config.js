const path = require('path');

// Load .env before Expo reads config so `extra` is set reliably (also helps Metro's EXPO_PUBLIC_* injection).
require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });

const appJson = require('./app.json');

module.exports = {
  expo: {
    ...appJson.expo,
    extra: {
      ...(appJson.expo.extra || {}),
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    },
  },
};
