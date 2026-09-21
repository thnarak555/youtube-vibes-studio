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
    primary: 'bg-primary text-primary-foreground font-semibold hover:bg-primary/90 active:bg-primary/80 border border-border',
    secondary: `bg-secondary hover:bg-accent active:bg-muted text-secondary-foreground border border-border ${APPLE_THEME.specular.top}`,
    ghost: 'bg-transparent hover:bg-accent active:bg-muted text-muted-foreground hover:text-foreground border border-transparent',
    pill: `rounded-full bg-secondary hover:bg-accent active:bg-muted text-secondary-foreground border border-border ${APPLE_THEME.specular.top}`,
    icon: 'rounded-lg bg-secondary hover:bg-accent active:bg-muted text-muted-foreground hover:text-foreground border border-border flex items-center justify-center',
  }[variant];

  const activeClasses = active ? 'bg-accent border-ring text-foreground' : '';

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      transition={APPLE_THEME.springs.snappy}
      onClick={handleClick}
      className={`inline-flex items-center justify-center font-medium select-none cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${variant !== 'pill' && variant !== 'icon' ? 'rounded-lg' : ''} ${sizeClasses} ${variantClasses} ${activeClasses} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
