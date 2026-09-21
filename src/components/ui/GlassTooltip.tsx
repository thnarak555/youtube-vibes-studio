import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { APPLE_THEME } from '../../theme/theme';

export interface GlassTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const GlassTooltip: React.FC<GlassTooltipProps> = ({
  content,
  children,
  position = 'top',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  }[position];

  return (
    <div
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      className={`relative inline-flex ${className}`}
    >
      {children}
      <AnimatePresence>
        {isVisible && content && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={APPLE_THEME.springs.snappy}
            className={`absolute ${positionClasses} z-50 px-2.5 py-1 rounded-lg bg-[#141522]/95 backdrop-blur-xl border border-white/[0.15] text-[11px] font-medium text-white/90 shadow-xl pointer-events-none whitespace-nowrap ${APPLE_THEME.specular.top}`}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
