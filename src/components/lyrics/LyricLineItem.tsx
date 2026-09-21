import React, { useRef, useEffect } from 'react';
import { Play, RotateCw, Trash2, Plus, Clock } from 'lucide-react';
import type { LyricLine } from '../../types';
import { formatTimeWithMs } from '../../utils/timeFormat';
import { cn } from '../../utils/cn';

interface LyricLineItemProps {
  line: LyricLine;
  index: number;
  isActive: boolean;
  isLooping: boolean;
  onSeek: (time: number) => void;
  onToggleLoop: () => void;
  onUpdateTranslation: (text: string) => void;
  onUpdateOriginal: (text: string) => void;
  onDelete: () => void;
  onAddBelow: () => void;
}

export const LyricLineItem: React.FC<LyricLineItemProps> = ({
  line,
  index,
  isActive,
  isLooping,
  onSeek,
  onToggleLoop,
  onUpdateTranslation,
  onUpdateOriginal,
  onDelete,
  onAddBelow
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Focus input when line becomes active if triggered by user navigation
  useEffect(() => {
    // optional subtle focus helper
  }, [isActive]);

  const lineNumStr = (index + 1 < 10 ? '0' : '') + (index + 1);

  return (
    <div 
      className={cn(
        "group relative w-full p-4 rounded-2xl transition-all duration-300",
        isActive ? "glass-card-active scale-[1.01]" : "glass-card hover:bg-white/[0.06]"
      )}
    >
      {/* Active Glow Accent Border on Left */}
      {isActive && (
        <div className="absolute left-0 top-3 bottom-3 w-1.5 bg-white rounded-r-full shadow-lg shadow-white/30" />
      )}

      <div className="flex flex-col gap-2.5">
        {/* Top bar: Timecode pill & Quick Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-mono text-white/30 font-semibold">
              #{lineNumStr}
            </span>

            <button
              onClick={() => onSeek(line.inTime)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border transition-colors cursor-pointer",
                isActive 
                  ? "bg-white/20 text-white border-white/40 shadow-sm" 
                  : "bg-black/30 text-white/40 border-white/10 hover:border-white/20 hover:text-white"
              )}
              title="คลิกเพื่อเล่นจากจุดนี้"
            >
              <Clock className="w-3 h-3" />
              <span>{formatTimeWithMs(line.inTime)} - {formatTimeWithMs(line.outTime)}</span>
            </button>
          </div>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onSeek(line.inTime)}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="เล่นท่อนนี้"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>

            <button
              onClick={onToggleLoop}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer",
                isLooping 
                  ? "bg-white/20 text-white border-white/40 shadow-sm shadow-white/10 animate-pulse" 
                  : "text-white/40 border-transparent hover:text-white hover:bg-white/10"
              )}
              title="วนซ้ำท่อนนี้เพื่อฟังซ้ำ คีย์ลัด R หรือ Ctrl+Space"
            >
              <RotateCw className={cn("w-3 h-3", isLooping && "animate-spin")} />
              <span>{isLooping ? 'กำลังวนซ้ำ' : 'วนซ้ำ'}</span>
            </button>

            <button
              onClick={onAddBelow}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="แทรกบรรทัดถัดไป"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="ลบบรรทัดนี้"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Middle: Original Lyrics (EN / CN / JP) */}
        <div className="pl-1">
          <input
            type="text"
            value={line.original}
            onChange={(e) => onUpdateOriginal(e.target.value)}
            className={cn(
              "w-full bg-transparent font-medium tracking-tight outline-none transition-colors",
              isActive 
                ? "text-xl md:text-2xl text-white font-semibold" 
                : "text-base md:text-lg text-white/70 hover:text-white"
            )}
            placeholder="เนื้อร้องต้นฉบับ..."
          />
        </div>

        {/* Bottom: Thai Translation Input Box */}
        <div className="w-full">
          <input
            ref={inputRef}
            type="text"
            value={line.translation}
            onChange={(e) => onUpdateTranslation(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                // Focus next line if possible
                const nextInput = (e.target as HTMLElement).closest('.group')?.nextElementSibling?.querySelector('input[type="text"]:last-of-type') as HTMLInputElement | null;
                if (nextInput) nextInput.focus();
              }
            }}
            placeholder="พิมพ์คำแปลภาษาไทยที่นี่ กด Tab เพื่อไปท่อนถัดไป"
            className={cn(
              "w-full px-4 py-2.5 rounded-xl text-sm md:text-base font-normal tracking-wide glass-input",
              isActive 
                ? "border-white/40 shadow-md shadow-white/5 text-white placeholder-white/30" 
                : "text-white/80 placeholder-white/20"
            )}
          />
        </div>
      </div>
    </div>
  );
};
