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
  Check,
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

  // Sync tier when targetTier prop changes
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

    // Build rich description from the user inputs
    const descParts: string[] = [];
    if (origin.trim()) descParts.push(`Xuất xứ: ${origin.trim()}`);
    if (mainComponent.trim()) descParts.push(`Thành phần chính: ${mainComponent.trim()}`);
    if (scentCharacter.trim()) descParts.push(`Mùi đặc trưng: ${scentCharacter.trim()}`);
    const fullDesc = descParts.length > 0 ? descParts.join(' • ') : 'Nguyên liệu tùy chỉnh độc quyền';

    // Map tier to distinct accent color
    const tierColors: Record<'top' | 'heart' | 'base', string> = {
      top: '#FACC15',
      heart: '#F43F5E',
      base: '#D97706',
    };

    // Determine scent family classification
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
      ifraMaxPercent: 5.0, // standard safe cosmetic threshold
    };

    onAddIngredient(newIngredient, targetSlotKey || undefined);

    // Reset and return to initial workspace
    setName('');
    setOrigin('');
    setMainComponent('');
    setScentCharacter('');
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-6 flex flex-col animate-fadeIn">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              type="button"
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-all"
              title="Quay lại màn hình ban đầu"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-slate-100 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-amber-400" />
                Thêm Nguyên Liệu Của Riêng Bạn
              </h2>
              <p className="text-xs text-slate-400">
                Nhập thông số nguyên liệu để bổ sung vào phòng pha chế
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-all"
            title="Đóng cửa sổ"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Tầng hương tương ứng */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              Tầng hương phân bổ:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTier('top')}
                className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all text-center ${
                  tier === 'top'
                    ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50 font-bold shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                🍋 Tầng Đầu (Top)
              </button>
              <button
                type="button"
                onClick={() => setTier('heart')}
                className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all text-center ${
                  tier === 'heart'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                🌹 Tầng Giữa (Heart)
              </button>
              <button
                type="button"
                onClick={() => setTier('base')}
                className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all text-center ${
                  tier === 'base'
                    ? 'bg-amber-600/20 text-amber-300 border-amber-600/50 font-bold shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                🌲 Tầng Cuối (Base)
              </button>
            </div>
          </div>

          {/* 1. Tên nguyên liệu */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Tên nguyên liệu: <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="VD: Trầm Hương Rừng Quảng Nam, Hoa Sen Đồng Tháp..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* 2. Xuất xứ */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              Xuất xứ:
            </label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="VD: Việt Nam, Grasse (Pháp), Sicily (Ý), Mysore (Ấn Độ)..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* 3. Thành phần chính */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
              <Dna className="w-3.5 h-3.5 text-emerald-400" />
              Thành phần chính:
            </label>
            <input
              type="text"
              value={mainComponent}
              onChange={(e) => setMainComponent(e.target.value)}
              placeholder="VD: Agarospirol, Linalool, Damascenone, Limonene, Santalol..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* 4. Mùi đặc trưng (nếu có) */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-rose-400" />
              Mùi đặc trưng (nếu có):
            </label>
            <input
              type="text"
              value={scentCharacter}
              onChange={(e) => setScentCharacter(e.target.value)}
              placeholder="VD: Hương khói ấm dịu, thanh tịnh, gỗ đậm, ngọt ngào về hậu..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Nút hành động */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
            >
              Hủy
            </button>

            <button
              type="submit"
              className="flex-1 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-900/30 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Thêm nguyên liệu</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
