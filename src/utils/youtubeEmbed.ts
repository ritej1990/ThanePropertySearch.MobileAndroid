/** Match ThanePropertySearch.Web Builder/Details.cshtml GetYouTubeEmbedUrl. */

function parseMediaUrl(url: string): URL | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    return new URL(trimmed);
  } catch {
    try {
      return new URL(`https://${trimmed.replace(/^\/+/, '')}`);
    } catch {
      return null;
    }
  }
}

export function getYouTubeVideoId(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;

  const uri = parseMediaUrl(url);
  if (!uri) return null;

  const host = uri.hostname.toLowerCase().replace(/^www\./, '');
  let videoId: string | null = null;

  if (host === 'youtu.be') {
    videoId = uri.pathname.replace(/^\/+/, '').split('/')[0] || null;
  } else if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
    const parts = uri.pathname.replace(/^\/+/, '').split('/').filter(Boolean);
    if (parts.length >= 2) {
      const kind = parts[0];
      if (kind === 'embed' || kind === 'shorts' || kind === 'live' || kind === 'v') {
        videoId = parts[1];
      }
    }
    if (!videoId) {
      videoId = uri.searchParams.get('v');
    }
  }

  if (!videoId?.trim()) return null;
  const cleanId = videoId.replace(/[^a-zA-Z0-9_-]/g, '');
  return cleanId.length === 0 ? null : cleanId;
}

export function getYouTubeEmbedUrl(url: string | null | undefined): string | null {
  const id = getYouTubeVideoId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}?playsinline=1&rel=0` : null;
}

export function getYouTubeWatchUrl(url: string | null | undefined): string | null {
  const id = getYouTubeVideoId(url);
  return id ? `https://www.youtube.com/watch?v=${id}` : url?.trim() || null;
}

export function getYouTubeThumbnailUrl(url: string | null | undefined): string | null {
  const id = getYouTubeVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export function isYouTubeUrl(url: string | null | undefined): boolean {
  return getYouTubeVideoId(url) != null;
}

export function buildYouTubeEmbedHtml(embedUrl: string): string {
  const safeSrc = embedUrl.replace(/"/g, '&quot;');
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <style>
    html, body { margin: 0; padding: 0; height: 100%; background: #0f172a; }
    iframe { display: block; width: 100%; height: 100%; border: 0; }
  </style>
</head>
<body>
  <iframe
    src="${safeSrc}"
    title="Project video"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
    referrerpolicy="strict-origin-when-cross-origin"
  ></iframe>
</body>
</html>`;
}
