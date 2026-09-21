import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  User, 
  Tv, 
  Palette, 
  Keyboard, 
  RotateCcw, 
  Sparkles, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Layers, 
  Eye, 
  Sliders, 
  Type, 
  LogOut, 
  QrCode, 
  Key, 
  RefreshCw 
} from 'lucide-react';
import { 
  useDesktopLyricsStore, 
  BUILTIN_STYLE_TEMPLATES, 
  type DisplayMode, 
  type ShadowIntensity, 
  type TextAlign, 
  type OverflowMode 
} from '../../stores/useDesktopLyricsStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useLyricStore } from '../../stores/useLyricStore';
import { cn } from '../../utils/cn';
import { GlassSelectBox } from '../ui/GlassSelectBox';
import { GlassToggle } from '../ui/GlassToggle';
import { GlassSlider } from '../ui/GlassSlider';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'profile' | 'desktop-lyrics' | 'ae' | 'shortcuts';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'desktop-lyrics'
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'desktop-lyrics' | 'ae' | 'shortcuts'>(defaultTab);

  useEffect(() => {
    if (isOpen && defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  // Auth Store
  const {
    isLoggedIn,
    userProfile,
    isLoading: isAuthLoading,
    qrCodeImg,
    qrStatus,
    qrStatusMessage,
    checkLoginStatus,
    generateQrCode,
    checkQrCodeStatus,
    loginWithCookie,
    importYesPlayMusicCookie,
    logout
  } = useAuthStore();

  const [cookieInput, setCookieInput] = useState('');
  const [cookieError, setCookieError] = useState('');
  const qrCheckIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Desktop Lyrics Store
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

  // Player & Lyric store
  const { aePreset, setAEPreset, aePresets, glowRadius, setGlowRadius } = useLyricStore();

  // Check login status on mount
  useEffect(() => {
    if (isOpen) {
      checkLoginStatus();
    }
  }, [isOpen, checkLoginStatus]);

  // Handle QR code polling
  useEffect(() => {
    if (activeTab === 'profile' && !isLoggedIn && qrCodeImg && qrStatus !== 803 && qrStatus !== 800) {
      qrCheckIntervalRef.current = setInterval(async () => {
        const res = await checkQrCodeStatus();
        if (res.code === 803 || res.code === 800) {
          if (qrCheckIntervalRef.current) clearInterval(qrCheckIntervalRef.current);
        }
      }, 2500);
    }
    return () => {
      if (qrCheckIntervalRef.current) clearInterval(qrCheckIntervalRef.current);
    };
  }, [activeTab, isLoggedIn, qrCodeImg, qrStatus, checkQrCodeStatus]);

  // Escape key to close
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

  const handleManualCookieLogin = async () => {
    if (!cookieInput.trim()) {
      setCookieError('กรุณาป้อนข้อความคุกกี้');
      return;
    }
    setCookieError('');
    const ok = await loginWithCookie(cookieInput.trim());
    if (!ok) {
      setCookieError('คุกกี้ไม่ถูกต้อง หรือหมดอายุแล้ว');
    } else {
      setCookieInput('');
    }
  };

  const handleImportYesPlayMusic = async () => {
    setCookieError('');
    const ok = await importYesPlayMusicCookie();
    if (!ok) {
      setCookieError('ไม่พบคุกกี้จากโปรแกรม YesPlayMusic ในเครื่องนี้');
    }
  };

  const getPreviewShadow = () => {
    if (shadowIntensity === 'none') return 'none';
    if (shadowIntensity === 'glow') {
      return `0 0 22px ${secondaryColor}99, 0 0 10px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,1), 0 0 2px rgba(0,0,0,1)`;
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
    { label: 'Pink', color: '#f472b6' },
    { label: 'Rose', color: '#fb7185' },
    { label: 'Amber', color: '#f59e0b' },
    { label: 'Yellow', color: '#fef08a' },
    { label: 'Emerald', color: '#10b981' },
    { label: 'Mint', color: '#6ee7b7' },
    { label: 'Slate', color: '#94a3b8' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/55 backdrop-blur-xs animate-fade-in select-none">
      <div 
        className="liquid-glass relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl border border-white/15 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-white border border-white/15 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                การตั้งค่า
              </h2>
              <p className="text-xs text-white/50">
                จัดการบัญชีผู้ใช้ เนื้อเพลงเดสก์ท็อป และระบบสตูดิโอ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer active:scale-90"
            title="ปิดหน้าต่าง หรือกด Esc"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 border-b border-white/5 bg-black/30 overflow-x-auto scrollbar-none flex-shrink-0">
          {[
            { id: 'desktop-lyrics', label: 'เนื้อเพลงเดสก์ท็อป', icon: Tv },
            { id: 'profile', label: 'บัญชีผู้ใช้', icon: User },
            { id: 'ae', label: 'สคริปต์วิดีโอ', icon: Palette },
            { id: 'shortcuts', label: 'คีย์ลัด', icon: Keyboard }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex-shrink-0",
                  isActive
                    ? "bg-white/20 text-white border border-white/30 font-semibold shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-dark">

          {/* TAB 1: DESKTOP LYRICS */}
          {activeTab === 'desktop-lyrics' && (
            <div className="space-y-6 animate-fade-in">
              {/* 1. Live Preview Screen */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-white/70">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-white/80" />
                    ตัวอย่างการแสดงผล
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

                    {displayMode === 'triple' && (
                      <div 
                        className="font-medium opacity-75 transition-all text-white/60"
                        style={{ 
                          fontSize: `${Math.max(12, Math.round(secondaryFontSize * 0.8))}px`,
                          textShadow: getPreviewShadow()
                        }}
                      >
                        Khuen thi dao tem fa chan chintanakan pen na thoe
                      </div>
                    )}

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
                    เทมเพลตสไตล์
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BUILTIN_STYLE_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      onClick={() => applyTemplate(tmpl)}
                      className="p-2.5 rounded-xl border border-white/10 hover:border-white/30 bg-black/40 hover:bg-white/[0.06] text-left transition-all cursor-pointer group"
                    >
                      <div className="text-xs font-semibold text-white group-hover:text-white/90 transition-colors">
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
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <label className="text-xs font-semibold text-white/80 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5 text-white/80" />
                      ขนาดตัวอักษรหลัก
                    </span>
                    <span className="font-mono text-white/90">{fontSize}px</span>
                  </label>
                  <GlassSelectBox
                    value={fontSize}
                    onChange={(v) => setFontSize(Number(v))}
                    options={[24, 28, 32, 36, 42, 48, 56, 64].map((sz) => ({
                      value: sz,
                      label: `${sz}px${sz === 32 ? ' — ค่าเริ่มต้น' : ''}`
                    }))}
                    className="w-full"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <label className="text-xs font-semibold text-white/80 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5 text-white/80" />
                      ขนาดตัวอักษรคำแปล
                    </span>
                    <span className="font-mono text-white/90">{secondaryFontSize}px</span>
                  </label>
                  <GlassSelectBox
                    value={secondaryFontSize}
                    onChange={(v) => setSecondaryFontSize(Number(v))}
                    options={[12, 14, 16, 18, 20, 24, 28, 32].map((sz) => ({
                      value: sz,
                      label: `${sz}px${sz === 20 ? ' — ค่าเริ่มต้น' : ''}`
                    }))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* 4. Colors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                  <label className="text-xs font-semibold text-white/80 flex items-center justify-between">
                    <span>สีเนื้อร้องหลัก</span>
                    <span className="font-mono text-white/60">{textColor}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                    />
                    <input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white font-mono outline-none focus:border-white/40"
                    />
                  </div>
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

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                  <label className="text-xs font-semibold text-white/80 flex items-center justify-between">
                    <span>สีคำแปล</span>
                    <span className="font-mono text-white/60">{secondaryColor}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white font-mono outline-none focus:border-white/40"
                    />
                  </div>
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
                      { id: 'single', label: '1 บรรทัด ต้นฉบับ' }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setDisplayMode(mode.id as DisplayMode)}
                        className={cn(
                          "p-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer text-left",
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

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-white/80">
                    <span>ความโปร่งแสงพื้นหลัง</span>
                    <span className="font-mono text-white font-semibold">
                      {backgroundOpacity === 0 ? 'โปร่งใส 100%' : `${Math.round(backgroundOpacity * 100)}%`}
                    </span>
                  </div>
                  <GlassSlider
                    min={0}
                    max={0.9}
                    step={0.05}
                    value={backgroundOpacity}
                    onChange={setBackgroundOpacity}
                    formatTooltip={(v) => v === 0 ? 'โปร่งใส' : `${Math.round(v * 100)}%`}
                    className="w-full"
                  />
                  <p className="text-[11px] text-white/40">
                    เลื่อนไปทางซ้ายสุดเพื่อตั้งเป็นโปร่งใส ไม่มีกรอบสี่เหลี่ยมบดบังหน้าจอ
                  </p>
                </div>
              </div>

              {/* 7. Window Behavior & Lock */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <span className="text-xs font-semibold text-white/80">พฤติกรรมหน้าต่าง</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <GlassToggle
                    checked={alwaysOnTop}
                    onChange={setAlwaysOnTop}
                    label="อยู่บนสุดเสมอ"
                    description="แสดงเหนือทุกหน้าต่าง"
                    className="w-full justify-between p-3 rounded-xl bg-black/40 border border-white/10"
                  />

                  <GlassToggle
                    checked={isLocked}
                    onChange={(val) => {
                      setIsLocked(val);
                      if (typeof window !== 'undefined' && (window as any).electronAPI?.desktopLyricsSetLock) {
                        (window as any).electronAPI.desktopLyricsSetLock(val);
                      }
                    }}
                    label="ล็อกตำแหน่ง"
                    description="ล็อกไม่ให้ลาก"
                    className="w-full justify-between p-3 rounded-xl bg-black/40 border border-white/10"
                  />

                  <div className="flex flex-col gap-2 p-3 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-xs font-medium text-white/80">ข้อความยาว</span>
                    <GlassSelectBox
                      value={overflowMode}
                      onChange={(v) => setOverflowMode(v as OverflowMode)}
                      options={[
                        { value: 'ellipsis', label: 'ตัดด้วยจุดไข่ปลา' },
                        { value: 'wrap', label: 'ปัดขึ้นบรรทัดใหม่' }
                      ]}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE & NETEASE LOGIN */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              {isLoggedIn && userProfile ? (
                /* Logged In State */
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center gap-6">
                  <img
                    src={userProfile.avatarUrl}
                    alt={userProfile.nickname}
                    className="w-24 h-24 rounded-full border-2 border-white/30 object-cover shadow-xl"
                  />
                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <div className="flex items-center justify-center sm:justify-start gap-2.5">
                      <h3 className="text-lg font-bold text-white tracking-wide">
                        {userProfile.nickname}
                      </h3>
                      {userProfile.vipType !== 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30">
                          VIP
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/80 border border-white/10">
                        Lv.{userProfile.level}
                      </span>
                    </div>

                    <p className="text-xs text-white/50 max-w-md">
                      {userProfile.signature || 'ไม่มีข้อความแนะนำตัว'}
                    </p>

                    <div className="flex items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-white/60">
                      <div>
                        <span className="font-bold text-white mr-1">{userProfile.follows}</span>
                        <span>กำลังติดตาม</span>
                      </div>
                      <div>
                        <span className="font-bold text-white mr-1">{userProfile.followeds}</span>
                        <span>ผู้ติดตาม</span>
                      </div>
                      <div>
                        <span className="font-bold text-white mr-1">{userProfile.playlistCount}</span>
                        <span>เพลย์ลิสต์</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={logout}
                    className="min-h-[44px] flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 border border-white/15 text-xs font-semibold transition-all cursor-pointer active:scale-95"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>ออกจากระบบ</span>
                  </button>
                </div>
              ) : (
                /* Not Logged In - Login Options */
                <div className="space-y-6">
                  <div className="text-center space-y-1">
                    <h3 className="text-base font-bold text-white">เข้าสู่ระบบ NetEase Cloud Music</h3>
                    <p className="text-xs text-white/50">
                      เชื่อมต่อบัญชีเพื่อดึงเพลย์ลิสต์ เพลงโปรด และข้อมูลส่วนตัว
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Method 1: QR Code */}
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col items-center text-center space-y-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
                        <QrCode className="w-4 h-4 text-white/80" />
                        <span>สแกนด้วยแอปพลิเคชัน</span>
                      </div>

                      {qrCodeImg ? (
                        <div className="relative p-2 bg-white rounded-2xl shadow-xl">
                          <img src={qrCodeImg} alt="NetEase Login QR" className="w-44 h-44 rounded-xl" />
                          {qrStatus === 800 && (
                            <div className="absolute inset-0 bg-black/80 rounded-2xl flex flex-col items-center justify-center p-2 text-center text-xs text-white">
                              <span>QR Code หมดอายุ</span>
                              <button
                                onClick={generateQrCode}
                                className="mt-2 px-3 py-1 rounded-lg bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-colors"
                              >
                                กดเพื่อรีเฟรช
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-44 h-44 rounded-2xl bg-black/40 border border-white/10 flex flex-col items-center justify-center gap-2 text-white/40">
                          <QrCode className="w-10 h-10" />
                          <span className="text-xs">ยังไม่ได้สร้าง QR</span>
                        </div>
                      )}

                      <p className="text-[11px] text-white/50">{qrStatusMessage || 'กดปุ่มด้านล่างเพื่อสร้าง QR Code'}</p>

                      <button
                        onClick={generateQrCode}
                        disabled={isAuthLoading}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs font-semibold transition-all cursor-pointer"
                      >
                        <RefreshCw className={cn("w-3.5 h-3.5", isAuthLoading && "animate-spin")} />
                        <span>{qrCodeImg ? 'สร้าง QR Code ใหม่' : 'แสดง QR Code เข้าสู่ระบบ'}</span>
                      </button>
                    </div>

                    {/* Method 2 & 3: Cookie & YesPlayMusic */}
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between space-y-6">
                      {/* Method 2: One-Click YesPlayMusic Import */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
                          <Sparkles className="w-4 h-4 text-white/80" />
                          <span>ดึงคุกกี้จาก YesPlayMusic ในเครื่อง</span>
                        </div>
                        <p className="text-xs text-white/50">
                          หากท่านเคยเข้าสู่ระบบใน YesPlayMusic สามารถดึงข้อมูลมาใช้ได้ทันที
                        </p>
                        <button
                          onClick={handleImportYesPlayMusic}
                          disabled={isAuthLoading}
                          className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer"
                        >
                          ดึงบัญชีจาก YesPlayMusic อัตโนมัติ
                        </button>
                      </div>

                      <div className="border-t border-white/10" />

                      {/* Method 3: Manual Cookie Paste */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
                          <Key className="w-4 h-4 text-white/80" />
                          <span>เข้าสู่ระบบด้วยคุกกี้</span>
                        </div>
                        <input
                          type="text"
                          value={cookieInput}
                          onChange={(e) => setCookieInput(e.target.value)}
                          placeholder="วางข้อความคุกกี้ MUSIC_U หรือ Cookie ทั้งหมด..."
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-white/30 outline-none focus:border-white/40 transition-all font-mono"
                        />
                        {cookieError && (
                          <p className="text-[11px] text-white/70 font-medium">{cookieError}</p>
                        )}
                        <button
                          onClick={handleManualCookieLogin}
                          disabled={isAuthLoading}
                          className="w-full py-2 rounded-xl bg-white hover:bg-neutral-200 active:scale-95 text-black text-xs font-bold transition-all cursor-pointer shadow-lg shadow-white/10"
                        >
                          บันทึกคุกกี้และเข้าสู่ระบบ
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AFTER EFFECTS SCRIPT */}
          {activeTab === 'ae' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <label className="text-xs font-semibold text-white/80">
                  พรีเซ็ตสีสำหรับสคริปต์ After Effects
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {aePresets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setAEPreset(preset)}
                      className={cn(
                        "p-3 rounded-xl border text-left transition-all cursor-pointer active:scale-[0.97]",
                        aePreset.id === preset.id
                          ? "bg-white/20 border-white/40 text-white shadow-sm"
                          : "bg-black/40 border-white/10 text-white/70 hover:text-white"
                      )}
                    >
                      <div className="text-xs font-semibold">{preset.name}</div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.startColorHex }} />
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.endColorHex }} />
                        <span className="text-[10px] text-white/40">{preset.startColorHex} ➔ {preset.endColorHex}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <label className="text-xs font-semibold text-white/80 flex items-center justify-between">
                  <span>รัศมีความเรืองแสง Glow Radius</span>
                  <span className="font-mono text-white font-semibold">{glowRadius}</span>
                </label>
                <GlassSlider
                  min={50}
                  max={400}
                  step={10}
                  value={glowRadius}
                  onChange={setGlowRadius}
                  formatTooltip={(v) => String(v)}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* TAB 5: SHORTCUTS */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-4 animate-fade-in text-xs">
              {[
                { key: 'Space', desc: 'เล่น หรือหยุดเพลง' },
                { key: 'Ctrl + Space', desc: 'เล่น หรือหยุดเพลงขณะกำลังพิมพ์' },
                { key: 'Enter', desc: 'บันทึกท่อนปัจจุบันและเลื่อนไปท่อนถัดไป' },
                { key: 'Shift + Enter', desc: 'เลื่อนไปยังท่อนก่อนหน้า' },
                { key: 'Tab', desc: 'คัดลอกคำแปลอ้างอิงมาใส่ในช่องแปล' },
                { key: 'R', desc: 'วนซ้ำท่อนเพลงปัจจุบัน' },
                { key: 'Ctrl + S', desc: 'บันทึกโปรเจกต์ทันที' },
                { key: 'Ctrl + F', desc: 'ค้นหาคำในเนื้อเพลง' },
                { key: 'Ctrl + Alt + L', desc: 'ล็อก หรือปลดล็อกตำแหน่งเนื้อเพลงเดสก์ท็อป' },
                { key: 'Ctrl + Alt + D', desc: 'เปิด หรือปิดเนื้อเพลงเดสก์ท็อป' },
                { key: 'Esc', desc: 'ปิดหน้าต่างป๊อปอัปทุกหน้าต่าง' }
              ].map((sc) => (
                <div key={sc.key} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="font-mono text-white font-semibold px-2 py-1 rounded-lg bg-white/10 border border-white/15">
                    {sc.key}
                  </span>
                  <span className="text-white/70">{sc.desc}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/[0.02]">
          {activeTab === 'desktop-lyrics' ? (
            <button
              onClick={resetToDefaults}
              className="min-h-[44px] flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>รีเซ็ตเป็นค่าเริ่มต้น</span>
            </button>
          ) : (
            <div />
          )}

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
