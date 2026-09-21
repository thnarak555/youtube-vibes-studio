import { describe, it, expect, beforeEach } from 'vitest';
import { useLyricStore } from '../../stores/useLyricStore';

describe('LyricStore Quality of Life & Keyboard actions', () => {
  beforeEach(() => {
    const store = useLyricStore.getState();
    store.clearAll();
    store.setLyrics([
      { id: 'line-1', inTime: 0, outTime: 5, original: 'First line', referenceTranslation: 'Ref 1', translation: '' },
      { id: 'line-2', inTime: 5, outTime: 10, original: 'Second line', referenceTranslation: 'Ref 2', translation: 'แปลสอง' },
      { id: 'line-3', inTime: 10, outTime: 15, original: 'Third line', referenceTranslation: 'Ref 3', translation: '' },
    ]);
    store.setMetadata({ title: 'Song Alpha', artist: 'Artist Beta' });
  });

  it('toggles favorite song correctly', () => {
    const store = useLyricStore.getState();
    expect(store.isCurrentSongFavorite()).toBe(false);

    store.toggleFavoriteCurrentSong();
    expect(useLyricStore.getState().isCurrentSongFavorite()).toBe(true);

    store.toggleFavoriteCurrentSong();
    expect(useLyricStore.getState().isCurrentSongFavorite()).toBe(false);
  });

  it('appends characters seamlessly with typeIntoActiveLine', () => {
    const store = useLyricStore.getState();
    expect(store.activeLineIndex).toBe(0);
    expect(store.lyrics[0].translation).toBe('');

    store.typeIntoActiveLine('ส');
    store.typeIntoActiveLine('ว');
    store.typeIntoActiveLine('ั');
    store.typeIntoActiveLine('ส');
    store.typeIntoActiveLine('ด');
    store.typeIntoActiveLine('ี');

    const updated = useLyricStore.getState();
    expect(updated.lyrics[0].translation).toBe('สวัสดี');
    expect(updated.activeInputFocusTrigger).toBeGreaterThan(0);
  });

  it('navigates next and previous lines properly', () => {
    const store = useLyricStore.getState();
    expect(store.activeLineIndex).toBe(0);

    store.goToNextLine();
    expect(useLyricStore.getState().activeLineIndex).toBe(1);

    store.goToNextLine();
    expect(useLyricStore.getState().activeLineIndex).toBe(2);

    store.goToNextLine();
    expect(useLyricStore.getState().activeLineIndex).toBe(2);

    store.goToPrevLine();
    expect(useLyricStore.getState().activeLineIndex).toBe(1);

    store.goToPrevLine();
    expect(useLyricStore.getState().activeLineIndex).toBe(0);

    store.goToPrevLine();
    expect(useLyricStore.getState().activeLineIndex).toBe(0);
  });

  it('copies reference translation into translation field with copyReferenceToTranslation', () => {
    const store = useLyricStore.getState();
    store.copyReferenceToTranslation('line-1');
    expect(useLyricStore.getState().lyrics[0].translation).toBe('Ref 1');
  });
});
