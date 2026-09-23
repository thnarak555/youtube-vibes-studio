import React, { useState } from 'react';
import { X, Palette, Plus, Trash2, Check } from 'lucide-react';
import { useLyricStore } from '../../stores/useLyricStore';
import type { AEPresetColors } from '../../types';

interface AESettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AESettingsModal: React.FC<AESettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    aePreset, 
    aePresets, 
    setAEPreset, 
    addAEPreset, 
    deleteAEPreset, 
    glowRadius, 
    setGlowRadius 
  } = useLyricStore();

  const [newStart, setNewStart] = useState(aePreset.startColorHex);
  const [newEnd, setNewEnd] = useState(aePreset.endColorHex);
  const [newName, setNewName] = useState('');
  const [localRadius, setLocalRadius] = useState(glowRadius);

  if (!isOpen) return null;

  const handleSelectPreset = (p: AEPresetColors) => {
    setAEPreset(p);
    setNewStart(p.startColorHex);
    setNewEnd(p.endColorHex);
  };

  const handleAddPreset = () => {
    const name = newName.trim() || `Custom Color #${aePresets.length + 1}`;
    const newPreset: AEPresetColors = {
      id: 'custom-' + Date.now().toString(36),
      name,
      startColorHex: newStart,
      endColorHex: newEnd,
      description: `Gradient: ${newStart} -> ${newEnd}`,
      isCustom: true
    };
    addAEPreset(newPreset);
    setNewName('');
  };

  const handleRadiusChange = (val: number) => {
    const clean = Math.max(1, Math.min(1000, val || 220));
    setLocalRadius(clean);
    setGlowRadius(clean);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-fade-in select-none">
      <div 
        className="liquid-glass relative w-full max-w-lg rounded-3xl p-6 flex flex-col gap-5 shadow-2xl border border-white/15"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">ตั้งค่าเอฟเฟกต์ After Effects</h2>
              <p className="text-xs text-white/40">ปรับคู่สี Gradient Ramp และ Glow Radius สำหรับส่งออก</p>
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

        {/* Live Gradient Preview Card */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-white/60">ตัวอย่างสี Gradient ที่ใช้งานอยู่:</label>
          <div 
            className="h-20 w-full rounded-2xl p-4 flex items-center justify-between shadow-xl border border-white/15 relative overflow-hidden transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${newStart}, ${newEnd})`
            }}
          >
            <div className="absolute inset-0 bg-black/15 backdrop-blur-[1px]" />
            <div className="relative z-10 flex flex-col">
              <span className="text-sm font-bold text-white drop-shadow-md">
                {aePreset.name}
              </span>
              <span className="text-[11px] font-mono text-white/80 drop-shadow">
                {newStart} ➔ {newEnd}
              </span>
            </div>
            <div className="relative z-10 px-3 py-1 rounded-full bg-black/40 border border-white/20 text-xs font-mono text-white">
              Glow: {localRadius}px
            </div>
          </div>
        </div>

        {/* Glow Radius Numeric Input */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-white/70">
              Glow Radius รัศมีเรืองแสงใน AE:
            </label>
            <span className="text-xs font-mono text-white font-bold">
              {localRadius} px
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={50}
              max={600}
              step={5}
              value={localRadius}
              onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
              className="flex-1 h-1.5 rounded-lg bg-white/15 appearance-none cursor-pointer accent-white"
            />
            <input
              type="number"
              min={1}
              max={1000}
              value={localRadius}
              onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
              className="w-20 px-2.5 py-1 rounded-xl apple-glass-input text-xs font-mono text-center text-white outline-none"
            />
          </div>
        </div>

        {/* Color Pickers (Gradient Start & End) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5 p-3 rounded-2xl apple-glass-card">
            <span className="text-[11px] font-medium text-white/50">สีเริ่มต้น:</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newStart}
                onChange={(e) => {
                  setNewStart(e.target.value);
                  setAEPreset({ ...aePreset, startColorHex: e.target.value });
                }}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none outline-none"
              />
              <input
                type="text"
                value={newStart}
                onChange={(e) => {
                  setNewStart(e.target.value);
                  setAEPreset({ ...aePreset, startColorHex: e.target.value });
                }}
                className="flex-1 px-2 py-1 rounded-lg apple-glass-input text-xs font-mono text-center"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 p-3 rounded-2xl apple-glass-card">
            <span className="text-[11px] font-medium text-white/50">สีสิ้นสุด:</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newEnd}
                onChange={(e) => {
                  setNewEnd(e.target.value);
                  setAEPreset({ ...aePreset, endColorHex: e.target.value });
                }}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none outline-none"
              />
              <input
                type="text"
                value={newEnd}
                onChange={(e) => {
                  setNewEnd(e.target.value);
                  setAEPreset({ ...aePreset, endColorHex: e.target.value });
                }}
                className="flex-1 px-2 py-1 rounded-lg apple-glass-input text-xs font-mono text-center"
              />
            </div>
          </div>
        </div>

        {/* Preset List with Delete & Add */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-white/70">
              ชุดสีพรีเซ็ตทั้งหมด {aePresets.length} สไตล์:
            </label>
            <span className="text-[11px] text-white/40">คลิกเพื่อเลือก / ลบสีที่ไม่ต้องการ</span>
          </div>

          <div className="max-h-36 overflow-y-auto pr-1 flex flex-col gap-1.5 scrollbar-dark">
            {aePresets.map((p) => {
              const isSelected = aePreset.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`group flex items-center justify-between px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-white/15 border-white/30 text-white' 
                      : 'apple-glass-card text-white/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-5 h-5 rounded-lg border border-white/20 shadow-sm flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${p.startColorHex}, ${p.endColorHex})` }}
                    />
                    <span className="text-xs font-medium">{p.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    {aePresets.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAEPreset(p.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                        title="ลบสีนี้ออกจากพรีเซ็ต"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add New Preset Row */}
          <div className="flex items-center gap-2 mt-1">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="ตั้งชื่อคู่สีใหม่นี้..."
              className="flex-1 px-3 py-1.5 rounded-xl apple-glass-input text-xs text-white outline-none"
            />
            <button
              onClick={handleAddPreset}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>บันทึกเป็นคู่สีใหม่</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-2xl bg-white text-black font-semibold text-xs hover:scale-105 transition-all cursor-pointer shadow-lg shadow-white/10"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  );
};
