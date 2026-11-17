import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  X,
  BookOpen,
  ShieldCheck,
  Mic,
  FlaskConical,
  Scale,
  ClipboardCheck,
  Sliders,
  Bot,
  ChevronRight,
  Layers,
  Eye,
} from 'lucide-react';
import { SpringAccordion } from './SpringAccordion';

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
      step: '01',
      badge: 'Công thức gốc',
      title: 'Xem mẫu thực nghiệm 10 mL',
      detail: 'Gồm Mẫu A (Gốc 10% cốt), Mẫu B (Tươi hơn 20% cốt) và Mẫu C (Dịu ngọt 20% cốt).',
      icon: <FlaskConical className="w-4 h-4 text-[#16A34A]" />,
      tone: 'leaf' as const,
    },
    {
      step: '02',
      badge: 'Đặt yêu cầu',
      title: 'Chọn gợi ý hoặc nói qua Mic',
      detail: 'Dùng câu mẫu có sẵn hoặc tự nói yêu cầu thay đổi mùi hương cho AI xử lý.',
      icon: <Bot className="w-4 h-4 text-[#EC4899]" />,
      tone: 'sakura' as const,
    },
    {
      step: '03',
      badge: 'Chuẩn 100%',
      title: 'AI cân chỉnh & dự đoán giả thuyết',
      detail: 'Tự động giữ tổng 100% cốt hương và kiểm tra giới hạn an toàn IFRA Cat.4.',
      icon: <Scale className="w-4 h-4 text-[#D97706]" />,
      tone: 'butter' as const,
    },
    {
      step: '04',
      badge: 'Đối chiếu',
      title: 'So sánh thanh tỷ lệ & Radar',
      detail: 'Xem ngay sự thay đổi giữa mẫu gốc và mẫu đề xuất qua biểu đồ trực quan.',
      icon: <Layers className="w-4 h-4 text-[#EC4899]" />,
      tone: 'sakura' as const,
    },
    {
      step: '05',
      badge: 'Xuất báo cáo',
      title: 'Phản biện & Tải CSV / QR',
      detail: 'Ghi nhận xét nhóm học sinh và xuất bảng công thức CSV chuẩn Excel.',
      icon: <ClipboardCheck className="w-4 h-4 text-[#16A34A]" />,
      tone: 'leaf' as const,
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Hướng dẫn sử dụng Floris"
      className="fixed inset-0 z-50 bg-[#2B342D]/45 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
    >
      <div className="bg-[#FFFDF8] border-t sm:border-2 border-[#FBCFE8] rounded-t-3xl sm:rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[94vh] sm:max-h-[90vh] flex flex-col animate-fadeIn text-[#2B342D]">
        <div className="w-12 h-1.5 rounded-full bg-[#F9A8D4] mx-auto mt-2.5 sm:hidden" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#F5DCE4] bg-gradient-to-r from-[#FFF1F5] via-white to-[#ECFDF3] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FCE7F3] border border-[#F9A8D4] flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-[#EC4899]" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-[#15803D] border border-[#BBF7D0] text-[11px] font-bold">
                🌸 Hướng dẫn nhanh
              </span>
              <h2 className="text-base sm:text-xl font-bold text-[#2B342D] mt-0.5">
                Cẩm Nang Sử Dụng Floris
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirmClose}
            aria-label="Đóng hướng dẫn"
            className="w-9 h-9 rounded-full bg-white hover:bg-[#FCE7F3] text-[#5C6B5F] hover:text-[#BE185D] flex items-center justify-center border border-[#F3D5E0]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Pills */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#FFF5F8] border-b border-[#F5DCE4] flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'Tất cả', icon: <Eye className="w-3.5 h-3.5" /> },
            { id: 'presentation', label: '5 Bước trình diễn', icon: <FlaskConical className="w-3.5 h-3.5" /> },
            { id: 'chemistry', label: 'Chuẩn IFRA', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
            { id: 'tools', label: 'Bản đồ tính năng', icon: <Sliders className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as GuideTab)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 border ${
                activeTab === tab.id
                  ? 'bg-[#EC4899] text-white border-[#EC4899]'
                  : 'bg-white text-[#5C6B5F] border-[#F3D5E0] hover:border-[#F9A8D4]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* 5 Steps */}
          {(activeTab === 'all' || activeTab === 'presentation') && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#2B342D] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#EC4899]" />
                  <span>Quy trình 5 bước</span>
                </h3>
                <span className="text-[11px] font-bold text-[#BE185D] bg-[#FCE7F3] px-2.5 py-0.5 rounded-full">
                  Tổ 1 · 12A13
                </span>
              </div>

              <div className="space-y-2">
                {presentationSteps.map((st) => (
                  <SpringAccordion
                    key={st.step}
                    title={`Bước ${st.step}: ${st.title}`}
                    badge={st.badge}
                    tone={st.tone}
                    icon={st.icon}
                  >
                    <p className="text-xs leading-relaxed text-[#39403A]">{st.detail}</p>
                  </SpringAccordion>
                ))}
              </div>
            </div>
          )}

          {/* Chemistry & IFRA */}
          {(activeTab === 'all' || activeTab === 'chemistry') && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#FFF5F8] border border-[#FBCFE8] space-y-1.5">
                <span className="px-2 py-0.5 rounded-full bg-white text-[#BE185D] text-[10px] font-bold inline-block">
                  1. Nồng độ
                </span>
                <p className="font-bold text-[#2B342D]">Hợp hương vs Thành phẩm</p>
                <p className="text-[11px] text-[#5C6B5F]">
                  Nồng độ TP (%) = [% trong cốt × Nồng độ chai] / 100.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FFFDF0] border border-[#FDE68A] space-y-1.5">
                <span className="px-2 py-0.5 rounded-full bg-white text-[#92400E] text-[10px] font-bold inline-block">
                  2. Chuẩn IFRA
                </span>
                <p className="font-bold text-[#2B342D]">An toàn Category 4</p>
                <p className="text-[11px] text-[#5C6B5F]">
                  Đối chiếu ngưỡng cho phép từng tinh dầu trên da (IFRA 51st).
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F3FDF6] border border-[#BBF7D0] space-y-1.5">
                <span className="px-2 py-0.5 rounded-full bg-white text-[#15803D] text-[10px] font-bold inline-block">
                  3. Thực chứng
                </span>
                <p className="font-bold text-[#2B342D]">Ủ hương 24h – 72h</p>
                <p className="text-[11px] text-[#5C6B5F]">
                  Dự đoán của AI luôn cần đối chứng bằng mẫu pha thực tế.
                </p>
              </div>
            </div>
          )}

          {/* Sub-pages Map (Accessible <button> cards!) */}
          {(activeTab === 'all' || activeTab === 'tools') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#2B342D]">Chuyển nhanh không gian</h3>
                {onOpenVoiceWidget && (
                  <button
                    type="button"
                    onClick={() => {
                      handleConfirmClose();
                      onOpenVoiceWidget();
                    }}
                    className="px-3 py-1.5 rounded-full bg-[#EC4899] text-white text-xs font-bold flex items-center gap-1"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Mở giọng nói</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                {[
                  { page: 'main' as const, emoji: '🏠', label: 'Bàn pha chế', sub: 'Thiết kế 3 tầng' },
                  { page: 'experimental' as const, emoji: '🧪', label: 'Thực nghiệm', sub: 'Mẫu A · B · C' },
                  { page: 'csv' as const, emoji: '📊', label: 'CSV Studio', sub: 'Nhập & xuất file' },
                  { page: 'ai' as const, emoji: '✨', label: 'AI Studio', sub: 'Thẩm định & QR' },
                ].map((nav) => (
                  <button
                    key={nav.page}
                    type="button"
                    onClick={() => {
                      if (onNavigatePage) {
                        onNavigatePage(nav.page);
                        handleConfirmClose();
                      }
                    }}
                    className="p-3.5 rounded-2xl bg-white hover:bg-[#FFF5F8] border border-[#F3D5E0] hover:border-[#F472B6] text-left transition-all flex items-center justify-between"
                  >
                    <div>
                      <span className="text-base block">{nav.emoji}</span>
                      <span className="font-bold text-[#2B342D] block mt-1">{nav.label}</span>
                      <span className="text-[11px] text-[#5C6B5F]">{nav.sub}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#EC4899] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#F5DCE4] bg-[#FFF5F8] flex flex-col sm:flex-row items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-[#5C6B5F] cursor-pointer">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="accent-[#EC4899] w-4 h-4 rounded"
            />
            <span>Không hiện lại khi mở trang</span>
          </label>

          <button
            type="button"
            onClick={handleConfirmClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Đã hiểu 🌸</span>
          </button>
        </div>
      </div>
    </div>
  );
};
