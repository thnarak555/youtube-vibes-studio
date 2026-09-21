import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from './layouts/AppLayout';
import { WindowTitleBar } from './components/layout/WindowTitleBar';
import { LeftPanel } from './components/player/LeftPanel';
import { RightLyricsPanel } from './components/lyrics/RightLyricsPanel';
import { SearchSongModal } from './components/player/SearchSongModal';
import { ExportModal } from './components/export/ExportModal';
import { ImportModal } from './components/lyrics/ImportModal';
import { ShortcutsModal } from './components/layout/ShortcutsModal';
import { AESettingsModal } from './components/export/AESettingsModal';
import { DocumentTabsSidebar } from './components/layout/DocumentTabsSidebar';
import { DesktopLyricsOverlay } from './components/desktop-lyrics/DesktopLyricsOverlay';
import { DesktopLyricsSettingsModal } from './components/desktop-lyrics/DesktopLyricsSettingsModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { UserLibraryModal } from './components/player/UserLibraryModal';
import { useLyricStore } from './stores/useLyricStore';
import { useAudioEngine } from './hooks/useAudioEngine';
import { useTranslatorShortcuts } from './hooks/useTranslatorShortcuts';
import { APP_CONFIG } from './config/appConfig';

export function App() {
  // If this window is opened as Desktop Lyrics secondary window
  const isDesktopLyricsRoute = typeof window !== 'undefined' && window.location.hash.includes('desktop-lyrics');

  if (isDesktopLyricsRoute) {
    return <DesktopLyricsOverlay />;
  }

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAESettingsOpen, setIsAESettingsOpen] = useState(false);
  const [isDesktopLyricsSettingsOpen, setIsDesktopLyricsSettingsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUserLibraryOpen, setIsUserLibraryOpen] = useState(false);

  // Listen to IPC event from Desktop Lyrics window asking to open settings modal
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.onOpenDesktopLyricsSettingsModal) {
      const unsub = (window as any).electronAPI.onOpenDesktopLyricsSettingsModal(() => {
        setIsSettingsOpen(true);
      });
      return () => {
        if (typeof unsub === 'function') unsub();
      };
    }
  }, []);

  // Universal Escape key listener to close open modals & popups
  useEffect(() => {
    const handleUniversalEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isSettingsOpen) {
          setIsSettingsOpen(false);
          return;
        }
        if (isUserLibraryOpen) {
          setIsUserLibraryOpen(false);
          return;
        }
        if (isDesktopLyricsSettingsOpen) {
          setIsDesktopLyricsSettingsOpen(false);
          return;
        }
        if (isSearchOpen) {
          setIsSearchOpen(false);
          return;
        }
        if (isExportOpen) {
          setIsExportOpen(false);
          return;
        }
        if (isImportOpen) {
          setIsImportOpen(false);
          return;
        }
        if (isHelpOpen) {
          setIsHelpOpen(false);
          return;
        }
        if (isAESettingsOpen) {
          setIsAESettingsOpen(false);
          return;
        }
        const { isTabsDrawerOpen, setTabsDrawerOpen } = useLyricStore.getState();
        if (isTabsDrawerOpen) {
          setTabsDrawerOpen(false);
          return;
        }
        (document.activeElement as HTMLElement)?.blur();
      }
    };
    window.addEventListener('keydown', handleUniversalEscape);
    return () => window.removeEventListener('keydown', handleUniversalEscape);
  }, [isSearchOpen, isExportOpen, isImportOpen, isHelpOpen, isAESettingsOpen, isDesktopLyricsSettingsOpen, isSettingsOpen, isUserLibraryOpen]);

  // Resizable Split-Pane between Left Player & Right Lyrics
  const [leftPanelWidth, setLeftPanelWidth] = useState(() => {
    const saved = localStorage.getItem('lyric_studio_left_width');
    return saved ? Math.max(APP_CONFIG.LEFT_PANEL_MIN_WIDTH_PX, Math.min(APP_CONFIG.LEFT_PANEL_MAX_WIDTH_PX, parseInt(saved, 10))) : APP_CONFIG.LEFT_PANEL_DEFAULT_WIDTH_PX;
  });
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(APP_CONFIG.LEFT_PANEL_MIN_WIDTH_PX, Math.min(APP_CONFIG.LEFT_PANEL_MAX_WIDTH_PX, e.clientX));
      setLeftPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      localStorage.setItem('lyric_studio_left_width', String(leftPanelWidth));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, leftPanelWidth]);

  const { togglePlay, seekTo, loadAudioSource } = useAudioEngine();

  // Register translator shortcuts: Space, R, [, ], Esc, Arrows
  useTranslatorShortcuts(togglePlay, seekTo);

  const handleToggleDesktopLyrics = () => {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.desktopLyricsToggle) {
      (window as any).electronAPI.desktopLyricsToggle();
    }
  };

  return (
    <AppLayout
      leftWidth={leftPanelWidth}
      isResizing={isResizing}
      onStartResizing={startResizing}
      titleBar={
        <WindowTitleBar 
          onOpenSearch={() => setIsSearchOpen(true)} 
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenUserLibrary={() => setIsUserLibraryOpen(true)}
        />
      }
      leftPanel={
        <LeftPanel
          onTogglePlay={togglePlay}
          onSeek={seekTo}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenImport={() => setIsImportOpen(true)}
          onOpenExport={() => setIsExportOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
          onOpenAESettings={() => setIsAESettingsOpen(true)}
          onToggleDesktopLyrics={handleToggleDesktopLyrics}
          onOpenDesktopLyricsSettings={() => setIsSettingsOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenUserLibrary={() => setIsUserLibraryOpen(true)}
        />
      }
      rightPanel={
        <RightLyricsPanel
          onSeek={seekTo}
          onOpenSearch={() => setIsSearchOpen(true)}
        />
      }
      sidebar={
        <DocumentTabsSidebar 
          onOpenSearch={() => setIsSearchOpen(true)} 
          onSwitchProjectAudio={(audioSrc) => {
            loadAudioSource(audioSrc || '', false);
          }}
        />
      }
      modals={
        <>
          <SearchSongModal
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            onLoadAudioSrc={loadAudioSource}
          />

          <ExportModal
            isOpen={isExportOpen}
            onClose={() => setIsExportOpen(false)}
          />

          <ImportModal
            isOpen={isImportOpen}
            onClose={() => setIsImportOpen(false)}
            onLoadAudioSrc={loadAudioSource}
          />

          <ShortcutsModal
            isOpen={isHelpOpen}
            onClose={() => setIsHelpOpen(false)}
          />

          <AESettingsModal
            isOpen={isAESettingsOpen}
            onClose={() => setIsAESettingsOpen(false)}
          />

          <DesktopLyricsSettingsModal
            isOpen={isDesktopLyricsSettingsOpen}
            onClose={() => setIsDesktopLyricsSettingsOpen(false)}
          />

          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />

          <UserLibraryModal
            isOpen={isUserLibraryOpen}
            onClose={() => setIsUserLibraryOpen(false)}
            onLoadAudioSrc={loadAudioSource}
            onOpenSearchWithQuery={() => {
              setIsSearchOpen(true);
            }}
          />
        </>
      }
    />
  );
}

export default App;
