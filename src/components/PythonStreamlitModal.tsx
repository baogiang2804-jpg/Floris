import React, { useState } from 'react';
import { FileCode, Copy, Check, Download, X, Terminal, ExternalLink } from 'lucide-react';
import { generateStreamlitCode, FormulaSlot } from '../utils/perfumeCalculations';
import { SpringAccordion } from './SpringAccordion';

interface PythonStreamlitModalProps {
  isOpen: boolean;
  onClose: () => void;
  seasonLabel: string;
  totalVolume: number;
  slots: FormulaSlot[];
  onOpenPythonSubWeb?: () => void;
}

export const PythonStreamlitModal: React.FC<PythonStreamlitModalProps> = ({
  isOpen,
  onClose,
  seasonLabel,
  totalVolume,
  slots,
  onOpenPythonSubWeb,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const pythonScript = generateStreamlitCode(seasonLabel, totalVolume, slots);

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([pythonScript], { type: 'text/x-python;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'perfume_atelier_app.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="python-streamlit-modal-title"
      className="fixed inset-0 z-50 bg-[#2B342D]/45 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-[#FFFDF8] border-2 border-[#BBF7D0] rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#BBF7D0]/80 bg-gradient-to-r from-[#F0FDF4] via-[#FFFDF8] to-[#FFF0F6] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#DCFCE7] border border-[#86EFAC] flex items-center justify-center shrink-0">
              <FileCode className="w-5 h-5 text-[#15803D]" />
            </div>
            <div className="min-w-0">
              <h2
                id="python-streamlit-modal-title"
                className="text-base sm:text-lg font-extrabold text-[#2B342D] truncate"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Mã Python Streamlit
              </h2>
              <p className="text-xs text-[#5C6B5F]">
                app.py · {seasonLabel} · {totalVolume} mL
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="w-9 h-9 rounded-full bg-white hover:bg-[#FCE7F3] border border-[#FBCFE8] text-[#5C6B5F] hover:text-[#BE185D] flex items-center justify-center transition-all shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 bg-[#FFFDF5] border-b border-[#F3DCE4] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="px-3 py-1 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-xs font-bold">
              🐍 streamlit run app.py
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FFF5F8] text-[#2B342D] border border-[#FBCFE8] transition-all flex items-center gap-1.5 text-xs font-bold"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span className="text-[#15803D]">Đã sao chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#EC4899]" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>

              {onOpenPythonSubWeb && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPythonSubWeb();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] hover:from-[#16A34A] hover:to-[#15803D] text-white transition-all flex items-center gap-1.5 text-xs font-bold shadow-sm active:scale-95"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Chạy trên Web</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#EC4899] to-[#F472B6] hover:from-[#DB2777] hover:to-[#EC4899] text-white transition-all flex items-center gap-1.5 text-xs font-bold shadow-sm active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải app.py</span>
              </button>
            </div>
          </div>

          <SpringAccordion
            title="Hướng dẫn cài đặt & biến môi trường"
            badge="Lệnh terminal"
            icon={<Terminal className="w-4 h-4 text-[#16A34A]" />}
            tone="leaf"
          >
            <p>
              Cài thư viện:{' '}
              <code className="px-2 py-0.5 rounded bg-white border border-[#BBF7D0] text-[#15803D] font-mono">
                pip install streamlit pandas plotly google-genai
              </code>
            </p>
            <p>
              API Key được đọc tự động từ biến môi trường{' '}
              <code className="px-2 py-0.5 rounded bg-white border border-[#BBF7D0] text-[#92400E] font-mono">
                os.getenv("GEMINI_API_KEY")
              </code>
              .
            </p>
          </SpringAccordion>
        </div>

        {/* Code Preview */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 bg-[#FAFDF8] font-mono text-xs">
          <pre className="p-4 rounded-2xl bg-white border border-[#BBF7D0] text-[#2B342D] leading-relaxed overflow-x-auto whitespace-pre shadow-inner">
            {pythonScript}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#BBF7D0]/70 bg-[#F3FDF6] flex items-center justify-between text-xs text-[#5C6B5F]">
          <span className="font-semibold">Python Streamlit Export</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white hover:bg-[#DCFCE7] border border-[#BBF7D0] text-[#2B342D] text-xs font-bold transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
