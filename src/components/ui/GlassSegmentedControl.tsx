import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { playSwitchSound } from '../../utils/soundEffects';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  tooltip?: string;
}

export interface GlassSegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Apple-style Liquid Glass Segmented Control
 * Features:
 * - Fluid sliding active pill with Framer Motion layoutId
 * - Specular border highlight
 * - Snappy micro-interaction sound
 * - Zero parentheses, clean typography
 */
export function GlassSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'sm',
  className = ''
}: GlassSegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        "relative flex items-center p-0.5 rounded-xl bg-white/[0.04] border border-white/[0.08] shadow-inner select-none",
        className
      )}
    >
      {options.map((opt) => {
        const isSelected = value === opt.value;
        const Icon = opt.icon;

        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              if (!isSelected) {
                playSwitchSound();
                onChange(opt.value);
              }
            }}
            title={opt.tooltip}
            className={cn(
              "relative z-10 flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap",
              size === 'sm' ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm",
              isSelected
                ? "text-white font-semibold"
                : "text-white/60 hover:text-white"
            )}
          >
            {isSelected && (
              <motion.div
                layoutId="segmented-pill-active"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className="absolute inset-0 rounded-lg bg-white/20 border border-white/25 shadow-sm -z-10"
              />
            )}
            {Icon && <Icon className={size === 'sm' ? "w-3 h-3" : "w-3.5 h-3.5"} />}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
