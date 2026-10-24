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
  Layers,
  Scale,
  Heart,
  Users,
  X,
  Eye,
  ZoomIn,
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

type ExperimentalWebTab =
  | 'all'
  | 'concept'
  | 'story'
  | 'reasons'
  | 'formula'
  | 'solvent'
  | 'variants'
  | 'tools'
  | 'procedure'
  | 'comparison'
  | 'safety'
  | 'chemistry_eval'
  | 'references';

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

  const [selectedConceptId, setSelectedConceptId] = useState<string>('concept_main');
  const [selectedFormulaRowName, setSelectedFormulaRowName] = useState<string>('Hoa nhài 🌼');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('sample_a_original');
  const [selectedToolIdx, setSelectedToolIdx] = useState<number | null>(0);
  const [selectedStepIdx, setSelectedStepIdx] = useState<number | null>(0);
  const [selectedSafetyKey, setSelectedSafetyKey] = useState<string | null>('rule_0');

  const [isEditingLabNotes, setIsEditingLabNotes] = useState(false);
  const [initialEvalState, setInitialEvalState] = useState({
    physicalState: EXPERIMENTAL_BASELINE_FORMULA.initialEvaluation.physicalState,
    scentEvolution: EXPERIMENTAL_BASELINE_FORMULA.initialEvaluation.scentEvolution,
    strengths: EXPERIMENTAL_BASELINE_FORMULA.initialEvaluation.strengths,
    pointsToImprove: EXPERIMENTAL_BASELINE_FORMULA.initialEvaluation.pointsToImprove,
    panelScore: EXPERIMENTAL_BASELINE_FORMULA.initialEvaluation.panelScore,
  });

  const [copiedText, setCopiedText] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{ src: string; title: string; desc?: string } | null>(null);

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
      setTimeout(() => onBackToMainWeb(), 300);
    }
  };

  const handleExportLabReportCsv = () => {
    const lines = [
      '\uFEFF=== THỰC HÀNH LÀM NƯỚC HOA — FLORIS ===',
      `Chủ đề,${GROUP_LAB_REPORT_DATA.topic}`,
      `Tên sản phẩm,${GROUP_LAB_REPORT_DATA.productName}`,
      `Slogan,"${GROUP_LAB_REPORT_DATA.brandStoryAndConcept?.slogan || ''}"`,
      `Định hướng cảm xúc,"${GROUP_LAB_REPORT_DATA.emotionalDirection}"`,
      `Hương đầu,"${GROUP_LAB_REPORT_DATA.olfactoryPyramidSummary.top}"`,
      `Hương giữa,"${GROUP_LAB_REPORT_DATA.olfactoryPyramidSummary.heart}"`,
      `Hương cuối,"${GROUP_LAB_REPORT_DATA.olfactoryPyramidSummary.base}"`,
      '',
      '=== BẢNG CÔNG THỨC CHUẨN (10,00 mL) (1 GIỌT = 0,05 mL) ===',
      'Thành phần,Tầng hương,% hỗn hợp hương,% nước hoa thành phẩm,Thể tích lý thuyết / 10mL,Số giọt (1 giọt = 0,05 mL)',
      ...GROUP_LAB_REPORT_DATA.formulaTable10ml.map(
        (r) => `"${r.name}","${r.tier}",${r.blendPct}%,${r.finalProductPct}%,"${r.volume10ml}","${r.drops10ml}"`
      ),
      ...GROUP_LAB_REPORT_DATA.summaryRows10ml.map(
        (s) => `"${s.label}","",${s.blendPct},${s.finalProductPct},"${s.volume10ml}","${s.drops10ml}"`
      ),
      '',
      '=== TỈ LỆ HƯƠNG LIỆU 3 MẪU THỰC NGHIỆM ===',
      'Mẫu thực nghiệm,Hoa nhài (%),Đào (%),Xạ hương trắng (%),Vanilla (%),Tổng cốt hương (%),Dung môi (mL / giọt)',
      '"Mẫu A - Gốc",1% (2 giọt),2% (4 giọt),2.5% (5 giọt),4.5% (9 giọt),10% (1,00 mL = 20 giọt),9,00 mL (180 giọt)',
      '"Mẫu B - Tươi hơn",6% (12 giọt),4% (8 giọt),5% (10 giọt),5% (10 giọt),20% (2,00 mL = 40 giọt),8,00 mL (160 giọt)',
      '"Mẫu C - Dịu/Ngọt hơn",4% (8 giọt),4% (8 giọt),6% (12 giọt),6% (12 giọt),20% (2,00 mL = 40 giọt),8,00 mL (160 giọt)',
    ];
    downloadCsvFile(lines.join('\n'), 'cong_thuc_thuc_nghiem_floris_10ml.csv');
    showToast('Đã tải file CSV công thức thực nghiệm.');
  };

  const handleCopyFullLabSheet = async () => {
    const rawText = `THỰC HÀNH LÀM NƯỚC HOA — FLORIS
Chủ đề: Mùa Xuân
Slogan: Chạm hương xuân, lưu nét dịu dàng
Ý TƯỞNG
- Tên sản phẩm: Floris
- Định hướng cảm xúc: Tươi mới, nhẹ nhàng và trong trẻo 🫧
- Hương đầu: Hoa nhài 🌼
- Hương giữa: Đào 🍑
- Hương cuối: Xạ hương trắng 🤍 + Vanilla 🍦

CÔNG THỨC CHUẨN (10,00 mL) (Quy chuẩn: 1 giọt = 0,05 mL):
- Hoa nhài 🌼: 40% cốt hương | 2,5% thành phẩm | 0,25 mL | 5 giọt
- Đào 🍑: 30% cốt hương | 2,0% thành phẩm | 0,20 mL | 4 giọt
- Xạ hương trắng 🤍: 15% cốt hương | 3,0% thành phẩm | 0,30 mL | 6 giọt
- Vanilla 🍦: 15% cốt hương | 2,5% thành phẩm | 0,25 mL | 5 giọt
- Tổng hỗn hợp cốt hương: 100% | 10% | 1,00 mL | 20 giọt
- Dung môi nước hoa (Ethanol 90% 8,00 mL [160 giọt] + Nước cất 1,00 mL [20 giọt]): 90% | 9,00 mL | 180 giọt
- Tổng thành phẩm: 100% | 10,00 mL | 200 giọt

KHẢO SÁT ĐỘ TAN & DUNG MÔI:
- Cố định: 1,00 mL tinh dầu (20 giọt) + 8,00 mL ethanol 90% (160 giọt) + nước cất thêm từng giọt.
- Giới hạn không bị vẩn đục: 19–20 giọt nước cất (~1,00 mL).
- Tỉ lệ dung môi chuẩn: 80% Ethanol 90% + 10% Nước cất + 10% Tinh dầu.

TỈ LỆ HƯƠNG LIỆU 3 MẪU:
• Mẫu A - Gốc (10% cốt hương = 20 giọt): Nhài 1% (2 giọt), Đào 2% (4 giọt), Xạ hương trắng 2,5% (5 giọt), Vanilla 4,5% (9 giọt) + Dung môi 9,00 mL (180 giọt)
• Mẫu B - Tươi hơn (20% cốt hương = 40 giọt): Nhài 6% (12 giọt), Đào 4% (8 giọt), Xạ hương trắng 5% (10 giọt), Vanilla 5% (10 giọt) + Dung môi 8,00 mL (160 giọt)
• Mẫu C - Dịu/Ngọt hơn (20% cốt hương = 40 giọt): Nhài 4% (8 giọt), Đào 4% (8 giọt), Xạ hương trắng 6% (12 giọt), Vanilla 6% (12 giọt) + Dung môi 8,00 mL (160 giọt)`;

    try {
      await navigator.clipboard.writeText(rawText);
      setCopiedText(true);
      showToast('Đã sao chép nội dung phiếu thực hành.');
      setTimeout(() => setCopiedText(false), 3000);
    } catch {
      // ignore
    }
  };

  const activeConceptDetail =
    GROUP_LAB_REPORT_DATA.conceptAndPyramidDetails.find((c) => c.id === selectedConceptId) ||
    GROUP_LAB_REPORT_DATA.conceptAndPyramidDetails[0];

  const activeFormulaRowDetail =
    GROUP_LAB_REPORT_DATA.formulaRowDetails[selectedFormulaRowName] ||
    GROUP_LAB_REPORT_DATA.formulaRowDetails['Hoa nhài 🌼'];

  const activeVariantDetail =
    GROUP_LAB_REPORT_DATA.variantDetails[selectedVariantId] ||
    GROUP_LAB_REPORT_DATA.variantDetails['sample_a_original'];

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed top-16 right-4 sm:right-8 z-50 bg-slate-900 border border-slate-700 text-slate-100 px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() =>
                setPreviewImage({
                  src: FLORIS_IMAGES.logoEmblem,
                  title: 'Huy hiệu chính thức Floris Eau De Parfum',
                  desc: 'Biểu trưng nhóm thực nghiệm Tổ 1 - 12A13 THPT Nguyễn Thị Minh Khai',
                })
              }
              className="relative group shrink-0"
              title="Nhấn để phóng to huy hiệu Floris"
            >
              <img
                src={FLORIS_IMAGES.logoEmblem}
                alt="Floris Logo Emblem"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-emerald-500/40 shadow-md group-hover:scale-105 transition-transform bg-white/90 p-0.5"
                loading="lazy"
              />
              <div className="absolute inset-0 rounded-full bg-slate-950/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <ZoomIn className="w-4 h-4 text-white" />
              </div>
            </button>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="text-emerald-400 font-medium">Phiếu thực hành gốc của nhóm</span>
                <span aria-hidden="true">·</span>
                <span>Chủ đề: {GROUP_LAB_REPORT_DATA.topic}</span>
                <span aria-hidden="true">·</span>
                <span>Mẫu đang nạp: {perfumeName}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100">
                Công thức nước hoa thực nghiệm — {GROUP_LAB_REPORT_DATA.productName} (10,00 mL)
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Định hướng mùi hương: <strong className="text-slate-200">{GROUP_LAB_REPORT_DATA.emotionalDirection}</strong> · 1,00 mL hỗn hợp hương (10%) pha trong 9,00 mL dung môi (180 giọt).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onBackToMainWeb}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
              <span>Về trang chính</span>
            </button>

            <button
              type="button"
              onClick={onOpenExperimentalPopup}
              className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Xem dạng Pop-up</span>
            </button>

            <button
              type="button"
              onClick={handleCopyFullLabSheet}
              className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Đã sao chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Sao chép phiếu</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleExportLabReportCsv}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải CSV (10 mL)</span>
            </button>
          </div>
        </div>

        {/* Section Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 mt-5 pt-4 border-t border-slate-800">
          {[
            { id: 'all', label: 'Tất cả mục' },
            { id: 'concept', label: '1. Ý tưởng & tầng hương' },
            { id: 'story', label: '2. Câu chuyện & người dùng' },
            { id: 'reasons', label: '3. Phân tầng & lí do chọn' },
            { id: 'formula', label: '4. Bảng công thức 10 mL' },
            { id: 'solvent', label: '5. Độ tan & Dung môi' },
            { id: 'variants', label: '6. Ba mẫu thử (A, B, C)' },
            { id: 'tools', label: '7. Dụng cụ & hóa chất' },
            { id: 'procedure', label: '8. Quy trình 9 bước' },
            { id: 'comparison', label: '9. So sánh học đường & công nghiệp' },
            { id: 'safety', label: '10. An toàn & bảo quản' },
            { id: 'chemistry_eval', label: '11. Đánh giá ban đầu' },
            { id: 'references', label: '12. Nguồn tham khảo' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as ExperimentalWebTab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-slate-800 text-emerald-300 font-semibold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* =====================================================================
          MỤC 1: Ý TƯỞNG & KIM TỰ THÁP 3 TẦNG HƯƠNG
         ===================================================================== */}
      {(activeTab === 'all' || activeTab === 'concept') && (
        <section className="p-5 sm:p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs text-slate-400 block">Mục 01</span>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-100">
                Ý tưởng sản phẩm &amp; cấu trúc 3 tầng hương
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Chọn từng ô bên dưới để xem thuyết minh chi tiết
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {GROUP_LAB_REPORT_DATA.conceptAndPyramidDetails.map((item) => {
              const isSelected = selectedConceptId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedConceptId(item.id)}
                  className={`p-4 rounded-xl border text-left transition-colors flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-slate-800/90 border-emerald-500/50 text-slate-100'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono text-slate-400 block">
                      {item.badge}
                    </span>
                    <h3 className="text-sm sm:text-base font-serif font-bold text-slate-100">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400">{item.subtitle}</p>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                    {item.summary}
                  </p>
                </button>
              );
            })}
          </div>

          {activeConceptDetail && (
            <div className="p-4 sm:p-5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
              <div className="border-b border-slate-800 pb-2.5 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-serif font-bold text-slate-100">
                  {activeConceptDetail.title}
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  {activeConceptDetail.subtitle}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                {activeConceptDetail.specificContent.map((point, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800/90 text-slate-300 leading-relaxed"
                  >
                    {point}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* =====================================================================
          MỤC 2: CÂU CHUYỆN THƯƠNG HIỆU & CONCEPT NƯỚC HOA THEO MÙA
         ===================================================================== */}
      {(activeTab === 'all' || activeTab === 'story') && GROUP_LAB_REPORT_DATA.brandStoryAndConcept && (
        <section className="p-5 sm:p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs text-slate-400 block">Mục 02</span>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>{GROUP_LAB_REPORT_DATA.brandStoryAndConcept.tagline}</span>
              </h2>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              {GROUP_LAB_REPORT_DATA.brandStoryAndConcept.overallConcept}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            <div className="lg:col-span-8 p-4 sm:p-5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3 text-xs leading-relaxed text-slate-300">
              <h3 className="text-sm font-serif font-bold text-slate-100 flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-400" />
                <span>Câu chuyện thương hiệu</span>
              </h3>
              <p className="whitespace-pre-line text-slate-300">
                {GROUP_LAB_REPORT_DATA.brandStoryAndConcept.story}
              </p>
            </div>

            {/* Poster chính thức Floris Eau De Parfum */}
            <div className="lg:col-span-4">
              <button
                type="button"
                onClick={() =>
                  setPreviewImage({
                    src: FLORIS_IMAGES.poster,
                    title: 'Poster nghệ thuật chính thức — Floris Eau De Parfum',
                    desc: 'More than a fragrance, it’s a feeling · Bloom in every moment (Tổ 1 - 12A13 THPT NTMK)',
                  })
                }
                className="w-full relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-950 block shadow-lg hover:border-pink-500/50 transition-all text-left"
                title="Nhấn để phóng to poster Floris"
              >
                <img
                  src={FLORIS_IMAGES.poster}
                  alt="Poster Floris Eau De Parfum"
                  className="w-full h-64 object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end justify-between p-3">
                  <div>
                    <span className="text-[10px] font-mono text-pink-300 uppercase block">Poster Floris</span>
                    <span className="text-xs font-serif font-bold text-white">Chạm hương xuân, lưu nét dịu dàng</span>
                  </div>
                  <ZoomIn className="w-4 h-4 text-pink-300 shrink-0" />
                </div>
              </button>
            </div>
          </div>

          {/* 3 tính từ mô tả */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {GROUP_LAB_REPORT_DATA.brandStoryAndConcept.threeKeyAdjectives.map((adj, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider block">
                  Tính từ #{idx + 1}
                </span>
                <h4 className="text-base font-serif font-bold text-slate-100">{adj.word}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{adj.explanation}</p>
              </div>
            ))}
          </div>

          {/* Chân dung & Hoàn cảnh sử dụng */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
              <h4 className="font-semibold text-slate-200 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Người dùng mục tiêu</span>
              </h4>
              <ul className="space-y-1.5 text-slate-300">
                <li>• <strong className="text-slate-100">Đối tượng:</strong> {GROUP_LAB_REPORT_DATA.brandStoryAndConcept.targetUser.demographic}</li>
                <li>• <strong className="text-slate-100">Tính cách:</strong> {GROUP_LAB_REPORT_DATA.brandStoryAndConcept.targetUser.personality}</li>
                <li>• <strong className="text-slate-100">Sở thích:</strong> {GROUP_LAB_REPORT_DATA.brandStoryAndConcept.targetUser.preference}</li>
                <li>• <strong className="text-slate-100">Nhu cầu:</strong> {GROUP_LAB_REPORT_DATA.brandStoryAndConcept.targetUser.needs}</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
              <h4 className="font-semibold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Hoàn cảnh sử dụng</span>
              </h4>
              <ul className="space-y-1.5 text-slate-300">
                <li>• <strong className="text-slate-100">Thời điểm:</strong> {GROUP_LAB_REPORT_DATA.brandStoryAndConcept.usageContext.timeOfDay}</li>
                <li>• <strong className="text-slate-100">Địa điểm:</strong> {GROUP_LAB_REPORT_DATA.brandStoryAndConcept.usageContext.location}</li>
                <li>• <strong className="text-slate-100">Dịp:</strong> {GROUP_LAB_REPORT_DATA.brandStoryAndConcept.usageContext.occasions}</li>
                <li>• <strong className="text-slate-100">Mùa &amp; Phong cách:</strong> {GROUP_LAB_REPORT_DATA.brandStoryAndConcept.usageContext.season}</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          MỤC 3: BẢNG PHÂN TẦNG HƯƠNG & LÍ DO CHỌN NGUYÊN LIỆU
         ===================================================================== */}
      {(activeTab === 'all' || activeTab === 'reasons') && (
        <section className="p-5 sm:p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs text-slate-400 block">Mục 03</span>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-100">
                Bảng phân tầng hương &amp; Lí do lựa chọn nguyên liệu
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                setPreviewImage({
                  src: FLORIS_IMAGES.scentStillLife,
                  title: 'Nghệ thuật 4 nốt hương Floris',
                  desc: 'Hoa nhài trắng (Đầu) · Đào mọng nước (Giữa) · Xạ hương trắng & Vanilla béo ngọt (Cuối)',
                })
              }
              className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem tranh nghệ thuật 4 nốt hương</span>
            </button>
          </div>

          {/* Banner nốt hương Floris */}
          <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 relative group">
            <img
              src={FLORIS_IMAGES.scentStillLife}
              alt="4 Nốt hương chính của Floris"
              className="w-full h-44 sm:h-56 object-cover object-center group-hover:scale-102 transition-transform duration-300 cursor-pointer"
              onClick={() =>
                setPreviewImage({
                  src: FLORIS_IMAGES.scentStillLife,
                  title: '4 Nốt hương chính trong công thức Floris 10 mL',
                  desc: 'Hương đầu: Hoa nhài 🌼 | Hương giữa: Đào 🍑 | Hương cuối: Xạ hương trắng 🤍 & Vanilla 🍦',
                })
              }
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex items-end justify-between p-4 pointer-events-none">
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider block">
                  Bản Giao Hưởng Mùi Hương Mùa Xuân
                </span>
                <p className="text-sm font-serif font-bold text-white">
                  Hoa Nhài 🌼 (Hương đầu) · Đào 🍑 (Hương giữa) · Xạ Hương Trắng 🤍 &amp; Vanilla 🍦 (Hương cuối)
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-300 bg-slate-900/80 px-2 py-1 rounded border border-slate-700">
                1 giọt = 0,05 mL
              </span>
            </div>
          </div>

          {/* Bảng phân tầng hương */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/90">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400">
                  <th className="py-3 px-4 font-medium">Tầng hương</th>
                  <th className="py-3 px-4 font-medium">Vai trò</th>
                  <th className="py-3 px-4 font-medium text-center">Mức độ bay hơi</th>
                  <th className="py-3 px-4 font-medium">Thời điểm cảm nhận</th>
                  <th className="py-3 px-4 font-medium">Nguyên liệu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {GROUP_LAB_REPORT_DATA.scentTierRoles?.map((tier) => (
                  <tr key={tier.tier} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4 font-bold text-slate-100">Tầng {tier.tier}</td>
                    <td className="py-3 px-4 text-slate-300">{tier.role}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-amber-300">
                        {tier.evaporationRate}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{tier.perceptionTime}</td>
                    <td className="py-3 px-4 font-semibold text-emerald-300">{tier.ingredients}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Lí do chọn nguyên liệu */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {GROUP_LAB_REPORT_DATA.ingredientSelectionReasons?.map((reason, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                <span className="font-mono text-emerald-400 text-[11px] block">{reason.tier}</span>
                <h4 className="text-sm font-serif font-bold text-slate-100">{reason.ingredients}</h4>
                <ul className="space-y-1 text-slate-300">
                  {reason.bulletPoints.map((bp, i) => (
                    <li key={i}>• {bp}</li>
                  ))}
                </ul>
                <p className="pt-2 border-t border-slate-800 text-slate-400 italic">
                  → {reason.conclusion}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =====================================================================
          MỤC 4: BẢNG CÔNG THỨC GỐC (10,00 mL)
         ===================================================================== */}
      {(activeTab === 'all' || activeTab === 'formula') && (
        <section className="p-5 sm:p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs text-slate-400 block">Mục 04</span>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-100">
                Bảng công thức gốc thực hành (Quy chuẩn 10,00 mL)
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Bấm vào từng dòng nguyên liệu để xem cơ sở Hóa học &amp; ghi nhận thực tế
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-950/90 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400">
                      <th className="py-3 px-4 font-medium">Thành phần</th>
                      <th className="py-3 px-3 text-center font-medium">% hỗn hợp</th>
                      <th className="py-3 px-3 text-center font-medium">% TP</th>
                      <th className="py-3 px-3.5 text-right font-medium">Thể tích / 10 mL</th>
                      <th className="py-3 px-4 text-right font-medium text-amber-300">Số giọt (0,05 mL)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 font-mono">
                    {GROUP_LAB_REPORT_DATA.formulaTable10ml.map((row) => {
                      const isRowSelected = selectedFormulaRowName === row.name;
                      return (
                        <tr
                          key={row.name}
                          onClick={() => setSelectedFormulaRowName(row.name)}
                          className={`cursor-pointer transition-colors ${
                            isRowSelected
                              ? 'bg-slate-800/90 text-slate-100'
                              : 'hover:bg-slate-900/50 text-slate-300'
                          }`}
                        >
                          <td className="py-3 px-4 font-sans">
                            <span className="font-semibold text-slate-100">{row.name}</span>
                            <span className="text-[11px] text-slate-400 ml-2">({row.tier})</span>
                          </td>
                          <td className="py-3 px-3 text-center font-semibold text-amber-300">
                            {row.blendPct}%
                          </td>
                          <td className="py-3 px-3 text-center font-semibold text-slate-200">
                            {row.finalProductPct}%
                          </td>
                          <td className="py-3 px-3.5 text-right font-semibold text-emerald-400">
                            {row.volume10ml}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-amber-300">
                            {row.drops10ml}
                          </td>
                        </tr>
                      );
                    })}

                    {GROUP_LAB_REPORT_DATA.summaryRows10ml.map((sRow, i) => {
                      const isRowSelected = selectedFormulaRowName === sRow.label;
                      return (
                        <tr
                          key={sRow.label}
                          onClick={() => setSelectedFormulaRowName(sRow.label)}
                          className={`cursor-pointer transition-colors ${
                            isRowSelected
                              ? 'bg-slate-800 text-slate-100 font-semibold'
                              : i === 2
                              ? 'bg-slate-900/90 font-semibold text-slate-100 border-t border-slate-700'
                              : 'bg-slate-900/50 text-slate-300'
                          }`}
                        >
                          <td className="py-2.5 px-4 font-sans">{sRow.label}</td>
                          <td className="py-2.5 px-3 text-center text-amber-300">
                            {sRow.blendPct}
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-200">
                            {sRow.finalProductPct}
                          </td>
                          <td className="py-2.5 px-3.5 text-right text-emerald-400">
                            {sRow.volume10ml}
                          </td>
                          <td className="py-2.5 px-4 text-right text-amber-300">
                            {sRow.drops10ml}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {activeFormulaRowDetail && (
              <div className="lg:col-span-5 p-4 sm:p-5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3.5">
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-xs text-slate-400 block">
                    {activeFormulaRowDetail.tier}
                  </span>
                  <h3 className="text-lg font-serif font-bold text-slate-100 mt-0.5">
                    {selectedFormulaRowName}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeFormulaRowDetail.scientificName}
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center font-mono text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Hỗn hợp</span>
                    <strong className="text-sm text-amber-300">
                      {activeFormulaRowDetail.blendPct}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Thành phẩm</span>
                    <strong className="text-sm text-slate-200">
                      {activeFormulaRowDetail.finalProductPct}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Thể tích</span>
                    <strong className="text-sm text-emerald-400">
                      {activeFormulaRowDetail.volume10ml}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Số giọt</span>
                    <strong className="text-sm text-amber-300">
                      {GROUP_LAB_REPORT_DATA.formulaTable10ml.find((r) => r.name === selectedFormulaRowName)?.drops10ml ||
                       GROUP_LAB_REPORT_DATA.summaryRows10ml.find((s) => s.label === selectedFormulaRowName)?.drops10ml ||
                       '—'}
                    </strong>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-1">
                    <span className="font-semibold text-slate-200 block">
                      Hợp chất Hóa học chính:
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      {activeFormulaRowDetail.chemicalCompounds}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-1">
                    <span className="font-semibold text-slate-200 block">
                      Độ bay hơi &amp; cơ chế phân tử:
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      {activeFormulaRowDetail.volatilityAndMechanism}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-1">
                    <span className="font-semibold text-slate-200 block">
                      Quan sát thực nghiệm tại phòng thí nghiệm:
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      {activeFormulaRowDetail.observedInLab}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-1">
                    <span className="font-semibold text-slate-200 block">
                      Tiêu chuẩn an toàn IFRA / SDS:
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      {activeFormulaRowDetail.safetyAndIfra}
                    </p>
                  </div>
                </div>

                {/* Thẻ ảnh Mẫu A thực tế sau khi pha chế hoàn thiện */}
                <div className="pt-3 border-t border-slate-800 flex items-center gap-3 bg-slate-900/80 p-3 rounded-lg border border-slate-800/90">
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewImage({
                        src: FLORIS_IMAGES.sampleA,
                        title: 'Mẫu Thực Nghiệm A Thực Tế (10,00 mL)',
                        desc: 'Chai xịt nước hoa 10 mL dán nhãn Mẫu A hoàn thiện của Tổ 1 - 12A13 THPT NTMK sau 72h ủ maceration.',
                      })
                    }
                    className="relative group shrink-0 rounded overflow-hidden border border-slate-700 w-16 h-20 bg-slate-950 block"
                    title="Phóng to ảnh Mẫu A"
                  >
                    <img
                      src={FLORIS_IMAGES.sampleA}
                      alt="Chai nước hoa Mẫu A"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <ZoomIn className="w-3.5 h-3.5 text-white" />
                    </div>
                  </button>
                  <div className="space-y-1 text-xs">
                    <span className="font-serif font-bold text-slate-100 flex items-center gap-1.5">
                      <span>Mẫu A — Thành phẩm phòng lab thực tế</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">10% cốt hương</span>
                    </span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Sản phẩm chai xịt thủy tinh 10 mL được pha theo đúng bảng định lượng trên (20 giọt cốt hương + 180 giọt dung môi).
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* =====================================================================
          MỤC 5: ĐỘ TAN VÀ SỰ HÒA TRỘN CÁC THÀNH PHẦN (KHẢO SÁT GIỚI HẠN DUNG MÔI)
         ===================================================================== */}
      {(activeTab === 'all' || activeTab === 'solvent') && GROUP_LAB_REPORT_DATA.solventSurvey && (
        <section className="p-5 sm:p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs text-slate-400 block">Mục 05</span>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-100 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-emerald-400" />
                <span>{GROUP_LAB_REPORT_DATA.solventSurvey.title}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {GROUP_LAB_REPORT_DATA.solventSurvey.subtitle} · {GROUP_LAB_REPORT_DATA.solventSurvey.description}
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-emerald-300 border border-slate-700">
              Quy chuẩn: 1 giọt = 0,05 mL
            </span>
          </div>

          {/* Khảo sát giới hạn */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
            <h3 className="text-sm font-serif font-bold text-slate-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{GROUP_LAB_REPORT_DATA.solventSurvey.limitSurvey.title}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
              {GROUP_LAB_REPORT_DATA.solventSurvey.limitSurvey.steps.map((st, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                  <span className="font-mono text-emerald-400 font-semibold block mb-1">Bước {i + 1}:</span>
                  <span>{st}</span>
                </div>
              ))}
            </div>
            <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 space-y-1">
              <p><strong>Kết quả khảo sát:</strong> {GROUP_LAB_REPORT_DATA.solventSurvey.limitSurvey.result}</p>
              <p><strong>Kết luận cấu trúc:</strong> {GROUP_LAB_REPORT_DATA.solventSurvey.limitSurvey.conclusion}</p>
            </div>
          </div>

          {/* ẢNH THỰC TẾ KHẢO SÁT ĐỘ TAN & DUNG MÔI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() =>
                setPreviewImage({
                  src: FLORIS_IMAGES.verticalPipetteSolvent,
                  title: 'Thực hành nhỏ giọt khảo sát giới hạn nước cất',
                  desc: 'Cố định 1,00 mL tinh dầu + 8,00 mL ethanol 90%, nhỏ từ từ từng giọt nước cất vuông góc 90° bằng pipet đến khi bắt đầu vẩn đục (đạt ngưỡng 19-20 giọt).',
                })
              }
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all group flex items-center gap-3.5"
            >
              <div className="relative w-20 h-24 rounded-lg overflow-hidden border border-slate-700 shrink-0 bg-slate-900">
                <img
                  src={FLORIS_IMAGES.verticalPipetteSolvent}
                  alt="Nhỏ giọt nước cất khảo sát độ tan"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <ZoomIn className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div className="space-y-1 text-xs">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">Thao tác Lab #1</span>
                <h4 className="font-semibold text-slate-100">Khảo sát ngưỡng bão hòa nước cất</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Nhỏ giọt thẳng đứng 90° để xác định ngưỡng 19–20 giọt (~1,00 mL) nước cất trước khi dung dịch bị đục.
                </p>
              </div>
            </div>

            <div
              onClick={() =>
                setPreviewImage({
                  src: FLORIS_IMAGES.clarityInspectionCup,
                  title: 'Kiểm tra độ trong suốt dung dịch sau hòa trộn',
                  desc: 'Đối chiếu dung dịch trên lòng bàn tay để quan sát độ trong suốt quang học, đảm bảo không có hiện tượng vẩn đục hoặc phân tách lớp chất lỏng.',
                })
              }
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all group flex items-center gap-3.5"
            >
              <div className="relative w-20 h-24 rounded-lg overflow-hidden border border-slate-700 shrink-0 bg-slate-900">
                <img
                  src={FLORIS_IMAGES.clarityInspectionCup}
                  alt="Kiểm tra độ trong suốt dung dịch"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <ZoomIn className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div className="space-y-1 text-xs">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">Thao tác Lab #2</span>
                <h4 className="font-semibold text-slate-100">Kiểm tra độ trong &amp; không phân lớp</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Dung dịch đồng nhất, trong suốt hoàn toàn, chứng minh ethanol 90% đã hòa tan trọn vẹn tinh dầu kỵ nước.
                </p>
              </div>
            </div>
          </div>

          {/* Vai trò 3 thành phần */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {GROUP_LAB_REPORT_DATA.solventSurvey.roles.map((r, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
                <span className="font-mono text-amber-400 text-[11px] block">Vai trò thành phần #{i + 1}</span>
                <h4 className="text-sm font-bold text-slate-100">{r.name}</h4>
                <p className="text-slate-300 leading-relaxed">{r.role}</p>
              </div>
            ))}
          </div>

          {/* Hiện tượng đục, phân lớp & cách khắc phục */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <h4 className="font-semibold text-slate-100 text-sm text-amber-300">Nguyên nhân đục &amp; phân lớp</h4>
              <p className="text-slate-300 leading-relaxed">• {GROUP_LAB_REPORT_DATA.solventSurvey.causesOfCloudinessAndLayering.cloudiness}</p>
              <p className="text-slate-300 leading-relaxed">• {GROUP_LAB_REPORT_DATA.solventSurvey.causesOfCloudinessAndLayering.layering}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <h4 className="font-semibold text-slate-100 text-sm text-emerald-300">Biện pháp khắc phục</h4>
              <ul className="space-y-1.5 text-slate-300 leading-relaxed">
                {GROUP_LAB_REPORT_DATA.solventSurvey.remedies.map((rem, i) => (
                  <li key={i}>✓ {rem}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          MỤC 6: TỈ LỆ HƯƠNG LIỆU 3 MẪU THỰC NGHIỆM (MẪU A, MẪU B, MẪU C)
         ===================================================================== */}
      {(activeTab === 'all' || activeTab === 'variants') && (
        <section className="p-5 sm:p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs text-slate-400 block">Mục 06</span>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-100">
                Ba mẫu tỉ lệ hương liệu thực nghiệm (Mẫu A, Mẫu B, Mẫu C)
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Khảo sát 3 mẫu đối chứng: Mẫu A (10% cốt hương = 20 giọt), Mẫu B (20% cốt hương = 40 giọt), Mẫu C (20% cốt hương = 40 giọt)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {GROUP_LAB_REPORT_DATA.threeExperimentalVariants.map((variant) => {
              const isSelected = selectedVariantId === variant.id;
              return (
                <div
                  key={variant.id}
                  onClick={() => handleSelectAndApplyVariant(variant.id, false)}
                  className={`p-4 rounded-xl border transition-colors cursor-pointer flex flex-col justify-between gap-3.5 ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-500/50'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-serif font-bold text-slate-100">
                          {variant.code}
                        </h3>
                        <p className="text-xs text-slate-400">{variant.subtitle}</p>
                      </div>
                      <span className="text-xs font-mono text-amber-300">
                        {variant.totalFinishedPct}% TP
                      </span>
                    </div>

                    {/* Ảnh thực tế của mẫu */}
                    {variant.imageUrl && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewImage({
                            src: variant.imageUrl!,
                            title: `${variant.code} — ${variant.subtitle}`,
                            desc: `Sản phẩm nước hoa thực tế của nhóm: ${variant.totalVolumeMl}`,
                          });
                        }}
                        className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-900 aspect-[16/10] group/img"
                        title="Bấm để phóng to ảnh mẫu"
                      >
                        <img
                          src={variant.imageUrl}
                          alt={variant.code}
                          className="w-full h-full object-cover object-center group-hover/img:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-slate-950/85 text-[10px] font-mono text-emerald-300 border border-slate-700/80 flex items-center gap-1 shadow">
                          <Eye className="w-2.5 h-2.5" />
                          <span>Ảnh thật</span>
                        </div>
                        <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                          <ZoomIn className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5 text-xs font-mono pt-1">
                      {variant.items.map((it) => (
                        <div
                          key={it.name}
                          className="py-1 px-2.5 rounded bg-slate-900/80 border border-slate-800/80 flex items-center justify-between"
                        >
                          <span className="font-sans text-slate-300">{it.name}</span>
                          <span className="text-slate-200">
                            <strong>{it.finishedPct}%</strong>{' '}
                            <span className="text-slate-400">({it.blendPct}%)</span> ·{' '}
                            <span className="text-emerald-400">{it.ml10}</span>
                            {it.drops && (
                              <span className="ml-1 text-amber-300 font-semibold">({it.drops})</span>
                            )}
                          </span>
                        </div>
                      ))}
                      {variant.solventDetail && (
                        <div className="py-1.5 px-2.5 rounded bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400">
                          <span className="text-slate-300 font-medium block mb-0.5">Dung môi:</span>
                          <span className="text-emerald-400/90">{variant.solventDetail}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectAndApplyVariant(variant.id, false);
                      }}
                      className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-semibold'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      }`}
                    >
                      {isSelected ? 'Đang chọn mẫu này' : 'Chọn xem & nạp'}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectAndApplyVariant(variant.id, true);
                      }}
                      className="py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-800 text-xs font-medium transition-colors whitespace-nowrap"
                    >
                      Nạp &amp; về trang chính
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {activeVariantDetail && (
            <div className="p-4 sm:p-5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3.5">
              <div className="border-b border-slate-800 pb-2.5 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-serif font-bold text-slate-100">
                  {activeVariantDetail.title}
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  {activeVariantDetail.ratioSummary}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-1">
                  <span className="font-semibold text-slate-200 block">
                    1. Mục đích điều chỉnh tỉ lệ:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {activeVariantDetail.purpose}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-1">
                  <span className="font-semibold text-slate-200 block">
                    2. Giải thích cơ chế Hóa học:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {activeVariantDetail.chemistryExplanation}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-1">
                  <span className="font-semibold text-slate-200 block">
                    3. So sánh với mẫu gốc:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {activeVariantDetail.comparisonWithBase}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-1">
                  <span className="font-semibold text-slate-200 block">
                    4. Kết quả theo dõi sau 24h – 72h:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {activeVariantDetail.evaluation24to72h}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* =====================================================================
          MỤC 7 & 8: NGUYÊN LIỆU / DỤNG CỤ VÀ QUY TRÌNH 9 BƯỚC
         ===================================================================== */}
      {(activeTab === 'all' || activeTab === 'tools' || activeTab === 'procedure') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {(activeTab === 'all' || activeTab === 'tools') && (
            <section
              className={`${
                activeTab === 'tools' ? 'lg:col-span-12' : 'lg:col-span-5'
              } p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4`}
            >
              <div>
                <span className="text-xs text-slate-400 block">Mục 07</span>
                <h2 className="text-lg font-serif font-bold text-slate-100">
                  Nguyên liệu &amp; dụng cụ chuẩn bị
                </h2>
              </div>

              <div className="space-y-1.5">
                {GROUP_LAB_REPORT_DATA.materialsAndToolsDetails.map((tool, i) => {
                  const isSelected = selectedToolIdx === i;
                  return (
                    <div key={i} className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedToolIdx(isSelected ? null : i)}
                        className={`w-full p-3 rounded-lg border text-left transition-colors flex items-start justify-between gap-2 text-xs ${
                          isSelected
                            ? 'bg-slate-800/90 border-slate-700 text-slate-100 font-semibold'
                            : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="font-mono text-slate-500 shrink-0">0{i + 1}.</span>
                          <span>{tool.title}</span>
                        </div>
                      </button>

                      {isSelected && (
                        <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs ml-4">
                          <p className="text-slate-300 leading-relaxed">
                            <strong className="text-slate-100">Vai trò:</strong> {tool.role}
                          </p>
                          <p className="text-slate-300 leading-relaxed">
                            <strong className="text-slate-100">Chi tiết kỹ thuật:</strong>{' '}
                            {tool.technicalDetail}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {(activeTab === 'all' || activeTab === 'procedure') && (
            <section
              className={`${
                activeTab === 'procedure' ? 'lg:col-span-12' : 'lg:col-span-7'
              } p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs text-slate-400 block">Mục 08</span>
                  <h2 className="text-lg font-serif font-bold text-slate-100">
                    Quy trình tiến hành pha chế (9 bước)
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPreviewImage({
                      src: FLORIS_IMAGES.infographic9Steps,
                      title: 'Sơ đồ Infographic 9 Bước Sản Xuất Nước Hoa Floris',
                      desc: 'Quy trình chuẩn hóa từ chuẩn bị, đong hương liệu, pha dung môi, ủ maceration 72h đến chiết và hoàn thiện.',
                    })
                  }
                  className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded border border-slate-800"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Xem Infographic gốc</span>
                </button>
              </div>

              {/* Infographic 9 bước trực quan */}
              <div
                onClick={() =>
                  setPreviewImage({
                    src: FLORIS_IMAGES.infographic9Steps,
                    title: 'Sơ đồ Infographic 9 Bước Sản Xuất Nước Hoa Floris',
                    desc: 'Quy trình chuẩn hóa từ chuẩn bị, đong hương liệu, pha dung môi, ủ maceration 72h đến chiết và hoàn thiện.',
                  })
                }
                className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-2 cursor-pointer group hover:border-emerald-500/50 transition-all"
                title="Bấm để xem infographic đầy đủ ở độ nét cao"
              >
                <img
                  src={FLORIS_IMAGES.infographic9Steps}
                  alt="Infographic 9 Bước Sản Xuất Nước Hoa Floris"
                  className="w-full h-auto max-h-64 object-contain rounded-lg group-hover:scale-[1.01] transition-transform"
                  loading="lazy"
                />
                <div className="absolute bottom-4 right-4 px-2.5 py-1 rounded-lg bg-slate-950/85 text-xs font-mono text-emerald-300 border border-slate-700 flex items-center gap-1.5 shadow-lg">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Phóng to Infographic</span>
                </div>
              </div>

              {/* Ảnh thao tác thực tế: Đong nhỏ giọt hương liệu */}
              <div
                onClick={() =>
                  setPreviewImage({
                    src: FLORIS_IMAGES.pipetteDroppingTestTube,
                    title: 'Thực hành nhỏ giọt tinh dầu "LÀI" & "VANI" vào ống nghiệm',
                    desc: 'Thao tác thực tế của nhóm: Sử dụng pipet nhỏ giọt chính xác từng nốt hương liệu theo bảng định lượng vào ống nghiệm.',
                  })
                }
                className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-3 cursor-pointer hover:border-emerald-500/40 transition-colors group"
              >
                <div className="relative w-24 h-16 rounded overflow-hidden border border-slate-700 shrink-0 bg-slate-900">
                  <img
                    src={FLORIS_IMAGES.pipetteDroppingTestTube}
                    alt="Thao tác nhỏ giọt tinh dầu"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <ZoomIn className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                <div className="space-y-0.5 text-xs">
                  <span className="font-semibold text-slate-100 flex items-center gap-1.5">
                    <span>Hình ảnh thực tế: Đong nhỏ giọt hương liệu</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">Bước 2 &amp; 3</span>
                  </span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Nhỏ giọt tinh dầu Hoa nhài (LÀI) và Vanilla (VANI) vào ống nghiệm sạch theo đúng số giọt chuẩn.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {GROUP_LAB_REPORT_DATA.procedureStepDetails.map((stepObj, i) => {
                  const isSelected = selectedStepIdx === i;
                  return (
                    <div key={i} className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedStepIdx(isSelected ? null : i)}
                        className={`w-full p-3.5 rounded-lg border text-left transition-colors flex items-start justify-between gap-3 text-xs ${
                          isSelected
                            ? 'bg-slate-800/90 border-emerald-500/40 text-slate-100'
                            : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="font-mono text-emerald-400 font-semibold shrink-0">
                            Bước {stepObj.stepNumber}:
                          </span>
                          <div>
                            <span className="font-semibold text-slate-100 block mb-0.5">
                              {stepObj.title}
                            </span>
                            <span className="text-slate-400 leading-relaxed">{stepObj.content}</span>
                          </div>
                        </div>
                      </button>

                      {isSelected && (
                        <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 text-xs ml-4">
                          <span className="font-semibold text-slate-200 block">
                            Hướng dẫn chi tiết &amp; lưu ý Hóa học:
                          </span>
                          <p className="text-slate-300 leading-relaxed">
                            {stepObj.specificDetail}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}

      {/* =====================================================================
          MỤC 8: BẢNG SO SÁNH QUY TRÌNH THỦ CÔNG HỌC ĐƯỜNG & SẢN XUẤT THƯƠNG MẠI
         ===================================================================== */}
      {(activeTab === 'all' || activeTab === 'comparison') && GROUP_LAB_REPORT_DATA.schoolVsIndustryTable && (
        <section className="p-5 sm:p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs text-slate-400 block">Mục 08</span>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-100 flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" />
                <span>Bảng so sánh: Quy trình thủ công học đường &amp; Sản xuất thương mại</span>
              </h2>
            </div>
            <span className="text-xs text-slate-400">8 tiêu chí chuẩn hóa</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/90">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-300">
                  <th className="py-3 px-4 font-semibold w-1/5">Tiêu chí</th>
                  <th className="py-3 px-4 font-semibold w-2/5 text-emerald-300">Quy trình thủ công học đường</th>
                  <th className="py-3 px-4 font-semibold w-2/5 text-blue-300">Sản xuất thương mại</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {GROUP_LAB_REPORT_DATA.schoolVsIndustryTable.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 align-top">
                    <td className="py-3 px-4 font-bold text-slate-100">{row.criterion}</td>
                    <td className="py-3 px-4 text-slate-300 leading-relaxed">{row.school}</td>
                    <td className="py-3 px-4 text-slate-300 leading-relaxed">{row.industry}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* =====================================================================
          MỤC 9: QUY TẮC AN TOÀN, BẢO QUẢN & XỬ LÝ TRÀN ĐỔ
         ===================================================================== */}
      {(activeTab === 'all' || activeTab === 'safety') && (
        <section className="p-5 sm:p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div>
            <span className="text-xs text-slate-400 block">Mục 09</span>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-100">
              Quy tắc an toàn phòng thí nghiệm, bảo quản &amp; xử lý tràn đổ
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {GROUP_LAB_REPORT_DATA.safetyRuleDetails.map((sItem, i) => {
              const key = `rule_${i}`;
              const isSelected = selectedSafetyKey === key;
              return (
                <div key={key} className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedSafetyKey(isSelected ? null : key)}
                    className={`w-full p-3 rounded-lg border text-left transition-colors flex items-start justify-between gap-2 text-xs ${
                      isSelected
                        ? 'bg-slate-800/90 border-amber-500/40 text-slate-100 font-medium'
                        : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="font-mono text-slate-500 shrink-0">{sItem.ruleNumber}.</span>
                      <span className="leading-relaxed">{sItem.rule}</span>
                    </div>
                  </button>

                  {isSelected && (
                    <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                      <p className="text-slate-300 leading-relaxed">
                        <strong className="text-slate-100">Giải thích &amp; cách xử trí:</strong>{' '}
                        {sItem.specificDetail}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
              <h3 className="font-semibold text-slate-200">Bảo quản mẫu nước hoa</h3>
              <p className="text-slate-300 leading-relaxed">{GROUP_LAB_REPORT_DATA.storageNote}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
              <h3 className="font-semibold text-slate-200">Xử lý khi xảy ra tràn đổ</h3>
              <p className="text-slate-300 leading-relaxed">{GROUP_LAB_REPORT_DATA.spillResponseNote}</p>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          MỤC 10: ĐÁNH GIÁ BAN ĐẦU CỦA NHÓM
         ===================================================================== */}
      {(activeTab === 'all' || activeTab === 'chemistry_eval') && (
        <section className="p-5 sm:p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs text-slate-400 block">Mục 10</span>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-100">
                Bảng thông số Hóa học &amp; đánh giá sản phẩm ban đầu
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setIsEditingLabNotes((prev) => !prev)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-400" />
              <span>{isEditingLabNotes ? 'Lưu ghi chú' : 'Chỉnh sửa ghi chú'}</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/90">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400">
                  <th className="py-3 px-4 font-medium">Tầng hương</th>
                  <th className="py-3 px-4 font-medium">Nguyên liệu &amp; hợp chất</th>
                  <th className="py-3 px-4 font-medium text-center">Tỉ lệ hợp hương</th>
                  <th className="py-3 px-4 font-medium text-center">Nồng độ thành phẩm</th>
                  <th className="py-3 px-4 font-medium">Ghi nhận mùi hương</th>
                  <th className="py-3 px-4 font-medium">Tham chiếu IFRA Cat.4</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {calculatedIngredients.map((ing) => (
                  <tr key={ing.slotKey} className="hover:bg-slate-900/40 align-top">
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-200 block">{ing.tierLabel}</span>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        {ing.volatilityNote}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-100 block">{ing.name}</span>
                      <span className="text-[11px] text-slate-400 block">
                        {ing.scientificName}
                      </span>
                      {ing.chemicalCompounds && (
                        <p className="text-[11px] text-slate-400 mt-1 font-mono">
                          {ing.chemicalCompounds}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-amber-300">
                      {ing.percentage}%
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      <strong className="text-slate-200">
                        {ing.finalProductConcentrationPercent}%
                      </strong>
                      <span className="block text-[11px] text-slate-400">
                        {ing.volumeMl} mL
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      {isEditingLabNotes ? (
                        <textarea
                          rows={3}
                          value={ing.observedLabNote || ''}
                          onChange={(e) =>
                            onUpdateSlotObservedNote(
                              ing.slotKey as FormulaSlot['key'],
                              e.target.value
                            )
                          }
                          className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-xs text-slate-100"
                        />
                      ) : (
                        <p className="text-slate-300 leading-relaxed">{ing.observedLabNote}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <span className="font-mono text-emerald-400 block">
                        ≤ {ing.ifraMaxPercent}% thành phẩm
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        {ing.ifraTechnicalReference}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900/90 border-t border-slate-800 font-mono text-xs">
                  <td className="py-3 px-4 font-sans font-semibold text-slate-200" colSpan={2}>
                    Tổng cộng ({totalVolume} mL thành phẩm)
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-amber-300">
                    {totalPercentage}%
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-200">
                    {concentrationPercent}% ({pureFragranceMl} mL) + {100 - concentrationPercent}% cồn ({carrierAlcoholMl} mL)
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-400" colSpan={2}>
                    Đầu {tierTotals.top}% · Giữa {tierTotals.heart}% · Cuối {tierTotals.base}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-medium block">
                1. Trạng thái vật lý &amp; độ hòa tan:
              </span>
              <p className="text-slate-200 leading-relaxed">{initialEvalState.physicalState}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-medium block">
                2. Diễn biến mùi hương theo thời gian:
              </span>
              <p className="text-slate-200 leading-relaxed">{initialEvalState.scentEvolution}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-emerald-400 font-medium block">
                3. Ưu điểm của mẫu gốc:
              </span>
              <p className="text-slate-200 leading-relaxed">{initialEvalState.strengths}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-amber-300 font-medium block">
                4. Vấn đề đặt ra để thử nghiệm cải tiến:
              </span>
              <p className="text-slate-200 leading-relaxed">{initialEvalState.pointsToImprove}</p>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          MỤC 11: NGUỒN TÀI LIỆU THAM KHẢO KHOA HỌC (IFRA, TISSERAND, PMC)
         ===================================================================== */}
      {(activeTab === 'all' || activeTab === 'references') && GROUP_LAB_REPORT_DATA.references && (
        <section className="p-5 sm:p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs text-slate-400 block">Mục 11</span>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <span>Nguồn tài liệu tham khảo khoa học &amp; Tiêu chuẩn an toàn</span>
              </h2>
            </div>
            <span className="text-xs text-slate-400">Trích xuất từ phiếu thực hành của nhóm</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {GROUP_LAB_REPORT_DATA.references.map((ref) => (
              <a
                key={ref.sourceNumber}
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 transition-colors flex flex-col justify-between gap-3 group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Nguồn {ref.sourceNumber}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors">
                    {ref.org}
                  </h4>
                  <p className="text-xs text-slate-400">
                    <strong className="text-slate-300">Tác giả/Tổ chức:</strong> {ref.author}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-1 text-[11px] text-slate-400 font-mono">
                  <span className="text-slate-500 truncate" title={ref.url}>
                    {ref.url}
                  </span>
                  <span className="text-emerald-400/80">Ngày truy cập: {ref.accessDate}</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* LIGHTBOX MODAL CHO HÌNH ẢNH ĐỘ NÉT CAO */}
      {previewImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/90">
              <div>
                <h3 className="font-serif font-bold text-slate-100 text-sm sm:text-base">
                  {previewImage.title}
                </h3>
                {previewImage.desc && (
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {previewImage.desc}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors shrink-0 ml-3"
                title="Đóng xem ảnh"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 bg-slate-950 flex items-center justify-center overflow-auto max-h-[75vh]">
              <img
                src={previewImage.src}
                alt={previewImage.title}
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
