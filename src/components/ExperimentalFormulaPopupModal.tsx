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
  Users,
  Layers,
  FlaskConical,
} from 'lucide-react';
import { GROUP_LAB_REPORT_DATA, FLORIS_IMAGES } from '../data/perfumeData';
import { FormulaSlot, downloadCsvFile } from '../utils/perfumeCalculations';

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

type PopupSectionTab =
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
  | 'references';

export const ExperimentalFormulaPopupModal: React.FC<ExperimentalFormulaPopupModalProps> = ({
  isOpen,
  onClose,
  onApplyVariantToStudio,
  onOpenExperimentalWeb,
}) => {
  const [activeTab, setActiveTab] = useState<PopupSectionTab>('all');

  const [selectedConceptId, setSelectedConceptId] = useState<string>('concept_main');
  const [selectedFormulaRowName, setSelectedFormulaRowName] = useState<string>('Hoa nhài 🌼');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('sample_a_original');
  const [selectedToolIdx, setSelectedToolIdx] = useState<number | null>(0);
  const [selectedStepIdx, setSelectedStepIdx] = useState<number | null>(0);
  const [selectedSafetyKey, setSelectedSafetyKey] = useState<string | null>('rule_0');

  const [copiedText, setCopiedText] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

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
      setTimeout(() => onClose(), 300);
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
    <div className="fixed inset-0 z-50 bg-[#2D3A2F]/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-[#FAF8F5] border-t sm:border border-[#E5DFD5] rounded-t-3xl sm:rounded-2xl max-w-6xl w-full overflow-hidden shadow-2xl max-h-[94vh] sm:max-h-[92vh] flex flex-col">
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 rounded-full bg-[#D8D1C5] mx-auto mt-2.5 sm:hidden" />

        {/* TOP HEADER */}
        <div className="relative bg-[#FFFFFF] p-4 sm:p-5 border-b border-[#E8E1D5]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-[#FAF8F5] hover:bg-[#F2ECE1] flex items-center justify-center text-[#5A6A5E] hover:text-[#1F2F23] transition-colors border border-[#E3DBD0]"
            title="Đóng cửa sổ"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pr-10">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="text-emerald-400 font-medium">Phiếu thực hành nước hoa</span>
                <span aria-hidden="true">·</span>
                <span>Chủ đề: {GROUP_LAB_REPORT_DATA.topic}</span>
                <span aria-hidden="true">·</span>
                <span>Sản phẩm: {GROUP_LAB_REPORT_DATA.productName}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100">
                Công thức nước hoa thực nghiệm ban đầu (10,00 mL)
              </h2>
              <p className="text-xs text-slate-400">
                Định hướng cảm xúc: <strong className="text-slate-200">{GROUP_LAB_REPORT_DATA.emotionalDirection}</strong> · 2,00 mL hỗn hợp hương + 8,00 mL Ethanol 95%.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {onOpenExperimentalWeb && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenExperimentalWeb();
                  }}
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Chuyển sang Web riêng</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCopyFullLabSheet}
                className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
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
                className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Tải CSV (10 mL)</span>
              </button>
            </div>
          </div>

          {/* Section Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-3 border-t border-slate-800">
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
              { id: 'references', label: '11. Nguồn tham khảo' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as PopupSectionTab)}
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

        {toastMsg && (
          <div className="bg-slate-950 border-b border-slate-800 px-5 py-2 text-xs text-emerald-300 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* SCROLLABLE BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* MỤC 1: Ý TƯỞNG & 3 TẦNG HƯƠNG */}
          {(activeTab === 'all' || activeTab === 'concept') && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-base font-serif font-bold text-slate-100">
                  1. Ý tưởng sản phẩm &amp; cấu trúc 3 tầng hương
                </h3>
                <span className="text-xs text-slate-400">
                  Chọn từng mục để xem thuyết minh chi tiết
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {GROUP_LAB_REPORT_DATA.conceptAndPyramidDetails.map((item) => {
                  const isSelected = selectedConceptId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedConceptId(item.id)}
                      className={`p-3.5 rounded-xl border text-left transition-colors flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'bg-slate-800/90 border-emerald-500/50 text-slate-100'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="text-[11px] font-mono text-slate-400 block">
                          {item.badge}
                        </span>
                        <h4 className="text-sm font-serif font-bold text-slate-100">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-400">{item.subtitle}</p>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
                        {item.summary}
                      </p>
                    </button>
                  );
                })}
              </div>

              {activeConceptDetail && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="border-b border-slate-800 pb-2 flex flex-wrap items-baseline justify-between gap-2">
                    <h4 className="text-sm font-semibold text-slate-100">
                      {activeConceptDetail.title}
                    </h4>
                    <span className="text-xs font-mono text-slate-400">
                      {activeConceptDetail.subtitle}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {activeConceptDetail.specificContent.map((point, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 text-slate-300 leading-relaxed"
                      >
                        {point}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MỤC 2: CÂU CHUYỆN THƯƠNG HIỆU & CONCEPT */}
          {(activeTab === 'all' || activeTab === 'story') && GROUP_LAB_REPORT_DATA.brandStoryAndConcept && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-base font-serif font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>2. {GROUP_LAB_REPORT_DATA.brandStoryAndConcept.tagline}</span>
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  {GROUP_LAB_REPORT_DATA.brandStoryAndConcept.overallConcept}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs text-slate-300 leading-relaxed">
                <h4 className="font-semibold text-slate-100 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-pink-400" />
                  <span>Câu chuyện thương hiệu</span>
                </h4>
                <p className="whitespace-pre-line">{GROUP_LAB_REPORT_DATA.brandStoryAndConcept.story}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {GROUP_LAB_REPORT_DATA.brandStoryAndConcept.threeKeyAdjectives.map((adj, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase">Tính từ #{i + 1}</span>
                    <h5 className="font-semibold text-slate-100 text-sm">{adj.word}</h5>
                    <p className="text-xs text-slate-300 leading-relaxed">{adj.explanation}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="font-semibold text-slate-200 block">Người dùng mục tiêu (16–25 tuổi):</span>
                  <p className="text-slate-300 leading-relaxed">
                    {GROUP_LAB_REPORT_DATA.brandStoryAndConcept.targetUser.personality} · {GROUP_LAB_REPORT_DATA.brandStoryAndConcept.targetUser.needs}
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="font-semibold text-slate-200 block">Hoàn cảnh &amp; Mùa sử dụng:</span>
                  <p className="text-slate-300 leading-relaxed">
                    {GROUP_LAB_REPORT_DATA.brandStoryAndConcept.usageContext.occasions} · {GROUP_LAB_REPORT_DATA.brandStoryAndConcept.usageContext.season}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* MỤC 3: BẢNG PHÂN TẦNG HƯƠNG & LÍ DO CHỌN NGUYÊN LIỆU */}
          {(activeTab === 'all' || activeTab === 'reasons') && (
            <div className="space-y-3.5">
              <h3 className="text-base font-serif font-bold text-slate-100">
                3. Bảng phân tầng hương &amp; Lí do chọn nguyên liệu
              </h3>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/90">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400">
                      <th className="py-2.5 px-3 font-medium">Tầng hương</th>
                      <th className="py-2.5 px-3 font-medium">Vai trò</th>
                      <th className="py-2.5 px-3 font-medium text-center">Bay hơi</th>
                      <th className="py-2.5 px-3 font-medium">Thời điểm</th>
                      <th className="py-2.5 px-3 font-medium">Nguyên liệu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {GROUP_LAB_REPORT_DATA.scentTierRoles?.map((tier) => (
                      <tr key={tier.tier} className="hover:bg-slate-900/40">
                        <td className="py-2.5 px-3 font-bold text-slate-100">Tầng {tier.tier}</td>
                        <td className="py-2.5 px-3 text-slate-300">{tier.role}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-amber-300">
                            {tier.evaporationRate}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">{tier.perceptionTime}</td>
                        <td className="py-2.5 px-3 font-semibold text-emerald-300">{tier.ingredients}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {GROUP_LAB_REPORT_DATA.ingredientSelectionReasons?.map((reason, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
                    <span className="font-mono text-emerald-400 text-[10px] block">{reason.tier}</span>
                    <h5 className="font-bold text-slate-100 text-sm">{reason.ingredients}</h5>
                    <ul className="space-y-1 text-slate-300">
                      {reason.bulletPoints.map((bp, i) => (
                        <li key={i}>• {bp}</li>
                      ))}
                    </ul>
                    <p className="pt-1.5 border-t border-slate-800 text-slate-400 italic text-[11px]">
                      → {reason.conclusion}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MỤC 4: BẢNG CÔNG THỨC GỐC (10,00 mL) */}
          {(activeTab === 'all' || activeTab === 'formula') && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-base font-serif font-bold text-slate-100">
                  4. Bảng công thức gốc thực hành (Quy chuẩn 10,00 mL)
                </h3>
                <span className="text-xs text-slate-400">
                  Bấm vào từng dòng nguyên liệu để xem thông tin chi tiết
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-950/90 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400">
                          <th className="py-2.5 px-3.5 font-medium">Thành phần</th>
                          <th className="py-2.5 px-3 font-medium text-center">% hỗn hợp</th>
                          <th className="py-2.5 px-3 font-medium text-center">% TP</th>
                          <th className="py-2.5 px-3 text-right font-medium">Thể tích / 10 mL</th>
                          <th className="py-2.5 px-3.5 text-right font-medium text-amber-300">Số giọt (0,05 mL)</th>
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
                              <td className="py-2.5 px-3.5 font-sans">
                                <span className="font-semibold text-slate-100">{row.name}</span>
                                <span className="text-[11px] text-slate-400 ml-1.5">
                                  ({row.tier})
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center font-semibold text-amber-300">
                                {row.blendPct}%
                              </td>
                              <td className="py-2.5 px-3 text-center font-semibold text-slate-200">
                                {row.finalProductPct}%
                              </td>
                              <td className="py-2.5 px-3 text-right font-semibold text-emerald-400">
                                {row.volume10ml}
                              </td>
                              <td className="py-2.5 px-3.5 text-right font-semibold text-amber-300">
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
                              <td className="py-2.5 px-3.5 font-sans">{sRow.label}</td>
                              <td className="py-2.5 px-3 text-center text-amber-300">
                                {sRow.blendPct}
                              </td>
                              <td className="py-2.5 px-3 text-center text-slate-200">
                                {sRow.finalProductPct}
                              </td>
                              <td className="py-2.5 px-3 text-right text-emerald-400">
                                {sRow.volume10ml}
                              </td>
                              <td className="py-2.5 px-3.5 text-right text-amber-300">
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
                  <div className="lg:col-span-5 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="border-b border-slate-800 pb-2.5">
                      <span className="text-xs text-slate-400 block">
                        {activeFormulaRowDetail.tier}
                      </span>
                      <h4 className="text-base font-serif font-bold text-slate-100 mt-0.5">
                        {selectedFormulaRowName}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {activeFormulaRowDetail.scientificName}
                      </p>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center font-mono text-xs">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Hỗn hợp</span>
                        <strong className="text-amber-300">{activeFormulaRowDetail.blendPct}</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Thành phẩm</span>
                        <strong className="text-slate-200">{activeFormulaRowDetail.finalProductPct}</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Thể tích</span>
                        <strong className="text-emerald-400">{activeFormulaRowDetail.volume10ml}</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Số giọt</span>
                        <strong className="text-amber-300">
                          {GROUP_LAB_REPORT_DATA.formulaTable10ml.find((r) => r.name === selectedFormulaRowName)?.drops10ml ||
                           GROUP_LAB_REPORT_DATA.summaryRows10ml.find((s) => s.label === selectedFormulaRowName)?.drops10ml ||
                           '—'}
                        </strong>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-0.5">
                        <span className="font-semibold text-slate-200 block">Hợp chất chính:</span>
                        <p className="text-slate-300 leading-relaxed">
                          {activeFormulaRowDetail.chemicalCompounds}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-0.5">
                        <span className="font-semibold text-slate-200 block">Độ bay hơi &amp; cơ chế:</span>
                        <p className="text-slate-300 leading-relaxed">
                          {activeFormulaRowDetail.volatilityAndMechanism}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-0.5">
                        <span className="font-semibold text-slate-200 block">Quan sát thực tế:</span>
                        <p className="text-slate-300 leading-relaxed">
                          {activeFormulaRowDetail.observedInLab}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-0.5">
                        <span className="font-semibold text-slate-200 block">An toàn IFRA / SDS:</span>
                        <p className="text-slate-300 leading-relaxed">
                          {activeFormulaRowDetail.safetyAndIfra}
                        </p>
                      </div>
                    </div>

                    {/* Mẫu A thực tế */}
                    <div className="pt-2 border-t border-slate-800 flex items-center gap-3 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      <img
                        src={FLORIS_IMAGES.sampleA}
                        alt="Mẫu A"
                        className="w-12 h-16 rounded object-cover border border-slate-700 shrink-0"
                        loading="lazy"
                      />
                      <div className="text-[11px] text-slate-300">
                        <strong className="text-slate-100 block font-serif">Mẫu A Thực Tế (10 mL):</strong>
                        <span className="text-slate-400">Chai xịt thủy tinh dán nhãn Mẫu A hoàn thiện của nhóm sau 72h ủ maceration.</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MỤC 5: ĐỘ TAN VÀ SỰ HÒA TRỘN CÁC THÀNH PHẦN */}
          {(activeTab === 'all' || activeTab === 'solvent') && GROUP_LAB_REPORT_DATA.solventSurvey && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-base font-serif font-bold text-slate-100 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-emerald-400" />
                  <span>5. {GROUP_LAB_REPORT_DATA.solventSurvey.title}</span>
                </h3>
                <span className="text-xs font-mono text-emerald-400">1 giọt = 0,05 mL</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                <h4 className="font-semibold text-slate-100">{GROUP_LAB_REPORT_DATA.solventSurvey.limitSurvey.title}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {GROUP_LAB_REPORT_DATA.solventSurvey.limitSurvey.steps.map((st, i) => (
                    <div key={i} className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      <strong className="text-emerald-400 block mb-0.5">Bước {i + 1}:</strong> {st}
                    </div>
                  ))}
                </div>
                <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-200">
                  <p><strong>Kết quả:</strong> {GROUP_LAB_REPORT_DATA.solventSurvey.limitSurvey.result}</p>
                  <p className="mt-0.5"><strong>Kết luận:</strong> {GROUP_LAB_REPORT_DATA.solventSurvey.limitSurvey.conclusion}</p>
                </div>
              </div>

              {/* Ảnh thực tế khảo sát độ tan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <img
                    src={FLORIS_IMAGES.verticalPipetteSolvent}
                    alt="Nhỏ giọt 90 độ"
                    className="w-14 h-18 rounded object-cover border border-slate-700 shrink-0"
                    loading="lazy"
                  />
                  <div className="text-xs">
                    <strong className="text-slate-100 block">Khảo sát ngưỡng bão hòa</strong>
                    <span className="text-slate-400 text-[11px]">Nhỏ giọt góc 90° để đo ngưỡng 19–20 giọt (~1 mL) nước cất trước khi bị vẩn đục.</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <img
                    src={FLORIS_IMAGES.clarityInspectionCup}
                    alt="Kiểm tra độ trong"
                    className="w-14 h-18 rounded object-cover border border-slate-700 shrink-0"
                    loading="lazy"
                  />
                  <div className="text-xs">
                    <strong className="text-slate-100 block">Kiểm tra độ trong suốt</strong>
                    <span className="text-slate-400 text-[11px]">Dung dịch đồng nhất, trong suốt hoàn toàn, không đục hay tách lớp.</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {GROUP_LAB_REPORT_DATA.solventSurvey.roles.map((r, i) => (
                  <div key={i} className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="font-mono text-amber-400 text-[10px] block">Vai trò #{i + 1}</span>
                    <h5 className="font-bold text-slate-100">{r.name}</h5>
                    <p className="text-slate-300 leading-relaxed">{r.role}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MỤC 6: BA MẪU TỈ LỆ HƯƠNG LIỆU (MẪU A, MẪU B, MẪU C) */}
          {(activeTab === 'all' || activeTab === 'variants') && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-base font-serif font-bold text-slate-100">
                  6. Ba mẫu tỉ lệ hương liệu thực nghiệm (Mẫu A, Mẫu B, Mẫu C)
                </h3>
                <span className="text-xs text-slate-400">
                  Mẫu A (10% = 20 giọt), Mẫu B (20% = 40 giọt), Mẫu C (20% = 40 giọt)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {GROUP_LAB_REPORT_DATA.threeExperimentalVariants.map((variant) => {
                  const isSelected = selectedVariantId === variant.id;
                  return (
                    <div
                      key={variant.id}
                      onClick={() => handleSelectAndApplyVariant(variant.id, false)}
                      className={`p-4 rounded-xl border transition-colors cursor-pointer flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-slate-800/90 border-amber-500/50'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-serif font-bold text-slate-100">
                              {variant.code}
                            </h4>
                            <p className="text-xs text-slate-400">{variant.subtitle}</p>
                          </div>
                          <span className="text-xs font-mono text-amber-300">
                            {variant.totalFinishedPct}% TP
                          </span>
                        </div>

                        {/* Ảnh mẫu thực tế */}
                        {variant.imageUrl && (
                          <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-900 aspect-[16/10]">
                            <img
                              src={variant.imageUrl}
                              alt={variant.code}
                              className="w-full h-full object-cover object-center"
                              loading="lazy"
                            />
                            <div className="absolute top-1.5 right-1.5 px-1.5 py-0.2 rounded bg-slate-950/80 text-[9px] font-mono text-emerald-300 border border-slate-700">
                              Ảnh thật
                            </div>
                          </div>
                        )}

                        <div className="space-y-1 text-xs font-mono">
                          {variant.items.map((it) => (
                            <div
                              key={it.name}
                              className="py-1 px-2 rounded bg-slate-900/80 border border-slate-800/80 flex items-center justify-between"
                            >
                              <span className="font-sans text-slate-300">{it.name}</span>
                              <span className="text-slate-200">
                                <strong>{it.finishedPct}%</strong> ({it.blendPct}%) ·{' '}
                                <span className="text-emerald-400">{it.ml10}</span>
                                {it.drops && (
                                  <span className="ml-1 text-amber-300 font-semibold">({it.drops})</span>
                                )}
                              </span>
                            </div>
                          ))}
                          {variant.solventDetail && (
                            <div className="py-1 px-2 rounded bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400">
                              <span className="text-slate-300 font-medium block">Dung môi:</span>
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
                          {isSelected ? 'Đang chọn mẫu này' : 'Chọn mẫu này'}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectAndApplyVariant(variant.id, true);
                          }}
                          className="py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-800 text-xs font-medium transition-colors"
                        >
                          Nạp &amp; đóng
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {activeVariantDetail && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="border-b border-slate-800 pb-2 flex flex-wrap items-baseline justify-between gap-2">
                    <h4 className="text-sm font-semibold text-slate-100">
                      {activeVariantDetail.title}
                    </h4>
                    <span className="text-xs font-mono text-slate-400">
                      {activeVariantDetail.ratioSummary}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-1">
                      <span className="font-semibold text-slate-200 block">Mục đích điều chỉnh:</span>
                      <p className="text-slate-300 leading-relaxed">{activeVariantDetail.purpose}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-1">
                      <span className="font-semibold text-slate-200 block">Giải thích Hóa học:</span>
                      <p className="text-slate-300 leading-relaxed">
                        {activeVariantDetail.chemistryExplanation}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-1">
                      <span className="font-semibold text-slate-200 block">So sánh với mẫu gốc:</span>
                      <p className="text-slate-300 leading-relaxed">
                        {activeVariantDetail.comparisonWithBase}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-1">
                      <span className="font-semibold text-slate-200 block">Theo dõi sau 24h – 72h:</span>
                      <p className="text-slate-300 leading-relaxed">
                        {activeVariantDetail.evaluation24to72h}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MỤC 7 & 8: DỤNG CỤ VÀ QUY TRÌNH 9 BƯỚC */}
          {(activeTab === 'all' || activeTab === 'tools' || activeTab === 'procedure') && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {(activeTab === 'all' || activeTab === 'tools') && (
                <div
                  className={`${
                    activeTab === 'tools' ? 'lg:col-span-12' : 'lg:col-span-5'
                  } p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3`}
                >
                  <h3 className="text-base font-serif font-bold text-slate-100">
                    7. Nguyên liệu &amp; dụng cụ
                  </h3>
                  <div className="space-y-1.5">
                    {GROUP_LAB_REPORT_DATA.materialsAndToolsDetails.map((tool, i) => {
                      const isSelected = selectedToolIdx === i;
                      return (
                        <div key={i} className="space-y-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedToolIdx(isSelected ? null : i)}
                            className={`w-full p-2.5 rounded-lg border text-left transition-colors flex items-start gap-2 text-xs ${
                              isSelected
                                ? 'bg-slate-800 border-slate-700 text-slate-100 font-semibold'
                                : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                            }`}
                          >
                            <span className="font-mono text-slate-500 shrink-0">0{i + 1}.</span>
                            <span>{tool.title}</span>
                          </button>

                          {isSelected && (
                            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5 text-xs ml-4">
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
                </div>
              )}

              {(activeTab === 'all' || activeTab === 'procedure') && (
                <div
                  className={`${
                    activeTab === 'procedure' ? 'lg:col-span-12' : 'lg:col-span-7'
                  } p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3`}
                >
                  <h3 className="text-base font-serif font-bold text-slate-100">
                    8. Quy trình tiến hành pha chế (9 bước)
                  </h3>

                  {/* Sơ đồ infographic 9 bước */}
                  <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-900 p-1.5">
                    <img
                      src={FLORIS_IMAGES.infographic9Steps}
                      alt="Infographic 9 bước sản xuất Floris"
                      className="w-full h-auto max-h-48 object-contain rounded"
                      loading="lazy"
                    />
                  </div>
                  <div className="space-y-1.5">
                    {GROUP_LAB_REPORT_DATA.procedureStepDetails.map((stepObj, i) => {
                      const isSelected = selectedStepIdx === i;
                      return (
                        <div key={i} className="space-y-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedStepIdx(isSelected ? null : i)}
                            className={`w-full p-3 rounded-lg border text-left transition-colors flex items-start gap-2.5 text-xs ${
                              isSelected
                                ? 'bg-slate-800 border-emerald-500/40 text-slate-100'
                                : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                            }`}
                          >
                            <span className="font-mono text-emerald-400 font-semibold shrink-0">
                              Bước {stepObj.stepNumber}:
                            </span>
                            <div>
                              <span className="font-semibold text-slate-100 block">
                                {stepObj.title}
                              </span>
                              <span className="text-slate-400 leading-relaxed">{stepObj.content}</span>
                            </div>
                          </button>

                          {isSelected && (
                            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5 text-xs ml-4">
                              <p className="text-slate-300 leading-relaxed">
                                <strong className="text-slate-100">Hướng dẫn thực hành:</strong>{' '}
                                {stepObj.specificDetail}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MỤC 8: SO SÁNH HỌC ĐƯỜNG VÀ CÔNG NGHIỆP */}
          {(activeTab === 'all' || activeTab === 'comparison') && GROUP_LAB_REPORT_DATA.schoolVsIndustryTable && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <h3 className="text-base font-serif font-bold text-slate-100 flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-400" />
                <span>8. So sánh quy trình thủ công học đường &amp; Sản xuất thương mại</span>
              </h3>
              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-300">
                      <th className="py-2.5 px-3 font-semibold">Tiêu chí</th>
                      <th className="py-2.5 px-3 font-semibold text-emerald-300">Thủ công học đường</th>
                      <th className="py-2.5 px-3 font-semibold text-blue-300">Sản xuất thương mại</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {GROUP_LAB_REPORT_DATA.schoolVsIndustryTable.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40 align-top">
                        <td className="py-2.5 px-3 font-bold text-slate-100">{row.criterion}</td>
                        <td className="py-2.5 px-3 text-slate-300 leading-relaxed">{row.school}</td>
                        <td className="py-2.5 px-3 text-slate-300 leading-relaxed">{row.industry}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MỤC 9: QUY TẮC AN TOÀN & BẢO QUẢN */}
          {(activeTab === 'all' || activeTab === 'safety') && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3.5">
              <h3 className="text-base font-serif font-bold text-slate-100">
                9. Quy tắc an toàn, bảo quản &amp; xử lý tràn đổ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {GROUP_LAB_REPORT_DATA.safetyRuleDetails.map((sItem, i) => {
                  const key = `rule_${i}`;
                  const isSelected = selectedSafetyKey === key;
                  return (
                    <div key={key} className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedSafetyKey(isSelected ? null : key)}
                        className={`w-full p-2.5 rounded-lg border text-left transition-colors flex items-start gap-2 text-xs ${
                          isSelected
                            ? 'bg-slate-800 border-amber-500/40 text-slate-100 font-medium'
                            : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <span className="font-mono text-slate-500 shrink-0">{sItem.ruleNumber}.</span>
                        <span>{sItem.rule}</span>
                      </button>

                      {isSelected && (
                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1 text-xs">
                          <p className="text-slate-300 leading-relaxed">
                            <strong className="text-slate-100">Giải thích &amp; xử trí:</strong>{' '}
                            {sItem.specificDetail}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <h4 className="font-semibold text-slate-200">Bảo quản:</h4>
                  <p className="text-slate-300 leading-relaxed">{GROUP_LAB_REPORT_DATA.storageNote}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <h4 className="font-semibold text-slate-200">Xử lý tràn đổ:</h4>
                  <p className="text-slate-300 leading-relaxed">{GROUP_LAB_REPORT_DATA.spillResponseNote}</p>
                </div>
              </div>
            </div>
          )}

          {/* MỤC 10: NGUỒN TÀI LIỆU THAM KHẢO */}
          {(activeTab === 'all' || activeTab === 'references') && GROUP_LAB_REPORT_DATA.references && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <h3 className="text-base font-serif font-bold text-slate-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>10. Nguồn tài liệu tham khảo khoa học</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {GROUP_LAB_REPORT_DATA.references.map((ref) => (
                  <a
                    key={ref.sourceNumber}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-colors flex flex-col justify-between gap-2 group text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-emerald-400">Nguồn {ref.sourceNumber}</span>
                        <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-400" />
                      </div>
                      <h5 className="font-semibold text-slate-100 group-hover:text-emerald-300">{ref.org}</h5>
                      <p className="text-slate-400 text-[11px]">{ref.author}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono pt-1.5 border-t border-slate-800">
                      Truy cập: {ref.accessDate}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            Công thức gốc: <strong className="text-slate-200">Floris (10,00 mL)</strong> · Tổ 1 — 12A13 THPT Nguyễn Thị Minh Khai
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenExperimentalWeb && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenExperimentalWeb();
                }}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Chuyển sang Web riêng</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition-colors"
            >
              Đóng cửa sổ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
