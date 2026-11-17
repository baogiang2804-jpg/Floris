import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  ShieldCheck,
  Award,
  BookOpen,
  AlertCircle,
  FlaskConical,
  RefreshCw,
  X,
  Clock,
  Wind,
} from 'lucide-react';
import { CalculatedIngredient } from '../utils/perfumeCalculations';
import { safeRequestPerfumeEvaluation } from '../utils/aiPerfumeEngine';
import { SpringAccordion } from './SpringAccordion';
import { FlorisSpringEmblem } from './SpringDecorations';

interface AIEvaluatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  seasonLabel: string;
  totalVolume: number;
  concentrationName: string;
  ingredients: CalculatedIngredient[];
  tierTotals: { top: number; heart: number; base: number };
  isValidTotal: boolean;
  onSavePerfumeName?: (name: string) => void;
}

export const AIEvaluatorModal: React.FC<AIEvaluatorModalProps> = ({
  isOpen,
  onClose,
  seasonLabel,
  totalVolume,
  concentrationName,
  ingredients,
  tierTotals,
  isValidTotal,
  onSavePerfumeName,
}) => {
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

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
      if (data?.perfumeName && onSavePerfumeName) {
        onSavePerfumeName(data.perfumeName);
      }
    } catch (err: any) {
      console.error('Lỗi thẩm định AI:', err);
      setError(err?.message || 'Không thể kết nối đến dịch vụ thẩm định AI.');
    } finally {
      setLoading(false);
    }
  };

  const harmonyScore = Math.min(100, Math.max(0, Number(evaluation?.harmonyRating) || 0));
  const seasonScore = Math.min(100, Math.max(0, Number(evaluation?.seasonSuitabilityScore) || 0));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-evaluator-modal-title"
      className="fixed inset-0 z-50 bg-[#2B342D]/45 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-[#FFFDF8] border-2 border-[#FBCFE8] rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#FBCFE8]/70 bg-gradient-to-r from-[#FFF0F6] via-[#FFFDF8] to-[#ECFDF5] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FBCFE8] to-[#FEF3C7] border border-[#F9A8D4] flex items-center justify-center shadow-sm shrink-0">
              <FlorisSpringEmblem className="w-7 h-7" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="ai-evaluator-modal-title"
                  className="text-base sm:text-lg font-extrabold text-[#2B342D]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Thẩm Định AI
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#DCFCE7] border border-[#86EFAC] text-[#15803D] text-[11px] font-bold inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Gemini Proxy</span>
                </span>
              </div>
              <p className="text-xs text-[#5C6B5F] truncate">
                {seasonLabel} · {totalVolume} mL · {concentrationName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="w-9 h-9 rounded-full bg-white hover:bg-[#FCE7F3] border border-[#FBCFE8] text-[#5C6B5F] hover:text-[#BE185D] flex items-center justify-center transition-all shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {!isValidTotal && (
            <div className="p-4 rounded-2xl bg-[#FFF1F2] border border-[#FDA4AF] text-[#9F1239] text-xs font-semibold flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[#E11D48] shrink-0" />
              <p>Tổng tỉ lệ chưa đủ 100%. Bấm “Cân bằng 100%” trước khi thẩm định.</p>
            </div>
          )}

          {!evaluation && !loading && isValidTotal && (
            <div className="text-center py-8 px-4 rounded-3xl bg-gradient-to-br from-[#FFF5F8] via-[#FFFDF8] to-[#F0FDF4] border border-[#FBCFE8]">
              <div className="w-16 h-16 rounded-2xl bg-[#FCE7F3] border border-[#F9A8D4] text-[#BE185D] flex items-center justify-center mx-auto mb-3 shadow-sm">
                <FlaskConical className="w-8 h-8" />
              </div>
              <h3
                className="text-lg font-extrabold text-[#2B342D] mb-1"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Chấm Điểm Công Thức 🌸
              </h3>
              <p className="text-xs text-[#5C6B5F] mb-5">
                Độ hòa hợp · Hợp {seasonLabel} · Chuẩn IFRA
              </p>

              <button
                type="button"
                onClick={handleRunEvaluation}
                disabled={loading}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#EC4899] to-[#F472B6] hover:from-[#DB2777] hover:to-[#EC4899] text-white font-bold text-sm shadow-md transition-all inline-flex items-center gap-2 active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-[#FEF08A]" />
                <span>Chấm điểm AI</span>
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-12 px-4 space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 rounded-full border-4 border-[#FBCFE8] border-t-[#EC4899] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FlaskConical className="w-6 h-6 text-[#BE185D] animate-pulse" />
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-[#2B342D]">Đang phân tích hương...</p>
                <p className="text-xs text-[#5C6B5F] mt-1">Độ hài hòa · Độ bay hơi · IFRA</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-[#FFF1F2] border border-[#FDA4AF] text-[#9F1239] text-xs">
              <p className="font-bold mb-1">Lỗi thẩm định</p>
              <p className="opacity-90">{error}</p>
            </div>
          )}

          {evaluation && !loading && (
            <div className="space-y-4">
              {/* Name & Visual Score Bars */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-[#FFF0F6] via-[#FFFDF5] to-[#F0FDF4] border-2 border-[#FBCFE8] shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-[11px] font-bold">
                      Tên Gợi Ý ✨
                    </span>
                    <h3
                      className="text-2xl sm:text-3xl font-extrabold text-[#BE185D] mt-1"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      “{evaluation.perfumeName}”
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="px-3 py-1.5 rounded-2xl bg-[#DCFCE7] border border-[#86EFAC] text-[#15803D] text-xs font-mono font-bold flex items-center gap-1.5">
                      <Award className="w-4 h-4" />
                      <span>{harmonyScore}/100</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-2xl bg-[#FEF3C7] border border-[#FCD34D] text-[#92400E] text-xs font-mono font-bold">
                      Mùa: {seasonScore}/100
                    </div>
                  </div>
                </div>

                {/* Visual Score Bars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-white/90 border border-[#F3DCE4]">
                    <div className="flex items-center justify-between text-xs font-bold text-[#2B342D] mb-1.5">
                      <span>🌿 Độ hòa hợp</span>
                      <span className="font-mono text-[#15803D]">{harmonyScore}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-[#DCFCE7] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A]"
                        style={{ width: `${harmonyScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/90 border border-[#F3DCE4]">
                    <div className="flex items-center justify-between text-xs font-bold text-[#2B342D] mb-1.5">
                      <span>🌸 Hợp {seasonLabel}</span>
                      <span className="font-mono text-[#BE185D]">{seasonScore}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-[#FCE7F3] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#EC4899] to-[#F472B6]"
                        style={{ width: `${seasonScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Compact Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#FFFDF0] border border-[#FDE68A]">
                  <span className="text-[11px] font-bold text-[#92400E] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Lưu hương
                  </span>
                  <p className="text-sm font-extrabold text-[#2B342D] mt-1">
                    {evaluation.longevityHours}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FFF5F8] border border-[#FBCFE8]">
                  <span className="text-[11px] font-bold text-[#BE185D] flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5" />
                    Tỏa hương
                  </span>
                  <p className="text-sm font-extrabold text-[#2B342D] mt-1">
                    {evaluation.sillage}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F3FDF6] border border-[#BBF7D0]">
                  <span className="text-[11px] font-bold text-[#15803D] flex items-center gap-1">
                    <FlaskConical className="w-3.5 h-3.5" />
                    Ủ lạnh
                  </span>
                  <p className="text-sm font-extrabold text-[#2B342D] mt-1">
                    {evaluation.macerationAdvice?.split('ở')[0] || '3 - 4 tuần'}
                  </p>
                </div>
              </div>

              {/* Long narratives inside click-to-expand accordions */}
              <div className="space-y-2.5">
                {evaluation.poeticNarrative && (
                  <SpringAccordion
                    title="Cảm hứng mùi hương"
                    badge="Bấm xem"
                    icon={<Sparkles className="w-4 h-4 text-[#EC4899]" />}
                    tone="sakura"
                  >
                    <p className="italic leading-relaxed text-[#39403A]">
                      “{evaluation.poeticNarrative}”
                    </p>
                  </SpringAccordion>
                )}

                <SpringAccordion
                  title="Nhận xét chuyên môn & Hợp mùa"
                  badge="Chi tiết"
                  icon={<BookOpen className="w-4 h-4 text-[#D97706]" />}
                  tone="butter"
                >
                  <p className="leading-relaxed">
                    <strong>Chuyên môn:</strong> {evaluation.masterReview}
                  </p>
                  <p className="leading-relaxed">
                    <strong>{seasonLabel}:</strong> {evaluation.seasonFeedback}
                  </p>
                </SpringAccordion>

                <SpringAccordion
                  title="Chuẩn an toàn IFRA"
                  badge="An toàn"
                  icon={<ShieldCheck className="w-4 h-4 text-[#16A34A]" />}
                  tone="leaf"
                >
                  <p className="leading-relaxed">{evaluation.safetyAndIFRA}</p>
                </SpringAccordion>
              </div>

              <div className="text-[11px] text-[#5C6B5F] text-center flex items-center justify-center gap-1.5 pt-1">
                <Bot className="w-3.5 h-3.5 text-[#EC4899]" />
                <span>{evaluation.message || 'Thẩm định bởi AI'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#FBCFE8]/70 bg-[#FFF5F8] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-[#FCE7F3] border border-[#FBCFE8] text-[#2B342D] text-xs font-bold transition-all"
          >
            Đóng
          </button>

          {evaluation && (
            <button
              type="button"
              onClick={handleRunEvaluation}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#EC4899] to-[#F472B6] hover:from-[#DB2777] hover:to-[#EC4899] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Chấm lại</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
