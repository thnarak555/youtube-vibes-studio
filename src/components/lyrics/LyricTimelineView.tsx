import React, { useRef, useEffect } from 'react';
import { LyricLineItem } from './LyricLineItem';
import { useLyricStore } from '../../stores/useLyricStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { Music, Plus } from 'lucide-react';

interface LyricTimelineViewProps {
  onSeek: (time: number) => void;
  onOpenImport: () => void;
}

export const LyricTimelineView: React.FC<LyricTimelineViewProps> = ({ onSeek, onOpenImport }) => {
  const { 
    lyrics, 
    activeLineIndex, 
    loopLineIndex, 
    setLoopLineIndex, 
    updateTranslation, 
    updateOriginal, 
    removeLine, 
    addLine 
  } = useLyricStore();

  const { isPlaying } = usePlayerStore();
  const listContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll active line to center smoothly during playback
  useEffect(() => {
    if (!isPlaying) return;
    const activeEl = listContainerRef.current?.children[activeLineIndex] as HTMLElement | null;
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeLineIndex, isPlaying]);

  if (lyrics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white/60">
          <Music className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">ยังไม่มีเนื้อเพลง</h2>
        <p className="text-sm text-white/40 max-w-md mb-6">
          นำเข้าไฟล์ .lrc, .srt หรือวางข้อความเนื้อเพลงเพื่อเริ่มการแปลพร้อมฟังเพลง
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenImport}
            className="min-h-[44px] px-6 py-2.5 rounded-2xl text-sm font-semibold text-black bg-white hover:bg-white/90 transition-all shadow-lg shadow-white/10 active:scale-95 cursor-pointer"
          >
            นำเข้าไฟล์เนื้อเพลง
          </button>
          <button
            onClick={() => addLine()}
            className="min-h-[44px] px-5 py-2.5 rounded-2xl text-sm font-medium text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95 cursor-pointer"
          >
            สร้างท่อนแรก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 pb-36">
      <div ref={listContainerRef} className="flex flex-col gap-3.5">
        {lyrics.map((line, idx) => (
          <LyricLineItem
            key={line.id}
            line={line}
            index={idx}
            isActive={idx === activeLineIndex}
            isLooping={idx === loopLineIndex}
            onSeek={onSeek}
            onToggleLoop={() => {
              if (loopLineIndex === idx) {
                setLoopLineIndex(null);
              } else {
                setLoopLineIndex(idx);
                onSeek(line.inTime);
              }
            }}
            onUpdateTranslation={(text) => updateTranslation(line.id, text)}
            onUpdateOriginal={(text) => updateOriginal(line.id, text)}
            onDelete={() => removeLine(line.id)}
            onAddBelow={() => addLine(idx)}
          />
        ))}
      </div>

      {/* Add new line button at the bottom */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => addLine()}
          className="min-h-[44px] flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-semibold text-white/80 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white/70" />
          <span>เพิ่มท่อนต่อท้าย</span>
        </button>
      </div>
    </div>
  );
};
