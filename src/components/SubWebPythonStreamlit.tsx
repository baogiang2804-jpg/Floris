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
  RefreshCw,
  Sliders,
  Database,
  Layers,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  ArrowLeft,
  Info,
} from 'lucide-react';

interface IngredientRow {
  name: string;
  tier: 'Hương đầu' | 'Hương giữa' | 'Hương cuối' | 'Dung môi' | string;
  safeLimit: number;
}

// Dataset from app1_8ba4d2ea.py
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

# --- Cấu hình trang ---
st.set_page_config(page_title="Pha Chế Nước Hoa", page_icon="🌸", layout="centered")
st.title("🌸 Hệ Thống Phối Trộn Nước Hoa")

# --- 1. ĐỌC BẢNG NGUYÊN LIỆU ---
st.header("1. Dữ liệu nguyên liệu")
st.write("Tải lên bảng nguyên liệu do giáo viên cung cấp (CSV hoặc Excel).")

# Tải file từ máy tính
uploaded_file = st.file_uploader("Chọn file CSV hoặc Excel", type=['csv', 'xlsx'])

# Dữ liệu mẫu
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
    # Đọc file dựa vào định dạng
    if uploaded_file.name.endswith('csv'):
        df_ingredients = pd.read_csv(uploaded_file)
    else:
        df_ingredients = pd.read_excel(uploaded_file)
    st.success("Đã tải dữ liệu thành công!")
else:
    df_ingredients = load_sample_data()
    st.info("Đang sử dụng dữ liệu mẫu. Hãy tải file của giáo viên lên để thay thế.")

# Hiển thị bảng gốc cho học sinh dễ theo dõi
with st.expander("Xem bảng nguyên liệu"):
    st.dataframe(df_ingredients, use_container_width=True)

# --- 2. CÀI ĐẶT THÔNG SỐ CHUNG ---
st.header("2. Thông số mẻ pha chế")
col1, col2 = st.columns(2)
with col1:
    season = st.selectbox("Chọn mùa sử dụng:", ["Xuân", "Hạ", "Thu", "Đông"])
with col2:
    batch_volume = st.number_input("Thể tích mẻ (ml):", min_value=1.0, value=50.0, step=1.0)

# --- 3. ĐIỀU CHỈNH TỈ LỆ & KIỂM TRA ĐIỀU KIỆN ---
st.header("3. Tỉ lệ thành phần (%)")
st.caption("Kéo thanh trượt để điều chỉnh. Tổng phải bằng chính xác 100%.")

percentages = {}
total_percentage = 0.0
limit_error = False

# Tạo slider cho từng nguyên liệu
for index, row in df_ingredients.iterrows():
    name = row['Tên nguyên liệu']
    note = row['Tầng hương']
    safe_limit = float(row['Giới hạn an toàn (%)'])
    
    val = st.slider(
        f"{name} ({note}) - Giới hạn an toàn: {safe_limit}%",
        min_value=0.0, max_value=100.0, value=0.0, step=0.5
    )
    
    percentages[name] = val
    total_percentage += val
    
    # Báo lỗi ngay lập tức dưới thanh trượt nếu vượt mức
    if val > safe_limit:
        st.error(f"⚠️ {name} đang vượt quá giới hạn an toàn ({val}% > {safe_limit}%)")
        limit_error = True

# Hiển thị tổng phần trăm theo thời gian thực
color = "green" if total_percentage == 100 else "red"
st.markdown(f"### Tổng tỉ lệ: <span style='color:{color}'>{total_percentage}%</span>", unsafe_allow_html=True)

# --- 4. TÍNH TOÁN & XUẤT CÔNG THỨC ---
st.header("4. Kết quả & Xuất công thức")

# Kiểm tra 2 điều kiện tiên quyết
if total_percentage != 100.0:
    st.error("❌ Tổng tỉ lệ chưa đạt 100%. Không thể tính toán và xuất công thức.")
elif limit_error:
    st.error("❌ Có nguyên liệu vượt giới hạn an toàn. Không thể xuất công thức.")
else:
    st.success("✅ Công thức hợp lệ!")
    
    # Tính thể tích và đưa vào danh sách
    results = []
    for index, row in df_ingredients.iterrows():
        name = row['Tên nguyên liệu']
        note = row['Tầng hương']
        pct = percentages[name]
        
        if pct > 0:
            # V_i = V_mẻ × %_i / 100
            vol = batch_volume * (pct / 100.0)
            results.append({
                "Tên nguyên liệu": name,
                "Tầng hương": note,
                "Tỉ lệ (%)": pct,
                "Thể tích (ml)": round(vol, 2)
            })
            
    df_results = pd.DataFrame(results)
    st.dataframe(df_results, use_container_width=True)
    
    # --- 5. MÔ TẢ MÙI THEO TẦNG CHIẾM ƯU THẾ ---
    # Lọc các tầng hương thơm (loại bỏ dung môi) để đánh giá mùi hương chính xác
    df_fragrance = df_results[df_results['Tầng hương'].isin(['Hương đầu', 'Hương giữa', 'Hương cuối'])]
    
    if not df_fragrance.empty:
        note_sums = df_fragrance.groupby('Tầng hương')['Tỉ lệ (%)'].sum()
        if not note_sums.empty:
            dominant_note = note_sums.idxmax() # Lấy tên tầng hương có tỉ lệ cao nhất
            max_pct = note_sums.max()
            
            st.subheader("Mô tả hương thơm dự kiến")
            st.write(f"**Tầng hương ưu thế:** {dominant_note} ({max_pct}%)")
            
            if dominant_note == "Hương đầu":
                st.info("🍃 **Đặc điểm:** Tươi mát, tỏa hương mạnh mẽ ngay khi xịt. Tạo ấn tượng ban đầu sắc nét. Phù hợp cho những ngày rực rỡ và năng động.")
            elif dominant_note == "Hương giữa":
                st.info("🌸 **Đặc điểm:** Tròn trịa, hài hòa và là 'trái tim' của chai nước hoa. Mùi hương êm dịu, lưu luyến, mang lại cảm giác thanh lịch.")
            else: # Hương cuối
                st.info("🪵 **Đặc điểm:** Trầm ấm, sâu lắng và bám da cực tốt. Độ lưu hương lâu, mang lại cảm giác bí ẩn, sang trọng. Rất hợp cho buổi tối hoặc thời tiết lạnh.")

    # --- 6. NÚT TẢI XUỐNG CSV ---
    # Sử dụng utf-8-sig để hỗ trợ hiển thị tiếng Việt chuẩn trong Excel
    csv_data = df_results.to_csv(index=False).encode('utf-8-sig')
    
    st.download_button(
        label="📥 Tải xuống công thức (CSV)",
        data=csv_data,
        file_name=f"Cong_Thuc_Nuoc_Hoa_{season}_{batch_volume}ml.csv",
        mime="text/csv",
    )
`;

interface SubWebPythonStreamlitProps {
  onBackToMainWeb: () => void;
  onSyncFormulaToWeb?: (
    items: { name: string; percentage: number }[],
    season: string,
    volume: number
  ) => void;
}

export const SubWebPythonStreamlit: React.FC<SubWebPythonStreamlitProps> = ({
  onBackToMainWeb,
  onSyncFormulaToWeb,
}) => {
  const [viewMode, setViewMode] = useState<'app' | 'code'>('app');
  const [isExpanderOpen, setIsExpanderOpen] = useState<boolean>(true);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [ingredientsData, setIngredientsData] = useState<IngredientRow[]>(DEFAULT_INGREDIENTS);

  // Streamlit controls state
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

  // Calculate total percentage & errors
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

  // Calculated results
  const results = useMemo(() => {
    if (totalPercentage !== 100.0 || hasLimitError) return [];
    return ingredientsData
      .filter((row) => (percentages[row.name] || 0) > 0)
      .map((row) => {
        const pct = percentages[row.name] || 0;
        const vol = Math.round((batchVolume * (pct / 100.0)) * 100) / 100;
        return {
          name: row.name,
          tier: row.tier,
          percentage: pct,
          volume: vol,
        };
      });
  }, [totalPercentage, hasLimitError, ingredientsData, percentages, batchVolume]);

  // Dominant note analysis (excludes solvents)
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

  // Handle slider change
  const handleSliderChange = (name: string, val: number) => {
    setPercentages((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  // Preset 100% balanced formula
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

  // Reset to 0
  const handleResetZeros = () => {
    const zeros: Record<string, number> = {};
    ingredientsData.forEach((row) => {
      zeros[row.name] = 0.0;
    });
    setPercentages(zeros);
  };

  // Download CSV (utf-8-sig)
  const handleDownloadCsv = () => {
    if (results.length === 0) return;
    const header = 'Tên nguyên liệu,Tầng hương,Tỉ lệ (%),Thể tích (ml)\n';
    const rows = results
      .map((r) => `"${r.name}","${r.tier}",${r.percentage},${r.volume}`)
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

  // Copy Python code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(RAW_PYTHON_SCRIPT);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Download Python file
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

  // Handle custom CSV upload
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
              const name = parts[0];
              const tier = parts[1];
              const safeLimit = parseFloat(parts[2]) || 100.0;
              parsed.push({ name, tier, safeLimit });
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
    <div className="space-y-6 animate-fadeIn text-[#2D3A2F]">
      {/* Top Banner Navigation & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6DFD5] shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToMainWeb}
            className="p-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#E0D8CB] text-[#5A685F] hover:text-[#1F2F23] transition-colors"
            title="Quay lại Trang chính"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FF4B4B]/10 text-[#FF4B4B] border border-[#FF4B4B]/30 font-bold flex items-center gap-1">
                Streamlit App
              </span>
              <span className="text-xs text-[#6B7C70] font-sans">
                Python 3.11 • app1_8ba4d2ea.py
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#1F2F23]">
              Hệ Thống Phối Trộn Nước Hoa (Ứng Dụng Python Streamlit)
            </h1>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F4EFE6] rounded-xl border border-[#E0D8CB] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('app')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === 'app'
                ? 'bg-[#FFFFFF] text-[#245437] shadow-xs font-bold'
                : 'text-[#617366] hover:text-[#1F2F23]'
            }`}
          >
            <Sliders className="w-4 h-4 text-[#3B7A57]" />
            <span>Trực Tiếp Trên Web</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('code')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === 'code'
                ? 'bg-[#FFFFFF] text-[#245437] shadow-xs font-bold'
                : 'text-[#617366] hover:text-[#1F2F23]'
            }`}
          >
            <FileCode className="w-4 h-4 text-[#3B7A57]" />
            <span>Mã Nguồn Python</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: INTERACTIVE STREAMLIT RUNNER */}
      {viewMode === 'app' && (
        <div className="space-y-6">
          {/* Streamlit Container */}
          <div className="max-w-3xl mx-auto bg-[#FFFFFF] border border-[#E6DFD5] rounded-3xl p-5 sm:p-8 shadow-md space-y-7">
            {/* Title */}
            <div className="border-b border-[#E8E1D5] pb-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2F23] flex items-center gap-2">
                <span>🌸</span>
                <span>Hệ Thống Phối Trộn Nước Hoa</span>
              </h2>
              <p className="text-xs text-[#6B7C70] mt-1 font-mono">
                Bản mô phỏng chuẩn giao diện Streamlit (st.set_page_config & st.title)
              </p>
            </div>

            {/* 1. ĐỌC BẢNG NGUYÊN LIỆU */}
            <div className="space-y-3.5">
              <h3 className="text-lg font-bold text-[#1F2F23] flex items-center gap-2 border-l-4 border-[#3B7A57] pl-2.5">
                1. Dữ liệu nguyên liệu
              </h3>
              <p className="text-xs text-[#526356]">
                Tải lên bảng nguyên liệu do giáo viên cung cấp (CSV hoặc Excel).
              </p>

              {/* File Uploader */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border-2 border-dashed border-[#DCD5C9] hover:border-[#3B7A57] transition-colors text-center relative">
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  title="Chọn file CSV hoặc Excel"
                />
                <div className="flex flex-col items-center justify-center gap-1.5 text-xs text-[#6B7C70]">
                  <Upload className="w-6 h-6 text-[#3B7A57]" />
                  <span className="font-semibold text-[#1F2F23]">
                    {uploadedFileName ? `File đã tải: ${uploadedFileName}` : 'Chọn file CSV hoặc Excel'}
                  </span>
                  <span className="text-[11px] text-[#8E9B91]">Kéo thả hoặc bấm để duyệt tệp tin</span>
                </div>
              </div>

              {/* Status Message */}
              {uploadedFileName ? (
                <div className="p-3 rounded-xl bg-[#EEF5F0] border border-[#CFE2D4] text-xs text-[#245236] font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#3B7A57]" />
                  <span>Đã tải dữ liệu thành công từ file: <strong>{uploadedFileName}</strong></span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#F0F7FF] border border-[#BFDBFE] text-xs text-[#1E40AF] font-medium flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#3B82F6] shrink-0" />
                  <span>
                    Đang sử dụng dữ liệu nguyên liệu từ <strong>app1_8ba4d2ea.py</strong>. Hãy tải file của giáo viên lên để thay thế nếu có file mới.
                  </span>
                </div>
              )}

              {/* Expander: Xem bảng nguyên liệu */}
              <div className="border border-[#E5DFD5] rounded-2xl overflow-hidden bg-[#FAF8F5]">
                <button
                  type="button"
                  onClick={() => setIsExpanderOpen(!isExpanderOpen)}
                  className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-[#1F2F23] hover:bg-[#F2ECE1] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#3B7A57]" />
                    Xem bảng nguyên liệu ({ingredientsData.length} thành phần)
                  </span>
                  {isExpanderOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#6B7C70]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#6B7C70]" />
                  )}
                </button>

                {isExpanderOpen && (
                  <div className="p-3 border-t border-[#E8E1D5] bg-[#FFFFFF] overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#E8E1D5] text-[11px] font-mono text-[#6A7B6E] uppercase bg-[#FAF8F5]">
                          <th className="py-2 px-3">Tên nguyên liệu</th>
                          <th className="py-2 px-3">Tầng hương</th>
                          <th className="py-2 px-3 text-right">Giới hạn an toàn (%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFE9DF]">
                        {ingredientsData.map((row, idx) => (
                          <tr key={idx} className="hover:bg-[#FAF8F5]/80">
                            <td className="py-2 px-3 font-semibold text-[#1F2F23]">{row.name}</td>
                            <td className="py-2 px-3 font-mono text-[#58685B]">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] ${
                                  row.tier === 'Hương đầu'
                                    ? 'bg-[#FEF3C7] text-[#92400E]'
                                    : row.tier === 'Hương giữa'
                                    ? 'bg-[#FCE7F3] text-[#9D174D]'
                                    : row.tier === 'Hương cuối'
                                    ? 'bg-[#EDE9FE] text-[#5B21B6]'
                                    : 'bg-[#E5E7EB] text-[#374151]'
                                }`}
                              >
                                {row.tier}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-[#1F2F23]">
                              {row.safeLimit.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* 2. CÀI ĐẶT THÔNG SỐ CHUNG */}
            <div className="space-y-3.5 pt-3 border-t border-[#E8E1D5]">
              <h3 className="text-lg font-bold text-[#1F2F23] flex items-center gap-2 border-l-4 border-[#3B7A57] pl-2.5">
                2. Thông số mẻ pha chế
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#3D4F42] block">
                    Chọn mùa sử dụng:
                  </label>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-[#DCD5C9] text-xs sm:text-sm font-medium text-[#1F2F23] focus:outline-none focus:ring-2 focus:ring-[#3B7A57]/30"
                  >
                    <option value="Xuân">Xuân</option>
                    <option value="Hạ">Hạ</option>
                    <option value="Thu">Thu</option>
                    <option value="Đông">Đông</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#3D4F42] block">
                    Thể tích mẻ (ml):
                  </label>
                  <input
                    type="number"
                    min={1.0}
                    step={1.0}
                    value={batchVolume}
                    onChange={(e) => setBatchVolume(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-[#DCD5C9] text-xs sm:text-sm font-mono font-bold text-[#1F2F23] focus:outline-none focus:ring-2 focus:ring-[#3B7A57]/30"
                  />
                </div>
              </div>
            </div>

            {/* 3. ĐIỀU CHỈNH TỈ LỆ & KIỂM TRA ĐIỀU KIỆN */}
            <div className="space-y-4 pt-3 border-t border-[#E8E1D5]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-[#1F2F23] flex items-center gap-2 border-l-4 border-[#3B7A57] pl-2.5">
                    3. Tỉ lệ thành phần (%)
                  </h3>
                  <p className="text-xs text-[#6B7C70] mt-0.5">
                    Kéo thanh trượt để điều chỉnh. Tổng phải bằng chính xác 100%.
                  </p>
                </div>

                {/* Helper buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleSetBalancedPreset}
                    className="px-2.5 py-1 rounded-lg bg-[#EEF5F0] hover:bg-[#E2EDE5] text-[#245236] border border-[#CFE2D4] text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    title="Nạp công thức chuẩn 100%"
                  >
                    <Sparkles className="w-3 h-3 text-[#3B7A57]" />
                    <span>Nạp mẫu chuẩn 100%</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetZeros}
                    className="px-2 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#F2ECE1] text-[#617366] border border-[#E0D8CB] text-[11px] transition-colors"
                    title="Đặt lại tất cả về 0%"
                  >
                    Về 0%
                  </button>
                </div>
              </div>

              {/* Sliders list */}
              <div className="space-y-4">
                {ingredientsData.map((row) => {
                  const val = percentages[row.name] || 0.0;
                  const isExceeded = val > row.safeLimit;

                  return (
                    <div
                      key={row.name}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isExceeded
                          ? 'bg-[#FEF2F2] border-[#FCA5A5]'
                          : 'bg-[#FAF8F5] border-[#E5DFD5]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <label className="text-xs font-semibold text-[#1F2F23] flex items-center gap-1.5">
                          <span>{row.name}</span>
                          <span className="text-[11px] font-normal text-[#6B7C70]">({row.tier})</span>
                          <span className="text-[10px] font-mono text-[#8E9B91]">
                            · Giới hạn an toàn: {row.safeLimit.toFixed(1)}%
                          </span>
                        </label>
                        <span
                          className={`text-sm font-mono font-bold px-2 py-0.5 rounded-md ${
                            isExceeded
                              ? 'bg-[#FEE2E2] text-[#DC2626]'
                              : 'bg-[#EEF5F0] text-[#245437]'
                          }`}
                        >
                          {val.toFixed(1)}%
                        </span>
                      </div>

                      {/* Range slider */}
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={0.0}
                          max={100.0}
                          step={0.5}
                          value={val}
                          onChange={(e) =>
                            handleSliderChange(row.name, parseFloat(e.target.value) || 0)
                          }
                          className="pyramid-touch-slider w-full cursor-pointer"
                        />
                      </div>

                      {/* Real-time error warning */}
                      {isExceeded && (
                        <p className="text-xs text-[#DC2626] font-medium mt-2 flex items-center gap-1.5 bg-[#FEE2E2] p-2 rounded-lg">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            ⚠️ {row.name} đang vượt quá giới hạn an toàn ({val}% &gt; {row.safeLimit}%)
                          </span>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Total percentage display */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] flex items-center justify-between">
                <span className="text-sm font-semibold text-[#1F2F23]">Tổng tỉ lệ toàn bộ thành phần:</span>
                <span
                  className={`text-xl sm:text-2xl font-mono font-bold px-3 py-1 rounded-xl border ${
                    totalPercentage === 100.0
                      ? 'bg-[#EEF5F0] text-[#16A34A] border-[#86EFAC]'
                      : 'bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5]'
                  }`}
                >
                  {totalPercentage.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* 4. KẾT QUẢ & XUẤT CÔNG THỨC */}
            <div className="space-y-4 pt-3 border-t border-[#E8E1D5]">
              <h3 className="text-lg font-bold text-[#1F2F23] flex items-center gap-2 border-l-4 border-[#3B7A57] pl-2.5">
                4. Kết quả &amp; Xuất công thức
              </h3>

              {totalPercentage !== 100.0 ? (
                <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] text-xs sm:text-sm text-[#DC2626] font-medium flex items-center gap-2">
                  <XCircle className="w-5 h-5 shrink-0" />
                  <span>❌ Tổng tỉ lệ chưa đạt 100%. Không thể tính toán và xuất công thức.</span>
                </div>
              ) : hasLimitError ? (
                <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] text-xs sm:text-sm text-[#DC2626] font-medium flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>❌ Có nguyên liệu vượt giới hạn an toàn. Không thể xuất công thức.</span>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="p-3.5 rounded-2xl bg-[#EEF5F0] border border-[#86EFAC] text-xs sm:text-sm text-[#16A34A] font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>✅ Công thức hợp lệ!</span>
                  </div>

                  {/* Results DataFrame */}
                  <div className="border border-[#E5DFD5] rounded-2xl overflow-hidden bg-[#FFFFFF]">
                    <div className="px-4 py-2.5 bg-[#FAF8F5] border-b border-[#E8E1D5] font-mono text-xs font-semibold text-[#4E6053]">
                      Bảng thể tích thành phẩm (Mẻ {batchVolume} mL • Mùa {season})
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#E8E1D5] text-[11px] font-mono text-[#6A7B6E] uppercase bg-[#FAF8F5]">
                            <th className="py-2.5 px-3">Tên nguyên liệu</th>
                            <th className="py-2.5 px-3">Tầng hương</th>
                            <th className="py-2.5 px-3 text-right">Tỉ lệ (%)</th>
                            <th className="py-2.5 px-3 text-right font-bold text-[#3B7A57]">Thể tích (ml)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFE9DF]">
                          {results.map((row, idx) => (
                            <tr key={idx} className="hover:bg-[#FAF8F5]/80">
                              <td className="py-2.5 px-3 font-semibold text-[#1F2F23]">{row.name}</td>
                              <td className="py-2.5 px-3 font-mono text-[#58685B]">{row.tier}</td>
                              <td className="py-2.5 px-3 text-right font-mono font-medium text-[#1F2F23]">
                                {row.percentage.toFixed(1)}%
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-[#16A34A]">
                                {row.volume.toFixed(2)} ml
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 5. MÔ TẢ MÙI THEO TẦNG CHIẾM ƯU THẾ */}
                  {dominantInfo && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-2">
                      <h4 className="text-sm font-bold text-[#166534] flex items-center gap-1.5">
                        <span>🌸</span>
                        <span>Mô tả hương thơm dự kiến</span>
                      </h4>
                      <p className="text-xs text-[#1F2F23]">
                        <strong>Tầng hương ưu thế:</strong> {dominantInfo.dominantNote} ({dominantInfo.maxPct}%)
                      </p>

                      <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#DCFCE7] text-xs text-[#14532D] leading-relaxed">
                        {dominantInfo.dominantNote === 'Hương đầu' && (
                          <p>
                            🍃 <strong>Đặc điểm:</strong> Tươi mát, tỏa hương mạnh mẽ ngay khi xịt. Tạo ấn tượng ban đầu sắc nét. Phù hợp cho những ngày rực rỡ và năng động.
                          </p>
                        )}
                        {dominantInfo.dominantNote === 'Hương giữa' && (
                          <p>
                            🌸 <strong>Đặc điểm:</strong> Tròn trịa, hài hòa và là "trái tim" của chai nước hoa. Mùi hương êm dịu, lưu luyến, mang lại cảm giác thanh lịch.
                          </p>
                        )}
                        {dominantInfo.dominantNote === 'Hương cuối' && (
                          <p>
                            🪵 <strong>Đặc điểm:</strong> Trầm ấm, sâu lắng và bám da cực tốt. Độ lưu hương lâu, mang lại cảm giác bí ẩn, sang trọng. Rất hợp cho buổi tối hoặc thời tiết lạnh.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 6. NÚT TẢI XUỐNG CSV & ĐỒNG BỘ */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleDownloadCsv}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2D6344] to-[#3B7A57] hover:from-[#245237] hover:to-[#2D6344] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>📥 Tải xuống công thức (CSV)</span>
                    </button>

                    {onSyncFormulaToWeb && (
                      <button
                        type="button"
                        onClick={() => {
                          const items = results.map((r) => ({
                            name: r.name,
                            percentage: r.percentage,
                          }));
                          onSyncFormulaToWeb(items, season, batchVolume);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-[#EEF5F0] hover:bg-[#E2EDE5] text-[#245236] border border-[#CFE2D4] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all"
                        title="Đưa các tỉ lệ nguyên liệu từ App Python vào Xưởng pha chế Web"
                      >
                        <Sparkles className="w-4 h-4 text-[#3B7A57]" />
                        <span>Áp dụng vào Xưởng pha chế Web</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: CODE VIEWER & DOWNLOADER */}
      {viewMode === 'code' && (
        <div className="max-w-4xl mx-auto bg-[#FFFFFF] border border-[#E6DFD5] rounded-3xl p-5 sm:p-8 shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E1D5] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-[#3B7A57]" />
                <h2 className="text-xl font-bold text-[#1F2F23]">
                  Mã Nguồn Streamlit: app1_8ba4d2ea.py
                </h2>
              </div>
              <p className="text-xs text-[#6B7C70] mt-0.5">
                File lưu trực tiếp tại <code className="text-[#3B7A57] bg-[#EEF5F0] px-1.5 py-0.5 rounded">public/assets/aistudio/app1_8ba4d2ea.py</code>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE1] text-[#2D5E41] border border-[#CFE2D4] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-4 h-4 text-[#10B981]" />
                    <span>Đã sao chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Sao chép mã</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadPythonFile}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#2D6344] to-[#3B7A57] hover:from-[#245237] hover:to-[#2D6344] text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Tải app1_8ba4d2ea.py</span>
              </button>
            </div>
          </div>

          {/* Running Instructions */}
          <div className="p-4 rounded-2xl bg-[#F8F5EE] border border-[#E5DFD5] space-y-2 text-xs">
            <span className="font-semibold text-[#1F2F23] flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-[#3B7A57]" />
              Hướng dẫn chạy trên máy tính cá nhân:
            </span>
            <div className="font-mono bg-[#1E293B] text-slate-100 p-3 rounded-xl overflow-x-auto space-y-1">
              <p className="text-slate-400"># 1. Cài đặt các thư viện cần thiết:</p>
              <p className="text-emerald-400 font-bold">pip install streamlit pandas openpyxl</p>
              <p className="text-slate-400 mt-2"># 2. Khởi chạy ứng dụng Streamlit:</p>
              <p className="text-amber-300 font-bold">streamlit run public/assets/aistudio/app1_8ba4d2ea.py</p>
            </div>
          </div>

          {/* Code Viewer Box */}
          <div className="rounded-2xl border border-[#E5DFD5] overflow-hidden bg-[#1E293B]">
            <div className="px-4 py-2 bg-[#0F172A] border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Python 3.11 • UTF-8</span>
              <span>144 dòng lệnh</span>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-[550px] overflow-y-auto">
              {RAW_PYTHON_SCRIPT}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
