import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  FileCode, 
  FileText, 
  Languages, 
  Music, 
  Folder,
  Layers,
  FileCheck
} from 'lucide-react';
import { useLyricStore } from '../../stores/useLyricStore';
import { 
  generateBilingualLrc, 
  generateTranslationLrc, 
  generateOriginalLrc, 
  generateReferenceLrc, 
  generateSrt,
  downloadFile,
  copyToClipboard,
  generateFormalFilename,
  sanitizeSafeFilename
} from '../../utils/lrcExporter';
import { generateAEScript } from '../../utils/aeExporter';
import { ModernCodePreview } from '../preview/ModernCodePreview';
import { downloadSongAudio } from '../../services/audioDownloadService';
import { AUDIO_FORMAT_OPTIONS } from '../../config/audioFormats';
import { playTapSound, playSuccessSound } from '../../utils/soundEffects';
import { APP_TEXT, THAI_TEXT } from '../../constants/localization';
import { logger } from '../../services/logger';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'ae-jsx' | 'lrc-bi' | 'lrc-th' | 'lrc-en' | 'lrc-ref' | 'srt';

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { 
    lyrics, 
    metadata, 
    aePreset, 
    glowRadius, 
    savedDiskFolder, 
    savedDiskPath, 
    openProjectDiskFolder 
  } = useLyricStore();

  const [selectedFormat, setSelectedFormat] = useState<TabType>('ae-jsx');
  const [copied, setCopied] = useState(false);
  const [copyToast, setCopyToast] = useState<string | null>(null);
  const [selectedAudioFormat, setSelectedAudioFormat] = useState('mp3_320');

  if (!isOpen) return null;

  const showCopyToast = (msg: string) => {
    setCopyToast(msg);
    setTimeout(() => setCopyToast(null), 3500);
  };

  const getExportData = () => {
    switch (selectedFormat) {
      case 'ae-jsx':
        return {
          content: generateAEScript(lyrics, metadata, {
            startColorHex: aePreset.startColorHex,
            endColorHex: aePreset.endColorHex,
            glowRadius: glowRadius
          }),
          filename: generateFormalFilename(metadata, '', 'jsx'),
          mime: 'application/javascript',
          language: 'javascript'
        };
      case 'lrc-bi':
        return {
          content: generateBilingualLrc(lyrics, metadata),
          filename: generateFormalFilename(metadata, 'Bilingual', 'lrc'),
          mime: 'text/plain',
          language: 'lrc'
        };
      case 'lrc-th':
        return {
          content: generateTranslationLrc(lyrics, metadata),
          filename: generateFormalFilename(metadata, 'Thai', 'lrc'),
          mime: 'text/plain',
          language: 'lrc'
        };
      case 'lrc-en':
        return {
          content: generateOriginalLrc(lyrics, metadata),
          filename: generateFormalFilename(metadata, 'Original', 'lrc'),
          mime: 'text/plain',
          language: 'lrc'
        };
      case 'lrc-ref':
        return {
          content: generateReferenceLrc(lyrics, metadata),
          filename: generateFormalFilename(metadata, 'Reference', 'lrc'),
          mime: 'text/plain',
          language: 'lrc'
        };
      case 'srt':
        return {
          content: generateSrt(lyrics),
          filename: generateFormalFilename(metadata, '', 'srt'),
          mime: 'text/plain',
          language: 'srt'
        };
    }
  };

  const exportData = getExportData();

  const handleDownload = () => {
    playTapSound();
    playSuccessSound();
    downloadFile(exportData.content, exportData.filename, exportData.mime);
  };

  const handleCopyCurrent = () => {
    playTapSound();
    copyToClipboard(exportData.content).then(() => {
      setCopied(true);
      playSuccessSound();
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleQuickCopy = (type: 'bi' | 'th' | 'orig') => {
    playTapSound();
    let text = '';
    if (type === 'bi') {
      text = lyrics.map(l => `${l.original}\n${l.translation || l.referenceTranslation || ''}`).join('\n\n');
      showCopyToast(THAI_TEXT.exportModal.copyBilingual + ' เรียบร้อย');
    } else if (type === 'th') {
      text = lyrics.map(l => l.translation || l.referenceTranslation || l.original).join('\n');
      showCopyToast(THAI_TEXT.exportModal.copyThaiOnly + ' เรียบร้อย');
    } else {
      text = lyrics.map(l => l.original).join('\n');
      showCopyToast(THAI_TEXT.exportModal.copyOriginalOnly + ' เรียบร้อย');
    }
    playSuccessSound();
    copyToClipboard(text);
  };

  const handleSyncToMaORepository = async () => {
    playTapSound();
    const isElectron = typeof window !== 'undefined' && (window as any).electronAPI?.syncToMaORepository;
    if (!isElectron) {
      showCopyToast('ฟีเจอร์นี้ใช้งานได้บนโหมด Desktop');
      return;
    }

    try {
      const safeTitle = sanitizeSafeFilename(metadata.title || 'Song');
      const scriptContent = generateAEScript(lyrics, metadata, {
        startColorHex: aePreset.startColorHex,
        endColorHex: aePreset.endColorHex,
        glowRadius: glowRadius
      });
      const res = await (window as any).electronAPI.syncToMaORepository({
        fileName: `${safeTitle}.jsx`,
        content: scriptContent
      });

      if (res?.success) {
        playSuccessSound();
        showCopyToast(`${THAI_TEXT.exportModal.syncSuccess}: ${safeTitle}.jsx`);
      } else {
        showCopyToast(THAI_TEXT.exportModal.syncError);
      }
    } catch (e) {
      logger.error('[EXPORT]', 'Failed to sync to MaO repo:', e);
      showCopyToast(THAI_TEXT.exportModal.syncError);
    }
  };

  // Download audio using dedicated audioDownloadService
  const handleDownloadAudio = async () => {
    playTapSound();
    const result = await downloadSongAudio(metadata, selectedAudioFormat, savedDiskPath);
    if (result.success) {
      playSuccessSound();
    }
    showCopyToast(result.message);
  };

  // Download Cover Image directly to song folder
  const handleDownloadCover = async () => {
    playTapSound();
    if (!metadata.coverUrl) {
      showCopyToast('ไม่มีรูปภาพปกในโปรเจกต์');
      return;
    }
    const safeTitle = sanitizeSafeFilename(metadata.title || 'Song');
    if (typeof window !== 'undefined' && (window as any).electronAPI?.downloadCoverFile) {
      const res = await (window as any).electronAPI.downloadCoverFile({
        url: metadata.coverUrl,
        fileName: `${safeTitle}_Cover.jpg`,
        customDir: savedDiskPath || undefined
      });
      if (res?.success) {
        playSuccessSound();
        showCopyToast(THAI_TEXT.messages.downloadedCover);
      } else {
        showCopyToast('ไม่สามารถดาวน์โหลดรูปภาพปกได้');
      }
    } else {
      window.open(metadata.coverUrl, '_blank');
    }
  };

  const formats = [
    { id: 'ae-jsx', label: APP_TEXT.exportModal.formats.aeJsx.label, ext: '.jsx', desc: APP_TEXT.exportModal.formats.aeJsx.desc, icon: Sparkles },
    { id: 'lrc-bi', label: APP_TEXT.exportModal.formats.lrcBi.label, ext: '.lrc', desc: APP_TEXT.exportModal.formats.lrcBi.desc, icon: Languages },
    { id: 'lrc-th', label: APP_TEXT.exportModal.formats.lrcTh.label, ext: '.lrc', desc: APP_TEXT.exportModal.formats.lrcTh.desc, icon: FileText },
    { id: 'lrc-en', label: APP_TEXT.exportModal.formats.lrcEn.label, ext: '.lrc', desc: APP_TEXT.exportModal.formats.lrcEn.desc, icon: FileCheck },
    { id: 'lrc-ref', label: APP_TEXT.exportModal.formats.lrcRef.label, ext: '.lrc', desc: APP_TEXT.exportModal.formats.lrcRef.desc, icon: Layers },
    { id: 'srt', label: APP_TEXT.exportModal.formats.srt.label, ext: '.srt', desc: APP_TEXT.exportModal.formats.srt.desc, icon: FileCode },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-fade-in select-none">
      <div 
        className="liquid-glass relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-white/15 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white shadow-sm">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                {APP_TEXT.exportModal.title}
              </h2>
              <p className="text-xs text-white/40">
                {metadata.title ? `${metadata.title} • ${lyrics.length} ท่อน` : 'ส่งออกไฟล์สำหรับตัดต่อและเล่นเพลง'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer active:scale-90"
            title={APP_TEXT.exportModal.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Header Ribbon */}
        <div className="px-6 py-2.5 bg-white/[0.02] border-b border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-white/40 font-medium mr-1">{APP_TEXT.exportModal.quickCopy}:</span>
            <button
              onClick={() => handleQuickCopy('bi')}
              className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              {APP_TEXT.exportModal.copyBilingual}
            </button>
            <button
              onClick={() => handleQuickCopy('th')}
              className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              {APP_TEXT.exportModal.copyThaiOnly}
            </button>
            <button
              onClick={() => handleQuickCopy('orig')}
              className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              {APP_TEXT.exportModal.copyOriginalOnly}
            </button>
          </div>

          {/* Right Ribbon: Audio Download & Direct Sync */}
          <div className="flex items-center gap-2">
            {metadata.audioSrc && (
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2 py-0.5 rounded-xl">
                <Music className="w-3.5 h-3.5 text-white/70" />
                <select
                  value={selectedAudioFormat}
                  onChange={(e) => setSelectedAudioFormat(e.target.value)}
                  className="bg-transparent text-xs text-white outline-none cursor-pointer"
                >
                  {AUDIO_FORMAT_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id} className="bg-[#10111a] text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleDownloadAudio}
                  className="px-2 py-0.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[11px] font-semibold transition-all cursor-pointer"
                  title="ดาวน์โหลดไฟล์เสียงลงในโฟลเดอร์โปรเจกต์"
                >
                  {APP_TEXT.exportModal.downloadAudio}
                </button>
              </div>
            )}

            {metadata.coverUrl && (
              <button
                onClick={handleDownloadCover}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                title="บันทึกรูปภาพปกเพลง"
              >
                <Music className="w-3.5 h-3.5" />
                <span>{APP_TEXT.exportModal.downloadCover}</span>
              </button>
            )}

            <button
              onClick={handleSyncToMaORepository}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer font-semibold shadow-sm active:scale-95 text-xs"
              title="ซิงค์ไฟล์สากลตรงเข้าคลัง After Effects"
            >
              <Sparkles className="w-3.5 h-3.5 text-white/80" />
              <span>{APP_TEXT.exportModal.syncToAERepo}</span>
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {copyToast && (
          <div className="mx-6 mt-3 px-4 py-2 rounded-2xl bg-white/10 border border-white/20 text-white text-xs text-center animate-fade-in font-medium shadow-lg">
            {copyToast}
          </div>
        )}

        {/* Main Content Area - Single Scrollbar Layout */}
        <div className="flex-1 min-h-0 flex flex-col p-6 space-y-4">
          {/* Format Selector Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 flex-shrink-0">
            {formats.map((fmt) => {
              const isSelected = selectedFormat === fmt.id;
              const Icon = fmt.icon;
              return (
                <button
                  key={fmt.id}
                  onClick={() => setSelectedFormat(fmt.id as any)}
                  className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-white/15 border-white/40 text-white shadow-xl shadow-black/20 ring-1 ring-white/20' 
                      : 'bg-white/[0.02] border-white/5 text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-white/40'}`} />
                    <span className="text-xs font-bold">{fmt.label}</span>
                  </div>
                  <span className="text-[10px] text-white/40 line-clamp-1">{fmt.desc}</span>
                </button>
              );
            })}
          </div>

          {/* Modern Code Preview - Single Clean Scrollbar fills remaining height */}
          <ModernCodePreview
            filename={exportData.filename}
            code={exportData.content}
            language={exportData.language}
            onDownload={handleDownload}
            className="w-full flex-1 min-h-0"
          />
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 border-t border-white/10 bg-black/40 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCurrent}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? APP_TEXT.exportModal.copiedSuccess : APP_TEXT.exportModal.copyCode}</span>
            </button>

            {savedDiskFolder && (
              <button
                onClick={() => openProjectDiskFolder()}
                title={`เปิดโฟลเดอร์โปรเจกต์ในระบบ:\n${savedDiskFolder}`}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-medium text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
              >
                <Folder className="w-3.5 h-3.5 text-white/70" />
                <span>{APP_TEXT.exportModal.openFolder}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-2xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              {APP_TEXT.exportModal.close}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-2 rounded-2xl text-xs font-bold text-black bg-white hover:bg-white/90 hover:scale-105 transition-all shadow-xl shadow-white/15 cursor-pointer"
            >
              <Download className="w-4 h-4 text-black" />
              <span>{APP_TEXT.exportModal.downloadFile}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
