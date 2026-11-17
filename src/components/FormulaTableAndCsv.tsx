import React, { useState } from 'react';
import {
  Download,
  Check,
  Copy,
  FileSpreadsheet,
  Droplets,
  Calculator,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
} from 'lucide-react';
import { CalculatedIngredient } from '../utils/perfumeCalculations';
import { FLORIS_IMAGES } from '../data/perfumeData';
import { ScentFamilyVisualBadge } from './SpringDecorations';
import { SpringAccordion } from './SpringAccordion';

interface FormulaTableAndCsvProps {
  ingredients: CalculatedIngredient[];
  totalVolume: number;
  concentrationName: string;
  seasonLabel: string;
  tierTotals: { top: number; heart: number; base: number };
  onExportCsv: () => void;
  isValidTotal: boolean;
}

const COMMON_DROP_LOOKUP = [
  { ml: 0.05, drops: 1, note: '1 giọt' },
  { ml: 0.10, drops: 2, note: 'Vi chỉnh' },
  { ml: 0.20, drops: 4, note: 'Đào 🍑' },
  { ml: 0.25, drops: 5, note: 'Nhài / Vani' },
  { ml: 0.30, drops: 6, note: 'Xạ hương 🤍' },
  { ml: 1.00, drops: 20, note: 'Cốt 10%' },
  { ml: 2.00, drops: 40, note: 'Cốt 20%' },
  { ml: 8.00, drops: 160, note: 'Ethanol 90%' },
  { ml: 9.00, drops: 180, note: 'Dung môi' },
  { ml: 10.00, drops: 200, note: 'Đầy chai' },
];

export const FormulaTableAndCsv: React.FC<FormulaTableAndCsvProps> = ({
  ingredients,
  totalVolume,
  concentrationName,
  seasonLabel,
  tierTotals,
  onExportCsv,
  isValidTotal,
}) => {
  const [copied, setCopied] = useState(false);
  const [showLookup, setShowLookup] = useState(false);
  const [inputMl, setInputMl] = useState<string>('0.25');
  const [inputDrops, setInputDrops] = useState<string>('5');
  const [selectedBottle, setSelectedBottle] = useState<'sampleA' | 'sampleC' | 'sampleB'>('sampleA');
  const [imgError, setImgError] = useState(false);

  const bottleDetails = {
    sampleA: { title: 'Mẫu A (10%)', subtitle: '20 giọt cốt', img: FLORIS_IMAGES.sampleA },
    sampleC: { title: 'Mẫu C (20%)', subtitle: '40 giọt cốt', img: FLORIS_IMAGES.sampleC },
    sampleB: { title: 'Chai chiết 10 mL', subtitle: 'Thủy tinh xịt', img: FLORIS_IMAGES.sampleB },
  };

  const currentBottle = bottleDetails[selectedBottle];

  const handleCopyText = () => {
    const textSummary = `🌸 CÔNG THỨC FLORIS (${seasonLabel}) - ${totalVolume} mL (${concentrationName})
Tầng: Đầu ${tierTotals.top}% | Giữa ${tierTotals.heart}% | Cuối ${tierTotals.base}%
${ingredients
  .map(
    (ing, i) =>
      `${i + 1}. [${ing.tierLabel}] ${ing.name}: ${ing.percentage}% = ${ing.volumeMl} mL (~${ing.drops} giọt)`
  )
  .join('\n')}`;

    navigator.clipboard.writeText(textSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleMlChange = (valStr: string) => {
    setInputMl(valStr);
    const num = parseFloat(valStr);
    if (!isNaN(num) && num >= 0) {
      setInputDrops(Math.round(num / 0.05).toString());
    } else {
      setInputDrops('');
    }
  };

  const handleDropsChange = (valStr: string) => {
    setInputDrops(valStr);
    const num = parseInt(valStr, 10);
    if (!isNaN(num) && num >= 0) {
      setInputMl((num * 0.05).toFixed(2));
    } else {
      setInputMl('');
    }
  };

  return (
    <div className="spring-card p-5 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="px-3 py-1 rounded-full bg-[#FCE7F3] text-[#BE185D] text-xs font-bold border border-[#FBCFE8] whitespace-nowrap">
            Bảng định lượng
          </span>
          <h2 className="text-lg font-bold text-[#2B342D] flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#DB2777]" />
            <span>Tỷ lệ &amp; xuất CSV</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowLookup((prev) => !prev)}
            type="button"
            className="text-xs px-3 py-1.5 rounded-2xl bg-[#ECFDF3] hover:bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0] font-bold transition-all flex items-center gap-1.5"
          >
            <Droplets className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Đổi số giọt</span>
            {showLookup ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleCopyText}
            type="button"
            className="text-xs px-3 py-1.5 rounded-2xl bg-white hover:bg-[#FFF5F8] text-[#4A4D48] border border-[#F3DCE4] font-bold transition-all flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                <span className="text-[#15803D]">Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#5C6B5F]" />
                <span>Sao chép</span>
              </>
            )}
          </button>

          <button
            onClick={onExportCsv}
            type="button"
            className={`text-xs px-4 py-1.5 rounded-2xl font-bold transition-all flex items-center gap-1.5 shadow-xs ${
              isValidTotal
                ? 'bg-gradient-to-r from-[#EC4899] to-[#F472B6] hover:from-[#DB2777] hover:to-[#EC4899] text-white active:scale-95'
                : 'bg-[#F3F4F6] text-[#9CA3AF] border border-[#E5E7EB] cursor-not-allowed'
            }`}
            disabled={!isValidTotal}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      {/* Formula Table with inline proportion bars */}
      <div className="overflow-x-auto rounded-3xl border border-[#F3DCE4] bg-white">
        <table className="w-full text-left text-xs text-[#2B342D]">
          <thead className="bg-[#FFF5F8] text-[#9D174D] font-bold text-[11px] border-b border-[#FBCFE8]">
            <tr>
              <th className="py-3 px-3">#</th>
              <th className="py-3 px-3">Tầng</th>
              <th className="py-3 px-3">Nguyên liệu</th>
              <th className="py-3 px-3">Nhóm</th>
              <th className="py-3 px-3">Tỷ lệ</th>
              <th className="py-3 px-3 text-right">Thể tích</th>
              <th className="py-3 px-3 text-right text-[#15803D] bg-[#ECFDF3]/70">Số giọt</th>
              <th className="py-3 px-3 text-right">IFRA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F6DCE5]">
            {ingredients.map((ing, idx) => {
              const tierChip =
                ing.tier === 'top'
                  ? 'bg-[#FEF9C3] text-[#854D0E] border-[#FDE047]'
                  : ing.tier === 'heart'
                  ? 'bg-[#FCE7F3] text-[#BE185D] border-[#F9A8D4]'
                  : 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]';

              return (
                <tr key={ing.slotKey} className="hover:bg-[#FFFDF8] transition-colors">
                  <td className="py-3 px-3 font-mono text-[#5C6B5F]">{idx + 1}</td>
                  <td className="py-3 px-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${tierChip}`}>
                      {ing.tierLabel}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-[#2B342D]">
                    {ing.name.split('(')[0].trim()}
                  </td>
                  <td className="py-3 px-3">
                    <ScentFamilyVisualBadge scentFamily={ing.scentFamily} name={ing.name} />
                  </td>
                  <td className="py-3 px-3 min-w-[110px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-[#FFF1F5] overflow-hidden">
                        <div
                          style={{ width: `${Math.min(100, ing.percentage * 2)}%` }}
                          className="h-full rounded-full bg-[#F472B6]"
                        />
                      </div>
                      <span className="font-mono font-bold text-[#BE185D] w-9 text-right">
                        {ing.percentage}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-[#2B342D]">
                    {ing.volumeMl} mL
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-[#15803D] bg-[#ECFDF3]/50">
                    {ing.drops} giọt
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-[#5C6B5F]">
                    ≤ {ing.ifraMaxPercent}%
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-[#FFFDF0] font-mono font-bold border-t border-[#FDE68A] text-[#2B342D]">
            <tr>
              <td colSpan={4} className="py-3 px-3 text-xs">
                Tổng ({totalVolume} mL)
              </td>
              <td className="py-3 px-3 text-right text-[#BE185D]">
                {ingredients.reduce((a, b) => a + b.percentage, 0)}%
              </td>
              <td className="py-3 px-3 text-right">
                {ingredients.reduce((a, b) => a + b.volumeMl, 0).toFixed(2)} mL
              </td>
              <td className="py-3 px-3 text-right text-[#15803D] bg-[#ECFDF3]">
                {ingredients.reduce((a, b) => a + b.drops, 0)} giọt
              </td>
              <td className="py-3 px-3 text-right text-[#16A34A]">An toàn</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Collapsible Drop Converter */}
      {showLookup && (
        <div className="rounded-3xl border border-[#BBF7D0] bg-[#F3FDF6] p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#15803D]">
              💧 Quy đổi pipet (1 giọt = 0,05 mL)
            </span>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-[#BBF7D0] text-xs font-mono">
              <Calculator className="w-3.5 h-3.5 text-[#16A34A]" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={inputMl}
                onChange={(e) => handleMlChange(e.target.value)}
                className="w-14 bg-[#FFFDF8] border border-[#BBF7D0] rounded-lg px-1.5 py-0.5 text-right font-bold"
              />
              <span>mL =</span>
              <input
                type="number"
                step="1"
                min="0"
                value={inputDrops}
                onChange={(e) => handleDropsChange(e.target.value)}
                className="w-12 bg-[#FFFDF8] border border-[#BBF7D0] rounded-lg px-1.5 py-0.5 text-right font-bold text-[#15803D]"
              />
              <span>giọt</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {COMMON_DROP_LOOKUP.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputMl(item.ml.toFixed(2));
                  setInputDrops(item.drops.toString());
                }}
                className="p-2 rounded-2xl bg-white border border-[#C8F0D4] hover:border-[#4ADE80] text-left transition-all"
              >
                <div className="flex items-center justify-between font-mono text-xs font-bold">
                  <span>{item.ml.toFixed(2)} mL</span>
                  <span className="text-[#15803D]">{item.drops}g</span>
                </div>
                <span className="text-[10px] text-[#5C6B5F] block truncate">{item.note}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Optional Lab Photos inside Accordion (relative paths + SVG fallback) */}
      <SpringAccordion
        title="Ảnh mẫu chai thực tế phòng lab"
        badge="A · B · C"
        icon={<ImageIcon className="w-4 h-4 text-[#DB2777]" />}
        tone="cream"
      >
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex gap-1.5">
            {(['sampleA', 'sampleC', 'sampleB'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setSelectedBottle(k);
                  setImgError(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                  selectedBottle === k
                    ? 'bg-[#FCE7F3] text-[#BE185D] border-[#F472B6]'
                    : 'bg-white text-[#5C6B5F] border-[#E5E7EB]'
                }`}
              >
                {bottleDetails[k].title}
              </button>
            ))}
          </div>
          {!imgError ? (
            <img
              src={currentBottle.img}
              alt={currentBottle.title}
              onError={() => setImgError(true)}
              className="w-24 h-28 rounded-2xl object-cover border border-[#FBCFE8]"
              loading="lazy"
            />
          ) : (
            <span className="text-xs font-bold text-[#BE185D]">🧴 {currentBottle.title}</span>
          )}
          <div className="text-xs text-[#4A4D48]">
            <p className="font-bold text-[#2B342D]">{currentBottle.title}</p>
            <p>{currentBottle.subtitle}</p>
          </div>
        </div>
      </SpringAccordion>
    </div>
  );
};
