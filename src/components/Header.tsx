import React from 'react';
import {
  FlaskConical,
  AlertTriangle,
  Bookmark,
  BookOpen,
  Mic,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  isValidTotal: boolean;
  totalPercentage: number;
  savedCount: number;
  activePage: 'main' | 'experimental' | 'csv' | 'ai' | 'python';
  onChangePage: (page: 'main' | 'experimental' | 'csv' | 'ai' | 'python') => void;
  onOpenSavedFormulas: () => void;
  onQuickSave: () => void;
  onOpenPythonCode: () => void;
  onExportCsv: () => void;
  onAutoBalance: () => void;
  onOpenGuide: () => void;
  onOpenVoiceWidget: () => void;
  onOpenExperimentalPopup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isValidTotal,
  totalPercentage,
  savedCount,
  activePage,
  onChangePage,
  onOpenSavedFormulas,
  onAutoBalance,
  onOpenGuide,
  onOpenVoiceWidget,
  onOpenExperimentalPopup,
}) => {
  return (
    <header className="border-b border-[#E8E1D5] bg-[#FAF8F5]/95 backdrop-blur-md sticky top-0 z-30 px-4 py-3 sm:px-8 text-[#2D3A2F]">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3.5">
        {/* Zone 1: Brand wordmark with official emblem */}
        <button
          type="button"
          onClick={() => onChangePage('main')}
          className="flex items-center gap-2.5 text-left group shrink-0 focus:outline-none"
        >
          <img
            src={import.meta.env.BASE_URL + 'assets/aistudio/image_404d5511.png'}
            alt="Floris Official Emblem"
            className="w-9 h-9 rounded-full object-cover border border-[#CFE2D4] shadow-xs group-hover:scale-105 transition-transform bg-white"
            loading="lazy"
          />
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-serif font-bold text-[#1F2F23] tracking-tight">
              Floris
            </span>
            <span className="text-xs text-[#6B7C70] hidden sm:inline font-sans">
              · Tổ 1 — 12A13 THPT NTMK
            </span>
          </div>
        </button>

        {/* Zone 2: Clean navigation tabs (Desktop & Tablet) */}
        <nav
          aria-label="Điều hướng"
          className="hidden md:flex items-center gap-1 p-1 bg-[#F2EDE4] rounded-xl border border-[#E3DBD0] overflow-x-auto"
        >
          <button
            type="button"
            onClick={() => onChangePage('main')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
              activePage === 'main'
                ? 'bg-[#FFFFFF] text-[#245437] font-bold shadow-xs'
                : 'text-[#58685C] hover:text-[#1F2F23]'
            }`}
          >
            Trang chính
          </button>

          <button
            type="button"
            onClick={() => onChangePage('experimental')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
              activePage === 'experimental'
                ? 'bg-[#FFFFFF] text-[#245437] font-bold shadow-xs'
                : 'text-[#58685C] hover:text-[#1F2F23]'
            }`}
          >
            Công thức thực nghiệm
          </button>

          <button
            type="button"
            onClick={() => onChangePage('csv')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
              activePage === 'csv'
                ? 'bg-[#FFFFFF] text-[#245437] font-bold shadow-xs'
                : 'text-[#58685C] hover:text-[#1F2F23]'
            }`}
          >
            Bảng tính & CSV
          </button>

          <button
            type="button"
            onClick={() => onChangePage('ai')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
              activePage === 'ai'
                ? 'bg-[#FFFFFF] text-[#245437] font-bold shadow-xs'
                : 'text-[#58685C] hover:text-[#1F2F23]'
            }`}
          >
            Góc tư vấn AI
          </button>

          <button
            type="button"
            onClick={() => onChangePage('python')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activePage === 'python'
                ? 'bg-[#FFFFFF] text-[#245437] font-bold shadow-xs ring-1 ring-[#3B7A57]/30'
                : 'text-[#58685C] hover:text-[#1F2F23]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4B4B]"></span>
            <span>App Python (Streamlit)</span>
          </button>
        </nav>

        {/* Zone 3: Concise utility actions & Gemini Live Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          {!isValidTotal && (
            <button
              onClick={onAutoBalance}
              type="button"
              className="text-xs px-2.5 py-1.5 rounded-lg bg-[#FFF4E5] hover:bg-[#FFE8CC] text-[#B45309] border border-[#FCD34D] transition-colors flex items-center gap-1.5 font-mono whitespace-nowrap"
              title="Tự động cân bằng tổng tỉ lệ về 100%"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
              <span>{totalPercentage}%</span>
              <span className="hidden sm:inline">· Cân bằng</span>
            </button>
          )}

          {/* Gemini Live Voice Button */}
          <button
            onClick={onOpenVoiceWidget}
            type="button"
            className="text-xs px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#2D6344] to-[#3B7A57] hover:from-[#245237] hover:to-[#2D6344] text-white shadow-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ring-2 ring-[#3B7A57]/20 active:scale-95 group"
            title="Mở trợ lý giọng nói Gemini Live để nhận diện và tinh chỉnh hương trực tiếp"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-200"></span>
            </span>
            <Mic className="w-3.5 h-3.5 text-emerald-100 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Gemini Live</span>
          </button>

          <button
            onClick={onOpenExperimentalPopup}
            type="button"
            className="hidden sm:flex text-xs px-3 py-1.5 rounded-xl bg-[#EEF5F0] hover:bg-[#E2EDE5] text-[#245236] border border-[#CFE2D4] transition-colors items-center gap-1.5 font-medium whitespace-nowrap shadow-xs"
            title="Mở cửa sổ pop-up xem nhanh phiếu thực hành"
          >
            <FlaskConical className="w-3.5 h-3.5 text-[#3B7A57]" />
            <span>Phiếu thực hành</span>
          </button>

          <button
            onClick={onOpenSavedFormulas}
            type="button"
            className="hidden sm:flex text-xs px-2.5 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F5F2EB] text-[#3D4E41] border border-[#E3DBD0] transition-colors items-center gap-1.5 whitespace-nowrap shadow-xs"
            title="Danh sách công thức đã lưu & so sánh song song"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#D49A3D]" />
            <span>Đã lưu</span>
            <span className="font-mono text-[#6A7B6E]">({savedCount})</span>
          </button>

          <button
            onClick={onOpenGuide}
            type="button"
            className="text-xs px-2.5 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F5F2EB] text-[#3D4E41] border border-[#E3DBD0] transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs"
            title="Xem hướng dẫn sử dụng"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#6A7B6E]" />
            <span className="hidden sm:inline">Hướng dẫn</span>
          </button>
        </div>
      </div>
    </header>
  );
};
