import React, { useState } from 'react';
import {
  Compass,
  Clock,
  Wind,
  Sparkles,
  Layers,
  ThermometerSun,
  Droplets,
  Info,
  Sliders,
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
import { CalculatedIngredient } from '../utils/perfumeCalculations';

interface ScentProfileViewProps {
  calculatedIngredients: CalculatedIngredient[];
  tierTotals: { top: number; heart: number; base: number };
  seasonName: string;
  concentrationName: string;
  totalVolume: number;
}

interface ScentDimension {
  facet: string;
  english: string;
  score: number;
  fullMark: number;
  contributors: { name: string; pct: number }[];
  description: string;
  color: string;
}

export const ScentProfileView: React.FC<ScentProfileViewProps> = ({
  calculatedIngredients,
  tierTotals,
  seasonName,
  concentrationName,
  totalVolume,
}) => {
  const [hoveredFacet, setHoveredFacet] = useState<string | null>(null);

  // Calculate dynamic scores for each fragrance facet based on actual active ingredients & percentages
  const facetsMap: Record<
    string,
    { english: string; base: number; contributors: { name: string; pct: number }[]; desc: string; color: string }
  > = {
    'Tươi Mát': {
      english: 'Fresh & Herbs',
      base: 15,
      contributors: [],
      desc: 'Cảm giác thanh sạch, sảng khoái, the mát từ bạc hà, hoa cam và thảo mộc xanh',
      color: '#2DD4BF',
    },
    'Cam Chanh': {
      english: 'Citrus Zest',
      base: 15,
      contributors: [],
      desc: 'Bừng sáng, mọng nước, lấp lánh từ tép cam quýt và tinh dầu vỏ chanh bergamot',
      color: '#FACC15',
    },
    'Nồng Nàn': {
      english: 'Warm Spicy',
      base: 15,
      contributors: [],
      desc: 'Hương cay ấm nồng, kích thích khứu giác từ quế, tiêu hồng và bạch đậu khấu',
      color: '#FB7185',
    },
    'Ngọt Ngào': {
      english: 'Sweet Gourmand',
      base: 15,
      contributors: [],
      desc: 'Vị mật ngọt dịu dàng, êm ái của vani Madagascar, hổ phách và hoa ngọc lan tây',
      color: '#F59E0B',
    },
    'Gỗ Trầm': {
      english: 'Woody & Earthy',
      base: 15,
      contributors: [],
      desc: 'Mộc mạc, tĩnh tại, đĩnh đạc từ đàn hương Mysore, tuyết tùng và hoắc hương',
      color: '#D97706',
    },
    'Hoa Cỏ': {
      english: 'Floral Bouquet',
      base: 15,
      contributors: [],
      desc: 'Nét kiêu sa, đằm thắm mật hoa từ hồng de Mai, hoa nhài Sambac và phong lữ',
      color: '#F43F5E',
    },
    'Quyến Rũ': {
      english: 'Musk & Amber',
      base: 15,
      contributors: [],
      desc: 'Làn da sạch sẽ, gợi cảm bí ẩn từ xạ hương trắng, rễ diên vĩ và nhựa thơm',
      color: '#A855F7',
    },
  };

  calculatedIngredients.forEach((ing) => {
    const p = ing.percentage || 0;
    if (p <= 0) return;

    const fam = ing.scentFamily.toLowerCase();
    const name = ing.name.toLowerCase();

    // 1. Tươi mát (Fresh)
    if (
      fam.includes('tươi') ||
      fam.includes('fresh') ||
      fam.includes('thảo mộc') ||
      name.includes('bạc hà') ||
      name.includes('neroli') ||
      name.includes('phong lữ') ||
      name.includes('geranium')
    ) {
      facetsMap['Tươi Mát'].base += p * 1.8;
      facetsMap['Tươi Mát'].contributors.push({ name: ing.name, pct: p });
    }

    // 2. Cam Chanh (Citrus)
    if (
      fam.includes('cam') ||
      fam.includes('citrus') ||
      name.includes('bergamot') ||
      name.includes('chanh') ||
      name.includes('cam') ||
      name.includes('quýt') ||
      name.includes('mandarin')
    ) {
      facetsMap['Cam Chanh'].base += p * 1.8;
      facetsMap['Cam Chanh'].contributors.push({ name: ing.name, pct: p });
    }

    // 3. Nồng Nàn (Spicy / Warm)
    if (
      fam.includes('cay') ||
      fam.includes('gia vị') ||
      fam.includes('spicy') ||
      name.includes('quế') ||
      name.includes('tiêu') ||
      name.includes('đậu khấu') ||
      name.includes('cardamom')
    ) {
      facetsMap['Nồng Nàn'].base += p * 2.0;
      facetsMap['Nồng Nàn'].contributors.push({ name: ing.name, pct: p });
    }

    // 4. Ngọt Ngào (Sweet Gourmand)
    if (
      fam.includes('ngọt') ||
      fam.includes('gourmand') ||
      name.includes('vani') ||
      name.includes('vanilla') ||
      name.includes('hổ phách') ||
      name.includes('amber') ||
      name.includes('ylang') ||
      name.includes('ngọc lan')
    ) {
      facetsMap['Ngọt Ngào'].base += p * 1.7;
      facetsMap['Ngọt Ngào'].contributors.push({ name: ing.name, pct: p });
    }

    // 5. Gỗ Trầm (Woody)
    if (
      fam.includes('gỗ') ||
      fam.includes('woody') ||
      fam.includes('đất') ||
      name.includes('đàn hương') ||
      name.includes('tuyết tùng') ||
      name.includes('hoắc hương') ||
      name.includes('patchouli') ||
      name.includes('vetiver') ||
      name.includes('hương bài')
    ) {
      facetsMap['Gỗ Trầm'].base += p * 1.8;
      facetsMap['Gỗ Trầm'].contributors.push({ name: ing.name, pct: p });
    }

    // 6. Hoa Cỏ (Floral)
    if (
      fam.includes('hoa') ||
      fam.includes('floral') ||
      name.includes('hồng') ||
      name.includes('nhài') ||
      name.includes('jasmine') ||
      name.includes('rose') ||
      name.includes('oải hương') ||
      name.includes('lavender') ||
      name.includes('diên vĩ') ||
      name.includes('iris')
    ) {
      facetsMap['Hoa Cỏ'].base += p * 1.8;
      facetsMap['Hoa Cỏ'].contributors.push({ name: ing.name, pct: p });
    }

    // 7. Quyến Rũ (Oriental / Musk)
    if (
      fam.includes('phương đông') ||
      fam.includes('oriental') ||
      fam.includes('xạ hương') ||
      fam.includes('musk') ||
      fam.includes('phấn') ||
      name.includes('xạ hương') ||
      name.includes('musk') ||
      name.includes('amber') ||
      name.includes('hổ phách')
    ) {
      facetsMap['Quyến Rũ'].base += p * 1.8;
      facetsMap['Quyến Rũ'].contributors.push({ name: ing.name, pct: p });
    }
  });

  // Format dataset for Recharts RadarChart
  const radarChartData: ScentDimension[] = Object.entries(facetsMap).map(([facet, data]) => {
    const rawScore = Math.round(data.base);
    const score = Math.min(100, Math.max(15, rawScore));
    return {
      facet,
      english: data.english,
      score,
      fullMark: 100,
      contributors: data.contributors,
      description: data.desc,
      color: data.color,
    };
  });

  // Top dominant olfactory facet
  const dominantFacet = [...radarChartData].sort((a, b) => b.score - a.score)[0];

  // Performance calculations
  const isHeavyBase = tierTotals.base >= 30;
  const isHighTop = tierTotals.top >= 35;
  const longevityText = isHeavyBase ? '8 - 12 giờ (Rất bền mùi)' : '5 - 7 giờ (Bền mùi vừa phải)';
  const sillageText = isHighTop ? 'Tỏa rộng (1.5 - 2m)' : 'Vừa phải (1 sải tay)';

  // Custom Recharts Tooltip Component
  const CustomRadarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: ScentDimension = payload[0].payload;
      return (
        <div className="bg-slate-950/95 border border-amber-500/50 p-3 rounded-xl shadow-2xl backdrop-blur-md max-w-xs text-xs space-y-1.5 z-50">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-amber-300 font-serif text-sm">
              {data.facet}
            </span>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              {data.score} / 100
            </span>
          </div>

          <p className="text-[11px] text-slate-300 leading-tight">
            {data.description}
          </p>

          <div className="pt-1.5 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-mono block mb-1">
              Nguyên liệu đóng góp:
            </span>
            {data.contributors.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {data.contributors.map((c, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-200 font-mono"
                  >
                    {c.name.split(' ')[0]} ({c.pct}%)
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[10px] text-slate-500 italic">
                Nốt hương nền cơ bản (chưa có nguyên liệu chủ đạo)
              </span>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 backdrop-blur-sm shadow-xl">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-amber-400/90 font-semibold">
            Bước 4: Trực Quan Hóa Cảm Quan (Recharts)
          </span>
          <h2 className="text-lg font-serif font-bold text-slate-100 flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            Hồ Sơ Mùi Hương Đa Chiều (Recharts RadarChart)
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono">
            Nhóm chủ đạo: <strong>{dominantFacet.facet}</strong> ({dominantFacet.score}/100)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Recharts Radar Chart */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-3 sm:p-4 bg-slate-950/70 rounded-2xl border border-slate-800 relative">
          <div className="w-full h-80 sm:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarChartData} margin={{ top: 15, right: 25, bottom: 15, left: 25 }}>
                <PolarGrid
                  gridType="polygon"
                  stroke="#334155"
                  strokeDasharray="3 3"
                />
                <PolarAngleAxis
                  dataKey="facet"
                  tick={(props: any) => {
                    const { payload, x, y, cx } = props;
                    const isDominant = payload?.value === dominantFacet.facet;
                    return (
                      <text
                        x={x}
                        y={y}
                        textAnchor={cx != null && x > cx ? 'start' : cx != null && x < cx ? 'end' : 'middle'}
                        dominantBaseline="central"
                        className="text-[11px] font-sans transition-colors"
                        fill={isDominant ? '#F59E0B' : '#94A3B8'}
                        fontWeight={isDominant ? 700 : 500}
                      >
                        {payload?.value}
                      </text>
                    );
                  }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  stroke="#475569"
                  tick={{ fill: '#64748B', fontSize: 9 }}
                  tickCount={5}
                />
                <Radar
                  name="Hồ Sơ Mùi Hương"
                  dataKey="score"
                  stroke="#F59E0B"
                  fill="#F59E0B"
                  fillOpacity={0.35}
                  strokeWidth={2.5}
                  dot={{
                    r: 4,
                    fill: '#FDE68A',
                    stroke: '#B45309',
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 6,
                    fill: '#F59E0B',
                    stroke: '#FFFFFF',
                    strokeWidth: 2,
                  }}
                  isAnimationActive={true}
                />
                <Tooltip content={<CustomRadarTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Interactive Facet Badges below radar */}
          <div className="w-full flex flex-wrap items-center justify-center gap-1.5 mt-2 pt-3 border-t border-slate-800/80">
            {radarChartData.map((d) => (
              <span
                key={d.facet}
                onMouseEnter={() => setHoveredFacet(d.facet)}
                onMouseLeave={() => setHoveredFacet(null)}
                className={`text-[11px] px-2 py-0.5 rounded-full font-mono transition-all cursor-default border ${
                  d.facet === dominantFacet.facet
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {d.facet}: {d.score}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 text-center">
            * Rê chuột lên các điểm radar để xem chi tiết nốt hương đóng góp
          </p>
        </div>

        {/* Right: Olfactory Pyramid & Metrics */}
        <div className="lg:col-span-6 space-y-4">
          {/* Visual Olfactory Pyramid Layer Stack */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5 mb-2">
              <Layers className="w-4 h-4 text-amber-400" />
              Cấu Trúc Kim Tự Tháp Hương (Olfactory Pyramid)
            </h3>

            {/* Top Tier */}
            <div className="p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-yellow-300">Tầng Đầu ({tierTotals.top}%)</span>
                <span className="text-[11px] font-mono text-yellow-400/80">Bay hơi nhanh • Sôi động</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {calculatedIngredients.slice(0, 2).map((ing) => (
                  <span
                    key={ing.slotKey}
                    className="text-[11px] px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-200 border border-yellow-500/30"
                  >
                    {ing.name} ({ing.percentage}%)
                  </span>
                ))}
              </div>
            </div>

            {/* Heart Tier */}
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-rose-300">Tầng Giữa ({tierTotals.heart}%)</span>
                <span className="text-[11px] font-mono text-rose-400/80">Linh hồn mùi hương • Nồng nàn</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {calculatedIngredients.slice(2, 4).map((ing) => (
                  <span
                    key={ing.slotKey}
                    className="text-[11px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-200 border border-rose-500/30"
                  >
                    {ing.name} ({ing.percentage}%)
                  </span>
                ))}
              </div>
            </div>

            {/* Base Tier */}
            <div className="p-2.5 rounded-lg bg-amber-600/10 border border-amber-600/30">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-amber-300">Tầng Cuối ({tierTotals.base}%)</span>
                <span className="text-[11px] font-mono text-amber-400/80">Lớp nền neo giữ • Sâu lắng</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {calculatedIngredients.slice(4, 6).map((ing) => (
                  <span
                    key={ing.slotKey}
                    className="text-[11px] px-2 py-0.5 rounded bg-amber-600/20 text-amber-200 border border-amber-600/30"
                  >
                    {ing.name} ({ing.percentage}%)
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Performance cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Dự Đoán Độ Lưu Hương</span>
              </div>
              <p className="text-sm font-semibold text-slate-200">{longevityText}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Wind className="w-4 h-4 text-cyan-400" />
                <span>Dự Đoán Độ Tỏa Hương</span>
              </div>
              <p className="text-sm font-semibold text-slate-200">{sillageText}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <ThermometerSun className="w-4 h-4 text-rose-400" />
                <span>Mùa Phù Hợp Dự Kiến</span>
              </div>
              <p className="text-sm font-semibold text-slate-200">{seasonName}</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-2 text-[11px] text-amber-200/90">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Lưu ý Khoa học:</strong> Biểu đồ nhóm hương, độ lưu hương và độ tỏa hương trên đây là <strong>dự đoán lý thuyết</strong> dựa trên tỉ lệ phần trăm và áp suất hơi của các thành phần, <strong>không phải kết quả thực nghiệm đã được chứng minh</strong>. Cần pha chế mẫu thử và đánh giá cảm quan thực tế để kiểm chứng.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
