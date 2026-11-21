import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Download,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  BookOpen,
  Scale,
  Heart,
  FlaskConical,
  Droplets,
  ShieldCheck,
} from 'lucide-react';
import { GROUP_LAB_REPORT_DATA, FLORIS_IMAGES } from '../data/perfumeData';
import { CalculatedIngredient, FormulaSlot, downloadCsvFile } from '../utils/perfumeCalculations';
import { FlorisSpringEmblem, ScentFamilyVisualBadge } from './SpringDecorations';
import { SpringPerfumeBottleSVG } from './SpringPerfumeBottleSVG';
import { SpringAccordion } from './SpringAccordion';

interface ExperimentalFormulaPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyVariantToStudio?: (
    adjustedItems: { slotKey: FormulaSlot['key']; newPercentage: number }[],
    proposedName?: string,
    summaryNote?: string
  ) => void;
  onOpenGuideModal?: () => void;
  onOpenExperimentalWeb?: () => void;
}

type PopupSectionTab = 'overview' | 'variants' | 'lab' | 'safety';

const LAB_FORMULA_BOTTLE_ITEMS: CalculatedIngredient[] = [
  {
    id: 'top_jasmine',
    slotKey: 'top1',
    tier: 'top',
    tierLabel: 'Hương đầu',
    name: 'Hoa nhài',
    scientificName: 'Jasminum sambac',
    scentFamily: 'Hoa cỏ',
    color: '#FEF08A',
    percentage: 40,
    volumeMl: 0.25,
    drops: 5,
    finalProductConcentrationPercent: 2.5,
    ifraMaxPercent: 5,
    isExceedingIfra: false,
  },
  {
    id: 'heart_peach',
    slotKey: 'heart1',
    tier: 'heart',
    tierLabel: 'Hương giữa',
    name: 'Đào',
    scientificName: 'Prunus persica',
    scentFamily: 'Trái cây',
    color: '#FDBA74',
    percentage: 30,
    volumeMl: 0.2,
    drops: 4,
    finalProductConcentrationPercent: 2.0,
    ifraMaxPercent: 10,
    isExceedingIfra: false,
  },
  {
    id: 'base_musk',
    slotKey: 'base1',
    tier: 'base',
    tierLabel: 'Hương cuối',
    name: 'Xạ hương trắng',
    scientificName: 'Galaxolide / White Musk',
    scentFamily: 'Xạ hương',
    color: '#E2E8F0',
    percentage: 15,
    volumeMl: 0.3,
    drops: 6,
    finalProductConcentrationPercent: 3.0,
    ifraMaxPercent: 15,
    isExceedingIfra: false,
  },
  {
    id: 'base_vanilla',
    slotKey: 'base2',
    tier: 'base',
    tierLabel: 'Hương cuối',
    name: 'Vanilla',
    scientificName: 'Vanillin',
    scentFamily: 'Ngọt dịu',
    color: '#FDE68A',
    percentage: 15,
    volumeMl: 0.25,
    drops: 5,
    finalProductConcentrationPercent: 2.5,
    ifraMaxPercent: 15,
    isExceedingIfra: false,
  },
];

export const ExperimentalFormulaPopupModal: React.FC<ExperimentalFormulaPopupModalProps> = ({
  isOpen,
  onClose,
  onApplyVariantToStudio,
  onOpenExperimentalWeb,
}) => {
  const [activeTab, setActiveTab] = useState<PopupSectionTab>('overview');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('sample_a_original');
  const [copiedText, setCopiedText] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSelectAndApplyVariant = (variantId: string, closeModalAfter = false) => {
    setSelectedVariantId(variantId);

    if (onApplyVariantToStudio) {
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
    }

    if (closeModalAfter) {
      setTimeout(() => onClose(), 250);
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
    showToast('Đã tải CSV thực nghiệm.');
  };

  const handleCopyFullLabSheet = async () => {
    const rawText = `THỰC HÀNH LÀM NƯỚC HOA — FLORIS
Chủ đề: Mùa Xuân
Slogan: Chạm hương xuân, lưu nét dịu dàng
- Hương đầu: Hoa nhài 🌼
- Hương giữa: Đào 🍑
- Hương cuối: Xạ hương trắng 🤍 + Vanilla 🍦

CÔNG THỨC CHUẨN (10,00 mL) (1 giọt = 0,05 mL):
- Hoa nhài: 40% cốt | 0,25 mL | 5 giọt
- Đào: 30% cốt | 0,20 mL | 4 giọt
- Xạ hương trắng: 15% cốt | 0,30 mL | 6 giọt
- Vanilla: 15% cốt | 0,25 mL | 5 giọt
- Dung môi: 9,00 mL (Ethanol 90% 8,00 mL + Nước cất 1,00 mL)`;

    try {
      await navigator.clipboard.writeText(rawText);
      setCopiedText(true);
      showToast('Đã sao chép công thức.');
      setTimeout(() => setCopiedText(false), 3000);
    } catch {
      // ignore
    }
  };

  const activeVariantDetail =
    GROUP_LAB_REPORT_DATA.variantDetails[selectedVariantId] ||
    GROUP_LAB_REPORT_DATA.variantDetails['sample_a_original'];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Phiếu thực hành nước hoa Floris"
      className="fixed inset-0 z-50 bg-[#2B342D]/45 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
    >
      <div className="bg-[#FFFDF8] border-t sm:border-2 border-[#FBCFE8] rounded-t-3xl sm:rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl max-h-[94vh] sm:max-h-[90vh] flex flex-col text-[#2B342D]">
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 rounded-full bg-[#F9A8D4] mx-auto mt-2.5 sm:hidden" />

        {/* TOP HEADER (1 Short Title + 1-3 Word Pill) */}
        <div className="relative bg-gradient-to-r from-[#FFF1F5] via-[#FFFDF5] to-[#ECFDF3] p-4 sm:p-5 border-b border-[#F5DCE4]">
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng phiếu thực hành"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white hover:bg-[#FCE7F3] flex items-center justify-center text-[#5C6B5F] hover:text-[#BE185D] transition-colors border border-[#F3D5E0]"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 pr-11">
            <div className="flex items-center gap-3">
              <FlorisSpringEmblem className="w-12 h-12 shrink-0" />
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-[#BE185D] border border-[#FBCFE8] text-[11px] font-bold">
                  🌸 Mùa Xuân · 10 mL
                </span>
                <h2 className="text-lg sm:text-2xl font-bold text-[#2B342D] mt-1">
                  Phiếu Thực Hành Floris
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {onOpenExperimentalWeb && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenExperimentalWeb();
                  }}
                  className="px-3.5 py-2 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Mở trang riêng</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCopyFullLabSheet}
                className="px-3 py-2 rounded-2xl bg-white hover:bg-[#FFF5F8] text-[#2B342D] border border-[#F3D5E0] text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"
              >
                {copiedText ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span className="text-[#15803D]">Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#EC4899]" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleExportLabReportCsv}
                className="px-3 py-2 rounded-2xl bg-[#FEF9C3] hover:bg-[#FEF08A] text-[#854D0E] border border-[#FDE047] text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV 10 mL</span>
              </button>
            </div>
          </div>

          {/* 4 Visual Section Pills */}
          <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-[#F5DCE4]/70 overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: '🌸 Tổng quan 10 mL' },
              { id: 'variants', label: '🧪 3 Mẫu A · B · C' },
              { id: 'lab', label: '⚗️ Độ tan & 9 Bước' },
              { id: 'safety', label: '🛡️ An toàn & Nguồn' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as PopupSectionTab)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 border ${
                  activeTab === t.id
                    ? 'bg-[#EC4899] text-white border-[#EC4899] shadow-xs'
                    : 'bg-white text-[#5C6B5F] border-[#F3D5E0] hover:border-[#F9A8D4] hover:text-[#2B342D]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {toastMsg && (
          <div className="bg-[#ECFDF3] border-b border-[#BBF7D0] px-5 py-2 text-xs text-[#15803D] font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* SCROLLABLE BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: TỔNG QUAN TRỰC QUAN */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Interactive Perfume Bottle & Proportion Bar */}
              <SpringPerfumeBottleSVG
                ingredients={LAB_FORMULA_BOTTLE_ITEMS}
                totalVolume={10}
                concentrationPercent={10}
                pureFragranceMl={1}
                carrierAlcoholMl={9}
                perfumeName="Floris Gốc"
              />

              {/* 4 Visual Scent Tier Cards (No walls of text) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-3xl bg-[#FFFDF0] border-2 border-[#FDE68A] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FEF08A] text-[#854D0E] text-[11px] font-bold">
                      🌼 Hương đầu
                    </span>
                    <span className="font-mono text-xs font-bold text-[#92400E]">40% cốt</span>
                  </div>
                  <p className="font-bold text-sm text-[#2B342D]">Hoa nhài (5 giọt)</p>
                  <ScentFamilyVisualBadge scentFamily="Hoa cỏ" name="Hoa nhài" />
                </div>

                <div className="p-3.5 rounded-3xl bg-[#FFF5F8] border-2 border-[#FBCFE8] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FBCFE8] text-[#9D174D] text-[11px] font-bold">
                      🍑 Hương giữa
                    </span>
                    <span className="font-mono text-xs font-bold text-[#BE185D]">30% cốt</span>
                  </div>
                  <p className="font-bold text-sm text-[#2B342D]">Đào chín (4 giọt)</p>
                  <ScentFamilyVisualBadge scentFamily="Trái cây" name="Đào" />
                </div>

                <div className="p-3.5 rounded-3xl bg-[#F3FDF6] border-2 border-[#BBF7D0] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#BBF7D0] text-[#166534] text-[11px] font-bold">
                      🍦 Hương cuối
                    </span>
                    <span className="font-mono text-xs font-bold text-[#15803D]">30% cốt</span>
                  </div>
                  <p className="font-bold text-sm text-[#2B342D]">Xạ hương &amp; Vanilla (11 giọt)</p>
                  <ScentFamilyVisualBadge scentFamily="Ngọt dịu" name="Vanilla" />
                </div>
              </div>

              {/* Quick Compact Lab Table */}
              <div className="spring-card p-4 overflow-x-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-[#2B342D]">Bảng định lượng 10,00 mL</h3>
                  <span className="text-[11px] font-mono font-bold text-[#BE185D] bg-[#FCE7F3] px-2.5 py-0.5 rounded-full">
                    1 giọt = 0,05 mL
                  </span>
                </div>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#F3DCE4] text-[#5C6B5F]">
                      <th className="py-2 px-2.5">Thành phần</th>
                      <th className="py-2 px-2 text-center">% cốt</th>
                      <th className="py-2 px-2 text-right">Thể tích</th>
                      <th className="py-2 px-2.5 text-right">Số giọt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F8E8EE] font-mono">
                    {GROUP_LAB_REPORT_DATA.formulaTable10ml.map((row) => (
                      <tr key={row.name} className="hover:bg-[#FFF5F8]">
                        <td className="py-2 px-2.5 font-sans font-bold text-[#2B342D]">
                          {row.name}{' '}
                          <span className="text-[10px] font-normal text-[#5C6B5F]">({row.tier})</span>
                        </td>
                        <td className="py-2 px-2 text-center font-bold text-[#BE185D]">{row.blendPct}%</td>
                        <td className="py-2 px-2 text-right font-bold text-[#15803D]">{row.volume10ml}</td>
                        <td className="py-2 px-2.5 text-right font-bold text-[#92400E]">{row.drops10ml}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#ECFDF3]/50 border-t border-[#BBF7D0] font-mono font-bold">
                    {GROUP_LAB_REPORT_DATA.summaryRows10ml.map((s) => (
                      <tr key={s.label}>
                        <td className="py-2 px-2.5 font-sans text-[#166534]">{s.label}</td>
                        <td className="py-2 px-2 text-center">{s.blendPct}</td>
                        <td className="py-2 px-2 text-right text-[#15803D]">{s.volume10ml}</td>
                        <td className="py-2 px-2.5 text-right text-[#92400E]">{s.drops10ml}</td>
                      </tr>
                    ))}
                  </tfoot>
                </table>
              </div>

              {/* Accordions for long explanations */}
              <div className="space-y-2.5">
                {GROUP_LAB_REPORT_DATA.brandStoryAndConcept && (
                  <SpringAccordion
                    title="Câu chuyện Floris & Chân dung người dùng"
                    badge="Slogan Xuân"
                    tone="sakura"
                    icon={<Heart className="w-4 h-4 text-[#EC4899]" />}
                  >
                    <p className="font-bold text-[#BE185D]">
                      “{GROUP_LAB_REPORT_DATA.brandStoryAndConcept.slogan}”
                    </p>
                    <p className="leading-relaxed whitespace-pre-line">
                      {GROUP_LAB_REPORT_DATA.brandStoryAndConcept.story}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      {GROUP_LAB_REPORT_DATA.brandStoryAndConcept.threeKeyAdjectives.map((adj, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-white border border-[#FBCFE8]">
                          <strong className="block text-[#2B342D]">{adj.word}</strong>
                          <span className="text-[11px] text-[#5C6B5F]">{adj.explanation}</span>
                        </div>
                      ))}
                    </div>
                  </SpringAccordion>
                )}

                <SpringAccordion
                  title="Cơ sở Hóa học & Lí do chọn 4 nguyên liệu"
                  badge="Khoa học"
                  tone="butter"
                  icon={<Sparkles className="w-4 h-4 text-[#D97706]" />}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {GROUP_LAB_REPORT_DATA.ingredientSelectionReasons?.map((reason, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white border border-[#FDE68A] space-y-1">
                        <span className="text-[10px] font-bold text-[#92400E] block">{reason.tier}</span>
                        <strong className="text-xs text-[#2B342D] block">{reason.ingredients}</strong>
                        <ul className="space-y-0.5 text-[11px] text-[#4A4D48]">
                          {reason.bulletPoints.map((bp, i) => (
                            <li key={i}>• {bp}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </SpringAccordion>
              </div>
            </div>
          )}

          {/* TAB 2: 3 MẪU THỰC NGHIỆM A, B, C */}
          {activeTab === 'variants' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {GROUP_LAB_REPORT_DATA.threeExperimentalVariants.map((variant) => {
                  const isSelected = selectedVariantId === variant.id;
                  const barColors = ['#FDE047', '#FDBA74', '#E2E8F0', '#F9A8D4'];
                  return (
                    <div
                      key={variant.id}
                      className={`p-4 rounded-3xl border-2 flex flex-col justify-between gap-3 transition-all ${
                        isSelected
                          ? 'bg-[#FFF1F5] border-[#EC4899] shadow-md'
                          : 'bg-white border-[#F3DCE4] hover:border-[#F9A8D4]'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-[#2B342D]">{variant.code}</h3>
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#FEF9C3] text-[#854D0E] border border-[#FDE047]">
                            {variant.totalFinishedPct}% cốt
                          </span>
                        </div>
                        <p className="text-xs text-[#5C6B5F]">{variant.subtitle}</p>

                        {/* Visual stacked ratio bar for this variant */}
                        <div className="w-full h-3.5 rounded-full overflow-hidden flex border border-[#F3DCE4]">
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

                        <div className="space-y-1 text-xs">
                          {variant.items.map((it) => (
                            <div
                              key={it.name}
                              className="flex items-center justify-between px-2.5 py-1 rounded-xl bg-[#FFFDF8] border border-[#F5E6EC]"
                            >
                              <span className="font-semibold text-[#2B342D]">{it.name}</span>
                              <span className="font-mono text-[11px] text-[#BE185D] font-bold">
                                {it.finishedPct}% ({it.drops})
                              </span>
                            </div>
                          ))}
                        </div>

                        {variant.imageUrl && !failedImages[variant.id] && (
                          <SpringAccordion title="Ảnh mẫu phòng lab" tone="cream">
                            <img
                              src={variant.imageUrl}
                              alt={variant.code}
                              onError={() =>
                                setFailedImages((prev) => ({ ...prev, [variant.id]: true }))
                              }
                              className="w-full h-36 object-cover rounded-xl border border-[#F3DCE4]"
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
                              : 'bg-[#FFF5F8] hover:bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8]'
                          }`}
                        >
                          {isSelected ? 'Đang chọn' : 'Nạp mẫu'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectAndApplyVariant(variant.id, true)}
                          className="py-2 px-3 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold"
                        >
                          Nạp &amp; pha
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {activeVariantDetail && (
                <SpringAccordion
                  title={`Phân tích Hóa học: ${activeVariantDetail.title}`}
                  badge="24h – 72h"
                  tone="leaf"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="p-2.5 rounded-xl bg-white border border-[#BBF7D0]">
                      <strong className="block text-[#15803D]">Mục đích:</strong>
                      <p>{activeVariantDetail.purpose}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#BBF7D0]">
                      <strong className="block text-[#15803D]">Cơ chế Hóa học:</strong>
                      <p>{activeVariantDetail.chemistryExplanation}</p>
                    </div>
                  </div>
                </SpringAccordion>
              )}
            </div>
          )}

          {/* TAB 3: ĐỘ TAN & QUY TRÌNH 9 BƯỚC */}
          {activeTab === 'lab' && (
            <div className="space-y-4">
              {GROUP_LAB_REPORT_DATA.solventSurvey && (
                <div className="spring-card-leaf p-4 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-sm font-bold text-[#166534] flex items-center gap-1.5">
                      <Droplets className="w-4 h-4 text-[#16A34A]" />
                      <span>Khảo sát độ tan &amp; dung môi (80 : 10 : 10)</span>
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-white text-[#15803D] border border-[#86EFAC] text-[11px] font-mono font-bold">
                      Ngưỡng: 19–20 giọt nước cất
                    </span>
                  </div>
                  {/* Ratio bar */}
                  <div className="w-full h-5 rounded-full overflow-hidden flex border border-[#86EFAC] text-[10px] font-bold">
                    <div style={{ width: '80%' }} className="bg-[#DCFCE7] text-[#166534] flex items-center justify-center">
                      80% Ethanol 90°
                    </div>
                    <div style={{ width: '10%' }} className="bg-[#FEF9C3] text-[#854D0E] flex items-center justify-center">
                      10% Nước
                    </div>
                    <div style={{ width: '10%' }} className="bg-[#FBCFE8] text-[#9D174D] flex items-center justify-center">
                      10% Tinh dầu
                    </div>
                  </div>
                </div>
              )}

              <SpringAccordion
                title="Quy trình pha chế 9 bước & Dụng cụ phòng lab"
                badge="9 bước"
                tone="butter"
                defaultOpen
                icon={<FlaskConical className="w-4 h-4 text-[#D97706]" />}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {GROUP_LAB_REPORT_DATA.procedureStepDetails.map((s) => (
                    <div
                      key={s.stepNumber}
                      className="p-2.5 rounded-xl bg-white border border-[#FDE68A] space-y-0.5"
                    >
                      <span className="text-[11px] font-mono font-bold text-[#D97706]">
                        Bước {s.stepNumber} · {s.title}
                      </span>
                      <p className="text-[11px] text-[#4A4D48]">{s.content}</p>
                    </div>
                  ))}
                </div>
              </SpringAccordion>

              {GROUP_LAB_REPORT_DATA.schoolVsIndustryTable && (
                <SpringAccordion
                  title="So sánh quy trình học đường vs Công nghiệp"
                  badge="8 tiêu chí"
                  tone="cream"
                  icon={<Scale className="w-4 h-4 text-[#EC4899]" />}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="border-b border-[#F3DCE4] text-[#5C6B5F]">
                          <th className="py-2 px-2">Tiêu chí</th>
                          <th className="py-2 px-2 text-[#15803D]">Học đường</th>
                          <th className="py-2 px-2 text-[#BE185D]">Công nghiệp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F8E8EE]">
                        {GROUP_LAB_REPORT_DATA.schoolVsIndustryTable.map((row, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-2 font-bold text-[#2B342D]">{row.criterion}</td>
                            <td className="py-2 px-2 text-[#4A4D48]">{row.school}</td>
                            <td className="py-2 px-2 text-[#4A4D48]">{row.industry}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </SpringAccordion>
              )}
            </div>
          )}

          {/* TAB 4: AN TOÀN & NGUỒN THAM KHẢO */}
          {activeTab === 'safety' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {GROUP_LAB_REPORT_DATA.safetyRuleDetails.map((rule) => (
                  <div
                    key={rule.ruleNumber}
                    className="p-3 rounded-2xl bg-white border border-[#FBCFE8] text-xs space-y-1"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-[#BE185D]">
                      <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                      <span>Quy tắc #{rule.ruleNumber}</span>
                    </div>
                    <p className="font-semibold text-[#2B342D]">{rule.rule}</p>
                    <p className="text-[11px] text-[#5C6B5F]">{rule.specificDetail}</p>
                  </div>
                ))}
              </div>

              {GROUP_LAB_REPORT_DATA.references && (
                <SpringAccordion
                  title="Tài liệu khoa học tham khảo (IFRA / Tisserand)"
                  badge={`${GROUP_LAB_REPORT_DATA.references.length} nguồn`}
                  tone="leaf"
                  icon={<BookOpen className="w-4 h-4 text-[#16A34A]" />}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {GROUP_LAB_REPORT_DATA.references.map((ref) => (
                      <a
                        key={ref.sourceNumber}
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-white border border-[#BBF7D0] hover:border-[#16A34A] transition-colors space-y-1 block"
                      >
                        <span className="text-[10px] font-mono font-bold text-[#15803D]">
                          Nguồn {ref.sourceNumber}
                        </span>
                        <h4 className="font-bold text-xs text-[#2B342D]">{ref.org}</h4>
                        <p className="text-[11px] text-[#5C6B5F]">{ref.author}</p>
                      </a>
                    ))}
                  </div>
                </SpringAccordion>
              )}

              {!failedImages['sampleA'] && (
                <SpringAccordion title="Ảnh mẫu A thực tế của nhóm" tone="sakura">
                  <img
                    src={FLORIS_IMAGES.sampleA}
                    alt="Mẫu A Floris"
                    onError={() => setFailedImages((p) => ({ ...p, sampleA: true }))}
                    className="max-h-56 w-auto rounded-2xl border border-[#FBCFE8] mx-auto"
                    loading="lazy"
                  />
                </SpringAccordion>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-[#FFF5F8] border-t border-[#F5DCE4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-bold text-[#5C6B5F]">
            🌸 Floris 10 mL · Tổ 1 — 12A13 THPT NTMK
          </span>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {onOpenExperimentalWeb && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenExperimentalWeb();
                }}
                className="px-4 py-2 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Xem chi tiết</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-2xl bg-[#EC4899] hover:bg-[#DB2777] text-white font-bold text-xs shadow-sm"
            >
              Bắt đầu pha chế 🌸
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
