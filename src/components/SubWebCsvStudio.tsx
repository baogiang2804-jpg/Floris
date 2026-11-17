import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Bookmark,
  ArrowLeft,
  Table,
  RefreshCw,
} from 'lucide-react';
import { INGREDIENT_CATALOG, PerfumeIngredient, SEASONAL_TEMPLATES } from '../data/perfumeData';
import { CalculatedIngredient, FormulaSlot } from '../utils/perfumeCalculations';
import { FormulaTableAndCsv } from './FormulaTableAndCsv';
import { ScentFamilyVisualBadge } from './SpringDecorations';

interface SubWebCsvStudioProps {
  perfumeName: string;
  onChangePerfumeName: (name: string) => void;
  selectedSeason: 'spring' | 'summer' | 'autumn' | 'winter';
  onSelectSeason: (season: 'spring' | 'summer' | 'autumn' | 'winter') => void;
  totalVolume: number;
  onChangeVolume: (vol: number) => void;
  concentrationName: string;
  concentrationPercent: number;
  onChangeConcentration: (name: string, pct: number) => void;
  slots: FormulaSlot[];
  calculatedIngredients: CalculatedIngredient[];
  tierTotals: { top: number; heart: number; base: number };
  totalPercentage: number;
  isValidTotal: boolean;
  customIngredients: Record<'top' | 'heart' | 'base', PerfumeIngredient[]>;
  onUpdateSlotPercentage: (key: FormulaSlot['key'], val: number) => void;
  onUpdateSlotIngredient: (key: FormulaSlot['key'], ingredientId: string) => void;
  onUpdateSlotCustomName: (key: FormulaSlot['key'], customName: string) => void;
  onOpenAddCustomIngredient: (slotKey: FormulaSlot['key'], tier: 'top' | 'heart' | 'base') => void;
  onAutoBalance: () => void;
  onQuickSave: () => void;
  onExportCsv: () => void;
  onImportFormulaFromCsv: (importedData: {
    perfumeName?: string;
    season?: 'spring' | 'summer' | 'autumn' | 'winter';
    totalVolume?: number;
    UpdatedSlots: { key: FormulaSlot['key']; percentage: number; customName?: string; ingredientId?: string }[];
  }) => void;
  onBackToMainWeb: () => void;
}

export const SubWebCsvStudio: React.FC<SubWebCsvStudioProps> = ({
  perfumeName,
  onChangePerfumeName,
  selectedSeason,
  onSelectSeason,
  totalVolume,
  onChangeVolume,
  concentrationName,
  concentrationPercent,
  onChangeConcentration,
  slots,
  calculatedIngredients,
  tierTotals,
  totalPercentage,
  isValidTotal,
  customIngredients,
  onUpdateSlotPercentage,
  onUpdateSlotIngredient,
  onUpdateSlotCustomName,
  onOpenAddCustomIngredient,
  onAutoBalance,
  onQuickSave,
  onExportCsv,
  onImportFormulaFromCsv,
  onBackToMainWeb,
}) => {
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const parseAndApplyCsvContent = (csvText: string, fileName: string) => {
    try {
      const cleanText = csvText.replace(/^\uFEFF/, '');
      const lines = cleanText
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (lines.length < 2) {
        setImportStatus({
          type: 'error',
          message: 'File CSV trống hoặc không đúng định dạng.',
        });
        return;
      }

      const splitCsvLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
              current += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (ch === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += ch;
          }
        }
        result.push(current.trim());
        return result;
      };

      let parsedPerfumeName: string | undefined;
      let parsedVolume: number | undefined;
      let parsedSeason: 'spring' | 'summer' | 'autumn' | 'winter' | undefined;
      const ingredientRows: { name: string; percentage: number }[] = [];

      for (let i = 0; i < lines.length; i++) {
        const cols = splitCsvLine(lines[i]);
        const joinedLower = lines[i].toLowerCase();

        if (
          joinedLower.includes('tầng hương') &&
          (joinedLower.includes('tỉ lệ') || joinedLower.includes('nguyên liệu'))
        ) {
          continue;
        }

        if (
          joinedLower.startsWith('tổng') ||
          joinedLower.startsWith('"tổng') ||
          joinedLower.includes('thông tin tổng hợp') ||
          joinedLower.includes('tên nước hoa')
        ) {
          if (joinedLower.includes('tên nước hoa') && cols[1]) {
            parsedPerfumeName = cols[1];
          }
          if (joinedLower.includes('tổng cộng') && cols[4]) {
            const v = parseFloat(cols[4]);
            if (!isNaN(v) && v >= 5) parsedVolume = Math.round(v);
          }
          continue;
        }

        if (cols.length >= 5) {
          const maybePct = parseFloat(cols[4].replace('%', '').trim());
          const ingName = cols[2];
          if (!isNaN(maybePct) && ingName) {
            ingredientRows.push({ name: ingName, percentage: Math.round(maybePct) });
            if (cols[7]) {
              const sLower = cols[7].toLowerCase();
              if (sLower.includes('xuân') || sLower.includes('spring')) parsedSeason = 'spring';
              else if (sLower.includes('hè') || sLower.includes('summer')) parsedSeason = 'summer';
              else if (sLower.includes('thu') || sLower.includes('autumn')) parsedSeason = 'autumn';
              else if (sLower.includes('đông') || sLower.includes('winter')) parsedSeason = 'winter';
            }
            if (cols[8]) {
              const v = parseFloat(cols[8]);
              if (!isNaN(v) && v >= 5) parsedVolume = Math.round(v);
            }
            continue;
          }
        }

        if (cols.length >= 2) {
          const pctCol = cols.find((c) => /^\d+(\.\d+)?%?$/.test(c.trim()));
          if (pctCol && cols[0]) {
            const p = parseFloat(pctCol.replace('%', ''));
            if (!isNaN(p)) {
              ingredientRows.push({ name: cols[0], percentage: Math.round(p) });
            }
          }
        }
      }

      if (ingredientRows.length === 0) {
        setImportStatus({
          type: 'error',
          message: 'Không tìm thấy dòng nguyên liệu hợp lệ trong file CSV.',
        });
        return;
      }

      const slotOrder: FormulaSlot['key'][] = ['top1', 'top2', 'heart1', 'heart2', 'base1', 'base2'];
      const allCatalog = [
        ...INGREDIENT_CATALOG.top,
        ...INGREDIENT_CATALOG.heart,
        ...INGREDIENT_CATALOG.base,
        ...(customIngredients.top || []),
        ...(customIngredients.heart || []),
        ...(customIngredients.base || []),
      ];

      const updatedSlots = slotOrder.map((key, idx) => {
        const row = ingredientRows[idx];
        if (!row) {
          const existing = slots.find((s) => s.key === key)!;
          return { key, percentage: existing.percentage };
        }
        const matchedCatalog = allCatalog.find(
          (item) => item.name.toLowerCase() === row.name.toLowerCase()
        );
        return {
          key,
          percentage: Math.max(0, Math.min(100, row.percentage)),
          ingredientId: matchedCatalog ? matchedCatalog.id : undefined,
          customName: matchedCatalog ? '' : row.name,
        };
      });

      onImportFormulaFromCsv({
        perfumeName: parsedPerfumeName,
        season: parsedSeason,
        totalVolume: parsedVolume,
        UpdatedSlots: updatedSlots,
      });

      setImportStatus({
        type: 'success',
        message: `Đã nhập ${Math.min(6, ingredientRows.length)} thành phần từ "${fileName}".`,
      });
    } catch {
      setImportStatus({
        type: 'error',
        message: 'Lỗi đọc file CSV. Hãy kiểm tra lại định dạng.',
      });
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        parseAndApplyCsvContent(content, file.name);
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  const concentrationPresets = [
    { name: 'Eau Fraîche', pct: 5 },
    { name: 'Eau de Cologne (EDC)', pct: 8 },
    { name: 'Eau de Toilette (EDT)', pct: 12 },
    { name: 'Eau de Parfum (EDP)', pct: 18 },
    { name: 'Extrait de Parfum', pct: 28 },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header (1 Title + 1-3 Word Pill) */}
      <div className="spring-card p-5 sm:p-6 bg-gradient-to-br from-[#FFFDF0] via-white to-[#FFF1F5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF9C3] text-[#854D0E] border border-[#FDE047]">
            📊 CSV Studio
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#2B342D] flex items-center gap-2 mt-1">
            <FileSpreadsheet className="w-6 h-6 text-[#D97706]" />
            <span>Bảng Tính &amp; Nhập Xuất CSV</span>
          </h2>
        </div>

        <button
          type="button"
          onClick={onBackToMainWeb}
          className="px-4 py-2.5 rounded-2xl bg-white hover:bg-[#FFF5F8] text-[#2B342D] border border-[#F3D5E0] text-xs font-bold flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <ArrowLeft className="w-4 h-4 text-[#EC4899]" />
          <span>Về bàn pha</span>
        </button>
      </div>

      {/* SECTION 1: IMPORT CSV */}
      <div className="spring-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold uppercase text-[#15803D]">Nhập dữ liệu</span>
            <h3 className="text-base sm:text-lg font-bold text-[#2B342D]">
              Tải File CSV Công Thức
            </h3>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs flex items-center gap-2 self-start sm:self-auto shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>Chọn file .CSV</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFileUpload(file);
              e.target.value = '';
            }
          }}
        />

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFileUpload(file);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all ${
            isDraggingOver
              ? 'border-[#16A34A] bg-[#ECFDF3]'
              : 'border-[#F3D5E0] hover:border-[#F472B6] bg-[#FFFDF8]'
          }`}
        >
          <Upload className="w-8 h-8 text-[#EC4899] mx-auto mb-2" />
          <p className="text-xs sm:text-sm font-bold text-[#2B342D]">
            Kéo thả file <code className="text-[#BE185D]">.csv</code> hoặc nhấn chọn file
          </p>
        </div>

        {importStatus && (
          <div
            className={`p-3.5 rounded-2xl border flex items-center gap-2.5 text-xs font-bold ${
              importStatus.type === 'success'
                ? 'bg-[#ECFDF3] border-[#86EFAC] text-[#15803D]'
                : 'bg-[#FFF1F2] border-[#FDA4AF] text-[#BE123C]'
            }`}
          >
            {importStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{importStatus.message}</span>
          </div>
        )}
      </div>

      {/* SECTION 2: DIRECT FORMULA TABLE ENTRY */}
      <div className="spring-card p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F5DCE4]">
          <div>
            <span className="text-[11px] font-bold uppercase text-[#BE185D]">Chỉnh nhanh</span>
            <h3 className="text-base sm:text-lg font-bold text-[#2B342D] flex items-center gap-2">
              <Table className="w-5 h-5 text-[#EC4899]" />
              <span>Bảng Định Lượng 6 Nguyên Liệu</span>
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onAutoBalance}
              className="px-3.5 py-2 rounded-2xl bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Cân 100%</span>
            </button>

            <button
              type="button"
              onClick={onQuickSave}
              className="px-3.5 py-2 rounded-2xl bg-[#ECFDF3] hover:bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] font-bold text-xs flex items-center gap-1.5"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Lưu mẫu</span>
            </button>
          </div>
        </div>

        {/* Metadata Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5C6B5F]">Tên nước hoa</label>
            <input
              type="text"
              value={perfumeName}
              onChange={(e) => onChangePerfumeName(e.target.value)}
              placeholder="Tên công thức..."
              className="w-full px-3.5 py-2 rounded-2xl bg-[#FFFDF8] border border-[#F3D5E0] text-xs font-semibold text-[#2B342D] focus:border-[#EC4899] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5C6B5F]">Mùa chủ đạo</label>
            <select
              value={selectedSeason}
              onChange={(e) =>
                onSelectSeason(e.target.value as 'spring' | 'summer' | 'autumn' | 'winter')
              }
              className="w-full px-3.5 py-2 rounded-2xl bg-[#FFFDF8] border border-[#F3D5E0] text-xs font-semibold text-[#2B342D] focus:border-[#EC4899] focus:outline-none"
            >
              <option value="spring">{SEASONAL_TEMPLATES.spring.title}</option>
              <option value="summer">{SEASONAL_TEMPLATES.summer.title}</option>
              <option value="autumn">{SEASONAL_TEMPLATES.autumn.title}</option>
              <option value="winter">{SEASONAL_TEMPLATES.winter.title}</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5C6B5F]">Thể tích (mL)</label>
            <input
              type="number"
              min={5}
              max={1000}
              value={totalVolume}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v) && v > 0) onChangeVolume(v);
              }}
              className="w-full px-3.5 py-2 rounded-2xl bg-[#FFFDF8] border border-[#F3D5E0] text-xs font-mono font-bold text-[#BE185D] focus:border-[#EC4899] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5C6B5F]">Nồng độ</label>
            <select
              value={concentrationPercent}
              onChange={(e) => {
                const pct = parseInt(e.target.value, 10);
                const found = concentrationPresets.find((c) => c.pct === pct);
                onChangeConcentration(found ? found.name : `Custom (${pct}%)`, pct);
              }}
              className="w-full px-3.5 py-2 rounded-2xl bg-[#FFFDF8] border border-[#F3D5E0] text-xs font-semibold text-[#2B342D] focus:border-[#EC4899] focus:outline-none"
            >
              {concentrationPresets.map((c) => (
                <option key={c.pct} value={c.pct}>
                  {c.name} ({c.pct}%)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 6 Ingredients Spreadsheet Table */}
        <div className="overflow-x-auto rounded-2xl border border-[#F3DCE4] bg-white">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#F3DCE4] bg-[#FFF5F8] text-[11px] font-bold text-[#5C6B5F]">
                <th className="py-2.5 px-3">Tầng</th>
                <th className="py-2.5 px-3">Nguyên liệu</th>
                <th className="py-2.5 px-3">Tên riêng</th>
                <th className="py-2.5 px-3 text-center">Tỷ lệ %</th>
                <th className="py-2.5 px-3 text-right">Định lượng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8E8EE]">
              {slots.map((slot, idx) => {
                const calc = calculatedIngredients[idx];
                const stdList = INGREDIENT_CATALOG[slot.tier];
                const custList = customIngredients[slot.tier] || [];

                return (
                  <tr key={slot.key} className="hover:bg-[#FFFDF8]">
                    <td className="py-2.5 px-3 font-bold whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] ${
                          slot.tier === 'top'
                            ? 'bg-[#FEF9C3] text-[#854D0E]'
                            : slot.tier === 'heart'
                            ? 'bg-[#FCE7F3] text-[#BE185D]'
                            : 'bg-[#DCFCE7] text-[#15803D]'
                        }`}
                      >
                        {slot.tierLabel}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 min-w-[200px]">
                      <div className="flex items-center gap-1.5">
                        <select
                          value={slot.ingredientId}
                          onChange={(e) => {
                            if (e.target.value === '__add_custom__') {
                              onOpenAddCustomIngredient(slot.key, slot.tier);
                            } else {
                              onUpdateSlotIngredient(slot.key, e.target.value);
                            }
                          }}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-[#FFFDF8] border border-[#F3D5E0] text-xs font-semibold text-[#2B342D] focus:border-[#EC4899] focus:outline-none"
                        >
                          <optgroup label="Nguyên liệu chuẩn">
                            {stdList.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name}
                              </option>
                            ))}
                          </optgroup>
                          {custList.length > 0 && (
                            <optgroup label="Nguyên liệu tự thêm">
                              {custList.map((item) => (
                                <option key={item.id} value={item.id}>
                                  ⭐ {item.name}
                                </option>
                              ))}
                            </optgroup>
                          )}
                          <option value="__add_custom__">✨ + Thêm mới...</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => onOpenAddCustomIngredient(slot.key, slot.tier)}
                          aria-label={`Thêm nguyên liệu cho ${slot.tierLabel}`}
                          className="p-1.5 rounded-xl bg-[#FFF1F5] hover:bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {calc && (
                        <div className="mt-1">
                          <ScentFamilyVisualBadge scentFamily={calc.scentFamily} name={calc.name} />
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 min-w-[150px]">
                      <input
                        type="text"
                        value={slot.customName || ''}
                        onChange={(e) => onUpdateSlotCustomName(slot.key, e.target.value)}
                        placeholder={calc?.name || 'Nhãn phụ...'}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#FFFDF8] border border-[#F3D5E0] text-xs text-[#2B342D] focus:border-[#EC4899] focus:outline-none"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="inline-flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={slot.percentage}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            onUpdateSlotPercentage(
                              slot.key,
                              isNaN(val) ? 0 : Math.max(0, Math.min(100, val))
                            );
                          }}
                          className="w-14 px-2 py-1 rounded-xl bg-[#FFF5F8] border border-[#FBCFE8] text-center font-mono font-bold text-[#BE185D] focus:outline-none"
                        />
                        <span className="font-mono text-[#5C6B5F]">%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                      <span className="text-[#15803D] font-bold">{calc?.volumeMl} mL</span>
                      <span className="text-[#5C6B5F] ml-1">(~{calc?.drops})</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-[#ECFDF3]/70 border-t border-[#BBF7D0] font-mono text-xs">
                <td colSpan={3} className="py-2.5 px-3 font-sans font-bold text-[#166534]">
                  Tổng (Đầu {tierTotals.top}% · Giữa {tierTotals.heart}% · Cuối {tierTotals.base}%)
                </td>
                <td
                  className={`py-2.5 px-3 text-center font-bold text-sm ${
                    isValidTotal ? 'text-[#15803D]' : 'text-[#D97706]'
                  }`}
                >
                  {totalPercentage}%
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-[#BE185D]">{totalVolume} mL</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* SECTION 3: QUANTITATIVE TABLE & BOTTLE */}
      <FormulaTableAndCsv
        ingredients={calculatedIngredients}
        totalVolume={totalVolume}
        concentrationName={concentrationName}
        seasonLabel={SEASONAL_TEMPLATES[selectedSeason].title}
        tierTotals={tierTotals}
        onExportCsv={onExportCsv}
        isValidTotal={isValidTotal}
      />
    </div>
  );
};
