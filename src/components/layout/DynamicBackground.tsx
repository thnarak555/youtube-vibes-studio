import React from 'react';
import { motion } from 'framer-motion';
import { useLyricStore } from '../../stores/useLyricStore';

/**
 * Apple Liquid Glass Dynamic Ambient Background
 * Provides deep, luminous fluid backdrop that reflects album artwork and smooth ambient mesh
 * Allows authentic glassmorphic refraction through translucent panels and modals
 */
export const DynamicBackground: React.FC = () => {
  const { aePreset, metadata } = useLyricStore();
  const colorA = aePreset?.startColorHex || '#4f46e5';
  const colorB = aePreset?.endColorHex || '#0284c7';

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#07080e]">
      {/* Deep Album Art Backdrop with Apple Music style high-luminance blur & Anti-Glare Luminance Limiter */}
      {metadata.coverUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 filter blur-[90px] scale-135 saturate-125 brightness-[0.42] transform-gpu transition-all duration-1000"
          style={{ backgroundImage: `url(${metadata.coverUrl})` }}
        />
      ) : (
        /* Full-Viewport Luminous 5-Point Fluid Aurora Mesh for genuine Apple liquid glass refraction */
        <div className="absolute inset-0 overflow-hidden">
          {/* Top-Left Indigo/Violet Orb */}
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              x: [-50, 50, -50],
              y: [-40, 40, -40],
              opacity: [0.55, 0.75, 0.55]
            }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-40 -left-40 w-[800px] h-[800px] rounded-full blur-[130px]"
            style={{ background: colorA }}
          />

          {/* Top-Right Blue/Cyan Orb */}
          <motion.div
            animate={{
              scale: [1.15, 0.95, 1.15],
              x: [50, -40, 50],
              y: [40, -50, 40],
              opacity: [0.5, 0.7, 0.5]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-40 -right-40 w-[850px] h-[850px] rounded-full blur-[140px]"
            style={{ background: '#2563eb' }}
          />

          {/* Center Luminous Magenta/Purple Core */}
          <motion.div
            animate={{
              scale: [0.95, 1.2, 0.95],
              opacity: [0.4, 0.6, 0.4]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/4 w-[900px] h-[900px] rounded-full blur-[160px]"
            style={{ background: '#7c3aed' }}
          />

          {/* Bottom-Left Rose/Pink Orb */}
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              x: [-40, 60, -40],
              y: [30, -40, 30],
              opacity: [0.45, 0.65, 0.45]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-40 -left-32 w-[750px] h-[750px] rounded-full blur-[140px]"
            style={{ background: '#be185d' }}
          />

          {/* Bottom-Right Teal/Cyan Orb */}
          <motion.div
            animate={{
              scale: [1.2, 0.95, 1.2],
              x: [40, -50, 40],
              y: [-30, 40, -30],
              opacity: [0.45, 0.65, 0.45]
            }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-40 -right-32 w-[800px] h-[800px] rounded-full blur-[150px]"
            style={{ background: colorB }}
          />
        </div>
      )}

      {/* Calibrated Deep Dark Glass Scrim: Prevents bright covers from washing out text, guarantees deep contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/85 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-vignette opacity-55 mix-blend-multiply pointer-events-none" />
    </div>
  );
};
