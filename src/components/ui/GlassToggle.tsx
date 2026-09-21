import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { playSwitchSound } from '../../utils/soundEffects';

export interface GlassToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Apple-style Liquid Glass Switch Toggle
 * Features:
 * - Fluid capsule track with inset shadow
 * - Spring-physics white knob
 * - Sound effect on toggle
 */
export const GlassToggle: React.FC<GlassToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = ''
}) => {
  const handleToggle = () => {
    if (disabled) return;
    playSwitchSound();
    onChange(!checked);
  };

  return (
    <div
      onClick={handleToggle}
      className={cn(
        "inline-flex items-center justify-between gap-3 select-none cursor-pointer group transition-opacity",
        disabled && "opacity-40 cursor-not-allowed",
        className
      )}
    >
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-xs font-medium text-white/85 group-hover:text-white transition-colors">
              {label}
            </span>
          )}
          {description && (
            <span className="text-[10px] text-white/40 mt-0.5">
              {description}
            </span>
          )}
        </div>
      )}

      {/* Capsule Track */}
      <div
        className={cn(
          "relative w-9 h-5 rounded-full transition-colors duration-200 p-0.5 flex-shrink-0 border",
          checked
            ? "bg-white/80 border-white/60 shadow-inner"
            : "bg-white/[0.08] border-white/15 group-hover:bg-white/[0.12]"
        )}
      >
        <motion.div
          animate={{ x: checked ? 16 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={cn(
            "w-4 h-4 rounded-full shadow-md",
            checked ? "bg-black" : "bg-white/90"
          )}
        />
      </div>
    </div>
  );
};
