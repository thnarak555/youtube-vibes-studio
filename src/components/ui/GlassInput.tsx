import React from 'react';
import { X } from 'lucide-react';
import { APPLE_THEME } from '../../theme/theme';

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  onClear?: () => void;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  icon,
  onClear,
  value,
  className = '',
  ...props
}) => {
  return (
    <div className="relative flex items-center w-full">
      {icon && (
        <div className="absolute left-3 flex items-center justify-center text-white/40 pointer-events-none">
          {icon}
        </div>
      )}
      <input
        value={value}
        className={`w-full py-2 ${icon ? 'pl-9' : 'pl-3.5'} ${onClear && value ? 'pr-9' : 'pr-3.5'} rounded-xl bg-white/[0.05] focus:bg-white/[0.08] border border-white/[0.1] focus:border-white/30 text-white placeholder-white/35 text-xs outline-none transition-all duration-200 ${APPLE_THEME.specular.top} ${className}`}
        {...props}
      />
      {onClear && value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2.5 w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
          title="ล้างข้อความ"
        >
          <X className="w-2.5 h-2.5 stroke-[2]" />
        </button>
      )}
    </div>
  );
};
