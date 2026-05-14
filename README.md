# Thane Property Search Mobile

React Native (Expo + TypeScript) mobile app scaffold for Android and iOS.

## Uses the same API

This app is wired to the existing backend API:

- Auth routes: `/api/auth/*`
- Property routes: `/api/properties/*`
- Owner dashboard: `/api/properties/owner-dashboard`

Set the API base URL for Metro (inlined at bundle time):

1. Copy `.env.example` to `.env` in the project root.
2. Set `EXPO_PUBLIC_API_BASE_URL` (underscores, not hyphens). Restart `expo start` after edits.

`localhost` is fine on the same machine (simulator on PC, web). For **Expo Go on a physical phone**, the phone is a different host: `localhost` is the phone itself, not your PC.

- **Android emulator** (API on host): often `http://10.0.2.2:44396` (or `https://…` if your API uses HTTPS and the cert is trusted in the emulator).
- **Physical device**: your PC’s **LAN IPv4**, e.g. `https://192.168.1.10:44396`.

Ensure the API listens on `0.0.0.0` (not only `localhost`) and allows your app origin if you use CORS.

## Start

Install dependencies first:

```bash
npm install
```

Then run:

```bash
npm run start
```

## Included screens

- Login
- Home property list
- Owner dashboard
