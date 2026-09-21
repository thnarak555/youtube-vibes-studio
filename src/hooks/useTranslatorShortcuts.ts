import { useEffect } from 'react';
import { useLyricStore } from '../stores/useLyricStore';
import { usePlayerStore } from '../stores/usePlayerStore';

export function useTranslatorShortcuts(
  togglePlay: () => void,
  seekTo: (time: number) => void
) {
  const { 
    lyrics, 
    activeLineIndex, 
    loopLineIndex, 
    setActiveLineIndex, 
    setLoopLineIndex, 
    forceSave,
    typeIntoActiveLine,
    copyReferenceToTranslation,
    goToNextLine,
    goToPrevLine
  } = useLyricStore();
  const { playbackRate, setPlaybackRate } = usePlayerStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputFocused = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      // 0. Instant Save: Ctrl + S or Cmd + S (works anytime, even while typing)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        forceSave();
        return;
      }

      // 1. When typing inside an input / textarea
      if (isInputFocused) {
        const isLyricInput = target.getAttribute('data-lyric-input') === 'translation';

        // Escape: Unfocus input
        if (e.key === 'Escape') {
          target.blur();
          return;
        }

        // If NOT a lyric translation input (e.g. search bar, settings modal input, project name), DO NOT hijack Enter/Tab/Space!
        if (!isLyricInput) {
          return;
        }

        // Ctrl + Space: Play / Pause without leaving input
        if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
          e.preventDefault();
          togglePlay();
          return;
        }

        // Ctrl + R: Replay current active line from inTime
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') {
          e.preventDefault();
          if (lyrics[activeLineIndex]) {
            seekTo(lyrics[activeLineIndex].inTime);
          }
          return;
        }

        // Enter (without Shift): Move to next line and focus its translation input
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          goToNextLine();
          if (lyrics[activeLineIndex + 1]) {
            seekTo(lyrics[activeLineIndex + 1].inTime);
          }
          return;
        }

        // Shift + Enter: Move to previous line and focus its translation input
        if (e.key === 'Enter' && e.shiftKey) {
          e.preventDefault();
          goToPrevLine();
          if (lyrics[activeLineIndex - 1]) {
            seekTo(lyrics[activeLineIndex - 1].inTime);
          }
          return;
        }

        // Tab: Copy reference translation into current translation field without web-style cycling
        if (e.key === 'Tab') {
          e.preventDefault();
          if (!e.shiftKey && !e.ctrlKey) {
            const curLine = lyrics[activeLineIndex];
            if (curLine && curLine.referenceTranslation) {
              copyReferenceToTranslation(curLine.id);
            }
          }
          return;
        }

        // If regular key typing inside input, let standard browser input handle it
        return;
      }

      // 2. Navigation Mode (Not typing in any input)

      // Prevent website-style tab cycling, space scroll or arrow scrolling
      if (
        e.key === 'Tab' ||
        e.code === 'Space' || 
        e.key === 'ArrowUp' || 
        e.key === 'ArrowDown' || 
        e.key === 'ArrowLeft' || 
        e.key === 'ArrowRight'
      ) {
        e.preventDefault();
      }

      // Space: Play / Pause
      if (e.code === 'Space') {
        togglePlay();
        return;
      }

      // R or Ctrl+Space: Loop current line
      if (e.key.toLowerCase() === 'r' || ((e.ctrlKey || e.metaKey) && e.code === 'Space')) {
        if (loopLineIndex === activeLineIndex) {
          setLoopLineIndex(null);
        } else {
          setLoopLineIndex(activeLineIndex);
          if (lyrics[activeLineIndex]) {
            seekTo(lyrics[activeLineIndex].inTime);
          }
        }
        return;
      }

      // Escape: Cancel loop
      if (e.key === 'Escape') {
        if (loopLineIndex !== null) {
          setLoopLineIndex(null);
        }
        return;
      }

      // Speed control: [ / ]
      if (e.key === '[') {
        setPlaybackRate(Math.max(0.5, Number((playbackRate - 0.1).toFixed(2))));
        return;
      } else if (e.key === ']') {
        setPlaybackRate(Math.min(1.5, Number((playbackRate + 0.1).toFixed(2))));
        return;
      }

      // YouTube-Style Navigation & Line Jumping
      // Shift + Left/Right: Seek +/- 5 seconds (YouTube style)
      if (e.shiftKey && e.key === 'ArrowLeft') {
        const cur = usePlayerStore.getState().currentTime;
        seekTo(Math.max(0, cur - 5));
        return;
      }
      if (e.shiftKey && e.key === 'ArrowRight') {
        const cur = usePlayerStore.getState().currentTime;
        const dur = usePlayerStore.getState().duration || 9999;
        seekTo(Math.min(dur, cur + 5));
        return;
      }

      // ArrowLeft, ArrowUp, or 'J': Jump to PREVIOUS lyric line & seek
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key.toLowerCase() === 'j') {
        if (activeLineIndex > 0) {
          const targetIdx = activeLineIndex - 1;
          setActiveLineIndex(targetIdx);
          seekTo(lyrics[targetIdx].inTime);
        }
        return;
      }

      // ArrowRight, ArrowDown, or 'L': Jump to NEXT lyric line & seek
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key.toLowerCase() === 'l') {
        if (activeLineIndex < lyrics.length - 1) {
          const targetIdx = activeLineIndex + 1;
          setActiveLineIndex(targetIdx);
          seekTo(lyrics[targetIdx].inTime);
        }
        return;
      }

      // 3. Type-to-Translate QoL:
      // When user presses any printable character (Thai, Latin, digits, symbols),
      // auto-focus the active line translation input and append that character!
      if (!e.ctrlKey && !e.altKey && !e.metaKey && e.key.length === 1) {
        e.preventDefault();
        typeIntoActiveLine(e.key);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    lyrics,
    activeLineIndex,
    loopLineIndex,
    playbackRate,
    togglePlay,
    seekTo,
    setActiveLineIndex,
    setLoopLineIndex,
    setPlaybackRate,
    forceSave,
    typeIntoActiveLine,
    copyReferenceToTranslation,
    goToNextLine,
    goToPrevLine
  ]);
}
