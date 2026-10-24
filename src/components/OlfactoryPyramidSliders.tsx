import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Info,
  Droplet,
  Layers,
  ShieldAlert,
  Undo2,
  History,
  RotateCcw,
  Clock,
  Trash2,
  ChevronDown,
  Plus,
  Minus,
} from 'lucide-react';
import { INGREDIENT_CATALOG, PerfumeIngredient } from '../data/perfumeData';
import { CalculatedIngredient, FormulaSlot } from '../utils/perfumeCalculations';
import { EditHistorySnapshot } from '../types/history';

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
  onUpdateSlotCustomName,
  onAutoBalance,
  onResetDefault,
}) => {
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);

  const tiersConfig = [
    {
      tier: 'top' as const,
      label: 'Tầng Hương Đầu (Top Notes)',
      slotKeys: ['top1', 'top2'] as const,
      subtotal: tierTotals.top,
      recommended: '20 - 30%',
      role: 'Ấn tượng ban đầu, bốc hơi nhanh (15 - 30 phút)',
      borderColor: 'border-yellow-500/40',
      badgeBg: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
      barColor: 'bg-yellow-500',
      sliderTrackHex: '#eab308',
    },
    {
      tier: 'heart' as const,
      label: 'Tầng Hương Giữa (Heart/Middle Notes)',
      slotKeys: ['heart1', 'heart2'] as const,
      subtotal: tierTotals.heart,
      recommended: '40 - 50%',
      role: 'Trái tim và linh hồn của công thức, bền mùi (2 - 4 giờ)',
      borderColor: 'border-rose-500/40',
      badgeBg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
      barColor: 'bg-rose-500',
      sliderTrackHex: '#f43f5e',
    },
    {
      tier: 'base' as const,
      label: 'Tầng Hương Cuối (Base Notes)',
      slotKeys: ['base1', 'base2'] as const,
      subtotal: tierTotals.base,
      recommended: '20 - 30%',
      role: 'Lớp nền vững chắc, neo giữ hương thơm (6 - 12+ giờ)',
      borderColor: 'border-amber-700/40',
      badgeBg: 'bg-amber-600/10 text-amber-300 border-amber-600/30',
      barColor: 'bg-amber-600',
      sliderTrackHex: '#d97706',
    },
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-sm shadow-xl">
      {/* Section Header - Stacked on Mobile */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 mb-5">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-amber-400/90 font-semibold">
            Bước 3: Kim Tự Tháp 3 Tầng & 6 Nguyên Liệu
          </span>
          <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-100 flex items-center gap-2 mt-0.5">
            <Layers className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Điều Chỉnh Tỉ Lệ (%) & Tính Thể Tích (mL)</span>
          </h2>
        </div>

        {/* Action Controls - Stacked Grid on Mobile for easy finger tap */}
        <div className="grid grid-cols-2 sm:flex sm:items-center sm:flex-wrap gap-2 relative w-full lg:w-auto">
          {/* Quick Undo Button */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            type="button"
            className={`text-xs px-3 py-2.5 sm:py-1.5 rounded-xl sm:rounded-lg border transition-all flex items-center justify-center gap-1.5 font-medium shadow-sm ${
              canUndo
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/40 hover:border-amber-400 active:scale-95'
                : 'bg-slate-950/60 text-slate-600 border-slate-800 cursor-not-allowed'
            }`}
            title={canUndo ? 'Hoàn tác bước gần nhất (Phím tắt: Ctrl + Z)' : 'Chưa có bước chỉnh sửa nào để hoàn tác'}
          >
            <Undo2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Hoàn tác</span>
            {editHistory.length > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300">
                {editHistory.length}
              </span>
            )}
          </button>

          {/* History Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowHistoryDropdown((prev) => !prev)}
              type="button"
              className={`w-full text-xs px-3 py-2.5 sm:py-1.5 rounded-xl sm:rounded-lg border transition-all flex items-center justify-center gap-1 font-medium ${
                showHistoryDropdown
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-950/80 hover:bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
              title="Xem 5 phiên bản chỉnh sửa gần nhất đã lưu trong localStorage"
            >
              <History className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Lịch sử ({editHistory.length}/5)</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showHistoryDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu showing up to 5 recent edit versions */}
            {showHistoryDropdown && (
              <div className="absolute right-0 top-full mt-2 w-72 sm:w-96 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-3 z-40 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-mono font-semibold text-slate-200 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-cyan-400" />
                    5 Bước Chỉnh Sửa Gần Nhất
                  </span>
                  {editHistory.length > 0 && (
                    <button
                      onClick={() => {
                        onClearHistory();
                        setShowHistoryDropdown(false);
                      }}
                      className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Xóa lịch sử</span>
                    </button>
                  )}
                </div>

                {editHistory.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500">
                    Chưa có lịch sử chỉnh sửa nào trong phiên làm việc. Hãy thử kéo một thanh trượt để ghi lại bước thay đổi.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {editHistory.map((snapshot, idx) => (
                      <div
                        key={snapshot.id}
                        className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 transition-all flex items-start justify-between gap-2"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Bước -{idx + 1}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {snapshot.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-slate-200 font-medium">
                            {snapshot.actionSummary}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                            <span>Đầu: {snapshot.tierTotals.top}%</span>
                            <span>•</span>
                            <span>Giữa: {snapshot.tierTotals.heart}%</span>
                            <span>•</span>
                            <span>Cuối: {snapshot.tierTotals.base}%</span>
                            <span className="text-amber-400 font-bold ml-1">
                              ({snapshot.totalPercentage}%)
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            onRestoreHistorySnapshot(snapshot);
                            setShowHistoryDropdown(false);
                          }}
                          className="px-2 py-1 rounded bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 text-[11px] font-medium transition-all shrink-0 active:scale-95"
                          title="Quay lại trạng thái phiên bản này"
                        >
                          Khôi phục
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 text-center font-mono">
                  Được tự động lưu vào localStorage (tối đa 5 phiên bản gần nhất)
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onResetDefault}
            type="button"
            className="text-xs text-slate-300 hover:text-slate-100 px-3 py-2.5 sm:py-1.5 rounded-xl sm:rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/60 transition-all flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Mặc định</span>
          </button>

          <button
            onClick={onAutoBalance}
            type="button"
            className="text-xs px-3 py-2.5 sm:py-1.5 rounded-xl sm:rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all flex items-center justify-center gap-1.5 font-medium shadow-sm active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Cân Bằng 100%</span>
          </button>
        </div>
      </div>

      {/* Validation Banner (CẢNH BÁO KHI TỔNG KHÔNG HỢP LỆ) */}
      <div
        className={`p-4 rounded-xl border mb-6 transition-all ${
          isValidTotal
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
            : difference > 0
            ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
            : 'bg-rose-950/40 border-rose-500/60 text-rose-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            {isValidTotal ? (
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
            )}

            <div>
              <p className="font-semibold text-sm">
                {isValidTotal && (
                  <span>✓ Tổng tỉ lệ chuẩn xác 100.0% — Công thức đạt chuẩn hợp lệ!</span>
                )}
                {!isValidTotal && difference > 0 && (
                  <span>
                    ⚠️ CẢNH BÁO: Tổng tỉ lệ hiện tại là {totalPercentage}% (Còn thiếu{' '}
                    <strong className="underline decoration-amber-400">{difference}%</strong>).
                  </span>
                )}
                {!isValidTotal && difference < 0 && (
                  <span>
                    ⛔ CẢNH BÁO: Tổng tỉ lệ vượt quá 100% ({totalPercentage}%, dư{' '}
                    <strong className="underline decoration-rose-400">
                      {Math.abs(difference)}%
                    </strong>
                    ).
                  </span>
                )}
              </p>
              <p className="text-xs opacity-80 mt-0.5">
                {isValidTotal
                  ? `Sẵn sàng pha chế cho bình ${totalVolume} mL. Các thông số mL và giọt đã được tính toán đồng bộ.`
                  : 'Quy tắc pha chế nước hoa yêu cầu tổng hợp hương phải đạt đúng 100% trước khi xuất công thức và phân tích AI.'}
              </p>
            </div>
          </div>

          {!isValidTotal && (
            <button
              onClick={onAutoBalance}
              type="button"
              className="w-full sm:w-auto shrink-0 px-4 py-2.5 sm:py-2 rounded-xl sm:rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95 text-center"
            >
              Cân Bằng Về 100% Ngay
            </button>
          )}
        </div>

        {/* Total Progress Bar */}
        <div className="mt-3 w-full bg-slate-950/80 rounded-full h-3 sm:h-2.5 overflow-hidden flex border border-slate-800">
          <div
            style={{ width: `${Math.min(100, tierTotals.top)}%` }}
            className="bg-yellow-400 transition-all duration-300"
            title={`Tầng đầu: ${tierTotals.top}%`}
          />
          <div
            style={{ width: `${Math.min(100, tierTotals.heart)}%` }}
            className="bg-rose-500 transition-all duration-300"
            title={`Tầng giữa: ${tierTotals.heart}%`}
          />
          <div
            style={{ width: `${Math.min(100, tierTotals.base)}%` }}
            className="bg-amber-600 transition-all duration-300"
            title={`Tầng cuối: ${tierTotals.base}%`}
          />
        </div>
      </div>

      {/* 3 Tiers Container — Stacked Cards on Mobile */}
      <div className="flex flex-col gap-6">
        {tiersConfig.map((tierGroup) => {
          return (
            <div
              key={tierGroup.tier}
              className={`p-3.5 sm:p-5 rounded-2xl bg-slate-950/40 border ${tierGroup.borderColor} relative flex flex-col gap-4`}
            >
              {/* Tier Header — Stacked on Mobile, Row on Tablet/Desktop */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5">
                  <span
                    className={`self-start text-xs font-mono font-semibold px-2.5 py-1 rounded-lg border ${tierGroup.badgeBg}`}
                  >
                    {tierGroup.label}
                  </span>
                  <span className="text-xs text-slate-400">
                    {tierGroup.role}
                  </span>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 text-xs font-mono bg-slate-900/70 sm:bg-transparent px-3 py-2 sm:p-0 rounded-xl border border-slate-800/80 sm:border-0">
                  <span className="text-slate-400">
                    Khuyến nghị: <strong className="text-slate-200">{tierGroup.recommended}</strong>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-300">
                    Tổng tầng:{' '}
                    <strong
                      className={`text-sm ${
                        tierGroup.subtotal > 0 ? 'text-amber-400' : 'text-slate-500'
                      }`}
                    >
                      {tierGroup.subtotal}%
                    </strong>
                  </span>
                </div>
              </div>

              {/* 2 Ingredients in this tier — Stacked Vertical Cards on Mobile, 2 Columns on Desktop */}
              <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4">
                {tierGroup.slotKeys.map((slotKey, idx) => {
                  const slot = slots.find((s) => s.key === slotKey)!;
                  const calculated = calculatedIngredients.find((c) => c.slotKey === slotKey)!;
                  const catalogOptions = INGREDIENT_CATALOG[tierGroup.tier];
                  const sliderFillPct = Math.min(100, Math.round((slot.percentage / 50) * 100));

                  return (
                    <div
                      key={slotKey}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col gap-4 shadow-md"
                    >
                      {/* 1. Stacked Card Header & Ingredient Selector */}
                      <div className="flex flex-col gap-2.5">
                        {/* Stacked Top Title & Scent Family Badge */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                          <label className="text-xs sm:text-sm font-semibold text-slate-100 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-800 border border-amber-500/30 text-xs font-mono flex items-center justify-center text-amber-400 font-bold shrink-0">
                              #{slot.slotNumber}
                            </span>
                            <span>
                              Nguyên liệu {idx + 1} (Tầng {tierGroup.tier === 'top' ? 'Đầu' : tierGroup.tier === 'heart' ? 'Giữa' : 'Cuối'})
                            </span>
                          </label>

                          <span className="self-start sm:self-auto text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-amber-300/90">
                            {calculated.scentFamily}
                          </span>
                        </div>

                        {/* Finger-friendly Dropdown Select */}
                        <select
                          value={slot.ingredientId}
                          onChange={(e) => {
                            if (e.target.value === '__add_custom__') {
                              onOpenAddCustomIngredient(slotKey, tierGroup.tier);
                            } else {
                              onUpdateSlotIngredient(slotKey, e.target.value);
                            }
                          }}
                          className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm sm:text-xs font-medium text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        >
                          <optgroup label="Danh mục nguyên liệu tiêu chuẩn">
                            {catalogOptions.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name} — ({item.scientificName})
                              </option>
                            ))}
                          </optgroup>

                          {customIngredients[tierGroup.tier] && customIngredients[tierGroup.tier].length > 0 && (
                            <optgroup label="Nguyên liệu do bạn tự thêm">
                              {customIngredients[tierGroup.tier].map((item) => (
                                <option key={item.id} value={item.id}>
                                  ⭐ {item.name} — ({item.scientificName})
                                </option>
                              ))}
                            </optgroup>
                          )}

                          <option value="__add_custom__" className="text-amber-400 font-bold bg-slate-900">
                            ✨ + Thêm nguyên liệu của riêng bạn...
                          </option>
                        </select>

                        {/* Stacked Full-Width Custom Ingredient Button on Mobile */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenAddCustomIngredient(slotKey, tierGroup.tier)}
                            className="w-full sm:w-auto py-2 sm:py-1 px-3 sm:px-0 rounded-xl sm:rounded-none bg-amber-500/10 sm:bg-transparent border border-amber-500/30 sm:border-0 text-xs sm:text-[11px] text-amber-300 hover:text-amber-200 flex items-center justify-center sm:justify-start gap-1.5 font-medium transition-all active:scale-98"
                            title="Mở màn hình thêm nguyên liệu tùy chỉnh"
                          >
                            <Plus className="w-3.5 h-3.5 shrink-0" />
                            <span>Thêm nguyên liệu của riêng bạn</span>
                          </button>

                          {customIngredients[tierGroup.tier] && customIngredients[tierGroup.tier].length > 0 && (
                            <span className="text-[10px] font-mono text-slate-500 text-center sm:text-right">
                              ({customIngredients[tierGroup.tier].length} nguyên liệu tự tạo)
                            </span>
                          )}
                        </div>

                        <p className="text-xs sm:text-[11px] text-slate-400 italic leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                          {(customIngredients[tierGroup.tier]?.find((i) => i.id === slot.ingredientId) ||
                            INGREDIENT_CATALOG[tierGroup.tier].find((i) => i.id === slot.ingredientId))
                            ?.description}
                        </p>
                      </div>

                      {/* 2. Stacked Finger-Friendly Slider & Touch Stepper Card */}
                      <div className="flex flex-col gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-950/90 border border-slate-800/90">
                        {/* Stacked Top Row: Label + Big Touch Stepper Controls */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="flex items-center justify-between sm:justify-start gap-2">
                            <span className="text-xs font-medium text-slate-300">
                              Kéo trượt tỉ lệ hương:
                            </span>
                            <span className="sm:hidden text-base font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                              {slot.percentage}%
                            </span>
                          </div>

                          {/* Touch Stepper Buttons + Number Input (Easy to tap with thumbs on mobile) */}
                          <div className="grid grid-cols-5 sm:flex items-center gap-1.5 w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateSlotPercentage(slotKey, Math.max(0, slot.percentage - 5))
                              }
                              className="min-h-[44px] sm:min-h-[36px] py-2 px-1 rounded-xl bg-[#F4EFE6] hover:bg-[#EAE2D5] active:bg-[#DFD5C5] text-[#5A6A5E] border border-[#E0D8CB] font-mono text-xs font-semibold flex items-center justify-center transition-all active:scale-95 shadow-xs"
                              title="Giảm 5%"
                            >
                              -5%
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                onUpdateSlotPercentage(slotKey, Math.max(0, slot.percentage - 1))
                              }
                              className="min-h-[44px] sm:min-h-[36px] py-2 px-1 rounded-xl bg-[#EEF5F0] hover:bg-[#E2EDE5] active:bg-[#D5E5DA] text-[#245236] border border-[#CFE2D4] font-mono text-sm font-bold flex items-center justify-center transition-all active:scale-95 shadow-xs"
                              title="Giảm 1%"
                            >
                              <Minus className="w-4 h-4 stroke-[2.5]" />
                            </button>

                            <div className="relative flex items-center justify-center">
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
                                aria-label={`Tỉ lệ phần trăm cho ${calculated.name}`}
                                className="w-full sm:w-16 min-h-[44px] sm:min-h-[36px] py-1 px-1 bg-[#FFFFFF] border-2 border-[#3B7A57] rounded-xl text-center font-mono text-sm sm:text-xs text-[#1F2F23] font-bold focus:outline-none focus:ring-2 focus:ring-[#3B7A57]/30 shadow-inner"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                onUpdateSlotPercentage(slotKey, Math.min(100, slot.percentage + 1))
                              }
                              className="min-h-[44px] sm:min-h-[36px] py-2 px-1 rounded-xl bg-[#EEF5F0] hover:bg-[#E2EDE5] active:bg-[#D5E5DA] text-[#245236] border border-[#CFE2D4] font-mono text-sm font-bold flex items-center justify-center transition-all active:scale-95 shadow-xs"
                              title="Tăng 1%"
                            >
                              <Plus className="w-4 h-4 stroke-[2.5]" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                onUpdateSlotPercentage(slotKey, Math.min(100, slot.percentage + 5))
                              }
                              className="min-h-[44px] sm:min-h-[36px] py-2 px-1 rounded-xl bg-[#FFF8EB] hover:bg-[#FDEFD2] active:bg-[#FAE3B8] text-[#8C6212] border border-[#F2DEB5] font-mono text-xs font-semibold flex items-center justify-center transition-all active:scale-95 shadow-xs"
                              title="Tăng 5%"
                            >
                              +5%
                            </button>
                          </div>
                        </div>

                        {/* Finger-friendly Range Slider Track with generous vertical padding for mobile touch */}
                        <div className="py-2 px-1">
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
                              background: `linear-gradient(to right, ${tierGroup.sliderTrackHex} 0%, ${tierGroup.sliderTrackHex} ${sliderFillPct}%, #1e293b ${sliderFillPct}%, #1e293b 100%)`,
                            }}
                            className="pyramid-touch-slider w-full cursor-pointer"
                          />
                          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2 px-0.5 select-none">
                            <span>0%</span>
                            <span>10%</span>
                            <span>20%</span>
                            <span>30%</span>
                            <span>40%</span>
                            <span>50%</span>
                          </div>
                        </div>

                        {/* 3. Stacked Volume (mL), Final Product Concentration (%) & Drops Readout Cards on Mobile */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono pt-2 border-t border-slate-800/80">
                          <div className="flex items-center justify-between sm:justify-start gap-2 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800/90">
                            <span className="flex items-center gap-1.5 text-slate-300">
                              <Droplet className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              <span>Tinh dầu nguyên chất:</span>
                            </span>
                            <strong className="text-cyan-300 text-sm">
                              {calculated.volumeMl} mL (~{calculated.drops} giọt)
                            </strong>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-2 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800/90">
                            <span className="text-slate-400">Nồng độ thành phẩm:</span>
                            <strong className="text-amber-300 text-sm">
                              {calculated.finalProductConcentrationPercent}%
                            </strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
