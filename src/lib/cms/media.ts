const YOUTUBE_ID = /^[\w-]{11}$/;

/** Extracts the 11-character id from any YouTube URL (watch, youtu.be, shorts, embed, live) or a bare id. */
export function youtubeId(url: string | null | undefined): string | null {
  const value = (url ?? '').trim();
  if (!value) return null;
  if (YOUTUBE_ID.test(value)) return value;
  try {
    const parsed = new URL(value);
    const host = parsed.hostname.replace(/^www\.|^m\./, '');
    if (host === 'youtu.be') return checked(parsed.pathname.slice(1));
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      const v = parsed.searchParams.get('v');
      if (v) return checked(v);
      const match = parsed.pathname.match(/^\/(?:shorts|embed|live|v)\/([\w-]{11})/);
      if (match) return match[1];
    }
  } catch {
    // Not a URL.
  }
  return null;
}

function checked(id: string) {
  const clean = id.split(/[/?&#]/)[0];
  return YOUTUBE_ID.test(clean) ? clean : null;
}

/** The player for a video URL: YouTube links embed, anything else (uploads, .mp4 links) plays in a native <video>. */
export function videoKind(url: string | null | undefined): 'youtube' | 'file' | 'none' {
  if (!url?.trim()) return 'none';
  return youtubeId(url) ? 'youtube' : 'file';
}

/** Accepts either a bare iframe `src` or the whole `<iframe …>` snippet copied from Google Maps. */
export function extractIframeSrc(value: string | null | undefined): string {
  const text = (value ?? '').trim();
  const match = text.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i);
  const src = match ? match[1] : text;
  return /^https:\/\//i.test(src) ? src.replace(/&amp;/g, '&') : '';
}

export function mapEmbedSrc(
  branch: {map_embed_url?: string; lat?: number | null; lng?: number | null},
  locale: string
): string {
  const custom = extractIframeSrc(branch.map_embed_url);
  if (custom) return custom;
  if (branch.lat == null || branch.lng == null) return '';
  return `https://www.google.com/maps?q=${branch.lat},${branch.lng}&z=16&hl=${locale}&output=embed`;
}

export function directionsHref(branch: {directions_url?: string; lat?: number | null; lng?: number | null; address?: string}): string {
  const custom = (branch.directions_url ?? '').trim();
  if (/^https:\/\//i.test(custom)) return custom;
  if (branch.lat != null && branch.lng != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}`;
  }
  return branch.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.address)}` : '';
}
