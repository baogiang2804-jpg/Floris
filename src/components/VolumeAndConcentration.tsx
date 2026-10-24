import React from 'react';
import { Beaker, Droplets, Gauge } from 'lucide-react';

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
  { name: 'Extrait de Parfum', percent: 25, desc: 'Đậm đặc nhất, lưu hương 10-14h+' },
  { name: 'Eau de Parfum (EDP)', percent: 18, desc: 'Tiêu chuẩn vàng phổ biến, lưu 6-8h' },
  { name: 'Eau de Toilette (EDT)', percent: 12, desc: 'Nhẹ nhàng thanh lịch, lưu 4-6h' },
  { name: 'Eau de Cologne (EDC)', percent: 6, desc: 'Tươi mát sảng khoái, lưu 2-3h' },
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
  const estimatedSprays = Math.round(totalVolume * 10); // standard atomizer ~0.1ml per spray

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 backdrop-blur-sm shadow-xl">
      <div className="mb-4">
        <span className="text-xs font-mono uppercase tracking-wider text-amber-400/90 font-semibold">
          Bước 2: Định Lượng Thể Tích & Nồng Độ
        </span>
        <h2 className="text-lg font-serif font-bold text-slate-100">
          Quy Chuẩn Pha Chế & Dung Môi
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Volume selection */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-2">
            Nhập Tổng Thể Tích Chai Thành Phẩm (mL):
          </label>

          <div className="flex items-center gap-3 mb-3">
            <div className="relative flex-1">
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
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                mL
              </span>
            </div>

            <div className="flex gap-1.5">
              {quickVolumes.map((vol) => (
                <button
                  key={vol}
                  type="button"
                  onClick={() => onChangeVolume(vol)}
                  className={`px-3 py-2 rounded-xl text-xs font-mono border transition-all ${
                    totalVolume === vol
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {vol}ml
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Ước tính khoảng <strong className="text-amber-300 font-mono">{estimatedSprays}</strong> lần xịt qua vòi phun sương mỹ phẩm (~0.1mL/nhát).
          </p>
        </div>

        {/* Right: Concentration */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-2">
            Nồng Độ Cốt Hương (Concentration):
          </label>

          <select
            value={concentrationName}
            onChange={(e) => {
              const selected = CONCENTRATIONS.find((c) => c.name === e.target.value);
              if (selected) onChangeConcentration(selected.name, selected.percent);
            }}
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 mb-2"
          >
            {CONCENTRATIONS.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.percent}% Tinh Dầu) - {c.desc}
              </option>
            ))}
          </select>

          {/* Real-time calculated breakdown card */}
          <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Droplets className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Cốt tinh dầu ({concentrationPercent}%)</p>
                <p className="text-sm font-mono font-bold text-amber-300">
                  {pureFragranceMl} mL <span className="text-xs font-normal text-amber-400/80">({Math.round(pureFragranceMl * 20)} giọt)</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Beaker className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Dung môi ({100 - concentrationPercent}%)</p>
                <p className="text-sm font-mono font-bold text-blue-300">
                  {carrierAlcoholMl} mL <span className="text-xs font-normal text-blue-400/80">({Math.round(carrierAlcoholMl * 20)} giọt)</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
