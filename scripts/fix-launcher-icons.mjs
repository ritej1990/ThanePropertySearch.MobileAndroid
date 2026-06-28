/**
 * Regenerates ONLY the Android/iOS launcher icons from the gold-coin source,
 * with the proper adaptive-icon safe-zone padding so the coin is not clipped
 * by the launcher mask. Leaves splash / in-app logo-mark assets untouched.
 *
 * Run: node scripts/fix-launcher-icons.mjs
 */
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assets = path.join(__dirname, '..', 'assets');
const SRC = path.join(assets, 'source-gold-coin.png');

// Brand navy tile (matches splash + adaptiveIcon.backgroundColor).
const BG = { r: 12, g: 24, b: 41, alpha: 1 };

/** Center-crop to square, drop the checkerboard, flatten onto navy, trim to the coin. */
async function prepareCoin() {
  const meta = await sharp(SRC).metadata();
  const w = meta.width ?? 1024;
  const h = meta.height ?? 1024;
  const side = Math.min(w, h);
  const left = Math.max(0, Math.floor((w - side) / 2));
  const top = Math.max(0, Math.floor((h - side) / 2));

  const { data, info } = await sharp(SRC)
    .extract({ left, top, width: side, height: side })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Neutral, mid/bright pixels are the PS checkerboard + soft shadow → make transparent.
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const avg = (r + g + b) / 3;
    const neutral = Math.abs(r - g) < 18 && Math.abs(g - b) < 18 && Math.abs(r - b) < 18;
    if (neutral && avg > 120) data[i + 3] = 0;
  }

  const transparent = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();

  // Trim transparent margin → tight coin bbox.
  return sharp(transparent).trim({ threshold: 10 }).png().toBuffer();
}

/** Coin centered on an opaque navy square at `fill` ratio of the canvas. */
async function tile(coin, size, fill, outName) {
  const inner = Math.round(size * fill);
  const resized = await sharp(coin)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  const off = Math.round((size - inner) / 2);

  await sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: resized, left: off, top: off }])
    .flatten({ background: BG })
    .png()
    .toFile(path.join(assets, outName));
}

async function main() {
  const coin = await prepareCoin();

  // Adaptive foreground: coin within the ~66% safe zone so the mask can't clip it.
  await tile(coin, 1024, 0.6, 'adaptive-icon.png');
  // Square icon (iOS / legacy launchers): a little larger, no mask.
  await tile(coin, 1024, 0.76, 'icon.png');
  // Play Store listing icon.
  await tile(coin, 512, 0.76, 'play-store-icon.png');
  // Web favicon for the app's web build.
  await sharp(path.join(assets, 'icon.png'))
    .resize(48, 48)
    .png()
    .toFile(path.join(assets, 'favicon.png'));

  console.log('Regenerated launcher icons (navy tile, padded coin).');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
