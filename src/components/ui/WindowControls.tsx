import React, { useState, useEffect } from 'react';
import { Minus, Square, Copy, X } from 'lucide-react';
import { playTapSound } from '../../utils/soundEffects';

interface WindowControlsProps {
  className?: string;
}

/**
 * Authentic Luxury Minimalist Window Controls (Original Style)
 * Restored per user directive: Sleek, high-precision window controls (Minimize, Maximize/Restore, Close).
 * Strictly avoids fake macOS traffic light circles.
 */
export const WindowControls: React.FC<WindowControlsProps> = ({ className = '' }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const isElectron = typeof window !== 'undefined' && (window as any).electronAPI !== undefined;

  useEffect(() => {
    if (!isElectron) return;
    const checkMax = async () => {
      try {
        const max = await (window as any).electronAPI.isMaximized();
        setIsMaximized(Boolean(max));
      } catch {}
    };
    checkMax();
  }, [isElectron]);

  const handleMinimize = () => {
    playTapSound();
    if (isElectron) (window as any).electronAPI.minimize();
  };

  const handleMaximize = async () => {
    playTapSound();
    if (isElectron) {
      await (window as any).electronAPI.maximize();
      try {
        const max = await (window as any).electronAPI.isMaximized();
        setIsMaximized(Boolean(max));
      } catch {}
    }
  };

  const handleClose = () => {
    playTapSound();
    if (isElectron) (window as any).electronAPI.close();
  };

  return (
    <div 
      className={`flex items-center gap-1 select-none ${className}`}
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      {/* Minimize Button */}
      <button
        onClick={handleMinimize}
        className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent active:bg-muted transition-all cursor-pointer active:scale-90"
        title="ย่อหน้าต่าง"
        aria-label="ย่อหน้าต่าง"
      >
        <Minus className="w-3.5 h-3.5 stroke-[1.75]" />
      </button>

      {/* Maximize / Restore Button */}
      <button
        onClick={handleMaximize}
        className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent active:bg-muted transition-all cursor-pointer active:scale-90"
        title={isMaximized ? "คืนขนาดหน้าต่าง" : "ขยายเต็มจอ"}
        aria-label={isMaximized ? "คืนขนาดหน้าต่าง" : "ขยายเต็มจอ"}
      >
        {isMaximized ? (
          <Copy className="w-3 h-3 stroke-[1.75] rotate-90" />
        ) : (
          <Square className="w-3 h-3 stroke-[1.75]" />
        )}
      </button>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent active:bg-muted transition-all cursor-pointer active:scale-90"
        title="ปิดหน้าต่าง"
        aria-label="ปิดหน้าต่าง"
      >
        <X className="w-3.5 h-3.5 stroke-[1.75]" />
      </button>
    </div>
  );
};
