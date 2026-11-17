import React, { useState } from 'react';
import {
  Compass,
  Clock,
  Wind,
  ThermometerSun,
  Info,
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
import { SpringPerfumeBottleSVG } from './SpringPerfumeBottleSVG';
import { SpringAccordion } from './SpringAccordion';

interface ScentProfileViewProps {
  calculatedIngredients: CalculatedIngredient[];
  tierTotals: { top: number; heart: number; base: number };
  seasonName: string;
  concentrationName: string;
  totalVolume: number;
}

interface ScentDimension {
  facet: string;
  emoji: string;
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
  totalVolume,
}) => {
  const [, setHoveredFacet] = useState<string | null>(null);

  const facetsMap: Record<
    string,
    { emoji: string; english: string; base: number; contributors: { name: string; pct: number }[]; desc: string; color: string }
  > = {
    'Tươi Mát': {
      emoji: '🌿',
      english: 'Fresh & Herbs',
      base: 15,
      contributors: [],
      desc: 'Thanh sạch, sảng khoái từ thảo mộc xanh và lá non',
      color: '#22C55E',
    },
    'Cam Chanh': {
      emoji: '🍋',
      english: 'Citrus Zest',
      base: 15,
      contributors: [],
      desc: 'Tươi sáng, mọng nước từ cam bergamot và vỏ chanh',
      color: '#EAB308',
    },
    'Nồng Nàn': {
      emoji: '✨',
      english: 'Warm Spicy',
      base: 15,
      contributors: [],
      desc: 'Cay ấm nhẹ từ quế và tiêu hồng',
      color: '#F43F5E',
    },
    'Ngọt Ngào': {
      emoji: '🍦',
      english: 'Sweet Gourmand',
      base: 15,
      contributors: [],
      desc: 'Ngọt dịu, êm ái từ vani và hổ phách',
      color: '#F59E0B',
    },
    'Gỗ Trầm': {
      emoji: '🪵',
      english: 'Woody & Earthy',
      base: 15,
      contributors: [],
      desc: 'Mộc mạc, tĩnh tại từ đàn hương và tuyết tùng',
      color: '#B45309',
    },
    'Hoa Cỏ': {
      emoji: '🌸',
      english: 'Floral Bouquet',
      base: 15,
      contributors: [],
      desc: 'Thanh tao, mềm mại từ hoa nhài, hoa anh đào và hoa hồng',
      color: '#EC4899',
    },
    'Quyến Rũ': {
      emoji: '🤍',
      english: 'Musk & Amber',
      base: 15,
      contributors: [],
      desc: 'Sạch sẽ, trong trẻo từ xạ hương trắng',
      color: '#A855F7',
    },
  };

  calculatedIngredients.forEach((ing) => {
    const p = ing.percentage || 0;
    if (p <= 0) return;

    const fam = ing.scentFamily.toLowerCase();
    const name = ing.name.toLowerCase();

    if (
      fam.includes('tươi') ||
      fam.includes('fresh') ||
      fam.includes('thảo mộc') ||
      name.includes('bạc hà') ||
      name.includes('neroli') ||
      name.includes('phong lữ') ||
      name.includes('geranium') ||
      name.includes('lê')
    ) {
      facetsMap['Tươi Mát'].base += p * 1.8;
      facetsMap['Tươi Mát'].contributors.push({ name: ing.name, pct: p });
    }

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

    if (
      fam.includes('ngọt') ||
      fam.includes('gourmand') ||
      fam.includes('trái cây') ||
      name.includes('đào') ||
      name.includes('vani') ||
      name.includes('vanilla') ||
      name.includes('hổ phách') ||
      name.includes('amber') ||
      name.includes('ylang')
    ) {
      facetsMap['Ngọt Ngào'].base += p * 1.7;
      facetsMap['Ngọt Ngào'].contributors.push({ name: ing.name, pct: p });
    }

    if (
      fam.includes('gỗ') ||
      fam.includes('woody') ||
      fam.includes('đất') ||
      name.includes('đàn hương') ||
      name.includes('tuyết tùng') ||
      name.includes('hoắc hương') ||
      name.includes('patchouli') ||
      name.includes('vetiver')
    ) {
      facetsMap['Gỗ Trầm'].base += p * 1.8;
      facetsMap['Gỗ Trầm'].contributors.push({ name: ing.name, pct: p });
    }

    if (
      fam.includes('hoa') ||
      fam.includes('floral') ||
      name.includes('hồng') ||
      name.includes('nhài') ||
      name.includes('jasmine') ||
      name.includes('anh đào') ||
      name.includes('oải hương') ||
      name.includes('diên vĩ')
    ) {
      facetsMap['Hoa Cỏ'].base += p * 1.8;
      facetsMap['Hoa Cỏ'].contributors.push({ name: ing.name, pct: p });
    }

    if (
      fam.includes('phương đông') ||
      fam.includes('oriental') ||
      fam.includes('xạ hương') ||
      fam.includes('musk') ||
      fam.includes('phấn') ||
      name.includes('xạ hương') ||
      name.includes('musk')
    ) {
      facetsMap['Quyến Rũ'].base += p * 1.8;
      facetsMap['Quyến Rũ'].contributors.push({ name: ing.name, pct: p });
    }
  });

  const radarChartData: ScentDimension[] = Object.entries(facetsMap).map(([facet, data]) => {
    const score = Math.min(100, Math.max(15, Math.round(data.base)));
    return {
      facet,
      emoji: data.emoji,
      english: data.english,
      score,
      fullMark: 100,
      contributors: data.contributors,
      description: data.desc,
      color: data.color,
    };
  });

  const dominantFacet = [...radarChartData].sort((a, b) => b.score - a.score)[0];
  const isHeavyBase = tierTotals.base >= 30;
  const isHighTop = tierTotals.top >= 35;
  const longevityText = isHeavyBase ? '8–12 giờ' : '5–7 giờ';
  const sillageText = isHighTop ? 'Tỏa 1.5–2m' : 'Vừa phải';

  const pureMl = Number(((totalVolume * 10) / 100).toFixed(2));
  const carrierMl = Number((totalVolume - pureMl).toFixed(2));

  const CustomRadarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: ScentDimension = payload[0].payload;
      return (
        <div className="bg-white/95 border-2 border-[#FBCFE8] p-3 rounded-2xl shadow-lg max-w-xs text-xs space-y-1.5 z-50">
          <div className="flex items-center justify-between border-b border-[#F3DCE4] pb-1">
            <span className="font-bold text-[#BE185D]">
              {data.emoji} {data.facet}
            </span>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-[#FCE7F3] text-[#BE185D] font-bold">
              {data.score}/100
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
          {dominantFacet.emoji} Chủ đạo: {dominantFacet.facet} ({dominantFacet.score})
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Pastel Radar Chart */}
        <div className="lg:col-span-6 p-4 rounded-3xl bg-white/95 border border-[#FBCFE8] flex flex-col items-center justify-center gap-4">
          <div className="w-full h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarChartData} margin={{ top: 24, right: 32, bottom: 24, left: 32 }}>
                <PolarGrid gridType="polygon" stroke="#F3DCE4" strokeDasharray="3 3" />
                <PolarAngleAxis
                  dataKey="facet"
                  tick={(props: any) => {
                    const { payload, x, y, cx } = props;
                    const item = radarChartData.find((d) => d.facet === payload?.value);
                    const isDominant = payload?.value === dominantFacet.facet;
                    return (
                      <text
                        x={x}
                        y={y}
                        textAnchor={cx != null && x > cx ? 'start' : cx != null && x < cx ? 'end' : 'middle'}
                        dominantBaseline="central"
                        className="text-[11px] font-sans"
                        fill={isDominant ? '#BE185D' : '#4A4D48'}
                        fontWeight={isDominant ? 800 : 600}
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
                  name="Hồ sơ mùi"
                  dataKey="score"
                  stroke="#EC4899"
                  fill="#F9A8D4"
                  fillOpacity={0.45}
                  strokeWidth={2.5}
                  isAnimationActive={false}
                  dot={{ r: 4, fill: '#FEF08A', stroke: '#DB2777', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#EC4899', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
                <Tooltip content={<CustomRadarTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full flex flex-wrap items-center justify-center gap-1.5 pt-2 border-t border-[#F6DCE5]">
            {radarChartData.map((d) => (
              <span
                key={d.facet}
                onMouseEnter={() => setHoveredFacet(d.facet)}
                onMouseLeave={() => setHoveredFacet(null)}
                className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                  d.facet === dominantFacet.facet
                    ? 'bg-[#FCE7F3] text-[#BE185D] border-[#F472B6]'
                    : 'bg-[#FFFDF8] text-[#5C6B5F] border-[#F3DCE4]'
                }`}
              >
                {d.emoji} {d.facet} {d.score}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Color-Layered Bottle + Quick Metrics */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <SpringPerfumeBottleSVG
            ingredients={calculatedIngredients}
            totalVolume={totalVolume}
            concentrationPercent={Math.round(
              calculatedIngredients.reduce((s, i) => s + i.finalProductConcentrationPercent, 0) || 10
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
    </div>
  );
};
