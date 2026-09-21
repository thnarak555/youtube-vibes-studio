import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + S', desc: 'บันทึกโปรเจกต์และเอกสารทันที' },
    { key: 'Ctrl + F', desc: 'ค้นหาคำและข้อความในเนื้อเพลง' },
    { key: 'Space', desc: 'เล่นหรือหยุดเพลงชั่วคราว' },
    { key: 'R หรือ Ctrl + Space', desc: 'เปิดปิดเล่นวนซ้ำท่อนปัจจุบัน' },
    { key: 'Tab หรือ Enter', desc: 'ขยับเคอร์เซอร์ไปพิมพ์แปลบรรทัดถัดไป' },
    { key: 'Shift + Tab', desc: 'ย้อนกลับไปพิมพ์บรรทัดก่อนหน้า' },
    { key: '[ หรือ ]', desc: 'ปรับสปีดเพลง ช้าลง หรือ เร็วขึ้น' },
    { key: 'Esc', desc: 'ยกเลิกการเล่นวนซ้ำท่อน' },
    { key: 'Arrow Up หรือ Down', desc: 'เลื่อนดูท่อนก่อนหน้าหรือถัดไป' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-fade-in">
      <div className="liquid-glass relative w-full max-w-md rounded-3xl p-6 shadow-2xl flex flex-col gap-4 border border-white/15">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">คีย์ลัดช่วยแปลเพลง</h2>
              <p className="text-[11px] text-white/40">ควบคุมการทำงานได้อย่างรวดเร็ว</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-11 h-11 flex items-center justify-center rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer active:scale-90"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-2 py-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl liquid-glass-card">
              <span className="text-xs text-white/80 font-medium">{s.desc}</span>
              <kbd className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/15 text-[11px] font-mono text-white/90 font-bold shadow-sm">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="min-h-[44px] w-full py-2.5 rounded-2xl text-xs font-semibold text-black bg-white hover:bg-white/90 active:scale-95 transition-all shadow-lg shadow-white/10 cursor-pointer"
        >
          เรียบร้อย
        </button>
      </div>
    </div>
  );
};
