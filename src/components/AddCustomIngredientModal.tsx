import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  X,
  FlaskConical,
  MapPin,
  Dna,
  Wind,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import { PerfumeIngredient } from '../data/perfumeData';
import { FormulaSlot } from '../utils/perfumeCalculations';

interface AddCustomIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSlotKey?: FormulaSlot['key'] | null;
  targetTier?: 'top' | 'heart' | 'base';
  onAddIngredient: (ingredient: PerfumeIngredient, slotKey?: FormulaSlot['key']) => void;
}

export const AddCustomIngredientModal: React.FC<AddCustomIngredientModalProps> = ({
  isOpen,
  onClose,
  targetSlotKey,
  targetTier = 'heart',
  onAddIngredient,
}) => {
  const [name, setName] = useState('');
  const [origin, setOrigin] = useState('');
  const [mainComponent, setMainComponent] = useState('');
  const [scentCharacter, setScentCharacter] = useState('');
  const [tier, setTier] = useState<'top' | 'heart' | 'base'>(targetTier);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (targetTier) setTier(targetTier);
  }, [targetTier]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập tên nguyên liệu.');
      return;
    }

    const uniqueId = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const descParts: string[] = [];
    if (origin.trim()) descParts.push(`Xuất xứ: ${origin.trim()}`);
    if (mainComponent.trim()) descParts.push(`Thành phần chính: ${mainComponent.trim()}`);
    if (scentCharacter.trim()) descParts.push(`Mùi đặc trưng: ${scentCharacter.trim()}`);
    const fullDesc = descParts.length > 0 ? descParts.join(' • ') : 'Nguyên liệu tùy chỉnh';

    const tierColors: Record<'top' | 'heart' | 'base', string> = {
      top: '#D97706',
      heart: '#EC4899',
      base: '#16A34A',
    };

    const scentDescLower = scentCharacter.toLowerCase();
    let computedFamily = 'Hương Đặc Biệt (Signature)';
    if (scentDescLower.includes('hoa') || scentDescLower.includes('rose') || scentDescLower.includes('nhài')) {
      computedFamily = 'Hoa Cỏ (Floral)';
    } else if (scentDescLower.includes('gỗ') || scentDescLower.includes('trầm') || scentDescLower.includes('mộc')) {
      computedFamily = 'Gỗ Ấm (Woody)';
    } else if (scentDescLower.includes('cam') || scentDescLower.includes('chanh') || scentDescLower.includes('citrus')) {
      computedFamily = 'Cam Chanh (Citrus)';
    } else if (scentDescLower.includes('ngọt') || scentDescLower.includes('vani') || scentDescLower.includes('hổ phách')) {
      computedFamily = 'Ngọt Ngào (Gourmand)';
    } else if (scentDescLower.includes('mát') || scentDescLower.includes('fresh') || scentDescLower.includes('bạc hà')) {
      computedFamily = 'Tươi Mát (Fresh)';
    } else if (scentDescLower.includes('cay') || scentDescLower.includes('quế') || scentDescLower.includes('tiêu')) {
      computedFamily = 'Gia Vị (Spicy)';
    }

    const newIngredient: PerfumeIngredient = {
      id: uniqueId,
      name: name.trim(),
      scientificName: mainComponent.trim() || (origin.trim() ? `Xuất xứ: ${origin.trim()}` : 'Custom extract'),
      scentFamily: computedFamily,
      tier,
      description: fullDesc,
      color: tierColors[tier],
      ifraMaxPercent: 5.0,
    };

    onAddIngredient(newIngredient, targetSlotKey || undefined);

    setName('');
    setOrigin('');
    setMainComponent('');
    setScentCharacter('');
    setErrorMsg(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-custom-ingredient-title"
      className="fixed inset-0 z-50 bg-[#2B342D]/45 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-[#FFFDF8] border-2 border-[#FBCFE8] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-6 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#FBCFE8]/70 bg-gradient-to-r from-[#FFF0F6] via-[#FFFDF8] to-[#F0FDF4] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onClose}
              type="button"
              aria-label="Quay lại"
              className="w-9 h-9 rounded-full bg-white hover:bg-[#FCE7F3] border border-[#FBCFE8] text-[#5C6B5F] hover:text-[#BE185D] flex items-center justify-center transition-all shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h2
                id="add-custom-ingredient-title"
                className="text-base sm:text-lg font-extrabold text-[#2B342D] flex items-center gap-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                <FlaskConical className="w-5 h-5 text-[#EC4899] shrink-0" />
                <span>Thêm Nguyên Liệu</span>
              </h2>
              <p className="text-xs text-[#5C6B5F]">Nốt hương tự chọn</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="w-9 h-9 rounded-full bg-white hover:bg-[#FCE7F3] border border-[#FBCFE8] text-[#5C6B5F] hover:text-[#BE185D] flex items-center justify-center transition-all shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-[#FFF1F2] border border-[#FDA4AF] text-[#9F1239] text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* Tier selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2B342D] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#EC4899]" />
              Chọn tầng hương
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTier('top')}
                className={`py-2.5 px-2 rounded-2xl border text-xs font-bold transition-all text-center ${
                  tier === 'top'
                    ? 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D] shadow-sm'
                    : 'bg-white text-[#5C6B5F] border-[#E7EFE9] hover:border-[#FDE68A]'
                }`}
              >
                🍋 Tầng Đầu
              </button>
              <button
                type="button"
                onClick={() => setTier('heart')}
                className={`py-2.5 px-2 rounded-2xl border text-xs font-bold transition-all text-center ${
                  tier === 'heart'
                    ? 'bg-[#FCE7F3] text-[#BE185D] border-[#F9A8D4] shadow-sm'
                    : 'bg-white text-[#5C6B5F] border-[#E7EFE9] hover:border-[#FBCFE8]'
                }`}
              >
                🌸 Tầng Giữa
              </button>
              <button
                type="button"
                onClick={() => setTier('base')}
                className={`py-2.5 px-2 rounded-2xl border text-xs font-bold transition-all text-center ${
                  tier === 'base'
                    ? 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC] shadow-sm'
                    : 'bg-white text-[#5C6B5F] border-[#E7EFE9] hover:border-[#BBF7D0]'
                }`}
              >
                🌿 Tầng Cuối
              </button>
            </div>
          </div>

          {/* Ingredient Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2B342D] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
              Tên nguyên liệu <span className="text-[#E11D48]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="VD: Hoa Anh Đào, Trà Xanh Nhật..."
              className="w-full px-3.5 py-2.5 bg-white border border-[#FBCFE8] rounded-2xl text-xs text-[#2B342D] placeholder:text-[#94A396] focus:outline-none focus:ring-2 focus:ring-[#EC4899]/40 focus:border-[#EC4899]"
            />
          </div>

          {/* Origin */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2B342D] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#16A34A]" />
              Xuất xứ
            </label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="VD: Việt Nam, Grasse (Pháp), Kyoto..."
              className="w-full px-3.5 py-2.5 bg-white border border-[#E7EFE9] rounded-2xl text-xs text-[#2B342D] placeholder:text-[#94A396] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/35 focus:border-[#16A34A]"
            />
          </div>

          {/* Main Component */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2B342D] flex items-center gap-1.5">
              <Dna className="w-3.5 h-3.5 text-[#0284C7]" />
              Hoạt chất chính
            </label>
            <input
              type="text"
              value={mainComponent}
              onChange={(e) => setMainComponent(e.target.value)}
              placeholder="VD: Linalool, Limonene, Vanillin..."
              className="w-full px-3.5 py-2.5 bg-white border border-[#E7EFE9] rounded-2xl text-xs text-[#2B342D] placeholder:text-[#94A396] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/35 focus:border-[#16A34A]"
            />
          </div>

          {/* Scent Character */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2B342D] flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-[#EC4899]" />
              Tính chất mùi
            </label>
            <input
              type="text"
              value={scentCharacter}
              onChange={(e) => setScentCharacter(e.target.value)}
              placeholder="VD: Hoa nhẹ, cam chanh mát, gỗ ấm, ngọt dịu..."
              className="w-full px-3.5 py-2.5 bg-white border border-[#FBCFE8] rounded-2xl text-xs text-[#2B342D] placeholder:text-[#94A396] focus:outline-none focus:ring-2 focus:ring-[#EC4899]/40 focus:border-[#EC4899]"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#FBCFE8]/70 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-[#FCE7F3] border border-[#FBCFE8] text-[#5C6B5F] text-xs font-bold transition-all"
            >
              Hủy
            </button>

            <button
              type="submit"
              className="flex-1 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#EC4899] to-[#F472B6] hover:from-[#DB2777] hover:to-[#EC4899] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm nguyên liệu</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
