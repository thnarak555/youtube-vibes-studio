import { describe, it, expect } from 'vitest';
import { createProjectBackup, parseProjectBackup } from '../projectManager';
import { AE_COLOR_PRESETS } from '../presets';

describe('projectManager', () => {
  const metadata = { title: 'Test Song', artist: 'Test Artist', glowRadius: 220 };
  const lyrics = [
    { id: '1', inTime: 0, outTime: 4, original: 'Test', referenceTranslation: 'Ref', translation: 'ทดสอบ' }
  ];
  const preset = AE_COLOR_PRESETS[0];

  it('creates valid project backup object', () => {
    const backup = createProjectBackup(metadata, lyrics, preset, 220);
    expect(backup.version).toBe('1.0.0');
    expect(backup.metadata.title).toBe('Test Song');
    expect(backup.lyrics.length).toBe(1);
    expect(backup.glowRadius).toBe(220);
  });

  it('parses valid JSON project backup', () => {
    const backup = createProjectBackup(metadata, lyrics, preset, 220);
    const jsonStr = JSON.stringify(backup);
    const parsed = parseProjectBackup(jsonStr);

    expect(parsed).not.toBeNull();
    expect(parsed?.metadata.title).toBe('Test Song');
    expect(parsed?.lyrics[0].translation).toBe('ทดสอบ');
    expect(parsed?.glowRadius).toBe(220);
  });

  it('returns null for invalid JSON', () => {
    const parsed = parseProjectBackup('{ invalid json');
    expect(parsed).toBeNull();
  });
});
