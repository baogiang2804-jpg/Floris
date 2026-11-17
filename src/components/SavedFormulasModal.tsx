import React, { useState, useMemo } from 'react';
import {
  Bookmark,
  GitCompare,
  Trash2,
  Download,
  RotateCcw,
  Plus,
  X,
  Search,
  Columns,
  ArrowRightLeft,
  Check,
} from 'lucide-react';
import { SavedFormula } from '../types/savedFormula';
import {
  CalculatedIngredient,
  FormulaSlot,
  generateCsvContent,
  downloadCsvFile,
} from '../utils/perfumeCalculations';
import { SpringAccordion } from './SpringAccordion';

interface SavedFormulasModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedFormulas: SavedFormula[];
  currentFormulaState: {
    season: 'spring' | 'summer' | 'autumn' | 'winter';
    seasonTitle: string;
    totalVolume: number;
    concentrationName: string;
    concentrationPercent: number;
    slots: FormulaSlot[];
    tierTotals: { top: number; heart: number; base: number };
    totalPercentage: number;
    calculatedIngredients: CalculatedIngredient[];
    pureFragranceMl: number;
    carrierAlcoholMl: number;
    perfumeTitle: string;
  };
  onSaveCurrentFormula: (name: string, note?: string) => void;
  onLoadFormula: (formula: SavedFormula) => void;
  onDeleteFormula: (id: string) => void;
  onClearAllFormulas: () => void;
}

interface UnifiedIngredientComparisonRow {
  key: string;
  name: string;
  scentFamily: string;
  tier: 'top' | 'heart' | 'base';
  tierLabel: string;
  pctA: number;
  mlA: number;
  finalConcA: number;
  pctB: number;
  mlB: number;
  finalConcB: number;
  deltaPct: number;
  deltaMl: number;
  status: 'unchanged' | 'increased' | 'decreased' | 'added' | 'removed';
}

export const SavedFormulasModal: React.FC<SavedFormulasModalProps> = ({
  isOpen,
  onClose,
  savedFormulas,
  currentFormulaState,
  onSaveCurrentFormula,
  onLoadFormula,
  onDeleteFormula,
  onClearAllFormulas,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'compare'>('list');
  const [compareViewMode, setCompareViewMode] = useState<'unified' | 'slots'>('unified');
  const [newFormulaName, setNewFormulaName] = useState('');
  const [newFormulaNote, setNewFormulaNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [compareIdA, setCompareIdA] = useState<string>(() =>
    savedFormulas.length >= 1 ? savedFormulas[0].id : 'current'
  );
  const [compareIdB, setCompareIdB] = useState<string>(() =>
    savedFormulas.length >= 2 ? savedFormulas[1].id : 'current'
  );
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const currentAsSaved: SavedFormula = useMemo(
    () => ({
      id: 'current',
      name: `Đang pha: ${currentFormulaState.perfumeTitle || 'Hiện tại'}`,
      note: 'Công thức đang mở',
      createdAt: new Date().toISOString(),
      season: currentFormulaState.season,
      seasonTitle: currentFormulaState.seasonTitle,
      totalVolume: currentFormulaState.totalVolume,
      concentrationName: currentFormulaState.concentrationName,
      concentrationPercent: currentFormulaState.concentrationPercent,
      slots: currentFormulaState.slots,
      tierTotals: currentFormulaState.tierTotals,
      totalPercentage: currentFormulaState.totalPercentage,
      calculatedIngredients: currentFormulaState.calculatedIngredients,
      pureFragranceMl: currentFormulaState.pureFragranceMl,
      carrierAlcoholMl: currentFormulaState.carrierAlcoholMl,
      perfumeTitle: currentFormulaState.perfumeTitle,
    }),
    [currentFormulaState]
  );

  const allSelectableFormulas: SavedFormula[] = useMemo(
    () => [currentAsSaved, ...savedFormulas],
    [currentAsSaved, savedFormulas]
  );

  const formulaA: SavedFormula = useMemo(() => {
    return (
      allSelectableFormulas.find((f) => f.id === compareIdA) ||
      savedFormulas[0] ||
      currentAsSaved
    );
  }, [allSelectableFormulas, compareIdA, savedFormulas, currentAsSaved]);

  const formulaB: SavedFormula = useMemo(() => {
    return (
      allSelectableFormulas.find((f) => f.id === compareIdB) ||
      savedFormulas[1] ||
      savedFormulas[0] ||
      currentAsSaved
    );
  }, [allSelectableFormulas, compareIdB, savedFormulas, currentAsSaved]);

  const unifiedComparisonRows: UnifiedIngredientComparisonRow[] = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        scentFamily: string;
        tier: 'top' | 'heart' | 'base';
        tierLabel: string;
        pctA: number;
        mlA: number;
        pctB: number;
        mlB: number;
      }
    >();

    const tierOrder: Record<'top' | 'heart' | 'base', number> = {
      top: 1,
      heart: 2,
      base: 3,
    };

    const getTierLabel = (tier: 'top' | 'heart' | 'base', fallback?: string) => {
      if (fallback) return fallback;
      return tier === 'top' ? 'Tầng Đầu' : tier === 'heart' ? 'Tầng Giữa' : 'Tầng Cuối';
    };

    formulaA.calculatedIngredients.forEach((ing) => {
      const normalizedKey = `${ing.tier}_${ing.name.trim().toLowerCase()}`;
      const existing = map.get(normalizedKey);
      if (existing) {
        existing.pctA = Number((existing.pctA + (ing.percentage || 0)).toFixed(1));
        existing.mlA = Number((existing.mlA + (ing.volumeMl || 0)).toFixed(2));
      } else {
        map.set(normalizedKey, {
          name: ing.name,
          scentFamily: ing.scentFamily || 'Hương liệu',
          tier: ing.tier,
          tierLabel: getTierLabel(ing.tier, ing.tierLabel),
          pctA: ing.percentage || 0,
          mlA: ing.volumeMl || 0,
          pctB: 0,
          mlB: 0,
        });
      }
    });

    formulaB.calculatedIngredients.forEach((ing) => {
      const normalizedKey = `${ing.tier}_${ing.name.trim().toLowerCase()}`;
      const existing = map.get(normalizedKey);
      if (existing) {
        existing.pctB = Number((existing.pctB + (ing.percentage || 0)).toFixed(1));
        existing.mlB = Number((existing.mlB + (ing.volumeMl || 0)).toFixed(2));
      } else {
        map.set(normalizedKey, {
          name: ing.name,
          scentFamily: ing.scentFamily || 'Hương liệu',
          tier: ing.tier,
          tierLabel: getTierLabel(ing.tier, ing.tierLabel),
          pctA: 0,
          mlA: 0,
          pctB: ing.percentage || 0,
          mlB: ing.volumeMl || 0,
        });
      }
    });

    const rows: UnifiedIngredientComparisonRow[] = Array.from(map.entries()).map(
      ([key, item]) => {
        const deltaPct = Number((item.pctB - item.pctA).toFixed(1));
        const deltaMl = Number((item.mlB - item.mlA).toFixed(2));
        const finalConcA = Number(
          ((item.pctA * (formulaA.concentrationPercent || 20)) / 100).toFixed(2)
        );
        const finalConcB = Number(
          ((item.pctB * (formulaB.concentrationPercent || 20)) / 100).toFixed(2)
        );

        let status: UnifiedIngredientComparisonRow['status'] = 'unchanged';
        if (item.pctA === 0 && item.pctB > 0) status = 'added';
        else if (item.pctA > 0 && item.pctB === 0) status = 'removed';
        else if (deltaPct > 0) status = 'increased';
        else if (deltaPct < 0) status = 'decreased';

        return {
          key,
          name: item.name,
          scentFamily: item.scentFamily,
          tier: item.tier,
          tierLabel: item.tierLabel,
          pctA: item.pctA,
          mlA: item.mlA,
          finalConcA,
          pctB: item.pctB,
          mlB: item.mlB,
          finalConcB,
          deltaPct,
          deltaMl,
          status,
        };
      }
    );

    return rows.sort((a, b) => {
      if (tierOrder[a.tier] !== tierOrder[b.tier]) {
        return tierOrder[a.tier] - tierOrder[b.tier];
      }
      return b.pctB + b.pctA - (a.pctB + a.pctA);
    });
  }, [formulaA, formulaB]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName =
      newFormulaName.trim() ||
      `Mẫu #${savedFormulas.length + 1} · ${currentFormulaState.seasonTitle}`;
    onSaveCurrentFormula(finalName, newFormulaNote.trim());
    setNewFormulaName('');
    setNewFormulaNote('');
    showNotification(`Đã lưu "${finalName}"!`);
  };

  const handleExportSavedCsv = (f: SavedFormula) => {
    const csv = generateCsvContent(
      f.perfumeTitle || f.name,
      f.seasonTitle,
      f.totalVolume,
      f.concentrationName,
      f.calculatedIngredients,
      f.tierTotals,
      'Floris'
    );
    downloadCsvFile(csv, `cong_thuc_${f.name.replace(/\s+/g, '_')}.csv`);
    showNotification(`Đã xuất CSV "${f.name}"!`);
  };

  const handleExportComparisonCsv = () => {
    const lines: string[] = [
      '\uFEFF=== SO SÁNH 2 CÔNG THỨC FLORIS ===',
      `Mẫu A,"${formulaA.name.replace(/"/g, '""')}"`,
      `Mẫu B,"${formulaB.name.replace(/"/g, '""')}"`,
      '',
      'Tầng,Thành phần,Mẫu A (%),Mẫu B (%),Thay đổi Δ (%)',
      ...unifiedComparisonRows.map(
        (r) => `"${r.tierLabel}","${r.name}",${r.pctA}%,${r.pctB}%,${r.deltaPct}%`
      ),
    ];
    downloadCsvFile(lines.join('\n'), `so_sanh_floris_${Date.now()}.csv`);
    showNotification('Đã xuất CSV so sánh!');
  };

  const handleSwapFormulas = () => {
    const temp = compareIdA;
    setCompareIdA(compareIdB);
    setCompareIdB(temp);
    showNotification('Đã đảo vị trí Mẫu A ⇄ Mẫu B');
  };

  const filteredFormulas = savedFormulas.filter((f) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      f.name.toLowerCase().includes(term) ||
      f.seasonTitle.toLowerCase().includes(term) ||
      f.calculatedIngredients.some((i) => i.name.toLowerCase().includes(term))
    );
  });

  const calculateRadarScores = (f: SavedFormula) => {
    let floral = 20, citrus = 20, woody = 20, spicy = 15, oriental = 15, fresh = 15;
    f.calculatedIngredients.forEach((ing) => {
      const p = ing.percentage || 0;
      const fam = ing.scentFamily.toLowerCase();
      const name = ing.name.toLowerCase();
      if (fam.includes('hoa') || name.includes('hồng') || name.includes('nhài')) floral += p * 1.6;
      if (fam.includes('cam') || name.includes('bergamot') || name.includes('chanh')) citrus += p * 1.6;
      if (fam.includes('gỗ') || name.includes('đàn hương')) woody += p * 1.6;
      if (fam.includes('gia vị') || name.includes('quế')) spicy += p * 1.6;
      if (fam.includes('phương đông') || name.includes('vani') || name.includes('xạ hương')) oriental += p * 1.6;
      if (fam.includes('tươi') || name.includes('bạc hà')) fresh += p * 1.6;
    });
    return [
      { label: 'Hoa cỏ', val: Math.min(100, Math.round(floral)) },
      { label: 'Cam chanh', val: Math.min(100, Math.round(citrus)) },
      { label: 'Gỗ ấm', val: Math.min(100, Math.round(woody)) },
      { label: 'Gia vị', val: Math.min(100, Math.round(spicy)) },
      { label: 'Ngọt dịu', val: Math.min(100, Math.round(oriental)) },
      { label: 'Tươi mát', val: Math.min(100, Math.round(fresh)) },
    ];
  };

  const radarA = calculateRadarScores(formulaA);
  const radarB = calculateRadarScores(formulaB);
  const size = 250;
  const center = size / 2;
  const radius = 82;
  const angleStep = (Math.PI * 2) / 6;

  const pointsA = radarA
    .map((item, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = (item.val / 100) * radius;
      return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    })
    .join(' ');

  const pointsB = radarB
    .map((item, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = (item.val / 100) * radius;
      return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    })
    .join(' ');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Công thức đã lưu và so sánh"
      className="fixed inset-0 z-50 bg-[#2B342D]/45 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
    >
      <div className="bg-[#FFFDF8] border-t sm:border-2 border-[#FBCFE8] rounded-t-3xl sm:rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden max-h-[94vh] sm:max-h-[90vh] flex flex-col text-[#2B342D]">
        <div className="w-12 h-1.5 rounded-full bg-[#F9A8D4] mx-auto mt-2.5 sm:hidden" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#F5DCE4] bg-gradient-to-r from-[#FFF1F5] via-white to-[#ECFDF3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FCE7F3] border border-[#F9A8D4] flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-[#EC4899]" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-[#BE185D] border border-[#FBCFE8] text-[10px] font-bold">
                {savedFormulas.length} mẫu lưu
              </span>
              <h2 className="text-base sm:text-xl font-bold text-[#2B342D]">
                Kho Công Thức &amp; So Sánh
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="inline-flex items-center p-1 bg-[#FFF5F8] rounded-full border border-[#FBCFE8]">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                  activeTab === 'list' ? 'bg-[#EC4899] text-white' : 'text-[#5C6B5F]'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Danh sách</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('compare')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                  activeTab === 'compare' ? 'bg-[#16A34A] text-white' : 'text-[#5C6B5F]'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>So sánh</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng kho công thức"
              className="w-9 h-9 rounded-full bg-white hover:bg-[#FCE7F3] text-[#5C6B5F] flex items-center justify-center border border-[#F3D5E0]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {notification && (
          <div className="bg-[#ECFDF3] border-b border-[#BBF7D0] px-4 py-2 text-xs text-[#15803D] font-bold flex items-center gap-2">
            <Check className="w-3.5 h-3.5" />
            <span>{notification}</span>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {activeTab === 'list' ? (
            <div className="space-y-5">
              {/* Quick Save Form */}
              <form
                onSubmit={handleSave}
                className="p-4 rounded-3xl bg-[#FFF5F8] border-2 border-[#FBCFE8] space-y-3"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-[#BE185D] flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    Lưu công thức hiện tại ({currentFormulaState.totalVolume} mL · {currentFormulaState.totalPercentage}%)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCompareIdA('current');
                      setActiveTab('compare');
                    }}
                    className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#15803D] border border-[#BBF7D0]"
                  >
                    So sánh ngay →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <input
                    type="text"
                    placeholder="Tên mẫu mới..."
                    value={newFormulaName}
                    onChange={(e) => setNewFormulaName(e.target.value)}
                    className="sm:col-span-5 px-3.5 py-2 bg-white border border-[#F3D5E0] rounded-2xl text-xs font-semibold focus:border-[#EC4899] focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Ghi chú ngắn..."
                    value={newFormulaNote}
                    onChange={(e) => setNewFormulaNote(e.target.value)}
                    className="sm:col-span-5 px-3.5 py-2 bg-white border border-[#F3D5E0] rounded-2xl text-xs focus:border-[#EC4899] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="sm:col-span-2 px-3 py-2 rounded-2xl bg-[#EC4899] hover:bg-[#DB2777] text-white font-bold text-xs flex items-center justify-center gap-1"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Lưu</span>
                  </button>
                </div>
              </form>

              {/* Search */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 text-[#5C6B5F] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm tên mẫu..."
                    className="w-full pl-8 pr-3 py-2 bg-white border border-[#F3D5E0] rounded-2xl text-xs focus:border-[#EC4899] focus:outline-none"
                  />
                </div>

                {savedFormulas.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      onClearAllFormulas();
                      showNotification('Đã xóa toàn bộ');
                    }}
                    className="text-xs font-bold text-[#BE123C] hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa hết</span>
                  </button>
                )}
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredFormulas.map((f) => {
                  const isA = compareIdA === f.id;
                  const isB = compareIdB === f.id;
                  return (
                    <div
                      key={f.id}
                      className={`p-4 rounded-3xl border-2 bg-white flex flex-col justify-between gap-3 ${
                        isA
                          ? 'border-[#EC4899]'
                          : isB
                          ? 'border-[#16A34A]'
                          : 'border-[#F3DCE4]'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-sm text-[#2B342D]">{f.name}</h4>
                            <span className="text-[11px] font-mono text-[#5C6B5F]">
                              {f.seasonTitle} · {f.totalVolume} mL · {f.concentrationPercent}%
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onDeleteFormula(f.id)}
                            aria-label={`Xóa ${f.name}`}
                            className="p-1.5 rounded-full hover:bg-[#FFF1F2] text-[#5C6B5F] hover:text-[#BE123C]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Tier Ratio Bar */}
                        <div className="w-full h-3 rounded-full overflow-hidden flex border border-[#F3DCE4]">
                          <div style={{ width: `${f.tierTotals.top}%` }} className="bg-[#FDE047]" />
                          <div style={{ width: `${f.tierTotals.heart}%` }} className="bg-[#F9A8D4]" />
                          <div style={{ width: `${f.tierTotals.base}%` }} className="bg-[#86EFAC]" />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-[#F5DCE4]">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setCompareIdA(f.id)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              isA
                                ? 'bg-[#EC4899] text-white border-[#EC4899]'
                                : 'bg-[#FFF5F8] text-[#BE185D] border-[#FBCFE8]'
                            }`}
                          >
                            Mẫu A
                          </button>
                          <button
                            type="button"
                            onClick={() => setCompareIdB(f.id)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              isB
                                ? 'bg-[#16A34A] text-white border-[#16A34A]'
                                : 'bg-[#ECFDF3] text-[#15803D] border-[#BBF7D0]'
                            }`}
                          >
                            Mẫu B
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              onLoadFormula(f);
                              onClose();
                            }}
                            className="px-3 py-1 rounded-full bg-[#FEF9C3] hover:bg-[#FEF08A] text-[#854D0E] text-[11px] font-bold flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Nạp</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExportSavedCsv(f)}
                            className="px-2.5 py-1 rounded-full bg-white border border-[#F3D5E0] text-[#2B342D] text-[11px] font-bold flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>CSV</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* TAB 2: COMPARE */
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-2xl bg-[#FFF5F8] border-2 border-[#FBCFE8] space-y-1.5">
                  <label className="text-xs font-bold text-[#BE185D]">Mẫu A (Gốc)</label>
                  <select
                    value={compareIdA}
                    onChange={(e) => setCompareIdA(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#FBCFE8] rounded-xl text-xs font-bold text-[#2B342D]"
                  >
                    <option value="current">⚡ Đang pha trên bàn</option>
                    {savedFormulas.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F3FDF6] border-2 border-[#BBF7D0] space-y-1.5">
                  <label className="text-xs font-bold text-[#15803D]">Mẫu B (So sánh)</label>
                  <select
                    value={compareIdB}
                    onChange={(e) => setCompareIdB(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#BBF7D0] rounded-xl text-xs font-bold text-[#2B342D]"
                  >
                    <option value="current">⚡ Đang pha trên bàn</option>
                    {savedFormulas.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex p-1 rounded-full bg-[#FFF5F8] border border-[#FBCFE8]">
                  <button
                    type="button"
                    onClick={() => setCompareViewMode('unified')}
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      compareViewMode === 'unified' ? 'bg-[#EC4899] text-white' : 'text-[#5C6B5F]'
                    }`}
                  >
                    Theo thành phần
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompareViewMode('slots')}
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      compareViewMode === 'slots' ? 'bg-[#EC4899] text-white' : 'text-[#5C6B5F]'
                    }`}
                  >
                    Theo 6 vị trí
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSwapFormulas}
                    className="px-3 py-1.5 rounded-full bg-white border border-[#F3D5E0] text-xs font-bold flex items-center gap-1"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-[#EC4899]" />
                    <span>Đảo A ⇄ B</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportComparisonCsv}
                    className="px-3.5 py-1.5 rounded-full bg-[#16A34A] text-white text-xs font-bold flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Xuất CSV</span>
                  </button>
                </div>
              </div>

              {/* Dual Radar SVG (Light Spring Pastel) + Delta Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                <div className="lg:col-span-5 spring-card p-4 flex flex-col items-center">
                  <svg width={size} height={size} className="overflow-visible">
                    {[0.25, 0.5, 0.75, 1].map((scale, idx) => (
                      <circle
                        key={idx}
                        cx={center}
                        cy={center}
                        r={radius * scale}
                        fill="none"
                        stroke="#F3DCE4"
                        strokeDasharray={scale === 1 ? 'none' : '3 3'}
                        strokeWidth="1"
                      />
                    ))}
                    {radarA.map((_, i) => {
                      const angle = i * angleStep - Math.PI / 2;
                      return (
                        <line
                          key={i}
                          x1={center}
                          y1={center}
                          x2={center + radius * Math.cos(angle)}
                          y2={center + radius * Math.sin(angle)}
                          stroke="#F5DCE4"
                          strokeWidth="1"
                        />
                      );
                    })}
                    <polygon points={pointsA} fill="rgba(236, 72, 153, 0.2)" stroke="#EC4899" strokeWidth="2.5" />
                    <polygon
                      points={pointsB}
                      fill="rgba(22, 163, 74, 0.2)"
                      stroke="#16A34A"
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                    />
                    {radarA.map((item, i) => {
                      const angle = i * angleStep - Math.PI / 2;
                      const r = radius + 22;
                      return (
                        <text
                          key={i}
                          x={center + r * Math.cos(angle)}
                          y={center + r * Math.sin(angle)}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#2B342D"
                          fontSize="10"
                          fontWeight="700"
                        >
                          {item.label}
                        </text>
                      );
                    })}
                  </svg>
                  <div className="flex items-center gap-4 text-xs font-bold mt-2">
                    <span className="text-[#BE185D]">● Mẫu A</span>
                    <span className="text-[#15803D]">● Mẫu B</span>
                  </div>
                </div>

                <div className="lg:col-span-7 space-y-2.5">
                  <div className="p-3.5 rounded-2xl bg-[#FFFDF0] border border-[#FDE68A] flex justify-between text-xs font-bold">
                    <span>🍋 Tầng Đầu</span>
                    <span className="font-mono">
                      A: {formulaA.tierTotals.top}% → B: {formulaB.tierTotals.top}%
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#FFF5F8] border border-[#FBCFE8] flex justify-between text-xs font-bold">
                    <span>🌸 Tầng Giữa</span>
                    <span className="font-mono">
                      A: {formulaA.tierTotals.heart}% → B: {formulaB.tierTotals.heart}%
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#F3FDF6] border border-[#BBF7D0] flex justify-between text-xs font-bold">
                    <span>🌿 Tầng Cuối</span>
                    <span className="font-mono">
                      A: {formulaA.tierTotals.base}% → B: {formulaB.tierTotals.base}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Detailed Table in Accordion */}
              <SpringAccordion
                title="Bảng đối chiếu chi tiết từng nguyên liệu"
                badge={`${unifiedComparisonRows.length} dòng`}
                tone="cream"
                defaultOpen
                icon={<GitCompare className="w-4 h-4 text-[#EC4899]" />}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#F3DCE4] text-[#5C6B5F]">
                        <th className="py-2 px-2">Nguyên liệu</th>
                        <th className="py-2 px-2 text-right">Mẫu A</th>
                        <th className="py-2 px-2 text-right">Mẫu B</th>
                        <th className="py-2 px-2 text-right">Δ%</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F8E8EE] font-mono">
                      {(compareViewMode === 'unified'
                        ? unifiedComparisonRows
                        : [0, 1, 2, 3, 4, 5].map((i) => ({
                            key: String(i),
                            name: formulaA.calculatedIngredients[i]?.name || `Vị trí #${i + 1}`,
                            pctA: formulaA.calculatedIngredients[i]?.percentage || 0,
                            pctB: formulaB.calculatedIngredients[i]?.percentage || 0,
                            deltaPct: Number(
                              (
                                (formulaB.calculatedIngredients[i]?.percentage || 0) -
                                (formulaA.calculatedIngredients[i]?.percentage || 0)
                              ).toFixed(1)
                            ),
                          }))
                      ).map((row) => (
                        <tr key={row.key}>
                          <td className="py-2 px-2 font-sans font-bold text-[#2B342D]">{row.name}</td>
                          <td className="py-2 px-2 text-right text-[#BE185D] font-bold">{row.pctA}%</td>
                          <td className="py-2 px-2 text-right text-[#15803D] font-bold">{row.pctB}%</td>
                          <td className="py-2 px-2 text-right font-bold">
                            {row.deltaPct > 0 ? `+${row.deltaPct}%` : `${row.deltaPct}%`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SpringAccordion>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#F5DCE4] bg-[#FFF5F8] flex items-center justify-between text-xs text-[#5C6B5F]">
          <span className="font-bold">🌸 Kho công thức Floris</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-2xl bg-white hover:bg-[#FCE7F3] text-[#2B342D] border border-[#F3D5E0] font-bold"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
