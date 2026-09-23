import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DisplayMode = 'dual' | 'triple' | 'scroll3' | 'single';
export type ShadowIntensity = 'none' | 'normal' | 'strong' | 'glow';
export type TextAlign = 'left' | 'center' | 'right';
export type OverflowMode = 'ellipsis' | 'wrap';

export interface DesktopLyricsTemplate {
  id: string;
  name: string;
  fontSize: number;
  secondaryFontSize: number;
  textColor: string;
  secondaryColor: string;
  shadowIntensity: ShadowIntensity;
  textAlign: TextAlign;
}

export const BUILTIN_STYLE_TEMPLATES: DesktopLyricsTemplate[] = [
  {
    id: 'default-mao',
    name: 'นีออนไซแอน',
    fontSize: 32,
    secondaryFontSize: 20,
    textColor: '#ffffff',
    secondaryColor: '#67e8f9',
    shadowIntensity: 'glow',
    textAlign: 'center'
  },
  {
    id: 'clean-white',
    name: 'ขาวคลีนมินิมอล',
    fontSize: 32,
    secondaryFontSize: 18,
    textColor: '#ffffff',
    secondaryColor: '#94a3b8',
    shadowIntensity: 'strong',
    textAlign: 'center'
  },
  {
    id: 'studio-silver',
    name: 'สตูดิโอซิลเวอร์',
    fontSize: 34,
    secondaryFontSize: 20,
    textColor: '#d4d4d4',
    secondaryColor: '#38bdf8',
    shadowIntensity: 'glow',
    textAlign: 'center'
  },
  {
    id: 'golden-amber',
    name: 'ทองอำพัน',
    fontSize: 32,
    secondaryFontSize: 18,
    textColor: '#fef08a',
    secondaryColor: '#f59e0b',
    shadowIntensity: 'strong',
    textAlign: 'center'
  },
  {
    id: 'emerald-green',
    name: 'เขียวมรกต',
    fontSize: 32,
    secondaryFontSize: 18,
    textColor: '#6ee7b7',
    secondaryColor: '#10b981',
    shadowIntensity: 'glow',
    textAlign: 'center'
  },
  {
    id: 'left-aligned-dual',
    name: 'ซับไตเติลชิดซ้าย',
    fontSize: 28,
    secondaryFontSize: 18,
    textColor: '#ffffff',
    secondaryColor: '#38bdf8',
    shadowIntensity: 'strong',
    textAlign: 'left'
  }
];

export interface DesktopLyricsSettings {
  fontSize: number;
  secondaryFontSize: number;
  textColor: string;
  secondaryColor: string;
  displayMode: DisplayMode;
  shadowIntensity: ShadowIntensity;
  textAlign: TextAlign;
  backgroundOpacity: number;
  alwaysOnTop: boolean;
  isLocked: boolean;
  overflowMode: OverflowMode;
}

interface DesktopLyricsState extends DesktopLyricsSettings {
  isModalOpen: boolean;
  setFontSize: (fontSize: number) => void;
  setSecondaryFontSize: (secondaryFontSize: number) => void;
  setTextColor: (textColor: string) => void;
  setSecondaryColor: (secondaryColor: string) => void;
  setDisplayMode: (displayMode: DisplayMode) => void;
  setShadowIntensity: (shadowIntensity: ShadowIntensity) => void;
  setTextAlign: (textAlign: TextAlign) => void;
  setBackgroundOpacity: (backgroundOpacity: number) => void;
  setAlwaysOnTop: (alwaysOnTop: boolean) => void;
  setIsLocked: (isLocked: boolean) => void;
  setOverflowMode: (overflowMode: OverflowMode) => void;
  setIsModalOpen: (isModalOpen: boolean) => void;
  applyTemplate: (template: DesktopLyricsTemplate) => void;
  resetToDefaults: () => void;
  getSettingsSnapshot: () => DesktopLyricsSettings;
  updateFromRemote: (settings: Partial<DesktopLyricsSettings>) => void;
}

const DEFAULT_SETTINGS: DesktopLyricsSettings = {
  fontSize: 32,
  secondaryFontSize: 20,
  textColor: '#ffffff',
  secondaryColor: '#cbd5e1',
  displayMode: 'dual',
  shadowIntensity: 'strong',
  textAlign: 'center',
  backgroundOpacity: 0,
  alwaysOnTop: true,
  isLocked: false,
  overflowMode: 'ellipsis'
};

function broadcastSettings(settings: DesktopLyricsSettings) {
  // Prevent infinite loop: Only the main window broadcasts settings, never the secondary overlay window
  if (typeof window !== 'undefined' && !window.location.hash.includes('desktop-lyrics') && (window as any).electronAPI?.applyDesktopLyricsSettings) {
    (window as any).electronAPI.applyDesktopLyricsSettings(settings);
  }
}

export const useDesktopLyricsStore = create<DesktopLyricsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,
      isModalOpen: false,

      updateFromRemote: (settings) => {
        set((state) => ({ ...state, ...settings }));
      },

      setFontSize: (fontSize) => {
        set({ fontSize });
        broadcastSettings(get().getSettingsSnapshot());
      },
      setSecondaryFontSize: (secondaryFontSize) => {
        set({ secondaryFontSize });
        broadcastSettings(get().getSettingsSnapshot());
      },
      setTextColor: (textColor) => {
        set({ textColor });
        broadcastSettings(get().getSettingsSnapshot());
      },
      setSecondaryColor: (secondaryColor) => {
        set({ secondaryColor });
        broadcastSettings(get().getSettingsSnapshot());
      },
      setDisplayMode: (displayMode) => {
        set({ displayMode });
        broadcastSettings(get().getSettingsSnapshot());
      },
      setShadowIntensity: (shadowIntensity) => {
        set({ shadowIntensity });
        broadcastSettings(get().getSettingsSnapshot());
      },
      setTextAlign: (textAlign) => {
        set({ textAlign });
        broadcastSettings(get().getSettingsSnapshot());
      },
      setBackgroundOpacity: (backgroundOpacity) => {
        set({ backgroundOpacity });
        broadcastSettings(get().getSettingsSnapshot());
      },
      setAlwaysOnTop: (alwaysOnTop) => {
        set({ alwaysOnTop });
        broadcastSettings(get().getSettingsSnapshot());
      },
      setIsLocked: (isLocked) => {
        set({ isLocked });
        broadcastSettings(get().getSettingsSnapshot());
      },
      setOverflowMode: (overflowMode) => {
        set({ overflowMode });
        broadcastSettings(get().getSettingsSnapshot());
      },
      setIsModalOpen: (isModalOpen) => set({ isModalOpen }),

      applyTemplate: (template) => {
        set({
          fontSize: template.fontSize,
          secondaryFontSize: template.secondaryFontSize,
          textColor: template.textColor,
          secondaryColor: template.secondaryColor,
          shadowIntensity: template.shadowIntensity,
          textAlign: template.textAlign
        });
        broadcastSettings(get().getSettingsSnapshot());
      },

      resetToDefaults: () => {
        set({ ...DEFAULT_SETTINGS });
        broadcastSettings(get().getSettingsSnapshot());
      },

      getSettingsSnapshot: () => {
        const state = get();
        return {
          fontSize: state.fontSize,
          secondaryFontSize: state.secondaryFontSize,
          textColor: state.textColor,
          secondaryColor: state.secondaryColor,
          displayMode: state.displayMode,
          shadowIntensity: state.shadowIntensity,
          textAlign: state.textAlign,
          backgroundOpacity: state.backgroundOpacity,
          alwaysOnTop: state.alwaysOnTop,
          isLocked: state.isLocked,
          overflowMode: state.overflowMode
        };
      }
    }),
    {
      name: 'desktop_lyrics_settings_v2',
      partialize: (state) => ({
        fontSize: state.fontSize,
        secondaryFontSize: state.secondaryFontSize,
        textColor: state.textColor,
        secondaryColor: state.secondaryColor,
        displayMode: state.displayMode,
        shadowIntensity: state.shadowIntensity,
        textAlign: state.textAlign,
        backgroundOpacity: state.backgroundOpacity,
        alwaysOnTop: state.alwaysOnTop,
        isLocked: state.isLocked,
        overflowMode: state.overflowMode
      })
    }
  )
);
