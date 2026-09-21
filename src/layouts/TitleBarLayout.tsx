import React from 'react';
import { 
  Search, 
  Loader2, 
  Folder, 
  Heart, 
  SlidersHorizontal, 
  Volume2, 
  VolumeX, 
  PanelRight, 
  Undo2, 
  Redo2,
  Languages,
  ArrowLeftRight,
  Copy,
  ChevronUp,
  ChevronDown,
  X
} from 'lucide-react';
import { WindowControls } from '../components/ui/WindowControls';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassTooltip } from '../components/ui/GlassTooltip';
import { useLyricStore } from '../stores/useLyricStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import { isUISoundEnabled, toggleUISound, playTapSound, playSwitchSound } from '../utils/soundEffects';
import { APP_TEXT } from '../constants/localization';
import { cn } from '../utils/cn';

export interface TitleBarLayoutProps {
  onOpenSearch?: () => void;
  onOpenSettings?: () => void;
  onOpenUserLibrary?: () => void;
}

/**
 * Apple-style Title Bar Layout
 * Clean, uncluttered toolbar with genuine Apple ergonomics:
 * - Left: Real-time Auto-Save status & disk project folder
 * - Center: Apple Segmented Control for Display Modes [ปกติ | เฟด | เอกสาร] & Undo/Redo
 * - Right: Document Tools Cluster, Document Tabs button, System Icons, and Window Controls
 */
export const TitleBarLayout: React.FC<TitleBarLayoutProps> = ({
  onOpenSettings,
  onOpenUserLibrary,
}) => {
  const [soundEnabled, setSoundEnabled] = React.useState(isUISoundEnabled());
  const {
    saveStatus,
    savedDiskFolder,
    openProjectDiskFolder,
    isTabsDrawerOpen,
    toggleTabsDrawer,
    displayMode,
    setDisplayMode,
    undo,
    redo,
    canUndo,
    canRedo,
    lyrics,
    setActiveLineIndex,
    isTranslateMode,
    toggleTranslateMode,
    swapOriginalAndReference,
    copyReferenceToTranslation,
    lyricSearchQuery,
    setLyricSearchQuery,
    isLyricSearchOpen,
    setIsLyricSearchOpen,
  } = useLyricStore();

  const [searchMatchIdx, setSearchMatchIdx] = React.useState(0);
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (isLyricSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isLyricSearchOpen]);

  const hasReferenceLyrics = React.useMemo(
    () => lyrics.some((l) => Boolean(l.referenceTranslation && l.referenceTranslation.trim())),
    [lyrics]
  );

  const matchedIndices = React.useMemo(() => {
    const q = lyricSearchQuery.trim().toLowerCase();
    if (!q) return [];
    const matches: number[] = [];
    lyrics.forEach((l, idx) => {
      if (
        (l.original && l.original.toLowerCase().includes(q)) ||
        (l.referenceTranslation && l.referenceTranslation.toLowerCase().includes(q)) ||
        (l.translation && l.translation.toLowerCase().includes(q))
      ) {
        matches.push(idx);
      }
    });
    return matches;
  }, [lyrics, lyricSearchQuery]);

  const handleNextSearchMatch = () => {
    if (matchedIndices.length === 0) return;
    const nextIdx = (searchMatchIdx + 1) % matchedIndices.length;
    setSearchMatchIdx(nextIdx);
    const lineIndex = matchedIndices[nextIdx];
    setActiveLineIndex(lineIndex);
    if (lyrics[lineIndex]) {
      usePlayerStore.getState().setCurrentTime(lyrics[lineIndex].inTime);
    }
  };

  const handlePrevSearchMatch = () => {
    if (matchedIndices.length === 0) return;
    const prevIdx = (searchMatchIdx - 1 + matchedIndices.length) % matchedIndices.length;
    setSearchMatchIdx(prevIdx);
    const lineIndex = matchedIndices[prevIdx];
    setActiveLineIndex(lineIndex);
    if (lyrics[lineIndex]) {
      usePlayerStore.getState().setCurrentTime(lyrics[lineIndex].inTime);
    }
  };

  const handleToggleSound = () => {
    const next = toggleUISound();
    setSoundEnabled(next);
  };

  return (
    <header
      className="h-10 sm:h-11 w-full flex items-center justify-between px-3 select-none z-50 bg-black/75 backdrop-blur-2xl border-b border-white/10 flex-shrink-0"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Left Section: Real-time Auto-Save Status Only */}
      <div
        className="flex items-center gap-2"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Real-time Workspace Disk Auto-Save Status */}
        <div className="flex items-center gap-2 text-[11px] text-white/40 tracking-wide font-medium">
          {saveStatus === 'saving' ? (
            <div className="flex items-center gap-1.5 text-white/80">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>{APP_TEXT.titleBar.savingStatus}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-white/45">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/70" />
              <span>{APP_TEXT.titleBar.savedStatus}</span>
            </div>
          )}

          {savedDiskFolder && (
            <button
              onClick={() => {
                playTapSound();
                openProjectDiskFolder();
              }}
              className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/70 transition-colors cursor-pointer"
              title={APP_TEXT.titleBar.openFolderTooltip}
            >
              <Folder className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Center Section: 3 Display Modes Segmented Control & Undo/Redo */}
      <div
        className="flex items-center gap-2 flex-shrink-0"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Apple Segmented Control for Display Modes */}
        <div className="flex items-center p-0.5 rounded-xl bg-black/50 backdrop-blur-xl border border-white/10 shadow-inner flex-shrink-0">
          <button
            onClick={() => {
              playSwitchSound();
              setDisplayMode('normal');
            }}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex-shrink-0",
              displayMode === 'normal'
                ? "bg-white/20 text-white border border-white/30 font-semibold shadow-sm"
                : "text-white/60 hover:text-white border border-transparent hover:bg-white/5"
            )}
            title={APP_TEXT.lyricsToolbar.modeNormalTooltip}
          >
            {APP_TEXT.lyricsToolbar.modeNormal}
          </button>

          <button
            onClick={() => {
              playSwitchSound();
              setDisplayMode('fade');
            }}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex-shrink-0",
              displayMode === 'fade'
                ? "bg-white/20 text-white border border-white/30 font-semibold shadow-sm"
                : "text-white/60 hover:text-white border border-transparent hover:bg-white/5"
            )}
            title={APP_TEXT.lyricsToolbar.modeFadeTooltip}
          >
            {APP_TEXT.lyricsToolbar.modeFade}
          </button>

          <button
            onClick={() => {
              playSwitchSound();
              setDisplayMode('document');
            }}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex-shrink-0",
              displayMode === 'document'
                ? "bg-white/20 text-white border border-white/30 font-semibold shadow-sm"
                : "text-white/60 hover:text-white border border-transparent hover:bg-white/5"
            )}
            title={APP_TEXT.lyricsToolbar.modeDocumentTooltip}
          >
            {APP_TEXT.lyricsToolbar.modeDocument}
          </button>
        </div>

        <div className="h-4 w-[1px] bg-white/10 mx-0.5 flex-shrink-0" />

        {/* Undo / Redo Buttons */}
        <button
          onClick={() => {
            playTapSound();
            undo();
          }}
          disabled={!canUndo}
          className={cn(
            "p-1.5 rounded-xl border transition-all cursor-pointer flex-shrink-0",
            canUndo
              ? "text-white/80 hover:text-white bg-black/40 hover:bg-white/10 border-white/10 shadow-sm"
              : "text-white/20 border-transparent cursor-not-allowed"
          )}
          title={APP_TEXT.lyricsToolbar.undo}
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => {
            playTapSound();
            redo();
          }}
          disabled={!canRedo}
          className={cn(
            "p-1.5 rounded-xl border transition-all cursor-pointer flex-shrink-0",
            canRedo
              ? "text-white/80 hover:text-white bg-black/40 hover:bg-white/10 border-white/10 shadow-sm"
              : "text-white/20 border-transparent cursor-not-allowed"
          )}
          title={APP_TEXT.lyricsToolbar.redo}
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right Section: Document Tools Cluster, Document Tab Button, System Utilities, and Window Controls */}
      <div
        className="flex items-center gap-1.5"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Cluster 1: Document Tools Cluster (Placed directly above the lyrics/document area) */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Lyric Count Badge */}
          <div className="flex items-center px-2 py-0.5 rounded-lg bg-black/40 border border-white/10 text-[11px] font-mono text-white/60 select-none">
            <span>{lyrics.length} ท่อน</span>
          </div>

          {/* In-Lyrics Quick Search Bar / Trigger */}
          {isLyricSearchOpen ? (
            <div className="flex items-center gap-1 bg-black/60 border border-white/20 rounded-xl px-2 py-0.5 animate-fade-in flex-shrink-0 backdrop-blur-xl">
              <Search className="w-3 h-3 text-white/50 flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={lyricSearchQuery}
                onChange={(e) => {
                  setLyricSearchQuery(e.target.value);
                  setSearchMatchIdx(0);
                }}
                placeholder={APP_TEXT.lyricsToolbar.searchPlaceholder}
                className="bg-transparent text-xs text-white placeholder-white/40 outline-none w-24 sm:w-32 py-0.5"
              />
              {matchedIndices.length > 0 && (
                <span className="text-[10px] font-mono text-white/50 px-1 whitespace-nowrap">
                  {searchMatchIdx + 1}/{matchedIndices.length}
                </span>
              )}
              <button
                onClick={handlePrevSearchMatch}
                disabled={matchedIndices.length === 0}
                className="p-1 text-white/50 hover:text-white disabled:opacity-30 cursor-pointer flex-shrink-0"
                title={APP_TEXT.lyricsToolbar.prevResult}
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                onClick={handleNextSearchMatch}
                disabled={matchedIndices.length === 0}
                className="p-1 text-white/50 hover:text-white disabled:opacity-30 cursor-pointer flex-shrink-0"
                title={APP_TEXT.lyricsToolbar.nextResult}
              >
                <ChevronDown className="w-3 h-3" />
              </button>
              <button
                onClick={() => {
                  setIsLyricSearchOpen(false);
                  setLyricSearchQuery('');
                }}
                className="p-1 text-white/40 hover:text-white cursor-pointer flex-shrink-0"
                title={APP_TEXT.lyricsToolbar.closeSearch}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                playTapSound();
                setIsLyricSearchOpen(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-black/30 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
              title={APP_TEXT.lyricsToolbar.searchButton}
            >
              <Search className="w-3 h-3" />
              <span className="hidden xl:inline">{APP_TEXT.lyricsToolbar.searchButton}</span>
            </button>
          )}

          {/* Swap Original and Reference Language */}
          {hasReferenceLyrics && (
            <button
              onClick={() => {
                playTapSound();
                swapOriginalAndReference();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium bg-black/30 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
              title={APP_TEXT.lyricsToolbar.swapLanguages}
            >
              <ArrowLeftRight className="w-3 h-3 text-white/70" />
              <span className="hidden xl:inline">{APP_TEXT.lyricsToolbar.swapLanguages}</span>
            </button>
          )}

          {/* Copy All References to Translation */}
          {hasReferenceLyrics && (
            <button
              onClick={() => {
                playTapSound();
                copyReferenceToTranslation();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium bg-black/30 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
              title={APP_TEXT.lyricsToolbar.pullReference}
            >
              <Copy className="w-3 h-3 text-white/70" />
              <span className="hidden xl:inline">{APP_TEXT.lyricsToolbar.pullReference}</span>
            </button>
          )}

          {/* Translate Mode Toggle Pill */}
          <button
            onClick={() => {
              playSwitchSound();
              toggleTranslateMode();
            }}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex-shrink-0 border",
              isTranslateMode
                ? "bg-white/15 text-white shadow-sm border-white/25"
                : "bg-black/30 text-white/50 hover:text-white hover:bg-white/10 border-white/10"
            )}
            title={APP_TEXT.lyricsToolbar.translateMode}
          >
            <Languages className="w-3 h-3" />
            <span className="hidden sm:inline">{APP_TEXT.lyricsToolbar.translateMode}</span>
          </button>
        </div>

        {/* Subtle Divider between Document Tools and Document Tabs */}
        <div className="h-4 w-px bg-white/15 mx-1 flex-shrink-0" />

        {/* Cluster 2: Document Tabs Drawer Toggle */}
        <GlassButton
          variant={isTabsDrawerOpen ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => {
            playTapSound();
            toggleTabsDrawer();
          }}
          className="text-[11px] font-semibold cursor-pointer"
          title={APP_TEXT.titleBar.documentTabsTooltip}
        >
          <PanelRight className="w-3 h-3" />
          <span className="hidden sm:inline">แท็บเอกสาร</span>
        </GlassButton>

        {/* Subtle Divider between Document Tabs and System Utilities */}
        <div className="h-4 w-px bg-white/15 mx-1 flex-shrink-0" />

        {/* Cluster 3: System Utilities (Favorites, Settings, Sound FX) */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* User Favorites Library */}
          {onOpenUserLibrary && (
            <GlassTooltip content={APP_TEXT.titleBar.userLibraryTooltip}>
              <button
                onClick={() => {
                  playTapSound();
                  onOpenUserLibrary();
                }}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 active:bg-white/20 transition-all cursor-pointer active:scale-90"
                aria-label={APP_TEXT.titleBar.userLibraryTooltip}
              >
                <Heart className="w-3.5 h-3.5" />
              </button>
            </GlassTooltip>
          )}

          {/* App Settings Modal */}
          {onOpenSettings && (
            <GlassTooltip content="ตั้งค่าระบบ">
              <button
                onClick={() => {
                  playTapSound();
                  onOpenSettings();
                }}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 active:bg-white/20 transition-all cursor-pointer active:scale-90"
                aria-label="ตั้งค่าระบบ"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </GlassTooltip>
          )}

          {/* UI Sound Effects Toggle */}
          <GlassTooltip content={soundEnabled ? 'เปิดเสียงเอฟเฟกต์' : 'ปิดเสียงเอฟเฟกต์'}>
            <button
              onClick={handleToggleSound}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 active:bg-white/20 transition-all cursor-pointer active:scale-90"
              aria-label="เสียงเอฟเฟกต์"
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-white/80" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-white/30" />
              )}
            </button>
          </GlassTooltip>
        </div>

        {/* Subtle Divider between Utilities and Window Controls */}
        <div className="h-4 w-px bg-white/15 mx-1 flex-shrink-0" />

        {/* Cluster 4: Authentic Original Window Controls (Minimize, Maximize, Close) */}
        <WindowControls />
      </div>
    </header>
  );
};
