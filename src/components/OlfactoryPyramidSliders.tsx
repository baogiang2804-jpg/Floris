import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Droplet,
  Layers,
  Undo2,
  History,
  RotateCcw,
  Clock,
  Trash2,
  ChevronDown,
  Plus,
  Minus,
  Info,
} from 'lucide-react';
import { INGREDIENT_CATALOG, PerfumeIngredient } from '../data/perfumeData';
import { CalculatedIngredient, FormulaSlot } from '../utils/perfumeCalculations';
import { EditHistorySnapshot } from '../types/history';
import { ScentFamilyVisualBadge } from './SpringDecorations';

interface OlfactoryPyramidSlidersProps {
  slots: FormulaSlot[];
  calculatedIngredients: CalculatedIngredient[];
  totalPercentage: number;
  isValidTotal: boolean;
  difference: number;
  tierTotals: { top: number; heart: number; base: number };
  totalVolume: number;
  editHistory: EditHistorySnapshot[];
  canUndo: boolean;
  onUndo: () => void;
  onRestoreHistorySnapshot: (snapshot: EditHistorySnapshot) => void;
  onClearHistory: () => void;
  customIngredients?: Record<'top' | 'heart' | 'base', PerfumeIngredient[]>;
  onOpenAddCustomIngredient: (slotKey: FormulaSlot['key'], tier: 'top' | 'heart' | 'base') => void;
  onUpdateSlotPercentage: (key: FormulaSlot['key'], value: number) => void;
  onUpdateSlotIngredient: (key: FormulaSlot['key'], ingredientId: string) => void;
  onUpdateSlotCustomName: (key: FormulaSlot['key'], customName: string) => void;
  onAutoBalance: () => void;
  onResetDefault: () => void;
}

export const OlfactoryPyramidSliders: React.FC<OlfactoryPyramidSlidersProps> = ({
  slots,
  calculatedIngredients,
  totalPercentage,
  isValidTotal,
  difference,
  tierTotals,
  totalVolume,
  editHistory,
  canUndo,
  onUndo,
  onRestoreHistorySnapshot,
  onClearHistory,
  customIngredients = { top: [], heart: [], base: [] },
  onOpenAddCustomIngredient,
  onUpdateSlotPercentage,
  onUpdateSlotIngredient,
  onAutoBalance,
  onResetDefault,
}) => {
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const [openDescMap, setOpenDescMap] = useState<Record<string, boolean>>({});

  const tiersConfig = [
    {
      tier: 'top' as const,
      emoji: '🌼',
      label: 'Tầng Đầu',
      shortRole: '15–30 phút',
      slotKeys: ['top1', 'top2'] as const,
      subtotal: tierTotals.top,
      recommended: '20–40%',
      wrapClass: 'bg-gradient-to-br from-[#FFFDF2] to-[#FEF9C3]/55 border-[#FDE68A]',
      badgeClass: 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]',
      sliderFillHex: '#F59E0B',
      sliderTrackHex: '#FEF3C7',
    },
    {
      tier: 'heart' as const,
      emoji: '🌸',
      label: 'Tầng Giữa',
      shortRole: '2–4 giờ',
      slotKeys: ['heart1', 'heart2'] as const,
      subtotal: tierTotals.heart,
      recommended: '30–50%',
      wrapClass: 'bg-gradient-to-br from-[#FFF5F8] to-[#FCE7F3]/60 border-[#FBCFE8]',
      badgeClass: 'bg-[#FCE7F3] text-[#BE185D] border-[#F9A8D4]',
      sliderFillHex: '#EC4899',
      sliderTrackHex: '#FCE7F3',
    },
    {
      tier: 'base' as const,
      emoji: '🌿',
      label: 'Tầng Cuối',
      shortRole: '6–12+ giờ',
      slotKeys: ['base1', 'base2'] as const,
      subtotal: tierTotals.base,
      recommended: '20–30%',
      wrapClass: 'bg-gradient-to-br from-[#F4FDF7] to-[#DCFCE7]/55 border-[#BBF7D0]',
      badgeClass: 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]',
      sliderFillHex: '#22C55E',
      sliderTrackHex: '#DCFCE7',
    },
  ];

  return (
    <div className="spring-card p-4 sm:p-6 space-y-5">
      {/* Compact Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="px-3 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] text-xs font-bold border border-[#FCD34D] whitespace-nowrap">
            Bước 3 · 3 tầng hương
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-[#2B342D] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#EC4899] shrink-0" />
            <span>Chỉnh tỷ lệ pha chế</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center sm:flex-wrap gap-2 relative w-full lg:w-auto">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            type="button"
            className={`text-xs px-3 py-2 sm:py-1.5 rounded-2xl border transition-all flex items-center justify-center gap-1.5 font-bold ${
              canUndo
                ? 'bg-[#FFFDF0] hover:bg-[#FEF3C7] text-[#92400E] border-[#FDE68A] active:scale-95'
                : 'bg-[#F9FAFB] text-[#9CA3AF] border-[#E5E7EB] cursor-not-allowed'
            }`}
            title="Hoàn tác (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5 shrink-0" />
            <span>Hoàn tác</span>
            {editHistory.length > 0 && (
              <span className="text-[10px] font-mono px-1.5 rounded-full bg-[#FDE68A] text-[#92400E]">
                {editHistory.length}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowHistoryDropdown((prev) => !prev)}
              type="button"
              className={`w-full text-xs px-3 py-2 sm:py-1.5 rounded-2xl border transition-all flex items-center justify-center gap-1 font-bold ${
                showHistoryDropdown
                  ? 'bg-[#FCE7F3] text-[#BE185D] border-[#F472B6]'
                  : 'bg-white hover:bg-[#FFF5F8] text-[#4A4D48] border-[#F3DCE4]'
              }`}
            >
              <History className="w-3.5 h-3.5 text-[#DB2777] shrink-0" />
              <span>Lịch sử ({editHistory.length}/5)</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showHistoryDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showHistoryDropdown && (
              <div className="absolute right-0 top-full mt-2 w-72 sm:w-96 rounded-3xl bg-white border-2 border-[#FBCFE8] shadow-xl p-4 z-40 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#F3DCE4]">
                  <span className="text-xs font-bold text-[#2B342D] flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-[#DB2777]" />
                    5 bước gần nhất
                  </span>
                  {editHistory.length > 0 && (
                    <button
                      onClick={() => {
                        onClearHistory();
                        setShowHistoryDropdown(false);
                      }}
                      className="text-[11px] text-[#BE185D] hover:underline flex items-center gap-1 font-bold"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Xóa</span>
                    </button>
                  )}
                </div>

                {editHistory.length === 0 ? (
                  <p className="py-4 text-center text-xs text-[#5C6B5F]">
                    Kéo thanh trượt để tự lưu lịch sử.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {editHistory.map((snapshot, idx) => (
                      <div
                        key={snapshot.id}
                        className="p-2.5 rounded-2xl bg-[#FFFDF8] border border-[#F3DCE4] flex items-start justify-between gap-2"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 text-[10px] font-mono text-[#5C6B5F]">
                            <span className="px-1.5 py-0.5 rounded-full bg-[#FCE7F3] text-[#BE185D] font-bold">
                              -{idx + 1}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {snapshot.timestamp}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-[#2B342D]">{snapshot.actionSummary}</p>
                        </div>

                        <button
                          onClick={() => {
                            onRestoreHistorySnapshot(snapshot);
                            setShowHistoryDropdown(false);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-[#DCFCE7] hover:bg-[#BBF7D0] text-[#15803D] text-[11px] font-bold shrink-0"
                        >
                          Khôi phục
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={onResetDefault}
            type="button"
            className="text-xs text-[#4A4D48] hover:text-[#2B342D] px-3 py-2 sm:py-1.5 rounded-2xl border border-[#F3DCE4] bg-white hover:bg-[#FFF5F8] transition-all flex items-center justify-center gap-1.5 font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#5C6B5F]" />
            <span>Mặc định</span>
          </button>

          <button
            onClick={onAutoBalance}
            type="button"
            className="text-xs px-4 py-2 sm:py-1.5 rounded-2xl bg-gradient-to-r from-[#EC4899] to-[#F472B6] hover:from-[#DB2777] hover:to-[#EC4899] text-white transition-all flex items-center justify-center gap-1.5 font-bold shadow-xs active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Cân bằng 100%</span>
          </button>
        </div>
      </div>

      {/* Live Visual Ratio Validation Bar */}
      <div
        className={`p-4 rounded-3xl border-2 transition-all space-y-2.5 ${
          isValidTotal
            ? 'bg-[#ECFDF3] border-[#86EFAC] text-[#14532D]'
            : 'bg-[#FFFBEB] border-[#FCD34D] text-[#78350F]'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            {isValidTotal ? (
              <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0" />
            )}
            <p className="font-bold text-sm">
              {isValidTotal
                ? `Tổng chuẩn 100% · Sẵn sàng pha ${totalVolume} mL`
                : difference > 0
                ? `Đang đạt ${totalPercentage}% · Còn thiếu ${difference}%`
                : `Đang đạt ${totalPercentage}% · Dư ${Math.abs(difference)}%`}
            </p>
          </div>

          {!isValidTotal && (
            <button
              onClick={onAutoBalance}
              type="button"
              className="px-4 py-2 rounded-2xl bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold text-xs transition-all shadow-xs active:scale-95 whitespace-nowrap"
            >
              Cân 100% ngay
            </button>
          )}
        </div>

        {/* Stacked Tier Progress Bar */}
        <div className="w-full bg-white rounded-full h-3.5 overflow-hidden flex border border-black/5 shadow-inner">
          <div
            style={{ width: `${Math.min(100, tierTotals.top)}%` }}
            className="bg-[#FACC15] transition-all duration-300"
            title={`Tầng đầu: ${tierTotals.top}%`}
          />
          <div
            style={{ width: `${Math.min(100, tierTotals.heart)}%` }}
            className="bg-[#F472B6] transition-all duration-300"
            title={`Tầng giữa: ${tierTotals.heart}%`}
          />
          <div
            style={{ width: `${Math.min(100, tierTotals.base)}%` }}
            className="bg-[#4ADE80] transition-all duration-300"
            title={`Tầng cuối: ${tierTotals.base}%`}
          />
        </div>
      </div>

      {/* 3 Tiers Grid */}
      <div className="flex flex-col gap-5">
        {tiersConfig.map((tierGroup) => (
          <div
            key={tierGroup.tier}
            className={`p-4 sm:p-5 rounded-3xl border-2 flex flex-col gap-4 ${tierGroup.wrapClass}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-black/5">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${tierGroup.badgeClass}`}>
                  {tierGroup.emoji} {tierGroup.label}
                </span>
                <span className="text-xs font-semibold text-[#5C6B5F]">
                  {tierGroup.shortRole}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-[#5C6B5F]">Gợi ý {tierGroup.recommended}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-white font-bold text-[#2B342D] border border-black/10">
                  {tierGroup.subtotal}%
                </span>
              </div>
            </div>

            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4">
              {tierGroup.slotKeys.map((slotKey, idx) => {
                const slot = slots.find((s) => s.key === slotKey)!;
                const calculated = calculatedIngredients.find((c) => c.slotKey === slotKey)!;
                const catalogOptions = INGREDIENT_CATALOG[tierGroup.tier];
                const sliderFillPct = Math.min(100, Math.round((slot.percentage / 50) * 100));
                const activeItem =
                  customIngredients[tierGroup.tier]?.find((i) => i.id === slot.ingredientId) ||
                  INGREDIENT_CATALOG[tierGroup.tier].find((i) => i.id === slot.ingredientId);
                const isDescOpen = !!openDescMap[slotKey];

                return (
                  <div
                    key={slotKey}
                    className="p-4 rounded-3xl bg-white/95 border border-[#F3DCE4] flex flex-col gap-3.5 shadow-xs min-w-0"
                  >
                    {/* Header: Slot Title + Visual Scent Icon Badge */}
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <label className="text-xs sm:text-sm font-bold text-[#2B342D] flex items-center gap-2 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-[#FCE7F3] text-[#BE185D] text-xs font-mono flex items-center justify-center font-bold shrink-0">
                          {slot.slotNumber}
                        </span>
                        <span className="truncate">Nguyên liệu {idx + 1}</span>
                      </label>

                      <ScentFamilyVisualBadge
                        scentFamily={calculated.scentFamily}
                        name={calculated.name}
                      />
                    </div>

                    {/* Dropdown + Info Toggle */}
                    <div className="flex items-center gap-2 min-w-0">
                      <select
                        value={slot.ingredientId}
                        onChange={(e) => {
                          if (e.target.value === '__add_custom__') {
                            onOpenAddCustomIngredient(slotKey, tierGroup.tier);
                          } else {
                            onUpdateSlotIngredient(slotKey, e.target.value);
                          }
                        }}
                        className="flex-1 min-w-0 w-full px-3 sm:px-3.5 py-2.5 bg-[#FFFDF8] border border-[#EBC3D1] rounded-2xl text-xs sm:text-sm font-bold text-[#2B342D] focus:outline-none focus:ring-2 focus:ring-[#F472B6]/40 truncate"
                      >
                        <optgroup label="Nguyên liệu chuẩn">
                          {catalogOptions.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </optgroup>

                        {customIngredients[tierGroup.tier] &&
                          customIngredients[tierGroup.tier].length > 0 && (
                            <optgroup label="Nguyên liệu tự thêm">
                              {customIngredients[tierGroup.tier].map((item) => (
                                <option key={item.id} value={item.id}>
                                  ⭐ {item.name}
                                </option>
                              ))}
                            </optgroup>
                          )}

                        <option value="__add_custom__">✨ + Thêm nguyên liệu mới...</option>
                      </select>

                      <button
                        type="button"
                        onClick={() =>
                          setOpenDescMap((prev) => ({ ...prev, [slotKey]: !prev[slotKey] }))
                        }
                        className="w-10 h-10 rounded-2xl bg-[#FFF5F8] hover:bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] flex items-center justify-center shrink-0 transition-colors"
                        title="Xem chi tiết mùi & hóa học"
                        aria-label="Xem mô tả nguyên liệu"
                      >
                        <Info className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenAddCustomIngredient(slotKey, tierGroup.tier)}
                        className="w-10 h-10 rounded-2xl bg-[#ECFDF3] hover:bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] flex items-center justify-center shrink-0 transition-colors"
                        title="Thêm nguyên liệu tùy chỉnh"
                        aria-label="Thêm nguyên liệu tùy chỉnh"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Accordion: Description only visible on click */}
                    {isDescOpen && activeItem && (
                      <div className="p-3 rounded-2xl bg-[#FFFDF8] border border-[#F3DCE4] text-xs text-[#4A4D48] space-y-1">
                        <p className="font-semibold text-[#2B342D]">{activeItem.scientificName}</p>
                        <p className="leading-relaxed">{activeItem.description}</p>
                        {activeItem.chemicalCompounds && (
                          <p className="font-mono text-[11px] text-[#9D174D]">
                            {activeItem.chemicalCompounds}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Slider & Touch Steppers */}
                    <div className="p-3.5 rounded-2xl bg-[#FFFDF8] border border-[#F6DCE5] space-y-3">
                      <div className="grid grid-cols-5 sm:flex items-center justify-between gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateSlotPercentage(slotKey, Math.max(0, slot.percentage - 5))
                          }
                          className="min-h-[40px] sm:min-h-[34px] px-2 rounded-xl bg-[#FFF5F8] hover:bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] font-mono text-xs font-bold flex items-center justify-center"
                        >
                          -5%
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateSlotPercentage(slotKey, Math.max(0, slot.percentage - 1))
                          }
                          className="min-h-[40px] sm:min-h-[34px] px-2 rounded-xl bg-[#ECFDF3] hover:bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0] flex items-center justify-center"
                          aria-label="Giảm 1%"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <input
                          type="number"
                          min={0}
                          max={60}
                          step={1}
                          value={slot.percentage}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val)) {
                              onUpdateSlotPercentage(slotKey, Math.max(0, Math.min(100, val)));
                            }
                          }}
                          aria-label={`Tỉ lệ % cho ${calculated.name}`}
                          className="w-full sm:w-16 min-h-[40px] sm:min-h-[34px] bg-white border-2 border-[#F472B6] rounded-xl text-center font-mono text-sm text-[#2B342D] font-bold focus:outline-none"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            onUpdateSlotPercentage(slotKey, Math.min(100, slot.percentage + 1))
                          }
                          className="min-h-[40px] sm:min-h-[34px] px-2 rounded-xl bg-[#ECFDF3] hover:bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0] flex items-center justify-center"
                          aria-label="Tăng 1%"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateSlotPercentage(slotKey, Math.min(100, slot.percentage + 5))
                          }
                          className="min-h-[40px] sm:min-h-[34px] px-2 rounded-xl bg-[#FFFDF0] hover:bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] font-mono text-xs font-bold flex items-center justify-center"
                        >
                          +5%
                        </button>
                      </div>

                      <div className="py-1">
                        <input
                          type="range"
                          min={0}
                          max={50}
                          step={1}
                          value={slot.percentage}
                          onChange={(e) =>
                            onUpdateSlotPercentage(slotKey, parseInt(e.target.value, 10))
                          }
                          style={{
                            background: `linear-gradient(to right, ${tierGroup.sliderFillHex} 0%, ${tierGroup.sliderFillHex} ${sliderFillPct}%, ${tierGroup.sliderTrackHex} ${sliderFillPct}%, ${tierGroup.sliderTrackHex} 100%)`,
                          }}
                          className="pyramid-touch-slider w-full cursor-pointer"
                        />
                      </div>

                      {/* Compact numeric badges */}
                      <div className="flex items-center justify-between gap-2 text-xs font-mono pt-1 border-t border-black/5">
                        <span className="flex items-center gap-1 text-[#15803D] font-bold">
                          <Droplet className="w-3.5 h-3.5 text-[#16A34A]" />
                          {calculated.volumeMl} mL · {calculated.drops} giọt
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#FCE7F3] text-[#BE185D] font-bold">
                          {calculated.finalProductConcentrationPercent}% thành phẩm
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
