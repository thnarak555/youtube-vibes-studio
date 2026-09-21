import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Search, 
  Upload, 
  Download, 
  Keyboard, 
  Palette, 
  FolderOpen, 
  Heart, 
  MoreHorizontal,
  FileDown,
  Gauge,
  Music,
  Disc3,
  Sparkles,
  Check,
  Tv,
  Lock,
  Unlock,
  SlidersHorizontal
} from 'lucide-react';
import { useLyricStore } from '../../stores/useLyricStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { formatTime } from '../../utils/timeFormat';
import { sanitizeAppleTitle } from '../../theme/theme';
import { APPLE_THEME } from '../../theme/theme';
import { exportProjectFile } from '../../utils/projectManager';
import { generateAEScript } from '../../utils/aeExporter';
import { sanitizeSafeFilename } from '../../utils/lrcExporter';
import { playTapSound } from '../../utils/soundEffects';
import { APP_TEXT, THAI_TEXT } from '../../constants/localization';
import { APP_CONFIG } from '../../config/appConfig';
import { logger } from '../../services/logger';
import { cn } from '../../utils/cn';

interface LeftPanelProps {
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onOpenSearch: () => void;
  onOpenImport: () => void;
  onOpenExport: () => void;
  onOpenHelp: () => void;
  onOpenAESettings: () => void;
  onToggleDesktopLyrics?: () => void;
  onOpenDesktopLyricsSettings?: () => void;
  onOpenSettings?: () => void;
  onOpenUserLibrary?: () => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  onTogglePlay,
  onSeek,
  onOpenSearch,
  onOpenImport,
  onOpenExport,
  onOpenHelp,
  onOpenAESettings,
  onToggleDesktopLyrics,
  onOpenSettings,
  onOpenUserLibrary
}) => {
  const { 
    lyrics, 
    metadata, 
    activeLineIndex, 
    aePreset, 
    glowRadius, 
    setMetadata, 
    toggleFavoriteCurrentSong,
    isCurrentSongFavorite,
    openProjectDiskFolder,
    savedDiskPath
  } = useLyricStore();

  const {
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    volume,
    isMuted,
    setVolume,
    toggleMute,
    setPlaybackRate
  } = usePlayerStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDesktopLocked, setIsDesktopLocked] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      (window as any).electronAPI.desktopLyricsGetLock?.()
        ?.then((locked: boolean) => {
          setIsDesktopLocked(Boolean(locked));
        })
        ?.catch(() => {});
      const unsub = (window as any).electronAPI.onDesktopLyricsLockChanged?.((locked: boolean) => {
        setIsDesktopLocked(Boolean(locked));
      });
      return () => {
        if (typeof unsub === 'function') unsub();
      };
    }
  }, []);

  const handleToggleDesktopLock = () => {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.desktopLyricsSetLock) {
      const next = !isDesktopLocked;
      setIsDesktopLocked(next);
      (window as any).electronAPI.desktopLyricsSetLock(next);
      showToast(next ? 'ล็อกเนื้อเพลงเดสก์ท็อปแล้ว' : 'ปลดล็อกเนื้อเพลงเดสก์ท็อปแล้ว');
    }
  };

  // YouTube-Style Scrubber State
  const [isScrubHovering, setIsScrubHovering] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);
  const [hoverPercent, setHoverPercent] = useState(0);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const isFavorite = isCurrentSongFavorite();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProgressBarMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPercent(pos * 100);
    setHoverTime(pos * duration);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(pos * duration);
  };

  const handleToggleMute = () => {
    if (isMuted && volume === 0) {
      setVolume(APP_CONFIG.DEFAULT_VOLUME);
    } else {
      toggleMute();
    }
  };

  const cyclePlaybackRate = () => {
    const rates = APP_CONFIG.DEFAULT_PLAYBACK_RATES;
    const nextIdx = (rates.indexOf(playbackRate as any) + 1) % rates.length;
    setPlaybackRate(rates[nextIdx]);
  };

  const handleBackupProject = () => {
    exportProjectFile(metadata, lyrics, aePreset, glowRadius);
    setIsMenuOpen(false);
    showToast('ดาวน์โหลดไฟล์สำรองโปรเจกต์แล้ว');
  };


  // Sync to MaO After Effects Repository
  const handleSyncToMaORepo = async () => {
    setIsMenuOpen(false);
    const isElectron = typeof window !== 'undefined' && (window as any).electronAPI?.syncToMaORepository;
    if (!isElectron) {
      showToast('ฟีเจอร์นี้ใช้งานได้บนโหมด Desktop');
      return;
    }
    try {
      const safeTitle = sanitizeSafeFilename(metadata.title || 'Song');
      const scriptContent = generateAEScript(lyrics, metadata, {
        startColorHex: aePreset.startColorHex,
        endColorHex: aePreset.endColorHex,
        glowRadius: glowRadius
      });
      const res = await (window as any).electronAPI.syncToMaORepository({
        fileName: `${safeTitle}.jsx`,
        content: scriptContent
      });
      if (res?.success) {
        showToast(THAI_TEXT.exportModal.syncSuccess);
      } else {
        showToast(THAI_TEXT.exportModal.syncError);
      }
    } catch (e) {
      logger.error('[SYNC]', 'Sync to MaO repository error', e);
      showToast(THAI_TEXT.exportModal.syncError);
    }
  };

  // Download Audio File directly into song folder
  const handleDownloadAudio = async () => {
    setIsMenuOpen(false);
    if (!metadata.audioSrc) {
      showToast('ไม่มีไฟล์เสียงในโปรเจกต์');
      return;
    }
    const safeTitle = sanitizeSafeFilename(metadata.title || 'Song');
    if (typeof window !== 'undefined' && (window as any).electronAPI?.downloadAudioFile) {
      const res = await (window as any).electronAPI.downloadAudioFile({
        url: metadata.audioSrc,
        fileName: `${safeTitle}.mp3`,
        customDir: savedDiskPath || undefined
      });
      if (res?.success) {
        showToast(THAI_TEXT.messages.downloadedAudio);
      } else {
        showToast('ไม่สามารถดาวน์โหลดไฟล์เสียงได้');
      }
    } else {
      window.open(metadata.audioSrc, '_blank');
    }
  };

  // Download Cover Image
  const handleDownloadCover = async () => {
    setIsMenuOpen(false);
    if (!metadata.coverUrl) {
      showToast('ไม่มีรูปภาพปกในโปรเจกต์');
      return;
    }
    const safeTitle = sanitizeSafeFilename(metadata.title || 'Song');
    if (typeof window !== 'undefined' && (window as any).electronAPI?.downloadCoverFile) {
      const res = await (window as any).electronAPI.downloadCoverFile({
        url: metadata.coverUrl,
        fileName: `${safeTitle}_Cover.jpg`,
        customDir: savedDiskPath || undefined
      });
      if (res?.success) {
        showToast(THAI_TEXT.messages.downloadedCover);
      } else {
        showToast('ไม่สามารถดาวน์โหลดรูปภาพปกได้');
      }
    } else {
      window.open(metadata.coverUrl, '_blank');
    }
  };

  const handleOpenFolderClick = async () => {
    setIsMenuOpen(false);
    try {
      await openProjectDiskFolder();
      showToast(THAI_TEXT.messages.folderOpened);
    } catch (e) {
      showToast(THAI_TEXT.messages.folderNotFound);
    }
  };

  const songTitle = sanitizeAppleTitle(metadata.title) || THAI_TEXT.player.noSongSelected;
  const artistText = [metadata.artist, metadata.album].filter((x): x is string => Boolean(x)).map(sanitizeAppleTitle).join(' • ') || THAI_TEXT.player.clickCoverToSearch;

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 sm:p-7 select-none overflow-hidden relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-xl bg-black/90 text-white text-xs border border-white/15 shadow-2xl backdrop-blur-xl animate-fade-in flex items-center gap-1.5 whitespace-nowrap">
          <Check className="w-3.5 h-3.5 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Unified Left Player Column: Album Art + Info + Scrubber + Controls */}
      <div 
        className="w-full flex flex-col items-center my-auto z-20"
        style={{ maxWidth: 'clamp(240px, 28vw, 380px)' }}
      >
        {/* Album Artwork Card (Apple Music Glassmorphism) */}
        <div 
          className="relative group transition-transform duration-500 hover:scale-[1.01] w-full aspect-square cursor-pointer"
          onClick={() => !metadata.title && onOpenSearch()}
        >
          {/* Ambient Acoustic Light behind album */}
          {metadata.coverUrl && (
            <div 
              className="absolute inset-0 rounded-3xl blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none transform scale-95"
              style={{
                backgroundImage: `url(${metadata.coverUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          )}

          {/* Floating Apple-Style Search Song Pill directly on top of Album Cover */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              playTapSound();
              onOpenSearch();
            }}
            className="absolute top-3.5 right-3.5 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-xl border border-white/25 text-xs font-semibold text-white/90 hover:text-white shadow-xl transition-all active:scale-95 cursor-pointer"
            title={APP_TEXT.player.searchSongAction}
          >
            <Search className="w-3.5 h-3.5 text-white/80" />
            <span>{APP_TEXT.player.searchSongAction}</span>
          </button>

          {/* Main Album Artwork Card */}
          <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl shadow-black/80 ring-1 ring-white/15 bg-[#12131c]/90 backdrop-blur-2xl flex items-center justify-center border border-white/10">
            {metadata.coverUrl ? (
              <img
                src={metadata.coverUrl}
                alt={metadata.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="eager"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 text-white/30 p-6 text-center">
                <Music className="w-16 h-16 stroke-[1.2] opacity-40 group-hover:scale-110 transition-transform duration-300 text-white" />
                <div className="text-xs font-medium text-white/50 tracking-wider">
                  {THAI_TEXT.player.clickCoverToSearch}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info & Controls Row directly below the image */}
        <div className="w-full flex flex-col gap-2.5 mt-4 sm:mt-5">
          {/* Row 1: Title & Actions */}
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={metadata.title}
                  onChange={(e) => setMetadata({ title: e.target.value })}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                  autoFocus
                  className="w-full bg-white/10 text-white font-bold text-base px-2 py-0.5 rounded-lg outline-none border border-white/25"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <h1 
                    onClick={() => metadata.title && setIsEditingTitle(true)}
                    className="text-base sm:text-lg font-bold text-white truncate tracking-tight hover:text-white/80 transition-colors cursor-pointer"
                    title={THAI_TEXT.player.clickToEditTitle}
                  >
                    {songTitle}
                  </h1>
                  {metadata.title && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/70 border border-white/10 flex-shrink-0">
                      Lossless
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Desktop Lyrics Toggle */}
              {onToggleDesktopLyrics && (
                <button
                  onClick={onToggleDesktopLyrics}
                  className="p-1.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                  title={APP_TEXT.player.toggleDesktopLyrics}
                >
                  <Tv className="w-4 h-4" />
                </button>
              )}

              {/* Desktop Lyrics Lock / Unlock Button */}
              {typeof window !== 'undefined' && (window as any).electronAPI?.desktopLyricsSetLock && (
                <button
                  onClick={handleToggleDesktopLock}
                  className={cn(
                    "p-1.5 rounded-xl transition-all cursor-pointer",
                    isDesktopLocked
                      ? "text-white bg-white/20 shadow-sm"
                      : "text-white/50 hover:text-white hover:bg-white/10"
                  )}
                  title={isDesktopLocked ? APP_TEXT.player.unlockDesktopLyrics : APP_TEXT.player.lockDesktopLyrics}
                >
                  {isDesktopLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
              )}

              {/* User Library Heart Button */}
              <button
                onClick={() => {
                  playTapSound();
                  if (onOpenUserLibrary) {
                    onOpenUserLibrary();
                  } else {
                    toggleFavoriteCurrentSong();
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  playTapSound();
                  toggleFavoriteCurrentSong();
                }}
                className={cn(
                  "p-1.5 rounded-xl transition-all cursor-pointer",
                  isFavorite 
                    ? "text-rose-400 bg-rose-500/10 shadow-sm" 
                    : "text-white/50 hover:text-rose-400 hover:bg-white/10"
                )}
                title={isFavorite ? APP_TEXT.player.removeFromFavorites : APP_TEXT.player.addToFavorites}
              >
                <Heart className={cn("w-4 h-4", isFavorite && "fill-current text-rose-400")} />
              </button>

              {/* 3-dots Minimalist Context Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-1.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title={APP_TEXT.player.projectMenuTooltip}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 6 }}
                      transition={APPLE_THEME.springs.snappy}
                      style={{ transformOrigin: 'bottom right' }}
                      className="absolute right-0 bottom-9 w-72 rounded-3xl bg-[#10111a]/95 backdrop-blur-3xl border border-white/10 p-2 z-50 flex flex-col gap-0.5 text-xs text-white/80 shadow-2xl"
                    >
                      {onOpenUserLibrary && (
                        <button
                          onClick={() => { onOpenUserLibrary(); setIsMenuOpen(false); }}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer active:scale-[0.97]"
                        >
                          <Heart className="w-3.5 h-3.5 text-rose-400" />
                          <span>คลังเพลงของคุณ</span>
                        </button>
                      )}

                      {onOpenSettings && (
                        <button
                          onClick={() => { onOpenSettings(); setIsMenuOpen(false); }}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer active:scale-[0.97]"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5 text-white/70" />
                          <span>การตั้งค่าระบบ</span>
                        </button>
                      )}

                      <button
                        onClick={() => { onOpenSearch(); setIsMenuOpen(false); }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer active:scale-[0.97]"
                      >
                        <Search className="w-3.5 h-3.5 text-white/70" />
                        <span>{APP_TEXT.player.searchSongAction}</span>
                      </button>

                      <button
                        onClick={() => { onOpenImport(); setIsMenuOpen(false); }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer active:scale-[0.97]"
                      >
                        <Upload className="w-3.5 h-3.5 text-white/70" />
                        <span>{APP_TEXT.player.importLyricsAction}</span>
                      </button>

                      <button
                        onClick={() => { onOpenExport(); setIsMenuOpen(false); }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer active:scale-[0.97]"
                      >
                        <Download className="w-3.5 h-3.5 text-white/70" />
                        <span>{APP_TEXT.player.exportLyricsAction}</span>
                      </button>

                      <button
                        onClick={handleSyncToMaORepo}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer active:scale-[0.97]"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-white/80" />
                        <span>{APP_TEXT.player.syncToAERepo}</span>
                      </button>

                      <button
                        onClick={handleDownloadAudio}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer active:scale-[0.97]"
                      >
                        <Music className="w-3.5 h-3.5 text-white/70" />
                        <span>{APP_TEXT.player.downloadAudioAction}</span>
                      </button>

                      <button
                        onClick={handleDownloadCover}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer active:scale-[0.97]"
                      >
                        <Disc3 className="w-3.5 h-3.5 text-white/70" />
                        <span>{APP_TEXT.player.downloadCoverAction}</span>
                      </button>

                      <div className="my-1 border-t border-white/10" />

                      <button
                        onClick={() => { onOpenAESettings(); setIsMenuOpen(false); }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer active:scale-[0.97]"
                      >
                        <Palette className="w-3.5 h-3.5 text-white/70" />
                        <span>{THAI_TEXT.navigation.aeColorSettings}</span>
                      </button>

                      <button
                        onClick={() => { onToggleDesktopLyrics?.(); setIsMenuOpen(false); }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer active:scale-[0.97]"
                      >
                        <Tv className="w-3.5 h-3.5 text-white/70" />
                        <span>{APP_TEXT.player.toggleDesktopLyrics}</span>
                      </button>

                      <button
                        onClick={handleOpenFolderClick}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer active:scale-[0.97]"
                      >
                        <FolderOpen className="w-3.5 h-3.5 text-white/70" />
                        <span>{APP_TEXT.player.openFolderAction}</span>
                      </button>

                      <button
                        onClick={handleBackupProject}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer active:scale-[0.97]"
                      >
                        <FileDown className="w-3.5 h-3.5 text-white/70" />
                        <span>{APP_TEXT.player.backupProjectAction}</span>
                      </button>

                      <button
                        onClick={() => { onOpenHelp(); setIsMenuOpen(false); }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer active:scale-[0.97]"
                      >
                        <Keyboard className="w-3.5 h-3.5 text-white/70" />
                        <span>{THAI_TEXT.navigation.keyboardShortcuts}</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Row 2: Artist & Album */}
          <p className="text-xs text-white/50 truncate -mt-1 font-medium">
            {artistText}
          </p>

          {/* Row 3: Scrubber Timeline Bar */}
          <div className="w-full flex flex-col gap-1 mt-1.5">
            <div 
              ref={progressBarRef}
              onMouseEnter={() => setIsScrubHovering(true)}
              onMouseLeave={() => setIsScrubHovering(false)}
              onMouseMove={handleProgressBarMouseMove}
              onClick={handleProgressBarClick}
              className="relative w-full h-4 flex items-center cursor-pointer group/scrub"
            >
              {/* Background Track */}
              <div className="w-full h-1 group-hover/scrub:h-2 rounded-full bg-white/15 overflow-hidden transition-all duration-150">
                <div 
                  className="h-full rounded-full transition-all duration-75"
                  style={{ 
                    width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                    background: aePreset?.startColorHex && aePreset?.endColorHex
                      ? `linear-gradient(to right, ${aePreset.startColorHex}, ${aePreset.endColorHex})`
                      : 'linear-gradient(to right, rgba(255,255,255,0.9), rgba(255,255,255,0.6))'
                  }}
                />
              </div>

              {/* Hover Indicator Bar */}
              {isScrubHovering && duration > 0 && (
                <div 
                  className="absolute top-1/2 -translate-y-1/2 h-2 rounded-full bg-white/20 pointer-events-none transition-all"
                  style={{ width: `${hoverPercent}%` }}
                />
              )}

              {/* Scrubber Knob */}
              <div 
                className="absolute w-3 h-3 rounded-full bg-white shadow-md shadow-black/50 transform -translate-x-1/2 opacity-0 group-hover/scrub:opacity-100 group-hover/scrub:scale-125 transition-all duration-150 pointer-events-none"
                style={{ 
                  left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                  boxShadow: `0 0 10px ${aePreset?.startColorHex || 'rgba(255,255,255,0.6)'}`
                }}
              />

              {/* Floating Time Preview Tooltip */}
              {isScrubHovering && duration > 0 && (
                <div 
                  className="absolute -top-7 transform -translate-x-1/2 px-2 py-0.5 rounded-lg bg-black/90 text-white font-mono text-[10px] border border-white/20 shadow-xl pointer-events-none animate-fade-in"
                  style={{ left: `${hoverPercent}%` }}
                >
                  {formatTime(hoverTime)}
                </div>
              )}
            </div>

            {/* Time Indicators */}
            <div className="flex items-center justify-between text-[11px] font-mono text-white/40 px-0.5">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Row 4: Playback Controls Bar */}
          <div className="w-full flex items-center justify-between mt-1 pt-1">
            {/* Left: Previous / Play / Next */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playTapSound();
                  if (activeLineIndex > 0 && lyrics[activeLineIndex - 1]) {
                    onSeek(lyrics[activeLineIndex - 1].inTime);
                  } else {
                    onSeek(0);
                  }
                }}
                className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={THAI_TEXT.player.prevLine}
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>

              <button
                onClick={() => {
                  playTapSound();
                  onTogglePlay();
                }}
                className="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/10 cursor-pointer"
                title={isPlaying ? THAI_TEXT.player.pause : THAI_TEXT.player.play}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={() => {
                  playTapSound();
                  if (activeLineIndex < lyrics.length - 1 && lyrics[activeLineIndex + 1]) {
                    onSeek(lyrics[activeLineIndex + 1].inTime);
                  }
                }}
                className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={THAI_TEXT.player.nextLine}
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>
            </div>

            {/* Right: Playback Speed & Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playTapSound();
                  cyclePlaybackRate();
                }}
                className="px-2 py-1 rounded-lg text-xs font-mono font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={THAI_TEXT.player.playbackSpeed}
              >
                <div className="flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-white/70" />
                  <span>{playbackRate}x</span>
                </div>
              </button>

              <div className="flex items-center gap-1 group/vol">
                <button
                  onClick={() => {
                    playTapSound();
                    handleToggleMute();
                  }}
                  className="hover:text-white transition-colors cursor-pointer p-1 text-white/60"
                  title={isMuted ? THAI_TEXT.player.unmute : THAI_TEXT.player.mute}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-white/40" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-white/80" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-14 h-1 rounded-lg bg-white/20 appearance-none cursor-pointer accent-white transition-all opacity-60 group-hover/vol:opacity-100"
                  title={`${THAI_TEXT.player.volume} ${Math.round(volume * 100)}%`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
