import React, { useState } from 'react';
import { Copy, Check, FileCode, Terminal, Download } from 'lucide-react';
import { playTapSound, playSuccessSound } from '../../utils/soundEffects';
import { THAI_TEXT } from '../../constants/localization';

interface ModernCodePreviewProps {
  filename: string;
  code: string;
  language?: string;
  onDownload?: () => void;
  className?: string;
}

export const ModernCodePreview: React.FC<ModernCodePreviewProps> = ({
  filename,
  code,
  language = 'javascript',
  onDownload,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);

  const lines = code.split('\n');

  const handleCopy = () => {
    playTapSound();
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      playSuccessSound();
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-[#0e0f17]/95 shadow-2xl backdrop-blur-3xl ${className}`}>
      {/* VS Code Style Tab Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#141522]/90 border-b border-white/10 select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-white text-xs font-mono shadow-sm">
            <FileCode className="w-3.5 h-3.5 text-white/80" />
            <span>{filename}</span>
          </div>
          <span className="text-[11px] font-mono text-white/30 px-1">
            {lines.length} บรรทัด • UTF-8
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer shadow-sm"
            title={THAI_TEXT.exportModal.copyCode}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? THAI_TEXT.exportModal.copiedSuccess : 'คัดลอก'}</span>
          </button>

          {onDownload && (
            <button
              type="button"
              onClick={onDownload}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold text-black bg-white hover:bg-white/90 transition-all cursor-pointer shadow-sm"
              title={THAI_TEXT.exportModal.downloadFile}
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลด</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor Body with Line Numbers */}
      <div className="flex-1 min-h-0 overflow-auto scrollbar-dark font-mono text-xs select-text p-3 bg-black/40">
        <div className="flex">
          {/* Gutter / Line Numbers */}
          <div className="pr-4 select-none text-right text-white/25 font-mono">
            {lines.map((_, i) => (
              <div key={i} className="leading-5">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Code Content with Simple Clean Token Highlights */}
          <div className="flex-1 text-gray-200 overflow-x-auto whitespace-pre leading-5">
            {lines.map((line, i) => (
              <div key={i} className="hover:bg-white/[0.03] px-1 rounded transition-colors">
                {line.length === 0 ? '\u00A0' : highlightSyntax(line)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* VS Code Bottom Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#10111d] border-t border-white/5 text-[11px] font-mono text-white/40 select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-3 h-3 text-white/60" />
          <span>After Effects Script • Universal Engine</span>
        </div>
        <div className="flex items-center gap-3">
          <span>LF</span>
          <span>{language.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};

// Lightweight token highlighter for VS Code aesthetic
function highlightSyntax(line: string): React.ReactNode {
  if (line.trim().startsWith('//') || line.trim().startsWith('#')) {
    return <span className="text-emerald-400/80 italic">{line}</span>;
  }
  if (line.trim().startsWith('[') && line.includes(']')) {
    return <span className="text-sky-300">{line}</span>;
  }

  // Keywords
  const parts = line.split(/(\b(?:var|let|const|function|return|if|else|for|while|import|export|true|false|null)\b|"[^"]*"|'[^']*')/g);
  return (
    <>
      {parts.map((part, index) => {
        if (/^(var|let|const|function|return|if|else|for|while|import|export)$/.test(part)) {
          return <span key={index} className="text-sky-400 font-semibold">{part}</span>;
        }
        if (/^(true|false|null)$/.test(part)) {
          return <span key={index} className="text-purple-400">{part}</span>;
        }
        if (/^["'].*["']$/.test(part)) {
          return <span key={index} className="text-teal-300">{part}</span>;
        }
        return part;
      })}
    </>
  );
}
