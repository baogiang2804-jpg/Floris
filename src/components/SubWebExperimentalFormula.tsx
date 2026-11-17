import React, { useState } from 'react';
import {
  FlaskConical,
  CheckCircle2,
  Download,
  Copy,
  Check,
  ArrowLeft,
  Edit3,
  Maximize2,
  BookOpen,
  Sparkles,
  ExternalLink,
  Scale,
  Heart,
  Droplets,
  ShieldCheck,
} from 'lucide-react';
import {
  EXPERIMENTAL_BASELINE_FORMULA,
  GROUP_LAB_REPORT_DATA,
  FLORIS_IMAGES,
} from '../data/perfumeData';
import {
  CalculatedIngredient,
  FormulaSlot,
  downloadCsvFile,
} from '../utils/perfumeCalculations';
import { FlorisSpringEmblem, ScentFamilyVisualBadge } from './SpringDecorations';
import { SpringPerfumeBottleSVG } from './SpringPerfumeBottleSVG';
import { SpringAccordion } from './SpringAccordion';

interface SubWebExperimentalFormulaProps {
  totalVolume: number;
  concentrationName: string;
  concentrationPercent: number;
  pureFragranceMl: number;
  carrierAlcoholMl: number;
  calculatedIngredients: CalculatedIngredient[];
  tierTotals: { top: number; heart: number; base: number };
  totalPercentage: number;
  perfumeName: string;
  onRestoreExperimentalBaseline: () => void;
  onUpdateSlotObservedNote: (slotKey: FormulaSlot['key'], note: string) => void;
  onApplyVariantToStudio: (
    adjustedItems: { slotKey: FormulaSlot['key']; newPercentage: number }[],
    proposedName?: string,
    summaryNote?: string
  ) => void;
  onOpenExperimentalPopup: () => void;
  onOpenGuideModal?: () => void;
  onBackToMainWeb: () => void;
  onGoToAIWeb: () => void;
}

type ExperimentalWebTab = 'all' | 'variants' | 'formula' | 'procedure' | 'chemistry_eval';

export const SubWebExperimentalFormula: React.FC<SubWebExperimentalFormulaProps> = ({
  totalVolume,
  concentrationPercent,
  pureFragranceMl,
  carrierAlcoholMl,
  calculatedIngredients,
  tierTotals,
  totalPercentage,
  perfumeName,
  onUpdateSlotObservedNote,
  onApplyVariantToStudio,
  onOpenExperimentalPopup,
  onBackToMainWeb,
}) => {
  const [activeTab, setActiveTab] = useState<ExperimentalWebTab>('all');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('sample_a_original');
  const [isEditingLabNotes, setIsEditingLabNotes] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const initialEvalState = EXPERIMENTAL_BASELINE_FORMULA.initialEvaluation;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSelectAndApplyVariant = (variantId: string, navigateToMainAfter = false) => {
    setSelectedVariantId(variantId);

    if (variantId === 'sample_a_original') {
      onApplyVariantToStudio(
        [
          { slotKey: 'top1', newPercentage: 10 },
          { slotKey: 'top2', newPercentage: 0 },
          { slotKey: 'heart1', newPercentage: 20 },
          { slotKey: 'heart2', newPercentage: 0 },
          { slotKey: 'base1', newPercentage: 25 },
          { slotKey: 'base2', newPercentage: 45 },
        ],
        'Floris — Mẫu A (Gốc)',
        'Mẫu A - Gốc: Hoa nhài 1% (2 giọt), Đào 2% (4 giọt), Xạ hương trắng 2,5% (5 giọt), Vanilla 4,5% (9 giọt)'
      );
      showToast('Đã nạp Mẫu A - Gốc vào bàn pha chế.');
    } else if (variantId === 'sample_b_fresher') {
      onApplyVariantToStudio(
        [
          { slotKey: 'top1', newPercentage: 30 },
          { slotKey: 'top2', newPercentage: 0 },
          { slotKey: 'heart1', newPercentage: 20 },
          { slotKey: 'heart2', newPercentage: 0 },
          { slotKey: 'base1', newPercentage: 25 },
          { slotKey: 'base2', newPercentage: 25 },
        ],
        'Floris — Mẫu B (Tươi hơn)',
        'Mẫu B - Tươi hơn: Hoa nhài 6% (12 giọt), Đào 4% (8 giọt), Xạ hương trắng 5% (10 giọt), Vanilla 5% (10 giọt)'
      );
      showToast('Đã nạp Mẫu B - Tươi hơn vào bàn pha chế.');
    } else if (variantId === 'sample_c_sweeter') {
      onApplyVariantToStudio(
        [
          { slotKey: 'top1', newPercentage: 20 },
          { slotKey: 'top2', newPercentage: 0 },
          { slotKey: 'heart1', newPercentage: 20 },
          { slotKey: 'heart2', newPercentage: 0 },
          { slotKey: 'base1', newPercentage: 30 },
          { slotKey: 'base2', newPercentage: 30 },
        ],
        'Floris — Mẫu C (Dịu/Ngọt hơn)',
        'Mẫu C - Dịu/Ngọt hơn: Hoa nhài 4% (8 giọt), Đào 4% (8 giọt), Xạ hương trắng 6% (12 giọt), Vanilla 6% (12 giọt)'
      );
      showToast('Đã nạp Mẫu C - Dịu/Ngọt hơn vào bàn pha chế.');
    }

    if (navigateToMainAfter) {
      setTimeout(() => onBackToMainWeb(), 250);
    }
  };

  const handleExportLabReportCsv = () => {
    const lines = [
      '\uFEFF=== THỰC HÀNH LÀM NƯỚC HOA — FLORIS ===',
      `Chủ đề,${GROUP_LAB_REPORT_DATA.topic}`,
      `Tên sản phẩm,${GROUP_LAB_REPORT_DATA.productName}`,
      `Slogan,"${GROUP_LAB_REPORT_DATA.brandStoryAndConcept?.slogan || ''}"`,
      `Định hướng cảm xúc,"${GROUP_LAB_REPORT_DATA.emotionalDirection}"`,
      '',
      '=== BẢNG CÔNG THỨC CHUẨN (10,00 mL) ===',
      'Thành phần,Tầng hương,% hỗn hợp,% thành phẩm,Thể tích / 10mL,Số giọt',
      ...GROUP_LAB_REPORT_DATA.formulaTable10ml.map(
        (r) => `"${r.name}","${r.tier}",${r.blendPct}%,${r.finalProductPct}%,"${r.volume10ml}","${r.drops10ml}"`
      ),
    ];
    downloadCsvFile(lines.join('\n'), 'cong_thuc_thuc_nghiem_floris_10ml.csv');
    showToast('Đã tải CSV thực nghiệm.');
  };

  const handleCopyFullLabSheet = async () => {
    const rawText = `FLORIS (Mùa Xuân 10mL): Hoa nhài 🌼 40% (5 giọt) | Đào 🍑 30% (4 giọt) | Xạ hương 🤍 15% (6 giọt) | Vanilla 🍦 15% (5 giọt) | Dung môi 9,00 mL.`;
    try {
      await navigator.clipboard.writeText(rawText);
      setCopiedText(true);
      showToast('Đã sao chép phiếu thực hành.');
      setTimeout(() => setCopiedText(false), 3000);
    } catch {
      // ignore
    }
  };

  const activeVariantDetail =
    GROUP_LAB_REPORT_DATA.variantDetails[selectedVariantId] ||
    GROUP_LAB_REPORT_DATA.variantDetails['sample_a_original'];

  return (
    <div className="space-y-6 animate-fadeIn">
      {toastMsg && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-[#ECFDF3] border-2 border-[#86EFAC] text-[#15803D] px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-2 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* TOP HEADER (1 Short Title + 1–3 Word Tag) */}
      <div className="spring-card p-5 sm:p-6 bg-gradient-to-br from-[#FFF1F5] via-[#FFFDF8] to-[#ECFDF3]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <FlorisSpringEmblem className="w-14 h-14 shrink-0" />
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-[#15803D] border border-[#BBF7D0] text-[11px] font-bold">
                🧪 Thực nghiệm · 10 mL
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-[#2B342D] mt-1">
                Công Thức Thực Nghiệm Floris
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onBackToMainWeb}
              className="px-3.5 py-2 rounded-2xl bg-white hover:bg-[#FFF5F8] text-[#2B342D] border border-[#F3D5E0] text-xs font-bold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#EC4899]" />
              <span>Về bàn pha</span>
            </button>

            <button
              type="button"
              onClick={onOpenExperimentalPopup}
              className="px-3.5 py-2 rounded-2xl bg-[#FFFDF0] hover:bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-xs font-bold flex items-center gap-1.5"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Xem Pop-up</span>
            </button>

            <button
              type="button"
              onClick={handleCopyFullLabSheet}
              className="px-3 py-2 rounded-2xl bg-white hover:bg-[#FFF5F8] text-[#2B342D] border border-[#F3D5E0] text-xs font-bold flex items-center gap-1.5"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5 text-[#EC4899]" />}
              <span>{copiedText ? 'Đã chép' : 'Sao chép'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportLabReportCsv}
              className="px-3.5 py-2 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất CSV</span>
            </button>
          </div>
        </div>

        {/* Compact Filter Pills */}
        <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-[#F5DCE4]/80 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: '🌸 Tất cả' },
            { id: 'variants', label: '🧪 3 Mẫu A·B·C' },
            { id: 'formula', label: '🧴 Công thức 10 mL' },
            { id: 'procedure', label: '⚗️ Độ tan & 9 Bước' },
            { id: 'chemistry_eval', label: '📊 Ghi chú Hóa học' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as ExperimentalWebTab)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 border ${
                activeTab === t.id
                  ? 'bg-[#EC4899] text-white border-[#EC4899]'
                  : 'bg-white text-[#5C6B5F] border-[#F3D5E0] hover:border-[#F9A8D4]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: VISUAL BOTTLE + 3 EXPERIMENTAL VARIANTS */}
      {(activeTab === 'all' || activeTab === 'variants') && (
        <section className="space-y-4">
          <SpringPerfumeBottleSVG
            ingredients={calculatedIngredients}
            totalVolume={totalVolume}
            concentrationPercent={concentrationPercent}
            pureFragranceMl={pureFragranceMl}
            carrierAlcoholMl={carrierAlcoholMl}
            perfumeName={perfumeName}
          />

          <div className="spring-card p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-lg font-bold text-[#2B342D]">
                Ba Mẫu Thử Thực Nghiệm
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#FCE7F3] text-[#BE185D] text-xs font-bold">
                Mẫu A · B · C
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {GROUP_LAB_REPORT_DATA.threeExperimentalVariants.map((variant) => {
                const isSelected = selectedVariantId === variant.id;
                const barColors = ['#FDE047', '#FDBA74', '#E2E8F0', '#F9A8D4'];
                return (
                  <div
                    key={variant.id}
                    className={`p-4 rounded-3xl border-2 flex flex-col justify-between gap-3 transition-all ${
                      isSelected
                        ? 'bg-[#FFF1F5] border-[#EC4899] shadow-md'
                        : 'bg-[#FFFDF8] border-[#F3DCE4] hover:border-[#F9A8D4]'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-[#2B342D]">{variant.code}</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#FEF9C3] text-[#854D0E] border border-[#FDE047]">
                          {variant.totalFinishedPct}% cốt
                        </span>
                      </div>
                      <p className="text-xs text-[#5C6B5F]">{variant.subtitle}</p>

                      {/* Stacked Visual Ratio Bar */}
                      <div className="w-full h-4 rounded-full overflow-hidden flex border border-[#F3DCE4]">
                        {variant.items.map((it, idx) => (
                          <div
                            key={it.name}
                            style={{
                              width: `${it.blendPct}%`,
                              backgroundColor: barColors[idx % barColors.length],
                            }}
                            title={`${it.name}: ${it.blendPct}%`}
                          />
                        ))}
                      </div>

                      <div className="space-y-1.5 text-xs">
                        {variant.items.map((it) => (
                          <div
                            key={it.name}
                            className="flex items-center justify-between px-3 py-1.5 rounded-2xl bg-white border border-[#F5E6EC]"
                          >
                            <span className="font-bold text-[#2B342D]">{it.name}</span>
                            <span className="font-mono text-[#BE185D] font-bold">
                              {it.finishedPct}% · {it.drops}
                            </span>
                          </div>
                        ))}
                      </div>

                      {variant.imageUrl && !failedImages[variant.id] && (
                        <SpringAccordion title="Xem ảnh mẫu thực tế" tone="cream">
                          <img
                            src={variant.imageUrl}
                            alt={variant.code}
                            onError={() =>
                              setFailedImages((prev) => ({ ...prev, [variant.id]: true }))
                            }
                            className="w-full h-36 object-cover rounded-2xl border border-[#F3DCE4]"
                            loading="lazy"
                          />
                        </SpringAccordion>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-[#F3DCE4]">
                      <button
                        type="button"
                        onClick={() => handleSelectAndApplyVariant(variant.id, false)}
                        className={`flex-1 py-2 px-3 rounded-2xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-[#EC4899] text-white'
                            : 'bg-white hover:bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8]'
                        }`}
                      >
                        {isSelected ? 'Đang chọn' : 'Nạp vào chai'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectAndApplyVariant(variant.id, true)}
                        className="py-2 px-3 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold"
                      >
                        Mở bàn pha
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {activeVariantDetail && (
              <SpringAccordion
                title={`Phân tích Hóa học: ${activeVariantDetail.title}`}
                badge="Theo dõi 24–72h"
                tone="leaf"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white border border-[#BBF7D0]">
                    <strong className="block text-[#15803D] mb-1">Mục đích điều chỉnh:</strong>
                    <p>{activeVariantDetail.purpose}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#BBF7D0]">
                    <strong className="block text-[#15803D] mb-1">Giải thích Hóa học:</strong>
                    <p>{activeVariantDetail.chemistryExplanation}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#BBF7D0]">
                    <strong className="block text-[#15803D] mb-1">So sánh mẫu gốc:</strong>
                    <p>{activeVariantDetail.comparisonWithBase}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#BBF7D0]">
                    <strong className="block text-[#15803D] mb-1">Kết quả sau 24h – 72h:</strong>
                    <p>{activeVariantDetail.evaluation24to72h}</p>
                  </div>
                </div>
              </SpringAccordion>
            )}
          </div>
        </section>
      )}

      {/* SECTION 2: BẢNG CÔNG THỨC 10 ML + STORY ACCORDION */}
      {(activeTab === 'all' || activeTab === 'formula') && (
        <section className="spring-card p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg font-bold text-[#2B342D]">Bảng Định Lượng Chuẩn 10 mL</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FEF9C3] text-[#854D0E] text-xs font-mono font-bold">
              1 giọt = 0,05 mL
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#F3DCE4]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FFF5F8] border-b border-[#F3DCE4] text-[#5C6B5F]">
                  <th className="py-2.5 px-3">Thành phần</th>
                  <th className="py-2.5 px-3 text-center">% cốt</th>
                  <th className="py-2.5 px-3 text-center">% TP</th>
                  <th className="py-2.5 px-3 text-right">Thể tích</th>
                  <th className="py-2.5 px-3 text-right">Số giọt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8E8EE] font-mono">
                {GROUP_LAB_REPORT_DATA.formulaTable10ml.map((row) => (
                  <tr key={row.name} className="hover:bg-[#FFFDF8]">
                    <td className="py-2.5 px-3 font-sans font-bold text-[#2B342D]">
                      {row.name}{' '}
                      <span className="text-[11px] font-normal text-[#5C6B5F]">({row.tier})</span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-[#BE185D]">{row.blendPct}%</td>
                    <td className="py-2.5 px-3 text-center text-[#2B342D]">{row.finalProductPct}%</td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#15803D]">{row.volume10ml}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#92400E]">{row.drops10ml}</td>
                  </tr>
                ))}
                {GROUP_LAB_REPORT_DATA.summaryRows10ml.map((s) => (
                  <tr key={s.label} className="bg-[#ECFDF3]/50 font-bold">
                    <td className="py-2 px-3 font-sans text-[#166534]">{s.label}</td>
                    <td className="py-2 px-3 text-center">{s.blendPct}</td>
                    <td className="py-2 px-3 text-center">{s.finalProductPct}</td>
                    <td className="py-2 px-3 text-right text-[#15803D]">{s.volume10ml}</td>
                    <td className="py-2 px-3 text-right text-[#92400E]">{s.drops10ml}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2.5">
            {GROUP_LAB_REPORT_DATA.brandStoryAndConcept && (
              <SpringAccordion
                title="Câu chuyện thương hiệu & Đối tượng sử dụng"
                badge="Floris Xuân"
                tone="sakura"
                icon={<Heart className="w-4 h-4 text-[#EC4899]" />}
              >
                <p className="font-bold text-[#BE185D]">
                  “{GROUP_LAB_REPORT_DATA.brandStoryAndConcept.slogan}”
                </p>
                <p className="whitespace-pre-line leading-relaxed">
                  {GROUP_LAB_REPORT_DATA.brandStoryAndConcept.story}
                </p>
              </SpringAccordion>
            )}

            <SpringAccordion
              title="Hợp chất hóa học & Tiêu chuẩn IFRA của 4 nốt"
              badge="Chi tiết"
              tone="butter"
              icon={<Sparkles className="w-4 h-4 text-[#D97706]" />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {GROUP_LAB_REPORT_DATA.formulaTable10ml.map((row) => {
                  const detail = GROUP_LAB_REPORT_DATA.formulaRowDetails[row.name];
                  if (!detail) return null;
                  return (
                    <div key={row.name} className="p-3 rounded-xl bg-white border border-[#FDE68A] space-y-1">
                      <strong className="text-[#2B342D] block">{row.name}</strong>
                      <p className="text-[11px] text-[#5C6B5F]">Hợp chất: {detail.chemicalCompounds}</p>
                      <p className="text-[11px] text-[#15803D]">IFRA: {detail.safetyAndIfra}</p>
                    </div>
                  );
                })}
              </div>
            </SpringAccordion>
          </div>
        </section>
      )}

      {/* SECTION 3: ĐỘ TAN & QUY TRÌNH 9 BƯỚC */}
      {(activeTab === 'all' || activeTab === 'procedure') && (
        <section className="spring-card-leaf p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg font-bold text-[#166534] flex items-center gap-2">
              <Droplets className="w-5 h-5 text-[#16A34A]" />
              <span>Độ Tan &amp; Quy Trình Pha Chế</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-white text-[#15803D] border border-[#86EFAC] text-xs font-bold">
              80 : 10 : 10
            </span>
          </div>

          {/* Visual Solvent Ratio Bar */}
          <div className="w-full h-6 rounded-full overflow-hidden flex border-2 border-[#86EFAC] text-xs font-bold">
            <div style={{ width: '80%' }} className="bg-[#DCFCE7] text-[#166534] flex items-center justify-center">
              80% Ethanol 90° (8,00 mL)
            </div>
            <div style={{ width: '10%' }} className="bg-[#FEF9C3] text-[#854D0E] flex items-center justify-center">
              10% Nước
            </div>
            <div style={{ width: '10%' }} className="bg-[#FBCFE8] text-[#9D174D] flex items-center justify-center">
              10% Tinh dầu
            </div>
          </div>

          <div className="space-y-2.5">
            <SpringAccordion
              title="Quy trình 9 bước & Dụng cụ phòng lab"
              badge="9 bước"
              tone="butter"
              icon={<FlaskConical className="w-4 h-4 text-[#D97706]" />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {GROUP_LAB_REPORT_DATA.procedureStepDetails.map((st) => (
                  <div key={st.stepNumber} className="p-2.5 rounded-xl bg-white border border-[#FDE68A]">
                    <span className="text-[11px] font-mono font-bold text-[#D97706]">
                      Bước {st.stepNumber}: {st.title}
                    </span>
                    <p className="text-[11px] text-[#4A4D48] mt-0.5">{st.content}</p>
                  </div>
                ))}
              </div>
            </SpringAccordion>

            <SpringAccordion
              title="Quy tắc an toàn & So sánh công nghiệp"
              badge="An toàn"
              tone="sakura"
              icon={<ShieldCheck className="w-4 h-4 text-[#EC4899]" />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {GROUP_LAB_REPORT_DATA.safetyRuleDetails.map((rule) => (
                  <div key={rule.ruleNumber} className="p-2.5 rounded-xl bg-white border border-[#FBCFE8]">
                    <strong className="text-xs text-[#BE185D]">Quy tắc #{rule.ruleNumber}: {rule.rule}</strong>
                    <p className="text-[11px] text-[#5C6B5F] mt-0.5">{rule.specificDetail}</p>
                  </div>
                ))}
              </div>
            </SpringAccordion>

            {GROUP_LAB_REPORT_DATA.references && (
              <SpringAccordion
                title="Nguồn tham khảo khoa học & Ảnh thực nghiệm"
                badge="IFRA · Ảnh lab"
                tone="cream"
                icon={<BookOpen className="w-4 h-4 text-[#16A34A]" />}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {GROUP_LAB_REPORT_DATA.references.map((ref) => (
                    <a
                      key={ref.sourceNumber}
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-[#FFFDF8] border border-[#F3DCE4] hover:border-[#EC4899] block"
                    >
                      <span className="text-[10px] font-mono font-bold text-[#15803D]">
                        Nguồn {ref.sourceNumber}
                      </span>
                      <h4 className="font-bold text-xs text-[#2B342D]">{ref.org}</h4>
                      <p className="text-[11px] text-[#5C6B5F]">{ref.author}</p>
                    </a>
                  ))}
                </div>
                {!failedImages['poster'] && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <img
                      src={FLORIS_IMAGES.poster}
                      alt="Poster Floris"
                      onError={() => setFailedImages((p) => ({ ...p, poster: true }))}
                      className="h-44 w-full object-cover rounded-2xl border border-[#F3DCE4]"
                      loading="lazy"
                    />
                    <img
                      src={FLORIS_IMAGES.infographic9Steps}
                      alt="Infographic 9 bước"
                      onError={() => setFailedImages((p) => ({ ...p, poster: true }))}
                      className="h-44 w-full object-contain rounded-2xl border border-[#F3DCE4] bg-white"
                      loading="lazy"
                    />
                  </div>
                )}
              </SpringAccordion>
            )}
          </div>
        </section>
      )}

      {/* SECTION 4: GHI CHÚ HÓA HỌC & ĐÁNH GIÁ BAN ĐẦU */}
      {(activeTab === 'all' || activeTab === 'chemistry_eval') && (
        <section className="spring-card p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[11px] font-bold text-[#BE185D] uppercase">Sổ tay phòng lab</span>
              <h2 className="text-lg font-bold text-[#2B342D]">Ghi Nhận Mùi Hương &amp; IFRA</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingLabNotes((prev) => !prev)}
              className="px-3.5 py-2 rounded-2xl bg-[#FFF5F8] hover:bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] text-xs font-bold flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingLabNotes ? 'Xong' : 'Sửa ghi chú'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {calculatedIngredients.map((ing) => (
              <div
                key={ing.slotKey}
                className="p-3.5 rounded-2xl bg-[#FFFDF8] border border-[#F3DCE4] space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-sm text-[#2B342D] truncate">{ing.name}</span>
                    <ScentFamilyVisualBadge scentFamily={ing.scentFamily} name={ing.name} />
                  </div>
                  <span className="font-mono text-xs font-bold text-[#15803D] bg-[#ECFDF3] px-2 py-0.5 rounded-full">
                    {ing.percentage}% ({ing.volumeMl} mL)
                  </span>
                </div>

                {isEditingLabNotes ? (
                  <textarea
                    rows={2}
                    value={ing.observedLabNote || ''}
                    onChange={(e) =>
                      onUpdateSlotObservedNote(ing.slotKey as FormulaSlot['key'], e.target.value)
                    }
                    className="w-full p-2.5 rounded-xl bg-white border border-[#FBCFE8] text-xs text-[#2B342D] focus:outline-none focus:border-[#EC4899]"
                  />
                ) : (
                  <p className="text-xs text-[#5C6B5F]">
                    {ing.observedLabNote || 'Chưa có ghi chú thực tế.'}
                  </p>
                )}
              </div>
            ))}
          </div>

          <SpringAccordion
            title="Nhận xét tổng hợp ban đầu (Mẫu A)"
            badge={`Tổng ${totalPercentage}%`}
            tone="cream"
            icon={<Scale className="w-4 h-4 text-[#EC4899]" />}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-white border border-[#F3DCE4]">
                <strong className="text-[#2B342D] block">Trạng thái vật lý:</strong>
                <p>{initialEvalState.physicalState}</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#F3DCE4]">
                <strong className="text-[#2B342D] block">Diễn biến mùi hương:</strong>
                <p>{initialEvalState.scentEvolution}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#ECFDF3] border border-[#BBF7D0]">
                <strong className="text-[#15803D] block">Ưu điểm:</strong>
                <p>{initialEvalState.strengths}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#FFFDF0] border border-[#FDE68A]">
                <strong className="text-[#92400E] block">Hướng cải tiến:</strong>
                <p>{initialEvalState.pointsToImprove}</p>
              </div>
            </div>
            <div className="text-[11px] font-mono text-[#5C6B5F]">
              Phân bổ tầng hiện tại: Đầu {tierTotals.top}% · Giữa {tierTotals.heart}% · Cuối {tierTotals.base}%
            </div>
          </SpringAccordion>
        </section>
      )}
    </div>
  );
};
