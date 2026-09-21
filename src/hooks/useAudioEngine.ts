import { useEffect, useRef, useCallback } from 'react';
import { usePlayerStore } from '../stores/usePlayerStore';
import { useLyricStore } from '../stores/useLyricStore';

// Helper to reliably find active line index
function findActiveLyricIndex(lyrics: Array<{ inTime: number }>, time: number): number {
  if (!lyrics || lyrics.length === 0) return 0;
  let bestIdx = 0;
  for (let i = 0; i < lyrics.length; i++) {
    if (time >= lyrics[i].inTime) {
      bestIdx = i;
    }
  }
  return bestIdx;
}

export function useAudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthTimerRef = useRef<number | null>(null);

  const {
    isPlaying,
    playbackRate,
    volume,
    isMuted,
    setIsPlaying,
    setCurrentTime,
    setDuration
  } = usePlayerStore();

  const { lyrics, loopLineIndex, activeLineIndex } = useLyricStore();
  const audioSrc = useLyricStore((state) => state.metadata.audioSrc);

  // Mutable refs to prevent recreating audio event listeners
  const lyricsRef = useRef(lyrics);
  lyricsRef.current = lyrics;
  const loopLineIndexRef = useRef(loopLineIndex);
  loopLineIndexRef.current = loopLineIndex;
  const activeLineIndexRef = useRef(activeLineIndex);
  activeLineIndexRef.current = activeLineIndex;
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const playbackRateRef = useRef(playbackRate);
  playbackRateRef.current = playbackRate;

  // 1. Initialize persistent audio element ONCE
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    const onTimeUpdate = () => {
      const cur = audio.currentTime;
      setCurrentTime(cur);

      // Handle Line Looping
      const lyricState = useLyricStore.getState();
      const curLyrics = lyricState.lyrics;
      const currentLoop = lyricState.loopLineIndex;

      if (currentLoop !== null && curLyrics[currentLoop]) {
        const loopLine = curLyrics[currentLoop];
        if (cur >= loopLine.outTime || cur < loopLine.inTime - 0.5) {
          audio.currentTime = loopLine.inTime;
          return;
        }
      }

      // Sync active line index smoothly
      const bestIdx = findActiveLyricIndex(curLyrics, cur);
      if (curLyrics.length > 0 && bestIdx !== lyricState.activeLineIndex) {
        lyricState.setActiveLineIndex(bestIdx);
      }

      // Dispatch to Desktop Lyrics IPC
      const activeLine = curLyrics[bestIdx] || curLyrics[0];
      if (typeof window !== 'undefined' && (window as any).electronAPI?.desktopLyricsUpdate) {
        (window as any).electronAPI.desktopLyricsUpdate({
          original: activeLine?.original || '',
          translation: activeLine?.translation || '',
          reference: activeLine?.referenceTranslation || '',
          prevOriginal: curLyrics[bestIdx - 1]?.original || '',
          nextOriginal: curLyrics[bestIdx + 1]?.original || '',
          isPlaying: true,
          inTime: activeLine?.inTime || 0,
          outTime: activeLine?.outTime || 0,
          currentTime: cur
        });
      }
    };

    const onLoadedMetadata = () => {
      if (audio.duration && Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onPlay = () => {
      setIsPlaying(true);
      if (typeof window !== 'undefined' && (window as any).electronAPI?.desktopLyricsUpdate) {
        (window as any).electronAPI.desktopLyricsUpdate({ isPlaying: true });
      }
    };

    const onPause = () => {
      setIsPlaying(false);
      if (typeof window !== 'undefined' && (window as any).electronAPI?.desktopLyricsUpdate) {
        (window as any).electronAPI.desktopLyricsUpdate({ isPlaying: false });
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      if (typeof window !== 'undefined' && (window as any).electronAPI?.desktopLyricsUpdate) {
        (window as any).electronAPI.desktopLyricsUpdate({ isPlaying: false });
      }
    };

    const onError = (e: Event) => {
      // Suppress false errors when no real src is loaded (e.g. at app startup)
      if (!audio.src || audio.src === window.location.href || audio.src === '') return;
      // Suppress MEDIA_ERR_SRC_NOT_SUPPORTED (code 4) on initial empty state
      if (audio.error?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED && !audio.currentSrc) return;
      console.warn('Audio playback error, falling back to synthetic timer:', e, audio.error);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.pause();
      if (synthTimerRef.current) clearInterval(synthTimerRef.current);
    };
  }, [setCurrentTime, setDuration, setIsPlaying]);

  // 2. Sync volume & rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.playbackRate = playbackRate;
    }
  }, [volume, isMuted, playbackRate]);

  // Helper to start synthetic timer when real audio cannot play or is not loaded
  const startSynthTimer = useCallback(() => {
    if (synthTimerRef.current) clearInterval(synthTimerRef.current);
    const interval = 50;
    synthTimerRef.current = window.setInterval(() => {
      const next = usePlayerStore.getState().currentTime + (interval / 1000) * playbackRateRef.current;
      const lyricState = useLyricStore.getState();
      const curLyrics = lyricState.lyrics;
      const currentLoop = lyricState.loopLineIndex;

      if (currentLoop !== null && curLyrics[currentLoop]) {
        if (next >= curLyrics[currentLoop].outTime) {
          setCurrentTime(curLyrics[currentLoop].inTime);
          return;
        }
      }

      setCurrentTime(next);

      // Find active line
      const bestIdx = findActiveLyricIndex(curLyrics, next);
      if (curLyrics.length > 0 && bestIdx !== lyricState.activeLineIndex) {
        lyricState.setActiveLineIndex(bestIdx);
      }

      // Dispatch to Desktop Lyrics IPC
      const activeLine = curLyrics[bestIdx] || curLyrics[0];
      if (typeof window !== 'undefined' && (window as any).electronAPI?.desktopLyricsUpdate) {
        (window as any).electronAPI.desktopLyricsUpdate({
          original: activeLine?.original || '',
          translation: activeLine?.translation || '',
          reference: activeLine?.referenceTranslation || '',
          prevOriginal: curLyrics[bestIdx - 1]?.original || '',
          nextOriginal: curLyrics[bestIdx + 1]?.original || '',
          isPlaying: true,
          inTime: activeLine?.inTime || 0,
          outTime: activeLine?.outTime || 0,
          currentTime: next
        });
      }
    }, interval);
    setIsPlaying(true);
  }, [setCurrentTime, setIsPlaying]);

  // 3. Load audio source
  const loadAudioSource = useCallback((src: string, autoPlay = false) => {
    const audio = audioRef.current;
    if (!audio) return;

    // Hard stop everything first — prevents race condition when switching projects
    audio.pause();
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (synthTimerRef.current) clearInterval(synthTimerRef.current);

    if (!src) {
      audio.removeAttribute('src');
      audio.load();
      return;
    }

    audio.src = src;
    audio.currentTime = 0;
    audio.load();

    if (autoPlay) {
      // Wait for canplay before attempting play — fixes race condition on file:// in Electron
      const tryPlay = () => {
        audio.removeEventListener('canplay', tryPlay);
        audio.play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('Autoplay prevented or failed, falling back to synthetic timer:', err);
            startSynthTimer();
          });
      };
      audio.addEventListener('canplay', tryPlay, { once: true });
    } else {
      setIsPlaying(false);
    }
  }, [setCurrentTime, setIsPlaying, setDuration, startSynthTimer]);

  // 4. Auto-sync audio element when metadata.audioSrc changes (e.g. project switch or new song loaded)
  const prevSrcRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (audioSrc !== prevSrcRef.current) {
      prevSrcRef.current = audioSrc;
      loadAudioSource(audioSrc || '', false);
    }
  }, [audioSrc, loadAudioSource]);

  // 5. Seek to time
  const seekTo = useCallback((timeSec: number) => {
    const audio = audioRef.current;
    const safeTime = Math.max(0, timeSec);
    if (audio && audio.src && audio.src !== window.location.href) {
      audio.currentTime = safeTime;
    }
    setCurrentTime(safeTime);

    const lyricState = useLyricStore.getState();
    const curLyrics = lyricState.lyrics;
    const bestIdx = findActiveLyricIndex(curLyrics, safeTime);
    if (curLyrics.length > 0) {
      lyricState.setActiveLineIndex(bestIdx);
    }
    const activeLine = curLyrics[bestIdx] || curLyrics[0];
    if (typeof window !== 'undefined' && (window as any).electronAPI?.desktopLyricsUpdate) {
      (window as any).electronAPI.desktopLyricsUpdate({
        original: activeLine?.original || '',
        translation: activeLine?.translation || '',
        isPlaying: isPlayingRef.current,
        inTime: activeLine?.inTime || 0,
        outTime: activeLine?.outTime || 0,
        currentTime: safeTime
      });
    }
  }, [setCurrentTime]);

  // 6. Toggle Play / Pause
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.src && audio.src !== window.location.href) {
      if (audio.paused) {
        if (synthTimerRef.current) clearInterval(synthTimerRef.current);

        const doPlay = () => {
          audio.play()
            .then(() => setIsPlaying(true))
            .catch(err => {
              console.warn('Audio play error, falling back to synthetic timer:', err);
              startSynthTimer();
            });
        };

        // If audio isn't ready yet, wait for canplay first
        if (audio.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
          doPlay();
        } else {
          audio.addEventListener('canplay', doPlay, { once: true });
        }
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    } else {
      // Synthetic fallback timer when no audio file is loaded
      if (isPlayingRef.current) {
        if (synthTimerRef.current) clearInterval(synthTimerRef.current);
        setIsPlaying(false);
      } else {
        startSynthTimer();
      }
    }
  }, [setIsPlaying, startSynthTimer]);

  // 7. Listen to Desktop Lyrics IPC Player Commands
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.onPlayerCommand) {
      const unsub = (window as any).electronAPI.onPlayerCommand((cmd: { type?: string; action?: string; payload?: any; value?: any }) => {
        if (!cmd) return;
        const type = cmd.type || cmd.action;
        const payload = cmd.payload !== undefined ? cmd.payload : cmd.value;

        if (type === 'toggle' || type === 'togglePlay') {
          togglePlay();
        } else if (type === 'play') {
          if (!usePlayerStore.getState().isPlaying) togglePlay();
        } else if (type === 'pause') {
          if (usePlayerStore.getState().isPlaying) togglePlay();
        } else if (type === 'seekDelta') {
          if (typeof payload === 'number') {
            const cur = usePlayerStore.getState().currentTime;
            seekTo(Math.max(0, cur + payload));
          }
        } else if (type === 'seek') {
          if (typeof payload === 'number') {
            seekTo(payload);
          }
        } else if (type === 'prev') {
          const lyricState = useLyricStore.getState();
          const curIdx = lyricState.activeLineIndex;
          if (curIdx > 0 && lyricState.lyrics[curIdx - 1]) {
            seekTo(lyricState.lyrics[curIdx - 1].inTime);
          } else {
            seekTo(Math.max(0, usePlayerStore.getState().currentTime - 5));
          }
        } else if (type === 'next') {
          const lyricState = useLyricStore.getState();
          const curIdx = lyricState.activeLineIndex;
          if (curIdx < lyricState.lyrics.length - 1 && lyricState.lyrics[curIdx + 1]) {
            seekTo(lyricState.lyrics[curIdx + 1].inTime);
          } else {
            seekTo(usePlayerStore.getState().currentTime + 5);
          }
        }
      });
      return () => {
        if (typeof unsub === 'function') unsub();
      };
    }
  }, [togglePlay, seekTo]);

  return {
    togglePlay,
    seekTo,
    loadAudioSource,
    audioElement: audioRef.current
  };
}
