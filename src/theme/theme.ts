/**
 * Apple / macOS Design Theme & Animation Configuration
 * Centralized configuration for liquid glass, spring physics, and typography.
 */

export const APPLE_THEME = {
  // Spring Physics for Framer Motion (Apple-style responsive snappy springs)
  springs: {
    snappy: { type: 'spring', stiffness: 450, damping: 32, mass: 0.8 },
    gentle: { type: 'spring', stiffness: 300, damping: 28, mass: 1 },
    modal: { type: 'spring', stiffness: 380, damping: 30, mass: 0.9 },
    bouncy: { type: 'spring', stiffness: 500, damping: 24, mass: 0.7 },
  },

  // Transitions
  transitions: {
    fast: { duration: 0.15, ease: [0.25, 1, 0.5, 1] },
    normal: { duration: 0.25, ease: [0.25, 1, 0.5, 1] },
    smooth: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },

  // Liquid Glass Presets
  glass: {
    panel: 'bg-[#0c0d14]/70 backdrop-blur-2xl border border-white/[0.08] shadow-2xl',
    card: 'bg-white/[0.04] hover:bg-white/[0.07] backdrop-blur-xl border border-white/[0.08] shadow-lg transition-all',
    pill: 'bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.18] backdrop-blur-lg border border-white/[0.12] rounded-full transition-all',
    modal: 'bg-[#0e0f18]/85 backdrop-blur-3xl border border-white/[0.12] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.85)]',
    drawer: 'bg-[#0b0c13]/85 backdrop-blur-3xl border-l border-white/[0.1] shadow-[-20px_0_50px_rgba(0,0,0,0.7)]',
    dropdown: 'bg-[#12131e]/90 backdrop-blur-2xl border border-white/[0.12] shadow-[0_16px_40px_rgba(0,0,0,0.6)]',
    input: 'bg-white/[0.05] focus:bg-white/[0.08] border border-white/[0.1] focus:border-white/30 transition-colors',
  },

  // Specular Edge Highlights
  specular: {
    top: 'shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15)]',
    double: 'shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),inset_0_-1px_1px_0_rgba(0,0,0,0.3)]',
  }
} as const;

/**
 * Utility to sanitize song titles or subtitles by removing noisy parentheses `()`
 * e.g. "Turning Around (余烬重燃)" -> "Turning Around • 余烬重燃"
 */
export function sanitizeAppleTitle(title: string): string {
  if (!title) return '';
  return title
    .replace(/\s*\(([^)]+)\)/g, ' • $1')
    .replace(/\s*\[([^\]]+)\]/g, ' • $1')
    .replace(/\s*（([^）]+)）/g, ' • $1')
    .replace(/\s*【([^】]+)】/g, ' • $1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
