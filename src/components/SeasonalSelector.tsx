import React from 'react';
import { Sparkles, Info } from 'lucide-react';
import { SEASONAL_TEMPLATES } from '../data/perfumeData';
import { SpringAccordion } from './SpringAccordion';

interface SeasonalSelectorProps {
  selectedSeason: 'spring' | 'summer' | 'autumn' | 'winter';
  onSelectSeason: (season: 'spring' | 'summer' | 'autumn' | 'winter') => void;
  onApplySeasonalTemplate: () => void;
}

export const SeasonalSelector: React.FC<SeasonalSelectorProps> = ({
  selectedSeason,
  onSelectSeason,
  onApplySeasonalTemplate,
}) => {
  const currentTemplate = SEASONAL_TEMPLATES[selectedSeason];

  const seasonsList = [
    {
      key: 'spring' as const,
      emoji: '🌸',
      label: 'Mùa Xuân',
      tag: 'Hoa cỏ · Dịu nhẹ',
      cardBg: 'from-[#FFF1F5] to-[#ECFDF3]',
      activeBorder: 'border-[#F472B6] ring-2 ring-[#FBCFE8]',
      badgeClass: 'bg-[#FCE7F3] text-[#BE185D] border-[#F9A8D4]',
    },
    {
      key: 'summer' as const,
      emoji: '🍋',
      label: 'Mùa Hè',
      tag: 'Cam chanh · Mát',
      cardBg: 'from-[#FEFCE8] to-[#ECFDF3]',
      activeBorder: 'border-[#FACC15] ring-2 ring-[#FEF08A]',
      badgeClass: 'bg-[#FEF9C3] text-[#854D0E] border-[#FDE047]',
    },
    {
      key: 'autumn' as const,
      emoji: '🍂',
      label: 'Mùa Thu',
      tag: 'Gỗ ấm · Dịu dàng',
      cardBg: 'from-[#FFF7ED] to-[#FEF3C7]',
      activeBorder: 'border-[#FB923C] ring-2 ring-[#FED7AA]',
      badgeClass: 'bg-[#FFEDD5] text-[#9A3412] border-[#FDBA74]',
    },
    {
      key: 'winter' as const,
      emoji: '❄️',
      label: 'Mùa Đông',
      tag: 'Vani · Hổ phách',
      cardBg: 'from-[#FDF2F8] to-[#FFFBEB]',
      activeBorder: 'border-[#F472B6] ring-2 ring-[#FCE7F3]',
      badgeClass: 'bg-[#FCE7F3] text-[#9D174D] border-[#FBCFE8]',
    },
  ];

  return (
    <div className="spring-card p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 rounded-full bg-[#FCE7F3] text-[#BE185D] text-xs font-bold border border-[#FBCFE8] whitespace-nowrap">
            Bước 1 · Chọn mùa
          </span>
          <h2 className="text-lg font-bold text-[#2B342D]">
            Bối cảnh hương thơm
          </h2>
        </div>

        <button
          onClick={onApplySeasonalTemplate}
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#ECFDF3] hover:bg-[#DCFCE7] text-[#15803D] text-xs font-bold border border-[#86EFAC] transition-all self-start sm:self-auto active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
          <span>Nạp mẫu {currentTemplate.title.split('(')[0].trim()}</span>
        </button>
      </div>

      {/* Visual Season Cards (Emoji + Short Title + 2-word tag) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {seasonsList.map((item) => {
          const isSelected = selectedSeason === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelectSeason(item.key)}
              className={`p-4 rounded-3xl text-left border-2 transition-all flex flex-col justify-between gap-3 bg-gradient-to-br ${item.cardBg} ${
                isSelected
                  ? `${item.activeBorder} shadow-md scale-[1.01]`
                  : 'border-[#F3DCE4]/80 opacity-85 hover:opacity-100 hover:border-[#F9A8D4]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="w-11 h-11 rounded-2xl bg-white/90 border border-white flex items-center justify-center text-2xl shadow-xs">
                  {item.emoji}
                </span>
                {isSelected && (
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${item.badgeClass}`}
                  >
                    Đang chọn
                  </span>
                )}
              </div>

              <div>
                <p className="font-bold text-sm sm:text-base text-[#2B342D]">{item.label}</p>
                <p className="text-xs font-semibold text-[#5C6B5F] mt-0.5">{item.tag}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Visual Tier Ratio Pill Bar + Collapsible Explanation Accordion */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-[#FFFDF8] border border-[#F3DCE4] text-xs">
          <span className="font-bold text-[#2B342D]">Tỷ lệ vàng gợi ý</span>
          <div className="flex items-center gap-2 font-mono font-bold">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FEF9C3] text-[#854D0E] border border-[#FDE047]">
              Đầu {currentTemplate.recommendedTiers.top}%
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FCE7F3] text-[#BE185D] border border-[#F9A8D4]">
              Giữa {currentTemplate.recommendedTiers.heart}%
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
              Cuối {currentTemplate.recommendedTiers.base}%
            </span>
          </div>
        </div>

        <SpringAccordion
          title={`Xem ghi chú ${currentTemplate.title}`}
          icon={<Info className="w-4 h-4 text-[#DB2777]" />}
          tone="sakura"
        >
          <p className="leading-relaxed">{currentTemplate.description}</p>
        </SpringAccordion>
      </div>
    </div>
  );
};
