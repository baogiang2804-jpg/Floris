import React, { useState, useEffect, useRef } from 'react';
import {
  FlaskConical,
  CheckCircle2,
  Download,
  Copy,
  Check,
  QrCode,
  Mic,
  RotateCcw,
  Edit3,
  Volume2,
  VolumeX,
  Printer,
  Send,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  EXPERIMENTAL_BASELINE_FORMULA,
  GROUP_LAB_REPORT_DATA,
  FLORIS_IMAGES,
} from '../data/perfumeData';
import {
  CalculatedIngredient,
  FormulaSlot,
  StudentScientificEvaluation,
  generatePresentationReportCsv,
  downloadCsvFile,
} from '../utils/perfumeCalculations';
import {
  safeRequestPerfumeAdjustment,
  safeRequestTTS,
  speakWithBrowserSynthesis,
} from '../utils/aiPerfumeEngine';

interface PresentationShowcaseHubProps {
  seasonKey: 'spring' | 'summer' | 'autumn' | 'winter';
  seasonLabel: string;
  totalVolume: number;
  concentrationName: string;
  concentrationPercent: number;
  pureFragranceMl: number;
  carrierAlcoholMl: number;
  slots: FormulaSlot[];
  calculatedIngredients: CalculatedIngredient[];
  tierTotals: { top: number; heart: number; base: number };
  totalPercentage: number;
  isValidTotal: boolean;
  perfumeName: string;
  isQrVisitorMode?: boolean;
  onRestoreExperimentalBaseline: () => void;
  onUpdateSlotObservedNote: (slotKey: FormulaSlot['key'], note: string) => void;
  onApplyAdjustedFormula: (
    adjustedItems: { slotKey: FormulaSlot['key']; newPercentage: number }[],
    proposedName?: string,
    summaryNote?: string
  ) => void;
  onSaveProposedToDrawer: (
    adjustedItems: { slotKey: FormulaSlot['key']; newPercentage: number }[],
    proposedName: string,
    note: string
  ) => void;
  onOpenVoiceWidget: () => void;
  onAutoBalance: () => void;
  onOpenExperimentalPopup?: () => void;
  onOpenExperimentalWeb?: () => void;
}

const PRESET_AI_QUESTIONS = [
  {
    id: 'fresher',
    label: 'Tôi muốn mùi nước hoa tươi mát hơn.',
    note: 'Tăng nốt Hoa nhài ở tầng đầu (tương tự định hướng Mẫu B)',
  },
  {
    id: 'fruity',
    label: 'Tôi muốn hương quả đào ngọt dịu rõ hơn.',
    note: 'Tăng nốt Đào ở tầng giữa để mùi hương mọng nước, trẻ trung',
  },
  {
    id: 'less_strong',
    label: 'Tôi muốn giảm cảm giác nồng, mùi thanh khiết nhẹ nhàng.',
    note: 'Cân bằng nốt hương, hạ bớt độ ngọt ấm, tăng độ trong trẻo',
  },
  {
    id: 'sweeter',
    label: 'Tôi muốn tăng độ ngọt ấm và lưu hương lâu hơn.',
    note: 'Tăng Xạ hương trắng và Vanilla ở tầng cuối (định hướng Mẫu C)',
  },
  {
    id: 'keep_signature',
    label: 'Tôi muốn thay đổi tỉ lệ nhưng vẫn giữ đặc trưng Floris.',
    note: 'Cân đối 4 nốt: Nhài, Đào, Xạ hương trắng, Vanilla',
  },
];

const CHEMISTRY_KNOWLEDGE_CHIPS = [
  {
    title: 'Độ bay hơi & phân tử khối (M)',
    text: 'Các hydrocarbon monoterpene ở tầng đầu (như D-Limonene C₁₀H₁₆, M=136 g/mol) không phân cực, khối lượng phân tử nhỏ nên lực tương tác liên phân tử yếu, áp suất hơi cao và tốc độ bay hơi nhanh ngay khi xịt.',
  },
  {
    title: 'Nhóm chức -OH & liên kết hydro ở tầng giữa',
    text: 'Tinh dầu tầng giữa chứa các terpene alcohol và alcohol thơm (Phenylethyl alcohol, Linalool, Geraniol) có nhóm chức -OH phân cực tạo liên kết hydro với nhau và với dung môi Ethanol, giúp bay hơi chậm hơn tầng đầu và giữ hương ổn định 2–4 giờ.',
  },
  {
    title: 'Chất định hương (Fixative) & định luật Raoult',
    text: 'Xạ hương trắng (vòng macrocyclic C₁₅–C₁₇, M≈250–270 g/mol) và Vanillin có áp suất hơi rất thấp. Theo định luật Raoult (P_i = x_i · P°_i), chúng làm giảm áp suất hơi riêng phần của các chất dễ bay hơi, giúp giữ mùi lâu hơn.',
  },
  {
    title: 'Phân biệt tỉ lệ hợp hương và nồng độ thành phẩm',
    text: 'Tỉ lệ phối trộn trong cốt hương luôn có tổng bằng 100%, nhưng khi pha thành nước hoa hoàn chỉnh (EDP 20% trong Ethanol 95%), nồng độ thực tế của mỗi chất trong dung dịch bằng Tỉ lệ hợp hương × 20%. Giới hạn an toàn IFRA Cat. 4 được tính trên nồng độ thành phẩm này.',
  },
];

const STUDENT_EVAL_STORAGE_KEY = 'floris_student_scientific_eval_v1';

export const PresentationShowcaseHub: React.FC<PresentationShowcaseHubProps> = ({
  seasonKey,
  seasonLabel,
  totalVolume,
  concentrationName,
  concentrationPercent,
  pureFragranceMl,
  carrierAlcoholMl,
  slots,
  calculatedIngredients,
  tierTotals,
  totalPercentage,
  isValidTotal,
  perfumeName,
  isQrVisitorMode = false,
  onRestoreExperimentalBaseline,
  onUpdateSlotObservedNote,
  onApplyAdjustedFormula,
  onOpenVoiceWidget,
  onOpenExperimentalPopup,
  onOpenExperimentalWeb,
}) => {
  const [isEditingLabNotes, setIsEditingLabNotes] = useState(false);
  const [showMoreLabDetails, setShowMoreLabDetails] = useState(false);
  const [activeVariantCode, setActiveVariantCode] = useState<string>('Mẫu A - Gốc');
  const [initialEvalState, setInitialEvalState] = useState(
    EXPERIMENTAL_BASELINE_FORMULA.initialEvaluation
  );

  const handleLoadLabVariant = (variantId: string) => {
    if (variantId === 'sample_a_original') {
      setActiveVariantCode('Mẫu A - Gốc');
      onApplyAdjustedFormula(
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
    } else if (variantId === 'sample_b_fresher') {
      setActiveVariantCode('Mẫu B - Tươi hơn');
      onApplyAdjustedFormula(
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
    } else if (variantId === 'sample_c_sweeter') {
      setActiveVariantCode('Mẫu C - Dịu/Ngọt hơn');
      onApplyAdjustedFormula(
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
    }
  };

  const [userRequest, setUserRequest] = useState<string>(
    'Tôi muốn mùi nước hoa tươi mát hơn.'
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [showQrPanel, setShowQrPanel] = useState<boolean>(isQrVisitorMode);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [studentEval, setStudentEval] = useState<StudentScientificEvaluation>(() => {
    try {
      const saved = localStorage.getItem(STUDENT_EVAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      isReasonableRating: 'very_reasonable',
      isReasonableComment:
        'Đề xuất của AI hợp lý vì đã điều chỉnh đúng nhóm nguyên liệu tạo nên sắc thái mùi mà người tham quan yêu cầu, đồng thời tổng tỉ lệ phối trộn được giữ đúng bằng 100%.',
      chemistryExplanation:
        'Giải thích theo Hóa học: Tinh dầu tầng đầu (Hoa nhài) giàu Benzyl acetate và Linalool có áp suất hơi cao, lan tỏa nhanh nét hoa thanh khiết. Tầng giữa (Đào) chứa γ-undecalactone tạo hương trái cây ngọt dịu, mọng nước. Tầng cuối (Xạ hương trắng, Vanilla) có phân tử khối lớn và áp suất hơi rất thấp, đóng vai trò chất định hương (fixative) làm giảm áp suất hơi riêng phần của các cấu tử nhẹ theo định luật Raoult.',
      groupDecision: 'agree',
      groupDecisionReason:
        'Nhóm đồng ý với tỉ lệ điều chỉnh cân đối giữa 4 nguyên liệu chính: Hoa nhài, Đào, Xạ hương trắng và Vanilla. Nhóm kiểm soát chặt chẽ dung môi Ethanol 90% và nước cất không quá 20 giọt để dung dịch không bị đục.',
      verificationExperimentPlan:
        '1. Pha mẫu thử nghiệm quy mô 10,00 mL theo đúng số giọt chuẩn (1 giọt = 0,05 mL).\n2. Thử mùi trên que giấy thử ở 3 mốc thời gian: 15 phút đầu (tầng đầu hoa nhài), 2 giờ (tầng giữa đào) và sau 6 giờ (tầng cuối xạ hương - vanilla).\n3. Theo dõi độ trong suốt sau 24h, 48h và 72h ủ mẫu.',
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STUDENT_EVAL_STORAGE_KEY, JSON.stringify(studentEval));
    } catch {
      // ignore
    }
  }, [studentEval]);

  const [copiedReport, setCopiedReport] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const qrShareUrl = React.useMemo(() => {
    if (typeof window === 'undefined') return '';
    const baseUrl = window.location.origin + window.location.pathname;
    const slotCompact = slots
      .map((s) => `${s.key}:${s.ingredientId}:${s.percentage}`)
      .join(',');
    const params = new URLSearchParams({
      qr: '1',
      season: seasonKey,
      vol: String(totalVolume),
      conc: String(concentrationPercent),
      name: perfumeName,
      s: slotCompact,
    });
    return `${baseUrl}?${params.toString()}`;
  }, [seasonKey, totalVolume, concentrationPercent, perfumeName, slots]);

  const handleRunAIConsultation = async (customPromptText?: string) => {
    const queryToUse = (customPromptText ?? userRequest).trim();
    if (!queryToUse) {
      setAiError('Vui lòng chọn câu hỏi có sẵn hoặc nhập yêu cầu cải tiến mùi hương.');
      return;
    }
    if (customPromptText) {
      setUserRequest(customPromptText);
    }

    setIsAnalyzing(true);
    setAiError(null);
    setAppliedSuccess(false);

    try {
      const data = await safeRequestPerfumeAdjustment({
        userRequest: queryToUse,
        seasonLabel,
        totalVolume,
        concentrationName,
        concentrationPercent,
        ingredients: calculatedIngredients,
        tierTotals,
      });

      setAiResult(data);

      if (data?.studentReviewHints) {
        setStudentEval((prev) => ({
          ...prev,
          isReasonableComment: data.studentReviewHints?.reasonableHint || prev.isReasonableComment,
          chemistryExplanation:
            data.studentReviewHints?.chemistryKnowledgeHint || prev.chemistryExplanation,
          verificationExperimentPlan:
            data.studentReviewHints?.experimentVerificationHint || prev.verificationExperimentPlan,
        }));
      }
    } catch (err: any) {
      setAiError(err?.message || 'Không thể kết nối với hệ thống phân tích.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (!aiResult && !isAnalyzing && isValidTotal) {
      handleRunAIConsultation('Tôi muốn mùi nước hoa tươi mát hơn.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const stopSpeaking = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const handleSpeakText = async (text: string) => {
    if (!text) return;
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    stopSpeaking();
    setIsSpeaking(true);

    try {
      const ttsResult = await safeRequestTTS(text);
      if (ttsResult.audioBase64) {
        const audio = new Audio(`data:${ttsResult.mimeType || 'audio/wav'};base64,${ttsResult.audioBase64}`);
        audioPlayerRef.current = audio;
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => {
          speakWithBrowserSynthesis(text, () => setIsSpeaking(false));
        };
        await audio.play();
        return;
      }

      speakWithBrowserSynthesis(text, () => setIsSpeaking(false));
    } catch {
      speakWithBrowserSynthesis(text, () => setIsSpeaking(false));
    }
  };

  const handleExportFullReportCsv = () => {
    if (!aiResult) return;
    const hypothesisText = aiResult.olfactoryPredictionHypothesis
      ? `${aiResult.olfactoryPredictionHypothesis.overallChange} | Mở đầu: ${aiResult.olfactoryPredictionHypothesis.topStage} | Hương giữa: ${aiResult.olfactoryPredictionHypothesis.heartStage} | Hương cuối: ${aiResult.olfactoryPredictionHypothesis.baseStage}`
      : aiResult.analysisSummary;

    const csv = generatePresentationReportCsv({
      baselineTitle: perfumeName || EXPERIMENTAL_BASELINE_FORMULA.title,
      seasonLabel,
      totalVolume,
      concentrationName,
      concentrationPercent,
      pureFragranceMl,
      carrierAlcoholMl,
      userRequest,
      proposedPerfumeName: aiResult.proposedPerfumeName,
      analysisSummary: aiResult.analysisSummary,
      olfactoryHypothesisText: hypothesisText,
      comparisonItems: aiResult.comparisonItems || [],
      studentEvaluation: studentEval,
    });

    downloadCsvFile(
      csv,
      `bao_cao_thuc_nghiem_floris_${totalVolume}ml.csv`
    );
  };

  const handleCopyPresentationReport = async () => {
    if (!aiResult) return;
    const lines = [
      `BÁO CÁO THỰC NGHIỆM & THỬ NGHIỆM CẢI TIẾN NƯỚC HOA FLORIS`,
      `• Công thức thực nghiệm gốc: ${perfumeName} (${seasonLabel})`,
      `• Quy chuẩn pha chế: Chai ${totalVolume} mL | ${concentrationName} (${concentrationPercent}% cốt hương = ${pureFragranceMl} mL tinh dầu + ${carrierAlcoholMl} mL Ethanol 95%)`,
      ``,
      `1. Yêu cầu điều chỉnh mùi hương:`,
      `"${userRequest}"`,
      ``,
      `2. So sánh công thức gốc và công thức đề xuất (${aiResult.proposedPerfumeName} - Tổng tỉ lệ = 100%):`,
      ...(aiResult.comparisonItems || []).map((item: any) => {
        const sign = item.deltaPercentage > 0 ? '+' : '';
        return `- [${item.tierLabel}] ${item.name}: Gốc ${item.oldPercentage}% (${item.oldFinalProductConcPercent}% thành phẩm) -> Đề xuất ${item.newPercentage}% (${item.newFinalProductConcPercent}% thành phẩm) [${sign}${item.deltaPercentage}%] | Lý do: ${item.reason}`;
      }),
      ``,
      `3. Giả thuyết dự đoán sự thay đổi mùi hương (cần kiểm chứng thực nghiệm):`,
      `- Tổng quan: ${aiResult.olfactoryPredictionHypothesis?.overallChange || aiResult.analysisSummary}`,
      `- Tầng đầu (0-20p): ${aiResult.olfactoryPredictionHypothesis?.topStage || ''}`,
      `- Tầng giữa (20p-3h): ${aiResult.olfactoryPredictionHypothesis?.heartStage || ''}`,
      `- Tầng cuối (>3h): ${aiResult.olfactoryPredictionHypothesis?.baseStage || ''}`,
      ``,
      `4. Nhận xét & đánh giá Hóa học của nhóm:`,
      `- Tính hợp lý: ${studentEval.isReasonableComment}`,
      `- Giải thích Hóa học: ${studentEval.chemistryExplanation}`,
      `- Quyết định của nhóm: ${studentEval.groupDecisionReason}`,
      `- Phương án thực nghiệm kiểm chứng: ${studentEval.verificationExperimentPlan}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(lines);
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 3000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-8">
      {/* =====================================================================
          PHẦN 1: CÔNG THỨC NƯỚC HOA THỰC NGHIỆM BAN ĐẦU CỦA NHÓM
         ===================================================================== */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-6">
        {/* Header Báo Cáo Thực Hành */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="text-emerald-400 font-medium">01. Công thức thực nghiệm ban đầu</span>
              <span aria-hidden="true">·</span>
              <span>Chủ đề: {GROUP_LAB_REPORT_DATA.topic}</span>
              <span aria-hidden="true">·</span>
              <span>Mẫu đang chọn: {activeVariantCode}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100">
              Phiếu thực hành nước hoa {GROUP_LAB_REPORT_DATA.productName} (Quy chuẩn 10,00 mL)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Định hướng mùi hương: <strong className="text-slate-200">{GROUP_LAB_REPORT_DATA.emotionalDirection}</strong> — đây là công thức gốc nhóm đã pha chế để làm cơ sở phân tích và điều chỉnh.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onOpenExperimentalWeb && (
              <button
                type="button"
                onClick={onOpenExperimentalWeb}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Chuyển sang Web riêng</span>
              </button>
            )}

            {onOpenExperimentalPopup && (
              <button
                type="button"
                onClick={onOpenExperimentalPopup}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mở Pop-up</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowQrPanel((prev) => !prev)}
              className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span>{showQrPanel ? 'Ẩn mã QR' : 'Mã QR tương tác'}</span>
            </button>

            <button
              type="button"
              onClick={onRestoreExperimentalBaseline}
              className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
              title="Đặt lại đúng công thức nước hoa thực nghiệm ban đầu của nhóm"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Đặt lại mẫu gốc</span>
            </button>
          </div>
        </div>

        {/* Collapsible QR Code Panel */}
        {showQrPanel && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            <div className="md:col-span-3 flex flex-col items-center">
              <div className="p-3 bg-white rounded-xl border border-slate-700">
                <QRCodeSVG
                  value={qrShareUrl}
                  size={136}
                  bgColor="#FFFFFF"
                  fgColor="#0F172A"
                  level="M"
                  includeMargin={false}
                />
              </div>
              <span className="text-xs text-slate-400 mt-2">
                Quét mã để mở trên điện thoại
              </span>
            </div>
            <div className="md:col-span-9 space-y-2">
              <h3 className="text-base font-serif font-bold text-slate-100">
                Chia sẻ công thức thực nghiệm qua mã QR
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Khi cô giáo hoặc các nhóm khác quét mã này bằng điện thoại, trang web sẽ mở đúng công thức hiện tại ({perfumeName}) để mọi người tự nhập câu hỏi và xem phương án điều chỉnh của AI.
              </p>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400 truncate">
                {qrShareUrl}
              </div>
            </div>
          </div>
        )}

        {/* Tóm tắt 3 tầng hương & Chọn nhanh 3 mẫu thực nghiệm A, B, C kèm ảnh thật */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Ảnh chai mẫu đang chọn */}
            <div className="relative w-14 h-18 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shrink-0 shadow-md">
              <img
                src={
                  activeVariantCode.includes('Mẫu C')
                    ? FLORIS_IMAGES.sampleC
                    : activeVariantCode.includes('Mẫu B')
                    ? FLORIS_IMAGES.sampleB
                    : FLORIS_IMAGES.sampleA
                }
                alt={activeVariantCode}
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex items-end justify-center pb-0.5">
                <span className="text-[9px] font-mono text-emerald-300 font-bold">10 mL</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300">
                <span>
                  <strong className="text-amber-300">Hương đầu:</strong> {GROUP_LAB_REPORT_DATA.olfactoryPyramidSummary.top}
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>
                  <strong className="text-rose-300">Hương giữa:</strong> {GROUP_LAB_REPORT_DATA.olfactoryPyramidSummary.heart}
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>
                  <strong className="text-emerald-300">Hương cuối:</strong> {GROUP_LAB_REPORT_DATA.olfactoryPyramidSummary.base}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Đang nạp: <strong className="text-emerald-300">{activeVariantCode}</strong> (Quy chuẩn 1 giọt = 0,05 mL · Tổng thành phẩm 10,00 mL = 200 giọt).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {GROUP_LAB_REPORT_DATA.threeExperimentalVariants.map((variant) => {
              const isSelected = activeVariantCode === variant.code;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => handleLoadLabVariant(variant.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  {isSelected ? `Đang chọn: ${variant.code}` : variant.code}
                </button>
              );
            })}
          </div>
        </div>

        {/* BẢNG CÔNG THỨC NƯỚC HOA THỰC NGHIỆM GỐC (Hiển thị trực tiếp ngay khi mở ứng dụng) */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-200">
              Bảng thành phần nguyên liệu, tỉ lệ phối trộn và ghi nhận mùi hương thực tế
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditingLabNotes((prev) => !prev)}
                className="text-xs px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                <span>{isEditingLabNotes ? 'Xong ghi chú' : 'Sửa ghi chú quan sát'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowMoreLabDetails((prev) => !prev)}
                className="text-xs px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1 transition-colors"
              >
                <span>{showMoreLabDetails ? 'Ẩn quy trình & dụng cụ' : 'Xem thêm dụng cụ & quy trình'}</span>
                {showMoreLabDetails ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-xs text-slate-400">
                  <th className="py-3 px-4 font-medium">Nguyên liệu &amp; hợp chất chính</th>
                  <th className="py-3 px-4 font-medium">Tầng hương</th>
                  <th className="py-3 px-4 font-medium text-center">Tỉ lệ hợp hương</th>
                  <th className="py-3 px-4 font-medium text-center">Nồng độ thành phẩm ({concentrationPercent}%)</th>
                  <th className="py-3 px-4 font-medium">Đặc điểm mùi hương quan sát</th>
                  <th className="py-3 px-4 font-medium">Giới hạn IFRA (Cat. 4)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-xs">
                {calculatedIngredients.map((ing) => (
                  <tr key={ing.slotKey} className="hover:bg-slate-900/40 transition-colors align-top">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: ing.color }}
                        />
                        <span className="font-semibold text-slate-100 text-xs sm:text-sm">
                          {ing.name}
                        </span>
                      </div>
                      <span className="block text-[11px] text-slate-400 mt-0.5">
                        {ing.scientificName} · {ing.scentFamily}
                      </span>
                      {ing.chemicalCompounds && (
                        <p className="text-[11px] text-slate-400 mt-1 font-mono">
                          {ing.chemicalCompounds}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-200 block">
                        {ing.tierLabel}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug max-w-[200px]">
                        {ing.volatilityNote}
                      </p>
                    </td>

                    <td className="py-3 px-4 text-center font-mono">
                      <span className="text-sm font-semibold text-amber-300">
                        {ing.percentage}%
                      </span>
                      <span className="block text-[11px] text-slate-500 mt-0.5">
                        trên 100% hương
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-mono">
                      <span className="text-sm font-semibold text-slate-200">
                        {ing.finalProductConcentrationPercent}%
                      </span>
                      <span className="block text-[11px] text-slate-400 mt-0.5">
                        {ing.volumeMl} mL (~{ing.drops} giọt)
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
                          className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                        />
                      ) : (
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {ing.observedLabNote}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <span
                        className={`text-xs font-mono font-medium block ${
                          ing.isExceedingIfra ? 'text-amber-300' : 'text-emerald-400'
                        }`}
                      >
                        Tối đa ≤ {ing.ifraMaxPercent}% thành phẩm
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
                    Tổng cộng công thức ({totalVolume} mL thành phẩm: {pureFragranceMl} mL cốt hương + {carrierAlcoholMl} mL Ethanol 95%)
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-amber-300">
                    {totalPercentage}%
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-200">
                    {concentrationPercent}% hương + {100 - concentrationPercent}% cồn
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-400" colSpan={2}>
                    Tỉ lệ 3 tầng: Đầu {tierTotals.top}% · Giữa {tierTotals.heart}% · Cuối {tierTotals.base}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Kết quả đánh giá sản phẩm ban đầu của nhóm */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-semibold text-slate-200">
              Kết quả đánh giá mẫu thực nghiệm ban đầu của nhóm
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Đánh giá cảm quan: <strong className="text-emerald-400">{initialEvalState.panelScore}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-1">
              <span className="text-slate-400 font-medium block">
                1. Trạng thái dung dịch
              </span>
              <p className="text-slate-300 leading-relaxed">{initialEvalState.physicalState}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-1">
              <span className="text-slate-400 font-medium block">
                2. Diễn biến mùi theo thời gian
              </span>
              <p className="text-slate-300 leading-relaxed">{initialEvalState.scentEvolution}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-1">
              <span className="text-emerald-400 font-medium block">
                3. Ưu điểm ghi nhận
              </span>
              <p className="text-slate-300 leading-relaxed">{initialEvalState.strengths}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-1">
              <span className="text-amber-300 font-medium block">
                4. Điểm cần thử nghiệm cải tiến
              </span>
              <p className="text-slate-300 leading-relaxed">{initialEvalState.pointsToImprove}</p>
            </div>
          </div>
        </div>

        {/* Mở rộng xem nhanh Dụng cụ, Quy trình 7 bước & An toàn ngay tại trang chính nếu muốn */}
        {showMoreLabDetails && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2 border-t border-slate-800">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <h4 className="text-xs font-semibold text-slate-200">
                Nguyên liệu &amp; dụng cụ thực hành
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                {GROUP_LAB_REPORT_DATA.materialsAndTools.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-slate-500">·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <h4 className="text-xs font-semibold text-slate-200">
                Quy trình pha chế (10,00 mL)
              </h4>
              <ol className="space-y-1.5 text-xs text-slate-400">
                {GROUP_LAB_REPORT_DATA.procedureSteps.map((stepText, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <span className="font-mono text-slate-500 shrink-0">{i + 1}.</span>
                    <span>{stepText}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <h4 className="text-xs font-semibold text-slate-200">
                Quy tắc an toàn &amp; bảo quản
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-400 max-h-56 overflow-y-auto pr-1">
                {GROUP_LAB_REPORT_DATA.safetyRules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <span className="font-mono text-slate-500 shrink-0">{i + 1}.</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>

      {/* =====================================================================
          PHẦN 2: AI TƯ VẤN CẢI TIẾN NƯỚC HOA
         ===================================================================== */}
      <section
        id="ai-improvement-advisor-section"
        className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs text-amber-400 font-medium block">
              02. Tương tác &amp; điều chỉnh công thức
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100 mt-0.5">
              AI tư vấn cải tiến mùi hương nước hoa
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Chọn một yêu cầu gợi ý bên dưới hoặc tự nhập mong muốn thay đổi mùi hương để AI phân tích các thành phần hiện có và đề xuất tỉ lệ mới.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenVoiceWidget}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#2D6344] to-[#3B7A57] hover:from-[#245237] hover:to-[#2D6344] text-white text-xs font-semibold shadow-xs flex items-center gap-2 self-start sm:self-auto shrink-0 transition-all ring-2 ring-[#3B7A57]/20 group"
            title="Mở trợ lý giọng nói Gemini Live để tương tác trực tiếp"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-200"></span>
            </span>
            <Mic className="w-3.5 h-3.5 text-emerald-100 group-hover:scale-110 transition-transform" />
            <span>Gemini Live (Nói trực tiếp)</span>
          </button>
        </div>

        {/* 5 Preset Questions */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300 block">
            Câu hỏi gợi ý (bấm để phân tích ngay):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {PRESET_AI_QUESTIONS.map((qItem) => {
              const isSelected = userRequest === qItem.label;
              return (
                <button
                  key={qItem.id}
                  type="button"
                  disabled={isAnalyzing}
                  onClick={() => handleRunAIConsultation(qItem.label)}
                  className={`p-3.5 rounded-xl border text-left transition-colors ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-500/50 text-slate-100'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <p className="text-xs sm:text-sm font-semibold leading-snug">
                    “{qItem.label}”
                  </p>
                  <span className="block text-[11px] text-slate-400 mt-1">
                    {qItem.note}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Input Box */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-medium text-slate-300 block">
            Hoặc tự nhập yêu cầu của bạn:
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={userRequest}
              onChange={(e) => setUserRequest(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleRunAIConsultation();
                }
              }}
              placeholder="Ví dụ: Tôi muốn mùi nước hoa tươi mát hơn, giảm cảm giác ngọt ở tầng cuối..."
              className="flex-1 px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            />
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={() => handleRunAIConsultation()}
              className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60 shrink-0 whitespace-nowrap"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang phân tích công thức...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Phân tích &amp; đề xuất công thức mới</span>
                </>
              )}
            </button>
          </div>
        </div>

        {aiError && (
          <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200">
            {aiError}
          </div>
        )}
      </section>

      {/* =====================================================================
          PHẦN 3: CÔNG THỨC AI ĐỀ XUẤT & BẢNG SO SÁNH ĐỐI CHIẾU
         ===================================================================== */}
      {aiResult && (
        <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="text-amber-400 font-medium">03. Phương án điều chỉnh từ AI</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400 font-mono">
                  Đã kiểm tra tổng tỉ lệ = {aiResult.validationReport?.validatedSum ?? 100}%
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100">
                Công thức đề xuất: “{aiResult.proposedPerfumeName}”
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Yêu cầu: <strong className="text-slate-200">“{userRequest}”</strong> — {aiResult.analysisSummary}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() =>
                  handleSpeakText(
                    `${aiResult.spokenResponse}. Giả thuyết dự đoán mùi hương: ${
                      aiResult.olfactoryPredictionHypothesis?.overallChange || ''
                    }`
                  )
                }
                className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dừng đọc</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Nghe giọng đọc Gemini Live</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  onApplyAdjustedFormula(
                    aiResult.comparisonItems.map((c: any) => ({
                      slotKey: c.slotKey,
                      newPercentage: c.newPercentage,
                    })),
                    aiResult.proposedPerfumeName,
                    userRequest
                  );
                  setAppliedSuccess(true);
                }}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Check className="w-3.5 h-3.5" />
                <span>
                  {appliedSuccess
                    ? 'Đã nạp vào thanh trượt'
                    : 'Áp dụng thử lên thanh trượt'}
                </span>
              </button>
            </div>
          </div>

          {/* Side-by-side comparison table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-xs text-slate-400">
                  <th className="py-3 px-4 font-medium">Nguyên liệu &amp; tầng hương</th>
                  <th className="py-3 px-4 font-medium text-center">Công thức gốc</th>
                  <th className="py-3 px-4 font-medium text-center text-amber-300">
                    Công thức AI đề xuất
                  </th>
                  <th className="py-3 px-4 font-medium text-center">Thay đổi (Δ%)</th>
                  <th className="py-3 px-4 font-medium">Lý do điều chỉnh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-xs">
                {(aiResult.comparisonItems || []).map((item: any) => {
                  const delta = item.deltaPercentage || 0;
                  const deltaTone =
                    delta > 0
                      ? 'text-emerald-400'
                      : delta < 0
                      ? 'text-rose-400'
                      : 'text-slate-500';

                  return (
                    <tr key={item.slotKey} className="hover:bg-slate-900/40 transition-colors align-top">
                      <td className="py-3 px-4">
                        <span className="text-[11px] text-slate-400 block">
                          {item.tierLabel}
                        </span>
                        <p className="font-semibold text-slate-100 mt-0.5 text-xs sm:text-sm">
                          {item.name}
                        </p>
                        <span className="text-[11px] text-slate-500">{item.scentFamily}</span>
                      </td>

                      {/* Original Formula */}
                      <td className="py-3 px-4 text-center font-mono">
                        <span className="text-sm font-semibold text-slate-200">
                          {item.oldPercentage}%
                        </span>
                        <span className="block text-[11px] text-slate-400">
                          Thành phẩm: {item.oldFinalProductConcPercent ?? Number(((item.oldPercentage * concentrationPercent) / 100).toFixed(2))}%
                        </span>
                        <span className="block text-[11px] text-slate-500">
                          ({item.oldVolumeMl} mL)
                        </span>
                      </td>

                      {/* AI Proposed Formula */}
                      <td className="py-3 px-4 text-center font-mono bg-slate-900/40">
                        <span className="text-sm font-semibold text-amber-300">
                          {item.newPercentage}%
                        </span>
                        <span className="block text-[11px] text-slate-300">
                          Thành phẩm: {item.newFinalProductConcPercent ?? Number(((item.newPercentage * concentrationPercent) / 100).toFixed(2))}%
                        </span>
                        <span className="block text-[11px] text-slate-400">
                          ({item.newVolumeMl} mL · ~{item.newDrops} giọt)
                        </span>
                      </td>

                      {/* Percentage Change Delta */}
                      <td className="py-3 px-4 text-center font-mono">
                        <span className={`font-semibold text-xs ${deltaTone}`}>
                          {delta > 0 ? `+${delta}%` : `${delta}%`}
                        </span>
                      </td>

                      {/* Reason */}
                      <td className="py-3 px-4 text-slate-300 leading-relaxed max-w-md">
                        {item.reason}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900/90 border-t border-slate-800 font-mono text-xs">
                  <td className="py-3 px-4 font-sans font-semibold text-slate-200">
                    Tổng tỉ lệ hợp hương (kiểm tra tự động = 100%)
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-300">
                    {totalPercentage}% ({tierTotals.top}/{tierTotals.heart}/{tierTotals.base}%)
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-emerald-400">
                    {aiResult.validationReport?.validatedSum ?? 100}% ({aiResult.newTierTotals?.top}/{aiResult.newTierTotals?.heart}/{aiResult.newTierTotals?.base}%)
                  </td>
                  <td className="py-3 px-4 text-center text-slate-400">0%</td>
                  <td className="py-3 px-4 font-sans text-slate-400">
                    Tổng 6 nguyên liệu giữ nguyên {pureFragranceMl} mL cốt hương trong {totalVolume} mL thành phẩm.
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* OLFACTORY CHANGE PREDICTION (HYPOTHESIS) */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <h3 className="text-base font-serif font-bold text-slate-100">
                Dự đoán sự thay đổi về mùi hương (Giả thuyết của AI)
              </h3>
              <span className="text-xs text-amber-300">
                Lưu ý: Đây là giả thuyết lý thuyết, chưa phải kết quả thực nghiệm đã chứng minh
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {aiResult.olfactoryPredictionHypothesis?.overallChange || aiResult.analysisSummary}
            </p>

            {aiResult.olfactoryPredictionHypothesis && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800/90 space-y-1">
                  <span className="font-medium text-amber-300 block">
                    Tầng đầu (0 – 25 phút)
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {aiResult.olfactoryPredictionHypothesis.topStage}
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800/90 space-y-1">
                  <span className="font-medium text-rose-300 block">
                    Tầng giữa (25 phút – 3 giờ)
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {aiResult.olfactoryPredictionHypothesis.heartStage}
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800/90 space-y-1">
                  <span className="font-medium text-emerald-300 block">
                    Tầng cuối (&gt; 3 giờ)
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {aiResult.olfactoryPredictionHypothesis.baseStage}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* =====================================================================
          PHẦN 4: NHÓM HỌC SINH ĐÁNH GIÁ & PHẢN BIỆN HÓA HỌC
         ===================================================================== */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-6">
        <div className="pb-4 border-b border-slate-800">
          <span className="text-xs text-slate-400 font-medium block">
            04. Phân tích &amp; kiểm chứng thực nghiệm
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100 mt-0.5">
            Phần nhận xét &amp; đánh giá đề xuất của nhóm học sinh
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            AI đưa ra giả thuyết điều chỉnh tỉ lệ; nhóm vận dụng kiến thức Hóa học (độ bay hơi, nhóm chức, liên kết hydro, giới hạn IFRA) để đánh giá và đề xuất thực nghiệm kiểm chứng.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Câu hỏi 1 */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <label className="text-sm font-semibold text-slate-100 block">
              1. Đề xuất của AI có hợp lý không? Vì sao?
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'very_reasonable', label: 'Hợp lý, có cơ sở khoa học' },
                { id: 'partially_reasonable', label: 'Hợp lý một phần (cần tinh chỉnh)' },
                { id: 'not_reasonable', label: 'Chưa hợp lý' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    setStudentEval((p) => ({
                      ...p,
                      isReasonableRating: opt.id as StudentScientificEvaluation['isReasonableRating'],
                    }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    studentEval.isReasonableRating === opt.id
                      ? 'bg-slate-800 border-amber-500/50 text-amber-200 font-semibold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <textarea
              rows={4}
              value={studentEval.isReasonableComment}
              onChange={(e) =>
                setStudentEval((p) => ({ ...p, isReasonableComment: e.target.value }))
              }
              placeholder="Nhận xét của nhóm về tính hợp lý trong đề xuất tăng/giảm tỉ lệ của AI..."
              className="w-full p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Câu hỏi 2 */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <label className="text-sm font-semibold text-slate-100 block">
              2. Kiến thức Hóa học nào giúp giải thích sự thay đổi?
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CHEMISTRY_KNOWLEDGE_CHIPS.map((chip) => (
                <button
                  key={chip.title}
                  type="button"
                  onClick={() =>
                    setStudentEval((p) => ({
                      ...p,
                      chemistryExplanation: p.chemistryExplanation
                        ? `${p.chemistryExplanation}\n• ${chip.title}: ${chip.text}`
                        : `• ${chip.title}: ${chip.text}`,
                    }))
                  }
                  className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] transition-colors"
                  title="Bấm để chèn gợi ý kiến thức Hóa học"
                >
                  + {chip.title}
                </button>
              ))}
            </div>
            <textarea
              rows={4}
              value={studentEval.chemistryExplanation}
              onChange={(e) =>
                setStudentEval((p) => ({ ...p, chemistryExplanation: e.target.value }))
              }
              placeholder="Giải thích bằng kiến thức Hóa học: cấu tạo phân tử, nhóm chức (terpene, alcohol, ester), liên kết hydro, khối lượng phân tử và tốc độ bay hơi..."
              className="w-full p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Câu hỏi 3 */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <label className="text-sm font-semibold text-slate-100 block">
              3. Nhóm đồng ý hay không đồng ý với AI?
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'agree', label: 'Đồng ý hoàn toàn' },
                {
                  id: 'agree_with_modifications',
                  label: 'Đồng ý có điều kiện (chỉnh lại thực tế)',
                },
                { id: 'disagree', label: 'Không đồng ý (giữ mẫu gốc)' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    setStudentEval((p) => ({
                      ...p,
                      groupDecision: opt.id as StudentScientificEvaluation['groupDecision'],
                    }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    studentEval.groupDecision === opt.id
                      ? 'bg-slate-800 border-emerald-500/50 text-emerald-200 font-semibold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <textarea
              rows={4}
              value={studentEval.groupDecisionReason}
              onChange={(e) =>
                setStudentEval((p) => ({ ...p, groupDecisionReason: e.target.value }))
              }
              placeholder="Nêu rõ quyết định của nhóm và lý do (ví dụ: lưu ý giới hạn IFRA Category 4 của tinh dầu Bergamot tự nhiên trên da)..."
              className="w-full p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Câu hỏi 4 */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <label className="text-sm font-semibold text-slate-100 block">
              4. Cần tiến hành thực nghiệm gì để kiểm chứng?
            </label>
            <p className="text-xs text-slate-400">
              Các bước pha mẫu đối chứng và thử mùi thực tế trên giấy thử (blotter):
            </p>
            <textarea
              rows={4}
              value={studentEval.verificationExperimentPlan}
              onChange={(e) =>
                setStudentEval((p) => ({ ...p, verificationExperimentPlan: e.target.value }))
              }
              placeholder="Mô tả các bước pha mẫu đối chứng (10 mL), thử mùi trên giấy thử ở các mốc thời gian 15 phút, 2 giờ, 6 giờ..."
              className="w-full p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* =====================================================================
            PHẦN 5: XUẤT KẾT QUẢ & NHẬN XÉT
           ===================================================================== */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-100">
              Xuất bảng đối chiếu công thức &amp; phần nhận xét của nhóm
            </h3>
            <p className="text-xs text-slate-400">
              Lưu lại toàn bộ số liệu công thức gốc, đề xuất của AI (tổng 100%) và 4 mục nhận xét Hóa học sang file .CSV hoặc sao chép vào bài thuyết trình.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportFullReportCsv}
              disabled={!aiResult}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải báo cáo (.CSV)</span>
            </button>

            <button
              type="button"
              onClick={handleCopyPresentationReport}
              disabled={!aiResult}
              className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-medium text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {copiedReport ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Đã sao chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Sao chép nội dung</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-medium text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>In phiếu</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
