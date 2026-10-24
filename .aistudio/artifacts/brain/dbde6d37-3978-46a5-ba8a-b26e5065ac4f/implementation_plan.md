# Kế hoạch triển khai: Tối ưu hóa Giao diện Di động (Mobile App-like Experience)

## 1. Tổng quan yêu cầu & Lựa chọn từ người dùng
Dựa trên kết quả khảo sát lựa chọn phương án thiết kế di động:
1. **Điều hướng chính trên điện thoại**: **Thanh điều hướng đáy màn hình (Bottom Navigation Bar)** cố định chuẩn Native App với 4 tab chính (Trang chính, Công thức thực nghiệm, Bảng tính & CSV, Góc tư vấn AI) cùng nút truy cập nhanh phiếu thực hành.
2. **Khu vực điều chỉnh 3 tầng hương**: **Thẻ trượt cảm ứng lớn kèm bộ nút tăng giảm nhanh (+ / -)** (Touch Stepper Buttons) giúp người dùng dễ dàng bấm tinh chỉnh chính xác từng 1% hoặc 5% bằng ngón tay cái mà không sợ kéo trượt bị lệch.
3. **Vị trí mở Trợ lý giọng nói Gemini Live**: **Nút tròn nổi (Floating Action Button - FAB)** cố định ở góc dưới bên phải màn hình (phía trên thanh điều hướng đáy), luôn sẵn sàng chạm nói tức thì với hiệu ứng sóng âm động.

---

## 2. Thiết kế chi tiết & Kiến trúc thành phần

### A. Thanh điều hướng đáy di động (Mobile Bottom Navigation Bar)
- **Vị trí & Hiển thị**: Cố định ở đáy màn hình (`fixed bottom-0 inset-x-0 z-40 md:hidden`), nền kem ấm mờ sương (`bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#E8E1D5] shadow-lg`).
- **Các tab chức năng (Touch target $\ge 48\text{px}$)**:
  - **Trang chính**: Icon `Home` + nhãn "Trang chủ"
  - **Thực nghiệm**: Icon `FlaskConical` + nhãn "Thực nghiệm" (kèm badge thông số Mẫu A gốc)
  - **Bảng & CSV**: Icon `FileSpreadsheet` + nhãn "Bảng tính"
  - **Tư vấn AI**: Icon `Bot` + nhãn "Tư vấn AI"
  - **Phiếu Pop-up**: Icon `BookOpen` + nhãn "Xem phiếu"
- **Safe Area**: Thêm khoảng đệm dưới chân trang (`pb-24` trên mobile) để nội dung chính và các nút thao tác không bao giờ bị thanh đáy che khuất.

### B. Bộ thẻ trượt cảm ứng lớn & Nút Stepper (+ / -) cho 3 tầng hương (`OlfactoryPyramidSliders.tsx`)
- Trên màn hình nhỏ (`< sm`):
  - Mỗi nguyên liệu trong 6 slot (Lê, Bergamot, Hoa anh đào, Hoa nhài, Xạ hương trắng, Vanilla) được trình bày dạng **Thẻ cảm ứng độc lập (Touch Card)**.
  - Tích hợp 2 nút bấm cảm ứng lớn **`−`** (giảm 1%) và **`+`** (tăng 1%) ở 2 đầu thanh trượt, cùng nút nhấn giữ hoặc tăng nhanh 5%.
  - Thanh trượt range có chiều cao rãnh trượt $8\text{px}$ và đầu ngón tay chạm $26\text{px}$ chuẩn công thái học di động.
  - Hiển thị trực quan: Tỉ lệ %, Thể tích (mL) và Số giọt tính toán song song ngay dưới tên nguyên liệu.
  - Nút **"Tự động cân bằng 100%"** nổi bật và dễ bấm ngay bên cạnh thanh hiển thị tổng tỉ lệ.

### C. Nút tròn nổi FAB Gemini Live (`App.tsx`)
- **Vị trí**: Cố định góc dưới bên phải (`fixed right-4 bottom-20 z-40 md:hidden`).
- **Hình thức**:
  - Nút tròn đường kính $56\text{px}$ (`w-14 h-14 rounded-full`), gradient xanh lá pastel thảo mộc (`from-[#2D6344] to-[#3B7A57]`), đổ bóng sâu sang trọng.
  - Chấm sáng live pulse xanh ngọc bích phát tín hiệu sẵn sàng lắng nghe.
  - Biểu tượng `Mic` màu trắng kèm hiệu ứng sóng âm viền ngoài (`ring-4 ring-[#3B7A57]/20`).
- **Hành động**: Chạm vào lập tức mở modal **Gemini Live**, tự động kích hoạt lắng nghe giọng nói tiếng Việt tức thì mà không cần thêm thao tác phụ.

### D. Tối ưu hóa hiển thị Responsive cho Modal & Bảng biểu
- **Bottom-Sheet Modal trên di động**: Cả `VoiceAssistantModal`, `ExperimentalFormulaPopupModal` và `SavedFormulasModal` khi mở trên điện thoại sẽ chuyển sang dạng **Bottom-Sheet** bo góc trên `rounded-t-3xl max-h-[92vh]`, có thanh gạt kéo xuống dễ đóng bằng vuốt ngón tay.
- **Bảng số liệu (`FormulaTableAndCsv.tsx` & `SubWebExperimentalFormula.tsx`)**: Hỗ trợ cuộn ngang mượt mà có chỉ dẫn hoặc chế độ xem thẻ tóm tắt (Card list) thân thiện với màn hình dọc.

---

## 3. Kế hoạch từng bước triển khai

1. **Bước 1**: Cập nhật `src/components/OlfactoryPyramidSliders.tsx`:
   - Bổ sung cụm nút stepper `-` và `+` cảm ứng cho từng slot nguyên liệu trên mobile.
   - Tối ưu hóa kích thước touch target, typography và hiển thị giọt/mL gọn gàng cho điện thoại.
2. **Bước 2**: Cập nhật `src/components/Header.tsx` & Tạo thanh điều hướng đáy di động `MobileBottomNav` trong `App.tsx`:
   - Ẩn bớt thanh điều hướng ngang chật chội trên mobile và chuyển thành thanh đáy chuẩn Native.
   - Thêm nút FAB Gemini Live ở góc dưới bên phải.
3. **Bước 3**: Tối ưu hóa responsive dạng Bottom-Sheet cho các Modal:
   - `VoiceAssistantModal.tsx`: Tối ưu giao diện toàn màn hình/bottom-sheet trên điện thoại.
   - `ExperimentalFormulaPopupModal.tsx`: Tối ưu chiều cao, cuộn và xem phiếu thực nghiệm trên điện thoại.
4. **Bước 4**: Kiểm thử tổng thể (Linting, TypeScript check, Compilation) và xác nhận hoạt động mượt mà.
