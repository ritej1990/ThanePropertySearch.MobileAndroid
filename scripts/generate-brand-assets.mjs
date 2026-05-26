/**
 * Generates Expo / Play Store icon and splash assets from brand source art.
 * Run: npm run generate:icons
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const assetsDir = path.join(root, 'assets');

const SOURCE_COIN = path.join(assetsDir, 'source-gold-coin.png');
const SOURCE_ICON_LEGACY = path.join(assetsDir, 'source-icon-dark.png');
const SOURCE_BRAND = path.join(assetsDir, 'source-brand-wordmark.png');

const SPLASH_BG = '#0c1829';
/** Solid launcher background — no transparency */
const ICON_BG = '#ffffff';

function resolveSourcePath() {
  if (fs.existsSync(SOURCE_COIN)) return SOURCE_COIN;
  if (fs.existsSync(SOURCE_ICON_LEGACY)) return SOURCE_ICON_LEGACY;
  throw new Error(
    'Missing assets/source-gold-coin.png (preferred) or source-icon-dark.png'
  );
}

/** Replace light gray checkerboard pixels with solid white. */
async function stripCheckerboard(buffer) {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = data;
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const avg = (r + g + b) / 3;
    const isNeutral = Math.abs(r - g) < 14 && Math.abs(g - b) < 14;
    const isBackdrop = avg > 150 && avg < 250;
    if (isNeutral && isBackdrop) {
      pixels[i] = 255;
      pixels[i + 1] = 255;
      pixels[i + 2] = 255;
      pixels[i + 3] = 255;
    }
  }

  return sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .flatten({ background: ICON_BG })
    .png()
    .toBuffer();
}

/**
 * Center-crop to square, remove checkerboard, flatten onto white, trim margins.
 */
async function prepareCoinArt(input) {
  const meta = await sharp(input).metadata();
  const w = meta.width ?? 1024;
  const h = meta.height ?? 1024;
  const side = Math.min(w, h);
  const left = Math.max(0, Math.floor((w - side) / 2));
  const top = Math.max(0, Math.floor((h - side) / 2));

  const cropped = await sharp(input)
    .extract({ left, top, width: side, height: side })
    .flatten({ background: ICON_BG })
    .png()
    .toBuffer();

  const cleaned = await stripCheckerboard(cropped);

  try {
    return await sharp(cleaned).trim({ threshold: 20 }).png().toBuffer();
  } catch {
    return cleaned;
  }
}

/** Opaque square icon — coin on white, no transparency. */
async function iconOnWhite(coinArt, size, fillRatio = 0.92) {
  const inner = Math.round(size * fillRatio);
  const resized = await sharp(coinArt)
    .resize(inner, inner, {
      fit: 'contain',
      background: ICON_BG,
    })
    .flatten({ background: ICON_BG })
    .png()
    .toBuffer();

  const left = Math.round((size - inner) / 2);
  const top = Math.round((size - inner) / 2);

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: ICON_BG,
    },
  })
    .composite([{ input: resized, left, top }])
    .png();
}

/** Adaptive foreground — opaque coin on white (Android layers white behind). */
async function adaptiveForeground(coinArt, size = 1024) {
  return iconOnWhite(coinArt, size, 0.9);
}

async function splashImage(coinArt, outPath) {
  const width = 1284;
  const height = 2778;
  const logoSize = 560;
  const resized = await sharp(coinArt)
    .resize(logoSize, logoSize, {
      fit: 'contain',
      background: { r: 12, g: 24, b: 41, alpha: 1 },
    })
    .flatten({ background: SPLASH_BG })
    .png()
    .toBuffer();

  const left = Math.round((width - logoSize) / 2);
  const top = Math.round(height * 0.28 - logoSize / 2);

  await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: SPLASH_BG,
    },
  })
    .composite([{ input: resized, left, top }])
    .png()
    .toFile(outPath);
}

async function wordmarkSplash(input, outPath) {
  const width = 1284;
  const height = 2778;
  const maxW = 920;
  const resized = await sharp(input)
    .resize(maxW, Math.round(height * 0.42), {
      fit: 'contain',
      background: SPLASH_BG,
    })
    .flatten({ background: SPLASH_BG })
    .png()
    .toBuffer();

  const meta = await sharp(resized).metadata();
  const left = Math.round((width - (meta.width ?? maxW)) / 2);
  const top = Math.round(height * 0.24);

  await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: SPLASH_BG,
    },
  })
    .composite([{ input: resized, left, top }])
    .png()
    .toFile(outPath);
}

async function logoMark(coinArt, size, filename) {
  await iconOnWhite(coinArt, size, 0.94).then((img) =>
    img.toFile(path.join(assetsDir, filename))
  );
}

async function main() {
  const sourcePath = resolveSourcePath();
  fs.mkdirSync(assetsDir, { recursive: true });

  const coinArt = await prepareCoinArt(sourcePath);

  await (await iconOnWhite(coinArt, 1024, 0.92)).toFile(
    path.join(assetsDir, 'icon.png')
  );

  await (await adaptiveForeground(coinArt, 1024)).toFile(
    path.join(assetsDir, 'adaptive-icon.png')
  );

  await (await iconOnWhite(coinArt, 512, 0.92)).toFile(
    path.join(assetsDir, 'play-store-icon.png')
  );

  await logoMark(coinArt, 128, 'logo-mark.png');
  await logoMark(coinArt, 256, 'logo-mark-lg.png');

  await splashImage(coinArt, path.join(assetsDir, 'splash.png'));

  if (fs.existsSync(SOURCE_BRAND)) {
    await wordmarkSplash(SOURCE_BRAND, path.join(assetsDir, 'splash-brand.png'));
  }

  await sharp(path.join(assetsDir, 'icon.png'))
    .resize(48, 48)
    .png()
    .toFile(path.join(assetsDir, 'favicon.png'));

  console.log(`Generated opaque icon assets from ${path.basename(sourcePath)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
