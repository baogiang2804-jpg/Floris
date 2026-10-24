import React from 'react';
import {
  Home,
  FlaskConical,
  FileSpreadsheet,
  Bot,
  BookOpen,
  Bookmark,
  Sparkles,
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
    {
      id: 'main' as const,
      label: 'Trang chủ',
      icon: Home,
    },
    {
      id: 'experimental' as const,
      label: 'Thực nghiệm',
      icon: FlaskConical,
      badge: 'Gốc',
    },
    {
      id: 'csv' as const,
      label: 'Bảng tính',
      icon: FileSpreadsheet,
    },
    {
      id: 'ai' as const,
      label: 'Tư vấn AI',
      icon: Bot,
    },
    {
      id: 'python' as const,
      label: 'Python',
      icon: FileCode,
    },
  ];

  return (
    <nav
      aria-label="Thanh điều hướng di động"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#E8E1D5] px-2 py-1.5 shadow-[0_-4px_20px_rgba(45,58,47,0.08)] flex items-center justify-around select-none"
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
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative min-h-[48px] min-w-[56px] ${
              isActive
                ? 'text-[#245437] font-bold bg-[#EEF5F0]'
                : 'text-[#617366] hover:text-[#1F2F23] font-medium'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#3B7A57] scale-110' : 'text-[#718276]'} transition-transform`} />
              {item.badge && !isActive && (
                <span className="absolute -top-1.5 -right-3 text-[9px] font-mono px-1 rounded-full bg-[#EEF5F0] text-[#2D5E41] border border-[#CFE2D4]">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 leading-tight tracking-tight">
              {item.label}
            </span>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B7A57] mt-0.5" />
            )}
          </button>
        );
      })}

      {/* Quick Action: Pop-up Phiếu thực hành */}
      <button
        type="button"
        onClick={onOpenExperimentalPopup}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all text-[#617366] hover:text-[#1F2F23] font-medium min-h-[48px] min-w-[52px]"
        title="Xem nhanh phiếu thực hành dạng pop-up"
      >
        <BookOpen className="w-5 h-5 text-[#8E9E92]" />
        <span className="text-[10px] mt-1 leading-tight tracking-tight">
          Phiếu popup
        </span>
      </button>

      {/* Quick Action: Saved Formulas Drawer */}
      <button
        type="button"
        onClick={onOpenSavedFormulas}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all text-[#617366] hover:text-[#1F2F23] font-medium min-h-[48px] min-w-[52px] relative"
        title="Danh sách công thức đã lưu"
      >
        <div className="relative">
          <Bookmark className="w-5 h-5 text-[#D49A3D]" />
          {savedCount > 0 && (
            <span className="absolute -top-1.5 -right-2 text-[9px] font-mono font-bold w-4 h-4 rounded-full bg-[#D49A3D] text-white flex items-center justify-center">
              {savedCount}
            </span>
          )}
        </div>
        <span className="text-[10px] mt-1 leading-tight tracking-tight">
          Đã lưu
        </span>
      </button>
    </nav>
  );
};
