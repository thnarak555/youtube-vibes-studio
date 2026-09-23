import React, { useState } from 'react';
import { 
  Music2, 
  Download, 
  Upload, 
  RotateCcw, 
  Sparkles, 
  Keyboard, 
  Plus
} from 'lucide-react';
import { useLyricStore } from '../../stores/useLyricStore';
import { AE_COLOR_PRESETS } from '../../utils/presets';

interface HeaderProps {
  onOpenExport: () => void;
  onOpenImport: () => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenExport, onOpenImport, onOpenHelp }) => {
  const { metadata, setMetadata, aePreset, setAEPreset, resetToDefault, addLine } = useLyricStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full px-6 py-3 liquid-glass border-b border-white/10 flex items-center justify-between">
      {/* Brand & Song info */}
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shadow-lg backdrop-blur-md">
          <Music2 className="w-5 h-5 text-white" />
        </div>

        <div className="flex flex-col">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={metadata.title}
                onChange={(e) => setMetadata({ title: e.target.value })}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                autoFocus
                className="text-sm font-semibold px-2.5 py-1 rounded-xl bg-black/50 border border-white/25 text-white outline-none focus:border-white/50"
              />
              <input
                type="text"
                value={metadata.artist}
                onChange={(e) => setMetadata({ artist: e.target.value })}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                placeholder="ชื่อศิลปิน"
                className="text-xs px-2.5 py-1 rounded-xl bg-black/50 border border-white/25 text-white/80 outline-none focus:border-white/50"
              />
            </div>
          ) : (
            <div 
              onClick={() => setIsEditingTitle(true)}
              className="group cursor-pointer flex items-center gap-2"
              title="คลิกเพื่อแก้ไขชื่อเพลงและศิลปิน"
            >
              <h1 className="text-sm md:text-base font-semibold text-white group-hover:text-white/80 transition-colors tracking-tight">
                {metadata.title || 'ไม่มีชื่อเพลง'}
              </h1>
              <span className="text-xs text-white/50 font-medium">
                • {metadata.artist || 'ไม่ระบุศิลปิน'}
              </span>
            </div>
          )}
          <span className="text-[10px] text-white/40 tracking-wider uppercase font-semibold">
            Lyric Translation Studio
          </span>
        </div>
      </div>

      {/* Center Actions: AE Preset selector */}
      <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-pill">
        <Sparkles className="w-3.5 h-3.5 text-white/80" />
        <span className="text-xs text-white/70 font-medium">ชุดสี After Effects:</span>
        <select
          value={aePreset.id}
          onChange={(e) => {
            const found = AE_COLOR_PRESETS.find(p => p.id === e.target.value);
            if (found) setAEPreset(found);
          }}
          className="bg-transparent text-xs text-white outline-none cursor-pointer pr-1 font-semibold"
        >
          {AE_COLOR_PRESETS.map((p) => (
            <option key={p.id} value={p.id} className="bg-[#12131e] text-white">
              {p.name}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-1 ml-1">
          <div className="w-2.5 h-2.5 rounded-full border border-white/30" style={{ background: aePreset.startColorHex }} />
          <div className="w-2.5 h-2.5 rounded-full border border-white/30" style={{ background: aePreset.endColorHex }} />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => addLine()}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white/80 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-all cursor-pointer min-h-[38px] active:scale-95"
          title="เพิ่มท่อนเนื้อร้อง"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>เพิ่มท่อน</span>
        </button>

        <button
          onClick={onOpenHelp}
          className="p-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
          title="คีย์ลัดช่วยแปล"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenImport}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-all shadow-sm cursor-pointer min-h-[38px] active:scale-95"
          title="นำเข้าไฟล์"
        >
          <Upload className="w-3.5 h-3.5 text-white/80" />
          <span>นำเข้าไฟล์</span>
        </button>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-black bg-white hover:bg-neutral-200 shadow-lg shadow-white/10 border border-white/20 active:scale-95 transition-all cursor-pointer min-h-[38px]"
          title="ส่งออกไฟล์"
        >
          <Download className="w-3.5 h-3.5" />
          <span>ส่งออกไฟล์</span>
        </button>

        <button
          onClick={resetToDefault}
          className="p-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
          title="รีเซ็ตเป็นเพลงตัวอย่าง"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
