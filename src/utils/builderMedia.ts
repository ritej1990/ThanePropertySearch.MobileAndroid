import type { BuilderProjectMedia } from '../api/builderTypes';
import { resolveImageUrl } from './imageUrl';
import { isYouTubeUrl } from './youtubeEmbed';

function mediaTypeKey(raw: string | null | undefined): string {
  return (raw ?? '').trim().toLowerCase().replace(/[\s_-]+/g, '');
}

function normalizeVideoUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, '')}`;
}

function isVideoMediaType(key: string): boolean {
  return key === 'video' || key === 'videos';
}

function isVideoUrl(url: string): boolean {
  return isYouTubeUrl(url) || /\.(mp4|webm|mov)(\?|#|$)/i.test(url) || /vimeo\.com/i.test(url);
}

/** API may return `media` or `Media` depending on serializer / proxies. */
export function extractRawBuilderMedia(project: unknown): unknown {
  if (!project || typeof project !== 'object') return [];
  const row = project as Record<string, unknown>;
  return row.media ?? row.Media ?? [];
}

export function normalizeBuilderMedia(media: unknown): BuilderProjectMedia[] {
  if (!Array.isArray(media)) return [];

  const out: BuilderProjectMedia[] = [];
  for (const item of media) {
    if (typeof item === 'string') {
      const url = resolveImageUrl(item);
      if (!url) continue;
      out.push({
        id: 0,
        mediaType: 'Gallery',
        url,
        caption: '',
        reviewStatus: 'Approved',
        createdAtUtc: '',
      });
      continue;
    }

    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const rawUrl = typeof row.url === 'string' ? row.url : typeof row.Url === 'string' ? row.Url : '';
    const typeRaw =
      typeof row.mediaType === 'string'
        ? row.mediaType
        : typeof row.MediaType === 'string'
          ? row.MediaType
          : 'Gallery';
    const typeKey = mediaTypeKey(typeRaw);
    const videoByUrl = isVideoUrl(rawUrl);
    const isVideo = isVideoMediaType(typeKey) || videoByUrl;
    const url = isVideo
      ? normalizeVideoUrl(rawUrl)
      : resolveImageUrl(rawUrl) ?? rawUrl.trim();
    if (!url) continue;

    out.push({
      id: typeof row.id === 'number' ? row.id : typeof row.Id === 'number' ? row.Id : 0,
      mediaType: isVideo ? 'Video' : typeRaw || 'Gallery',
      url,
      caption:
        typeof row.caption === 'string'
          ? row.caption
          : typeof row.Caption === 'string'
            ? row.Caption
            : '',
      reviewStatus:
        typeof row.reviewStatus === 'string'
          ? row.reviewStatus
          : typeof row.ReviewStatus === 'string'
            ? row.ReviewStatus
            : 'Approved',
      createdAtUtc:
        typeof row.createdAtUtc === 'string'
          ? row.createdAtUtc
          : typeof row.CreatedAtUtc === 'string'
            ? row.CreatedAtUtc
            : '',
    });
  }

  return out;
}

export function splitBuilderMedia(media: BuilderProjectMedia[]) {
  const gallery: BuilderProjectMedia[] = [];
  const floorPlans: BuilderProjectMedia[] = [];
  const videos: BuilderProjectMedia[] = [];

  for (const item of media) {
    let key = mediaTypeKey(item.mediaType);
    if (isVideoUrl(item.url)) {
      key = 'video';
    } else if (key === 'gallery' && isYouTubeUrl(item.url)) {
      key = 'video';
    }
    if (key === 'gallery') gallery.push(item);
    else if (key === 'floorplan' || key === 'floorplans') floorPlans.push(item);
    else if (isVideoMediaType(key) || key === 'video') videos.push(item);
  }

  return { gallery, floorPlans, videos };
}

export function isLikelyImageUrl(url: string): boolean {
  return /\.(jpe?g|png|gif|webp|bmp)(\?|#|$)/i.test(url);
}
