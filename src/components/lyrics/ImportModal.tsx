import React, { useState } from 'react';
import { X, Upload, FileMusic, FileText } from 'lucide-react';
import { useLyricStore } from '../../stores/useLyricStore';
import { parseLrcContent, parseSrtContent, parsePlainText } from '../../utils/lrcParser';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadAudioSrc: (src: string) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onLoadAudioSrc }) => {
  const { setLyrics, setMetadata } = useLyricStore();
  const [pasteText, setPasteText] = useState('');
  const [audioFileName, setAudioFileName] = useState('');

  if (!isOpen) return null;

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onLoadAudioSrc(url);
      setAudioFileName(file.name);
      // Try extracting title from filename
      const cleanName = file.name.replace(/\.[^/.]+$/, "");
      const parts = cleanName.split('-');
      if (parts.length >= 2) {
        setMetadata({ artist: parts[0].trim(), title: parts.slice(1).join('-').trim() });
      } else {
        setMetadata({ title: cleanName });
      }
    }
  };

  const handleLrcFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          if (file.name.endsWith('.srt')) {
            setLyrics(parseSrtContent(text));
          } else {
            setLyrics(parseLrcContent(text));
          }
          onClose();
        }
      };
      reader.readAsText(file, 'utf-8');
    }
  };

  const handleParsePasted = () => {
    if (!pasteText.trim()) return;
    if (pasteText.includes('-->')) {
      setLyrics(parseSrtContent(pasteText));
    } else if (pasteText.includes('[') && pasteText.includes(']')) {
      setLyrics(parseLrcContent(pasteText));
    } else {
      setLyrics(parsePlainText(pasteText));
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-fade-in">
      <div className="liquid-glass relative w-full max-w-2xl rounded-3xl p-6 shadow-2xl flex flex-col gap-5 border border-white/15">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white/90 shadow-sm">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">นำเข้าเพลงและเนื้อเพลง</h2>
              <p className="text-xs text-white/40">อัปโหลดไฟล์เสียง หรือไฟล์เนื้อเพลงภายนอก</p>
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

        {/* 1. Upload Audio */}
        <div className="p-4 rounded-2xl liquid-glass-card flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white/90">
              <FileMusic className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">ไฟล์เสียงเพลง</div>
              <div className="text-[11px] text-white/40 mt-0.5">
                {audioFileName ? `เลือกแล้ว: ${audioFileName}` : 'รองรับ .mp3, .flac, .wav, .m4a'}
              </div>
            </div>
          </div>
          <label className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/15 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 shadow-sm flex items-center justify-center">
            เลือกไฟล์เพลง
            <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
          </label>
        </div>

        {/* 2. Upload LRC / SRT file */}
        <div className="p-4 rounded-2xl liquid-glass-card flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white/90">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">ไฟล์เนื้อเพลง LRC หรือ SRT</div>
              <div className="text-[11px] text-white/40 mt-0.5">อัปโหลดไฟล์ Timecode ที่มีอยู่แล้ว</div>
            </div>
          </div>
          <label className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/15 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 shadow-sm flex items-center justify-center">
            เลือกไฟล์เนื้อเพลง
            <input type="file" accept=".lrc,.srt,.txt" onChange={handleLrcFileUpload} className="hidden" />
          </label>
        </div>

        {/* 3. Paste Lyrics Text */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-white/60">หรือวางข้อความเนื้อเพลง:</div>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="[00:01.50]If I scatter like stardust&#10;[00:05.80]I will still drift forward..."
            rows={4}
            className="w-full p-3.5 rounded-2xl liquid-glass-card text-xs font-mono placeholder-white/30 text-white outline-none scrollbar-dark"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
          <button 
            onClick={onClose} 
            className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-medium text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleParsePasted}
            disabled={!pasteText.trim()}
            className="min-h-[44px] px-6 py-2.5 rounded-xl text-xs font-semibold text-black bg-white hover:bg-white/90 disabled:opacity-40 transition-all shadow-lg shadow-white/10 hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            แปลงและเริ่มแปล
          </button>
        </div>
      </div>
    </div>
  );
};
