import { describe, it, expect, beforeEach } from 'vitest';
import { useLyricStore } from '../../stores/useLyricStore';
import { generateAEScript } from '../aeExporter';
import type { LyricLine } from '../../types';

describe('Undo/Redo System, Display Modes, and Time Reset', () => {
  beforeEach(() => {
    useLyricStore.getState().clearAll();
  });

  it('performs undo and redo correctly', () => {
    const store = useLyricStore.getState();

    const sampleLines: LyricLine[] = [
      { id: '1', inTime: 1.0, outTime: 4.0, original: 'Hello World', translation: '' }
    ];

    store.setLyrics(sampleLines);
    expect(useLyricStore.getState().lyrics[0].translation).toBe('');

    // Make an edit
    store.updateTranslation('1', 'สวัสดีชาวโลก');
    expect(useLyricStore.getState().lyrics[0].translation).toBe('สวัสดีชาวโลก');
    expect(useLyricStore.getState().canUndo).toBe(true);

    // Undo
    useLyricStore.getState().undo();
    expect(useLyricStore.getState().lyrics[0].translation).toBe('');
    expect(useLyricStore.getState().canRedo).toBe(true);

    // Redo
    useLyricStore.getState().redo();
    expect(useLyricStore.getState().lyrics[0].translation).toBe('สวัสดีชาวโลก');
  });

  it('resets line to original timestamp', () => {
    const store = useLyricStore.getState();

    const sampleLines: LyricLine[] = [
      { 
        id: 'line-1', 
        inTime: 5.5, 
        outTime: 9.0, 
        original: 'Original Song Line', 
        translation: '',
        originalInTime: 5.5,
        originalOutTime: 9.0
      }
    ];

    store.setLyrics(sampleLines);

    // User changes time
    store.updateLineTimecode('line-1', 7.2, 11.5);
    expect(useLyricStore.getState().lyrics[0].inTime).toBe(7.2);
    expect(useLyricStore.getState().lyrics[0].outTime).toBe(11.5);

    // User clicks reset
    store.resetLineToOriginalTime('line-1');
    expect(useLyricStore.getState().lyrics[0].inTime).toBe(5.5);
    expect(useLyricStore.getState().lyrics[0].outTime).toBe(9.0);
  });

  it('switches between 3 display modes seamlessly', () => {
    const store = useLyricStore.getState();
    expect(store.displayMode).toBe('normal');

    store.setDisplayMode('fade');
    expect(useLyricStore.getState().displayMode).toBe('fade');
    expect(useLyricStore.getState().transitionStyle).toBe('fade');

    store.setDisplayMode('document');
    expect(useLyricStore.getState().displayMode).toBe('document');

    store.setDisplayMode('normal');
    expect(useLyricStore.getState().displayMode).toBe('normal');
  });

  it('generates universal After Effects script that supports both modular and standalone execution', () => {
    const sampleLyrics: LyricLine[] = [
      { id: '1', inTime: 2.0, outTime: 6.0, original: 'Daisy Crown', translation: 'มงกุฎเดซี่' }
    ];
    const meta = { title: 'Daisy Crown', artist: 'Neuron' };

    const script = generateAEScript(sampleLyrics, meta);
    expect(script).toContain('var DaisyCrownData = {');
    expect(script).toContain('title: "Daisy Crown"');
    expect(script).toContain('en: "Daisy Crown"');
    expect(script).toContain('th: "มงกุฎเดซี่"');
    // Standalone auto-run execution
    expect(script).toContain('if (typeof app !== "undefined" && app.project');
    expect(script).toContain('app.beginUndoGroup');
  });
});
