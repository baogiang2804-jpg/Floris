import React from 'react';
import { Beaker, Droplets } from 'lucide-react';

interface VolumeAndConcentrationProps {
  totalVolume: number;
  onChangeVolume: (volume: number) => void;
  concentrationName: string;
  concentrationPercent: number;
  onChangeConcentration: (name: string, percent: number) => void;
  pureFragranceMl: number;
  carrierAlcoholMl: number;
}

const CONCENTRATIONS = [
  { name: 'Extrait de Parfum', percent: 25, desc: 'Đậm đặc · 10-14h' },
  { name: 'Eau de Parfum (EDP)', percent: 18, desc: 'Chuẩn cân bằng · 6-8h' },
  { name: 'Cốt hương Thực Nghiệm (10%)', percent: 10, desc: 'Mẫu chuẩn Floris · Nhẹ dịu' },
  { name: 'Eau de Toilette (EDT)', percent: 12, desc: 'Thanh thoát · 4-6h' },
  { name: 'Eau de Cologne (EDC)', percent: 6, desc: 'Tươi mát · 2-3h' },
];

export const VolumeAndConcentration: React.FC<VolumeAndConcentrationProps> = ({
  totalVolume,
  onChangeVolume,
  concentrationName,
  concentrationPercent,
  onChangeConcentration,
  pureFragranceMl,
  carrierAlcoholMl,
}) => {
  const quickVolumes = [10, 30, 50, 100];
  const estimatedSprays = Math.round(totalVolume * 10);

  return (
    <div className="spring-card-leaf p-5 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] text-xs font-bold border border-[#86EFAC] whitespace-nowrap">
            Bước 2 · Thể tích &amp; Nồng độ
          </span>
          <h2 className="text-lg font-bold text-[#2B342D]">
            Định lượng chai pha chế
          </h2>
        </div>

        <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white text-[#15803D] border border-[#BBF7D0]">
          ~{estimatedSprays} lần xịt
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left: Volume selection */}
        <div className="p-4 rounded-3xl bg-white/90 border border-[#C8F0D4] space-y-3">
          <label className="block text-xs font-bold text-[#2B342D]">
            🧴 Dung tích chai (mL)
          </label>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[110px]">
              <input
                type="number"
                min={5}
                max={500}
                step={1}
                value={totalVolume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val > 0) onChangeVolume(val);
                }}
                className="w-full px-4 py-2.5 bg-[#FFFDF8] border-2 border-[#86EFAC] rounded-2xl text-[#2B342D] font-mono font-bold text-base focus:outline-none focus:ring-2 focus:ring-[#4ADE80]/50"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#5C6B5F]">
                mL
              </span>
            </div>

            <div className="flex gap-1.5">
              {quickVolumes.map((vol) => (
                <button
                  key={vol}
                  type="button"
                  onClick={() => onChangeVolume(vol)}
                  className={`px-3 py-2.5 rounded-2xl text-xs font-mono font-bold border transition-all ${
                    totalVolume === vol
                      ? 'bg-[#FCE7F3] border-[#F472B6] text-[#BE185D] shadow-xs'
                      : 'bg-[#FFFDF8] border-[#E5E7EB] text-[#5C6B5F] hover:border-[#F9A8D4]'
                  }`}
                >
                  {vol}ml
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Concentration + Visual Ratio Bar */}
        <div className="p-4 rounded-3xl bg-white/90 border border-[#C8F0D4] space-y-3">
          <label className="block text-xs font-bold text-[#2B342D]">
            💧 Nồng độ tinh dầu
          </label>

          <select
            value={concentrationName}
            onChange={(e) => {
              const selected = CONCENTRATIONS.find((c) => c.name === e.target.value);
              if (selected) onChangeConcentration(selected.name, selected.percent);
            }}
            className="w-full px-4 py-2.5 bg-[#FFFDF8] border-2 border-[#FBCFE8] rounded-2xl text-[#2B342D] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#F472B6]/40"
          >
            {CONCENTRATIONS.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.percent}%) · {c.desc}
              </option>
            ))}
          </select>

          {/* Visual Ratio Bar (Cốt vs Dung môi) */}
          <div className="space-y-1.5">
            <div className="w-full h-3.5 rounded-full overflow-hidden flex border border-[#F3DCE4] bg-[#FFFDF8]">
              <div
                style={{ width: `${concentrationPercent}%` }}
                className="bg-[#F472B6] transition-all duration-300"
                title={`Cốt tinh dầu ${concentrationPercent}%`}
              />
              <div
                style={{ width: `${100 - concentrationPercent}%` }}
                className="bg-[#86EFAC] transition-all duration-300"
                title={`Dung môi ${100 - concentrationPercent}%`}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#FFF1F5] border border-[#FBCFE8]">
                <Droplets className="w-4 h-4 text-[#DB2777] shrink-0" />
                <div>
                  <span className="text-[11px] font-bold text-[#9D174D] block">
                    Cốt hương ({concentrationPercent}%)
                  </span>
                  <span className="font-mono font-bold text-[#2B342D]">
                    {pureFragranceMl} mL ({Math.round(pureFragranceMl * 20)} giọt)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#ECFDF3] border border-[#BBF7D0]">
                <Beaker className="w-4 h-4 text-[#16A34A] shrink-0" />
                <div>
                  <span className="text-[11px] font-bold text-[#166534] block">
                    Dung môi ({100 - concentrationPercent}%)
                  </span>
                  <span className="font-mono font-bold text-[#2B342D]">
                    {carrierAlcoholMl} mL ({Math.round(carrierAlcoholMl * 20)} giọt)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
