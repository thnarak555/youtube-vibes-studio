import React, { useRef, useEffect, useState } from 'react';
import { LyricTranslationRow } from './LyricTranslationRow';
import { FullDocumentView } from './FullDocumentView';
import { useLyricStore } from '../../stores/useLyricStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { 
  ChevronLeft,
  ChevronRight,
  Play,
  Edit3,
  Languages
} from 'lucide-react';
import { formatTimeWithMs } from '../../utils/timeFormat';
import { playTapSound } from '../../utils/soundEffects';
import { APP_TEXT, THAI_TEXT } from '../../constants/localization';

interface RightLyricsPanelProps {
  onSeek: (time: number) => void;
  onOpenSearch: () => void;
}

export const RightLyricsPanel: React.FC<RightLyricsPanelProps> = ({ onSeek, onOpenSearch }) => {
  const { 
    lyrics, 
    activeLineIndex, 
    loopLineIndex, 
    setLoopLineIndex, 
    updateTranslation, 
    updateOriginal, 
    removeLine, 
    addLine,
    setActiveLineIndex,
    displayMode,
    isLyricSearchOpen,
    setIsLyricSearchOpen,
    setLyricSearchQuery,
    isTranslateMode,
    undo,
    redo,
    canUndo,
    canRedo
  } = useLyricStore();

  const { isPlaying, currentTime } = usePlayerStore();
  const [isEditingOriginalInFade, setIsEditingOriginalInFade] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Smooth Auto-Center Active Line in Normal (Scroll) Mode
  useEffect(() => {
    if (!isPlaying || displayMode !== 'normal') return;
    const container = containerRef.current;
    if (!container) return;
    const activeEl = container.children[activeLineIndex] as HTMLElement | null;
    if (activeEl) {
      const targetScroll = activeEl.offsetTop - container.clientHeight / 2 + activeEl.clientHeight / 2;
      container.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
    }
  }, [activeLineIndex, isPlaying, displayMode]);

  // Keyboard shortcut Ctrl + F to open in-lyrics search & Ctrl+Z / Ctrl+Y for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      if (isCtrlOrMeta && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          if (canRedo) redo();
        } else {
          if (canUndo) undo();
        }
      } else if (isCtrlOrMeta && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        if (canRedo) redo();
      } else if (isCtrlOrMeta && e.key.toLowerCase() === 'f') {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT') {
          e.preventDefault();
          setIsLyricSearchOpen(true);
        }
      } else if (e.key === 'Escape' && isLyricSearchOpen) {
        setIsLyricSearchOpen(false);
        setLyricSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLyricSearchOpen, setLyricSearchQuery, setIsLyricSearchOpen, undo, redo, canUndo, canRedo]);

  if (lyrics.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-black/20 backdrop-blur-md">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white/40 shadow-xl">
          <Languages className="w-8 h-8" />
        </div>
        <p className="text-sm font-semibold text-white/80">{APP_TEXT.lyricsToolbar.noLyricsTitle}</p>
        <p className="text-xs text-white/40 mt-1 max-w-sm">
          {APP_TEXT.lyricsToolbar.noLyricsDesc}
        </p>
        <button
          onClick={onOpenSearch}
          className="mt-6 px-5 py-2.5 rounded-2xl bg-white text-black font-semibold text-xs shadow-lg shadow-white/10 hover:bg-white/90 hover:scale-105 transition-all cursor-pointer"
        >
          {APP_TEXT.lyricsToolbar.startSearch}
        </button>
      </div>
    );
  }

  const activeLine = lyrics[activeLineIndex] || lyrics[0];

  // Pure Visual Fade Math without layout bouncing or jumping
  const smartFade = (() => {
    if (!activeLine) return { opacity: 1 };
    const inT = activeLine.inTime;
    const outT = activeLine.outTime;
    const dur = Math.max(0.1, outT - inT);
    const progress = (currentTime - inT) / dur;

    // Smoothstep cubic easing: 3x^2 - 2x^3
    const smoothstep = (min: number, max: number, value: number) => {
      const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
      return x * x * (3 - 2 * x);
    };

    let opacity = 1;
    if (progress < 0.15) {
      opacity = smoothstep(0, 0.15, progress);
    } else if (progress > 0.82) {
      opacity = 1 - smoothstep(0.82, 1.0, progress);
    }

    return { opacity };
  })();

  return (
    <div className="h-full flex flex-col overflow-hidden bg-transparent select-none relative">
      {/* Main Lyric Area depending on Display Mode */}
      {displayMode === 'document' ? (
        /* MODE 3: FULL DOCUMENT VIEW (View All Lyrics Mode) */
        <FullDocumentView onSeek={onSeek} />
      ) : displayMode === 'fade' ? (
        /* MODE 2: TRUE VISUAL FADE FOCUS MODE (No layout jumping/bouncing animation!) */
        <div className="flex-1 flex flex-col justify-center items-center p-8 text-center relative overflow-hidden select-none">
          <div 
            key={activeLine.id}
            className="max-w-2xl w-full flex flex-col items-center gap-4"
            style={{
              opacity: isPlaying ? Math.max(0.12, smartFade.opacity) : 1,
              transitionProperty: 'opacity',
              transitionDuration: '500ms',
              transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)'
            }}
          >
            {/* Active Line Timecode Badge */}
            <div className="flex items-center gap-2 text-xs font-mono text-white/40">
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                #{activeLineIndex + 1} • {formatTimeWithMs(activeLine.inTime)}
              </span>
            </div>

            {/* Main Active Original Lyrics (Big Luminous Focus with In-place Editing) */}
            {isEditingOriginalInFade ? (
              <input
                autoFocus
                type="text"
                value={activeLine.original}
                onChange={(e) => updateOriginal(activeLine.id, e.target.value)}
                onBlur={() => setIsEditingOriginalInFade(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === 'Escape') setIsEditingOriginalInFade(false);
                }}
                className="w-full max-w-xl text-center text-2xl sm:text-3xl font-bold text-white bg-white/10 border border-white/25 rounded-2xl px-4 py-2 outline-none shadow-inner"
              />
            ) : (
              <div className="group relative flex items-center justify-center gap-2">
                <h2 
                  onClick={() => {
                    playTapSound();
                    onSeek(activeLine.inTime);
                  }}
                  onDoubleClick={() => setIsEditingOriginalInFade(true)}
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-relaxed drop-shadow-[0_0_25px_rgba(255,255,255,0.3)] cursor-pointer transition-all duration-300 hover:text-white/90"
                  title="คลิกเพื่อเล่น หรือดับเบิลคลิกเพื่อแก้ไขเนื้อร้อง"
                >
                  {activeLine.original || 'ท่อนว่าง...'}
                </h2>
                <button
                  onClick={() => setIsEditingOriginalInFade(true)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-opacity cursor-pointer"
                  title="แก้ไขเนื้อร้องต้นฉบับ"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Reference Translation if any */}
            {activeLine.referenceTranslation && (
              <p className="text-sm sm:text-base font-medium text-white/60">
                {activeLine.referenceTranslation}
              </p>
            )}

            {/* Translation Input or Text */}
            {isTranslateMode ? (
              <div className="w-full max-w-lg mt-2">
                <input
                  type="text"
                  value={activeLine.translation || ''}
                  onChange={(e) => updateTranslation(activeLine.id, e.target.value)}
                  placeholder={THAI_TEXT.lyrics.translationPlaceholder}
                  className="w-full text-center text-lg sm:text-xl font-medium text-white placeholder-white/20 bg-white/5 hover:bg-white/10 focus:bg-white/15 border border-white/10 focus:border-white/40 rounded-2xl px-4 py-2.5 outline-none transition-all shadow-lg"
                />
              </div>
            ) : (
              activeLine.translation && (
                <p className="text-lg sm:text-xl font-medium text-white/90 drop-shadow-md">
                  {activeLine.translation}
                </p>
              )
            )}

            {/* Micro Navigation in Fade Mode */}
            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={() => {
                  playTapSound();
                  if (activeLineIndex > 0) {
                    setActiveLineIndex(activeLineIndex - 1);
                    onSeek(lyrics[activeLineIndex - 1].inTime);
                  }
                }}
                disabled={activeLineIndex === 0}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white disabled:opacity-20 transition-all cursor-pointer"
                title="ท่อนก่อนหน้า"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  playTapSound();
                  onSeek(activeLine.inTime);
                }}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-white/80 transition-all cursor-pointer flex items-center gap-1.5"
                title="เล่นท่อนนี้ซ้ำ"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>เล่นท่อนนี้</span>
              </button>

              <button
                onClick={() => {
                  playTapSound();
                  if (activeLineIndex < lyrics.length - 1) {
                    setActiveLineIndex(activeLineIndex + 1);
                    onSeek(lyrics[activeLineIndex + 1].inTime);
                  }
                }}
                disabled={activeLineIndex === lyrics.length - 1}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white disabled:opacity-20 transition-all cursor-pointer"
                title="ท่อนถัดไป"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* MODE 1: NORMAL TIMELINE SCROLL VIEW */
        <div 
          ref={containerRef}
          className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 space-y-2 scrollbar-dark select-none"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 6%, black 94%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 6%, black 94%, transparent 100%)'
          }}
        >
          {lyrics.map((line, idx) => (
            <LyricTranslationRow
              key={line.id}
              line={line}
              index={idx}
              isActive={idx === activeLineIndex}
              isLooping={loopLineIndex === idx}
              isTranslateMode={isTranslateMode}
              onSeek={onSeek}
              onToggleLoop={() => {
                playTapSound();
                setLoopLineIndex(loopLineIndex === idx ? null : idx);
              }}
              onUpdateTranslation={(text) => updateTranslation(line.id, text)}
              onUpdateOriginal={(text) => updateOriginal(line.id, text)}
              onCopyRef={() => {
                playTapSound();
                if (line.referenceTranslation) {
                  updateTranslation(line.id, line.referenceTranslation);
                }
              }}
              onDelete={() => {
                playTapSound();
                removeLine(line.id);
              }}
              onAddBelow={() => {
                playTapSound();
                addLine(idx);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
