import { API_BASE_URL, MEDIA_BASE_URL } from '../config/env';

/** Dev-only hosts stored in DB when PublicBaseUrl was localhost (API returns these). */
const DEV_ORIGIN =
  /^https?:\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2|\[::1\])(:\d+)?/i;

/**
 * Turn API image paths into URLs the phone can load (Azure / thaneflats CDN).
 * Example: http://localhost:5147/uploads/x.jpg → https://tpsapi.azurewebsites.net/uploads/x.jpg
 */
export function resolveImageUrl(raw: string | null | undefined): string | undefined {
  if (!raw?.trim()) return undefined;

  let url = raw.trim();
  if (url.startsWith('//')) {
    url = `https:${url}`;
  }

  const base = MEDIA_BASE_URL.replace(/\/+$/, '');

  if (url.startsWith('/')) {
    return `${base}${url}`;
  }

  if (!/^https?:\/\//i.test(url)) {
    return `${base}/${url.replace(/^\/+/, '')}`;
  }

  if (DEV_ORIGIN.test(url)) {
    try {
      const { pathname, search } = new URL(url);
      return `${base}${pathname}${search}`;
    } catch {
      return undefined;
    }
  }

  if (url.startsWith('http://')) {
    url = url.replace(/^http:\/\//i, 'https://');
  }

  return url;
}

export function resolveImageUrls(
  urls: string[] | null | undefined
): string[] {
  if (!urls?.length) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of urls) {
    const resolved = resolveImageUrl(raw);
    if (resolved && !seen.has(resolved)) {
      seen.add(resolved);
      out.push(resolved);
    }
  }
  return out;
}

export function resolvePropertyImages(property: {
  imageUrl?: string | null;
  imageUrls?: string[] | null;
}): { imageUrl: string; imageUrls: string[] } {
  const imageUrls = resolveImageUrls(property.imageUrls);
  const primary =
    resolveImageUrl(property.imageUrl) ?? imageUrls[0] ?? '';
  const all =
    primary && !imageUrls.includes(primary)
      ? [primary, ...imageUrls]
      : imageUrls.length > 0
        ? imageUrls
        : primary
          ? [primary]
          : [];
  return {
    imageUrl: primary,
    imageUrls: all,
  };
}
