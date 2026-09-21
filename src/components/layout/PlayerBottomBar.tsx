import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  SkipBack, 
  SkipForward, 
  Gauge
} from 'lucide-react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useLyricStore } from '../../stores/useLyricStore';
import { formatTime } from '../../utils/timeFormat';
import { cn } from '../../utils/cn';

interface PlayerBottomBarProps {
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
}

export const PlayerBottomBar: React.FC<PlayerBottomBarProps> = ({ onTogglePlay, onSeek }) => {
  const { 
    isPlaying, 
    currentTime, 
    duration, 
    playbackRate, 
    setPlaybackRate, 
    volume, 
    setVolume, 
    isMuted, 
    toggleMute 
  } = usePlayerStore();

  const { 
    metadata, 
    activeLineIndex, 
    loopLineIndex, 
    setLoopLineIndex, 
    lyrics, 
    setActiveLineIndex 
  } = useLyricStore();

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSeek(parseFloat(e.target.value));
  };

  const handlePrevLine = () => {
    if (activeLineIndex > 0) {
      const prevIdx = activeLineIndex - 1;
      setActiveLineIndex(prevIdx);
      if (lyrics[prevIdx]) onSeek(lyrics[prevIdx].inTime);
    }
  };

  const handleNextLine = () => {
    if (activeLineIndex < lyrics.length - 1) {
      const nextIdx = activeLineIndex + 1;
      setActiveLineIndex(nextIdx);
      if (lyrics[nextIdx]) onSeek(lyrics[nextIdx].inTime);
    }
  };

  const toggleLoopCurrent = () => {
    if (loopLineIndex === activeLineIndex) {
      setLoopLineIndex(null);
    } else {
      setLoopLineIndex(activeLineIndex);
      if (lyrics[activeLineIndex]) onSeek(lyrics[activeLineIndex].inTime);
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [0.75, 0.85, 1.0, 1.25];
    const curIdx = rates.indexOf(playbackRate);
    const nextRate = rates[(curIdx + 1) % rates.length] || 1.0;
    setPlaybackRate(nextRate);
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 px-6 py-3 liquid-glass-dock border-t border-white/10 backdrop-blur-3xl shadow-2xl">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Song Meta & Cover */}
        <div className="flex items-center gap-3 w-full md:w-1/4">
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-black/50 border border-white/15 shadow-md flex-shrink-0 flex items-center justify-center">
            {metadata.coverUrl ? (
              <img src={metadata.coverUrl} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-white/10 flex items-center justify-center font-bold text-white/70">
                WW
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs md:text-sm font-semibold text-white truncate tracking-tight">
              {metadata.title || 'ไม่มีชื่อเพลง'}
            </span>
            <span className="text-[11px] text-white/50 truncate">
              {metadata.artist || 'ไม่ระบุศิลปิน'}
            </span>
          </div>
        </div>

        {/* Center: Controls & Progress Bar */}
        <div className="flex flex-col items-center gap-1.5 w-full md:w-2/4">
          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={cyclePlaybackRate}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer min-h-[32px]"
              title="ความเร็วในการเล่น"
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>{playbackRate}x</span>
            </button>

            <button
              onClick={handlePrevLine}
              disabled={activeLineIndex <= 0}
              className="p-2 rounded-full text-white/60 hover:text-white disabled:opacity-25 disabled:hover:text-white/60 transition-all cursor-pointer active:scale-95 min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="ท่อนก่อนหน้า"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={onTogglePlay}
              className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-lg shadow-white/20 hover:scale-105 active:scale-90 transition-all cursor-pointer"
              title={isPlaying ? "หยุดชั่วคราว" : "เล่น"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={handleNextLine}
              disabled={activeLineIndex >= lyrics.length - 1}
              className="p-2 rounded-full text-white/60 hover:text-white disabled:opacity-25 disabled:hover:text-white/60 transition-all cursor-pointer active:scale-95 min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="ท่อนถัดไป"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={toggleLoopCurrent}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer min-h-[32px] active:scale-95",
                loopLineIndex !== null
                  ? "bg-white/20 text-white border-white/40 shadow-sm"
                  : "text-white/50 border-white/10 hover:text-white hover:bg-white/10"
              )}
              title="เล่นวนซ้ำท่อนนี้"
            >
              <RotateCw className={cn("w-3 h-3", loopLineIndex !== null && "animate-spin")} />
              <span>วนซ้ำ</span>
            </button>
          </div>

          {/* Time scrubber */}
          <div className="w-full flex items-center gap-3">
            <span className="text-[11px] font-mono text-white/50 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeekChange}
              className="apple-scrubber w-full"
            />
            <span className="text-[11px] font-mono text-white/50 w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: Volume & Tools */}
        <div className="hidden md:flex items-center justify-end gap-3 w-1/4">
          <button 
            onClick={toggleMute}
            className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={isMuted || volume === 0 ? "เปิดเสียง" : "ปิดเสียง"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="apple-scrubber w-24"
          />
        </div>
      </div>
    </footer>
  );
};
