import type { LyricLine, SongMetadata } from '../types';
import { formatTimeWithMs, formatTime } from './timeFormat';

export function sanitizeSafeFilename(title: string, fallback: string = 'Song'): string {
  if (!title) return fallback;
  // Remove illegal filesystem characters: \ / : * ? " < > |
  let clean = title.replace(/[\\/:*?"<>|]/g, '').trim();
  // Clean up trailing dots or spaces which Windows forbids at end of filenames
  clean = clean.replace(/[\.\s]+$/, '');
  return clean || fallback;
}

/**
 * Generates an industry-standard, formal filename for music and subtitle files
 * Format: "{Artist} - {Title} ({Type}).{ext}" or "{Title} ({Type}).{ext}"
 */
export function generateFormalFilename(
  meta: SongMetadata | undefined,
  typeSuffix: string,
  ext: string
): string {
  const cleanTitle = sanitizeSafeFilename(meta?.title || 'Song');
  const cleanArtist = meta?.artist ? sanitizeSafeFilename(meta.artist, '') : '';
  
  let baseName = '';
  if (cleanArtist && cleanArtist.toLowerCase() !== 'unknown' && cleanArtist !== cleanTitle) {
    baseName = `${cleanArtist} - ${cleanTitle}`;
  } else {
    baseName = cleanTitle;
  }

  // Clean trailing spaces
  baseName = baseName.trim();

  if (!typeSuffix || typeSuffix.trim() === '') {
    return `${baseName}.${ext}`;
  }

  return `${baseName} (${typeSuffix.trim()}).${ext}`;
}

export function generateBilingualLrc(lyrics: LyricLine[], meta?: SongMetadata): string {
  let output = '';
  if (meta?.title) output += '[ti:' + meta.title + ']\n';
  if (meta?.artist) output += '[ar:' + meta.artist + ']\n';
  if (meta?.album) output += '[al:' + meta.album + ']\n';
  if (meta?.duration && meta.duration > 0) output += '[length:' + formatTime(meta.duration) + ']\n';
  output += '[by:Lyric Studio]\n\n';

  for (const line of lyrics) {
    const timestamp = '[' + formatTimeWithMs(line.inTime) + ']';
    output += timestamp + line.original + '\n';
    if (line.translation && line.translation.trim()) {
      output += timestamp + line.translation + '\n';
    } else if (line.referenceTranslation && line.referenceTranslation.trim()) {
      output += timestamp + line.referenceTranslation + '\n';
    }
  }

  return output.trim();
}

export function generateTranslationLrc(lyrics: LyricLine[], meta?: SongMetadata): string {
  let output = '';
  if (meta?.title) output += '[ti:' + meta.title + ']\n';
  if (meta?.artist) output += '[ar:' + meta.artist + ']\n';
  if (meta?.album) output += '[al:' + meta.album + ']\n';
  if (meta?.duration && meta.duration > 0) output += '[length:' + formatTime(meta.duration) + ']\n';
  output += '[by:Lyric Studio]\n\n';

  for (const line of lyrics) {
    const text = line.translation.trim() || line.referenceTranslation?.trim() || line.original.trim();
    output += '[' + formatTimeWithMs(line.inTime) + ']' + text + '\n';
  }

  return output.trim();
}

export function generateOriginalLrc(lyrics: LyricLine[], meta?: SongMetadata): string {
  let output = '';
  if (meta?.title) output += '[ti:' + meta.title + ']\n';
  if (meta?.artist) output += '[ar:' + meta.artist + ']\n';
  if (meta?.album) output += '[al:' + meta.album + ']\n';
  if (meta?.duration && meta.duration > 0) output += '[length:' + formatTime(meta.duration) + ']\n';
  output += '[by:Lyric Studio]\n\n';

  for (const line of lyrics) {
    output += '[' + formatTimeWithMs(line.inTime) + ']' + line.original + '\n';
  }

  return output.trim();
}

export function generateReferenceLrc(lyrics: LyricLine[], meta?: SongMetadata): string {
  let output = '';
  if (meta?.title) output += '[ti:' + meta.title + ']\n';
  if (meta?.artist) output += '[ar:' + meta.artist + ']\n';
  if (meta?.album) output += '[al:' + meta.album + ']\n';
  if (meta?.duration && meta.duration > 0) output += '[length:' + formatTime(meta.duration) + ']\n';
  output += '[by:Lyric Studio]\n\n';

  for (const line of lyrics) {
    const text = line.referenceTranslation?.trim() || line.original.trim();
    output += '[' + formatTimeWithMs(line.inTime) + ']' + text + '\n';
  }

  return output.trim();
}

export function generateSrt(lyrics: LyricLine[]): string {
  function formatSrtTime(sec: number): string {
    const safeSec = Math.max(0, sec);
    const hrs = Math.floor(safeSec / 3600);
    const mins = Math.floor((safeSec % 3600) / 60);
    const secs = Math.floor(safeSec % 60);
    const ms = Math.floor((safeSec % 1) * 1000);
    const hStr = (hrs < 10 ? '0' : '') + hrs;
    const mStr = (mins < 10 ? '0' : '') + mins;
    const sStr = (secs < 10 ? '0' : '') + secs;
    const msStr = (ms < 100 ? (ms < 10 ? '00' : '0') : '') + ms;
    return hStr + ':' + mStr + ':' + sStr + ',' + msStr;
  }

  let output = '';
  lyrics.forEach((line, idx) => {
    // Ensure outTime is always strictly greater than inTime
    const inTime = line.inTime;
    let outTime = line.outTime;
    if (outTime <= inTime) {
      outTime = inTime + 3.0;
    }

    output += (idx + 1) + '\n';
    output += formatSrtTime(inTime) + ' --> ' + formatSrtTime(outTime) + '\n';
    if (line.translation && line.translation.trim()) {
      output += line.original + '\n' + line.translation + '\n\n';
    } else if (line.referenceTranslation && line.referenceTranslation.trim()) {
      output += line.original + '\n' + line.referenceTranslation + '\n\n';
    } else {
      output += line.original + '\n\n';
    }
  });

  return output.trim();
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
