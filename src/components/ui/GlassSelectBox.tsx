import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { APPLE_THEME } from '../../theme/theme';
import { cn } from '../../utils/cn';
import { playTapSound } from '../../utils/soundEffects';

export interface GlassSelectOption {
  value: string | number;
  label: string;
}

export interface GlassSelectBoxProps {
  value: string | number;
  onChange: (val: string | number) => void;
  options: GlassSelectOption[];
  className?: string;
  placeholder?: string;
}

/**
 * Apple-style Liquid Glass Select / Dropdown
 * Drop-in replacement for native <select> elements.
 * Features:
 * - Pill trigger showing current selection
 * - Spring-physics animated dropdown (scale 0.95→1, opacity 0→1)
 * - Checkmark on active item
 * - Click-outside to dismiss
 */
export const GlassSelectBox: React.FC<GlassSelectBoxProps> = ({
  value,
  onChange,
  options,
  className = '',
  placeholder = '—',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = selectedOption?.label ?? placeholder;

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('mousedown', handleClickOutside);
    }
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (opt: GlassSelectOption) => {
    playTapSound();
    onChange(opt.value);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn('relative inline-block select-none', className)}>
      {/* Trigger Pill */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.97 }}
        transition={APPLE_THEME.springs.snappy}
        onClick={() => {
          playTapSound();
          setIsOpen((prev) => !prev);
        }}
        className={cn(
          'flex items-center justify-between gap-2 w-full min-w-[120px] px-3 py-1.5 rounded-xl text-xs font-medium',
          'bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.12] text-white/90 hover:text-white',
          'backdrop-blur-xl transition-colors cursor-pointer outline-none',
          APPLE_THEME.specular.top,
          isOpen && 'bg-white/[0.12] border-white/20'
        )}
      >
        <span className="truncate">{displayLabel}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={APPLE_THEME.springs.snappy}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-3 h-3 text-white/50" />
        </motion.div>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={APPLE_THEME.springs.snappy}
            style={{ transformOrigin: 'top left' }}
            className={cn(
              'absolute left-0 top-[calc(100%+4px)] z-[200] min-w-full w-max max-w-[220px]',
              'rounded-2xl p-1.5 flex flex-col gap-0.5',
              'bg-[#12131e]/95 backdrop-blur-2xl border border-white/[0.12]',
              'shadow-[0_16px_48px_rgba(0,0,0,0.7)]',
              APPLE_THEME.specular.top
            )}
          >
            {options.map((opt) => {
              const isActive = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={cn(
                    'flex items-center justify-between gap-2 w-full px-3 py-1.5 rounded-xl text-xs text-left cursor-pointer transition-colors',
                    isActive
                      ? 'bg-white/15 text-white font-semibold'
                      : 'text-white/75 hover:text-white hover:bg-white/10'
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isActive && <Check className="w-3 h-3 text-white flex-shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
