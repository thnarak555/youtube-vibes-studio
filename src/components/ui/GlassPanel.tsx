import React from 'react';
import { APPLE_THEME } from '../../theme/theme';

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: 'subtle' | 'medium' | 'heavy' | 'elevated';
  withSpecular?: boolean;
  children?: React.ReactNode;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  intensity = 'medium',
  withSpecular = true,
  children,
  className = '',
  ...props
}) => {
  const intensityClasses = {
    subtle: 'bg-white/[0.03] backdrop-blur-md border border-white/[0.06]',
    medium: 'bg-[#0c0d15]/75 backdrop-blur-2xl border border-white/[0.09] shadow-xl',
    heavy: 'bg-[#0b0c13]/85 backdrop-blur-3xl border border-white/[0.12] shadow-2xl',
    elevated: 'bg-[#12131e]/90 backdrop-blur-3xl border border-white/[0.15] shadow-[0_24px_64px_-12px_rgba(0,0,0,0.85)]',
  }[intensity];

  const specularClass = withSpecular ? APPLE_THEME.specular.top : '';

  return (
    <div
      className={`rounded-2xl ${intensityClasses} ${specularClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
