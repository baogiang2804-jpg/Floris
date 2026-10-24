import React, { useState } from 'react';
import {
  Download,
  Table,
  Check,
  Copy,
  Shield,
  FileSpreadsheet,
  Droplets,
  Calculator,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Sparkles,
  Eye,
  Beaker,
} from 'lucide-react';
import { CalculatedIngredient } from '../utils/perfumeCalculations';
import { FLORIS_IMAGES } from '../data/perfumeData';

interface FormulaTableAndCsvProps {
  ingredients: CalculatedIngredient[];
  totalVolume: number;
  concentrationName: string;
  seasonLabel: string;
  tierTotals: { top: number; heart: number; base: number };
  onExportCsv: () => void;
  isValidTotal: boolean;
}

// Danh mục các mốc quy đổi thông dụng trong thực nghiệm nước hoa 10 mL
const COMMON_DROP_LOOKUP = [
  { ml: 0.05, drops: 1, label: 'Đơn vị tối thiểu (1 giọt chuẩn)', note: 'Định mức 1 giọt pipette' },
  { ml: 0.10, drops: 2, label: '0,10 mL', note: 'Vi chỉnh nốt hương' },
  { ml: 0.15, drops: 3, label: '0,15 mL', note: 'Vi chỉnh nốt hương' },
  { ml: 0.20, drops: 4, label: '0,20 mL (4 giọt)', note: 'Nốt Đào 🍑 (Mẫu chuẩn)' },
  { ml: 0.25, drops: 5, label: '0,25 mL (5 giọt)', note: 'Hoa Nhài 🌼 / Vanilla 🍦' },
  { ml: 0.30, drops: 6, label: '0,30 mL (6 giọt)', note: 'Xạ hương trắng 🤍' },
  { ml: 0.50, drops: 10, label: '0,50 mL (10 giọt)', note: 'Nửa mililít' },
  { ml: 1.00, drops: 20, label: '1,00 mL (20 giọt)', note: 'Tổng 10% cốt hương (Mẫu A)' },
  { ml: 2.00, drops: 40, label: '2,00 mL (40 giọt)', note: 'Tổng 20% cốt hương (Mẫu B/C)' },
  { ml: 8.00, drops: 160, label: '8,00 mL (160 giọt)', note: 'Ethanol 90% (Mẫu A)' },
  { ml: 9.00, drops: 180, label: '9,00 mL (180 giọt)', note: 'Tổng dung môi (Mẫu A)' },
  { ml: 10.00, drops: 200, label: '10,00 mL (200 giọt)', note: 'Dung tích chai thành phẩm' },
];

export const FormulaTableAndCsv: React.FC<FormulaTableAndCsvProps> = ({
  ingredients,
  totalVolume,
  concentrationName,
  seasonLabel,
  tierTotals,
  onExportCsv,
  isValidTotal,
}) => {
  const [copied, setCopied] = useState(false);
  const [showLookup, setShowLookup] = useState(true);
  const [inputMl, setInputMl] = useState<string>('0.25');
  const [inputDrops, setInputDrops] = useState<string>('5');
  const [selectedBottle, setSelectedBottle] = useState<'sampleA' | 'sampleC' | 'sampleB'>('sampleA');

  const bottleDetails = {
    sampleA: {
      title: 'Mẫu A (Công thức gốc 10%)',
      subtitle: '20 giọt cốt hương + 180 giọt dung môi',
      img: FLORIS_IMAGES.sampleA,
      badge: 'Mẫu A Chuẩn',
      desc: 'Ảnh chụp sản phẩm thực tế chai xịt thủy tinh 10 mL sau 72h ủ maceration.',
    },
    sampleC: {
      title: 'Mẫu C (Dịu/Ngọt 20%)',
      subtitle: '40 giọt cốt hương + 160 giọt dung môi',
      img: FLORIS_IMAGES.sampleC,
      badge: 'Mẫu C Thực Nghiệm',
      desc: 'Ảnh chụp mẫu thực nghiệm C tăng tỉ lệ Xạ hương trắng & Vanilla.',
    },
    sampleB: {
      title: 'Chai Chiết 10 mL',
      subtitle: 'Vỏ chai thủy tinh nắp bạc',
      img: FLORIS_IMAGES.sampleB,
      badge: 'Chuẩn Bị Dụng Cụ',
      desc: 'Chai xịt thon dài 10 mL tiêu chuẩn dùng để hoàn thiện sản phẩm.',
    },
  };

  const currentBottle = bottleDetails[selectedBottle];

  const handleCopyText = () => {
    const textSummary = `🧪 CÔNG THỨC NƯỚC HOA (${seasonLabel}) - ${totalVolume} mL
Nồng độ: ${concentrationName}
Phân bổ tầng: Đầu ${tierTotals.top}% | Giữa ${tierTotals.heart}% | Cuối ${tierTotals.base}%

CHI TIẾT NGUYÊN LIỆU:
${ingredients
  .map(
    (ing, i) =>
      `${i + 1}. [${ing.tierLabel}] ${ing.name} (${ing.scentFamily}): ${ing.percentage}% = ${ing.volumeMl} mL (~${ing.drops} giọt)`
  )
  .join('\n')}

Được xuất từ Floris (Quy chuẩn 1 giọt = 0,05 mL)`;

    navigator.clipboard.writeText(textSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleMlChange = (valStr: string) => {
    setInputMl(valStr);
    const num = parseFloat(valStr);
    if (!isNaN(num) && num >= 0) {
      setInputDrops(Math.round(num / 0.05).toString());
    } else {
      setInputDrops('');
    }
  };

  const handleDropsChange = (valStr: string) => {
    setInputDrops(valStr);
    const num = parseInt(valStr, 10);
    if (!isNaN(num) && num >= 0) {
      setInputMl((num * 0.05).toFixed(2));
    } else {
      setInputMl('');
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 backdrop-blur-sm shadow-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-amber-400/90 font-semibold">
            Bước 5: Bảng Định Lượng & Xuất Dữ Liệu
          </span>
          <h2 className="text-lg font-serif font-bold text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            Bảng Công Thức Chi Tiết & Đối Chiếu Mẫu Thực Tế
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowLookup((prev) => !prev)}
            type="button"
            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/80 transition-all flex items-center gap-1.5"
            title="Mở hoặc thu gọn bảng tra cứu nhanh số giọt"
          >
            <Droplets className="w-3.5 h-3.5 text-emerald-400" />
            <span>{showLookup ? 'Thu gọn tra cứu giọt' : 'Bảng tra cứu số giọt'}</span>
            {showLookup ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleCopyText}
            type="button"
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Đã sao chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Sao chép tóm tắt</span>
              </>
            )}
          </button>

          <button
            onClick={onExportCsv}
            type="button"
            className={`text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 shadow-md ${
              isValidTotal
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/20 active:scale-95'
                : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
            }`}
            disabled={!isValidTotal}
            title={!isValidTotal ? 'Cần cân bằng tổng đạt 100% trước khi xuất CSV' : 'Tải file CSV'}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải Bảng CSV (Excel)</span>
          </button>
        </div>
      </div>

      {/* Grid: Formula Table (Trái) & Physical Sample Bottle Showcase (Phải) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Table view */}
        <div className="lg:col-span-8 xl:col-span-8 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70 shadow-lg">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">Tầng Hương</th>
                <th className="py-3 px-3">Tên Nguyên Liệu & Khoa Học</th>
                <th className="py-3 px-3">Nhóm Hương</th>
                <th className="py-3 px-3 text-right">Tỉ Lệ (%)</th>
                <th className="py-3 px-3 text-right">Thể Tích (mL)</th>
                <th className="py-3 px-3 text-right font-mono font-bold text-emerald-400 bg-emerald-950/20">
                  Số Giọt (0,05 mL)
                </th>
                <th className="py-3 px-3 text-right">IFRA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {ingredients.map((ing, idx) => {
                const tierBadgeClass =
                  ing.tier === 'top'
                    ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30'
                    : ing.tier === 'heart'
                    ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                    : 'bg-amber-600/10 text-amber-300 border-amber-600/30';

                return (
                  <tr key={ing.slotKey} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono border ${tierBadgeClass}`}>
                        {ing.tierLabel}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-100">{ing.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono italic">{ing.scientificName}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{ing.scentFamily}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-amber-300">
                      {ing.percentage}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-cyan-300">
                      {ing.volumeMl} mL
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400 bg-emerald-950/10">
                      {ing.drops} giọt
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-400">
                      ≤ {ing.ifraMaxPercent}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-900/90 font-mono font-semibold border-t border-slate-800 text-slate-200">
              <tr>
                <td colSpan={4} className="py-3 px-3 text-slate-400">
                  TỔNG CỘNG ({totalVolume} mL)
                </td>
                <td className="py-3 px-3 text-right text-amber-400">
                  {ingredients.reduce((a, b) => a + b.percentage, 0)}%
                </td>
                <td className="py-3 px-3 text-right text-cyan-400">
                  {ingredients.reduce((a, b) => a + b.volumeMl, 0).toFixed(2)} mL
                </td>
                <td className="py-3 px-3 text-right font-bold text-emerald-400 bg-emerald-950/20">
                  {ingredients.reduce((a, b) => a + b.drops, 0)} giọt
                </td>
                <td className="py-3 px-3 text-right text-slate-400 text-[11px]">
                  IFRA Ok
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* CỘT PHẢI: ẢNH MẪU THỰC TẾ (MẪU A / MẪU C) ĐẶT CẠNH CÔNG THỨC */}
        <div className="lg:col-span-4 xl:col-span-4 bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-3 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                <Beaker className="w-3.5 h-3.5" />
                Mẫu Thực Tế Phòng Lab
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {currentBottle.badge}
              </span>
            </div>

            {/* Bộ chọn mẫu nhanh */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-[11px] mb-2.5">
              <button
                type="button"
                onClick={() => setSelectedBottle('sampleA')}
                className={`py-1 rounded font-medium transition-all ${
                  selectedBottle === 'sampleA'
                    ? 'bg-amber-600 text-white font-semibold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Mẫu A
              </button>
              <button
                type="button"
                onClick={() => setSelectedBottle('sampleC')}
                className={`py-1 rounded font-medium transition-all ${
                  selectedBottle === 'sampleC'
                    ? 'bg-amber-600 text-white font-semibold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Mẫu C
              </button>
              <button
                type="button"
                onClick={() => setSelectedBottle('sampleB')}
                className={`py-1 rounded font-medium transition-all ${
                  selectedBottle === 'sampleB'
                    ? 'bg-amber-600 text-white font-semibold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Chai Chiết
              </button>
            </div>

            {/* Container ảnh thực tế */}
            <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-900 aspect-[3/4] max-h-72 flex items-center justify-center group">
              <img
                src={currentBottle.img}
                alt={currentBottle.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex flex-col justify-end p-3">
                <p className="text-xs font-serif font-bold text-white drop-shadow">
                  {currentBottle.title}
                </p>
                <p className="text-[11px] font-mono text-emerald-300 drop-shadow">
                  {currentBottle.subtitle}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              {currentBottle.desc}
            </p>
          </div>

          {/* Nghệ thuật 4 nốt hương mini */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2.5 bg-slate-900/50 p-2 rounded-lg">
            <img
              src={FLORIS_IMAGES.scentStillLife}
              alt="4 Nốt hương Floris"
              className="w-12 h-12 rounded object-cover border border-slate-700/60 shrink-0"
              loading="lazy"
            />
            <div className="text-[10px] text-slate-300 leading-tight">
              <strong className="text-slate-100 block font-serif">4 Nốt Hương Floris:</strong>
              <span className="text-amber-400/90">Nhài 🌼 • Đào 🍑 • Xạ Hương 🤍 • Vanilla 🍦</span>
            </div>
          </div>
        </div>
      </div>

      {/* BẢNG TRA CỨU NHANH SỐ GIỌT (1 GIỌT = 0,05 mL) */}
      {showLookup && (
        <div className="rounded-xl border border-emerald-800/40 bg-gradient-to-b from-emerald-950/30 to-slate-950/60 p-4 space-y-4 shadow-lg animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-900/40 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Droplets className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  Bảng Tra Cứu Nhanh: Quy Đổi Số Giọt Thao Tác Thủ Công
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    1 giọt = 0,05 mL (20 giọt = 1,00 mL)
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Phục vụ đong đếm trực tiếp bằng pipet / ống nhỏ giọt trong phòng thực hành nước hoa Floris
                </p>
              </div>
            </div>

            {/* Quy đổi nhanh tương tác */}
            <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-lg border border-slate-800 text-xs font-mono">
              <Calculator className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={inputMl}
                  onChange={(e) => handleMlChange(e.target.value)}
                  className="w-14 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-cyan-300 text-right focus:outline-none focus:border-emerald-500"
                  placeholder="mL"
                />
                <span className="text-slate-400">mL</span>
              </div>
              <span className="text-slate-500 font-bold">=</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={inputDrops}
                  onChange={(e) => handleDropsChange(e.target.value)}
                  className="w-12 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-emerald-400 font-bold text-right focus:outline-none focus:border-emerald-500"
                  placeholder="giọt"
                />
                <span className="text-slate-400 font-sans">giọt</span>
              </div>
            </div>
          </div>

          {/* Grid các mốc chuẩn thực nghiệm */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {COMMON_DROP_LOOKUP.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setInputMl(item.ml.toFixed(2));
                  setInputDrops(item.drops.toString());
                }}
                className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 hover:border-emerald-500/50 hover:bg-emerald-950/20 cursor-pointer transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-cyan-300 font-bold text-xs">{item.ml.toFixed(2)} mL</span>
                  <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded text-[11px] border border-emerald-800/50 group-hover:border-emerald-400/50">
                    {item.drops} giọt
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate group-hover:text-slate-200">
                  {item.note}
                </div>
              </div>
            ))}
          </div>

          {/* Ghi chú kỹ thuật phòng thí nghiệm & hình ảnh thao tác thực tế */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-[11px] text-slate-300 bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
            <div className="flex items-center gap-3">
              <img
                src={FLORIS_IMAGES.verticalPipetteSolvent}
                alt="Thao tác nhỏ giọt vuông góc 90 độ"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover object-center border border-emerald-500/40 shrink-0 shadow"
                loading="lazy"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-semibold text-slate-100">
                  <FlaskConical className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Kỹ thuật nhỏ giọt chuẩn phòng lab (1 giọt = 0,05 mL):</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Giữ Pasteur pipet thẳng đứng góc 90° so với miệng cốc, bóp nhẹ nhàng và đều tay ở nhiệt độ phòng 25°C để sức căng bề mặt tạo thể tích giọt ổn định đúng 0,05 mL.
                </p>
              </div>
            </div>
            <div className="text-emerald-400/80 shrink-0 font-mono text-[10px] bg-slate-900 px-2 py-1 rounded border border-slate-800">
              Tổ 1 - 12A13 THPT NTMK
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
