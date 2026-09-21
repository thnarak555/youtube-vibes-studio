import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { playTapSound } from '../../utils/soundEffects';
import { cn } from '../../utils/cn';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'ยืนยัน',
  cancelLabel = 'ยกเลิก',
  isDestructive = false,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-fade-in select-none">
      <div 
        className="liquid-glass w-full max-w-md rounded-3xl border border-white/15 p-6 shadow-2xl flex flex-col gap-4 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white flex-shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white tracking-wide">
              {title}
            </h3>
            <p className="text-xs text-white/60 mt-1 leading-relaxed">
              {message}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="w-11 h-11 flex items-center justify-center rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer active:scale-90"
            title="ปิดหน้าต่าง"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => {
              playTapSound();
              onCancel();
            }}
            className="min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer active:scale-95"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              playTapSound();
              onConfirm();
            }}
            className={cn(
              "min-h-[44px] px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer active:scale-95",
              isDestructive
                ? "bg-white text-black hover:bg-neutral-200 shadow-white/10"
                : "bg-white text-black hover:bg-white/90 shadow-white/10"
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
