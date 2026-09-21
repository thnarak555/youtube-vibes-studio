export type DisplayMode = 'normal' | 'fade' | 'document';

export interface LyricLine {
  id: string;
  inTime: number;               // in seconds, e.g. 1.25
  outTime: number;              // in seconds, e.g. 5.80
  original: string;             // Primary lyric line (EN/CN/JP)
  referenceTranslation?: string;// Reference translation (e.g. CN/EN from NetEase)
  translation: string;          // User Target translation (e.g. TH)
  originalInTime?: number;      // Original inTime from source for reset button
  originalOutTime?: number;     // Original outTime from source for reset button
}

export interface SongMetadata {
  title: string;
  artist: string;
  album?: string;
  coverUrl?: string;
  duration?: number;
  audioSrc?: string;
  glowRadius?: number;          // AE Glow Radius (default 220)
}

export interface AEPresetColors {
  id: string;
  name: string;
  startColorHex: string;
  endColorHex: string;
  description: string;
  isCustom?: boolean;
}

export interface ProjectBackupFile {
  version: string;
  savedAt: string;
  metadata: SongMetadata;
  lyrics: LyricLine[];
  aePreset: AEPresetColors;
  glowRadius: number;
  folderPath?: string;
}

export type ExportFormat = 
  | 'ae-jsx'
  | 'lrc-bilingual'
  | 'lrc-th'
  | 'lrc-original'
  | 'lrc-ref'
  | 'srt'
  | 'clipboard-bi'
  | 'clipboard-th'
  | 'clipboard-orig'
  | 'lts-project';

export interface DesktopLyricsSettings {
  enabled: boolean;
  isLocked: boolean;
  fontSize: number;
  textColor: string;
  activeColor: string;
  strokeWidth: number;
  strokeColor: string;
  fadeEnabled: boolean;
  backgroundOpacity: number;
}

export interface LyricSnapshot {
  lyrics: LyricLine[];
  timestamp: number;
  description: string;
}
