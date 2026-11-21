import React, { useEffect, useMemo, useState } from 'react';
import {
  Compass,
  Clock,
  Wind,
  ThermometerSun,
  Info,
  Sparkles,
  RotateCcw,
  Send,
  Loader2,
  Check,
  Bookmark,
  Minus,
  Plus,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import {
  CalculatedIngredient,
  FormulaSlot,
  calculateDropsFromMl,
} from '../utils/perfumeCalculations';
import {
  AIAdjustmentResult,
  safeRequestPerfumeAdjustment,
} from '../utils/aiPerfumeEngine';
import {
  ScentDimension,
  ScentFacetName,
  ScentTargetDelta,
  buildSensoryAdjustmentPrompt,
  computeScentDimensions,
} from '../utils/scentProfile';
import { SpringPerfumeBottleSVG } from './SpringPerfumeBottleSVG';
import { SpringAccordion } from './SpringAccordion';

interface ScentProfileViewProps {
  calculatedIngredients: CalculatedIngredient[];
  tierTotals: { top: number; heart: number; base: number };
  seasonName: string;
  concentrationName: string;
  concentrationPercent?: number;
  totalVolume: number;
  perfumeName?: string;
  onApplyAdjustedFormula?: (
    adjustedItems: { slotKey: FormulaSlot['key']; newPercentage: number }[],
    proposedName?: string,
    summaryNote?: string
  ) => void;
  onSaveProposedToDrawer?: (
    adjustedItems: { slotKey: FormulaSlot['key']; newPercentage: number }[],
    proposedName: string,
    note: string
  ) => void;
}

interface EditableRadarPoint extends ScentDimension {
  baselineScore: number;
  targetScore: number;
  delta: number;
}

export const ScentProfileView: React.FC<ScentProfileViewProps> = ({
  calculatedIngredients,
  tierTotals,
  seasonName,
  concentrationName,
  concentrationPercent = 10,
  totalVolume,
  perfumeName = 'Floris',
  onApplyAdjustedFormula,
  onSaveProposedToDrawer,
}) => {
  const [, setHoveredFacet] = useState<string | null>(null);
  const [editedScores, setEditedScores] = useState<Partial<Record<ScentFacetName, number>>>({});
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustHint, setAdjustHint] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AIAdjustmentResult | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const formulaSignature = useMemo(
    () =>
      calculatedIngredients
        .map((i) => `${i.slotKey}:${i.id}:${i.percentage}`)
        .join('|'),
    [calculatedIngredients]
  );

  // Sync slider overrides when underlying formula changes
  useEffect(() => {
    setEditedScores({});
    setAdjustHint(null);
  }, [formulaSignature]);

  const baselineDimensions = useMemo(
    () => computeScentDimensions(calculatedIngredients),
    [calculatedIngredients]
  );

  const radarChartData: EditableRadarPoint[] = useMemo(
    () =>
      baselineDimensions.map((dim) => {
        const targetScore =
          typeof editedScores[dim.facet] === 'number'
            ? (editedScores[dim.facet] as number)
            : dim.score;
        return {
          ...dim,
          score: targetScore,
          baselineScore: dim.score,
          targetScore,
          delta: targetScore - dim.score,
        };
      }),
    [baselineDimensions, editedScores]
  );

  const changedDeltas: ScentTargetDelta[] = useMemo(
    () =>
      radarChartData
        .filter((d) => d.delta !== 0)
        .map((d) => ({
          facet: d.facet,
          baseline: d.baselineScore,
          target: d.targetScore,
          delta: d.delta,
        })),
    [radarChartData]
  );

  const hasEdits = changedDeltas.length > 0;

  const dominantFacet = useMemo(
    () => [...radarChartData].sort((a, b) => b.targetScore - a.targetScore)[0],
    [radarChartData]
  );

  const isHeavyBase = tierTotals.base >= 30;
  const isHighTop = tierTotals.top >= 35;
  const longevityText = isHeavyBase ? '8–12 giờ' : '5–7 giờ';
  const sillageText = isHighTop ? 'Tỏa 1.5–2m' : 'Vừa phải';

  const pureMl = Number(((totalVolume * concentrationPercent) / 100).toFixed(2));
  const carrierMl = Number((totalVolume - pureMl).toFixed(2));

  const handleChangeFacetScore = (
    facet: ScentFacetName,
    baselineScore: number,
    nextVal: number
  ) => {
    const clamped = Math.min(100, Math.max(0, Math.round(nextVal)));
    setAdjustHint(null);
    setEditedScores((prev) => {
      if (clamped === baselineScore) {
        const copy = { ...prev };
        delete copy[facet];
        return copy;
      }
      return { ...prev, [facet]: clamped };
    });
  };

  const handleResetSensoryEdits = () => {
    setEditedScores({});
    setAdjustHint(null);
  };

  const handleSendToAI = async () => {
    if (!hasEdits) {
      setAdjustHint(
        'Hãy kéo thanh trượt hoặc bấm +/- để thay đổi ít nhất 1 mức cảm giác trước khi gửi AI.'
      );
      return;
    }

    const promptText = buildSensoryAdjustmentPrompt(changedDeltas, perfumeName);
    setIsAdjusting(true);
    setAdjustHint(null);
    setAppliedSuccess(false);
    setSavedSuccess(false);

    try {
      const result = await safeRequestPerfumeAdjustment({
        userRequest: promptText,
        seasonLabel: seasonName,
        totalVolume,
        concentrationName,
        concentrationPercent,
        ingredients: calculatedIngredients,
        tierTotals,
      });
      setAiResult(result);
    } catch (err: any) {
      setAdjustHint(err?.message || 'Không thể gửi yêu cầu điều chỉnh lúc này.');
    } finally {
      setIsAdjusting(false);
    }
  };

  const activeComparisonRows = useMemo(
    () =>
      (aiResult?.comparisonItems || []).filter(
        (item) => item.oldPercentage > 0 || item.newPercentage > 0
      ),
    [aiResult]
  );

  const predictedDimensions = useMemo(() => {
    if (!aiResult) return null;
    const simulated = calculatedIngredients.map((ing) => {
      const match = aiResult.comparisonItems.find((c) => c.slotKey === ing.slotKey);
      return match ? { ...ing, percentage: match.newPercentage } : ing;
    });
    return computeScentDimensions(simulated);
  }, [aiResult, calculatedIngredients]);

  const totalOldDrops = activeComparisonRows.reduce(
    (sum, item) =>
      sum +
      (typeof item.oldDrops === 'number' && Number.isFinite(item.oldDrops)
        ? Math.round(item.oldDrops)
        : calculateDropsFromMl(item.oldVolumeMl, item.oldPercentage > 0)),
    0
  );
  const totalNewDrops = activeComparisonRows.reduce(
    (sum, item) =>
      sum +
      (typeof item.newDrops === 'number' && Number.isFinite(item.newDrops)
        ? Math.round(item.newDrops)
        : calculateDropsFromMl(item.newVolumeMl, item.newPercentage > 0)),
    0
  );

  const CustomRadarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: EditableRadarPoint = payload[0].payload;
      return (
        <div className="bg-white/95 border-2 border-[#FBCFE8] p-3 rounded-2xl shadow-lg max-w-xs text-xs space-y-1.5 z-50">
          <div className="flex items-center justify-between border-b border-[#F3DCE4] pb-1 gap-2">
            <span className="font-bold text-[#BE185D]">
              {data.emoji} {data.facet}
            </span>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-[#FCE7F3] text-[#BE185D] font-bold">
              {data.delta !== 0
                ? `${data.baselineScore} → ${data.targetScore}`
                : `${data.baselineScore}/100`}
            </span>
          </div>
          {data.contributors.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {data.contributors.map((c, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-[#ECFDF3] text-[#15803D] font-mono font-bold"
                >
                  {c.name.split('(')[0].trim()} ({c.pct}%)
                </span>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="spring-card-sakura p-5 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="px-3 py-1 rounded-full bg-white text-[#BE185D] text-xs font-bold border border-[#FBCFE8] whitespace-nowrap">
            Bước 4 · Hồ sơ mùi
          </span>
          <h2 className="text-lg font-bold text-[#2B342D] flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#EC4899]" />
            <span>Biểu đồ mùi hương</span>
          </h2>
        </div>

        <span className="text-xs px-3 py-1 rounded-full bg-[#FEF3C7] border border-[#FCD34D] text-[#92400E] font-bold self-start sm:self-auto">
          {dominantFacet.emoji} Chủ đạo: {dominantFacet.facet} ({dominantFacet.targetScore})
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Interactive Pastel Radar Chart + Sensory Level Editors */}
        <div className="lg:col-span-6 p-4 rounded-3xl bg-white/95 border border-[#FBCFE8] flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-[#9D174D]">
              Chỉnh mức cảm giác để AI cân lại công thức gốc
            </span>
            {hasEdits && (
              <div className="flex items-center gap-2 text-[10px] font-bold">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]">
                  <span className="w-2 h-2 rounded-full bg-[#64748B]" />
                  Gốc
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FCE7F3] text-[#BE185D] border border-[#F9A8D4]">
                  <span className="w-2 h-2 rounded-full bg-[#EC4899]" />
                  Mục tiêu
                </span>
              </div>
            )}
          </div>

          <div className="w-full h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarChartData} margin={{ top: 20, right: 32, bottom: 20, left: 32 }}>
                <PolarGrid gridType="polygon" stroke="#F3DCE4" strokeDasharray="3 3" />
                <PolarAngleAxis
                  dataKey="facet"
                  tick={(props: any) => {
                    const { payload, x, y, cx } = props;
                    const item = radarChartData.find((d) => d.facet === payload?.value);
                    const isDominant = payload?.value === dominantFacet.facet;
                    const isEdited = item ? item.delta !== 0 : false;
                    return (
                      <text
                        x={x}
                        y={y}
                        textAnchor={cx != null && x > cx ? 'start' : cx != null && x < cx ? 'end' : 'middle'}
                        dominantBaseline="central"
                        className="text-[11px] font-sans"
                        fill={isEdited || isDominant ? '#BE185D' : '#4A4D48'}
                        fontWeight={isEdited || isDominant ? 800 : 600}
                      >
                        {item ? `${item.emoji} ${payload?.value}` : payload?.value}
                      </text>
                    );
                  }}
                />
                <PolarRadiusAxis
                  angle={64}
                  domain={[0, 100]}
                  stroke="#E5E7EB"
                  tick={{ fill: '#7A6B72', fontSize: 9 }}
                  tickCount={5}
                />
                <Radar
                  name="Công thức gốc"
                  dataKey="baselineScore"
                  stroke={hasEdits ? '#64748B' : '#EC4899'}
                  strokeDasharray={hasEdits ? '4 4' : undefined}
                  fill={hasEdits ? '#CBD5E1' : '#F9A8D4'}
                  fillOpacity={hasEdits ? 0.22 : 0.45}
                  strokeWidth={hasEdits ? 2 : 2.5}
                  isAnimationActive={false}
                  dot={
                    hasEdits
                      ? false
                      : { r: 4, fill: '#FEF08A', stroke: '#DB2777', strokeWidth: 2 }
                  }
                />
                {hasEdits && (
                  <Radar
                    name="Mục tiêu cảm giác"
                    dataKey="targetScore"
                    stroke="#EC4899"
                    fill="#F9A8D4"
                    fillOpacity={0.45}
                    strokeWidth={2.5}
                    isAnimationActive={false}
                    dot={{ r: 4, fill: '#FEF08A', stroke: '#DB2777', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#EC4899', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                )}
                <Tooltip content={<CustomRadarTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Interactive 7-Facet Sensory Sliders */}
          <div className="space-y-2 pt-2 border-t border-[#F6DCE5]">
            {radarChartData.map((d) => {
              const deltaSign = d.delta > 0 ? '+' : '';
              return (
                <div
                  key={d.facet}
                  onMouseEnter={() => setHoveredFacet(d.facet)}
                  onMouseLeave={() => setHoveredFacet(null)}
                  className={`px-2.5 py-2 rounded-2xl border transition-colors ${
                    d.delta !== 0
                      ? 'bg-[#FFF5F8] border-[#F9A8D4]'
                      : 'bg-[#FFFDF8] border-[#F3DCE4]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-[#2B342D] flex items-center gap-1.5">
                      <span>{d.emoji}</span>
                      <span>{d.facet}</span>
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      {d.delta !== 0 ? (
                        <>
                          <span className="text-[#64748B]">{d.baselineScore}</span>
                          <span className="text-[#9D174D]">→</span>
                          <span className="font-bold text-[#BE185D]">{d.targetScore}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                              d.delta > 0
                                ? 'bg-[#DCFCE7] text-[#15803D]'
                                : 'bg-[#FCE7F3] text-[#BE185D]'
                            }`}
                          >
                            {deltaSign}
                            {d.delta}
                          </span>
                        </>
                      ) : (
                        <span className="font-bold text-[#5C6B5F]">{d.targetScore}/100</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleChangeFacetScore(d.facet, d.baselineScore, d.targetScore - 5)
                      }
                      aria-label={`Giảm ${d.facet}`}
                      disabled={d.targetScore <= 0}
                      className="w-6 h-6 rounded-full bg-white border border-[#F3DCE4] hover:border-[#F472B6] disabled:opacity-40 flex items-center justify-center text-[#9D174D] shrink-0"
                    >
                      <Minus className="w-3 h-3" />
                    </button>

                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={d.targetScore}
                      aria-label={`Mức độ ${d.facet}`}
                      onChange={(e) =>
                        handleChangeFacetScore(
                          d.facet,
                          d.baselineScore,
                          Number(e.target.value)
                        )
                      }
                      className="flex-1 h-2 rounded-full cursor-pointer accent-[#EC4899]"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        handleChangeFacetScore(d.facet, d.baselineScore, d.targetScore + 5)
                      }
                      aria-label={`Tăng ${d.facet}`}
                      disabled={d.targetScore >= 100}
                      className="w-6 h-6 rounded-full bg-white border border-[#F3DCE4] hover:border-[#F472B6] disabled:opacity-40 flex items-center justify-center text-[#9D174D] shrink-0"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Send to AI Footer Controls */}
          <div className="pt-2 border-t border-[#F6DCE5] space-y-2">
            {adjustHint && (
              <p className="text-[11px] font-bold text-[#BE185D] bg-[#FFF1F5] border border-[#FBCFE8] px-3 py-1.5 rounded-xl">
                {adjustHint}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleResetSensoryEdits}
                disabled={!hasEdits || isAdjusting}
                className="px-3 py-2 rounded-2xl bg-[#FFFDF8] hover:bg-[#FFF5F8] disabled:opacity-45 text-[#5C6B5F] border border-[#F3DCE4] text-xs font-bold flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đặt lại</span>
              </button>

              <button
                type="button"
                onClick={handleSendToAI}
                disabled={isAdjusting}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-2xl bg-gradient-to-r from-[#EC4899] to-[#F472B6] hover:from-[#DB2777] hover:to-[#EC4899] disabled:opacity-60 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                {isAdjusting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang gửi AI...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi AI điều chỉnh</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Color-Layered Bottle + Quick Metrics */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <SpringPerfumeBottleSVG
            ingredients={calculatedIngredients}
            totalVolume={totalVolume}
            concentrationPercent={Math.round(
              calculatedIngredients.reduce((s, i) => s + i.finalProductConcentrationPercent, 0) ||
                concentrationPercent
            )}
            pureFragranceMl={pureMl}
            carrierAlcoholMl={carrierMl}
            compact
          />

          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-white/95 border border-[#FBCFE8] text-center">
              <Clock className="w-4 h-4 text-[#DB2777] mx-auto mb-1" />
              <span className="text-[10px] font-bold text-[#5C6B5F] block">Lưu hương</span>
              <span className="text-xs font-bold text-[#2B342D]">{longevityText}</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/95 border border-[#BBF7D0] text-center">
              <Wind className="w-4 h-4 text-[#16A34A] mx-auto mb-1" />
              <span className="text-[10px] font-bold text-[#5C6B5F] block">Tỏa hương</span>
              <span className="text-xs font-bold text-[#2B342D]">{sillageText}</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/95 border border-[#FDE68A] text-center">
              <ThermometerSun className="w-4 h-4 text-[#D97706] mx-auto mb-1" />
              <span className="text-[10px] font-bold text-[#5C6B5F] block">Mùa hợp</span>
              <span className="text-xs font-bold text-[#2B342D]">
                {seasonName.split('(')[0].trim()}
              </span>
            </div>
          </div>

          <SpringAccordion
            title="Lưu ý khoa học về dự đoán"
            icon={<Info className="w-4 h-4 text-[#D97706]" />}
            tone="butter"
          >
            <p className="leading-relaxed">
              Biểu đồ nhóm hương, độ lưu hương và tỏa hương là <strong>dự đoán lý thuyết</strong> dựa trên tỉ lệ phần trăm và áp suất hơi của từng thành phần. Cần pha mẫu thử thực tế để kiểm chứng.
            </p>
          </SpringAccordion>
        </div>
      </div>

      {/* AI Adjustment Proposal Card (from Sensory Target Edits) */}
      {aiResult && (
        <div
          aria-label="Kết quả AI điều chỉnh từ hồ sơ cảm giác"
          className="p-4 sm:p-5 rounded-3xl bg-white/95 border-2 border-[#86EFAC] shadow-sm space-y-4"
        >
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] text-[11px] font-bold border border-[#86EFAC] inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Đề xuất từ biểu đồ cảm giác
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#FFFDF0] text-[#92400E] text-[10px] font-mono font-bold border border-[#FDE68A]">
                  {aiResult.source === 'gemini_api' ? 'Gemini AI' : 'Floris Engine'}
                </span>
              </div>
              <h3 className="text-base font-bold text-[#2B342D]">
                {aiResult.proposedPerfumeName}
              </h3>
              <p className="text-xs text-[#4A4D48]">{aiResult.analysisSummary}</p>
            </div>

            <button
              type="button"
              onClick={() => setAiResult(null)}
              aria-label="Đóng kết quả đề xuất AI"
              className="p-1.5 rounded-full bg-[#FFF5F8] hover:bg-[#FCE7F3] text-[#9D174D]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {predictedDimensions && (
            <div className="flex flex-wrap gap-1.5">
              {predictedDimensions.map((dim) => {
                const baseDim = baselineDimensions.find((b) => b.facet === dim.facet);
                const diff = baseDim ? dim.score - baseDim.score : 0;
                return (
                  <span
                    key={dim.facet}
                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                      diff > 0
                        ? 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]'
                        : diff < 0
                        ? 'bg-[#FFF1F5] text-[#BE185D] border-[#FBCFE8]'
                        : 'bg-[#FFFDF8] text-[#5C6B5F] border-[#F3DCE4]'
                    }`}
                  >
                    {dim.emoji} {dim.facet}: {dim.score}
                    {diff !== 0 && ` (${diff > 0 ? '+' : ''}${diff})`}
                  </span>
                );
              })}
            </div>
          )}

          <div className="overflow-x-auto rounded-2xl border border-[#F3DCE4]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#FFF5F8] text-[#9D174D] font-bold text-[11px] border-b border-[#FBCFE8]">
                <tr>
                  <th className="py-2.5 px-3">Nguyên liệu</th>
                  <th className="py-2.5 px-3">Tầng</th>
                  <th className="py-2.5 px-3 text-right">Tỷ lệ (% gốc → mới)</th>
                  <th className="py-2.5 px-3 text-right">Thể tích (mL)</th>
                  <th className="py-2.5 px-3 text-right text-[#15803D] bg-[#ECFDF3]/70 whitespace-nowrap">
                    Số giọt (0,05mL)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F6DCE5] font-mono">
                {activeComparisonRows.map((item) => {
                  const oldDrops =
                    typeof item.oldDrops === 'number' && Number.isFinite(item.oldDrops)
                      ? Math.round(item.oldDrops)
                      : calculateDropsFromMl(item.oldVolumeMl, item.oldPercentage > 0);
                  const newDrops =
                    typeof item.newDrops === 'number' && Number.isFinite(item.newDrops)
                      ? Math.round(item.newDrops)
                      : calculateDropsFromMl(item.newVolumeMl, item.newPercentage > 0);
                  const sign = item.deltaPercentage > 0 ? '+' : '';
                  return (
                    <tr key={item.slotKey} className="hover:bg-[#FFFDF8]">
                      <td className="py-2.5 px-3 font-sans font-bold text-[#2B342D]">
                        {item.name.split('(')[0].trim()}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-[#5C6B5F]">
                        {item.tierLabel}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold">
                        <span className="text-[#5C6B5F]">{item.oldPercentage}%</span>
                        <span className="mx-1 text-[#9D174D]">→</span>
                        <span className="text-[#BE185D]">{item.newPercentage}%</span>
                        {item.deltaPercentage !== 0 && (
                          <span
                            className={`ml-1.5 text-[10px] ${
                              item.deltaPercentage > 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'
                            }`}
                          >
                            ({sign}
                            {item.deltaPercentage}%)
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#2B342D]">
                        {item.oldVolumeMl.toFixed(2)} → {item.newVolumeMl.toFixed(2)} mL
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#15803D] bg-[#ECFDF3]/40 whitespace-nowrap">
                        {oldDrops} → {newDrops} giọt
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-[#FFFDF0] border-t border-[#FDE68A] font-mono font-bold">
                <tr>
                  <td colSpan={2} className="py-2.5 px-3 font-sans text-[#2B342D]">
                    Tổng cốt hương ({totalVolume} mL · {concentrationPercent}%)
                  </td>
                  <td className="py-2.5 px-3 text-right text-[#BE185D]">
                    100% → {aiResult.validationReport?.validatedSum ?? 100}%
                  </td>
                  <td className="py-2.5 px-3 text-right text-[#2B342D]">
                    {pureMl.toFixed(2)} mL
                  </td>
                  <td className="py-2.5 px-3 text-right text-[#15803D] bg-[#ECFDF3] whitespace-nowrap">
                    {totalOldDrops} → {totalNewDrops} giọt
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-start gap-2.5 pt-1">
            {onSaveProposedToDrawer && (
              <button
                type="button"
                onClick={() => {
                  onSaveProposedToDrawer(
                    aiResult.comparisonItems.map((c) => ({
                      slotKey: c.slotKey,
                      newPercentage: c.newPercentage,
                    })),
                    aiResult.proposedPerfumeName,
                    aiResult.analysisSummary
                  );
                  setSavedSuccess(true);
                }}
                className="px-4 py-2 rounded-2xl bg-[#FFFDF0] hover:bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-xs font-bold flex items-center gap-1.5"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>Đã lưu mẫu</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Lưu mẫu so sánh</span>
                  </>
                )}
              </button>
            )}

            {onApplyAdjustedFormula && (
              <button
                type="button"
                onClick={() => {
                  onApplyAdjustedFormula(
                    aiResult.comparisonItems.map((c) => ({
                      slotKey: c.slotKey,
                      newPercentage: c.newPercentage,
                    })),
                    aiResult.proposedPerfumeName,
                    aiResult.analysisSummary
                  );
                  setAppliedSuccess(true);
                }}
                className="px-4 py-2 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{appliedSuccess ? 'Đã áp dụng công thức' : 'Áp dụng công thức'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
