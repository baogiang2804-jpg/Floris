import React, { useState } from 'react';
import {
  Sparkles,
  GraduationCap,
  CheckCircle2,
  X,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Mic,
  Volume2,
  AudioWaveform,
  BrainCircuit,
  FlaskConical,
  Scale,
  ClipboardCheck,
  Sliders,
  Smartphone,
  Keyboard,
  AlertTriangle,
  Bot,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Layers,
  Eye,
} from 'lucide-react';

interface WelcomeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVoiceWidget?: () => void;
  onNavigatePage?: (page: 'main' | 'experimental' | 'csv' | 'ai' | 'python') => void;
}

type GuideTab = 'all' | 'presentation' | 'chemistry' | 'tools';

export const WelcomeGuideModal: React.FC<WelcomeGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenVoiceWidget,
  onNavigatePage,
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [activeTab, setActiveTab] = useState<GuideTab>('all');
  const [expandedPresStep, setExpandedPresStep] = useState<string | null>('Bước 01');
  const [expandedChemCard, setExpandedChemCard] = useState<number | null>(0);
  const [expandedManualStep, setExpandedManualStep] = useState<string | null>('01');

  if (!isOpen) return null;

  const handleConfirmClose = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('floris_hide_guide_v3', 'true');
      } catch (e) {
        console.error(e);
      }
    }
    onClose();
  };

  const presentationSteps = [
    {
      step: 'Bước 01',
      badge: 'Công thức thực nghiệm gốc',
      title: 'Hiển Thị Công Thức Thực Hành Nhóm Đã Pha Chế (Trước Cả Hướng Dẫn)',
      desc: 'Ngay khi mở ứng dụng, hệ thống hiển thị báo cáo "∼✿∼ THỰC HÀNH LÀM NƯỚC HOA ∼✿∼" (Sản phẩm Floris • Chủ đề Mùa Xuân • 10,00 mL) gồm 6 nguyên liệu: Lê 🍐 (15%/3%), Bergamot 🍋 (15%/3%), Hoa anh đào 🌸 (20%/4%), Hoa nhài 🌼 (20%/4%), Xạ hương trắng 🤍 (15%/3%), Vanilla 🍦 (15%/3%) cùng 3 mẫu thực nghiệm Mẫu A (Gốc), Mẫu B (Tươi hơn), Mẫu C (Dịu/Ngọt hơn).',
      specificDetails: [
        'Định lượng chuẩn 10,00 mL: Lê 0,30 mL + Bergamot 0,30 mL + Hoa anh đào 0,40 mL + Hoa nhài 0,40 mL + Xạ hương trắng 0,30 mL + Vanilla 0,30 mL = 2,00 mL hỗn hợp hương (20%) pha với 8,00 mL Ethanol 95% (80%).',
        'Thao tác khi thuyết trình: Bấm vào từng dòng nguyên liệu hoặc từng mẫu A, B, C trong Pop-up Công thức thực nghiệm để trình chiếu cơ sở Hóa học và kết quả theo dõi sau 24h, 48h, 72h.',
      ],
      icon: <FlaskConical className="w-5 h-5 text-emerald-400" />,
      border: 'border-emerald-500/30 bg-emerald-950/15',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      step: 'Bước 02',
      badge: 'Tương tác với AI',
      title: 'Khách Tham Quan Chọn Câu Hỏi Hoặc Nhập Yêu Cầu Cải Tiến',
      desc: 'Tại Phần 2 ("AI Tư Vấn Cải Tiến Nước Hoa"), người dùng chọn nhanh 1 trong 5 câu hỏi mẫu (Tươi mát hơn, Hương hoa rõ hơn, Giảm cảm giác nồng, Tăng sắc thái hương gỗ, Thay đổi mùi nhưng giữ đặc trưng ban đầu) hoặc tự nhập yêu cầu / nói qua Micro.',
      specificDetails: [
        '5 yêu cầu gợi ý sẵn: (1) Mùi tươi mát hơn — đối chiếu với Mẫu B; (2) Hương hoa rõ hơn; (3) Giảm cảm giác nồng; (4) Tăng sắc thái hương gỗ; (5) Thay đổi mùi dịu ngọt hơn nhưng giữ đặc trưng ban đầu — đối chiếu với Mẫu C.',
        'Thao tác khi thuyết trình: Mời giáo viên hoặc các bạn nhóm khác bấm chọn 1 câu hỏi bất kỳ hoặc nhập yêu cầu riêng rồi nhấn "Gửi Yêu Cầu Để AI Đề Xuất Công Thức Mới".',
      ],
      icon: <Bot className="w-5 h-5 text-amber-400" />,
      border: 'border-amber-500/30 bg-amber-950/15',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      step: 'Bước 03',
      badge: 'Tự động kiểm tra 100%',
      title: 'AI Đề Xuất Công Thức Mới & Dự Đoán Giả Thuyết Mùi Hương',
      desc: 'Hệ thống tự động kiểm tra toán học (bắt buộc tổng tỉ lệ = 100%) trước khi hiển thị. AI giải thích lý do điều chỉnh dựa trên cấu trúc phân tử, độ bay hơi và đưa ra dự đoán mùi hương mới theo 3 giai đoạn (gắn nhãn rõ là Giả thuyết dự đoán lý thuyết).',
      specificDetails: [
        'Kiểm định tự động: Thuật toán kiểm tra tổng % hỗn hợp hương = 100% (tương ứng 2,00 mL hương liệu + 8,00 mL Ethanol 95% = 10,00 mL) và kiểm tra giới hạn IFRA Category 4 của từng chất.',
        'Lưu ý khoa học: Kết quả mùi hương AI đưa ra là giả thuyết dự đoán dựa trên áp suất hơi và nhóm chức hữu cơ, cần được học sinh kiểm chứng bằng thực nghiệm.',
      ],
      icon: <Scale className="w-5 h-5 text-cyan-400" />,
      border: 'border-cyan-500/30 bg-cyan-950/15',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    {
      step: 'Bước 04',
      badge: 'Đối chiếu trực quan',
      title: 'So Sánh Công Thức Gốc vs Công Thức AI Đề Xuất',
      desc: 'Bảng đối chiếu chi tiết từng thành phần: Tỉ lệ gốc (%) → Tỉ lệ AI đề xuất (%) → Phần trăm thay đổi (Δ%) → Nồng độ thực tế trong sản phẩm hoàn chỉnh (%) và lý do điều chỉnh của từng nguyên liệu. Hỗ trợ nạp thẳng công thức mới vào bàn pha chế.',
      specificDetails: [
        'Các thông số hiển thị rõ ràng: Tỉ lệ gốc (% HH & % TP), Tỉ lệ mới (% HH & % TP), Độ lệch Δ%, Thể tích mL trên 10,00 mL và giải thích lý do tăng/giảm từng chất.',
        'Có thể bấm nút "Áp Dụng Công Thức AI Vào Bàn Pha Chế" để cập nhật ngay biểu đồ Radar cảm quan 7 chiều.',
      ],
      icon: <Layers className="w-5 h-5 text-purple-400" />,
      border: 'border-purple-500/30 bg-purple-950/15',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    {
      step: 'Bước 05',
      badge: 'Phản biện & Xuất báo cáo',
      title: 'Nhóm Học Sinh Nhận Xét Đề Xuất & Xuất File CSV / Mã QR',
      desc: 'Nhóm trả lời 4 câu hỏi phản biện: (1) Đề xuất có hợp lý không? (2) Kiến thức Hóa học nào giải thích sự thay đổi? (3) Nhóm đồng ý hay không đồng ý? (4) Cần tiến hành thực nghiệm đối chứng gì? Sau đó xuất file báo cáo .CSV hoặc tạo Mã QR chia sẻ.',
      specificDetails: [
        '4 tiêu chí phản biện của học sinh: Đánh giá tính hợp lý của AI, vận dụng kiến thức về độ bay hơi / phân tử khối / liên kết hydro / định luật Raoult, nêu quan điểm đồng ý hoặc chỉnh sửa, và đề xuất quy trình pha mẫu đối chứng 24h–72h.',
        'Xuất kết quả: Hỗ trợ tải file báo cáo .CSV đầy đủ cả công thức gốc, công thức AI và phần nhận xét của nhóm.',
      ],
      icon: <ClipboardCheck className="w-5 h-5 text-rose-400" />,
      border: 'border-rose-500/30 bg-rose-950/15',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
  ];

  const manualDesignSteps = [
    {
      num: '01',
      title: 'Chọn Mùa Khí Hậu (Xuân, Hạ, Thu, Đông)',
      desc: 'Gợi ý tỉ lệ vàng cho 3 tầng hương phù hợp nhiệt độ & độ ẩm hoặc tải nhanh công thức mẫu theo mùa.',
      specificNote: 'Mặc định khi mở ứng dụng là Chủ đề Mùa Xuân (Sản phẩm Floris: 30% Hương đầu : 40% Hương giữa : 30% Hương cuối). Bạn có thể chuyển sang Mùa Hạ, Thu, Đông để khảo sát sự thay đổi tỉ lệ tầng hương theo nhiệt độ môi trường.',
      icon: '🌸',
    },
    {
      num: '02',
      title: 'Định Lượng Thể Tích (mL) & Nồng Độ Pha Loãng',
      desc: 'Chọn thể tích chai (10ml – 100ml) và nồng độ (EDC 5%, EDT 12%, EDP 20%, Extrait 30%). Tự động tách mL Cốt Hương & mL Cồn.',
      specificNote: 'Quy chuẩn thực nghiệm của nhóm là 10,00 mL ở nồng độ EDP 20% (tức 2,00 mL hỗn hợp hương + 8,00 mL Ethanol 95%). Khi thay đổi thể tích chai, ứng dụng tự động nhân chia chính xác số mL và số giọt của từng chất.',
      icon: '🧴',
    },
    {
      num: '03',
      title: 'Kéo Thanh Trượt 3 Tầng Hương (Thẻ Xếp Chồng Trên Điện Thoại)',
      desc: 'Trên di động, các thanh trượt tự động chuyển sang dạng Thẻ xếp chồng (Stacked Cards) kèm nút [-5%] [-1%] [+1%] [+5%] dễ thao tác bằng ngón tay.',
      specificNote: 'Mỗi thẻ nguyên liệu đều có nút bấm mở rộng để xem hợp chất hóa học chính, độ bay hơi, ghi chép quan sát thực nghiệm và giới hạn IFRA.',
      icon: '⚖️',
    },
    {
      num: '04',
      title: 'Biểu Đồ Radar Cảm Quan 7 Chiều & Kiểm Định IFRA',
      desc: 'Quan sát 7 chiều mùi hương (Tươi mát, Cam chanh, Nồng nàn, Ngọt ngào, Gỗ trầm, Hoa cỏ, Quyến rũ) và cảnh báo an toàn IFRA.',
      specificNote: 'Biểu đồ tự động cập nhật theo thời gian thực khi bạn kéo thanh trượt hoặc nạp Mẫu A, Mẫu B, Mẫu C lên bàn pha chế.',
      icon: '🕸️',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#2D3A2F]/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-[#FAF8F5] border-t sm:border border-[#E5DFD5] rounded-t-3xl sm:rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[94vh] sm:max-h-[92vh] flex flex-col animate-fadeIn text-[#2D3A2F]">
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 rounded-full bg-[#D8D1C5] mx-auto mt-2.5 sm:hidden" />
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-serif font-bold text-slate-100">
                  Bảng Hướng Dẫn Sử Dụng & Thuyết Trình Floris
                </h2>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  Bấm Vào Mỗi Mục Để Xem Chi Tiết
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Hướng dẫn quy trình thực nghiệm Hóa học, tương tác AI tư vấn cải tiến, phân biệt nồng độ & điều khiển đa nền tảng
              </p>
            </div>
          </div>

          <button
            onClick={handleConfirmClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 flex items-center justify-center transition-all shrink-0 border border-slate-700"
            title="Đóng bảng hướng dẫn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Tất Cả Nội Dung</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('presentation')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'presentation'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>1. Quy Trình Thuyết Trình & AI (5 Bước)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chemistry')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'chemistry'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>2. Chuẩn Hóa Học & An Toàn IFRA</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tools')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'tools'
                ? 'bg-purple-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>3. Bàn Pha Chế, Giọng Nói & 3 Trang Web</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* BANNER CREDIT TỔ 1 LỚP 12A13 THPT NTMK */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-950 border-2 border-amber-500/50 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-inner">
                  <GraduationCap className="w-6 h-6 text-amber-400" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                      Dự Án Hóa Học Thực Nghiệm & Ứng Dụng AI
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Năm học 2025 - 2026
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-serif font-bold text-amber-200">
                    AI do tổ 1 lớp 12A13 THPT NTMK thiết kế
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Mục tiêu trình diễn:</strong> Khách tham quan đưa ra yêu cầu thay đổi mùi nước hoa từ công thức thực nghiệm gốc →
                    AI phân tích & đề xuất công thức cải tiến đạt chuẩn 100% → Học sinh phân tích cơ sở Hóa học, đánh giá giả thuyết và xuất báo cáo.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================================
              PHẦN 1: QUY TRÌNH THUYẾT TRÌNH & TƯƠNG TÁC AI (BẤM VÀO MỖI BƯỚC ĐỂ XEM CỤ THỂ)
             ===================================================================== */}
          {(activeTab === 'all' || activeTab === 'presentation') && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs sm:text-sm font-mono uppercase tracking-wider text-emerald-300 font-bold">
                    Phần 1 • Kịch Bản 5 Bước Thuyết Trình & Tương Tác AI (Bấm Vào Mỗi Bước Để Xem Nội Dung Cụ Thể)
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Chọn từng bước để mở rộng hướng dẫn chi tiết
                </span>
              </div>

              <div className="space-y-2.5">
                {presentationSteps.map((item) => {
                  const isExpanded = expandedPresStep === item.step;
                  return (
                    <div
                      key={item.step}
                      className={`rounded-2xl border ${item.border} transition-all overflow-hidden`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedPresStep((prev) => (prev === item.step ? null : item.step))
                        }
                        className="w-full p-3.5 sm:p-4 text-left flex items-start justify-between gap-3.5 cursor-pointer"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                            {item.icon}
                          </div>
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-amber-300 border border-amber-500/30">
                                {item.step}
                              </span>
                              <span
                                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                              >
                                {item.badge}
                              </span>
                              <h5 className="font-bold text-xs sm:text-sm text-slate-100">
                                {item.title}
                              </h5>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>

                        <span className="text-xs font-mono text-amber-300 shrink-0 flex items-center gap-1 mt-1">
                          {isExpanded ? (
                            <>
                              <span>Thu gọn</span>
                              <ChevronUp className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              <span>Cụ thể</span>
                              <ChevronDown className="w-4 h-4" />
                            </>
                          )}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-2.5 border-t border-slate-800/80 bg-slate-950/85 space-y-1.5 text-xs text-slate-200 animate-fadeIn">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-bold block">
                            Nội dung cụ thể & Thao tác thực hiện tại {item.step}:
                          </span>
                          {item.specificDetails.map((detail, dIdx) => (
                            <div key={dIdx} className="flex items-start gap-2 leading-relaxed">
                              <span className="text-amber-400 font-bold">•</span>
                              <span>{detail}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =====================================================================
              PHẦN 2: KIẾN THỨC HÓA HỌC & CHUẨN AN TOÀN IFRA (BẤM VÀO MỖI MỤC ĐỂ XEM CỤ THỂ)
             ===================================================================== */}
          {(activeTab === 'all' || activeTab === 'chemistry') && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-cyan-500/40 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-mono uppercase tracking-wider text-cyan-300 font-bold">
                      Phần 2 • Bảng Ghi Nhớ Kiến Thức Hóa Học & Kiểm Định An Toàn (Bấm Vào Mỗi Mục Để Xem Cụ Thể)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Ba nguyên tắc khoa học cốt lõi đã được chuẩn hóa trong toàn bộ phần mềm
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* Card 1: Phân biệt Tỉ lệ hợp hương vs Nồng độ thành phẩm */}
                <div
                  onClick={() => setExpandedChemCard((prev) => (prev === 0 ? null : 0))}
                  className={`p-3.5 rounded-xl border space-y-2 cursor-pointer transition-all ${
                    expandedChemCard === 0
                      ? 'bg-cyan-950/30 border-cyan-400 shadow-md'
                      : 'bg-slate-900 border-slate-800 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">
                      1. Phân Biệt Nồng Độ
                    </span>
                    <span className="text-[10px] font-mono text-cyan-300 flex items-center gap-0.5">
                      {expandedChemCard === 0 ? 'Đang mở' : 'Xem cụ thể'}
                      <ChevronDown className="w-3 h-3" />
                    </span>
                  </div>
                  <div className="font-bold text-slate-100">Tỉ Lệ Hợp Hương vs Thành Phẩm</div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    • <strong>Tỉ lệ trong hợp hương (%):</strong> Phần trăm mỗi tinh dầu trong hỗn hợp cốt hương nguyên chất (Tổng 6 chất = <strong>100%</strong> = 2,00 mL).
                  </p>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    • <strong>Nồng độ trong thành phẩm hoàn chỉnh (%):</strong> Nồng độ thực tế sau khi pha với 8,00 mL Ethanol 95% (Tổng = <strong>20%</strong>).
                  </p>
                  {expandedChemCard === 0 && (
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-cyan-500/30 font-mono text-[10px] text-amber-300 space-y-1 animate-fadeIn">
                      <div>Nồng độ TP (%) = [Tỉ lệ HH (%) × 20%] / 100</div>
                      <div className="text-slate-300">
                        • VD 1: Lê chiếm 15% hỗn hợp hương × 20% = 3% thành phẩm (0,30 mL / 10mL).
                        <br />• VD 2: Hoa anh đào chiếm 20% hỗn hợp hương × 20% = 4% thành phẩm (0,40 mL / 10mL).
                      </div>
                    </div>
                  )}
                </div>

                {/* Card 2: Giới hạn an toàn IFRA có trích dẫn */}
                <div
                  onClick={() => setExpandedChemCard((prev) => (prev === 1 ? null : 1))}
                  className={`p-3.5 rounded-xl border space-y-2 cursor-pointer transition-all ${
                    expandedChemCard === 1
                      ? 'bg-amber-950/30 border-amber-400 shadow-md'
                      : 'bg-slate-900 border-slate-800 hover:border-amber-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                      2. Chuẩn IFRA Cat.4
                    </span>
                    <span className="text-[10px] font-mono text-amber-300 flex items-center gap-0.5">
                      {expandedChemCard === 1 ? 'Đang mở' : 'Xem cụ thể'}
                      <ChevronDown className="w-3 h-3" />
                    </span>
                  </div>
                  <div className="font-bold text-slate-100">Giới Hạn An Toàn Có Trích Dẫn</div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    • Mọi giới hạn an toàn trên da đều tra cứu từ <strong>IFRA 51st Amendment (Category 4 - Fine Fragrance)</strong> và <em>Tisserand & Young</em>, không tự đặt cảm tính.
                  </p>
                  {expandedChemCard === 1 && (
                    <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-[10px] text-amber-200 leading-relaxed animate-fadeIn">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 inline mr-1" />
                      <strong>Nội dung cụ thể về Bergamot:</strong> Tinh dầu Cam Bergamot ép lạnh tự nhiên giới hạn tối đa <strong>0,4%</strong> trên da do chứa <em>Bergapten</em> gây quang độc tính. Ở mức 3%–4% thành phẩm (0,30–0,40 mL), cần kiểm tra SDS và dùng <strong>Bergamot FCF (đã tách furocoumarin)</strong>.
                    </div>
                  )}
                </div>

                {/* Card 3: Dự đoán mùi hương là Giả thuyết */}
                <div
                  onClick={() => setExpandedChemCard((prev) => (prev === 2 ? null : 2))}
                  className={`p-3.5 rounded-xl border space-y-2 cursor-pointer transition-all ${
                    expandedChemCard === 2
                      ? 'bg-purple-950/30 border-purple-400 shadow-md'
                      : 'bg-slate-900 border-slate-800 hover:border-purple-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold">
                      3. Giả Thuyết Khoa Học
                    </span>
                    <span className="text-[10px] font-mono text-purple-300 flex items-center gap-0.5">
                      {expandedChemCard === 2 ? 'Đang mở' : 'Xem cụ thể'}
                      <ChevronDown className="w-3 h-3" />
                    </span>
                  </div>
                  <div className="font-bold text-slate-100">Dự Đoán vs Thực Nghiệm</div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    • Dự đoán mùi hương của AI dựa trên <strong>áp suất hơi, phân tử khối (Mw), liên kết hydro và nhóm chức hữu cơ</strong> (ester, terpene, alcohol, musk).
                  </p>
                  {expandedChemCard === 2 && (
                    <div className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-500/30 text-[10px] text-purple-200 leading-relaxed animate-fadeIn">
                      • <strong>Nội dung cụ thể:</strong> Đây là <strong>Giả thuyết dự đoán lý thuyết</strong>, không thay thế kết quả thực nghiệm. Nhóm cần pha mẫu đối chứng (như Mẫu A, B, C), ủ hương ở nơi mát tránh sáng và đánh giá sau <strong>24h, 48h, 72h</strong>.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              PHẦN 3: BÀN PHA CHẾ THỦ CÔNG, WIDGET GIỌNG NÓI, 3 WEB & PHÍM TẮT
             ===================================================================== */}
          {(activeTab === 'all' || activeTab === 'tools') && (
            <div className="space-y-4">
              {/* 3A. Bàn pha chế thủ công & giao diện điện thoại */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs sm:text-sm font-mono uppercase tracking-wider text-amber-300 font-bold">
                      Phần 3 • Bàn Thiết Kế Thủ Công 3 Tầng Hương (Bấm Vào Mỗi Mục Để Xem Cụ Thể)
                    </h4>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] text-cyan-300 font-mono bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                    <Smartphone className="w-3 h-3" /> Hỗ trợ Thẻ Xếp Chồng (Stacked Cards) trên Điện Thoại
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {manualDesignSteps.map((step) => {
                    const isExpanded = expandedManualStep === step.num;
                    return (
                      <div
                        key={step.num}
                        onClick={() =>
                          setExpandedManualStep((prev) => (prev === step.num ? null : step.num))
                        }
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isExpanded
                            ? 'bg-amber-950/25 border-amber-400 shadow-md'
                            : 'bg-slate-950/70 border-slate-800 hover:border-amber-500/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3">
                            <div className="text-lg shrink-0 p-2 rounded-lg bg-slate-900 border border-slate-800">
                              {step.icon}
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                  {step.num}
                                </span>
                                <h5 className="font-bold text-xs text-slate-100">{step.title}</h5>
                              </div>
                              <p className="text-[11px] text-slate-400 leading-relaxed">
                                {step.desc}
                              </p>
                            </div>
                          </div>
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-amber-300 shrink-0 mt-1 transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </div>

                        {isExpanded && (
                          <div className="mt-2.5 pt-2 border-t border-amber-500/20 text-[11px] text-amber-100 leading-relaxed animate-fadeIn">
                            <strong className="text-amber-300 font-mono">Chi tiết cụ thể:</strong>{' '}
                            {step.specificNote}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3B. Hướng dẫn Widget Nhận diện giọng nói AI */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/50 via-slate-900 to-slate-950 border border-rose-500/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
                      <Mic className="w-5 h-5 text-rose-400" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-rose-300 font-bold">
                        Tính Năng Nâng Cao • Có Widget Riêng Biệt
                      </span>
                      <h4 className="text-sm font-serif font-bold text-slate-100">
                        Widget Nhận Diện Giọng Nói AI (Voice Assistant)
                      </h4>
                    </div>
                  </div>

                  {onOpenVoiceWidget && (
                    <button
                      type="button"
                      onClick={() => {
                        handleConfirmClose();
                        onOpenVoiceWidget();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-md"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>Mở Widget Giọng Nói Ngay</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-slate-200 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 text-rose-300">
                    <Mic className="w-3 h-3" /> 1. Nói yêu cầu vào Micro
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 text-amber-300">
                    <AudioWaveform className="w-3 h-3" /> 2. Chuyển giọng nói thành văn bản
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 text-purple-300">
                    <BrainCircuit className="w-3 h-3" /> 3. AI tính công thức mới = 100%
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 text-emerald-300">
                    <Volume2 className="w-3 h-3" /> 4. Phát giọng nói & Hiện bảng so sánh
                  </span>
                </div>
              </div>

              {/* 3C. Sơ đồ 1 Trang Web Chính & 2 Trang Web Phụ Chuyên Biệt */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                  Sơ Đồ Điều Hướng: 1 Trang Web Chính & 2 Trang Web Phụ Chuyên Biệt (Bấm Để Chuyển Trang)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                  <div
                    onClick={() => {
                      if (onNavigatePage) {
                        onNavigatePage('main');
                        handleConfirmClose();
                      }
                    }}
                    className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/30 hover:border-amber-400 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-amber-400 font-bold">
                        🏠 WEB CHÍNH
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="font-semibold text-slate-100 mt-1">
                      Thuyết Trình AI + Bàn Thiết Kế & Hướng Dẫn
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Hiển thị công thức thực nghiệm gốc, tương tác AI cải tiến, kéo thanh trượt 3 tầng hương và xem Radar.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      if (onNavigatePage) {
                        onNavigatePage('csv');
                        handleConfirmClose();
                      }
                    }}
                    className="p-3.5 rounded-xl bg-slate-900 border border-cyan-500/30 hover:border-cyan-400 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">
                        📊 WEB PHỤ 1
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="font-semibold text-slate-100 mt-1">
                      Nhập Công Thức & Xuất / Nhập CSV
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Nhập bảng công thức nhanh, tải file .CSV từ máy tính lên (Import) và xuất bảng định lượng .CSV.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      if (onNavigatePage) {
                        onNavigatePage('ai');
                        handleConfirmClose();
                      }
                    }}
                    className="p-3.5 rounded-xl bg-slate-900 border border-purple-500/30 hover:border-purple-400 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-purple-400 font-bold">
                        🤖 WEB PHỤ 2
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="font-semibold text-slate-100 mt-1">
                      Chuyên Gia AI Thẩm Định & Mã QR
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Không gian riêng dành cho AI thẩm định chuyên sâu, tạo mã QR để các nhóm khác quét tương tác.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      if (onNavigatePage) {
                        onNavigatePage('python');
                        handleConfirmClose();
                      }
                    }}
                    className="p-3.5 rounded-xl bg-slate-900 border border-[#FF4B4B]/40 hover:border-[#FF4B4B] cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#FF4B4B] font-bold">
                        🐍 WEB PHỤ 3
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#FF4B4B] group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="font-semibold text-slate-100 mt-1">
                      Mô Hình App Python (Streamlit)
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Chạy trực tiếp app1_8ba4d2ea.py trên web, kéo thanh trượt an toàn, xuất CSV &amp; đồng bộ công thức.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3D. Phím tắt bàn phím & Mũi tên thu gọn */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Keyboard className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Phím tắt nhanh:</strong>{' '}
                    <code className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300 font-mono text-[11px]">
                      Ctrl + S
                    </code>{' '}
                    Lưu nhanh •{' '}
                    <code className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300 font-mono text-[11px]">
                      Ctrl + Z
                    </code>{' '}
                    Hoàn tác •{' '}
                    <code className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300 font-mono text-[11px]">
                      Ctrl + E
                    </code>{' '}
                    Xuất CSV.
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Mẹo: Bấm nút <strong>mũi tên Thu gọn (▲/▼)</strong> ở thanh Header để mở rộng không gian trình chiếu.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
            />
            <span>Không tự động bật bảng hướng dẫn khi tải lại trang</span>
          </label>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenVoiceWidget && (
              <button
                type="button"
                onClick={() => {
                  handleConfirmClose();
                  onOpenVoiceWidget();
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Mic className="w-3.5 h-3.5 text-rose-400" />
                <span>Mở Giọng Nói AI</span>
              </button>
            )}

            <button
              onClick={handleConfirmClose}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-900/30 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>Đã Hiểu • Bắt Đầu Thuyết Trình</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
