/**
 * Application Global Configuration
 * Centralized settings, limits, default parameters, and paths.
 * Strictly avoids hardcoded values across components.
 */

export const APP_CONFIG = {
  APP_NAME: 'Lyric Studio',
  VERSION: '1.0.0',
  
  // Timing & Performance
  AUTO_SAVE_DELAY_MS: 400,
  FADE_EASING_SMOOTHNESS: 0.28,
  TIME_STAMP_NUDGE_SMALL_SEC: 0.1,
  TIME_STAMP_NUDGE_LARGE_SEC: 0.5,
  MAX_UNDO_HISTORY_DEPTH: 50,
  
  // UI & Layout Constraints
  LEFT_PANEL_MIN_WIDTH_PX: 320,
  LEFT_PANEL_MAX_WIDTH_PX: 650,
  LEFT_PANEL_DEFAULT_WIDTH_PX: 440,
  
  // Default Directories & Paths
  DEFAULT_PROJECT_FOLDER_NAME: 'LyricStudio Projects',
  DEFAULT_MAO_AE_REPO_PATH: 'D:\\PNG\\รวมช่องคลังเก็บของ MaO\\Wuthering Waves\\Srcipt After Effects\\songs',
  
  // Audio & Playback Defaults
  DEFAULT_PLAYBACK_RATES: [0.75, 0.85, 1.0, 1.25],
  DEFAULT_VOLUME: 0.8,
  
  // After Effects Default Settings
  DEFAULT_GLOW_RADIUS: 220,
  DEFAULT_COMP_WIDTH: 1920,
  DEFAULT_COMP_HEIGHT: 1080,
  DEFAULT_FPS: 60,
  
  // Desktop Lyrics Defaults
  DESKTOP_LYRICS: {
    DEFAULT_WIDTH: 800,
    DEFAULT_HEIGHT: 130,
    DEFAULT_FONT_SIZE_PX: 28,
    DEFAULT_TEXT_COLOR: '#ffffff',
    DEFAULT_ACTIVE_COLOR: '#38bdf8',
    DEFAULT_STROKE_WIDTH_PX: 2,
    DEFAULT_STROKE_COLOR: '#000000',
    DEFAULT_FADE_ENABLED: true,
    DEFAULT_OPACITY: 0.95
  }
} as const;
