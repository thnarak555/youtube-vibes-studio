import { describe, it, expect } from 'vitest';
import { generateAEScript } from '../aeExporter';
import type { LyricLine, SongMetadata } from '../../types';

describe('aeExporter', () => {
  const sampleLyrics: LyricLine[] = [
    { id: '1', inTime: 0.87, outTime: 5.81, original: 'If I scatter like stardust', translation: 'หากสลายเป็นละอองดาว' },
    { id: '2', inTime: 5.81, outTime: 9.34, original: 'I will still drift forward', translation: 'ฉันยังคงล่องลอยไป' }
  ];

  const meta: SongMetadata = { title: 'Homecoming Star', artist: 'Wuthering Waves' };

  it('generates valid After Effects JSX matching modular automation', () => {
    const script = generateAEScript(sampleLyrics, meta, { startColorHex: '#cecbb1', endColorHex: '#81b8be' });
    expect(script).toContain('var HomecomingStarData = {');
    expect(script).toContain('title: "Homecoming Star"');
    expect(script).toContain('start: "#cecbb1"');
    expect(script).toContain('end: "#81b8be"');
    expect(script).toContain('en: "If I scatter like stardust"');
    expect(script).toContain('th: "หากสลายเป็นละอองดาว"');
    expect(script).toContain('inTime: 0.87, outTime: 5.81');
  });

  it('handles Thai or Unicode song titles gracefully without invalid JS identifiers', () => {
    const thaiMeta: SongMetadata = { title: 'เพลงดาวตก', artist: 'ศิลปินไทย' };
    const script = generateAEScript(sampleLyrics, thaiMeta);
    expect(script).toMatch(/var Song_[0-9a-f]+Data = \{/);
    expect(script).toContain('title: "เพลงดาวตก"');
  });
});