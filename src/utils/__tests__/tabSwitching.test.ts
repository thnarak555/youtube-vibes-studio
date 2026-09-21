import { describe, it, expect, beforeEach } from 'vitest';
import { useLyricStore } from '../../stores/useLyricStore';
import type { LyricLine, SongMetadata } from '../../types';

describe('Document Tabs & Project Switching', () => {
  beforeEach(() => {
    useLyricStore.getState().clearAll();
  });

  it('persists lyrics and metadata per tab when creating and switching tabs', () => {
    // 1. Setup Song A in initial tab
    const lyricsA: LyricLine[] = [
      { id: '1', inTime: 1.0, outTime: 3.0, original: 'Hello World', translation: 'สวัสดีชาวโลก' }
    ];
    const metaA: SongMetadata = {
      title: 'Song Alpha',
      artist: 'Artist A',
      album: 'Album A',
      coverUrl: 'https://example.com/coverA.jpg',
      audioSrc: 'https://example.com/audioA.mp3',
      duration: 180
    };

    useLyricStore.setState({
      lyrics: lyricsA,
      metadata: metaA
    });

    // 2. Create a new tab for Song B
    useLyricStore.getState().createNewTab();

    const stateAfterNewTab = useLyricStore.getState();
    expect(stateAfterNewTab.openTabs.length).toBe(2);
    expect(stateAfterNewTab.lyrics.length).toBe(0);
    expect(stateAfterNewTab.metadata.title).toBe('');

    // Setup Song B in new tab
    const lyricsB: LyricLine[] = [
      { id: '2', inTime: 2.0, outTime: 5.0, original: 'Song B Line', translation: 'เพลง บี' }
    ];
    const metaB: SongMetadata = {
      title: 'Song Beta',
      artist: 'Artist B',
      album: 'Album B',
      coverUrl: 'https://example.com/coverB.jpg',
      audioSrc: 'https://example.com/audioB.mp3',
      duration: 210
    };

    useLyricStore.setState({
      lyrics: lyricsB,
      metadata: metaB
    });

    // 3. Switch back to Tab 1 (Song A)
    const tab1 = useLyricStore.getState().openTabs[0];
    useLyricStore.getState().openTab(tab1);

    const stateAfterSwitchToTab1 = useLyricStore.getState();
    expect(stateAfterSwitchToTab1.activeTabId).toBe(tab1.id);
    expect(stateAfterSwitchToTab1.metadata.title).toBe('Song Alpha');
    expect(stateAfterSwitchToTab1.lyrics[0].original).toBe('Hello World');

    // 4. Switch back to Tab 2 (Song B)
    const tab2 = useLyricStore.getState().openTabs[1];
    useLyricStore.getState().openTab(tab2);

    const stateAfterSwitchToTab2 = useLyricStore.getState();
    expect(stateAfterSwitchToTab2.activeTabId).toBe(tab2.id);
    expect(stateAfterSwitchToTab2.metadata.title).toBe('Song Beta');
    expect(stateAfterSwitchToTab2.lyrics[0].original).toBe('Song B Line');
  });
});
