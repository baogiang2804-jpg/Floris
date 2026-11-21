import React, { useState, useEffect, useRef } from 'react';
import {
  FlaskConical,
  Download,
  Copy,
  Check,
  QrCode,
  Mic,
  MicOff,
  RotateCcw,
  Edit3,
  Volume2,
  VolumeX,
  Printer,
  Send,
  RefreshCw,
  ExternalLink,
  BookOpen,
  Microscope,
  ClipboardCheck,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  EXPERIMENTAL_BASELINE_FORMULA,
  GROUP_LAB_REPORT_DATA,
} from '../data/perfumeData';
import {
  CalculatedIngredient,
  FormulaSlot,
  StudentScientificEvaluation,
  calculateDropsFromMl,
  generatePresentationReportCsv,
  downloadCsvFile,
} from '../utils/perfumeCalculations';
import {
  safeRequestPerfumeAdjustment,
  safeRequestTTS,
  speakWithBrowserSynthesis,
} from '../utils/aiPerfumeEngine';
import {
  SPEECH_LANGUAGE_OPTIONS,
  createMultilingualVoiceSession,
  MultilingualVoiceController,
} from '../utils/multilingualSpeech';
import { SpringPerfumeBottleSVG } from './SpringPerfumeBottleSVG';
import { ScentFamilyVisualBadge } from './SpringDecorations';
import { SpringAccordion } from './SpringAccordion';

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
    emoji: '🌼',
    tag: 'Mẫu B · Tươi',
    label: 'Tôi muốn mùi nước hoa tươi mát hơn.',
  },
  {
    id: 'fruity',
    emoji: '🍑',
    tag: 'Ngọt dịu',
    label: 'Tôi muốn hương quả đào ngọt dịu rõ hơn.',
  },
  {
    id: 'less_strong',
    emoji: '🫧',
    tag: 'Thanh khiết',
    label: 'Tôi muốn giảm cảm giác nồng, mùi thanh khiết nhẹ nhàng.',
  },
  {
    id: 'sweeter',
    emoji: '🍦',
    tag: 'Mẫu C · Lưu lâu',
    label: 'Tôi muốn tăng độ ngọt ấm và lưu hương lâu hơn.',
  },
  {
    id: 'keep_signature',
    emoji: '🌸',
    tag: 'Cân bằng',
    label: 'Tôi muốn thay đổi tỉ lệ nhưng vẫn giữ đặc trưng Floris.',
  },
];

const CHEMISTRY_KNOWLEDGE_CHIPS = [
  {
    title: 'Độ bay hơi & M',
    text: 'Monoterpene ở tầng đầu (Benzyl acetate, Linalool) có phân tử khối nhỏ nên áp suất hơi cao và bay hơi nhanh ngay khi xịt.',
  },
  {
    title: 'Liên kết Hydro (-OH)',
    text: 'Nhóm -OH phân cực ở tầng giữa tạo liên kết hydro với Ethanol giúp giữ hương ổn định 2–4 giờ.',
  },
  {
    title: 'Định luật Raoult',
    text: 'Xạ hương trắng (M≈250–270 g/mol) và Vanillin có áp suất hơi rất thấp, ghìm giữ các phân tử nhẹ lưu hương lâu hơn.',
  },
  {
    title: 'Nồng độ IFRA Cat. 4',
    text: 'Nồng độ thành phẩm (%) = Tỉ lệ hợp hương × Nồng độ dòng nước hoa / 100. Luôn đối chiếu chuẩn an toàn IFRA.',
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
  const [activeVariantCode, setActiveVariantCode] = useState<string>('Mẫu A - Gốc');
  const [initialEvalState] = useState(EXPERIMENTAL_BASELINE_FORMULA.initialEvaluation);

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
        'Mẫu A - Gốc: Nhài 1%, Đào 2%, Xạ hương trắng 2,5%, Vanilla 4,5%'
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
        'Mẫu B - Tươi hơn: Nhài 6%, Đào 4%, Xạ hương trắng 5%, Vanilla 5%'
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
        'Mẫu C - Dịu/Ngọt hơn: Nhài 4%, Đào 4%, Xạ hương trắng 6%, Vanilla 6%'
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
  const [isListeningSpeech, setIsListeningSpeech] = useState(false);
  const [speechPreviewNote, setSpeechPreviewNote] = useState<string | null>(null);
  const [speechLanguage, setSpeechLanguage] = useState<string>('auto');
  const promptInputRef = useRef<HTMLInputElement | null>(null);
  const voiceSessionRef = useRef<MultilingualVoiceController | null>(null);

  useEffect(() => {
    return () => {
      voiceSessionRef.current?.stop();
    };
  }, []);

  const handleToggleInlineSpeechInput = async () => {
    if (isListeningSpeech) {
      voiceSessionRef.current?.stop();
      setIsListeningSpeech(false);
      return;
    }

    setAiError(null);
    const controller = createMultilingualVoiceSession({
      language: speechLanguage,
      onStatus: (msg) => setSpeechPreviewNote(msg),
      onTranscriptUpdate: (text) => {
        if (text) setUserRequest(text);
      },
      onError: (err) => {
        setIsListeningSpeech(false);
        setSpeechPreviewNote(err);
      },
      onFinish: () => {
        setIsListeningSpeech(false);
        setTimeout(() => promptInputRef.current?.focus(), 0);
      },
    });

    voiceSessionRef.current = controller;
    const started = await controller.start();
    setIsListeningSpeech(started);
  };

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
        'Đề xuất hợp lý vì điều chỉnh đúng nhóm nguyên liệu mục tiêu và giữ tổng tỉ lệ 100%.',
      chemistryExplanation:
        'Hương đầu (Hoa nhài) bay hơi nhanh tạo mở màn thanh khiết; tầng giữa (Đào) nối mạch dịu ngọt; tầng cuối (Xạ hương trắng, Vanilla) định hương theo định luật Raoult.',
      groupDecision: 'agree',
      groupDecisionReason:
        'Nhóm đồng ý với tỉ lệ mới và giữ đúng dung môi Ethanol 90% + tối đa 20 giọt nước cất.',
      verificationExperimentPlan:
        'Pha mẫu thử 10,00 mL (1 giọt = 0,05 mL), đánh giá trên giấy thử ở 15 phút, 2 giờ, 6 giờ và kiểm tra độ trong sau 24h–72h.',
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
      setAiError('Hãy chọn gợi ý hoặc nhập yêu cầu của bạn.');
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
      setAiError(err?.message || 'Không thể kết nối hệ thống phân tích.');
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
        const audio = new Audio(
          `data:${ttsResult.mimeType || 'audio/wav'};base64,${ttsResult.audioBase64}`
        );
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

    downloadCsvFile(csv, `bao_cao_thuc_nghiem_floris_${totalVolume}ml.csv`);
  };

  const handleCopyPresentationReport = async () => {
    if (!aiResult) return;
    const lines = [
      `BÁO CÁO THỰC NGHIỆM NƯỚC HOA FLORIS`,
      `• Công thức: ${perfumeName} (${seasonLabel})`,
      `• Quy chuẩn: ${totalVolume} mL | ${concentrationName} (${concentrationPercent}%)`,
      `• Yêu cầu: "${userRequest}"`,
      `• Đề xuất AI (${aiResult.proposedPerfumeName}):`,
      ...(aiResult.comparisonItems || []).map((item: any) => {
        const sign = item.deltaPercentage > 0 ? '+' : '';
        const oldDrops =
          typeof item.oldDrops === 'number' && Number.isFinite(item.oldDrops)
            ? Math.round(item.oldDrops)
            : calculateDropsFromMl(item.oldVolumeMl, item.oldPercentage > 0);
        const newDrops =
          typeof item.newDrops === 'number' && Number.isFinite(item.newDrops)
            ? Math.round(item.newDrops)
            : calculateDropsFromMl(item.newVolumeMl, item.newPercentage > 0);
        return `- [${item.tierLabel}] ${item.name}: ${item.oldPercentage}% (${oldDrops} giọt) -> ${item.newPercentage}% (${newDrops} giọt) (${sign}${item.deltaPercentage}%)`;
      }),
      `• Nhận xét nhóm: ${studentEval.isReasonableComment}`,
      `• Hóa học: ${studentEval.chemistryExplanation}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(lines);
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 3000);
    } catch {
      // ignore
    }
  };

  const activeItems = calculatedIngredients.filter((ing) => ing.percentage > 0);

  return (
    <div className="space-y-6">
      {/* =====================================================================
          1. VISUAL BOTTLE & FORMULA OVERVIEW (Minimal Text, Visual-First)
         ===================================================================== */}
      <section className="spring-card p-5 sm:p-6 space-y-5">
        {/* Clean 1-Title + Micro Badge Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-[#F6DCE5]">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] text-xs font-bold border border-[#BBF7D0]">
              Mẫu thực nghiệm
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#2B342D]">
              {activeVariantCode} · {totalVolume} mL
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onOpenExperimentalWeb && (
              <button
                type="button"
                onClick={onOpenExperimentalWeb}
                className="px-3.5 py-2 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Phiếu lab</span>
              </button>
            )}

            {onOpenExperimentalPopup && (
              <button
                type="button"
                onClick={onOpenExperimentalPopup}
                className="px-3.5 py-2 rounded-2xl bg-[#ECFDF3] hover:bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] font-bold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Xem nhanh</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowQrPanel((prev) => !prev)}
              className="px-3 py-2 rounded-2xl bg-[#FFFDF0] hover:bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{showQrPanel ? 'Ẩn QR' : 'Mã QR'}</span>
            </button>

            <button
              type="button"
              onClick={onRestoreExperimentalBaseline}
              className="px-3 py-2 rounded-2xl bg-white hover:bg-[#FFF5F8] text-[#4A4D48] border border-[#F3DCE4] text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#DB2777]" />
              <span>Mẫu gốc</span>
            </button>
          </div>
        </div>

        {/* Collapsible QR Code Panel */}
        {showQrPanel && (
          <div className="p-4 rounded-3xl bg-[#FFFDF8] border border-[#FBCFE8] flex flex-col sm:flex-row items-center gap-5">
            <div className="p-3 bg-white rounded-2xl border border-[#FBCFE8] shrink-0">
              <QRCodeSVG
                value={qrShareUrl}
                size={128}
                bgColor="#FFFFFF"
                fgColor="#2B342D"
                level="M"
              />
            </div>
            <div className="space-y-1.5 min-w-0 flex-1 text-center sm:text-left">
              <h3 className="text-sm font-bold text-[#2B342D]">📱 Quét QR để mở trên điện thoại</h3>
              <p className="text-xs text-[#5C6B5F] truncate font-mono bg-white px-3 py-1.5 rounded-xl border border-[#F3DCE4]">
                {qrShareUrl}
              </p>
            </div>
          </div>
        )}

        {/* Quick Sample Switcher Pills (A / B / C) */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-3xl bg-[#FFF5F8] border border-[#FBCFE8]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-[#9D174D]">Chọn mẫu thử:</span>
            {GROUP_LAB_REPORT_DATA.threeExperimentalVariants.map((variant) => {
              const isSelected = activeVariantCode === variant.code;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => handleLoadLabVariant(variant.id)}
                  className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#EC4899] text-white shadow-xs'
                      : 'bg-white hover:bg-[#FCE7F3] text-[#4A4D48] border border-[#F3DCE4]'
                  }`}
                >
                  {variant.code}
                </button>
              );
            })}
          </div>

          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white text-[#15803D] border border-[#BBF7D0]">
            Đầu {tierTotals.top}% · Giữa {tierTotals.heart}% · Cuối {tierTotals.base}%
          </span>
        </div>

        {/* Visual Showcase Grid: Interactive Perfume Bottle + Compact Ingredient Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-6">
            <SpringPerfumeBottleSVG
              ingredients={calculatedIngredients}
              totalVolume={totalVolume}
              concentrationPercent={concentrationPercent}
              pureFragranceMl={pureFragranceMl}
              carrierAlcoholMl={carrierAlcoholMl}
              perfumeName={perfumeName}
            />
          </div>

          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#2B342D]">
                Thành phần đang phối ({activeItems.length} nốt)
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingLabNotes((prev) => !prev)}
                className="text-xs px-3 py-1 rounded-full bg-white hover:bg-[#FFF5F8] text-[#9D174D] border border-[#FBCFE8] font-bold flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditingLabNotes ? 'Xong' : 'Sửa ghi chú'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activeItems.map((ing) => (
                <div
                  key={ing.slotKey}
                  className="p-3.5 rounded-3xl bg-[#FFFDF8] border border-[#F3DCE4] space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-[#5C6B5F] uppercase block">
                        {ing.tierLabel}
                      </span>
                      <p className="text-sm font-bold text-[#2B342D] truncate">
                        {ing.name.split('(')[0].trim()}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-extrabold text-[#BE185D] bg-[#FCE7F3] px-2.5 py-0.5 rounded-full shrink-0">
                      {ing.percentage}%
                    </span>
                  </div>

                  {/* Mini Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-[#FFF1F5] overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, ing.percentage * 2)}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-[#F472B6] to-[#FBBF24]"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <ScentFamilyVisualBadge scentFamily={ing.scentFamily} name={ing.name} />
                    <span className="font-mono font-bold text-[#15803D]">
                      {ing.volumeMl} mL · {ing.drops} giọt
                    </span>
                  </div>

                  {isEditingLabNotes && (
                    <textarea
                      rows={2}
                      value={ing.observedLabNote || ''}
                      onChange={(e) =>
                        onUpdateSlotObservedNote(
                          ing.slotKey as FormulaSlot['key'],
                          e.target.value
                        )
                      }
                      className="w-full p-2 rounded-xl bg-white border border-[#FBCFE8] text-xs text-[#2B342D]"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Click-to-Expand Accordions for Chemical Details, Lab Notes & 9-Step Procedure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <SpringAccordion
            title="Chi tiết hóa học & Giới hạn IFRA"
            badge={`${activeItems.length} chất`}
            icon={<Microscope className="w-4 h-4 text-[#DB2777]" />}
            tone="sakura"
          >
            <div className="space-y-2.5">
              {activeItems.map((ing) => (
                <div key={ing.slotKey} className="p-2.5 rounded-2xl bg-white border border-[#F6DCE5]">
                  <div className="flex items-center justify-between font-bold text-[#2B342D]">
                    <span>{ing.name}</span>
                    <span className="font-mono text-[#15803D]">
                      IFRA ≤ {ing.ifraMaxPercent}% (Dùng: {ing.finalProductConcentrationPercent}%)
                    </span>
                  </div>
                  {ing.chemicalCompounds && (
                    <p className="font-mono text-[11px] text-[#9D174D] mt-1">{ing.chemicalCompounds}</p>
                  )}
                  {ing.volatilityNote && (
                    <p className="text-[11px] text-[#5C6B5F] mt-0.5">{ing.volatilityNote}</p>
                  )}
                </div>
              ))}
            </div>
          </SpringAccordion>

          <SpringAccordion
            title="Đánh giá mẫu lab & Quy trình 9 bước"
            badge="Thực hành"
            icon={<BookOpen className="w-4 h-4 text-[#16A34A]" />}
            tone="leaf"
          >
            <div className="space-y-3">
              <div className="p-2.5 rounded-2xl bg-white border border-[#C8F0D4] space-y-1">
                <p className="font-bold text-[#15803D]">Trạng thái &amp; Diễn biến mùi</p>
                <p>{initialEvalState.physicalState}</p>
                <p>{initialEvalState.scentEvolution}</p>
              </div>
              <ol className="space-y-1 pl-1">
                {GROUP_LAB_REPORT_DATA.procedureSteps.map((stepText, i) => (
                  <li key={i} className="leading-relaxed">
                    {stepText}
                  </li>
                ))}
              </ol>
            </div>
          </SpringAccordion>
        </div>
      </section>

      {/* =====================================================================
          2. AI TƯ VẤN CẢI TIẾN HƯƠNG
         ===================================================================== */}
      <section
        id="ai-improvement-advisor-section"
        className="spring-card-butter p-5 sm:p-6 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-white text-[#92400E] text-xs font-bold border border-[#FCD34D]">
              AI điều chỉnh
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-[#2B342D]">
              Thử biến tấu mùi hương
            </h2>
          </div>

          <button
            type="button"
            onClick={onOpenVoiceWidget}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#EC4899] to-[#F472B6] hover:from-[#DB2777] hover:to-[#EC4899] text-white text-xs font-bold shadow-xs flex items-center gap-2 self-start sm:self-auto active:scale-95"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Nói trực tiếp (Gemini Live)</span>
          </button>
        </div>

        {/* Visual Preset Prompt Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {PRESET_AI_QUESTIONS.map((qItem) => {
            const isSelected = userRequest === qItem.label;
            return (
              <button
                key={qItem.id}
                type="button"
                disabled={isAnalyzing}
                onClick={() => handleRunAIConsultation(qItem.label)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-[#FFF1F5] border-[#EC4899] ring-2 ring-[#FBCFE8]'
                    : 'bg-white hover:bg-[#FFFDF8] border-[#FDE68A]'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-lg">{qItem.emoji}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E]">
                    {qItem.tag}
                  </span>
                </div>
                <p className="text-xs font-bold text-[#2B342D] leading-snug">“{qItem.label}”</p>
              </button>
            );
          })}
        </div>

        {/* Input Row */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            ref={promptInputRef}
            type="text"
            value={userRequest}
            onChange={(e) => setUserRequest(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleRunAIConsultation();
              }
            }}
            placeholder="Nhập hoặc bấm Nói bằng bất kỳ ngôn ngữ nào..."
            className="flex-1 px-4 py-2.5 rounded-2xl bg-white border-2 border-[#FDE68A] text-sm text-[#2B342D] focus:outline-none focus:border-[#EC4899]"
          />
          <select
            aria-label="Chọn ngôn ngữ giọng nói"
            value={speechLanguage}
            disabled={isListeningSpeech || isAnalyzing}
            onChange={(e) => setSpeechLanguage(e.target.value)}
            className="px-3 py-2.5 rounded-2xl bg-white border-2 border-[#FBCFE8] text-xs font-bold text-[#9D174D] focus:outline-none focus:border-[#EC4899] shrink-0"
          >
            {SPEECH_LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.shortLabel}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={isAnalyzing}
            onClick={handleToggleInlineSpeechInput}
            aria-label={isListeningSpeech ? 'Dừng thu âm giọng nói' : 'Nói để nhập yêu cầu'}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border shrink-0 whitespace-nowrap transition-all ${
              isListeningSpeech
                ? 'bg-[#EC4899] text-white border-[#DB2777] animate-pulse'
                : 'bg-[#FFF5F8] hover:bg-[#FCE7F3] text-[#BE185D] border-[#FBCFE8]'
            }`}
          >
            {isListeningSpeech ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>{isListeningSpeech ? 'Đang nghe...' : 'Nói'}</span>
          </button>
          <button
            type="button"
            disabled={isAnalyzing}
            onClick={() => {
              setSpeechPreviewNote(null);
              handleRunAIConsultation();
            }}
            className="px-5 py-2.5 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-60 shrink-0 whitespace-nowrap"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang phân tích...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Đề xuất tỷ lệ mới</span>
              </>
            )}
          </button>
        </div>

        {speechPreviewNote && (
          <div className="px-3.5 py-2 rounded-2xl bg-[#FFF5F8] border border-[#FBCFE8] text-xs font-semibold text-[#9D174D]">
            {speechPreviewNote}
          </div>
        )}

        {aiError && (
          <div className="p-3 rounded-2xl bg-[#FFE4E6] border border-[#FDA4AF] text-xs font-bold text-[#9F1239]">
            {aiError}
          </div>
        )}
      </section>

      {/* =====================================================================
          3. VISUAL AI COMPARISON & RATIO BARS
         ===================================================================== */}
      {aiResult && (
        <section className="spring-card-sakura p-5 sm:p-6 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#FBCFE8]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                    aiResult.isUnchanged
                      ? 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]'
                      : 'bg-white text-[#15803D] border-[#BBF7D0]'
                  }`}
                >
                  {aiResult.isUnchanged
                    ? '⚠️ Giữ nguyên tỷ lệ gốc'
                    : `✓ Chuẩn ${aiResult.validationReport?.validatedSum ?? 100}%`}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#2B342D] mt-1">
                {aiResult.isUnchanged
                  ? aiResult.proposedPerfumeName
                  : `Đề xuất: “${aiResult.proposedPerfumeName}”`}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() =>
                  handleSpeakText(
                    aiResult.isUnchanged
                      ? aiResult.spokenResponse || aiResult.message
                      : `${aiResult.spokenResponse}. ${
                          aiResult.olfactoryPredictionHypothesis?.overallChange || ''
                        }`
                  )
                }
                className="px-3.5 py-2 rounded-2xl bg-white hover:bg-[#FFF5F8] text-[#BE185D] border border-[#FBCFE8] text-xs font-bold flex items-center gap-1.5"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isSpeaking ? 'Dừng' : 'Nghe AI'}</span>
              </button>

              {!aiResult.isUnchanged && (
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
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#EC4899] to-[#F472B6] hover:from-[#DB2777] hover:to-[#EC4899] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{appliedSuccess ? 'Đã nạp' : 'Áp dụng ngay'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Explanation Message */}
          <div
            className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-medium leading-relaxed ${
              aiResult.isUnchanged
                ? 'bg-[#FFFDF0] border-[#FCD34D] text-[#92400E]'
                : 'bg-white/85 border-[#FBCFE8] text-[#2B342D]'
            }`}
          >
            {aiResult.message || aiResult.analysisSummary}
          </div>

          {/* Visual Proportion Comparison Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(aiResult.comparisonItems || [])
              .filter((item: any) => item.oldPercentage > 0 || item.newPercentage > 0)
              .map((item: any) => {
                const delta = item.deltaPercentage || 0;
                const oldDrops =
                  typeof item.oldDrops === 'number' && Number.isFinite(item.oldDrops)
                    ? Math.round(item.oldDrops)
                    : calculateDropsFromMl(item.oldVolumeMl, item.oldPercentage > 0);
                const newDrops =
                  typeof item.newDrops === 'number' && Number.isFinite(item.newDrops)
                    ? Math.round(item.newDrops)
                    : calculateDropsFromMl(item.newVolumeMl, item.newPercentage > 0);
                return (
                  <div
                    key={item.slotKey}
                    className="p-3.5 rounded-3xl bg-white border border-[#FBCFE8] space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#2B342D] truncate">
                        {item.name.split('(')[0].trim()}
                      </span>
                      <span
                        className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          delta > 0
                            ? 'bg-[#DCFCE7] text-[#15803D]'
                            : delta < 0
                            ? 'bg-[#FFE4E6] text-[#BE123C]'
                            : 'bg-[#F3F4F6] text-[#5C6B5F]'
                        }`}
                      >
                        {delta > 0 ? `+${delta}%` : `${delta}%`}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] font-mono">
                      <div className="flex items-center gap-2">
                        <span className="w-8 text-[#5C6B5F]">Gốc</span>
                        <div className="flex-1 h-2.5 rounded-full bg-[#F3F4F6] overflow-hidden">
                          <div
                            style={{ width: `${Math.min(100, item.oldPercentage * 2)}%` }}
                            className="h-full bg-[#9CA3AF] rounded-full"
                          />
                        </div>
                        <span className="w-20 text-right">{item.oldPercentage}% · {oldDrops}g</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="w-8 text-[#BE185D] font-bold">Mới</span>
                        <div className="flex-1 h-2.5 rounded-full bg-[#FCE7F3] overflow-hidden">
                          <div
                            style={{ width: `${Math.min(100, item.newPercentage * 2)}%` }}
                            className="h-full bg-[#EC4899] rounded-full"
                          />
                        </div>
                        <span className="w-20 text-right font-bold text-[#BE185D]">
                          {item.newPercentage}% · {newDrops}g
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Click-to-Expand Detailed Hypothesis & Comparison Table */}
          <SpringAccordion
            title="Xem chi tiết bảng đối chiếu & giả thuyết mùi"
            badge="Hóa học"
            icon={<ClipboardCheck className="w-4 h-4 text-[#DB2777]" />}
            tone="cream"
          >
            <div className="space-y-3">
              <div className="overflow-x-auto rounded-2xl border border-[#F3DCE4]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FFF5F8] text-[#9D174D] font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Nguyên liệu</th>
                      <th className="py-2.5 px-3 text-center">Gốc</th>
                      <th className="py-2.5 px-3 text-center">Mới</th>
                      <th className="py-2.5 px-3 text-center bg-[#ECFDF3]/70 text-[#15803D] whitespace-nowrap">
                        Số giọt (0,05mL)
                      </th>
                      <th className="py-2.5 px-3">Lý do điều chỉnh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F6DCE5]">
                    {(aiResult.comparisonItems || []).map((item: any) => {
                      const oldDrops =
                        typeof item.oldDrops === 'number' && Number.isFinite(item.oldDrops)
                          ? Math.round(item.oldDrops)
                          : calculateDropsFromMl(item.oldVolumeMl, item.oldPercentage > 0);
                      const newDrops =
                        typeof item.newDrops === 'number' && Number.isFinite(item.newDrops)
                          ? Math.round(item.newDrops)
                          : calculateDropsFromMl(item.newVolumeMl, item.newPercentage > 0);
                      return (
                        <tr key={item.slotKey}>
                          <td className="py-2 px-3 font-bold text-[#2B342D]">{item.name}</td>
                          <td className="py-2 px-3 text-center font-mono whitespace-nowrap">
                            {item.oldPercentage}% ({item.oldVolumeMl} mL)
                          </td>
                          <td className="py-2 px-3 text-center font-mono font-bold text-[#BE185D] whitespace-nowrap">
                            {item.newPercentage}% ({item.newVolumeMl} mL)
                          </td>
                          <td className="py-2 px-3 text-center font-mono font-bold text-[#15803D] bg-[#ECFDF3]/40 whitespace-nowrap">
                            {oldDrops} → {newDrops} giọt
                          </td>
                          <td className="py-2 px-3 text-[#4A4D48]">{item.reason}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-[#FFFDF0] border-t border-[#FDE68A] font-mono font-bold text-[#2B342D]">
                    <tr>
                      <td className="py-2 px-3 font-sans">Tổng cộng</td>
                      <td className="py-2 px-3 text-center">
                        {(aiResult.comparisonItems || []).reduce((a: number, b: any) => a + (b.oldPercentage || 0), 0)}%
                      </td>
                      <td className="py-2 px-3 text-center text-[#BE185D]">
                        {(aiResult.comparisonItems || []).reduce((a: number, b: any) => a + (b.newPercentage || 0), 0)}%
                      </td>
                      <td className="py-2 px-3 text-center text-[#15803D] bg-[#ECFDF3]/70 whitespace-nowrap">
                        {(aiResult.comparisonItems || []).reduce((a: number, b: any) => {
                          const d =
                            typeof b.oldDrops === 'number' && Number.isFinite(b.oldDrops)
                              ? Math.round(b.oldDrops)
                              : calculateDropsFromMl(b.oldVolumeMl, b.oldPercentage > 0);
                          return a + d;
                        }, 0)}{' '}
                        →{' '}
                        {(aiResult.comparisonItems || []).reduce((a: number, b: any) => {
                          const d =
                            typeof b.newDrops === 'number' && Number.isFinite(b.newDrops)
                              ? Math.round(b.newDrops)
                              : calculateDropsFromMl(b.newVolumeMl, b.newPercentage > 0);
                          return a + d;
                        }, 0)}{' '}
                        giọt
                      </td>
                      <td className="py-2 px-3 font-sans text-[#5C6B5F]">1 giọt = 0,05 mL (số nguyên)</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {aiResult.olfactoryPredictionHypothesis && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-2xl bg-[#FFFDF0] border border-[#FDE68A]">
                    <strong className="text-[#92400E] block mb-0.5">🌼 Tầng đầu</strong>
                    <p>{aiResult.olfactoryPredictionHypothesis.topStage}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#FFF1F5] border border-[#FBCFE8]">
                    <strong className="text-[#BE185D] block mb-0.5">🌸 Tầng giữa</strong>
                    <p>{aiResult.olfactoryPredictionHypothesis.heartStage}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#ECFDF3] border border-[#BBF7D0]">
                    <strong className="text-[#15803D] block mb-0.5">🌿 Tầng cuối</strong>
                    <p>{aiResult.olfactoryPredictionHypothesis.baseStage}</p>
                  </div>
                </div>
              )}
            </div>
          </SpringAccordion>
        </section>
      )}

      {/* =====================================================================
          4. NHẬN XÉT NHÓM & XUẤT BÁO CÁO (Accordion + Compact Export Bar)
         ===================================================================== */}
      <section className="spring-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <span className="px-3 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] text-xs font-bold border border-[#BBF7D0]">
              Phiếu phản biện &amp; Xuất file
            </span>
            <h2 className="text-lg font-bold text-[#2B342D] mt-1.5">
              Lưu nhận xét &amp; tải báo cáo CSV
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportFullReportCsv}
              disabled={!aiResult}
              className="px-4 py-2 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải CSV</span>
            </button>

            <button
              type="button"
              onClick={handleCopyPresentationReport}
              disabled={!aiResult}
              className="px-3.5 py-2 rounded-2xl bg-white hover:bg-[#FFF5F8] text-[#2B342D] border border-[#F3DCE4] font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              {copiedReport ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedReport ? 'Đã chép' : 'Sao chép'}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-2xl bg-white hover:bg-[#FFFDF0] text-[#92400E] border border-[#FDE68A] font-bold text-xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In phiếu</span>
            </button>
          </div>
        </div>

        <SpringAccordion
          title="Mở phần nhận xét & đánh giá Hóa học của nhóm"
          badge="4 mục"
          icon={<ClipboardCheck className="w-4 h-4 text-[#DB2777]" />}
          tone="cream"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl bg-[#FFFDF8] border border-[#F3DCE4] space-y-2">
              <label className="font-bold text-[#2B342D] block">
                1. Đánh giá đề xuất AI
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'very_reasonable', label: 'Hợp lý' },
                  { id: 'partially_reasonable', label: 'Cần tinh chỉnh' },
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
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      studentEval.isReasonableRating === opt.id
                        ? 'bg-[#FCE7F3] border-[#F472B6] text-[#BE185D]'
                        : 'bg-white border-[#E5E7EB] text-[#5C6B5F]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <textarea
                rows={3}
                value={studentEval.isReasonableComment}
                onChange={(e) =>
                  setStudentEval((p) => ({ ...p, isReasonableComment: e.target.value }))
                }
                className="w-full p-2.5 rounded-2xl bg-white border border-[#F3DCE4] text-xs text-[#2B342D]"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FFFDF8] border border-[#F3DCE4] space-y-2">
              <label className="font-bold text-[#2B342D] block">
                2. Cơ sở Hóa học (chạm để chèn)
              </label>
              <div className="flex flex-wrap gap-1">
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
                    className="px-2.5 py-1 rounded-full bg-[#FEF9C3] hover:bg-[#FEF08A] text-[#854D0E] text-[11px] font-bold"
                  >
                    + {chip.title}
                  </button>
                ))}
              </div>
              <textarea
                rows={3}
                value={studentEval.chemistryExplanation}
                onChange={(e) =>
                  setStudentEval((p) => ({ ...p, chemistryExplanation: e.target.value }))
                }
                className="w-full p-2.5 rounded-2xl bg-white border border-[#F3DCE4] text-xs text-[#2B342D]"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FFFDF8] border border-[#F3DCE4] space-y-2">
              <label className="font-bold text-[#2B342D] block">3. Quyết định của nhóm</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'agree', label: 'Đồng ý' },
                  { id: 'agree_with_modifications', label: 'Chỉnh nhẹ' },
                  { id: 'disagree', label: 'Giữ gốc' },
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
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      studentEval.groupDecision === opt.id
                        ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#15803D]'
                        : 'bg-white border-[#E5E7EB] text-[#5C6B5F]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <textarea
                rows={3}
                value={studentEval.groupDecisionReason}
                onChange={(e) =>
                  setStudentEval((p) => ({ ...p, groupDecisionReason: e.target.value }))
                }
                className="w-full p-2.5 rounded-2xl bg-white border border-[#F3DCE4] text-xs text-[#2B342D]"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FFFDF8] border border-[#F3DCE4] space-y-2">
              <label className="font-bold text-[#2B342D] block">4. Kiểm chứng thực tế</label>
              <textarea
                rows={4}
                value={studentEval.verificationExperimentPlan}
                onChange={(e) =>
                  setStudentEval((p) => ({
                    ...p,
                    verificationExperimentPlan: e.target.value,
                  }))
                }
                className="w-full p-2.5 rounded-2xl bg-white border border-[#F3DCE4] text-xs text-[#2B342D]"
              />
            </div>
          </div>
        </SpringAccordion>
      </section>
    </div>
  );
};
