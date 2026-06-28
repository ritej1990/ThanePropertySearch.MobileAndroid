/**
 * Writes the native Android launcher icons directly into android/app/src/main/res
 * so they ship with `npm run android` (committed native project, no prebuild needed).
 *
 * Produces, per density:
 *   - ic_launcher.webp         legacy square  (navy tile + coin)
 *   - ic_launcher_round.webp   legacy round   (navy circle + coin)
 *   - ic_launcher_foreground.webp  adaptive foreground (transparent + coin, safe-zone)
 * plus mipmap-anydpi-v26/ic_launcher{,_round}.xml referencing @color/iconBackground.
 *
 * Run: node scripts/gen-native-android-icons.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const res = path.join(root, 'android', 'app', 'src', 'main', 'res');
const SRC = path.join(root, 'assets', 'source-gold-coin.png');

const BG = { r: 12, g: 24, b: 41, alpha: 1 }; // #0c1829 brand navy
const LEGACY = { 'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192 };
const FOREGROUND = { 'mdpi': 108, 'hdpi': 162, 'xhdpi': 216, 'xxhdpi': 324, 'xxxhdpi': 432 };

/** Clean gold coin on a transparent canvas (checkerboard + soft shadow removed). */
async function prepareCoin() {
  const meta = await sharp(SRC).metadata();
  const side = Math.min(meta.width, meta.height);
  const left = Math.floor((meta.width - side) / 2);
  const top = Math.floor((meta.height - side) / 2);
  const { data, info } = await sharp(SRC)
    .extract({ left, top, width: side, height: side })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const avg = (r + g + b) / 3;
    const neutral = Math.abs(r - g) < 18 && Math.abs(g - b) < 18 && Math.abs(r - b) < 18;
    if (neutral && avg > 120) data[i + 3] = 0;
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .trim({ threshold: 10 })
    .toBuffer();
}

async function resizedCoin(coin, size, fill) {
  const inner = Math.round(size * fill);
  const r = await sharp(coin)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  return { buf: r, off: Math.round((size - inner) / 2) };
}

function circleMask(size) {
  return Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`
  );
}

async function main() {
  const coin = await prepareCoin();

  for (const [dpi, size] of Object.entries(LEGACY)) {
    const dir = path.join(res, `mipmap-${dpi}`);
    fs.mkdirSync(dir, { recursive: true });
    const { buf, off } = await resizedCoin(coin, size, 0.72);

    // Square legacy icon
    await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
      .composite([{ input: buf, left: off, top: off }])
      .flatten({ background: BG })
      .webp({ quality: 95 })
      .toFile(path.join(dir, 'ic_launcher.webp'));

    // Round legacy icon (circle-masked)
    await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
      .composite([{ input: buf, left: off, top: off }])
      .flatten({ background: BG })
      .composite([{ input: circleMask(size), blend: 'dest-in' }])
      .webp({ quality: 95 })
      .toFile(path.join(dir, 'ic_launcher_round.webp'));
  }

  // Adaptive foreground: transparent, coin inside the safe zone.
  for (const [dpi, size] of Object.entries(FOREGROUND)) {
    const dir = path.join(res, `mipmap-${dpi}`);
    fs.mkdirSync(dir, { recursive: true });
    const { buf, off } = await resizedCoin(coin, size, 0.56);
    await sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: buf, left: off, top: off }])
      .webp({ quality: 95 })
      .toFile(path.join(dir, 'ic_launcher_foreground.webp'));
  }

  // Adaptive icon definitions (Android 8+)
  const anydpi = path.join(res, 'mipmap-anydpi-v26');
  fs.mkdirSync(anydpi, { recursive: true });
  const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/iconBackground"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`;
  fs.writeFileSync(path.join(anydpi, 'ic_launcher.xml'), adaptiveXml);
  fs.writeFileSync(path.join(anydpi, 'ic_launcher_round.xml'), adaptiveXml);

  console.log('Native Android launcher icons regenerated.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
