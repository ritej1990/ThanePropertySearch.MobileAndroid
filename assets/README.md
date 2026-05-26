# Thane Flats brand assets

Generated from the gold coin artwork (`source-gold-coin.png`, or legacy `source-icon-dark.png`).
Icons use a **solid white background** (no transparency).

## Regenerate after updating source art

```bash
npm run generate:icons
```

## Files

| File | Use |
|------|-----|
| `icon.png` | Expo app icon (1024×1024), iOS App Store |
| `adaptive-icon.png` | Android adaptive icon foreground |
| `play-store-icon.png` | Google Play Console high-res icon (512×512) |
| `splash.png` | Native splash / Expo splash screen |
| `splash-brand.png` | Optional splash with wordmark (reference) |
| `logo-mark.png` / `logo-mark-lg.png` | In-app header, loading, auth screens |
| `favicon.png` | Expo web |

## Play Store upload

1. **App icon:** upload `play-store-icon.png` (or `icon.png` scaled to 512×512 if needed).
2. **Feature graphic:** create separately (1024×500) — not auto-generated here.
3. Rebuild the native app after icon changes: `npm run android:clean` then `npm run android` or your release APK script.

Adaptive icon background color is `#0c1829` (configured in `app.json`).
