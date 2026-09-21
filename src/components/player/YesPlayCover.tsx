import React, { useState } from 'react';
import { Play, Disc, Heart } from 'lucide-react';
import { createSizedCoverUrl } from '../../utils/coverImageUrl';
import { useFavoriteStore } from '../../stores/useFavoriteStore';
import { playTapSound } from '../../utils/soundEffects';
import { cn } from '../../utils/cn';

interface YesPlayCoverProps {
  id?: string | number;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  size?: number;
  showPlayButton?: boolean;
  onPlay?: (e: React.MouseEvent) => void;
  onClick?: () => void;
  className?: string;
}

export const YesPlayCover: React.FC<YesPlayCoverProps> = ({
  id,
  title,
  subtitle,
  imageUrl,
  size = 300,
  showPlayButton = true,
  onPlay,
  onClick,
  className
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const { isFavoriteAlbum, toggleFavoriteAlbum } = useFavoriteStore();
  const isFav = id !== undefined ? isFavoriteAlbum(id) : false;

  const resolvedUrl = imageUrl ? createSizedCoverUrl(imageUrl, size) : '';
  const canShowImage = Boolean(resolvedUrl) && !hasError;

  const handleToggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id === undefined) return;
    playTapSound();
    toggleFavoriteAlbum({
      id: Number(id),
      name: title || '',
      artist: subtitle || '',
      picUrl: imageUrl || ''
    });
  };

  return (
    <div 
      className={cn("group flex flex-col cursor-pointer select-none relative", className)}
      onClick={onClick}
    >
      {/* Cover Image Container with Ambient Shadow */}
      <div className="relative w-full aspect-square rounded-2xl transition-transform duration-300 group-hover:scale-[1.02]">
        {/* Ambient Blurred Shadow (YesPlayMusic style) */}
        {canShowImage && (
          <div
            className="absolute inset-0 rounded-2xl -z-10 scale-95 translate-y-2.5 filter blur-lg opacity-40 group-hover:opacity-75 transition-opacity duration-300 bg-cover bg-center pointer-events-none"
            style={{ backgroundImage: `url(${resolvedUrl})` }}
            aria-hidden="true"
          />
        )}

        {/* Main Cover Image / Fallback */}
        <div className="w-full h-full rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative shadow-md">
          {canShowImage ? (
            <img
              src={resolvedUrl}
              alt={title || ''}
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
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-white/10 to-white/5 text-white/30">
              <Disc className="w-10 h-10 stroke-[1.5]" />
            </div>
          )}

          {/* Hover Shade and Frosted Play Button (YesPlayMusic style) */}
          {showPlayButton && (
            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onPlay) onPlay(e);
                  else if (onClick) onClick();
                }}
                className="w-11 h-11 rounded-full bg-white/25 hover:bg-white/40 active:scale-95 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-105 cursor-pointer"
                title="เล่น"
              >
                <Play className="w-5 h-5 fill-white translate-x-0.5" />
              </button>
            </div>
          )}

          {/* Favorite Heart Button */}
          {id !== undefined && (
            <button
              type="button"
              onClick={handleToggleFav}
              className={cn(
                "absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all z-10 cursor-pointer shadow-md",
                isFav
                  ? "bg-rose-500/80 text-white opacity-100 scale-100"
                  : "bg-black/40 text-white/60 hover:text-white opacity-0 group-hover:opacity-100 scale-90 hover:scale-100"
              )}
              title={isFav ? "ลบออกจากอัลบั้มโปรด" : "เพิ่มเป็นอัลบั้มโปรด"}
            >
              <Heart className={cn("w-3.5 h-3.5", isFav && "fill-white")} />
            </button>
          )}
        </div>
      </div>

      {/* Text Info */}
      {(title || subtitle) && (
        <div className="mt-2.5 px-0.5">
          {title && (
            <h4 className="text-xs font-bold text-white/90 group-hover:text-white line-clamp-1 transition-colors leading-tight">
              {title}
            </h4>
          )}
          {subtitle && (
            <p className="text-[11px] text-white/45 line-clamp-1 mt-0.5 leading-tight">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
