/**
 * Dynamic Album Cover Color Extractor
 * Samples dominant vibrant colors from an image URL to generate
 * matching gradient presets for progress bars and ambient glow.
 */

export interface ExtractedColorPair {
  startColorHex: string;
  endColorHex: string;
}

const colorCache = new Map<string, ExtractedColorPair>();

export async function extractColorsFromCover(imageUrl: string): Promise<ExtractedColorPair> {
  if (!imageUrl) {
    return { startColorHex: '#ffffff', endColorHex: '#9ca3af' };
  }

  if (colorCache.has(imageUrl)) {
    return colorCache.get(imageUrl)!;
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { startColorHex: '#ffffff', endColorHex: '#9ca3af' };
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    const timeout = setTimeout(() => {
      resolve({ startColorHex: '#ffffff', endColorHex: '#9ca3af' });
    }, 2500);

    img.onload = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve({ startColorHex: '#ffffff', endColorHex: '#9ca3af' });
          return;
        }

        const size = 32;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;

        interface ColorCandidate {
          r: number;
          g: number;
          b: number;
          score: number;
          hex: string;
        }

        const candidates: ColorCandidate[] = [];

        for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          if (a < 128) continue; // Skip transparent

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const brightness = (max + min) / 2;
          const delta = max - min;
          const saturation = max === 0 ? 0 : delta / max;

          // Skip near-black and near-white
          if (brightness < 35 || brightness > 235) continue;
          // Prefer colorful pixels
          const score = saturation * 2 + (brightness > 80 && brightness < 200 ? 1 : 0);

          const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
          candidates.push({ r, g, b, score, hex });
        }

        if (candidates.length === 0) {
          const fallback = { startColorHex: '#ffffff', endColorHex: '#9ca3af' };
          colorCache.set(imageUrl, fallback);
          resolve(fallback);
          return;
        }

        // Sort by vibrant score descending
        candidates.sort((a, b) => b.score - a.score);

        const primary = candidates[0];
        // Find a secondary color that is visually distinct from primary
        let secondary = candidates.find((c) => {
          const dist = Math.sqrt(
            Math.pow(c.r - primary.r, 2) +
            Math.pow(c.g - primary.g, 2) +
            Math.pow(c.b - primary.b, 2)
          );
          return dist > 60;
        });

        if (!secondary) {
          // If no distinct second color, create a lighter tinted version of primary
          const r2 = Math.min(255, Math.round(primary.r * 1.3 + 20));
          const g2 = Math.min(255, Math.round(primary.g * 1.3 + 20));
          const b2 = Math.min(255, Math.round(primary.b * 1.3 + 20));
          const hex2 = `#${((1 << 24) + (r2 << 16) + (g2 << 8) + b2).toString(16).slice(1)}`;
          secondary = { r: r2, g: g2, b: b2, score: 0, hex: hex2 };
        }

        const result: ExtractedColorPair = {
          startColorHex: primary.hex,
          endColorHex: secondary.hex
        };

        colorCache.set(imageUrl, result);
        resolve(result);
      } catch (err) {
        resolve({ startColorHex: '#ffffff', endColorHex: '#9ca3af' });
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve({ startColorHex: '#ffffff', endColorHex: '#9ca3af' });
    };

    img.src = imageUrl;
  });
}
