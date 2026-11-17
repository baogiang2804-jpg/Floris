import React from 'react';
import {
  FlaskConical,
  AlertTriangle,
  Bookmark,
  BookOpen,
  Mic,
} from 'lucide-react';
import { FlorisSpringEmblem } from './SpringDecorations';

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
    <header className="border-b border-[#F5DCE4] bg-[#FFFDF8]/90 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-8 py-2.5 text-[#2B342D] shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Zone 1: Inline SVG Floris Spring Brand */}
        <button
          type="button"
          onClick={() => onChangePage('main')}
          className="flex items-center gap-2.5 text-left group shrink-0 focus:outline-none"
        >
          <FlorisSpringEmblem className="w-9 h-9 group-hover:scale-105 transition-transform shrink-0" />
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-[#BE185D] tracking-tight">
              Floris
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0] hidden sm:inline whitespace-nowrap">
              🌸 Mùa Xuân
            </span>
          </div>
        </button>

        {/* Zone 2: Clean Pastel Navigation Tabs (Desktop & Tablet) */}
        <nav
          aria-label="Điều hướng"
          className="hidden md:flex items-center gap-1 p-1 bg-[#FFF3F7] rounded-2xl border border-[#FBCFE8]/70 overflow-x-auto"
        >
          {[
            { id: 'main' as const, label: '🌸 Trang chính' },
            { id: 'experimental' as const, label: '🧪 Thực nghiệm' },
            { id: 'csv' as const, label: '📊 Bảng tính' },
            { id: 'ai' as const, label: '✨ Tư vấn AI' },
            { id: 'python' as const, label: '🐍 Python' },
          ].map((tab) => {
            const isActive = activePage === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangePage(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-white text-[#BE185D] font-bold shadow-xs border border-[#FBCFE8]'
                    : 'text-[#5C6B5F] hover:text-[#2B342D] font-semibold'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Compact Spring Pastel Action Pills */}
        <div className="flex items-center gap-2 shrink-0">
          {!isValidTotal && (
            <button
              onClick={onAutoBalance}
              type="button"
              className="text-xs px-3 py-1.5 rounded-xl bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] border border-[#FCD34D] transition-colors flex items-center gap-1.5 font-mono font-bold whitespace-nowrap"
              title="Tự động cân bằng tổng tỉ lệ về 100%"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
              <span>{totalPercentage}%</span>
              <span className="hidden sm:inline">· Cân 100%</span>
            </button>
          )}

          <button
            onClick={onOpenVoiceWidget}
            type="button"
            className="text-xs px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-[#EC4899] to-[#F472B6] hover:from-[#DB2777] hover:to-[#EC4899] text-white shadow-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95"
            title="Mở trợ lý giọng nói Gemini Live"
          >
            <Mic className="w-3.5 h-3.5 text-white shrink-0" />
            <span className="hidden sm:inline">Gemini Live</span>
          </button>

          <button
            onClick={onOpenExperimentalPopup}
            type="button"
            className="hidden sm:flex text-xs px-3 py-1.5 rounded-2xl bg-[#ECFDF3] hover:bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0] transition-colors items-center gap-1.5 font-bold whitespace-nowrap"
            title="Xem nhanh phiếu thực hành"
          >
            <FlaskConical className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Phiếu mẫu</span>
          </button>

          <button
            onClick={onOpenSavedFormulas}
            type="button"
            className="hidden sm:flex text-xs px-3 py-1.5 rounded-2xl bg-[#FFFDF0] hover:bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] transition-colors items-center gap-1.5 font-bold whitespace-nowrap"
            title="Danh sách công thức đã lưu"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Đã lưu</span>
            <span className="font-mono">({savedCount})</span>
          </button>

          <button
            onClick={onOpenGuide}
            type="button"
            className="text-xs px-2.5 py-1.5 rounded-2xl bg-white hover:bg-[#FFF1F5] text-[#4A4D48] border border-[#F3DCE4] transition-colors flex items-center gap-1.5 font-bold whitespace-nowrap"
            title="Hướng dẫn nhanh"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#DB2777]" />
            <span className="hidden sm:inline">Hướng dẫn</span>
          </button>
        </div>
      </div>
    </header>
  );
};
