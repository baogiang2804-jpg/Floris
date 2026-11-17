import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Bot,
  Award,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Volume2,
  VolumeX,
  Mic,
  ShieldCheck,
} from 'lucide-react';
import { CalculatedIngredient, FormulaSlot } from '../utils/perfumeCalculations';
import {
  safeRequestPerfumeEvaluation,
  safeRequestTTS,
  speakWithBrowserSynthesis,
} from '../utils/aiPerfumeEngine';
import { QRAndVoiceAssistantSection } from './QRAndVoiceAssistantSection';
import { PresentationShowcaseHub } from './PresentationShowcaseHub';
import { SpringPerfumeBottleSVG } from './SpringPerfumeBottleSVG';
import { SpringAccordion } from './SpringAccordion';

interface SubWebAIEvaluatorProps {
  seasonKey: 'spring' | 'summer' | 'autumn' | 'winter';
  seasonLabel: string;
  totalVolume: number;
  concentrationName: string;
  concentrationPercent: number;
  pureFragranceMl?: number;
  carrierAlcoholMl?: number;
  slots: FormulaSlot[];
  ingredients: CalculatedIngredient[];
  tierTotals: { top: number; heart: number; base: number };
  totalPercentage: number;
  isValidTotal: boolean;
  perfumeName: string;
  isQrVisitorMode?: boolean;
  onSavePerfumeName: (name: string) => void;
  onAutoBalance: () => void;
  onOpenVoiceWidget: () => void;
  onRestoreExperimentalBaseline?: () => void;
  onUpdateSlotObservedNote?: (slotKey: FormulaSlot['key'], note: string) => void;
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
  onBackToMainWeb: () => void;
}

export const SubWebAIEvaluator: React.FC<SubWebAIEvaluatorProps> = ({
  seasonKey,
  seasonLabel,
  totalVolume,
  concentrationName,
  concentrationPercent,
  pureFragranceMl = Number(((totalVolume * concentrationPercent) / 100).toFixed(2)),
  carrierAlcoholMl = Number((totalVolume - (totalVolume * concentrationPercent) / 100).toFixed(2)),
  slots,
  ingredients,
  tierTotals,
  totalPercentage,
  isValidTotal,
  perfumeName,
  isQrVisitorMode = false,
  onSavePerfumeName,
  onAutoBalance,
  onOpenVoiceWidget,
  onRestoreExperimentalBaseline = () => {},
  onUpdateSlotObservedNote = () => {},
  onApplyAdjustedFormula,
  onSaveProposedToDrawer,
  onBackToMainWeb,
}) => {
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSpeakingEval, setIsSpeakingEval] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const handleRunEvaluation = async () => {
    if (!isValidTotal) return;
    setLoading(true);
    setError(null);

    try {
      const data = await safeRequestPerfumeEvaluation({
        seasonLabel,
        totalVolume,
        concentrationName,
        ingredients,
        tierTotals,
      });

      setEvaluation(data);
      if (data?.perfumeName) {
        onSavePerfumeName(data.perfumeName);
      }
    } catch (err: any) {
      setError(err?.message || 'Không thể kết nối đến dịch vụ thẩm định AI.');
    } finally {
      setLoading(false);
    }
  };

  const stopSpeaking = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeakingEval(false);
  };

  const handleSpeakEvaluation = async (textToSpeak: string) => {
    if (!textToSpeak) return;
    if (isSpeakingEval) {
      stopSpeaking();
      return;
    }

    stopSpeaking();
    setIsSpeakingEval(true);

    try {
      const ttsResult = await safeRequestTTS(textToSpeak);
      if (ttsResult.audioBase64) {
        const audio = new Audio(`data:${ttsResult.mimeType || 'audio/wav'};base64,${ttsResult.audioBase64}`);
        audioPlayerRef.current = audio;
        audio.onended = () => setIsSpeakingEval(false);
        audio.onerror = () => {
          speakWithBrowserSynthesis(textToSpeak, () => setIsSpeakingEval(false));
        };
        await audio.play();
        return;
      }

      speakWithBrowserSynthesis(textToSpeak, () => setIsSpeakingEval(false));
    } catch {
      speakWithBrowserSynthesis(textToSpeak, () => setIsSpeakingEval(false));
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header (1 Title + 1-3 Word Pill) */}
      <div className="spring-card p-5 sm:p-6 bg-gradient-to-br from-[#FFF1F5] via-white to-[#FFFDF0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FCE7F3] text-[#BE185D] border border-[#F9A8D4]">
            ✨ AI Studio
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#2B342D] flex items-center gap-2 mt-1">
            <Bot className="w-6 h-6 text-[#EC4899]" />
            <span>Tư Vấn &amp; Thẩm Định AI</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={onOpenVoiceWidget}
            className="px-3.5 py-2 rounded-2xl bg-[#EC4899] hover:bg-[#DB2777] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Mic className="w-4 h-4" />
            <span>Giọng nói</span>
          </button>

          <button
            type="button"
            onClick={onBackToMainWeb}
            className="px-4 py-2 rounded-2xl bg-white hover:bg-[#FFF5F8] text-[#2B342D] border border-[#F3D5E0] text-xs font-bold flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4 text-[#EC4899]" />
            <span>Về bàn pha</span>
          </button>
        </div>
      </div>

      {/* Presentation & AI Consultation Hub */}
      <PresentationShowcaseHub
        seasonKey={seasonKey}
        seasonLabel={seasonLabel}
        totalVolume={totalVolume}
        concentrationName={concentrationName}
        concentrationPercent={concentrationPercent}
        pureFragranceMl={pureFragranceMl}
        carrierAlcoholMl={carrierAlcoholMl}
        slots={slots}
        calculatedIngredients={ingredients}
        tierTotals={tierTotals}
        totalPercentage={totalPercentage}
        isValidTotal={isValidTotal}
        perfumeName={perfumeName}
        isQrVisitorMode={isQrVisitorMode}
        onRestoreExperimentalBaseline={onRestoreExperimentalBaseline}
        onUpdateSlotObservedNote={onUpdateSlotObservedNote}
        onApplyAdjustedFormula={onApplyAdjustedFormula}
        onSaveProposedToDrawer={onSaveProposedToDrawer}
        onOpenVoiceWidget={onOpenVoiceWidget}
        onAutoBalance={onAutoBalance}
      />

      {/* AI Master Perfumer Evaluation Card */}
      <div className="spring-card p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F5DCE4]">
          <div>
            <span className="text-[11px] font-bold uppercase text-[#15803D]">Chấm điểm AI</span>
            <h3 className="text-lg font-bold text-[#2B342D]">
              {perfumeName} · {totalVolume} mL
            </h3>
          </div>

          {!isValidTotal ? (
            <button
              type="button"
              onClick={onAutoBalance}
              className="px-4 py-2.5 rounded-2xl bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold text-xs flex items-center gap-1.5"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Cân 100% ({totalPercentage}%)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRunEvaluation}
              disabled={loading}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#EC4899] to-[#F472B6] hover:from-[#DB2777] hover:to-[#EC4899] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang chấm...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{evaluation ? 'Thẩm định lại' : 'Chấm điểm & Kiểm IFRA'}</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Visual Bottle Summary */}
        <SpringPerfumeBottleSVG
          ingredients={ingredients}
          totalVolume={totalVolume}
          concentrationPercent={concentrationPercent}
          pureFragranceMl={pureFragranceMl}
          carrierAlcoholMl={carrierAlcoholMl}
          perfumeName={perfumeName}
          compact
        />

        {error && (
          <div className="p-4 rounded-2xl bg-[#FFF1F2] border border-[#FDA4AF] text-xs font-bold text-[#BE123C]">
            {error}
          </div>
        )}

        {evaluation && !loading && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#FFF1F5] via-white to-[#FFFDF0] border-2 border-[#FBCFE8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase text-[#BE185D]">Tên đề xuất</span>
                <h3 className="text-2xl font-bold text-[#2B342D]">“{evaluation.perfumeName}”</h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleSpeakEvaluation(
                    `Tác phẩm ${evaluation.perfumeName}. ${evaluation.poeticNarrative}. Đánh giá: ${evaluation.masterReview}`
                  )
                }
                className="px-3.5 py-2 rounded-2xl bg-white hover:bg-[#FFF5F8] text-[#BE185D] border border-[#FBCFE8] text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
              >
                {isSpeakingEval ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Dừng đọc</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Nghe đọc</span>
                  </>
                )}
              </button>
            </div>

            {/* 4 Key Visual Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#ECFDF3] border border-[#BBF7D0] text-center">
                <span className="text-[11px] font-bold text-[#15803D] block">Hợp mùa</span>
                <span className="text-xl font-mono font-bold text-[#166534]">
                  {evaluation.seasonSuitabilityScore}/100
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FFF1F5] border border-[#FBCFE8] text-center">
                <span className="text-[11px] font-bold text-[#BE185D] block">Hài hòa</span>
                <span className="text-xl font-mono font-bold text-[#9D174D]">
                  {evaluation.harmonyRating}/100
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FFFDF0] border border-[#FDE68A] text-center">
                <span className="text-[11px] font-bold text-[#92400E] block">Lưu hương</span>
                <span className="text-xs font-mono font-bold text-[#78350F] mt-1 block">
                  {evaluation.longevityHours}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-[#F3DCE4] text-center">
                <span className="text-[11px] font-bold text-[#5C6B5F] block">Tỏa hương</span>
                <span className="text-xs font-mono font-bold text-[#2B342D] mt-1 block">
                  {evaluation.sillage}
                </span>
              </div>
            </div>

            {/* Visual Olfactory Bars */}
            {evaluation.olfactoryRadar && (
              <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#F3DCE4] space-y-2.5">
                <span className="text-xs font-bold text-[#2B342D] block">Hồ sơ 6 nhóm hương</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: '🌸 Hoa cỏ', val: evaluation.olfactoryRadar.floral, color: 'bg-[#F472B6]' },
                    { label: '🍋 Cam chanh', val: evaluation.olfactoryRadar.citrus, color: 'bg-[#FACC15]' },
                    { label: '🪵 Gỗ ấm', val: evaluation.olfactoryRadar.woody, color: 'bg-[#D97706]' },
                    { label: '✨ Gia vị', val: evaluation.olfactoryRadar.spicy, color: 'bg-[#FB7185]' },
                    { label: '🍦 Ngọt dịu', val: evaluation.olfactoryRadar.oriental, color: 'bg-[#C084FC]' },
                    { label: '🌿 Tươi mát', val: evaluation.olfactoryRadar.fresh, color: 'bg-[#4ADE80]' },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-[#2B342D]">{item.label}</span>
                        <span className="font-mono text-[#5C6B5F]">{item.val}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#FFF5F8] rounded-full overflow-hidden border border-[#F3DCE4]">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all duration-500`}
                          style={{ width: `${Math.min(100, item.val || 0)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Collapsible AI Narrative & IFRA Details */}
            <SpringAccordion
              title="Chi tiết thẩm định, ủ hương & IFRA"
              badge="Bấm để xem"
              tone="leaf"
              icon={<ShieldCheck className="w-4 h-4 text-[#16A34A]" />}
            >
              <p className="italic text-[#2B342D]">{evaluation.poeticNarrative}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 rounded-xl bg-white border border-[#BBF7D0]">
                  <strong className="flex items-center gap-1 text-[#15803D]">
                    <Award className="w-3.5 h-3.5" /> Nhận xét chuyên môn
                  </strong>
                  <p className="mt-1">{evaluation.masterReview}</p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#BBF7D0]">
                  <strong className="text-[#15803D]">An toàn IFRA &amp; Ủ hương</strong>
                  <p className="mt-1">{evaluation.safetyAndIFRA}</p>
                </div>
              </div>
            </SpringAccordion>
          </div>
        )}
      </div>

      {/* QR & Voice Station */}
      <QRAndVoiceAssistantSection
        seasonKey={seasonKey}
        seasonLabel={seasonLabel}
        totalVolume={totalVolume}
        concentrationName={concentrationName}
        concentrationPercent={concentrationPercent}
        slots={slots}
        calculatedIngredients={ingredients}
        tierTotals={tierTotals}
        perfumeName={perfumeName}
        isQrVisitorMode={isQrVisitorMode}
        onApplyAdjustedFormula={onApplyAdjustedFormula}
        onSaveProposedToDrawer={onSaveProposedToDrawer}
      />
    </div>
  );
};
