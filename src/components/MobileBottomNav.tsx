import React from 'react';
import {
  Home,
  FlaskConical,
  FileSpreadsheet,
  Bot,
  BookOpen,
  Bookmark,
  FileCode,
} from 'lucide-react';

interface MobileBottomNavProps {
  activePage: 'main' | 'experimental' | 'csv' | 'ai' | 'python';
  onChangePage: (page: 'main' | 'experimental' | 'csv' | 'ai' | 'python') => void;
  onOpenExperimentalPopup: () => void;
  onOpenSavedFormulas: () => void;
  savedCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activePage,
  onChangePage,
  onOpenExperimentalPopup,
  onOpenSavedFormulas,
  savedCount,
}) => {
  const navItems = [
    { id: 'main' as const, label: 'Trang chủ', icon: Home },
    { id: 'experimental' as const, label: 'Mẫu gốc', icon: FlaskConical },
    { id: 'csv' as const, label: 'Bảng tính', icon: FileSpreadsheet },
    { id: 'ai' as const, label: 'AI hương', icon: Bot },
    { id: 'python' as const, label: 'Python', icon: FileCode },
  ];

  return (
    <nav
      aria-label="Thanh điều hướng di động"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#FFFDF8]/95 backdrop-blur-md border-t border-[#FBCFE8] px-1.5 py-1.5 shadow-[0_-6px_24px_rgba(236,72,153,0.1)] flex items-center justify-around select-none"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activePage === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              onChangePage(item.id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 flex-1 min-w-0 rounded-2xl transition-all min-h-[46px] ${
              isActive
                ? 'text-[#BE185D] font-bold bg-[#FCE7F3] border border-[#F9A8D4]/60'
                : 'text-[#5C6B5F] hover:text-[#2B342D] font-semibold'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-[#DB2777]' : 'text-[#7A6B72]'}`} />
            <span className="text-[10px] mt-0.5 leading-tight whitespace-nowrap truncate max-w-full">
              {item.label}
            </span>
          </button>
        );
      })}

      <button
        type="button"
        onClick={onOpenExperimentalPopup}
        className="flex flex-col items-center justify-center py-1 px-1 flex-1 min-w-0 rounded-2xl text-[#15803D] hover:bg-[#ECFDF3] font-semibold min-h-[46px]"
        title="Phiếu mẫu"
      >
        <BookOpen className="w-4 h-4 text-[#16A34A]" />
        <span className="text-[10px] mt-0.5 leading-tight whitespace-nowrap">
          Phiếu
        </span>
      </button>

      <button
        type="button"
        onClick={onOpenSavedFormulas}
        className="flex flex-col items-center justify-center py-1 px-1 flex-1 min-w-0 rounded-2xl text-[#92400E] hover:bg-[#FEF3C7] font-semibold min-h-[46px] relative"
        title="Đã lưu"
      >
        <div className="relative">
          <Bookmark className="w-4 h-4 text-[#D97706]" />
          {savedCount > 0 && (
            <span className="absolute -top-1.5 -right-2 text-[9px] font-mono font-bold w-4 h-4 rounded-full bg-[#EC4899] text-white flex items-center justify-center">
              {savedCount}
            </span>
          )}
        </div>
        <span className="text-[10px] mt-0.5 leading-tight whitespace-nowrap">
          Đã lưu
        </span>
      </button>
    </nav>
  );
};
