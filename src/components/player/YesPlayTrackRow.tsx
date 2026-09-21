import React, { useState } from 'react';
import { Play, Music, CheckCircle2, Loader2, Heart } from 'lucide-react';
import type { NeteaseSongItem } from '../../api/netease';
import { createSizedCoverUrl } from '../../utils/coverImageUrl';
import { formatTime } from '../../utils/timeFormat';
import { THAI_TEXT } from '../../constants/localization';
import { useFavoriteStore } from '../../stores/useFavoriteStore';
import { playTapSound } from '../../utils/soundEffects';
import { cn } from '../../utils/cn';

interface YesPlayTrackRowProps {
  song: NeteaseSongItem;
  index?: number;
  isLoading?: boolean;
  onSelect: (song: NeteaseSongItem) => void;
  className?: string;
}

export const YesPlayTrackRow: React.FC<YesPlayTrackRowProps> = ({
  song,
  index,
  isLoading = false,
  onSelect,
  className
}) => {
  const [hasError, setHasError] = useState(false);
  const coverUrl = song.coverUrl ? createSizedCoverUrl(song.coverUrl, 120) : '';

  const { isFavoriteSong, toggleFavoriteSong } = useFavoriteStore();
  const isFav = isFavoriteSong(song.id);

  const handleToggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    playTapSound();
    toggleFavoriteSong(song);
  };

  return (
    <div
      onClick={() => !isLoading && onSelect(song)}
      className={cn(
        "group flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.07] border border-white/5 hover:border-white/15 cursor-pointer transition-all duration-200 select-none",
        className
      )}
    >
      {/* Left: Index + Cover + Info */}
      <div className="flex items-center gap-3 min-w-0 pr-4">
        {/* Track Index (optional) */}
        {index !== undefined && (
          <span className="w-5 text-center text-xs font-mono text-white/30 group-hover:hidden flex-shrink-0">
            {String(index).padStart(2, '0')}
          </span>
        )}

        {/* Cover thumbnail with hover play */}
        <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 border border-white/10 group-hover:shadow-md transition-all">
          {coverUrl && !hasError ? (
            <img
              src={coverUrl}
              alt={song.name}
              loading="lazy"
              onError={() => setHasError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/30 bg-gradient-to-br from-white/10 to-white/5">
              <Music className="w-5 h-5 stroke-[1.5]" />
            </div>
          )}

          {/* Hover Play Overlay */}
          <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Play className="w-4 h-4 fill-white text-white translate-x-0.5" />
          </div>
        </div>

        {/* Titles */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white/90 group-hover:text-white truncate transition-colors leading-tight">
            {song.name}
          </p>
          <p className="text-xs text-white/45 truncate mt-1 leading-tight">
            {song.artist}
            {song.album && (
              <>
                <span className="text-white/25 mx-1.5">•</span>
                <span className="text-white/35">{song.album}</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Right: Favorite + Duration + Select Button */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
        <button
          type="button"
          onClick={handleToggleFav}
          className={cn(
            "p-1.5 rounded-lg transition-all cursor-pointer",
            isFav
              ? "text-rose-400 opacity-100"
              : "text-white/30 hover:text-white opacity-0 group-hover:opacity-100"
          )}
          title={isFav ? "ลบออกจากเพลงโปรด" : "เพิ่มเป็นเพลงโปรด"}
        >
          <Heart className={cn("w-4 h-4", isFav && "fill-current text-rose-400")} />
        </button>

        <span className="text-xs font-mono text-white/35">
          {formatTime(song.duration)}
        </span>

        <button
          type="button"
          disabled={isLoading}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(song);
          }}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-white/10 group-hover:bg-white group-hover:text-black border border-white/10 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{THAI_TEXT.searchModal.loadingSong}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 opacity-80" />
              <span>{THAI_TEXT.searchModal.openInStudio}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
