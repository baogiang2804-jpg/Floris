import React, { useState, useMemo } from 'react';
import {
  FileCode,
  Copy,
  Check,
  Download,
  Terminal,
  Upload,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Sliders,
  Database,
  ArrowLeft,
} from 'lucide-react';
import { SpringAccordion } from './SpringAccordion';
import { calculateDropsFromMl } from '../utils/perfumeCalculations';

interface IngredientRow {
  name: string;
  tier: 'Hương đầu' | 'Hương giữa' | 'Hương cuối' | 'Dung môi' | string;
  safeLimit: number;
}

const DEFAULT_INGREDIENTS: IngredientRow[] = [
  { name: 'Hoa nhài', tier: 'Hương đầu', safeLimit: 40.0 },
  { name: 'Đào', tier: 'Hương giữa', safeLimit: 50.0 },
  { name: 'Vanilla', tier: 'Hương cuối', safeLimit: 20.0 },
  { name: 'Xạ hương trắng', tier: 'Hương cuối', safeLimit: 10.0 },
  { name: 'Ethanol 90°', tier: 'Dung môi', safeLimit: 100.0 },
  { name: 'Nước cất', tier: 'Dung môi', safeLimit: 100.0 },
];

const RAW_PYTHON_SCRIPT = `import streamlit as st
import pandas as pd

st.set_page_config(page_title="Pha Chế Nước Hoa", page_icon="🌸", layout="centered")
st.title("🌸 Hệ Thống Phối Trộn Nước Hoa")

st.header("1. Dữ liệu nguyên liệu")
uploaded_file = st.file_uploader("Chọn file CSV hoặc Excel", type=['csv', 'xlsx'])

@st.cache_data
def load_sample_data():
    return pd.DataFrame({
        'Tên nguyên liệu': [
            'Hoa nhài', 'Đào',
            'Vanilla', 'Xạ hương trắng', 'Ethanol 90°', 'Nước cất'
        ],
        'Tầng hương': [
            'Hương đầu', 'Hương giữa',
            'Hương cuối', 'Hương cuối', 'Dung môi', 'Dung môi'
        ],
        'Giới hạn an toàn (%)': [40.0, 50.0, 20.0, 10.0, 100.0, 100.0]
    })

if uploaded_file is not None:
    if uploaded_file.name.endswith('csv'):
        df_ingredients = pd.read_csv(uploaded_file)
    else:
        df_ingredients = pd.read_excel(uploaded_file)
    st.success("Đã tải dữ liệu thành công!")
else:
    df_ingredients = load_sample_data()

st.header("2. Thông số mẻ pha chế")
col1, col2 = st.columns(2)
with col1:
    season = st.selectbox("Chọn mùa sử dụng:", ["Xuân", "Hạ", "Thu", "Đông"])
with col2:
    batch_volume = st.number_input("Thể tích mẻ (ml):", min_value=1.0, value=50.0, step=1.0)

st.header("3. Tỉ lệ thành phần (%)")
percentages = {}
total_percentage = 0.0
limit_error = False

for index, row in df_ingredients.iterrows():
    name = row['Tên nguyên liệu']
    note = row['Tầng hương']
    safe_limit = float(row['Giới hạn an toàn (%)'])
    val = st.slider(f"{name} ({note})", min_value=0.0, max_value=100.0, value=0.0, step=0.5)
    percentages[name] = val
    total_percentage += val
    if val > safe_limit:
        st.error(f"{name} vượt giới hạn an toàn ({val}% > {safe_limit}%)")
        limit_error = True

if total_percentage == 100.0 and not limit_error:
    results = []
    for index, row in df_ingredients.iterrows():
        name = row['Tên nguyên liệu']
        pct = percentages[name]
        if pct > 0:
            vol_ml = round(batch_volume * (pct / 100.0), 2)
            results.append({
                "Tên nguyên liệu": name,
                "Tầng hương": row['Tầng hương'],
                "Tỉ lệ (%)": pct,
                "Thể tích (ml)": vol_ml,
                "Số giọt (1 giọt = 0,05 ml)": max(1, int(round(vol_ml / 0.05)))
            })
    df_results = pd.DataFrame(results)
    st.dataframe(df_results, use_container_width=True)
    csv_data = df_results.to_csv(index=False).encode('utf-8-sig')
    st.download_button(label="Tải xuống CSV", data=csv_data, file_name=f"Cong_Thuc_{season}.csv", mime="text/csv")
`;

interface SubWebPythonStreamlitProps {
  onBackToMainWeb: () => void;
  onSyncFormulaToWeb?: (
    items: { name: string; percentage: number }[],
    season: string,
    volume: number
  ) => void;
}

const SLIDER_PALETTE = ['#FDE047', '#FDBA74', '#FDE68A', '#F9A8D4', '#BBF7D0', '#E2E8F0'];

export const SubWebPythonStreamlit: React.FC<SubWebPythonStreamlitProps> = ({
  onBackToMainWeb,
  onSyncFormulaToWeb,
}) => {
  const [viewMode, setViewMode] = useState<'app' | 'code'>('app');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [ingredientsData, setIngredientsData] = useState<IngredientRow[]>(DEFAULT_INGREDIENTS);

  const [season, setSeason] = useState<string>('Xuân');
  const [batchVolume, setBatchVolume] = useState<number>(50.0);
  const [percentages, setPercentages] = useState<Record<string, number>>({
    'Hoa nhài': 20.0,
    'Đào': 25.0,
    'Vanilla': 10.0,
    'Xạ hương trắng': 5.0,
    'Ethanol 90°': 35.0,
    'Nước cất': 5.0,
  });

  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const { totalPercentage, limitErrors, hasLimitError } = useMemo(() => {
    let total = 0;
    const errors: Record<string, boolean> = {};
    let anyError = false;

    ingredientsData.forEach((row) => {
      const val = percentages[row.name] || 0;
      total += val;
      if (val > row.safeLimit) {
        errors[row.name] = true;
        anyError = true;
      }
    });

    return {
      totalPercentage: Math.round(total * 10) / 10,
      limitErrors: errors,
      hasLimitError: anyError,
    };
  }, [ingredientsData, percentages]);

  const results = useMemo(() => {
    if (totalPercentage !== 100.0 || hasLimitError) return [];
    return ingredientsData
      .filter((row) => (percentages[row.name] || 0) > 0)
      .map((row) => {
        const pct = percentages[row.name] || 0;
        const vol = Math.round((batchVolume * (pct / 100.0)) * 100) / 100;
        const drops = calculateDropsFromMl(vol, pct > 0);
        return {
          name: row.name,
          tier: row.tier,
          percentage: pct,
          volume: vol,
          drops,
        };
      });
  }, [totalPercentage, hasLimitError, ingredientsData, percentages, batchVolume]);

  const dominantInfo = useMemo(() => {
    if (results.length === 0) return null;
    const fragranceRows = results.filter((r) =>
      ['Hương đầu', 'Hương giữa', 'Hương cuối'].includes(r.tier)
    );
    if (fragranceRows.length === 0) return null;

    const sums: Record<string, number> = {};
    fragranceRows.forEach((r) => {
      sums[r.tier] = (sums[r.tier] || 0) + r.percentage;
    });

    let topTier = '';
    let maxPct = -1;
    Object.entries(sums).forEach(([tier, pct]) => {
      if (pct > maxPct) {
        maxPct = pct;
        topTier = tier;
      }
    });

    return {
      dominantNote: topTier,
      maxPct: Math.round(maxPct * 10) / 10,
    };
  }, [results]);

  const handleSliderChange = (name: string, val: number) => {
    setPercentages((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleSetBalancedPreset = () => {
    setPercentages({
      'Hoa nhài': 20.0,
      'Đào': 25.0,
      'Vanilla': 10.0,
      'Xạ hương trắng': 5.0,
      'Ethanol 90°': 35.0,
      'Nước cất': 5.0,
    });
  };

  const handleResetZeros = () => {
    const zeros: Record<string, number> = {};
    ingredientsData.forEach((row) => {
      zeros[row.name] = 0.0;
    });
    setPercentages(zeros);
  };

  const handleDownloadCsv = () => {
    if (results.length === 0) return;
    const header = 'Tên nguyên liệu,Tầng hương,Tỉ lệ (%),Thể tích (ml),Số giọt (1 giọt = 0,05 ml)\n';
    const rows = results
      .map((r) => `"${r.name}","${r.tier}",${r.percentage},${r.volume},${r.drops}`)
      .join('\n');
    const csvContent = '\uFEFF' + header + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cong_Thuc_Nuoc_Hoa_${season}_${batchVolume}ml.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(RAW_PYTHON_SCRIPT);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleDownloadPythonFile = () => {
    const blob = new Blob([RAW_PYTHON_SCRIPT], { type: 'text/x-python;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'app1_8ba4d2ea.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const lines = text.split('\n').filter((l) => l.trim().length > 0);
        if (lines.length > 1) {
          const parsed: IngredientRow[] = [];
          for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(',').map((p) => p.replace(/"/g, '').trim());
            if (parts.length >= 3) {
              parsed.push({
                name: parts[0],
                tier: parts[1],
                safeLimit: parseFloat(parts[2]) || 100.0,
              });
            }
          }
          if (parsed.length > 0) {
            setIngredientsData(parsed);
            const initialPcts: Record<string, number> = {};
            parsed.forEach((row) => {
              initialPcts[row.name] = 0.0;
            });
            setPercentages(initialPcts);
          }
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="spring-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-[#FFF1F5] via-white to-[#ECFDF3]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToMainWeb}
            aria-label="Về bàn pha"
            className="w-9 h-9 rounded-full bg-white hover:bg-[#FCE7F3] border border-[#F3D5E0] text-[#5C6B5F] hover:text-[#BE185D] flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFE4E6] text-[#BE123C] border border-[#FDA4AF]">
              🐍 Streamlit App
            </span>
            <h1 className="text-xl font-bold text-[#2B342D] mt-1">
              Phối Trộn Python
            </h1>
          </div>
        </div>

        <div className="inline-flex items-center gap-1 p-1 bg-[#FFF5F8] rounded-full border border-[#FBCFE8] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('app')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'app'
                ? 'bg-[#EC4899] text-white shadow-xs'
                : 'text-[#5C6B5F] hover:text-[#2B342D]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Chạy thử</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('code')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'code'
                ? 'bg-[#16A34A] text-white shadow-xs'
                : 'text-[#5C6B5F] hover:text-[#2B342D]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Mã Python</span>
          </button>
        </div>
      </div>

      {viewMode === 'app' && (
        <div className="max-w-3xl mx-auto spring-card p-5 sm:p-7 space-y-6">
          {/* Batch Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5C6B5F]">Mùa sử dụng</label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full p-2.5 rounded-2xl bg-[#FFFDF8] border border-[#F3D5E0] text-xs font-bold text-[#2B342D] focus:outline-none focus:border-[#EC4899]"
              >
                <option value="Xuân">🌸 Xuân</option>
                <option value="Hạ">🍋 Hạ</option>
                <option value="Thu">🍂 Thu</option>
                <option value="Đông">❄️ Đông</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5C6B5F]">Thể tích mẻ (mL)</label>
              <input
                type="number"
                min={1}
                step={1}
                value={batchVolume}
                onChange={(e) => setBatchVolume(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-full p-2.5 rounded-2xl bg-[#FFFDF8] border border-[#F3D5E0] text-xs font-mono font-bold text-[#BE185D] focus:outline-none focus:border-[#EC4899]"
              />
            </div>
          </div>

          {/* Stacked Proportion Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#2B342D]">Thanh tỷ lệ mẻ pha</span>
              <span
                className={`font-mono px-2.5 py-0.5 rounded-full ${
                  totalPercentage === 100
                    ? 'bg-[#DCFCE7] text-[#15803D]'
                    : 'bg-[#FFF1F2] text-[#BE123C]'
                }`}
              >
                Tổng: {totalPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-4 rounded-full overflow-hidden flex border border-[#F3DCE4] bg-[#FFFDF8]">
              {ingredientsData.map((row, idx) => {
                const val = percentages[row.name] || 0;
                if (val <= 0) return null;
                return (
                  <div
                    key={row.name}
                    style={{
                      width: `${Math.min(100, val)}%`,
                      backgroundColor: SLIDER_PALETTE[idx % SLIDER_PALETTE.length],
                    }}
                    title={`${row.name}: ${val}%`}
                  />
                );
              })}
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-[#2B342D]">Tỷ lệ từng thành phần</h2>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSetBalancedPreset}
                  className="px-3 py-1 rounded-full bg-[#ECFDF3] hover:bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] text-xs font-bold flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Mẫu chuẩn</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetZeros}
                  className="px-3 py-1 rounded-full bg-white hover:bg-[#FFF5F8] text-[#5C6B5F] border border-[#F3D5E0] text-xs font-bold"
                >
                  Về 0%
                </button>
              </div>
            </div>

            {ingredientsData.map((row) => {
              const val = percentages[row.name] || 0;
              const isExceeded = Boolean(limitErrors[row.name]);
              return (
                <div
                  key={row.name}
                  className={`p-3.5 rounded-2xl border ${
                    isExceeded
                      ? 'bg-[#FFF1F2] border-[#FDA4AF]'
                      : 'bg-[#FFFDF8] border-[#F3DCE4]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#2B342D]">{row.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FCE7F3] text-[#BE185D]">
                        {row.tier}
                      </span>
                      <span className="text-[10px] font-mono text-[#5C6B5F]">
                        ≤{row.safeLimit}%
                      </span>
                    </div>
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                        isExceeded
                          ? 'bg-[#FEE2E2] text-[#DC2626]'
                          : 'bg-[#ECFDF3] text-[#15803D]'
                      }`}
                    >
                      {val.toFixed(1)}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={0.5}
                    value={val}
                    aria-label={`Tỷ lệ ${row.name}`}
                    onChange={(e) => handleSliderChange(row.name, parseFloat(e.target.value) || 0)}
                    className="pyramid-touch-slider w-full cursor-pointer"
                  />

                  {isExceeded && (
                    <p className="text-[11px] font-bold text-[#BE123C] mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Vượt ngưỡng an toàn ({val}% &gt; {row.safeLimit}%)</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Results */}
          {totalPercentage !== 100.0 ? (
            <div className="p-3.5 rounded-2xl bg-[#FFFDF0] border border-[#FDE68A] text-xs font-bold text-[#92400E] flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>Tổng cần đạt đúng 100% để xuất công thức.</span>
            </div>
          ) : hasLimitError ? (
            <div className="p-3.5 rounded-2xl bg-[#FFF1F2] border border-[#FDA4AF] text-xs font-bold text-[#BE123C] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Có thành phần vượt giới hạn an toàn.</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#ECFDF3] border border-[#86EFAC] text-xs font-bold text-[#15803D] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Công thức hợp lệ ({batchVolume} mL · Mùa {season})</span>
                </span>
                {dominantInfo && (
                  <span className="px-2.5 py-0.5 rounded-full bg-white text-[#BE185D] border border-[#FBCFE8]">
                    Ưu thế: {dominantInfo.dominantNote}
                  </span>
                )}
              </div>

              {/* Formula Result Table with integer Số giọt column (1 giọt = 0,05 mL) */}
              <div className="overflow-x-auto rounded-2xl border border-[#F3DCE4] bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#FFF5F8] text-[#9D174D] font-bold">
                    <tr>
                      <th className="py-2 px-3">Nguyên liệu</th>
                      <th className="py-2 px-3">Tầng</th>
                      <th className="py-2 px-3 text-right">Tỉ lệ (%)</th>
                      <th className="py-2 px-3 text-right">Thể tích (mL)</th>
                      <th className="py-2 px-3 text-right bg-[#ECFDF3]/70 text-[#15803D] whitespace-nowrap">
                        Số giọt (0,05mL)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F8E8EE] font-mono">
                    {results.map((r) => (
                      <tr key={r.name}>
                        <td className="py-2 px-3 font-sans font-bold text-[#2B342D]">{r.name}</td>
                        <td className="py-2 px-3 font-sans text-[#5C6B5F]">{r.tier}</td>
                        <td className="py-2 px-3 text-right font-bold text-[#BE185D]">{r.percentage}%</td>
                        <td className="py-2 px-3 text-right font-bold text-[#2B342D]">{r.volume} mL</td>
                        <td className="py-2 px-3 text-right font-bold text-[#15803D] bg-[#ECFDF3]/40 whitespace-nowrap">
                          {r.drops} giọt
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#FFFDF0] border-t border-[#FDE68A] font-mono font-bold">
                    <tr>
                      <td colSpan={2} className="py-2 px-3 font-sans">Tổng cộng</td>
                      <td className="py-2 px-3 text-right text-[#BE185D]">
                        {results.reduce((a, b) => a + b.percentage, 0)}%
                      </td>
                      <td className="py-2 px-3 text-right">
                        {results.reduce((a, b) => a + b.volume, 0).toFixed(2)} mL
                      </td>
                      <td className="py-2 px-3 text-right text-[#15803D] bg-[#ECFDF3]/70 whitespace-nowrap">
                        {results.reduce((a, b) => a + b.drops, 0)} giọt
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="px-5 py-2.5 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải CSV</span>
                </button>
                {onSyncFormulaToWeb && (
                  <button
                    type="button"
                    onClick={() =>
                      onSyncFormulaToWeb(
                        results.map((r) => ({ name: r.name, percentage: r.percentage })),
                        season,
                        batchVolume
                      )
                    }
                    className="px-4 py-2.5 rounded-2xl bg-[#EC4899] hover:bg-[#DB2777] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Áp dụng lên Web</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* CSV Upload & Ingredient Reference Table hidden in Accordion */}
          <SpringAccordion
            title="Bảng giới hạn & Tải file CSV giáo viên"
            badge={`${ingredientsData.length} chất`}
            tone="cream"
            icon={<Database className="w-4 h-4 text-[#EC4899]" />}
          >
            <div className="p-3 rounded-2xl bg-[#FFFDF8] border-2 border-dashed border-[#FBCFE8] text-center relative">
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title="Chọn file CSV hoặc Excel"
              />
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#BE185D]">
                <Upload className="w-4 h-4" />
                <span>{uploadedFileName || 'Bấm để thay bằng file CSV/Excel của bạn'}</span>
              </div>
            </div>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F3DCE4] text-[#5C6B5F]">
                  <th className="py-1.5 px-2">Nguyên liệu</th>
                  <th className="py-1.5 px-2">Tầng</th>
                  <th className="py-1.5 px-2 text-right">Ngưỡng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8E8EE]">
                {ingredientsData.map((r) => (
                  <tr key={r.name}>
                    <td className="py-1.5 px-2 font-bold">{r.name}</td>
                    <td className="py-1.5 px-2">{r.tier}</td>
                    <td className="py-1.5 px-2 text-right font-mono">{r.safeLimit}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SpringAccordion>
        </div>
      )}

      {viewMode === 'code' && (
        <div className="max-w-4xl mx-auto spring-card p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F5DCE4]">
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-[#16A34A]" />
              <h2 className="text-base font-bold text-[#2B342D]">app1_8ba4d2ea.py</h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-2xl bg-white hover:bg-[#FFF5F8] text-[#2B342D] border border-[#F3D5E0] text-xs font-bold flex items-center gap-1.5"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Đã chép' : 'Sao chép'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadPythonFile}
                className="px-3.5 py-1.5 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải .py</span>
              </button>
            </div>
          </div>

          <SpringAccordion title="Lệnh chạy Streamlit trên máy" tone="butter" icon={<Terminal className="w-4 h-4 text-[#D97706]" />}>
            <pre className="p-3 rounded-xl bg-[#2B342D] text-[#FEF9C3] font-mono text-xs overflow-x-auto">
              pip install streamlit pandas openpyxl{'\n'}streamlit run public/assets/aistudio/app1_8ba4d2ea.py
            </pre>
          </SpringAccordion>

          <pre className="p-4 rounded-2xl bg-[#2B342D] text-[#FFFDF8] font-mono text-xs overflow-x-auto max-h-[500px]">
            {RAW_PYTHON_SCRIPT}
          </pre>
        </div>
      )}
    </div>
  );
};
