import streamlit as st
import pandas as pd

# --- Cấu hình trang ---
st.set_page_config(page_title="Pha Chế Nước Hoa", page_icon="🌸", layout="centered")
st.title("🌸 Hệ Thống Phối Trộn Nước Hoa")

# --- 1. ĐỌC BẢNG NGUYÊN LIỆU ---
st.header("1. Dữ liệu nguyên liệu")
st.write("Tải lên bảng nguyên liệu do giáo viên cung cấp (CSV hoặc Excel).")

# Tải file từ máy tính
uploaded_file = st.file_uploader("Chọn file CSV hoặc Excel", type=['csv', 'xlsx'])

# Dữ liệu mẫu cập nhật (đã loại bỏ Chanh vàng)
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