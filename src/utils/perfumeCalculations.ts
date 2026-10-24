import { INGREDIENT_CATALOG, PerfumeIngredient } from '../data/perfumeData';

export interface FormulaSlot {
  key: 'top1' | 'top2' | 'heart1' | 'heart2' | 'base1' | 'base2';
  tier: 'top' | 'heart' | 'base';
  tierLabel: string;
  slotNumber: number;
  ingredientId: string;
  customName?: string;
  observedNote?: string;
  percentage: number;
}

export interface CalculatedIngredient {
  slotKey: string;
  tier: 'top' | 'heart' | 'base';
  tierLabel: string;
  id: string;
  name: string;
  scientificName: string;
  scentFamily: string;
  color: string;
  percentage: number; // Tỉ lệ % trong hỗn hợp cốt hương liệu nguyên chất (Tổng = 100%)
  finalProductConcentrationPercent: number; // Nồng độ % thực tế trong sản phẩm nước hoa hoàn chỉnh (pha trong Ethanol)
  volumeMl: number; // Thể tích tinh dầu nguyên chất cần đong (mL) = pureFragranceMl * percentage / 100
  drops: number;
  ifraMaxPercent: number; // Giới hạn tối đa (%) trong sản phẩm hoàn chỉnh theo tài liệu kỹ thuật IFRA Cat. 4
  isExceedingIfra: boolean;
  chemicalCompounds?: string;
  volatilityNote?: string;
  observedLabNote?: string;
  ifraTechnicalReference?: string;
}

export interface StudentScientificEvaluation {
  isReasonableRating: 'very_reasonable' | 'partially_reasonable' | 'not_reasonable';
  isReasonableComment: string;
  chemistryExplanation: string;
  groupDecision: 'agree' | 'agree_with_modifications' | 'disagree';
  groupDecisionReason: string;
  verificationExperimentPlan: string;
}

export function calculateFormula(
  slots: FormulaSlot[],
  totalVolume: number,
  concentrationPercent: number = 18,
  customCatalog?: Record<'top' | 'heart' | 'base', PerfumeIngredient[]>
) {
  // Thể tích cốt hương liệu nguyên chất (mL) và thể tích dung môi cồn Ethanol 96° (mL)
  const pureFragranceMl = Number(((totalVolume * concentrationPercent) / 100).toFixed(2));
  const carrierAlcoholMl = Number((totalVolume - pureFragranceMl).toFixed(2));

  const totalPercentage = Number(
    slots.reduce((acc, curr) => acc + (curr.percentage || 0), 0).toFixed(1)
  );

  const tierTotals = {
    top: Number((slots[0].percentage + slots[1].percentage).toFixed(1)),
    heart: Number((slots[2].percentage + slots[3].percentage).toFixed(1)),
    base: Number((slots[4].percentage + slots[5].percentage).toFixed(1)),
  };

  const calculatedIngredients: CalculatedIngredient[] = slots.map((slot) => {
    const catalogItem =
      (customCatalog && customCatalog[slot.tier]?.find((item) => item.id === slot.ingredientId)) ||
      INGREDIENT_CATALOG[slot.tier].find((item) => item.id === slot.ingredientId) ||
      INGREDIENT_CATALOG[slot.tier][0];

    const displayName = slot.customName?.trim() || catalogItem.name;
    // Phân biệt rõ:
    // 1. slot.percentage: Tỉ lệ phối trộn trong hỗn hợp hương liệu nguyên chất (Tổng 6 nguyên liệu = 100%)
    // 2. finalProductConcentrationPercent: Nồng độ nguyên liệu trong sản phẩm nước hoa hoàn chỉnh = (slot.percentage * concentrationPercent) / 100
    // 3. volumeInCompoundMl: Thể tích tinh dầu nguyên chất cần lấy (mL) = (pureFragranceMl * slot.percentage) / 100
    const volumeInCompoundMl = Number(((pureFragranceMl * slot.percentage) / 100).toFixed(2));
    const finalProductConcentrationPercent = Number(
      ((slot.percentage * concentrationPercent) / 100).toFixed(2)
    );
    const drops = Math.round(volumeInCompoundMl * 20); // ~20 giọt tinh dầu ≈ 1 mL

    return {
      slotKey: slot.key,
      tier: slot.tier,
      tierLabel: slot.tierLabel,
      id: catalogItem.id,
      name: displayName,
      scientificName: catalogItem.scientificName,
      scentFamily: catalogItem.scentFamily,
      color: catalogItem.color,
      percentage: slot.percentage,
      finalProductConcentrationPercent,
      volumeMl: volumeInCompoundMl,
      drops: slot.percentage > 0 ? Math.max(1, drops) : 0,
      ifraMaxPercent: catalogItem.ifraMaxPercent,
      isExceedingIfra: finalProductConcentrationPercent > catalogItem.ifraMaxPercent,
      chemicalCompounds: catalogItem.chemicalCompounds,
      volatilityNote: catalogItem.volatilityNote,
      observedLabNote: slot.observedNote || catalogItem.observedLabNote || catalogItem.description,
      ifraTechnicalReference: catalogItem.ifraTechnicalReference,
    };
  });

  return {
    totalPercentage,
    isValidTotal: Math.abs(totalPercentage - 100) < 0.05,
    difference: Number((100 - totalPercentage).toFixed(1)),
    pureFragranceMl,
    carrierAlcoholMl,
    tierTotals,
    calculatedIngredients,
  };
}

// Auto-balance formula to exactly 100%
export function autoBalanceSlots(slots: FormulaSlot[]): FormulaSlot[] {
  const currentTotal = slots.reduce((acc, s) => acc + (s.percentage || 0), 0);
  if (currentTotal <= 0) {
    // Default equal distribution or standard 30/45/25
    return [
      { ...slots[0], percentage: 15 },
      { ...slots[1], percentage: 15 },
      { ...slots[2], percentage: 25 },
      { ...slots[3], percentage: 20 },
      { ...slots[4], percentage: 15 },
      { ...slots[5], percentage: 10 },
    ];
  }

  const factor = 100 / currentTotal;
  const rawPercentages = slots.map((s) => s.percentage * factor);
  const rounded = rawPercentages.map((p) => Math.round(p));
  const sumRounded = rounded.reduce((a, b) => a + b, 0);
  const diff = 100 - sumRounded;

  // Add the difference to the largest slot to maintain 100% exactly
  const maxIdx = rounded.indexOf(Math.max(...rounded));
  rounded[maxIdx] += diff;

  return slots.map((slot, index) => ({
    ...slot,
    percentage: Math.max(1, rounded[index]),
  }));
}

// Generate CSV string with UTF-8 BOM
export function generateCsvContent(
  formulaName: string,
  seasonLabel: string,
  totalVolume: number,
  concentrationLabel: string,
  ingredients: CalculatedIngredient[],
  tierTotals: { top: number; heart: number; base: number },
  masterPerfumerName?: string
): string {
  const dateStr = new Date().toLocaleDateString('vi-VN');

  const headers = [
    'Tầng Hương',
    'Số Thứ Tự',
    'Tên Nguyên Liệu',
    'Tên Khoa Học / Nhóm',
    'Tỉ Lệ Trong Cốt Hợp Hương (%)',
    'Nồng Độ Trong Thành Phẩm Hoàn Chỉnh (%)',
    'Thể Tích Tinh Dầu Nguyên Chất (mL)',
    'Số Giọt Ước Tính (drops)',
    'Giới Hạn IFRA Cat.4 Trong Thành Phẩm (%)',
    'Đặc Điểm Mùi Đã Quan Sát Thực Nghiệm',
  ];

  const rows = ingredients.map((ing, idx) => [
    `"${ing.tierLabel}"`,
    idx + 1,
    `"${ing.name}"`,
    `"${ing.scientificName} - ${ing.scentFamily}"`,
    `${ing.percentage}%`,
    `${ing.finalProductConcentrationPercent ?? Number(((ing.percentage * 18) / 100).toFixed(2))}%`,
    `${ing.volumeMl} mL`,
    `${ing.drops} giọt`,
    `${ing.ifraMaxPercent}%`,
    `"${(ing.observedLabNote || '').replace(/"/g, '""')}"`,
  ]);

  const csvMeta = [
    `"BẢNG CÔNG THỨC PHA CHẾ NƯỚC HOA - FLORIS"`,
    `"Tên tác phẩm:","${formulaName || 'Công Thức Nước Hoa Tự Nhiên'}"`,
    `"Mùa thiết kế:","${seasonLabel}"`,
    `"Tổng thể tích thành phẩm:","${totalVolume} mL"`,
    `"Nồng độ cốt tinh dầu trong thành phẩm:","${concentrationLabel}"`,
    `"Ngày thiết kế:","${dateStr}"`,
    `"Phân bổ tầng hương:","Tầng Đầu: ${tierTotals.top}% | Tầng Giữa: ${tierTotals.heart}% | Tầng Cuối: ${tierTotals.base}%"`,
    ...(masterPerfumerName ? [`"Đánh giá bởi:","${masterPerfumerName}"`] : []),
    ``, // empty line
  ];

  const content = [
    ...csvMeta,
    headers.join(','),
    ...rows.map((r) => r.join(',')),
    ``,
    `"Lưu ý Hóa học & An toàn: Phân biệt rõ Tỉ lệ phối trộn trong cốt hương (Tổng = 100%) và Nồng độ hương liệu trong sản phẩm nước hoa hoàn chỉnh (pha loãng trong cồn Ethanol 96°). Các giới hạn IFRA dựa trên tài liệu kỹ thuật IFRA 51st Amendment Category 4."`,
  ].join('\r\n');

  return '\uFEFF' + content; // Prepend UTF-8 BOM
}

// Generate comprehensive Presentation Report CSV (Baseline + AI Proposal + Comparison + Student Evaluation)
export function generatePresentationReportCsv(params: {
  baselineTitle: string;
  seasonLabel: string;
  totalVolume: number;
  concentrationName: string;
  concentrationPercent: number;
  pureFragranceMl: number;
  carrierAlcoholMl: number;
  userRequest: string;
  proposedPerfumeName: string;
  analysisSummary: string;
  olfactoryHypothesisText: string;
  comparisonItems: {
    tierLabel: string;
    name: string;
    scentFamily: string;
    oldPercentage: number;
    newPercentage: number;
    deltaPercentage: number;
    oldVolumeMl: number;
    newVolumeMl: number;
    reason: string;
  }[];
  studentEvaluation: StudentScientificEvaluation;
}): string {
  const dateStr = new Date().toLocaleString('vi-VN');
  const q = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;

  const decisionText =
    params.studentEvaluation.groupDecision === 'agree'
      ? 'Đồng ý hoàn toàn với đề xuất của AI'
      : params.studentEvaluation.groupDecision === 'agree_with_modifications'
      ? 'Đồng ý một phần (Có điều chỉnh thực nghiệm)'
      : 'Không đồng ý với đề xuất của AI';

  const reasonableText =
    params.studentEvaluation.isReasonableRating === 'very_reasonable'
      ? 'Hợp lý, có cơ sở khoa học rõ ràng'
      : params.studentEvaluation.isReasonableRating === 'partially_reasonable'
      ? 'Hợp lý một phần, cần tinh chỉnh thêm'
      : 'Chưa hợp lý';

  const lines: string[] = [
    `"BÁO CÁO THỰC NGHIỆM & ĐÁNH GIÁ ĐỀ XUẤT CẢI TIẾN NƯỚC HOA CÙNG AI - FLORIS"`,
    `"Nhóm thực hiện:","Tổ 1 - Lớp 12A13 THPT Nguyễn Thị Minh Khai"`,
    `"Thời gian xuất báo cáo:",${q(dateStr)}`,
    `"Công thức thực nghiệm gốc:",${q(params.baselineTitle)}`,
    `"Quy chuẩn pha chế:","Chai ${params.totalVolume} mL | ${params.concentrationName} (${params.concentrationPercent}% cốt hương liệu = ${params.pureFragranceMl} mL tinh dầu + ${params.carrierAlcoholMl} mL cồn Ethanol 96°)"`,
    ``,
    `"I. YÊU CẦU TƯ VẤN CẢI TIẾN GỬI CHO AI"`,
    `"Yêu cầu của người tham quan / người dùng:",${q(params.userRequest)}`,
    `"Tên phiên bản AI đề xuất:",${q(params.proposedPerfumeName)}`,
    `"Tóm tắt phương án điều chỉnh của AI:",${q(params.analysisSummary)}`,
    `"Giả thuyết dự đoán sự thay đổi mùi hương (Lưu ý: Đây là dự đoán giả thuyết, cần kiểm chứng thực nghiệm):",${q(params.olfactoryHypothesisText)}`,
    ``,
    `"II. BẢNG ĐỐI CHIẾU CÔNG THỨC GỐC VÀ CÔNG THỨC AI ĐỀ XUẤT (TỔNG TỈ LỆ = 100%)"`,
    [
      'Tầng Hương',
      'Tên Nguyên Liệu',
      'Nhóm Hương',
      'Công Thức Gốc (% Hợp Hương)',
      'Nồng Độ Gốc Trong Thành Phẩm (%)',
      'Công Thức AI Đề Xuất (% Hợp Hương)',
      'Nồng Độ Đề Xuất Trong Thành Phẩm (%)',
      'Phần Trăm Thay Đổi (Delta %)',
      'Thể Tích Tinh Dầu Gốc (mL)',
      'Thể Tích Tinh Dầu Mới (mL)',
      'Giải Thích Lý Do Điều Chỉnh Của AI',
    ].join(','),
    ...params.comparisonItems.map((item) => {
      const oldFinalConc = Number(((item.oldPercentage * params.concentrationPercent) / 100).toFixed(2));
      const newFinalConc = Number(((item.newPercentage * params.concentrationPercent) / 100).toFixed(2));
      const deltaStr = item.deltaPercentage > 0 ? `+${item.deltaPercentage}%` : `${item.deltaPercentage}%`;
      return [
        q(item.tierLabel),
        q(item.name),
        q(item.scentFamily),
        `${item.oldPercentage}%`,
        `${oldFinalConc}%`,
        `${item.newPercentage}%`,
        `${newFinalConc}%`,
        q(deltaStr),
        `${item.oldVolumeMl} mL`,
        `${item.newVolumeMl} mL`,
        q(item.reason),
      ].join(',');
    }),
    ``,
    `"III. PHẦN NHẬN XÉT, PHÂN TÍCH HÓA HỌC & ĐÁNH GIÁ CỦA NHÓM HỌC SINH"`,
    `"1. Đề xuất của AI có hợp lý không?:",${q(`${reasonableText} — ${params.studentEvaluation.isReasonableComment}`)}`,
    `"2. Kiến thức Hóa học giải thích sự thay đổi:",${q(params.studentEvaluation.chemistryExplanation)}`,
    `"3. Nhóm đồng ý hay không đồng ý với AI?:",${q(`${decisionText} — ${params.studentEvaluation.groupDecisionReason}`)}`,
    `"4. Thực nghiệm cần tiến hành để kiểm chứng giả thuyết:",${q(params.studentEvaluation.verificationExperimentPlan)}`,
  ];

  return '\uFEFF' + lines.join('\r\n');
}

// Download CSV helper
export function downloadCsvFile(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Python Streamlit generator for the student/professor assignment requirement!
export function generateStreamlitCode(
  season: string,
  totalVolume: number,
  slots: FormulaSlot[]
): string {
  return `"""
ỨNG DỤNG PHA CHẾ NƯỚC HOA 3 TẦNG / 6 NGUYÊN LIỆU (STREAMLIT + AI)
Đồ án / Bài tập: Thiết kế công thức nước hoa theo mùa, tính mL, xuất CSV và tích hợp AI
Lưu ý bảo mật: Khóa API Gemini được lấy từ biến môi trường hệ thống (os.getenv hoặc st.secrets),
tuyệt đối KHÔNG gán cứng khóa API vào mã nguồn!
"""

import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import os
import io

# 1. Cấu hình trang giao diện Streamlit
st.set_page_config(
    page_title="Phòng Thí Nghiệm Nước Hoa - Floris",
    page_icon="🧪",
    layout="wide"
)

st.title("🧪 Floris - Trình Thiết Kế Nước Hoa 3 Tầng Hương")
st.caption("Dự án Khoa Học Mùi Hương: Cân bằng 6 nguyên liệu, tính toán thể tích mL và thẩm định AI")

# 2. Thanh bên (Sidebar): Chọn Mùa & Thể Tích
st.sidebar.header("⚙️ Thiết Lập Cơ Bản")

seasons = ["Mùa Xuân (Spring)", "Mùa Hè (Summer)", "Mùa Thu (Autumn)", "Mùa Đông (Winter)"]
selected_season = st.sidebar.selectbox("🌸 Chọn Mùa Phù Hợp:", seasons, index=0)

total_volume = st.sidebar.number_input(
    "🧴 Nhập Tổng Thể Tích (mL):",
    min_value=5.0,
    max_value=500.0,
    value=float(${totalVolume}),
    step=5.0
)

concentration = st.sidebar.selectbox(
    "💧 Nồng Độ Nước Hoa:",
    ["Eau de Parfum (EDP) - 18%", "Extrait de Parfum - 25%", "Eau de Toilette (EDT) - 12%"],
    index=0
)

# 3. Kéo Tỉ Lệ 3 Tầng / 6 Nguyên Liệu
st.subheader("⚖️ Điều Chỉnh Tỉ Lệ 6 Nguyên Liệu (Tổng Phải Đạt 100%)")

col1, col2, col3 = st.columns(3)

with col1:
    st.markdown("### 🍋 Tầng Đầu (Top Notes)")
    st.caption("Lưu hương 15-30 phút đầu, tạo ấn tượng mở màn")
    ing1_name = st.text_input("Nguyên liệu 1:", value="Cam Bergamot Ý")
    ing1_pct = st.slider(f"Tỉ lệ % ({ing1_name})", 0, 50, 15, key="top1")
    
    ing2_name = st.text_input("Nguyên liệu 2:", value="Hoa Cam Neroli")
    ing2_pct = st.slider(f"Tỉ lệ % ({ing2_name})", 0, 50, 15, key="top2")
    top_total = ing1_pct + ing2_pct
    st.info(f"Tổng Tầng Đầu: **{top_total}%** (Khuyến nghị 20-30%)")

with col2:
    st.markdown("### 🌹 Tầng Giữa (Heart/Middle Notes)")
    st.caption("Lưu hương 2-4 giờ, linh hồn của mùi hương")
    ing3_name = st.text_input("Nguyên liệu 3:", value="Hoa Hồng Grasse (Rose de Mai)")
    ing3_pct = st.slider(f"Tỉ lệ % ({ing3_name})", 0, 60, 25, key="heart1")
    
    ing4_name = st.text_input("Nguyên liệu 4:", value="Hoa Oải Hương Provence")
    ing4_pct = st.slider(f"Tỉ lệ % ({ing4_name})", 0, 60, 20, key="heart2")
    heart_total = ing3_pct + ing4_pct
    st.info(f"Tổng Tầng Giữa: **{heart_total}%** (Khuyến nghị 40-50%)")

with col3:
    st.markdown("### 🌲 Tầng Cuối (Base Notes)")
    st.caption("Lưu hương 6-12+ giờ, lớp nền neo đậu hương thơm")
    ing5_name = st.text_input("Nguyên liệu 5:", value="Gỗ Đàn Hương Mysore")
    ing5_pct = st.slider(f"Tỉ lệ % ({ing5_name})", 0, 50, 15, key="base1")
    
    ing6_name = st.text_input("Nguyên liệu 6:", value="Xạ Hương Trắng (White Musk)")
    ing6_pct = st.slider(f"Tỉ lệ % ({ing6_name})", 0, 50, 10, key="base2")
    base_total = ing5_pct + ing6_pct
    st.info(f"Tổng Tầng Cuối: **{base_total}%** (Khuyến nghị 20-30%)")

# 4. Kiểm tra tổng và cảnh báo
total_pct = top_total + heart_total + base_total
st.divider()

if total_pct == 100:
    st.success(f"✅ TỔNG TỈ LỆ CHUẨN XÁC: **{total_pct}%** - Công thức hợp lệ!")
elif total_pct < 100:
    st.warning(f"⚠️ CẢNH BÁO: Tổng tỉ lệ hiện tại là **{total_pct}%** (Còn thiếu **{100 - total_pct}%**). Vui lòng kéo thêm để đạt đủ 100%.")
else:
    st.error(f"⛔ CẢNH BÁO: Tổng tỉ lệ vượt quá 100% (**{total_pct}%**, thừa **{total_pct - 100}%**). Hãy giảm bớt một số nốt hương.")

# 5. Bảng Tính Thể Tích mL và Giọt
ingredients_data = [
    {"Tầng": "Tầng Đầu (Top)", "Nguyên Liệu": ing1_name, "Tỉ Lệ (%)": ing1_pct},
    {"Tầng": "Tầng Đầu (Top)", "Nguyên Liệu": ing2_name, "Tỉ Lệ (%)": ing2_pct},
    {"Tầng": "Tầng Giữa (Heart)", "Nguyên Liệu": ing3_name, "Tỉ Lệ (%)": ing3_pct},
    {"Tầng": "Tầng Giữa (Heart)", "Nguyên Liệu": ing4_name, "Tỉ Lệ (%)": ing4_pct},
    {"Tầng": "Tầng Cuối (Base)", "Nguyên Liệu": ing5_name, "Tỉ Lệ (%)": ing5_pct},
    {"Tầng": "Tầng Cuối (Base)", "Nguyên Liệu": ing6_name, "Tỉ Lệ (%)": ing6_pct},
]

df = pd.DataFrame(ingredients_data)
df["Thể Tích (mL)"] = df["Tỉ Lệ (%)"].apply(lambda p: round((total_volume * p) / 100, 2))
df["Số Giọt Ước Tính (~20 giọt/mL)"] = df["Thể Tích (mL)"].apply(lambda ml: round(ml * 20))

st.markdown("### 📊 Bảng Định Lượng Công Thức Chi Tiết")
st.dataframe(df, use_container_width=True)

# 6. Biểu đồ Radar Hồ Sơ Mùi (Scent Profile)
st.markdown("### 🕸️ Hồ Sơ Mùi Hương (Scent Profile Radar)")
categories = ['Hoa cỏ (Floral)', 'Cam chanh (Citrus)', 'Gỗ ấm (Woody)', 'Thảo mộc (Fresh)', 'Gia vị (Spicy)', 'Quyến rũ (Oriental)']

# Tính điểm ước tính từ các nốt hương
fig = go.Figure()
fig.add_trace(go.Scatterpolar(
    r=[ing3_pct + 10, ing1_pct + 15, ing5_pct + 10, ing2_pct + 10, 15, ing6_pct + 10],
    theta=categories,
    fill='toself',
    name='Hồ Sơ Mùi',
    line=dict(color='#D97706')
))
fig.update_layout(
    polar=dict(radialaxis=dict(visible=True, range=[0, 60])),
    showlegend=False,
    height=420
)
st.plotly_chart(fig, use_container_width=True)

# 7. Xuất CSV
csv_buffer = io.StringIO()
df.to_csv(csv_buffer, index=False, encoding='utf-8-sig')
csv_data = csv_buffer.getvalue().encode('utf-8-sig')

st.download_button(
    label="📥 Tải Bảng Công Thức Dưới Dạng CSV",
    data=csv_data,
    file_name=f"cong_thuc_nuoc_hoa_{total_volume}ml.csv",
    mime="text/csv",
    disabled=(total_pct != 100)
)

# 8. Danh Sách Công Thức Đã Lưu & So Sánh Phiên Bản (Session State)
st.divider()
st.markdown("### 📚 Danh Sách Công Thức Đã Lưu & So Sánh Đối Chiếu")
st.caption("Lưu tạm thời các biến thể pha chế vào st.session_state để so sánh trực quan mà không cần xuất CSV liên tục")

if "saved_formulas" not in st.session_state:
    st.session_state.saved_formulas = []

col_save1, col_save2 = st.columns([3, 1])
with col_save1:
    version_title = st.text_input("Tên phiên bản muốn lưu tạm:", value=f"Bản thử #{len(st.session_state.saved_formulas) + 1} - {selected_season} ({total_volume}mL)")
with col_save2:
    st.write("")
    st.write("")
    if st.button("💾 Lưu Phiên Bản Này"):
        st.session_state.saved_formulas.append({
            "name": version_title,
            "season": selected_season,
            "volume": total_volume,
            "top_pct": top_total,
            "heart_pct": heart_total,
            "base_pct": base_total,
            "df": df.copy(),
        })
        st.success(f"Đã lưu '{version_title}' vào danh sách tạm!")

if st.session_state.saved_formulas:
    st.write(f"Hiện có **{len(st.session_state.saved_formulas)}** công thức đã lưu tạm:")
    for idx, item in enumerate(st.session_state.saved_formulas):
        st.markdown(f"- **#{idx+1} {item['name']}** | Mùa: {item['season']} | {item['volume']}mL | Tầng: Đầu {item['top_pct']}% - Giữa {item['heart_pct']}% - Cuối {item['base_pct']}%")

    if len(st.session_state.saved_formulas) >= 2:
        st.markdown("#### ⚖️ So Sánh 2 Phiên Bản Song Song")
        names_list = [f["name"] for f in st.session_state.saved_formulas]
        col_comp1, col_comp2 = st.columns(2)
        with col_comp1:
            selA = st.selectbox("Chọn Bản A:", names_list, index=0)
            dataA = next(x for x in st.session_state.saved_formulas if x["name"] == selA)
            st.dataframe(dataA["df"][["Tầng", "Nguyên Liệu", "Tỉ Lệ (%)", "Thể Tích (mL)"]])
        with col_comp2:
            selB = st.selectbox("Chọn Bản B:", names_list, index=1)
            dataB = next(x for x in st.session_state.saved_formulas if x["name"] == selB)
            st.dataframe(dataB["df"][["Tầng", "Nguyên Liệu", "Tỉ Lệ (%)", "Thể Tích (mL)"]])

# 9. Thẩm Định Với API AI (Do GV Quản Lý - Không Nhập Khóa Vào Mã)
st.divider()
st.markdown("### 🤖 Thẩm Định Chuyên Sâu Cùng AI Master Perfumer")
st.caption("Nhóm kết nối API AI do Giảng viên quản lý thông qua biến môi trường GEMINI_API_KEY")

if st.button("✨ Gửi Công Thức Để AI Thẩm Hương"):
    if total_pct != 100:
        st.error("Vui lòng cân bằng tổng tỉ lệ về đúng 100% trước khi gửi thẩm định!")
    else:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key and "GEMINI_API_KEY" in st.secrets:
            api_key = st.secrets["GEMINI_API_KEY"]

        if not api_key:
            st.info("ℹ️ Khóa API chưa được nạp trong biến môi trường. Đang chạy bộ thẩm định mô phỏng chuyên sâu.")
            st.success("Tên Tác Phẩm: **L'Aura de Saison**\\n- Điểm hòa hợp: 92/100\\n- Phù hợp với " + selected_season + ": 90/100\\n- Lời khuyên: Công thức hài hòa, nốt hương chuyển mượt mà từ cam chanh sang hoa hồng và gỗ.")
        else:
            try:
                from google import genai
                client = genai.Client(api_key=api_key)
                prompt = f"""Bạn là một Chuyên gia Thẩm hương quốc tế.
Đánh giá công thức nước hoa:
- Mùa: {selected_season}
- Thể tích: {total_volume} mL
- Tầng đầu: {ing1_name} ({ing1_pct}%), {ing2_name} ({ing2_pct}%)
- Tầng giữa: {ing3_name} ({ing3_pct}%), {ing4_name} ({ing4_pct}%)
- Tầng cuối: {ing5_name} ({ing5_pct}%), {ing6_name} ({ing6_pct}%)

Hãy đặt 1 tên nghệ thuật tiếng Pháp + tiếng Việt, nhận xét độ hòa hợp và lời khuyên ủ lạnh."""
                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt
                )
                st.write(response.text)
            except Exception as e:
                st.error(f"Lỗi gọi API: {e}")
`;
}
