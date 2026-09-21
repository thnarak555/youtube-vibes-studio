const LOOPBACK_HTTP_ORIGIN =
  /^http:\/\/(?:127\.0\.0\.1|localhost|\[::1\])(?::\d+)?(?:\/|$)/i;

export const DEFAULT_FALLBACK_COVER =
  'https://p2.music.126.net/UeTuwE7pvjBpypWLudqukA==/3132508627578625.jpg';

/**
 * Normalize cover URL from HTTP to HTTPS and handle protocol-relative URLs.
 */
export function normalizeCoverUrl(imageUrl?: string | null): string {
  if (!imageUrl || typeof imageUrl !== 'string') return '';

  const trimmedUrl = imageUrl.trim();
  if (!trimmedUrl) return '';
  if (trimmedUrl.startsWith('//')) return `https:${trimmedUrl}`;

  return LOOPBACK_HTTP_ORIGIN.test(trimmedUrl)
    ? trimmedUrl
    : trimmedUrl.replace(/^http:\/\//i, 'https://');
}

/**
 * Resolve cover URL from the various response shapes used by NetEase API.
 */
export function resolveCoverImageUrl(source: any): string {
  if (!source) return '';

  if (typeof source === 'string') {
    return normalizeCoverUrl(source);
  }

  return normalizeCoverUrl(
    source.picUrl ||
      source.coverImgUrl ||
      source.coverUrl ||
      source.blurPicUrl ||
      source.img1v1Url ||
      source.al?.picUrl ||
      source.album?.picUrl ||
      source.album?.blurPicUrl ||
      source.simpleSong?.al?.picUrl ||
      source.song?.al?.picUrl ||
      source.song?.album?.picUrl ||
      source.artist?.picUrl ||
      source.avatarUrl ||
      ''
  );
}

/**
 * Append NetEase image sizing parameter (?param=300y300).
 * Matches YesPlayMusic-MaO createSizedCoverUrl implementation.
 */
export function createSizedCoverUrl(source: any, size: number = 300): string {
  const normalizedUrl = resolveCoverImageUrl(source);
  if (!normalizedUrl) return '';

  const numericSize = Math.floor(size);
  if (!Number.isFinite(numericSize) || numericSize <= 0) return normalizedUrl;

  // If it's a data URI or blob, don't modify params
  if (normalizedUrl.startsWith('data:') || normalizedUrl.startsWith('blob:')) {
    return normalizedUrl;
  }

  const urlWithoutOldSize = normalizedUrl
    .replace(/([?&])param=\d+y\d+(?=&|$)/gi, '$1')
    .replace(/\?&/, '?')
    .replace(/&&+/g, '&')
    .replace(/[?&]$/, '');
    
  const separator = urlWithoutOldSize.includes('?') ? '&' : '?';
  return `${urlWithoutOldSize}${separator}param=${numericSize}y${numericSize}`;
}
