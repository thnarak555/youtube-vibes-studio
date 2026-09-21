import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { APPLE_THEME } from '../../theme/theme';
import { playTapSound } from '../../utils/soundEffects';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
  onClick?: () => void;
}

export interface GlassDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  items: DropdownItem[];
  anchorPosition?: 'left' | 'right';
  className?: string;
}

export const GlassDropdown: React.FC<GlassDropdownProps> = ({
  isOpen,
  onClose,
  items,
  anchorPosition = 'right',
  className = '',
}) => {
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.94, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: -4 }}
          transition={APPLE_THEME.springs.snappy}
          className={`absolute top-full mt-1.5 ${anchorPosition === 'right' ? 'right-0' : 'left-0'} z-50 min-w-[180px] p-1.5 rounded-2xl bg-[#12131e]/92 backdrop-blur-2xl border border-white/[0.12] shadow-[0_16px_40px_rgba(0,0,0,0.65)] ${APPLE_THEME.specular.top} ${className}`}
        >
          {items.map((item) => {
            if (item.divider) {
              return <div key={item.id} className="h-px bg-white/[0.08] my-1 mx-1" />;
            }

            return (
              <button
                key={item.id}
                disabled={item.disabled}
                onClick={() => {
                  playTapSound();
                  if (item.onClick) item.onClick();
                  onClose();
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all text-left select-none cursor-pointer outline-none ${
                  item.disabled
                    ? 'opacity-30 cursor-not-allowed text-white'
                    : item.danger
                    ? 'text-red-400 hover:text-white hover:bg-red-500/20 active:bg-red-500/30'
                    : 'text-white/80 hover:text-white hover:bg-white/[0.08] active:bg-white/[0.14]'
                }`}
              >
                {item.icon && <span className="w-3.5 h-3.5 flex items-center justify-center opacity-70">{item.icon}</span>}
                <span className="flex-1 truncate">{item.label}</span>
              </button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
