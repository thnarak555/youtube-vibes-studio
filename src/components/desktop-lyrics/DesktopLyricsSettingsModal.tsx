import React, { useEffect } from 'react';
import { 
  X, 
  RotateCcw, 
  Sparkles, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Lock, 
  Layers, 
  Eye, 
  Palette, 
  Sliders, 
  Type
} from 'lucide-react';
import { 
  useDesktopLyricsStore, 
  BUILTIN_STYLE_TEMPLATES, 
  type DisplayMode, 
  type ShadowIntensity, 
  type TextAlign,
  type OverflowMode 
} from '../../stores/useDesktopLyricsStore';
import { cn } from '../../utils/cn';

interface DesktopLyricsSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopLyricsSettingsModal: React.FC<DesktopLyricsSettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    fontSize,
    secondaryFontSize,
    textColor,
    secondaryColor,
    displayMode,
    shadowIntensity,
    textAlign,
    backgroundOpacity,
    alwaysOnTop,
    isLocked,
    overflowMode,
    setFontSize,
    setSecondaryFontSize,
    setTextColor,
    setSecondaryColor,
    setDisplayMode,
    setShadowIntensity,
    setTextAlign,
    setBackgroundOpacity,
    setAlwaysOnTop,
    setIsLocked,
    setOverflowMode,
    applyTemplate,
    resetToDefaults
  } = useDesktopLyricsStore();

  // Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Compute text shadow for preview
  const getPreviewShadow = () => {
    if (shadowIntensity === 'none') return 'none';
    if (shadowIntensity === 'glow') {
      return `0 0 20px ${secondaryColor}99, 0 0 10px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,1), 0 0 2px rgba(0,0,0,1)`;
    }
    if (shadowIntensity === 'strong') {
      return '0 0 16px rgba(0,0,0,0.95), 0 2px 6px rgba(0,0,0,0.95), 0 0 3px rgba(0,0,0,1), 0 1px 2px rgba(0,0,0,1)';
    }
    return '0 0 8px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.9)';
  };

  const colorPresets = [
    { label: 'White', color: '#ffffff' },
    { label: 'Cyan', color: '#67e8f9' },
    { label: 'Sky', color: '#38bdf8' },
    { label: 'Graphite', color: '#737373' },
    { label: 'Silver', color: '#d4d4d4' },
    { label: 'Amber', color: '#f59e0b' },
    { label: 'Yellow', color: '#fef08a' },
    { label: 'Emerald', color: '#10b981' },
    { label: 'Mint', color: '#6ee7b7' },
    { label: 'Slate', color: '#94a3b8' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/55 backdrop-blur-xs animate-fade-in select-none">
      <div 
        className="liquid-glass relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border border-white/15 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-white border border-white/15 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                การตั้งค่าเนื้อเพลงเดสก์ท็อป
              </h2>
              <p className="text-xs text-white/50">
                ปรับแต่งสไตล์ สี และขนาดตัวอักษรของเนื้อเพลงบนเดสก์ท็อป
              </p>
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

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-dark">
          {/* 1. Live Preview Screen */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-white/70">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-white/80" />
                ตัวอย่างการแสดงผลแบบสด
              </span>
              <span className="text-[11px] text-white/40 font-mono">
                {backgroundOpacity === 0 ? 'พื้นหลังโปร่งใส 100%' : `พื้นหลังโปร่งแสง ${Math.round(backgroundOpacity * 100)}%`}
              </span>
            </div>

            <div 
              className="relative w-full min-h-[140px] rounded-2xl border border-white/15 p-6 flex flex-col justify-center overflow-hidden transition-all shadow-inner"
              style={{
                backgroundColor: backgroundOpacity > 0 ? `rgba(0, 0, 0, ${backgroundOpacity})` : 'transparent',
                backgroundImage: backgroundOpacity === 0 ? 'radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 70%)' : 'none'
              }}
            >
              <div 
                className="w-full flex flex-col gap-1 transition-all"
                style={{ textAlign }}
              >
                {/* Previous line (if scroll3) */}
                {displayMode === 'scroll3' && (
                  <div 
                    className="opacity-40 line-clamp-1 font-medium tracking-tight"
                    style={{ 
                      fontSize: `${Math.round(fontSize * 0.75)}px`,
                      color: textColor,
                      textShadow: getPreviewShadow()
                    }}
                  >
                    ท่อนก่อนหน้า
                  </div>
                )}

                {/* Main line */}
                <div 
                  className={cn(
                    "font-bold tracking-tight transition-all",
                    overflowMode === 'ellipsis' ? 'line-clamp-1' : 'break-words'
                  )}
                  style={{ 
                    fontSize: `${fontSize}px`, 
                    color: textColor,
                    textShadow: getPreviewShadow()
                  }}
                >
                  คืนที่ดาวเต็มฟ้า ฉันจินตนาการเป็นหน้าเธอ
                </div>

                {/* Sub / Translation line */}
                {(displayMode === 'dual' || displayMode === 'triple') && (
                  <div 
                    className={cn(
                      "font-semibold tracking-wide transition-all",
                      overflowMode === 'ellipsis' ? 'line-clamp-1' : 'break-words'
                    )}
                    style={{ 
                      fontSize: `${secondaryFontSize}px`, 
                      color: secondaryColor,
                      textShadow: getPreviewShadow()
                    }}
                  >
                    Night sky full of stars, I picture your face
                  </div>
                )}

                {/* Reference / Pronunciation line */}
                {displayMode === 'triple' && (
                  <div 
                    className="font-medium opacity-75 transition-all text-white/60"
                    style={{ 
                      fontSize: `${Math.max(12, Math.round(secondaryFontSize * 0.8))}px`,
                      textShadow: getPreviewShadow()
                    }}
                  >
                    [Khuen thi dao tem fa chan chintanakan pen na thoe]
                  </div>
                )}

                {/* Next line (if scroll3) */}
                {displayMode === 'scroll3' && (
                  <div 
                    className="opacity-40 line-clamp-1 font-medium tracking-tight"
                    style={{ 
                      fontSize: `${Math.round(fontSize * 0.75)}px`,
                      color: textColor,
                      textShadow: getPreviewShadow()
                    }}
                  >
                    ท่อนถัดไป
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. Style Templates */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                สไตล์สำเร็จรูป
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {BUILTIN_STYLE_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => applyTemplate(tmpl)}
                  className="p-2.5 rounded-xl border border-white/10 hover:border-white/30 bg-black/40 hover:bg-white/[0.06] text-left transition-all cursor-pointer group"
                >
                  <div className="text-xs font-semibold text-white group-hover:text-white transition-colors">
                    {tmpl.name}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span 
                      className="w-3 h-3 rounded-full border border-black/40" 
                      style={{ backgroundColor: tmpl.textColor }} 
                    />
                    <span 
                      className="w-3 h-3 rounded-full border border-black/40" 
                      style={{ backgroundColor: tmpl.secondaryColor }} 
                    />
                    <span className="text-[10px] text-white/40 ml-1">
                      {tmpl.fontSize}px / {tmpl.secondaryFontSize}px
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Typography & Size Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Primary Font Size */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <label className="text-xs font-semibold text-white/80 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-white/80" />
                  ขนาดตัวอักษรหลัก
                </span>
                <span className="font-mono text-white font-semibold">{fontSize}px</span>
              </label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white outline-none focus:border-white/40 transition-all cursor-pointer"
              >
                {[24, 28, 32, 36, 42, 48, 56, 64].map((sz) => (
                  <option key={sz} value={sz} className="bg-[#12131e] text-white">
                    {sz}px {sz === 32 ? 'ค่าเริ่มต้น' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Secondary Font Size */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <label className="text-xs font-semibold text-white/80 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-white/80" />
                  ขนาดตัวอักษรคำแปล
                </span>
                <span className="font-mono text-white font-semibold">{secondaryFontSize}px</span>
              </label>
              <select
                value={secondaryFontSize}
                onChange={(e) => setSecondaryFontSize(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white outline-none focus:border-white/40 transition-all cursor-pointer"
              >
                {[12, 14, 16, 18, 20, 24, 28, 32].map((sz) => (
                  <option key={sz} value={sz} className="bg-[#12131e] text-white">
                    {sz}px {sz === 20 ? 'ค่าเริ่มต้น' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Colors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Primary Text Color */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <label className="text-xs font-semibold text-white/80 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-white/80" />
                  สีเนื้อร้องหลัก
                </span>
                <span className="font-mono text-white/60">{textColor}</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white font-mono outline-none focus:border-white/40"
                />
              </div>
              {/* Presets */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {colorPresets.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => setTextColor(p.color)}
                    className="w-5 h-5 rounded-md border border-white/20 hover:scale-110 transition-transform cursor-pointer"
                    style={{ backgroundColor: p.color }}
                    title={p.label}
                  />
                ))}
              </div>
            </div>

            {/* Secondary Text Color */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <label className="text-xs font-semibold text-white/80 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-white/80" />
                  สีคำแปล
                </span>
                <span className="font-mono text-white/60">{secondaryColor}</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white font-mono outline-none focus:border-white/40"
                />
              </div>
              {/* Presets */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {colorPresets.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => setSecondaryColor(p.color)}
                    className="w-5 h-5 rounded-md border border-white/20 hover:scale-110 transition-transform cursor-pointer"
                    style={{ backgroundColor: p.color }}
                    title={p.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 5. Display Mode & Text Alignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Display Mode */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <label className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-white/80" />
                โหมดการแสดงผล
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'dual', label: '2 บรรทัด ต้นฉบับและคำแปล' },
                  { id: 'triple', label: '3 บรรทัด รวมคำอ่าน' },
                  { id: 'scroll3', label: 'เลื่อน 3 บรรทัด' },
                  { id: 'single', label: '1 บรรทัด เฉพาะต้นฉบับ' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setDisplayMode(mode.id as DisplayMode)}
                    className={cn(
                      "p-2 rounded-xl text-xs font-medium border transition-all cursor-pointer text-left",
                      displayMode === mode.id
                        ? "bg-white/20 border-white/40 text-white font-semibold shadow-sm"
                        : "bg-black/40 border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Alignment */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <label className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
                <AlignLeft className="w-3.5 h-3.5 text-white/80" />
                การจัดตำแหน่งข้อความ
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'left', label: 'ชิดซ้าย', icon: AlignLeft },
                  { id: 'center', label: 'กึ่งกลาง', icon: AlignCenter },
                  { id: 'right', label: 'ชิดขวา', icon: AlignRight }
                ].map((align) => {
                  const Icon = align.icon;
                  return (
                    <button
                      key={align.id}
                      onClick={() => setTextAlign(align.id as TextAlign)}
                      className={cn(
                        "p-2.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                        textAlign === align.id
                          ? "bg-white/20 border-white/40 text-white font-semibold shadow-sm"
                          : "bg-black/40 border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{align.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 6. Shadow & Background Opacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Shadow Intensity */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <label className="text-xs font-semibold text-white/80">
                ความเข้มเงาตัวอักษร
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'glow', label: 'เรืองแสงนีออน' },
                  { id: 'strong', label: 'เงาเข้มชัดเจน' },
                  { id: 'normal', label: 'เงาปกติ' },
                  { id: 'none', label: 'ไม่มีเงา' }
                ].map((sh) => (
                  <button
                    key={sh.id}
                    onClick={() => setShadowIntensity(sh.id as ShadowIntensity)}
                    className={cn(
                      "p-2 rounded-xl text-xs font-medium border transition-all cursor-pointer text-left",
                      shadowIntensity === sh.id
                        ? "bg-white/20 border-white/40 text-white font-semibold shadow-sm"
                        : "bg-black/40 border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {sh.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Opacity */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-white/80">
                <span>ความโปร่งแสงพื้นหลัง</span>
                <span className="font-mono text-white font-semibold">
                  {backgroundOpacity === 0 ? 'โปร่งใส 100%' : `${Math.round(backgroundOpacity * 100)}%`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="0.9"
                step="0.05"
                value={backgroundOpacity}
                onChange={(e) => setBackgroundOpacity(Number(e.target.value))}
                className="w-full accent-white cursor-pointer"
              />
              <p className="text-[11px] text-white/40">
                เลื่อนไปทางซ้ายสุดเพื่อตั้งเป็นโปร่งใส ไม่มีกรอบสี่เหลี่ยมบดบังหน้าจอ
              </p>
            </div>
          </div>

          {/* 7. Window Behavior & Lock */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Always On Top */}
            <label className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/40 border border-white/10 cursor-pointer">
              <span className="text-xs font-medium text-white/80">อยู่บนสุดเสมอ</span>
              <input
                type="checkbox"
                checked={alwaysOnTop}
                onChange={(e) => setAlwaysOnTop(e.target.checked)}
                className="w-4 h-4 accent-white rounded cursor-pointer"
              />
            </label>

            {/* Lock Window */}
            <label className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/40 border border-white/10 cursor-pointer">
              <span className="text-xs font-medium text-white/80 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-white/70" />
                ล็อกตำแหน่ง
              </span>
              <input
                type="checkbox"
                checked={isLocked}
                onChange={(e) => {
                  const val = e.target.checked;
                  setIsLocked(val);
                  if (typeof window !== 'undefined' && (window as any).electronAPI?.desktopLyricsSetLock) {
                    (window as any).electronAPI.desktopLyricsSetLock(val);
                  }
                }}
                className="w-4 h-4 accent-white rounded cursor-pointer"
              />
            </label>

            {/* Overflow Behavior */}
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/40 border border-white/10">
              <span className="text-xs font-medium text-white/80">ข้อความยาว</span>
              <select
                value={overflowMode}
                onChange={(e) => setOverflowMode(e.target.value as OverflowMode)}
                className="px-2 py-1 rounded bg-white/10 text-white text-xs border border-white/20 outline-none cursor-pointer"
              >
                <option value="ellipsis" className="bg-[#12131e]">ตัดด้วยจุดไข่ปลา</option>
                <option value="wrap" className="bg-[#12131e]">ปัดขึ้นบรรทัดใหม่</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/[0.02]">
          <button
            onClick={resetToDefaults}
            className="min-h-[44px] flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>รีเซ็ตเป็นค่าเริ่มต้น</span>
          </button>

          <button
            onClick={onClose}
            className="min-h-[44px] px-7 py-2.5 rounded-full bg-white hover:bg-neutral-200 active:scale-95 text-black text-xs font-bold transition-all shadow-lg shadow-white/10 cursor-pointer"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  );
};
