import React, { memo, useState, useRef, useEffect } from 'react';
import type { LyricLine } from '../../types';
import { formatTimeWithMs, parseLrcTimestamp } from '../../utils/timeFormat';
import { Play, RotateCw, Plus, Trash2, Clock, Copy, RotateCcw } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useLyricStore } from '../../stores/useLyricStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { THAI_TEXT } from '../../constants/localization';

interface LyricTranslationRowProps {
  line: LyricLine;
  index: number;
  isActive: boolean;
  isLooping: boolean;
  isTranslateMode: boolean;
  onSeek: (time: number) => void;
  onToggleLoop: () => void;
  onUpdateTranslation: (text: string) => void;
  onUpdateOriginal: (text: string) => void;
  onCopyRef: () => void;
  onDelete: () => void;
  onAddBelow: () => void;
}

const CREDIT_KEYWORDS = ['演唱', '词曲', '作词', '作曲', '编曲', '制作人', '人声录音', '人声编辑', '录音', '混音', '母带', '监制', '出品', 'Vocal', 'Composer', 'Arranger', 'Producer'];

function isCreditLine(text: string): boolean {
  if (!text) return false;
  return CREDIT_KEYWORDS.some((kw) => text.includes(kw + '：') || text.includes(kw + ':'));
}

const LyricTranslationRowComponent: React.FC<LyricTranslationRowProps> = ({
  line,
  index,
  isActive,
  isLooping,
  isTranslateMode,
  onSeek,
  onToggleLoop,
  onUpdateTranslation,
  onUpdateOriginal,
  onCopyRef,
  onDelete,
  onAddBelow
}) => {
  const [isEditingOrig, setIsEditingOrig] = useState(false);
  const [isEditingThai, setIsEditingThai] = useState(false);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [timeVal, setTimeVal] = useState(formatTimeWithMs(line.inTime));
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { 
    activeInputFocusTrigger, 
    updateLineTimecode, 
    nudgeLineTimecode, 
    stampCurrentTimeToLine,
    resetLineToOriginalTime,
    lyricSearchQuery 
  } = useLyricStore();
  const { currentTime } = usePlayerStore();

  useEffect(() => {
    setTimeVal(formatTimeWithMs(line.inTime));
  }, [line.inTime]);

  useEffect(() => {
    // Only auto-focus if explicitly editing or triggered, never steal focus on passive song playback
    if (isActive && isEditingThai && inputRef.current) {
      inputRef.current.focus();
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, [isActive, isEditingThai]);

  useEffect(() => {
    // Focus when user triggers typing shortcut (activeInputFocusTrigger > 0)
    if (isActive && isTranslateMode && inputRef.current && activeInputFocusTrigger > 0) {
      inputRef.current.focus();
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, [activeInputFocusTrigger]);

  const handleSaveTime = () => {
    setIsEditingTime(false);
    let parsed = 0;
    if (timeVal.includes(':')) {
      parsed = parseLrcTimestamp(timeVal);
    } else {
      parsed = parseFloat(timeVal) || 0;
    }
    updateLineTimecode(line.id, parsed, line.outTime);
  };

  const isSearchMatch = lyricSearchQuery.trim().length > 0 && (
    (line.original && line.original.toLowerCase().includes(lyricSearchQuery.toLowerCase())) ||
    (line.referenceTranslation && line.referenceTranslation.toLowerCase().includes(lyricSearchQuery.toLowerCase())) ||
    (line.translation && line.translation.toLowerCase().includes(lyricSearchQuery.toLowerCase()))
  );

  const isCredit = isCreditLine(line.original);

  if (isCredit) {
    const parts = line.original.split(/：|:/);
    const role = parts[0] ? parts[0] + '：' : '';
    const name = parts.slice(1).join('：');

    return (
      <div 
        onClick={() => onSeek(line.inTime)}
        className={cn(
          "group py-1 cursor-pointer transition-all duration-300",
          isActive ? "text-white font-bold opacity-100" : "text-white/40 hover:text-white/70 font-medium"
        )}
      >
        <div className="text-sm md:text-base flex items-baseline gap-1.5">
          <span className="font-bold text-white/90">{role}</span>
          <span>{name}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative w-full py-3.5 px-4 sm:px-5 rounded-2xl transition-all duration-300 border",
        isActive
          ? "opacity-100 scale-[1.008] shadow-2xl shadow-black/60 border-white/25 ring-1 ring-white/20"
          : "opacity-90 hover:opacity-100 border-white/[0.08] hover:border-white/15",
        isSearchMatch && "ring-1 ring-white/50 opacity-100"
      )}
      style={{ 
        willChange: 'transform, opacity',
        transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)',
        backgroundColor: isSearchMatch
          ? '#2a2a2a'
          : isActive
          ? '#2c2c2c'
          : '#131313'
      }}
    >
      <div className="flex flex-col gap-1">
        {/* Row Header: Timecode Editor, Nudge & Actions */}
        <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-white/30 font-bold">
              #{(index + 1 < 10 ? '0' : '') + (index + 1)}
            </span>

            {isEditingTime ? (
              <input
                type="text"
                value={timeVal}
                onChange={(e) => setTimeVal(e.target.value)}
                onBlur={handleSaveTime}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTime()}
                autoFocus
                className="w-20 px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] border border-white/30 outline-none"
              />
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsEditingTime(true)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono text-white/50 bg-white/5 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  title="คลิกเพื่อแก้ไขเวลาเริ่ม"
                >
                  <Clock className="w-2.5 h-2.5" />
                  <span>{formatTimeWithMs(line.inTime)}</span>
                </button>

                {/* Micro Nudge Buttons */}
                <button
                  onClick={() => nudgeLineTimecode(line.id, -0.1)}
                  className="px-1.5 py-0.5 rounded text-[9px] font-mono text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="ลดเวลา 0.1 วินาที"
                >
                  -0.1s
                </button>
                <button
                  onClick={() => nudgeLineTimecode(line.id, 0.1)}
                  className="px-1.5 py-0.5 rounded text-[9px] font-mono text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="เพิ่มเวลา 0.1 วินาที"
                >
                  +0.1s
                </button>
                <button
                  onClick={() => stampCurrentTimeToLine(line.id, currentTime)}
                  className="px-1.5 py-0.5 rounded text-[9px] font-medium text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="แสตมป์เวลาเล่นปัจจุบันเป็นเวลาเริ่ม"
                >
                  ⏱ ตอนนี้
                </button>
                {line.originalInTime !== undefined && (line.inTime !== line.originalInTime || line.outTime !== line.originalOutTime) && (
                  <button
                    onClick={() => resetLineToOriginalTime(line.id)}
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title={`${THAI_TEXT.lyrics.resetToOriginalTime}: ${line.originalInTime} วินาที`}
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>รีเซ็ต</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onSeek(line.inTime)}
              className="p-1 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="เริ่มเล่นจากท่อนนี้"
            >
              <Play className="w-3 h-3 fill-current" />
            </button>

            <button
              onClick={onToggleLoop}
              className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium border transition-all cursor-pointer",
                isLooping
                  ? "bg-white/20 text-white border-white/40 shadow-sm shadow-white/10 animate-pulse"
                  : "text-white/50 border-transparent hover:text-white hover:bg-white/10"
              )}
              title="วนซ้ำท่อนนี้ คีย์ลัด R"
            >
              <RotateCw className={cn("w-2.5 h-2.5", isLooping && "animate-spin")} />
              <span>{isLooping ? 'กำลังวนซ้ำ' : 'วนซ้ำ'}</span>
            </button>

            {line.referenceTranslation && !line.translation && (
              <button
                onClick={onCopyRef}
                className="p-1 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="คัดลอกคำแปลอ้างอิงมาใส่ในช่องแปล"
              >
                <Copy className="w-3 h-3" />
              </button>
            )}

            <button
              onClick={onAddBelow}
              className="p-1 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="แทรกบรรทัดถัดไป"
            >
              <Plus className="w-3 h-3" />
            </button>

            <button
              onClick={onDelete}
              className="p-1 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="ลบท่อนนี้"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 1. Primary Original Lyrics Line */}
        {isEditingOrig ? (
          <input
            type="text"
            value={line.original}
            onChange={(e) => onUpdateOriginal(e.target.value)}
            onBlur={() => setIsEditingOrig(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditingOrig(false)}
            autoFocus
            className="w-full bg-white/10 text-white font-bold text-xl px-2.5 py-1 rounded-xl outline-none border border-white/25"
          />
        ) : (
          <div 
            onClick={() => onSeek(line.inTime)}
            onDoubleClick={() => setIsEditingOrig(true)}
            className="cursor-pointer select-text"
            title="คลิกเพื่อเล่น หรือดับเบิ้ลคลิกเพื่อแก้ไขเนื้อร้อง"
          >
            <div
              className={cn(
                "tracking-tight transition-all",
                isActive
                  ? "text-xl sm:text-2xl font-bold text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.25)]"
                  : "text-base sm:text-lg font-medium text-white/70 group-hover:text-white"
              )}
            >
              {line.original || <span className="italic text-white/30">ท่อนว่าง...</span>}
            </div>
          </div>
        )}

        {/* 2. Reference Translation Line */}
        {line.referenceTranslation && (
          <div 
            onClick={() => onSeek(line.inTime)}
            className={cn(
              "text-xs sm:text-sm font-medium transition-colors cursor-pointer select-text flex items-center gap-1.5",
              isActive ? "text-white/80" : "text-white/60 group-hover:text-white/85"
            )}
            title="คำแปลอ้างอิง"
          >
            <span>{line.referenceTranslation}</span>
          </div>
        )}

        {/* 3. Target Thai Translation Input Field */}
        {(isTranslateMode || isActive || isEditingThai) ? (
          <div className="mt-1 flex items-center gap-1.5">
            <input
              ref={inputRef}
              type="text"
              data-lyric-input="translation"
              value={line.translation || ''}
              onChange={(e) => onUpdateTranslation(e.target.value)}
              onBlur={() => {
                if (!isTranslateMode && !isActive) setIsEditingThai(false);
              }}
              onKeyDown={(e) => {
                if (e.key === ' ') {
                  e.stopPropagation();
                }
              }}
              placeholder="พิมพ์คำแปลภาษาไทย..."
              className={cn(
                "w-full px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all outline-none border",
                isActive
                  ? "bg-black/50 text-white placeholder-white/40 border-white/30 focus:border-white/60 focus:ring-1 focus:ring-white/30 shadow-inner"
                  : "bg-black/30 text-white/90 placeholder-white/30 border-white/10 hover:border-white/20 focus:border-white/35 focus:bg-black/45"
              )}
            />
          </div>
        ) : (
          <div 
            onClick={() => setIsEditingThai(true)}
            className={cn(
              "mt-1 text-sm sm:text-base font-medium transition-colors cursor-pointer select-text",
              line.translation 
                ? "text-white/90 opacity-80 group-hover:opacity-100" 
                : "text-white/20 italic hover:text-white/40 text-xs"
            )}
            title="คลิกเพื่อเริ่มพิมพ์คำแปลภาษาไทย"
          >
            {line.translation || 'คลิกเพื่อพิมพ์คำแปล...'}
          </div>
        )}
      </div>
    </div>
  );
};

export const LyricTranslationRow = memo(LyricTranslationRowComponent, (prev, next) => {
  return (
    prev.isActive === next.isActive &&
    prev.isLooping === next.isLooping &&
    prev.isTranslateMode === next.isTranslateMode &&
    prev.line.id === next.line.id &&
    prev.line.inTime === next.line.inTime &&
    prev.line.outTime === next.line.outTime &&
    prev.line.original === next.line.original &&
    prev.line.referenceTranslation === next.line.referenceTranslation &&
    prev.line.translation === next.line.translation
  );
});
