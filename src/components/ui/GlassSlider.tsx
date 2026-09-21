import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { APPLE_THEME } from '../../theme/theme';

export interface GlassSliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (val: number) => void;
  formatTooltip?: (val: number) => string;
  className?: string;
}

export const GlassSlider: React.FC<GlassSliderProps> = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  formatTooltip,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const calculateValueFromPointer = useCallback((clientX: number) => {
    if (!trackRef.current) return value;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const rawVal = min + ratio * (max - min);
    const steppedVal = Math.round(rawVal / step) * step;
    return Math.max(min, Math.min(max, steppedVal));
  }, [min, max, step, value]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    const newVal = calculateValueFromPointer(e.clientX);
    onChange(newVal);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const newVal = calculateValueFromPointer(e.clientX);
    onChange(newVal);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div
      ref={trackRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => !isDragging && setIsHovered(false)}
      className={`relative h-6 flex items-center cursor-pointer select-none touch-none group ${className}`}
    >
      {/* Background Track */}
      <div className="relative w-full h-1 group-hover:h-1.5 rounded-full bg-white/10 overflow-hidden transition-all duration-200">
        {/* Filled Track (Apple White / Monochromatic Glow) */}
        <div
          style={{ width: `${percentage}%` }}
          className="h-full bg-white rounded-full transition-none shadow-[0_0_8px_rgba(255,255,255,0.4)]"
        />
      </div>

      {/* Floating Apple Thumb with spring animation */}
      <motion.div
        animate={{
          scale: isHovered || isDragging ? 1.25 : 0,
          opacity: isHovered || isDragging ? 1 : 0,
        }}
        transition={APPLE_THEME.springs.snappy}
        style={{ left: `calc(${percentage}% - 6px)` }}
        className="absolute w-3 h-3 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.6)] pointer-events-none"
      />

      {/* Tooltip on Hover / Drag */}
      {formatTooltip && (isHovered || isDragging) && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={APPLE_THEME.springs.snappy}
          style={{ left: `calc(${percentage}% - 24px)` }}
          className="absolute -top-7 px-2 py-0.5 rounded-md bg-[#12131e]/90 border border-white/15 text-[10px] font-mono font-medium text-white shadow-lg pointer-events-none backdrop-blur-md"
        >
          {formatTooltip(value)}
        </motion.div>
      )}
    </div>
  );
};
