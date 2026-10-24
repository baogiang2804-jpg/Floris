import React from 'react';
import { Flower2, Sun, CloudRain, Snowflake, Sparkles } from 'lucide-react';
import { SEASONAL_TEMPLATES, SeasonalTemplate } from '../data/perfumeData';

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
      label: 'Mùa Xuân (Spring)',
      tag: 'Tươi mới • Hoa cỏ',
      icon: Flower2,
      color: 'from-pink-500/20 to-emerald-500/20 border-pink-500/40 text-pink-300',
      activeBorder: 'border-pink-500 shadow-pink-500/10',
      iconColor: 'text-pink-400',
    },
    {
      key: 'summer' as const,
      label: 'Mùa Hè (Summer)',
      tag: 'Sảng khoái • Cam chanh',
      icon: Sun,
      color: 'from-amber-500/20 to-cyan-500/20 border-amber-500/40 text-amber-300',
      activeBorder: 'border-amber-400 shadow-amber-500/10',
      iconColor: 'text-amber-400',
    },
    {
      key: 'autumn' as const,
      label: 'Mùa Thu (Autumn)',
      tag: 'Gỗ ấm • Hoài niệm',
      icon: CloudRain,
      color: 'from-orange-500/20 to-amber-700/20 border-orange-500/40 text-orange-300',
      activeBorder: 'border-orange-500 shadow-orange-500/10',
      iconColor: 'text-orange-400',
    },
    {
      key: 'winter' as const,
      label: 'Mùa Đông (Winter)',
      tag: 'Hổ phách • Gỗ quý',
      icon: Snowflake,
      color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/40 text-blue-300',
      activeBorder: 'border-blue-400 shadow-blue-500/10',
      iconColor: 'text-blue-400',
    },
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 backdrop-blur-sm shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-amber-400/90 font-semibold">
            Bước 1: Bối Cảnh Khí Hậu
          </span>
          <h2 className="text-lg font-serif font-bold text-slate-100">
            Chọn Mùa & Định Hướng Nốt Hương
          </h2>
        </div>

        <button
          onClick={onApplySeasonalTemplate}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-medium border border-amber-500/30 transition-all self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Tải công thức mẫu {currentTemplate.title}</span>
        </button>
      </div>

      {/* Grid of Season Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
        {seasonsList.map((item) => {
          const isSelected = selectedSeason === item.key;
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelectSeason(item.key)}
              className={`p-3.5 sm:p-4 rounded-xl text-left border transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? `bg-slate-800/90 ${item.activeBorder} shadow-lg ring-1 ring-amber-400/30`
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center bg-slate-900/80 border border-slate-800 ${item.iconColor}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {isSelected && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                    Đang chọn
                  </span>
                )}
              </div>

              <div>
                <p className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {item.label}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{item.tag}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Seasonal guide snippet */}
      <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <p className="text-slate-300 leading-relaxed">
          <strong className="text-amber-400">{currentTemplate.title}:</strong>{' '}
          {currentTemplate.description}
        </p>

        <div className="flex items-center gap-2 font-mono shrink-0 text-[11px] text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <span>Tỷ lệ vàng gợi ý:</span>
          <span className="text-amber-300 font-semibold">{currentTemplate.recommendedTiers.top}% Đầu</span>
          <span>•</span>
          <span className="text-rose-300 font-semibold">{currentTemplate.recommendedTiers.heart}% Giữa</span>
          <span>•</span>
          <span className="text-emerald-300 font-semibold">{currentTemplate.recommendedTiers.base}% Cuối</span>
        </div>
      </div>
    </div>
  );
};
