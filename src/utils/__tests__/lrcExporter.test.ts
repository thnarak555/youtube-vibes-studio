import { describe, it, expect } from 'vitest';
import { 
  generateBilingualLrc, 
  generateTranslationLrc, 
  generateOriginalLrc, 
  generateReferenceLrc, 
  generateSrt,
  generateFormalFilename
} from '../lrcExporter';
import type { LyricLine, SongMetadata } from '../../types';

describe('lrcExporter', () => {
  const lyrics: LyricLine[] = [
    { 
      id: '1', 
      inTime: 2.5, 
      outTime: 6.0, 
      original: 'Hello world', 
      referenceTranslation: '你好世界',
      translation: 'สวัสดีชาวโลก' 
    }
  ];
  const meta: SongMetadata = { title: 'Test Song', artist: 'Test Artist' };

  it('generates bilingual LRC format with both lines', () => {
    const lrc = generateBilingualLrc(lyrics, meta);
    expect(lrc).toContain('[00:02.50]Hello world');
    expect(lrc).toContain('[00:02.50]สวัสดีชาวโลก');
  });

  it('generates translation-only LRC', () => {
    const lrc = generateTranslationLrc(lyrics, meta);
    expect(lrc).toContain('[00:02.50]สวัสดีชาวโลก');
    expect(lrc).not.toContain('Hello world');
  });

  it('generates original-only LRC', () => {
    const lrc = generateOriginalLrc(lyrics, meta);
    expect(lrc).toContain('[00:02.50]Hello world');
    expect(lrc).not.toContain('สวัสดีชาวโลก');
  });

  it('generates reference-only LRC', () => {
    const lrc = generateReferenceLrc(lyrics, meta);
    expect(lrc).toContain('[00:02.50]你好世界');
    expect(lrc).not.toContain('สวัสดีชาวโลก');
  });

  it('generates SRT format correctly', () => {
    const srt = generateSrt(lyrics);
    expect(srt).toContain('00:00:02,500 --> 00:00:06,000');
    expect(srt).toContain('Hello world');
    expect(srt).toContain('สวัสดีชาวโลก');
  });

  it('generates clean formal filenames for industry standard export', () => {
    expect(generateFormalFilename({ title: 'Daisy Crown', artist: 'Wuthering Waves' }, 'Bilingual', 'lrc'))
      .toBe('Wuthering Waves - Daisy Crown (Bilingual).lrc');
    expect(generateFormalFilename({ title: 'Daisy Crown', artist: 'Wuthering Waves' }, '', 'jsx'))
      .toBe('Wuthering Waves - Daisy Crown.jsx');
    expect(generateFormalFilename({ title: 'Daisy Crown', artist: '' }, '', 'srt'))
      .toBe('Daisy Crown.srt');
  });
});