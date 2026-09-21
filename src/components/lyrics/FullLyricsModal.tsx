import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  FileText, 
  Search, 
  ArrowDownToLine, 
  Sparkles,
  Play
} from 'lucide-react';
import { useLyricStore } from '../../stores/useLyricStore';
import { formatTimeWithMs } from '../../utils/timeFormat';
import { playTapSound, playSuccessSound } from '../../utils/soundEffects';

interface FullLyricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSeek: (time: number) => void;
}

export const FullLyricsModal: React.FC<FullLyricsModalProps> = ({ isOpen, onClose, onSeek }) => {
  const { 
    lyrics, 
    metadata, 
    updateTranslation, 
    updateOriginal,
    copyReferenceToTranslation
  } = useLyricStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isBulkPasteOpen, setIsBulkPasteOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const filteredLyrics = lyrics.filter(l => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (l.original && l.original.toLowerCase().includes(q)) ||
      (l.translation && l.translation.toLowerCase().includes(q)) ||
      (l.referenceTranslation && l.referenceTranslation.toLowerCase().includes(q))
    );
  });

  const handleCopyAll = () => {
    playTapSound();
    const text = lyrics.map((l, idx) => {
      const pad = (idx + 1 < 10 ? '0' : '') + (idx + 1);
      const time = formatTimeWithMs(l.inTime);
      let block = `[${pad}] [${time}] ${l.original}`;
      if (l.referenceTranslation) block += `\nคำแปลอ้างอิง: ${l.referenceTranslation}`;
      if (l.translation) block += `\nคำแปลไทย: ${l.translation}`;
      return block;
    }).join('\n\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      playSuccessSound();
      showToast('คัดลอกเนื้อเพลงทั้งหมดลงคลิปบอร์ดแล้ว');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleApplyBulkPaste = () => {
    if (!bulkText.trim()) return;
    playTapSound();
    const lines = bulkText.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    
    // Apply each line to translation
    lines.forEach((lineText, idx) => {
      if (lyrics[idx]) {
        updateTranslation(lyrics[idx].id, lineText);
      }
    });

    setIsBulkPasteOpen(false);
    setBulkText('');
    playSuccessSound();
    showToast(`นำเข้าคำแปลสำเร็จ ${Math.min(lines.length, lyrics.length)} บรรทัด`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/55 backdrop-blur-xs animate-fade-in">
      <div className="liquid-glass relative w-full max-w-5xl h-[88vh] rounded-3xl p-6 shadow-2xl flex flex-col gap-4 border border-white/15">
        
        {/* Toast */}
        {toastMsg && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs shadow-2xl animate-fade-in flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-black" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>เนื้อเพลงทั้งหมดและการแก้ไข</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white/70 font-normal">
                  {lyrics.length} ท่อน
                </span>
              </h2>
              <p className="text-[11px] text-white/40">
                {metadata.title ? `${metadata.title} — ${metadata.artist || 'ไม่ระบุศิลปิน'}` : 'แก้ไขเนื้อเพลงและคำแปลแบบรวมศูนย์'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Bulk Paste Toggle Button */}
            <button
              onClick={() => {
                playTapSound();
                setIsBulkPasteOpen(!isBulkPasteOpen);
              }}
              className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer active:scale-95"
            >
              <ArrowDownToLine className="w-3.5 h-3.5 text-white/80" />
              <span>วางคำแปลทั้งเพลง</span>
            </button>

            {/* Copy All Button */}
            <button
              onClick={handleCopyAll}
              className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-white/70" />}
              <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกทั้งหมด'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                playTapSound();
                onClose();
              }}
              className="w-11 h-11 flex items-center justify-center rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer active:scale-90"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bulk Paste Area (Expandable) */}
        {isBulkPasteOpen && (
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/20 flex flex-col gap-2.5 animate-fade-in flex-shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-white/80" />
                วางคำแปลภาษาไทยทั้งเพลง ระบบจะกระจายคำแปลลงทีละบรรทัดตามลำดับ
              </span>
              <button
                onClick={() => setIsBulkPasteOpen(false)}
                className="text-[11px] text-white/50 hover:text-white"
              >
                ยกเลิก
              </button>
            </div>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="วางคำแปลภาษาไทยที่แปลไว้ที่นี่... โดย 1 บรรทัดจะเท่ากับ 1 ท่อนเพลง"
              rows={4}
              className="w-full p-3 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-white/30 outline-none focus:border-white/40 resize-none font-mono"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleApplyBulkPaste}
                disabled={!bulkText.trim()}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-white text-black hover:bg-white/90 disabled:opacity-40 transition-all cursor-pointer shadow-lg"
              >
                นำเข้าคำแปลลงทุกท่อนทันที
              </button>
            </div>
          </div>
        )}

        {/* Search Filter Bar */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 flex-shrink-0">
          <Search className="w-3.5 h-3.5 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาข้อความในตารางเนื้อเพลง..."
            className="bg-transparent text-xs text-white placeholder-white/30 outline-none w-full"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="text-white/40 hover:text-white p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Lyrics Table Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar border border-white/10 rounded-2xl bg-black/40">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#12131e] z-10 text-[11px] font-semibold text-white/50 border-b border-white/10">
              <tr>
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3 w-28 text-center">เวลา</th>
                <th className="p-3 w-1/3">เนื้อร้องต้นฉบับ</th>
                <th className="p-3 w-1/4">คำแปลอ้างอิง</th>
                <th className="p-3 w-1/3">คำแปลภาษาไทย</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredLyrics.map((line, idx) => (
                <tr key={line.id} className="hover:bg-white/[0.03] transition-colors group">
                  {/* Row # & Play */}
                  <td className="p-2.5 text-center text-white/40 font-mono">
                    <button
                      onClick={() => onSeek(line.inTime)}
                      className="p-1 rounded-md text-white/30 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="เริ่มเล่นจากท่อนนี้"
                    >
                      <Play className="w-3 h-3 fill-current mx-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <span className="group-hover:hidden">{(idx + 1 < 10 ? '0' : '') + (idx + 1)}</span>
                  </td>

                  {/* Timecode */}
                  <td className="p-2.5 text-center font-mono text-[11px] text-white/50 whitespace-nowrap">
                    {formatTimeWithMs(line.inTime)}
                  </td>

                  {/* Original Text */}
                  <td className="p-2.5">
                    <input
                      type="text"
                      value={line.original}
                      onChange={(e) => updateOriginal(line.id, e.target.value)}
                      className="w-full bg-transparent text-white font-medium outline-none hover:bg-white/5 focus:bg-white/10 px-2 py-1 rounded-lg transition-colors border border-transparent focus:border-white/20"
                      title="คลิกเพื่อแก้ไขเนื้อร้องต้นฉบับ"
                    />
                  </td>

                  {/* Reference Text */}
                  <td className="p-2.5 text-white/60">
                    <div className="flex items-center justify-between gap-1 group/ref">
                      <span className="truncate">{line.referenceTranslation || '—'}</span>
                      {line.referenceTranslation && !line.translation && (
                        <button
                          onClick={() => {
                            playTapSound();
                            copyReferenceToTranslation(line.id);
                          }}
                          className="opacity-0 group-hover/ref:opacity-100 p-1 text-[10px] text-white/80 hover:bg-white/10 rounded transition-all flex-shrink-0"
                          title="ดึงลงช่องแปล"
                        >
                          ดึงแปล
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Target Thai Translation */}
                  <td className="p-2.5">
                    <input
                      type="text"
                      value={line.translation || ''}
                      onChange={(e) => updateTranslation(line.id, e.target.value)}
                      placeholder="พิมพ์คำแปลภาษาไทย..."
                      className="w-full bg-white/[0.05] text-white font-medium placeholder-white/20 outline-none hover:bg-white/10 focus:bg-white/15 px-2.5 py-1.5 rounded-xl border border-white/10 focus:border-white/40 transition-all shadow-inner"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-white/50 flex-shrink-0">
          <span>แสดง {filteredLyrics.length} จากทั้งหมด {lyrics.length} ท่อน</span>
          <button
            onClick={() => {
              playTapSound();
              onClose();
            }}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-black bg-white hover:bg-white/90 transition-all shadow-lg cursor-pointer"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  );
};
