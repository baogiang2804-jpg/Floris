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
  CheckCircle,
} from 'lucide-react';
import { CalculatedIngredient } from '../utils/perfumeCalculations';
import { safeRequestPerfumeEvaluation } from '../utils/aiPerfumeEngine';

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

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-md shadow-amber-500/10">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-slate-100 flex items-center gap-2">
                AI Master Perfumer (Gemini 3.8 Flash)
              </h2>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                API do Giảng viên quản lý an toàn qua Server Proxy • Không đưa API Key vào mã
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {!isValidTotal && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <p>
                Tổng tỉ lệ hiện tại chưa đạt đúng 100%. Vui lòng quay lại giao diện chính và bấm{' '}
                <strong>"Cân Bằng Tự Động 100%"</strong> trước khi gửi yêu cầu cho AI thẩm định!
              </p>
            </div>
          )}

          {!evaluation && !loading && isValidTotal && (
            <div className="text-center py-8 px-4 bg-slate-950/40 rounded-2xl border border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
                <FlaskConical className="w-8 h-8" />
              </div>
              <h3 className="text-base font-serif font-semibold text-slate-100 mb-2">
                Sẵn Sàng Thẩm Định Mùi Hương
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
                Chuyên gia AI sẽ tiến hành phân tích sự hài hòa giữa 6 nốt hương, độ bay hơi theo
                thời gian, mức độ thích ứng với <strong>{seasonLabel}</strong> và kiểm tra tiêu
                chuẩn an toàn mỹ phẩm IFRA.
              </p>

              <button
                onClick={handleRunEvaluation}
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-medium text-sm shadow-lg shadow-amber-900/30 transition-all inline-flex items-center gap-2 active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Bắt Đầu Thẩm Định Với Gemini AI</span>
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-12 px-4 space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FlaskConical className="w-6 h-6 text-amber-400 animate-pulse" />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  Master Perfumer đang thẩm định công thức...
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Đang phân tích tương tác hóa học giữa các phân tử hương và tính toán độ bay hơi
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-200 text-xs">
              <p className="font-semibold mb-1">Lỗi khi thẩm định:</p>
              <p className="opacity-90">{error}</p>
            </div>
          )}

          {/* Results display */}
          {evaluation && !loading && (
            <div className="space-y-5">
              {/* Bespoke Perfume Title Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border border-amber-500/40 shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400">
                      Tác Phẩm Nước Hoa Độc Quyền
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-amber-200 mt-0.5">
                      "{evaluation.perfumeName}"
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Thiết kế cho {seasonLabel} • {totalVolume} mL • {concentrationName}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                    <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-semibold flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-400" />
                      <span>Hòa hợp: {evaluation.harmonyRating}/100</span>
                    </div>

                    <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-semibold">
                      Hợp mùa: {evaluation.seasonSuitabilityScore}/100
                    </div>
                  </div>
                </div>

                {/* Scent Story */}
                <div className="mt-4 pt-4 border-t border-amber-500/20">
                  <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed font-serif">
                    “{evaluation.poeticNarrative}”
                  </p>
                </div>
              </div>

              {/* Grid feedback: Season critique & Master Perfumer Review */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    Thẩm Định Chuyên Môn
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {evaluation.masterReview}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-cyan-400" />
                    Độ Tương Thích Với {seasonLabel}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {evaluation.seasonFeedback}
                  </p>
                </div>
              </div>

              {/* Longevity, Sillage, Maceration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400">Độ Lưu Hương Dự Kiến</span>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5">
                    {evaluation.longevityHours}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400">Bán Kính Tỏa Hương</span>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5">
                    {evaluation.sillage}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400">Thời Gian Ủ Lạnh (Maceration)</span>
                  <p className="text-sm font-semibold text-amber-300 mt-0.5">
                    {evaluation.macerationAdvice?.split('ở')[0] || '3 - 4 tuần nơi tối'}
                  </p>
                </div>
              </div>

              {/* Safety & IFRA Warnings */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-emerald-300 mb-0.5">
                    Tiêu Chuẩn An Toàn & Khuyến Cáo IFRA:
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    {evaluation.safetyAndIFRA}
                  </p>
                </div>
              </div>

              {/* Source attribution notice */}
              <div className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-2 pt-2">
                <Bot className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {evaluation.message || 'Thẩm định bởi mô hình ngôn ngữ lớn chuyên ngành mùi hương'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
          >
            Đóng
          </button>

          {evaluation && (
            <button
              onClick={handleRunEvaluation}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Thẩm định lại</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
