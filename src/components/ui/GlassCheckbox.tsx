import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';
import { playTapSound } from '../../utils/soundEffects';

export interface GlassCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Apple-style Liquid Glass Checkbox
 * Features:
 * - Rounded square with specular edge highlight
 * - Snappy check animation
 * - Sound effect on change
 * - Luxury dark monochrome styling
 */
export const GlassCheckbox: React.FC<GlassCheckboxProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = ''
}) => {
  const handleClick = () => {
    if (disabled) return;
    playTapSound();
    onChange(!checked);
  };

  return (
    <label
      onClick={handleClick}
      className={cn(
        "inline-flex items-start gap-2.5 select-none cursor-pointer group transition-opacity",
        disabled && "opacity-40 cursor-not-allowed",
        className
      )}
    >
      <div
        className={cn(
          "w-4 h-4 rounded-md flex items-center justify-center transition-all duration-150 mt-0.5 flex-shrink-0 border",
          checked
            ? "bg-white text-black border-white shadow-sm shadow-white/20 scale-100"
            : "bg-white/[0.04] border-white/20 group-hover:border-white/40 group-hover:bg-white/[0.08]"
        )}
      >
        {checked && <Check className="w-3 h-3 stroke-[2.5]" />}
      </div>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-xs font-medium text-white/80 group-hover:text-white transition-colors">
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
    </label>
  );
};
