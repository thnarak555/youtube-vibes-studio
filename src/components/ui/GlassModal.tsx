import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { APPLE_THEME } from '../../theme/theme';
import { playTapSound } from '../../utils/soundEffects';

export interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  showCloseButton?: boolean;
  className?: string;
}

export const GlassModal: React.FC<GlassModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'xl',
  showCloseButton = true,
  className = '',
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  }[maxWidth];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          {/* Backdrop Scrim with heavy blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={APPLE_THEME.transitions.fast}
            onClick={() => {
              playTapSound();
              onClose();
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={APPLE_THEME.springs.modal}
            className={`relative w-full ${maxWidthClasses} rounded-3xl bg-[#0e0f18]/85 backdrop-blur-3xl border border-white/[0.14] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.85)] ${APPLE_THEME.specular.top} overflow-hidden flex flex-col max-h-[90vh] z-10 ${className}`}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] flex-shrink-0">
                <div>
                  {title && <h2 className="text-base font-bold text-white tracking-wide">{title}</h2>}
                  {description && <p className="text-xs text-white/50 mt-0.5">{description}</p>}
                </div>

                {showCloseButton && (
                  <button
                    onClick={() => {
                      playTapSound();
                      onClose();
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 active:bg-white/20 transition-all cursor-pointer active:scale-90"
                    title="ปิดหน้าต่าง"
                  >
                    <X className="w-4 h-4 stroke-[2]" />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto scrollbar-dark p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
