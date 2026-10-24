import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Bookmark,
  ArrowLeft,
  FileUp,
  Table,
  RefreshCw,
} from 'lucide-react';
import { INGREDIENT_CATALOG, PerfumeIngredient, SEASONAL_TEMPLATES } from '../data/perfumeData';
import { CalculatedIngredient, FormulaSlot } from '../utils/perfumeCalculations';
import { FormulaTableAndCsv } from './FormulaTableAndCsv';

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

  // Parse uploaded CSV file and map back to formula state
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
          message: 'File CSV trống hoặc không đúng định dạng bảng công thức.',
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

      // Extract metadata if present, and collect ingredient rows
      const ingredientRows: { name: string; percentage: number }[] = [];

      for (let i = 0; i < lines.length; i++) {
        const cols = splitCsvLine(lines[i]);
        const joinedLower = lines[i].toLowerCase();

        // Skip header row
        if (
          joinedLower.includes('tầng hương') &&
          (joinedLower.includes('tỉ lệ') || joinedLower.includes('nguyên liệu'))
        ) {
          continue;
        }

        // Skip summary rows
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

        // Standard exported row: STT, Tầng Hương, Tên Nguyên Liệu, Nhóm Hương, Tỉ Lệ (%), Thể Tích (mL), Số Giọt, Mùa, Tổng Bình (mL)
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

        // Simple 2-3 column CSV fallback: Tên nguyên liệu, Tỉ lệ %
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
          message: 'Không tìm thấy dòng nguyên liệu hợp lệ trong file CSV. Hãy kiểm tra lại cột Tên nguyên liệu và Tỉ lệ (%).',
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
        message: `Đã nhập thành công ${Math.min(6, ingredientRows.length)} nguyên liệu từ file "${fileName}"!`,
      });
    } catch (err) {
      console.error(err);
      setImportStatus({
        type: 'error',
        message: 'Có lỗi khi đọc file CSV. Vui lòng kiểm tra định dạng file.',
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
    <div className="space-y-8 animate-fadeIn">
      {/* Sub-Web Banner Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-cyan-950/50 via-slate-900 to-slate-950 border border-cyan-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
              Trang Web Phụ 1 • CSV & Formula Studio
            </span>
            <span className="text-xs font-mono text-slate-400">
              Phím tắt: Ctrl+S (Lưu) • Ctrl+E (Xuất CSV) • Ctrl+Z (Hoàn tác)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100 flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-cyan-400" />
            Trung Tâm Nhập Công Thức & Xuất / Nhập File CSV
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Trang web chuyên biệt giúp bạn nhập nhanh bảng công thức nước hoa, tải file CSV từ máy tính lên để phục hồi công thức, hoặc xuất dữ liệu định lượng chuẩn Excel.
          </p>
        </div>

        <button
          type="button"
          onClick={onBackToMainWeb}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-2 self-start md:self-auto shrink-0 transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Về Web Chính (Thiết Kế)</span>
        </button>
      </div>

      {/* SECTION 1: IMPORT CSV FILE */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              Tính năng 1: Nhập dữ liệu từ file ngoài
            </span>
            <h3 className="text-base sm:text-lg font-serif font-bold text-slate-100 flex items-center gap-2">
              <FileUp className="w-5 h-5 text-cyan-400" />
              Nhập File CSV Công Thức (Import CSV)
            </h3>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 self-start sm:self-auto shadow-lg transition-all active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>Chọn File .CSV Từ Máy Tính</span>
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

        {/* Drag & Drop Zone */}
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
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDraggingOver
              ? 'border-cyan-400 bg-cyan-500/10'
              : 'border-slate-700 hover:border-cyan-500/50 bg-slate-950/60'
          }`}
        >
          <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
          <p className="text-xs sm:text-sm font-semibold text-slate-200">
            Kéo thả file <code className="text-cyan-300">.csv</code> vào đây hoặc nhấn để tải file lên
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Hỗ trợ trực tiếp file CSV đã xuất từ Floris hoặc bảng CSV gồm cột Tên nguyên liệu và Tỉ lệ %
          </p>
        </div>

        {importStatus && (
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-medium ${
              importStatus.type === 'success'
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/50 border-rose-500/40 text-rose-200'
            }`}
          >
            {importStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{importStatus.message}</span>
          </div>
        )}
      </div>

      {/* SECTION 2: DIRECT FORMULA TABLE ENTRY */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
              Tính năng 2: Nhập liệu trực tiếp
            </span>
            <h3 className="text-base sm:text-lg font-serif font-bold text-slate-100 flex items-center gap-2">
              <Table className="w-5 h-5 text-amber-400" />
              Bảng Nhập Công Thức Nước Hoa Nhanh
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onAutoBalance}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Cân bằng 100%</span>
            </button>

            <button
              type="button"
              onClick={onQuickSave}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-medium text-xs flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Lưu nhanh (Ctrl+S)</span>
            </button>
          </div>
        </div>

        {/* Metadata Inputs Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300">Tên công thức nước hoa:</label>
            <input
              type="text"
              value={perfumeName}
              onChange={(e) => onChangePerfumeName(e.target.value)}
              placeholder="Nhập tên nước hoa..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300">Mùa chủ đạo:</label>
            <select
              value={selectedSeason}
              onChange={(e) =>
                onSelectSeason(e.target.value as 'spring' | 'summer' | 'autumn' | 'winter')
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
            >
              <option value="spring">{SEASONAL_TEMPLATES.spring.title}</option>
              <option value="summer">{SEASONAL_TEMPLATES.summer.title}</option>
              <option value="autumn">{SEASONAL_TEMPLATES.autumn.title}</option>
              <option value="winter">{SEASONAL_TEMPLATES.winter.title}</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300">Tổng thể tích bình (mL):</label>
            <input
              type="number"
              min={5}
              max={1000}
              value={totalVolume}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v) && v > 0) onChangeVolume(v);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-amber-300 font-bold focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300">Nồng độ tinh dầu:</label>
            <select
              value={concentrationPercent}
              onChange={(e) => {
                const pct = parseInt(e.target.value, 10);
                const found = concentrationPresets.find((c) => c.pct === pct);
                onChangeConcentration(found ? found.name : `Custom (${pct}%)`, pct);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
            >
              {concentrationPresets.map((c) => (
                <option key={c.pct} value={c.pct}>
                  {c.name} — {c.pct}%
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 6 Ingredients Spreadsheet Input Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-mono text-slate-400 uppercase">
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">Tầng hương</th>
                <th className="py-3 px-3">Chọn nguyên liệu từ danh mục</th>
                <th className="py-3 px-3">Hoặc đặt tên tùy chỉnh</th>
                <th className="py-3 px-3 text-center">Nhập tỉ lệ (%)</th>
                <th className="py-3 px-3 text-right">Định lượng (mL / Giọt)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {slots.map((slot, idx) => {
                const calc = calculatedIngredients[idx];
                const stdList = INGREDIENT_CATALOG[slot.tier];
                const custList = customIngredients[slot.tier] || [];

                return (
                  <tr key={slot.key} className="hover:bg-slate-900/40">
                    <td className="py-3 px-3 font-mono text-amber-400 font-bold">
                      #{slot.slotNumber}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300 whitespace-nowrap">
                      {slot.tierLabel}
                    </td>
                    <td className="py-3 px-3 min-w-[220px]">
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
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                        >
                          <optgroup label="Nguyên liệu chuẩn">
                            {stdList.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name}
                              </option>
                            ))}
                          </optgroup>
                          {custList.length > 0 && (
                            <optgroup label="Nguyên liệu của bạn">
                              {custList.map((item) => (
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
                          onClick={() => onOpenAddCustomIngredient(slot.key, slot.tier)}
                          className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 shrink-0"
                          title="Thêm nguyên liệu của riêng bạn"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3 min-w-[170px]">
                      <input
                        type="text"
                        value={slot.customName || ''}
                        onChange={(e) => onUpdateSlotCustomName(slot.key, e.target.value)}
                        placeholder={calc?.name || 'Tên hiển thị riêng...'}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-amber-500 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none"
                      />
                    </td>
                    <td className="py-3 px-3 text-center">
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
                          className="w-16 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-center font-mono font-bold text-amber-300 focus:border-amber-500 focus:outline-none"
                        />
                        <span className="font-mono text-slate-400">%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                      <span className="text-emerald-400 font-bold">{calc?.volumeMl} mL</span>
                      <span className="text-slate-500 ml-1.5">(~{calc?.drops} giọt)</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-900/90 border-t border-slate-800 font-mono text-xs">
                <td colSpan={4} className="py-3 px-3 font-bold text-slate-300">
                  Tổng tỉ lệ công thức hiện tại (Đầu {tierTotals.top}% • Giữa {tierTotals.heart}% • Cuối {tierTotals.base}%):
                </td>
                <td
                  className={`py-3 px-3 text-center font-bold text-sm ${
                    isValidTotal ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {totalPercentage}%
                </td>
                <td className="py-3 px-3 text-right font-bold text-amber-300">
                  {totalVolume} mL
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* SECTION 3: EXPORT CSV & QUANTITATIVE TABLE */}
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
