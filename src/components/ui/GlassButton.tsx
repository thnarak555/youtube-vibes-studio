import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { playTapSound } from '../../utils/soundEffects';
import { APPLE_THEME } from '../../theme/theme';

export interface GlassButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'pill' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  active?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  children,
  className = '',
  onClick,
  active = false,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    playTapSound();
    if (onClick) onClick(e);
  };

  const sizeClasses = {
    sm: variant === 'icon' ? 'w-7 h-7 text-xs' : 'px-2.5 py-1 text-xs gap-1.5',
    md: variant === 'icon' ? 'w-9 h-9 text-sm' : 'px-3.5 py-1.5 text-xs gap-2',
    lg: variant === 'icon' ? 'w-11 h-11 text-base' : 'px-5 py-2.5 text-sm gap-2.5',
  }[size];

  const variantClasses = {
    primary: 'bg-white text-black font-semibold shadow-md hover:bg-white/90 active:bg-white/80 border border-white/20',
    secondary: `bg-white/[0.06] hover:bg-white/[0.1] active:bg-white/[0.15] text-white/90 hover:text-white border border-white/[0.1] backdrop-blur-xl ${APPLE_THEME.specular.top}`,
    ghost: 'bg-transparent hover:bg-white/[0.08] active:bg-white/[0.12] text-white/70 hover:text-white border border-transparent',
    pill: `rounded-full bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.18] text-white/90 hover:text-white border border-white/[0.12] backdrop-blur-xl ${APPLE_THEME.specular.top}`,
    icon: 'rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.14] text-white/70 hover:text-white border border-white/[0.08] backdrop-blur-md flex items-center justify-center',
  }[variant];

  const activeClasses = active ? 'bg-white/20 border-white/30 text-white shadow-lg' : '';

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      transition={APPLE_THEME.springs.snappy}
      onClick={handleClick}
      className={`inline-flex items-center justify-center font-medium select-none cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${variant !== 'pill' && variant !== 'icon' ? 'rounded-xl' : ''} ${sizeClasses} ${variantClasses} ${activeClasses} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
