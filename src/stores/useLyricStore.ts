import { create } from 'zustand';
import type { LyricLine, SongMetadata, AEPresetColors, ProjectBackupFile, DisplayMode, LyricSnapshot } from '../types';
import { AE_COLOR_PRESETS } from '../utils/presets';
import { 
  generateBilingualLrc, 
  generateTranslationLrc, 
  generateOriginalLrc, 
  generateReferenceLrc, 
  generateSrt 
} from '../utils/lrcExporter';
import { generateAEScript } from '../utils/aeExporter';
import { extractColorsFromCover } from '../utils/colorExtractor';
import { usePlayerStore } from './usePlayerStore';
import { APP_CONFIG } from '../config/appConfig';
import { logger } from '../services/logger';

const STORAGE_KEY = 'lyric_studio_project_v3';
const FAVORITES_KEY = 'lyric_studio_title_favorites_v1';

const EMPTY_METADATA: SongMetadata = {
  title: '',
  artist: '',
  album: '',
  coverUrl: '',
  duration: 0,
  audioSrc: '',
  glowRadius: APP_CONFIG.DEFAULT_GLOW_RADIUS
};

function syncDesktopLyrics(lyrics: LyricLine[], activeLineIndex: number) {
  if (typeof window !== 'undefined' && (window as any).electronAPI?.desktopLyricsUpdate) {
    const curLine = lyrics[activeLineIndex] || lyrics[0];
    const prevLine = lyrics[activeLineIndex - 1];
    const nextLine = lyrics[activeLineIndex + 1];
    const playerState = usePlayerStore.getState();
    (window as any).electronAPI.desktopLyricsUpdate({
      original: curLine?.original || '',
      translation: curLine?.translation || '',
      reference: curLine?.referenceTranslation || '',
      prevOriginal: prevLine?.original || '',
      nextOriginal: nextLine?.original || '',
      inTime: curLine?.inTime || 0,
      outTime: curLine?.outTime || 0,
      currentTime: playerState.currentTime || 0,
      isPlaying: playerState.isPlaying || false
    });
  }
}

function loadSavedState(): { 
  lyrics: LyricLine[]; 
  metadata: SongMetadata; 
  aePresets: AEPresetColors[]; 
  aePreset: AEPresetColors;
  glowRadius: number;
} {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.metadata && parsed.metadata.title) {
          logger.info('[STORE]', `Loaded saved project from localStorage: ${parsed.metadata.title}`);
          return { 
            lyrics: Array.isArray(parsed.lyrics) ? parsed.lyrics : [], 
            metadata: parsed.metadata,
            aePresets: parsed.aePresets || AE_COLOR_PRESETS,
            aePreset: parsed.aePreset || AE_COLOR_PRESETS[0],
            glowRadius: parsed.glowRadius || APP_CONFIG.DEFAULT_GLOW_RADIUS
          };
        }
      }
    }
  } catch (e) {
    logger.error('[STORE]', 'Failed to load project from localStorage', e);
  }
  return { 
    lyrics: [], 
    metadata: EMPTY_METADATA, 
    aePresets: AE_COLOR_PRESETS, 
    aePreset: AE_COLOR_PRESETS[0],
    glowRadius: APP_CONFIG.DEFAULT_GLOW_RADIUS 
  };
}

function loadFavorites(): string[] {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    }
    return [];
  } catch (e) {
    return [];
  }
}

export interface DocumentTab {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
  folderPath?: string;
  lastSavedAt: string;
  lyrics?: LyricLine[];
  metadata?: SongMetadata;
  aePreset?: AEPresetColors;
  glowRadius?: number;
}

const TABS_KEY = 'lyric_studio_open_tabs_v2';

function loadOpenTabs(
  initialMeta: SongMetadata, 
  initialLyrics?: LyricLine[], 
  initialPreset?: AEPresetColors, 
  initialGlow?: number
): DocumentTab[] {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(TABS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    }
  } catch (e) {}

  if (initialMeta && initialMeta.title) {
    return [{
      id: 'tab-init',
      title: initialMeta.title,
      artist: initialMeta.artist || '',
      coverUrl: initialMeta.coverUrl || '',
      lastSavedAt: 'เมื่อสักครู่',
      lyrics: initialLyrics || [],
      metadata: initialMeta,
      aePreset: initialPreset || AE_COLOR_PRESETS[0],
      glowRadius: initialGlow || APP_CONFIG.DEFAULT_GLOW_RADIUS
    }];
  }
  return [{
    id: 'tab-1',
    title: 'เอกสารใหม่',
    artist: '',
    coverUrl: '',
    lastSavedAt: 'เมื่อสักครู่',
    lyrics: [],
    metadata: EMPTY_METADATA,
    aePreset: AE_COLOR_PRESETS[0],
    glowRadius: APP_CONFIG.DEFAULT_GLOW_RADIUS
  }];
}

let saveTimer: any = null;

function triggerAutoSave(get: () => LyricState, set: (fn: Partial<LyricState>) => void) {
  set({ saveStatus: 'saving' });
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      const state = get();
      const payload = {
        lyrics: state.lyrics,
        metadata: state.metadata,
        aePresets: state.aePresets,
        aePreset: state.aePreset,
        glowRadius: state.glowRadius
      };
      const jsonStr = JSON.stringify(payload, null, 2);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, jsonStr);
      }

      let savedFolder = state.savedDiskFolder;
      let savedPath = state.savedDiskPath;

      // Real-time disk auto-save if inside Electron and has a song title
      if (typeof window !== 'undefined' && (window as any).electronAPI?.saveDiskProject && state.metadata.title) {
        try {
          const formats = {
            bilingualLrc: generateBilingualLrc(state.lyrics, state.metadata),
            thaiLrc: generateTranslationLrc(state.lyrics, state.metadata),
            originalLrc: generateOriginalLrc(state.lyrics, state.metadata),
            referenceLrc: generateReferenceLrc(state.lyrics, state.metadata),
            aeJsx: generateAEScript(state.lyrics, state.metadata, {
              startColorHex: state.aePreset.startColorHex,
              endColorHex: state.aePreset.endColorHex,
              glowRadius: state.glowRadius
            }),
            srt: generateSrt(state.lyrics)
          };

          const res = await (window as any).electronAPI.saveDiskProject({
            metadata: state.metadata,
            projectJson: jsonStr,
            formats
          });

          if (res?.success) {
            savedFolder = res.folderName;
            savedPath = res.folderPath;
            logger.debug('[STORE]', `Disk auto-saved project to ${savedFolder}`);
          }
        } catch (diskErr) {
          logger.warn('[STORE]', 'Disk auto-save error:', diskErr);
        }
      }

      // Sync active tab in openTabs
      const tabs = state.openTabs || [];
      const activeId = state.activeTabId;
      const nextTabs = tabs.map((t) =>
        t.id === activeId
          ? {
              ...t,
              title: state.metadata.title || t.title,
              artist: state.metadata.artist || t.artist,
              coverUrl: state.metadata.coverUrl || t.coverUrl,
              folderPath: savedPath || t.folderPath,
              lyrics: state.lyrics,
              metadata: state.metadata,
              aePreset: state.aePreset,
              glowRadius: state.glowRadius,
              lastSavedAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
            }
          : t
      );
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(TABS_KEY, JSON.stringify(nextTabs));
      }

      set({ 
        saveStatus: 'saved', 
        savedDiskFolder: savedFolder,
        savedDiskPath: savedPath,
        openTabs: nextTabs,
        lastSavedAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) 
      });
    } catch (err) {
      logger.error('[STORE]', 'AutoSave error:', err);
    }
  }, APP_CONFIG.AUTO_SAVE_DELAY_MS);
}

function saveSnapshot(get: () => LyricState, set: (s: Partial<LyricState>) => void, description: string) {
  const currentLyrics = get().lyrics;
  const past = [...get().past, { lyrics: currentLyrics, timestamp: Date.now(), description }];
  if (past.length > APP_CONFIG.MAX_UNDO_HISTORY_DEPTH) {
    past.shift();
  }
  set({ past, future: [], canUndo: true, canRedo: false });
}

interface LyricState {
  lyrics: LyricLine[];
  metadata: SongMetadata;
  activeLineIndex: number;
  loopLineIndex: number | null;
  aePreset: AEPresetColors;
  aePresets: AEPresetColors[];
  glowRadius: number;
  saveStatus: 'saved' | 'saving';
  savedDiskFolder: string | null;
  savedDiskPath: string | null;
  lastSavedAt: string;
  favoriteSongs: string[];
  activeInputFocusTrigger: number;
  openTabs: DocumentTab[];
  activeTabId: string;
  isTabsDrawerOpen: boolean;
  displayMode: DisplayMode;
  transitionStyle: 'scroll' | 'fade';
  lyricSearchQuery: string;
  isLyricSearchOpen: boolean;
  isTranslateMode: boolean;
  setIsTranslateMode: (isTranslateMode: boolean) => void;
  toggleTranslateMode: () => void;

  // Undo / Redo
  past: LyricSnapshot[];
  future: LyricSnapshot[];
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;

  setDisplayMode: (mode: DisplayMode) => void;
  setTabsDrawerOpen: (open: boolean) => void;
  toggleTabsDrawer: () => void;
  setTransitionStyle: (style: 'scroll' | 'fade') => void;
  setLyricSearchQuery: (query: string) => void;
  setIsLyricSearchOpen: (open: boolean) => void;
  openTab: (tab: DocumentTab, data?: ProjectBackupFile) => void;
  closeTab: (tabId: string) => void;
  createNewTab: () => void;

  updateLineTimecode: (id: string, inTime: number, outTime: number) => void;
  nudgeLineTimecode: (id: string, deltaSeconds: number) => void;
  stampCurrentTimeToLine: (id: string, currentTime: number) => void;
  resetLineToOriginalTime: (id: string) => void;
  splitLine: (id: string, splitTime: number) => void;
  mergeWithNextLine: (id: string) => void;

  setLyrics: (lyrics: LyricLine[]) => void;
  updateTranslation: (id: string, text: string) => void;
  updateReference: (id: string, text: string) => void;
  updateOriginal: (id: string, text: string) => void;
  updateTiming: (id: string, inTime: number, outTime: number) => void;
  addLine: (afterIndex?: number) => void;
  removeLine: (id: string) => void;
  setMetadata: (meta: Partial<SongMetadata>) => void;
  setActiveLineIndex: (idx: number) => void;
  setLoopLineIndex: (idx: number | null) => void;
  setAEPreset: (preset: AEPresetColors) => void;
  addAEPreset: (preset: AEPresetColors) => void;
  deleteAEPreset: (id: string) => void;
  setGlowRadius: (radius: number) => void;
  swapOriginalAndReference: () => void;
  copyReferenceToTranslation: (lineId?: string) => void;
  loadProject: (project: ProjectBackupFile) => void;
  forceSave: () => void;
  openProjectDiskFolder: () => Promise<void>;
  toggleFavoriteCurrentSong: () => void;
  isCurrentSongFavorite: () => boolean;
  focusActiveInput: () => void;
  typeIntoActiveLine: (char: string) => void;
  goToNextLine: () => void;
  goToPrevLine: () => void;
  resetToDefault: () => void;
  clearAll: () => void;
}

const initial = loadSavedState();
const initialTabs = loadOpenTabs(initial.metadata, initial.lyrics, initial.aePreset, initial.glowRadius);

export const useLyricStore = create<LyricState>((set, get) => ({
  lyrics: initial.lyrics,
  metadata: initial.metadata,
  activeLineIndex: 0,
  loopLineIndex: null,
  aePreset: initial.aePreset,
  aePresets: initial.aePresets,
  glowRadius: initial.glowRadius,
  saveStatus: 'saved',
  savedDiskFolder: null,
  savedDiskPath: null,
  lastSavedAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
  favoriteSongs: loadFavorites(),
  activeInputFocusTrigger: 0,
  openTabs: initialTabs,
  activeTabId: initialTabs[0]?.id || 'tab-1',
  isTabsDrawerOpen: false,
  displayMode: 'normal',
  transitionStyle: 'scroll',
  lyricSearchQuery: '',
  isLyricSearchOpen: false,
  isTranslateMode: true,

  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  undo: () => {
    const { past, future, lyrics } = get();
    if (past.length === 0) return;
    const previousSnapshot = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    const newFuture = [{ lyrics, timestamp: Date.now(), description: 'Current' }, ...future];
    set({
      lyrics: previousSnapshot.lyrics,
      past: newPast,
      future: newFuture,
      canUndo: newPast.length > 0,
      canRedo: true
    });
    logger.info('[UNDO_REDO]', `Undo performed: restored ${previousSnapshot.lyrics.length} lines`);
    triggerAutoSave(get, set);
  },

  redo: () => {
    const { past, future, lyrics } = get();
    if (future.length === 0) return;
    const nextSnapshot = future[0];
    const newFuture = future.slice(1);
    const newPast = [...past, { lyrics, timestamp: Date.now(), description: 'Before redo' }];
    set({
      lyrics: nextSnapshot.lyrics,
      past: newPast,
      future: newFuture,
      canUndo: true,
      canRedo: newFuture.length > 0
    });
    logger.info('[UNDO_REDO]', `Redo performed: restored ${nextSnapshot.lyrics.length} lines`);
    triggerAutoSave(get, set);
  },

  setDisplayMode: (displayMode) => {
    set({ 
      displayMode, 
      transitionStyle: displayMode === 'fade' ? 'fade' : 'scroll' 
    });
    logger.info('[STORE]', `Display mode changed to: ${displayMode}`);
  },

  setTabsDrawerOpen: (isTabsDrawerOpen) => set({ isTabsDrawerOpen }),
  toggleTabsDrawer: () => set((state) => ({ isTabsDrawerOpen: !state.isTabsDrawerOpen })),
  setTransitionStyle: (transitionStyle) => set({ 
    transitionStyle,
    displayMode: transitionStyle === 'fade' ? 'fade' : 'normal'
  }),
  setLyricSearchQuery: (lyricSearchQuery) => set({ lyricSearchQuery }),
  setIsLyricSearchOpen: (isLyricSearchOpen) => set({ isLyricSearchOpen }),
  setIsTranslateMode: (isTranslateMode) => set({ isTranslateMode }),
  toggleTranslateMode: () => set((state) => ({ isTranslateMode: !state.isTranslateMode })),

  setLyrics: (lyrics) => {
    saveSnapshot(get, set, 'Set lyrics');
    set({ lyrics, activeLineIndex: 0 });
    syncDesktopLyrics(lyrics, 0);
    logger.info('[STORE]', `Set lyrics: ${lyrics.length} lines`);
    triggerAutoSave(get, set);
  },

  updateTranslation: (id, text) => {
    saveSnapshot(get, set, 'Update translation');
    const updated = get().lyrics.map(l => l.id === id ? { ...l, translation: text } : l);
    set({ lyrics: updated });
    syncDesktopLyrics(updated, get().activeLineIndex);
    triggerAutoSave(get, set);
  },

  updateReference: (id, text) => {
    saveSnapshot(get, set, 'Update reference');
    const updated = get().lyrics.map(l => l.id === id ? { ...l, referenceTranslation: text } : l);
    set({ lyrics: updated });
    syncDesktopLyrics(updated, get().activeLineIndex);
    triggerAutoSave(get, set);
  },

  updateOriginal: (id, text) => {
    saveSnapshot(get, set, 'Update original');
    const updated = get().lyrics.map(l => l.id === id ? { ...l, original: text } : l);
    set({ lyrics: updated });
    syncDesktopLyrics(updated, get().activeLineIndex);
    triggerAutoSave(get, set);
  },

  updateTiming: (id, inTime, outTime) => {
    saveSnapshot(get, set, 'Update timing');
    const updated = get().lyrics.map(l => l.id === id ? { ...l, inTime, outTime } : l);
    set({ lyrics: updated });
    triggerAutoSave(get, set);
  },

  addLine: (afterIndex) => {
    saveSnapshot(get, set, 'Add line');
    const current = [...get().lyrics];
    const idx = afterIndex !== undefined ? afterIndex : current.length - 1;
    const prev = current[idx];
    const newIn = prev ? prev.outTime : 0;
    const newLine: LyricLine = {
      id: 'custom-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      inTime: Number(newIn.toFixed(2)),
      outTime: Number((newIn + 4).toFixed(2)),
      original: 'New Lyric Line',
      referenceTranslation: '',
      translation: '',
      originalInTime: Number(newIn.toFixed(2)),
      originalOutTime: Number((newIn + 4).toFixed(2))
    };
    current.splice(idx + 1, 0, newLine);
    set({ lyrics: current });
    logger.info('[STORE]', `Added lyric line at index ${idx + 1}`);
    triggerAutoSave(get, set);
  },

  removeLine: (id) => {
    saveSnapshot(get, set, 'Remove line');
    const updated = get().lyrics.filter(l => l.id !== id);
    set({ lyrics: updated });
    logger.info('[STORE]', `Removed lyric line ${id}`);
    triggerAutoSave(get, set);
  },

  setMetadata: (meta) => {
    const prevCover = get().metadata.coverUrl;
    const updatedMeta = { ...get().metadata, ...meta };
    const activeTabId = get().activeTabId;
    const updatedTabs = get().openTabs.map(t => 
      t.id === activeTabId 
        ? { 
            ...t, 
            title: updatedMeta.title || t.title,
            artist: updatedMeta.artist || t.artist,
            coverUrl: updatedMeta.coverUrl || t.coverUrl
          } 
        : t
    );
    set({ metadata: updatedMeta, openTabs: updatedTabs });
    logger.info('[STORE]', `Metadata updated: ${updatedMeta.title} by ${updatedMeta.artist}`);

    // Automatically extract colors from album cover if updated
    if (meta.coverUrl && meta.coverUrl !== prevCover) {
      extractColorsFromCover(meta.coverUrl).then((colors) => {
        const dynamicPreset: AEPresetColors = {
          id: 'preset-cover-dynamic',
          name: `${updatedMeta.title || 'เพลง'} สีตามปก`,
          startColorHex: colors.startColorHex,
          endColorHex: colors.endColorHex,
          description: `คู่สีสกัดจากภาพปก ${colors.startColorHex} ➔ ${colors.endColorHex}`
        };
        set({ aePreset: dynamicPreset });
        triggerAutoSave(get, set);
        logger.info('[STORE]', `Extracted dynamic cover colors: ${colors.startColorHex} -> ${colors.endColorHex}`);
      }).catch(() => {});
    }

    triggerAutoSave(get, set);
  },

  setActiveLineIndex: (activeLineIndex) => {
    set({ activeLineIndex });
    syncDesktopLyrics(get().lyrics, activeLineIndex);
  },
  setLoopLineIndex: (loopLineIndex) => set({ loopLineIndex }),
  
  setAEPreset: (aePreset) => {
    set({ aePreset });
    triggerAutoSave(get, set);
  },

  addAEPreset: (preset) => {
    const updated = [...get().aePresets, preset];
    set({ aePresets: updated, aePreset: preset });
    triggerAutoSave(get, set);
  },

  deleteAEPreset: (id) => {
    const current = get().aePresets;
    if (current.length <= 1) return;
    const updated = current.filter(p => p.id !== id);
    const fallback = updated[0];
    set({ aePresets: updated, aePreset: get().aePreset.id === id ? fallback : get().aePreset });
    triggerAutoSave(get, set);
  },

  setGlowRadius: (glowRadius) => {
    set({ glowRadius });
    triggerAutoSave(get, set);
  },

  swapOriginalAndReference: () => {
    saveSnapshot(get, set, 'Swap original and reference');
    const updated = get().lyrics.map(l => ({
      ...l,
      original: l.referenceTranslation || l.original,
      referenceTranslation: l.original
    }));
    set({ lyrics: updated });
    syncDesktopLyrics(updated, get().activeLineIndex);
    logger.info('[STORE]', 'Swapped original and reference lyrics');
    triggerAutoSave(get, set);
  },

  copyReferenceToTranslation: (lineId) => {
    saveSnapshot(get, set, 'Copy reference to translation');
    if (lineId) {
      const updated = get().lyrics.map(l => 
        l.id === lineId ? { ...l, translation: l.referenceTranslation || l.translation } : l
      );
      set({ lyrics: updated });
      syncDesktopLyrics(updated, get().activeLineIndex);
    } else {
      const updated = get().lyrics.map(l => ({
        ...l,
        translation: l.referenceTranslation || l.translation
      }));
      set({ lyrics: updated });
      syncDesktopLyrics(updated, get().activeLineIndex);
    }
    logger.info('[STORE]', `Copied reference to translation ${lineId ? `for line ${lineId}` : 'for all lines'}`);
    triggerAutoSave(get, set);
  },

  loadProject: (project) => {
    set({
      lyrics: project.lyrics || [],
      metadata: project.metadata || EMPTY_METADATA,
      aePreset: project.aePreset || AE_COLOR_PRESETS[0],
      glowRadius: project.glowRadius || APP_CONFIG.DEFAULT_GLOW_RADIUS,
      activeLineIndex: 0,
      loopLineIndex: null,
      past: [],
      future: [],
      canUndo: false,
      canRedo: false
    });
    logger.info('[STORE]', `Loaded project: ${project.metadata?.title}`);
    triggerAutoSave(get, set);
  },

  forceSave: () => {
    if (saveTimer) clearTimeout(saveTimer);
    triggerAutoSave(get, set);
  },

  openProjectDiskFolder: async () => {
    const targetPath = get().savedDiskPath;
    logger.info('[STORE]', `Opening project disk folder: ${targetPath || 'default workspace'}`);
    if (typeof window !== 'undefined' && (window as any).electronAPI?.openFolder) {
      await (window as any).electronAPI.openFolder(targetPath || undefined);
    }
  },

  toggleFavoriteCurrentSong: () => {
    const currentTitle = get().metadata.title;
    if (!currentTitle) return;
    const favorites = Array.isArray(get().favoriteSongs) ? get().favoriteSongs : [];
    const exists = favorites.includes(currentTitle);
    const updated = exists ? favorites.filter(t => t !== currentTitle) : [...favorites, currentTitle];
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      }
    } catch (e) {}
    set({ favoriteSongs: updated });
  },

  isCurrentSongFavorite: () => {
    const currentTitle = get().metadata.title;
    const favs = get().favoriteSongs;
    return Boolean(currentTitle && Array.isArray(favs) && favs.includes(currentTitle));
  },

  focusActiveInput: () => {
    set((state) => ({ activeInputFocusTrigger: state.activeInputFocusTrigger + 1 }));
  },

  typeIntoActiveLine: (char) => {
    const state = get();
    const idx = state.activeLineIndex;
    const targetLine = state.lyrics[idx];
    if (!targetLine) return;

    saveSnapshot(get, set, 'Type into active line');
    const updatedLyrics = state.lyrics.map((l, i) =>
      i === idx ? { ...l, translation: (l.translation || '') + char } : l
    );
    set({ lyrics: updatedLyrics });
    syncDesktopLyrics(updatedLyrics, idx);
    state.focusActiveInput();
    triggerAutoSave(get, set);
  },

  goToNextLine: () => {
    const { activeLineIndex, lyrics } = get();
    if (activeLineIndex < lyrics.length - 1) {
      set({ activeLineIndex: activeLineIndex + 1 });
    }
  },

  goToPrevLine: () => {
    const { activeLineIndex } = get();
    if (activeLineIndex > 0) {
      set({ activeLineIndex: activeLineIndex - 1 });
    }
  },

  openTab: (tab, data) => {
    logger.info('[STORE]', `Opening tab: ${tab.id} - ${tab.title}`);
    const state = get();
    // 1. Snapshot current tab before switching
    const currentTabs = state.openTabs.map(t => {
      if (t.id === state.activeTabId) {
        return {
          ...t,
          title: state.metadata.title || t.title,
          artist: state.metadata.artist || t.artist,
          coverUrl: state.metadata.coverUrl || t.coverUrl,
          lyrics: state.lyrics,
          metadata: state.metadata,
          aePreset: state.aePreset,
          glowRadius: state.glowRadius,
          lastSavedAt: 'เมื่อสักครู่'
        };
      }
      return t;
    });

    const targetTab = currentTabs.find(t => t.id === tab.id) || tab;
    const targetLyrics = data?.lyrics || targetTab.lyrics || [];
    const targetMeta = data?.metadata || targetTab.metadata || EMPTY_METADATA;
    const targetPreset = data?.aePreset || targetTab.aePreset || AE_COLOR_PRESETS[0];
    const targetGlow = data?.glowRadius || targetTab.glowRadius || APP_CONFIG.DEFAULT_GLOW_RADIUS;

    set({
      openTabs: currentTabs,
      activeTabId: tab.id,
      lyrics: targetLyrics,
      metadata: targetMeta,
      aePreset: targetPreset,
      glowRadius: targetGlow,
      activeLineIndex: 0,
      loopLineIndex: null,
      savedDiskFolder: data?.folderPath || targetTab.folderPath || null,
      savedDiskPath: data?.folderPath ? `${data.folderPath}/project.lts` : null,
      past: [],
      future: [],
      canUndo: false,
      canRedo: false
    });

    usePlayerStore.getState().setCurrentTime(0);
    usePlayerStore.getState().setIsPlaying(false);
    if (targetMeta.duration) {
      usePlayerStore.getState().setDuration(targetMeta.duration);
    } else if (targetLyrics.length > 0) {
      usePlayerStore.getState().setDuration(targetLyrics[targetLyrics.length - 1].outTime || 210);
    }

    if (targetMeta.coverUrl) {
      extractColorsFromCover(targetMeta.coverUrl).then((colors) => {
        if (colors) {
          set({
            aePreset: {
              id: 'extracted-cover-theme',
              name: 'Theme from Cover',
              startColorHex: colors.startColorHex,
              endColorHex: colors.endColorHex,
              description: 'Extracted automatically from album cover'
            }
          });
        }
      }).catch(() => {});
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(TABS_KEY, JSON.stringify(currentTabs));
    }
    triggerAutoSave(get, set);
  },

  closeTab: (tabId) => {
    const { openTabs, activeTabId } = get();
    if (openTabs.length <= 1) return;
    const updatedTabs = openTabs.filter(t => t.id !== tabId);
    let nextActiveId = activeTabId;
    if (activeTabId === tabId) {
      nextActiveId = updatedTabs[0]?.id || 'tab-1';
    }
    set({ openTabs: updatedTabs, activeTabId: nextActiveId });
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(TABS_KEY, JSON.stringify(updatedTabs));
    }
    logger.info('[STORE]', `Closed tab: ${tabId}, next active: ${nextActiveId}`);
  },

  createNewTab: () => {
    const state = get();
    // Snapshot current tab before creating new one
    const currentTabs = state.openTabs.map(t => {
      if (t.id === state.activeTabId) {
        return {
          ...t,
          title: state.metadata.title || t.title,
          artist: state.metadata.artist || t.artist,
          coverUrl: state.metadata.coverUrl || t.coverUrl,
          lyrics: state.lyrics,
          metadata: state.metadata,
          aePreset: state.aePreset,
          glowRadius: state.glowRadius,
          lastSavedAt: 'เมื่อสักครู่'
        };
      }
      return t;
    });

    const newId = 'tab-' + Date.now().toString(36);
    const newTab: DocumentTab = {
      id: newId,
      title: 'เอกสารใหม่',
      artist: '',
      lastSavedAt: 'เมื่อสักครู่',
      lyrics: [],
      metadata: EMPTY_METADATA,
      aePreset: AE_COLOR_PRESETS[0],
      glowRadius: APP_CONFIG.DEFAULT_GLOW_RADIUS
    };
    const updatedTabs = [...currentTabs, newTab];
    set({
      openTabs: updatedTabs,
      activeTabId: newId,
      lyrics: [],
      metadata: EMPTY_METADATA,
      aePreset: AE_COLOR_PRESETS[0],
      glowRadius: APP_CONFIG.DEFAULT_GLOW_RADIUS,
      activeLineIndex: 0,
      loopLineIndex: null,
      savedDiskFolder: null,
      savedDiskPath: null,
      past: [],
      future: [],
      canUndo: false,
      canRedo: false
    });
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(TABS_KEY, JSON.stringify(updatedTabs));
    }
    logger.info('[STORE]', `Created new tab: ${newId}`);
  },

  updateLineTimecode: (id, inTime, outTime) => {
    saveSnapshot(get, set, 'Update timecode');
    const cleanIn = Math.max(0, Number(inTime.toFixed(2)));
    const cleanOut = Math.max(cleanIn, Number(outTime.toFixed(2)));
    const updated = get().lyrics.map((l) => (l.id === id ? { ...l, inTime: cleanIn, outTime: cleanOut } : l));
    set({ lyrics: updated });
    triggerAutoSave(get, set);
  },

  nudgeLineTimecode: (id, deltaSeconds) => {
    saveSnapshot(get, set, 'Nudge timecode');
    const updated = get().lyrics.map((l) => {
      if (l.id !== id) return l;
      const newIn = Math.max(0, Number((l.inTime + deltaSeconds).toFixed(2)));
      const newOut = Math.max(newIn + 0.1, Number((l.outTime + deltaSeconds).toFixed(2)));
      return { ...l, inTime: newIn, outTime: newOut };
    });
    set({ lyrics: updated });
    triggerAutoSave(get, set);
  },

  stampCurrentTimeToLine: (id, currentTime) => {
    saveSnapshot(get, set, 'Stamp timecode');
    const t = Math.max(0, Number(currentTime.toFixed(2)));
    const updated = get().lyrics.map((l) => {
      if (l.id !== id) return l;
      const newOut = l.outTime <= t ? Number((t + 3.0).toFixed(2)) : l.outTime;
      return { ...l, inTime: t, outTime: newOut };
    });
    set({ lyrics: updated });
    triggerAutoSave(get, set);
  },

  resetLineToOriginalTime: (id) => {
    const target = get().lyrics.find(l => l.id === id);
    if (!target || target.originalInTime === undefined) return;
    saveSnapshot(get, set, 'Reset line to original time');
    const updated = get().lyrics.map(l => {
      if (l.id !== id) return l;
      return {
        ...l,
        inTime: l.originalInTime !== undefined ? l.originalInTime : l.inTime,
        outTime: l.originalOutTime !== undefined ? l.originalOutTime : l.outTime
      };
    });
    set({ lyrics: updated });
    logger.info('[STORE]', `Reset line ${id} to original time: [${target.originalInTime}s - ${target.originalOutTime}s]`);
    triggerAutoSave(get, set);
  },

  splitLine: (id, splitTime) => {
    saveSnapshot(get, set, 'Split line');
    const { lyrics } = get();
    const idx = lyrics.findIndex((l) => l.id === id);
    if (idx === -1) return;
    const target = lyrics[idx];
    const sTime = Math.max(target.inTime, Math.min(target.outTime, Number(splitTime.toFixed(2))));
    const lineA: LyricLine = {
      ...target,
      outTime: sTime
    };
    const lineB: LyricLine = {
      id: 'line-' + Date.now(),
      inTime: sTime,
      outTime: target.outTime,
      original: '',
      translation: '',
      referenceTranslation: '',
      originalInTime: sTime,
      originalOutTime: target.outTime
    };
    const nextList = [...lyrics.slice(0, idx), lineA, lineB, ...lyrics.slice(idx + 1)];
    set({ lyrics: nextList });
    triggerAutoSave(get, set);
  },

  mergeWithNextLine: (id) => {
    saveSnapshot(get, set, 'Merge line');
    const { lyrics } = get();
    const idx = lyrics.findIndex((l) => l.id === id);
    if (idx === -1 || idx >= lyrics.length - 1) return;
    const cur = lyrics[idx];
    const next = lyrics[idx + 1];
    const merged: LyricLine = {
      ...cur,
      outTime: next.outTime,
      original: (cur.original + ' ' + next.original).trim(),
      translation: [cur.translation, next.translation].filter(Boolean).join(' ').trim(),
      referenceTranslation: [cur.referenceTranslation, next.referenceTranslation].filter(Boolean).join(' ').trim(),
      originalInTime: cur.originalInTime ?? cur.inTime,
      originalOutTime: next.originalOutTime ?? next.outTime
    };
    const nextList = [...lyrics.slice(0, idx), merged, ...lyrics.slice(idx + 2)];
    set({ lyrics: nextList });
    triggerAutoSave(get, set);
  },

  resetToDefault: () => {
    set({ 
      lyrics: [], 
      metadata: EMPTY_METADATA, 
      activeLineIndex: 0, 
      loopLineIndex: null,
      aePreset: AE_COLOR_PRESETS[0],
      glowRadius: APP_CONFIG.DEFAULT_GLOW_RADIUS,
      savedDiskFolder: null,
      savedDiskPath: null,
      past: [],
      future: [],
      canUndo: false,
      canRedo: false
    });
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  clearAll: () => {
    set({ 
      lyrics: [], 
      metadata: EMPTY_METADATA, 
      activeLineIndex: 0, 
      loopLineIndex: null,
      savedDiskFolder: null,
      savedDiskPath: null,
      past: [],
      future: [],
      canUndo: false,
      canRedo: false
    });
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    logger.info('[STORE]', 'Cleared all lyrics and metadata');
  }
}));
