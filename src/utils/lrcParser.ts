import type { LyricLine } from '../types';
import { parseLrcTimestamp } from './timeFormat';

export function parseLrcContent(content: string): LyricLine[] {
  if (!content || !content.trim()) return [];

  const lines = content.split(/\r?\n/);
  const parsedItems: { inTime: number; text: string }[] = [];

  const lrcRegex = /\[(\d{1,2}:\d{2}(?:\.\d{1,3})?)\]/g;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (/^\[[a-zA-Z]+:/.test(trimmed)) continue;

    const matches = Array.from(trimmed.matchAll(lrcRegex));
    if (matches.length > 0) {
      const text = trimmed.replace(lrcRegex, '').trim();
      for (const match of matches) {
        const inTime = parseLrcTimestamp(match[1]);
        parsedItems.push({ inTime, text });
      }
    }
  }

  parsedItems.sort((a, b) => a.inTime - b.inTime);

  const result: LyricLine[] = [];
  for (let i = 0; i < parsedItems.length; i++) {
    const current = parsedItems[i];
    const next = parsedItems[i + 1];

    let outTime: number;
    if (next) {
      const gap = next.inTime - current.inTime;
      outTime = gap > 8 ? Number((current.inTime + 5).toFixed(2)) : next.inTime;
    } else {
      outTime = Number((current.inTime + 4).toFixed(2));
    }

    result.push({
      id: 'line-' + (i + 1) + '-' + Math.random().toString(36).substring(2, 7),
      inTime: current.inTime,
      outTime,
      original: current.text,
      translation: ''
    });
  }

  return result;
}

export function parseSrtContent(content: string): LyricLine[] {
  if (!content || !content.trim()) return [];

  const blocks = content.trim().split(/\r?\n\r?\n/);
  const result: LyricLine[] = [];

  const timeRegex = /(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/;

  for (let i = 0; i < blocks.length; i++) {
    const lines = blocks[i].split(/\r?\n/);
    if (lines.length < 2) continue;

    let timeLineIdx = -1;
    for (let j = 0; j < lines.length; j++) {
      if (timeRegex.test(lines[j])) {
        timeLineIdx = j;
        break;
      }
    }

    if (timeLineIdx === -1) continue;

    const match = lines[timeLineIdx].match(timeRegex);
    if (!match) continue;

    const inTime = Number((
      parseInt(match[1]) * 3600 +
      parseInt(match[2]) * 60 +
      parseInt(match[3]) +
      parseInt(match[4]) / 1000
    ).toFixed(2));

    const outTime = Number((
      parseInt(match[5]) * 3600 +
      parseInt(match[6]) * 60 +
      parseInt(match[7]) +
      parseInt(match[8]) / 1000
    ).toFixed(2));

    const text = lines.slice(timeLineIdx + 1).join(' ').trim();

    result.push({
      id: 'srt-' + (i + 1),
      inTime,
      outTime,
      original: text,
      translation: ''
    });
  }

  return result;
}

export function parsePlainText(content: string): LyricLine[] {
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let currentTime = 0;
  return lines.map((text, idx) => {
    const inTime = Number(currentTime.toFixed(2));
    const outTime = Number((currentTime + 3.5).toFixed(2));
    currentTime += 3.5;
    return {
      id: 'plain-' + (idx + 1),
      inTime,
      outTime,
      original: text,
      translation: ''
    };
  });
}
