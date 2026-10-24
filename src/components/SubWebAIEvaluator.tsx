import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Bot,
  ShieldCheck,
  Award,
  BookOpen,
  AlertCircle,
  FlaskConical,
  RefreshCw,
  ArrowLeft,
  Volume2,
  VolumeX,
  Mic,
} from 'lucide-react';
import { CalculatedIngredient, FormulaSlot } from '../utils/perfumeCalculations';
import {
  safeRequestPerfumeEvaluation,
  safeRequestTTS,
  speakWithBrowserSynthesis,
} from '../utils/aiPerfumeEngine';
import { QRAndVoiceAssistantSection } from './QRAndVoiceAssistantSection';
import { PresentationShowcaseHub } from './PresentationShowcaseHub';

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

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

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
    <div className="space-y-8 animate-fadeIn">
      {/* Sub-Web 2 Banner Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-950 border border-amber-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
              Trang Web Phụ 2 • AI Master Perfumer Studio
            </span>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Bảo mật qua Server Proxy • Gemini 3.8 Flash
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100 flex items-center gap-2.5">
            <Bot className="w-6 h-6 text-amber-400" />
            Trung Tâm Thẩm Định Mùi Hương & Điều Chỉnh Công Thức Cùng AI
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Trang web chuyên biệt dành riêng cho Trí Tuệ Nhân Tạo: Thẩm định chuyên sâu công thức 3 tầng hương, kiểm định chuẩn an toàn IFRA, quét mã QR và tương tác bằng giọng nói.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={onOpenVoiceWidget}
            className="px-3.5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Mic className="w-4 h-4 text-rose-400" />
            <span>Mở Widget Giọng Nói</span>
          </button>

          <button
            type="button"
            onClick={onBackToMainWeb}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Về Web Chính</span>
          </button>
        </div>
      </div>

      {/* Presentation & AI Consultation Hub (5-Step Interactive Flow) */}
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

      {/* Current Formula Snapshot Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
              Hồ Sơ Công Thức Đang Đưa Vào AI Thẩm Định
            </span>
            <h3 className="text-lg font-serif font-bold text-slate-100 mt-0.5">
              {perfumeName} — {seasonLabel} ({totalVolume} mL • {concentrationName})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {!isValidTotal ? (
              <button
                type="button"
                onClick={onAutoBalance}
                className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg animate-pulse"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Tổng {totalPercentage}% — Bấm Cân Bằng 100% Để Thẩm Định</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRunEvaluation}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-amber-900/30 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>AI Đang Thẩm Định Mùi Hương...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {evaluation ? 'Chạy Thẩm Định Lại Cùng AI' : 'Bắt Đầu Thẩm Định Chuyên Sâu Cùng AI'}
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* 6 Ingredients Summary Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ingredients.map((ing) => (
            <div
              key={ing.slotKey}
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-2"
            >
              <div>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  {ing.tierLabel}
                </span>
                <p className="text-xs font-bold text-slate-100 mt-1">{ing.name}</p>
                <p className="text-[11px] text-slate-400">{ing.scentFamily}</p>
              </div>
              <div className="text-right font-mono">
                <span className="text-sm font-bold text-amber-400">{ing.percentage}%</span>
                <span className="block text-[10px] text-slate-400">
                  {ing.volumeMl} mL (~{ing.drops} giọt)
                </span>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200">
            {error}
          </div>
        )}

        {/* AI Evaluation Results Display */}
        {!evaluation && !loading && (
          <div className="py-10 px-4 text-center rounded-2xl bg-slate-950/50 border border-dashed border-slate-800 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto">
              <Bot className="w-7 h-7 text-amber-400" />
            </div>
            <h4 className="text-base font-serif font-bold text-slate-200">
              Sẵn Sàng Phân Tích Bởi Chuyên Gia Thẩm Hương AI (Master Perfumer)
            </h4>
            <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
              Nhấn nút <strong>"Bắt Đầu Thẩm Định Chuyên Sâu Cùng AI"</strong> ở góc trên để AI đặt tên nghệ thuật cho nước hoa, viết câu chuyện hành trình 3 tầng hương, chấm điểm độ hợp mùa, dự báo độ lưu hương và kiểm định an toàn IFRA.
            </p>
          </div>
        )}

        {evaluation && !loading && (
          <div className="space-y-6 pt-2 animate-fadeIn">
            {/* Title & Poetic Story */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-950/50 via-slate-900 to-slate-950 border border-amber-500/40 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400 block">
                  Tác Phẩm Nước Hoa Được Đặt Tên Bởi AI
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleSpeakEvaluation(
                      `Tác phẩm ${evaluation.perfumeName}. ${evaluation.poeticNarrative}. Đánh giá chuyên môn: ${evaluation.masterReview}`
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-medium flex items-center gap-1.5 self-start sm:self-auto"
                >
                  {isSpeakingEval ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Dừng đọc báo cáo</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>🔊 Nghe giọng Gemini Live đọc thẩm định</span>
                    </>
                  )}
                </button>
              </div>

              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-amber-200 mb-3">
                “{evaluation.perfumeName}”
              </h3>
              <p className="text-sm text-slate-200 italic leading-relaxed">
                {evaluation.poeticNarrative}
              </p>
            </div>

            {/* 4 Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block">Độ Hợp Mùa</span>
                <span className="text-2xl font-mono font-bold text-emerald-400 mt-1 block">
                  {evaluation.seasonSuitabilityScore}/100
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block">Độ Hài Hòa</span>
                <span className="text-2xl font-mono font-bold text-amber-400 mt-1 block">
                  {evaluation.harmonyRating}/100
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block">Độ Lưu Hương</span>
                <span className="text-sm font-mono font-bold text-cyan-300 mt-2 block">
                  {evaluation.longevityHours}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block">Độ Tỏa Hương</span>
                <span className="text-xs font-mono font-semibold text-purple-300 mt-2 block">
                  {evaluation.sillage}
                </span>
              </div>
            </div>

            {/* Olfactory Radar Scores */}
            {evaluation.olfactoryRadar && (
              <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-4">
                  Biểu Đồ Nhóm Hương Cảm Quan (Olfactory Profile)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {[
                    { label: 'Hoa Cỏ (Floral)', val: evaluation.olfactoryRadar.floral, color: 'bg-pink-500' },
                    { label: 'Cam Chanh (Citrus)', val: evaluation.olfactoryRadar.citrus, color: 'bg-yellow-400' },
                    { label: 'Gỗ Ấm (Woody)', val: evaluation.olfactoryRadar.woody, color: 'bg-amber-700' },
                    { label: 'Gia Vị Cay (Spicy)', val: evaluation.olfactoryRadar.spicy, color: 'bg-red-500' },
                    { label: 'Phương Đông (Oriental)', val: evaluation.olfactoryRadar.oriental, color: 'bg-purple-500' },
                    { label: 'Tươi Mát (Fresh)', val: evaluation.olfactoryRadar.fresh, color: 'bg-cyan-400' },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">{item.label}</span>
                        <span className="font-mono text-slate-400">{item.val}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
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

            {/* Detailed Critiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <h5 className="text-xs font-mono uppercase text-amber-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  Nhận Xét Chuyên Môn & Độ Hợp Mùa
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">{evaluation.seasonFeedback}</p>
                <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800/80">
                  {evaluation.masterReview}
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <h5 className="text-xs font-mono uppercase text-cyan-400 flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4" />
                    Khuyến Nghị Ủ Hương (Maceration)
                  </h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {evaluation.macerationAdvice}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                  <h5 className="text-xs font-mono uppercase text-emerald-400 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    Kiểm Định An Toàn IFRA
                  </h5>
                  <p className="text-xs text-emerald-200/90 leading-relaxed">
                    {evaluation.safetyAndIFRA}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Embedded QR & Voice AI Interactive Adjustment Station */}
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
