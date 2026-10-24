import React, { useState } from 'react';
import { FileCode, Copy, Check, Download, X, Terminal, ExternalLink } from 'lucide-react';
import { generateStreamlitCode, FormulaSlot } from '../utils/perfumeCalculations';

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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-400 p-0.5 shadow-md">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <FileCode className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-slate-100 flex items-center gap-2">
                Mã Nguồn Python / Streamlit (app.py)
              </h2>
              <p className="text-xs text-slate-400">
                Mã nguồn độc lập có thể chạy trực tiếp bằng lệnh <code className="text-amber-400">streamlit run app.py</code>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Instructions banner */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 text-xs text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
            <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Cài đặt & chạy: <strong className="text-emerald-300">pip install streamlit pandas plotly google-genai</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5 text-xs font-medium"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Đã sao chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Sao chép mã</span>
                </>
              )}
            </button>

            {onOpenPythonSubWeb && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPythonSubWeb();
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white transition-all flex items-center gap-1.5 text-xs font-semibold shadow-md active:scale-95"
                title="Mở giao diện tương tác của app1_8ba4d2ea.py trên web"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Mở App Streamlit Trên Web</span>
              </button>
            )}

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-all flex items-center gap-1.5 text-xs font-medium shadow-md shadow-cyan-900/20 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải file app.py</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-5 overflow-y-auto flex-1 bg-slate-950 font-mono text-xs">
          <pre className="text-slate-300 leading-relaxed overflow-x-auto whitespace-pre">
            {pythonScript}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span className="italic">
            * Khóa API được đọc tự động từ biến môi trường <code className="text-amber-300">os.getenv("GEMINI_API_KEY")</code>, đáp ứng trọn vẹn yêu cầu bảo mật.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
