import React, { useState } from 'react';
import { User, Play, Heart } from 'lucide-react';
import { createSizedCoverUrl } from '../../utils/coverImageUrl';
import { useFavoriteStore } from '../../stores/useFavoriteStore';
import { playTapSound } from '../../utils/soundEffects';
import { cn } from '../../utils/cn';

interface YesPlayArtistCardProps {
  id: number | string;
  name: string;
  picUrl?: string;
  subText?: string;
  size?: number;
  onClick?: () => void;
  onPlay?: (e: React.MouseEvent) => void;
  className?: string;
}

export const YesPlayArtistCard: React.FC<YesPlayArtistCardProps> = ({
  id,
  name,
  picUrl,
  subText = 'ศิลปิน',
  size = 240,
  onClick,
  onPlay,
  className
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const { isFavoriteArtist, toggleFavoriteArtist } = useFavoriteStore();
  const isFav = isFavoriteArtist(id);

  const resolvedUrl = picUrl ? createSizedCoverUrl(picUrl, size) : '';
  const canShowImage = Boolean(resolvedUrl) && !hasError;

  const handleToggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    playTapSound();
    toggleFavoriteArtist({
      id: Number(id),
      name,
      picUrl: picUrl || ''
    });
  };

  return (
    <div
      className={cn(
        "group flex flex-col items-center text-center p-3.5 rounded-3xl bg-white/[0.02] hover:bg-white/[0.07] border border-white/5 hover:border-white/15 transition-all duration-300 cursor-pointer select-none relative",
        className
      )}
      onClick={onClick}
    >
      {/* Circular Avatar with Ambient Glow */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full mb-3 transition-transform duration-300 group-hover:scale-105">
        {/* Ambient Blur Behind Circle */}
        {canShowImage && (
          <div
            className="absolute inset-0 rounded-full -z-10 scale-90 translate-y-2 filter blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-300 bg-cover bg-center pointer-events-none"
            style={{ backgroundImage: `url(${resolvedUrl})` }}
            aria-hidden="true"
          />
        )}

        {/* Circular Image Container */}
        <div className="w-full h-full rounded-full overflow-hidden bg-white/5 border border-white/10 relative shadow-md">
          {canShowImage ? (
            <img
              src={resolvedUrl}
              alt={name}
              loading="lazy"
              decoding="async"
              onLoad={() => setIsLoaded(true)}
              onError={() => setHasError(true)}
              className={cn(
                "w-full h-full object-cover transition-opacity duration-300",
                isLoaded ? "opacity-100" : "opacity-0"
              )}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-white/10 to-white/5 text-white/30">
              <User className="w-10 h-10 stroke-[1.5]" />
            </div>
          )}

          {/* Hover Shade and Frosted Play Button */}
          {onPlay && (
            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay(e);
                }}
                className="w-9 h-9 rounded-full bg-white/25 hover:bg-white/40 active:scale-95 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-105 cursor-pointer"
                title="เล่นเพลงของศิลปิน"
              >
                <Play className="w-4 h-4 fill-white translate-x-0.5" />
              </button>
            </div>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={handleToggleFav}
          className={cn(
            "absolute top-0 right-0 p-1.5 rounded-full backdrop-blur-md transition-all z-10 cursor-pointer shadow-md",
            isFav
              ? "bg-rose-500/80 text-white opacity-100 scale-100"
              : "bg-black/40 text-white/60 hover:text-white opacity-0 group-hover:opacity-100 scale-90 hover:scale-100"
          )}
          title={isFav ? "ลบออกจากศิลปินโปรด" : "เพิ่มเป็นศิลปินโปรด"}
        >
          <Heart className={cn("w-3.5 h-3.5", isFav && "fill-white")} />
        </button>
      </div>

      {/* Artist Name & Subtitle */}
      <h4 className="text-xs font-bold text-white/90 group-hover:text-white line-clamp-1 transition-colors w-full px-1">
        {name}
      </h4>
      {subText && (
        <span className="text-[10px] text-white/40 mt-0.5 font-medium">
          {subText}
        </span>
      )}
    </div>
  );
};
