import React, { useState, useEffect, useRef } from 'react';
import { useLyricStore } from '../../stores/useLyricStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useDesktopLyricsStore } from '../../stores/useDesktopLyricsStore';
import { 
  Lock, 
  Unlock, 
  SlidersHorizontal, 
  X, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  RotateCw 
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const DesktopLyricsOverlay: React.FC = () => {
  const { lyrics, activeLineIndex } = useLyricStore();
  const { isPlaying } = usePlayerStore();

  // Desktop lyrics settings from shared store
  const {
    fontSize,
    secondaryFontSize,
    textColor,
    secondaryColor,
    displayMode,
    shadowIntensity,
    textAlign,
    backgroundOpacity,
    overflowMode,
    isLocked,
    setIsLocked
  } = useDesktopLyricsStore();

  // Hover state with fade-out grace timer to prevent flickering/vanishing
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 400);
  };

  // Ensure 100% transparent window background in Electron
  useEffect(() => {
    document.documentElement.classList.add('desktop-lyrics-window');
    document.body.classList.add('desktop-lyrics-window');
    document.body.style.backgroundColor = 'transparent';
    return () => {
      document.documentElement.classList.remove('desktop-lyrics-window');
      document.body.classList.remove('desktop-lyrics-window');
      document.body.style.backgroundColor = '';
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  // Relayed Data from Main Window via Electron IPC
  const [lyricsData, setLyricsData] = useState<{
    original?: string;
    translation?: string;
    reference?: string;
    prevOriginal?: string;
    nextOriginal?: string;
    isPlaying?: boolean;
    inTime?: number;
    outTime?: number;
    currentTime?: number;
  }>({});

  // Subscribe to IPC data relayed from main window
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const api = (window as any).electronAPI;

      // 1. Initial lock state
      api.desktopLyricsGetLock?.()
        ?.then((locked: boolean) => {
          setIsLocked(Boolean(locked));
        })
        ?.catch(() => {});

      // 2. Lock changed broadcast (from global shortcut Ctrl+Alt+L or main window)
      const unsubLock = api.onDesktopLyricsLockChanged?.((locked: boolean) => {
        setIsLocked(Boolean(locked));
      });

      // 3. Lyrics data stream (all languages, translation, pronunciation, prev/next)
      const unsubData = api.onDesktopLyricsData?.((data: any) => {
        setLyricsData((prev) => ({ ...prev, ...data }));
      });

      // 4. Live settings change broadcast from Main Window settings modal
      const unsubSettings = api.onDesktopLyricsSettingsChanged?.((settings: any) => {
        if (!settings) return;
        useDesktopLyricsStore.getState().updateFromRemote(settings);
      });

      return () => {
        unsubLock?.();
        unsubData?.();
        unsubSettings?.();
      };
    }
  }, []);

  const curOriginal = lyricsData.original !== undefined 
    ? lyricsData.original 
    : (lyrics[activeLineIndex]?.original || lyrics[0]?.original || 'Lyric Studio');
  const curTranslation = lyricsData.translation !== undefined 
    ? lyricsData.translation 
    : (lyrics[activeLineIndex]?.translation || lyrics[0]?.translation || '');
  const curReference = lyricsData.reference !== undefined
    ? lyricsData.reference
    : (lyrics[activeLineIndex]?.referenceTranslation || '');
  const prevOriginal = lyricsData.prevOriginal !== undefined
    ? lyricsData.prevOriginal
    : (lyrics[activeLineIndex - 1]?.original || '');
  const nextOriginal = lyricsData.nextOriginal !== undefined
    ? lyricsData.nextOriginal
    : (lyrics[activeLineIndex + 1]?.original || '');
  const currentIsPlaying = lyricsData.isPlaying !== undefined ? lyricsData.isPlaying : isPlaying;

  // Toggle Lock
  const handleToggleLock = () => {
    const next = !isLocked;
    setIsLocked(next);
    if (typeof window !== 'undefined' && (window as any).electronAPI?.desktopLyricsSetLock) {
      (window as any).electronAPI.desktopLyricsSetLock(next);
    }
  };

  // Open Settings in Main App (YesPlayMusic-MaO architecture)
  const handleOpenSettings = () => {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.openDesktopLyricsSettingsModal) {
      (window as any).electronAPI.openDesktopLyricsSettingsModal();
    }
  };

  // Close window
  const handleClose = () => {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.desktopLyricsClose) {
      (window as any).electronAPI.desktopLyricsClose();
    }
  };

  // Dispatch playback command to main window
  const sendCommand = (action: string, payload?: any) => {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.sendPlayerCommand) {
      (window as any).electronAPI.sendPlayerCommand({ 
        type: action,
        action,
        payload,
        value: payload
      });
    }
  };

  // Interactive mouse events toggle for unlock bubble with guard to prevent event storm
  const isIgnoringRef = useRef(isLocked);
  useEffect(() => {
    isIgnoringRef.current = isLocked;
  }, [isLocked]);

  const handleBubbleMouseEnter = () => {
    if (isIgnoringRef.current) {
      isIgnoringRef.current = false;
      if (typeof window !== 'undefined' && (window as any).electronAPI?.desktopLyricsSetIgnoreMouseEvents) {
        (window as any).electronAPI.desktopLyricsSetIgnoreMouseEvents(false);
      }
    }
  };

  const handleBubbleMouseLeave = () => {
    if (isLocked && !isIgnoringRef.current) {
      isIgnoringRef.current = true;
      if (typeof window !== 'undefined' && (window as any).electronAPI?.desktopLyricsSetIgnoreMouseEvents) {
        (window as any).electronAPI.desktopLyricsSetIgnoreMouseEvents(true, { forward: true });
      }
    }
  };

  // Compute text shadow based on intensity
  const getTextShadow = () => {
    if (shadowIntensity === 'none') return 'none';
    if (shadowIntensity === 'glow') {
      return `0 0 22px ${secondaryColor}99, 0 0 10px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,1), 0 0 2px rgba(0,0,0,1)`;
    }
    if (shadowIntensity === 'strong') {
      return '0 0 16px rgba(0,0,0,0.95), 0 2px 6px rgba(0,0,0,0.95), 0 0 3px rgba(0,0,0,1), 0 1px 2px rgba(0,0,0,1)';
    }
    return '0 0 8px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.9)';
  };

  return (
    <div 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-screen h-screen flex flex-col justify-center items-center select-none overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: backgroundOpacity > 0 ? `rgba(0, 0, 0, ${backgroundOpacity})` : 'transparent',
        // Drag anywhere on the transparent overlay when unlocked
        WebkitAppRegion: isLocked ? 'no-drag' : 'drag'
      } as any}
      title={isLocked ? 'เนื้อเพลงล็อกอยู่' : 'คลิกลากที่ตัวอักษรเพื่อย้ายตำแหน่ง'}
    >
      {/* 1. Interactive Unlock Bubble (Always accessible even when locked) */}
      {isLocked && (
        <div 
          onMouseEnter={handleBubbleMouseEnter}
          onMouseLeave={handleBubbleMouseLeave}
          className="absolute top-2 right-4 z-50 transition-opacity duration-300 opacity-70 hover:opacity-100"
          style={{ WebkitAppRegion: 'no-drag' } as any}
        >
          <button
            onClick={handleToggleLock}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/85 hover:bg-black text-white/90 hover:text-white border border-white/20 backdrop-blur-xl shadow-2xl text-[11px] font-semibold cursor-pointer active:scale-95 transition-all"
            title="ล็อกอยู่ คลิกเพื่อปลดล็อก หรือกด Ctrl+Alt+L"
          >
            <Lock className="w-3.5 h-3.5 text-white/80" />
            <span>คลิกเพื่อปลดล็อก หรือกด Ctrl+Alt+L</span>
          </button>
        </div>
      )}

      {/* 2. Top Floating Control Bar (Shown on hover when unlocked) */}
      {!isLocked && (
        <div 
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={cn(
              "liquid-glass absolute top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 shadow-2xl",
              isHovered ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"
            )}
            style={{
              transitionProperty: 'opacity, transform',
              transitionDuration: '200ms',
              transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)',
              WebkitAppRegion: 'no-drag'
            } as any}
        >
          {/* Interactive Playback Controls */}
          <div className="flex items-center gap-1 pr-2 border-r border-white/15">
            <button
              onClick={() => sendCommand('prev')}
              className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/15 active:scale-95 transition-all cursor-pointer"
              title="เพลงก่อนหน้า"
            >
              <SkipBack className="w-3.5 h-3.5 fill-white/80" />
            </button>
            <button
              onClick={() => sendCommand('seekDelta', -5)}
              className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/15 active:scale-95 transition-all cursor-pointer"
              title="ย้อน 5 วินาที"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => sendCommand('togglePlay')}
              className="p-1.5 rounded-full text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
              title={currentIsPlaying ? "หยุดชั่วคราว" : "เล่น"}
            >
              {currentIsPlaying ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white translate-x-0.5" />
              )}
            </button>
            <button
              onClick={() => sendCommand('seekDelta', 5)}
              className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/15 active:scale-95 transition-all cursor-pointer"
              title="ข้าม 5 วินาที"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => sendCommand('next')}
              className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/15 active:scale-95 transition-all cursor-pointer"
              title="เพลงถัดไป"
            >
              <SkipForward className="w-3.5 h-3.5 fill-white/80" />
            </button>
          </div>

          {/* Actions: Lock, Settings, Close */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleLock}
              className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/15 active:scale-95 transition-all cursor-pointer"
              title="ล็อกตำแหน่ง กด Ctrl+Alt+L เพื่อสลับการล็อก"
            >
              <Unlock className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleOpenSettings}
              className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/15 active:scale-95 transition-all cursor-pointer"
              title="การตั้งค่าเนื้อเพลง"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleClose}
              className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/15 active:scale-95 transition-all cursor-pointer"
              title="ปิดเนื้อเพลงเดสก์ท็อป"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Lyric Display (Draggable from text directly when unlocked) */}
      <div 
        className={cn(
          "w-full px-8 py-4 transition-all duration-300",
          textAlign === 'left' ? "text-left" : textAlign === 'right' ? "text-right" : "text-center",
          isLocked ? "cursor-default" : "cursor-move"
        )}
        style={{
          WebkitAppRegion: isLocked ? 'no-drag' : 'drag'
        } as any}
      >
        {displayMode === 'scroll3' ? (
          /* 3-Line Scrolling Mode */
          <div className="space-y-1.5 pointer-events-none">
            {prevOriginal && (
              <p 
                className={cn(
                  "font-semibold text-white/40 leading-snug",
                  overflowMode === 'ellipsis' ? 'truncate' : 'break-words'
                )}
                style={{ 
                  fontSize: `${Math.round(fontSize * 0.7)}px`,
                  textShadow: getTextShadow()
                }}
              >
                {prevOriginal}
              </p>
            )}

            <h1 
              className={cn(
                "font-extrabold tracking-tight leading-snug",
                overflowMode === 'ellipsis' ? 'truncate' : 'break-words'
              )}
              style={{ 
                fontSize: `${fontSize}px`, 
                color: textColor,
                textShadow: getTextShadow(),
                WebkitTextStroke: '0.4px rgba(0,0,0,0.8)'
              }}
            >
              {curOriginal}
            </h1>

            {nextOriginal && (
              <p 
                className={cn(
                  "font-semibold text-white/40 leading-snug",
                  overflowMode === 'ellipsis' ? 'truncate' : 'break-words'
                )}
                style={{ 
                  fontSize: `${Math.round(fontSize * 0.7)}px`,
                  textShadow: getTextShadow()
                }}
              >
                {nextOriginal}
              </p>
            )}
          </div>
        ) : (
          /* Dual / Triple / Single Line Mode */
          <div className="space-y-1.5 pointer-events-none">
            {/* Original Line */}
            <h1 
              className={cn(
                "font-extrabold tracking-tight leading-snug",
                overflowMode === 'ellipsis' ? 'truncate' : 'break-words'
              )}
              style={{ 
                fontSize: `${fontSize}px`, 
                color: textColor,
                textShadow: getTextShadow(),
                WebkitTextStroke: '0.4px rgba(0,0,0,0.8)'
              }}
            >
              {curOriginal}
            </h1>

            {/* Reference / Pronunciation Line (Triple mode) */}
            {displayMode === 'triple' && curReference && (
              <p 
                className={cn(
                  "font-medium text-white/70 leading-snug",
                  overflowMode === 'ellipsis' ? 'truncate' : 'break-words'
                )}
                style={{ 
                  fontSize: `${Math.round(secondaryFontSize * 0.85)}px`,
                  textShadow: getTextShadow()
                }}
              >
                {curReference}
              </p>
            )}

            {/* Translation Line (Dual & Triple mode) */}
            {(displayMode === 'dual' || displayMode === 'triple') && curTranslation && (
              <p 
                className={cn(
                  "font-semibold leading-snug",
                  overflowMode === 'ellipsis' ? 'truncate' : 'break-words'
                )}
                style={{ 
                  fontSize: `${secondaryFontSize}px`, 
                  color: secondaryColor,
                  textShadow: getTextShadow(),
                  WebkitTextStroke: '0.3px rgba(0,0,0,0.7)'
                }}
              >
                {curTranslation}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
