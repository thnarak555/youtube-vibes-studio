import React, { useRef, useEffect } from 'react';
import { useLyricStore } from '../../stores/useLyricStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { formatTimeWithMs } from '../../utils/timeFormat';
import { playTapSound } from '../../utils/soundEffects';
import { Play, RotateCcw, FileText } from 'lucide-react';
import { THAI_TEXT } from '../../constants/localization';
import { cn } from '../../utils/cn';

interface FullDocumentViewProps {
  onSeek: (time: number) => void;
}

export const FullDocumentView: React.FC<FullDocumentViewProps> = ({ onSeek }) => {
  const { 
    lyrics, 
    activeLineIndex, 
    updateTranslation, 
    updateOriginal, 
    resetLineToOriginalTime,
    lyricSearchQuery 
  } = useLyricStore();
  const { isPlaying } = usePlayerStore();
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll active line into view gently in document mode
  useEffect(() => {
    if (isPlaying && activeLineRef.current) {
      activeLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeLineIndex, isPlaying]);

  if (lyrics.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-black/20 backdrop-blur-md">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white/40 shadow-xl">
          <FileText className="w-8 h-8" />
        </div>
        <p className="text-sm font-semibold text-white/80">{THAI_TEXT.lyrics.noLyricsTitle}</p>
        <p className="text-xs text-white/40 mt-1 max-w-sm">{THAI_TEXT.lyrics.noLyricsDesc}</p>
      </div>
    );
  }

  const query = lyricSearchQuery.trim().toLowerCase();

  return (
    <div className="h-full flex flex-col overflow-hidden bg-transparent select-none">
      {/* Document Scroll Canvas */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-4 scrollbar-dark select-text">
        <div className="max-w-4xl mx-auto space-y-3">
          {lyrics.map((line, index) => {
            const isActive = index === activeLineIndex;
            const isMatch = query && (
              line.original.toLowerCase().includes(query) ||
              line.translation.toLowerCase().includes(query) ||
              (line.referenceTranslation && line.referenceTranslation.toLowerCase().includes(query))
            );
            const hasTimeChanged = line.originalInTime !== undefined && (
              line.inTime !== line.originalInTime || line.outTime !== line.originalOutTime
            );

            return (
              <div
                key={line.id}
                ref={isActive ? activeLineRef : null}
                className={cn(
                  "group relative p-4 rounded-2xl border transition-all duration-200",
                  isActive
                    ? "border-white/25 shadow-2xl shadow-black/50 ring-1 ring-white/20"
                    : isMatch
                    ? "border-white/20"
                    : "border-white/[0.07] hover:border-white/12"
                )}
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)',
                  backgroundColor: isActive
                    ? '#2c2c2c'
                    : isMatch
                    ? '#2a2a2a'
                    : '#212121'
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Line Number & Timecode */}
                  <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                    <span className="font-mono text-xs text-white/30 w-6 text-right">
                      {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        playTapSound();
                        onSeek(line.inTime);
                      }}
                      className={cn(
                        "min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer active:scale-95",
                        isActive
                          ? "bg-white text-black font-semibold shadow-md shadow-white/20"
                          : "bg-white/10 hover:bg-white/20 text-white/80"
                      )}
                      title="คลิกเพื่อเล่นจากเวลานี้"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{formatTimeWithMs(line.inTime)}</span>
                    </button>

                    {/* Reset time button if modified */}
                    {hasTimeChanged && (
                      <button
                        type="button"
                        onClick={() => {
                          playTapSound();
                          resetLineToOriginalTime(line.id);
                        }}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/15 text-white/40 hover:text-white transition-colors cursor-pointer active:scale-90"
                        title={`${THAI_TEXT.lyrics.resetToOriginalTime}: ${line.originalInTime} วินาที`}
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-white/70" />
                      </button>
                    )}
                  </div>

                  {/* Right: Bilingual Lyrics In-place Inputs */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0">
                    {/* Column 1: Original */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-medium text-white/30 uppercase tracking-wider">
                        {THAI_TEXT.lyrics.originalLyric}
                      </span>
                      <input
                        type="text"
                        value={line.original}
                        onChange={(e) => updateOriginal(line.id, e.target.value)}
                        placeholder={THAI_TEXT.lyrics.originalPlaceholder}
                        className="w-full bg-transparent text-sm font-semibold text-white/90 focus:text-white outline-none border-b border-transparent focus:border-white/20 py-1 transition-colors"
                      />
                      {line.referenceTranslation && (
                        <span className="text-xs text-white/40 italic">
                          {line.referenceTranslation}
                        </span>
                      )}
                    </div>

                    {/* Column 2: Translation */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-medium text-white/50 uppercase tracking-wider">
                        {THAI_TEXT.lyrics.targetTranslation}
                      </span>
                      <input
                        type="text"
                        value={line.translation}
                        onChange={(e) => updateTranslation(line.id, e.target.value)}
                        placeholder={THAI_TEXT.lyrics.translationPlaceholder}
                        className="w-full bg-transparent text-sm font-medium text-white/90 focus:text-white outline-none border-b border-transparent focus:border-white/30 py-1 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
