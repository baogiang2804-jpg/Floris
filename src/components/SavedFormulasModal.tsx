import React, { useState, useMemo } from 'react';
import {
  Bookmark,
  GitCompare,
  Trash2,
  Download,
  RotateCcw,
  Plus,
  X,
  Calendar,
  Layers,
  Sparkles,
  ArrowRightLeft,
  Check,
  Search,
  Columns,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle2,
} from 'lucide-react';
import { SavedFormula } from '../types/savedFormula';
import {
  CalculatedIngredient,
  FormulaSlot,
  generateCsvContent,
  downloadCsvFile,
} from '../utils/perfumeCalculations';

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

  // Comparison selection: allows picking any 2 saved formulas (or 'current')
  const [compareIdA, setCompareIdA] = useState<string>(() =>
    savedFormulas.length >= 1 ? savedFormulas[0].id : 'current'
  );
  const [compareIdB, setCompareIdB] = useState<string>(() =>
    savedFormulas.length >= 2
      ? savedFormulas[1].id
      : savedFormulas.length === 1
      ? 'current'
      : 'current'
  );

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Convert current formula to a SavedFormula-like structure for comparison
  const currentAsSaved: SavedFormula = useMemo(
    () => ({
      id: 'current',
      name: `Đang pha chế: ${currentFormulaState.perfumeTitle || 'Bàn Pha Chế Hiện Tại'}`,
      note: 'Phiên bản đang mở trực tiếp trên bàn pha chế Studio',
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

  // Build unified ingredient-by-ingredient comparison rows across Formula A and Formula B
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
      `Bản thử #${savedFormulas.length + 1} - ${currentFormulaState.seasonTitle} (${currentFormulaState.totalVolume}mL)`;
    onSaveCurrentFormula(finalName, newFormulaNote.trim());
    setNewFormulaName('');
    setNewFormulaNote('');
    showNotification(`Đã lưu "${finalName}" vào danh sách!`);
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
    showNotification(`Đã xuất CSV cho "${f.name}"!`);
  };

  const handleExportComparisonCsv = () => {
    const lines: string[] = [
      '\uFEFF=== BẢNG SO SÁNH SONG SONG (SIDE-BY-SIDE) 2 CÔNG THỨC NƯỚC HOA ===',
      `Công thức 1 (Mẫu A),"${formulaA.name.replace(/"/g, '""')}",Mùa: ${formulaA.seasonTitle},Thể tích: ${formulaA.totalVolume}mL,Nồng độ: ${formulaA.concentrationName}`,
      `Công thức 2 (Mẫu B),"${formulaB.name.replace(/"/g, '""')}",Mùa: ${formulaB.seasonTitle},Thể tích: ${formulaB.totalVolume}mL,Nồng độ: ${formulaB.concentrationName}`,
      '',
      'Tầng Hương,Tên Thành Phần,Nhóm Hương,Tỉ Lệ Mẫu A (%),Thể Tích Mẫu A (mL),Nồng Độ Thành Phẩm A (%),Tỉ Lệ Mẫu B (%),Thể Tích Mẫu B (mL),Nồng Độ Thành Phẩm B (%),Tỉ Lệ Thay Đổi Δ (%),Chênh Lệch Thể Tích Δ (mL),Trạng Thái Biến Thiên',
    ];

    unifiedComparisonRows.forEach((row) => {
      const statusText =
        row.status === 'added'
          ? 'Thêm mới ở Mẫu B'
          : row.status === 'removed'
          ? 'Loại bỏ ở Mẫu B'
          : row.status === 'increased'
          ? 'Tăng tỉ lệ'
          : row.status === 'decreased'
          ? 'Giảm tỉ lệ'
          : 'Giữ nguyên';

      lines.push(
        `"${row.tierLabel}","${row.name.replace(/"/g, '""')}","${row.scentFamily.replace(/"/g, '""')}",${row.pctA}%,${row.mlA}mL,${row.finalConcA}%,${row.pctB}%,${row.mlB}mL,${row.finalConcB}%,${row.deltaPct > 0 ? '+' : ''}${row.deltaPct}%,${row.deltaMl > 0 ? '+' : ''}${row.deltaMl}mL,"${statusText}"`
      );
    });

    lines.push('');
    lines.push('=== TỔNG HỢP TỈ LỆ 3 TẦNG HƯƠNG ===');
    lines.push(
      `Tầng Đầu (Top Notes),Mẫu A: ${formulaA.tierTotals.top}%,Mẫu B: ${formulaB.tierTotals.top}%,Độ lệch: ${(formulaB.tierTotals.top - formulaA.tierTotals.top).toFixed(1)}%`
    );
    lines.push(
      `Tầng Giữa (Heart Notes),Mẫu A: ${formulaA.tierTotals.heart}%,Mẫu B: ${formulaB.tierTotals.heart}%,Độ lệch: ${(formulaB.tierTotals.heart - formulaA.tierTotals.heart).toFixed(1)}%`
    );
    lines.push(
      `Tầng Cuối (Base Notes),Mẫu A: ${formulaA.tierTotals.base}%,Mẫu B: ${formulaB.tierTotals.base}%,Độ lệch: ${(formulaB.tierTotals.base - formulaA.tierTotals.base).toFixed(1)}%`
    );

    downloadCsvFile(lines.join('\n'), `so_sanh_song_song_floris_${Date.now()}.csv`);
    showNotification('Đã xuất bảng So sánh song song (.CSV) thành công!');
  };

  const handleSwapFormulas = () => {
    const temp = compareIdA;
    setCompareIdA(compareIdB);
    setCompareIdB(temp);
    showNotification('Đã đảo chiều Công thức 1 (Mẫu A) ⇄ Công thức 2 (Mẫu B)');
  };

  // Filtered saved formulas
  const filteredFormulas = savedFormulas.filter((f) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const matchName = f.name.toLowerCase().includes(term);
    const matchSeason = f.seasonTitle.toLowerCase().includes(term);
    const matchIngredients = f.calculatedIngredients.some(
      (i) =>
        i.name.toLowerCase().includes(term) ||
        i.scentFamily.toLowerCase().includes(term)
    );
    return matchName || matchSeason || matchIngredients;
  });

  // Calculate Radar scores for formula comparison
  const calculateRadarScores = (f: SavedFormula) => {
    let floral = 20,
      citrus = 20,
      woody = 20,
      spicy = 15,
      oriental = 15,
      fresh = 15;
    f.calculatedIngredients.forEach((ing) => {
      const p = ing.percentage || 0;
      const fam = ing.scentFamily.toLowerCase();
      const name = ing.name.toLowerCase();
      if (
        fam.includes('hoa') ||
        fam.includes('floral') ||
        name.includes('hồng') ||
        name.includes('nhài')
      )
        floral += p * 1.6;
      if (
        fam.includes('cam') ||
        fam.includes('citrus') ||
        name.includes('chanh') ||
        name.includes('bergamot')
      )
        citrus += p * 1.6;
      if (
        fam.includes('gỗ') ||
        fam.includes('woody') ||
        name.includes('đàn hương') ||
        name.includes('tuyết tùng')
      )
        woody += p * 1.6;
      if (
        fam.includes('gia vị') ||
        fam.includes('spicy') ||
        name.includes('quế') ||
        name.includes('tiêu') ||
        name.includes('đậu khấu')
      )
        spicy += p * 1.6;
      if (
        fam.includes('phương đông') ||
        fam.includes('oriental') ||
        name.includes('hổ phách') ||
        name.includes('vani') ||
        name.includes('xạ hương')
      )
        oriental += p * 1.6;
      if (
        fam.includes('tươi mát') ||
        fam.includes('fresh') ||
        name.includes('bạc hà') ||
        name.includes('oải hương')
      )
        fresh += p * 1.6;
    });
    return [
      { label: 'Hoa Cỏ', val: Math.min(100, Math.round(floral)) },
      { label: 'Cam Chanh', val: Math.min(100, Math.round(citrus)) },
      { label: 'Gỗ Ấm', val: Math.min(100, Math.round(woody)) },
      { label: 'Gia Vị', val: Math.min(100, Math.round(spicy)) },
      { label: 'Phương Đông', val: Math.min(100, Math.round(oriental)) },
      { label: 'Tươi Mát', val: Math.min(100, Math.round(fresh)) },
    ];
  };

  const radarA = calculateRadarScores(formulaA);
  const radarB = calculateRadarScores(formulaB);

  // SVG Radar generator for dual comparison
  const size = 280;
  const center = size / 2;
  const radius = 90;
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
    <div className="fixed inset-0 z-50 bg-[#2D3A2F]/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-[#FAF8F5] border-t sm:border border-[#E5DFD5] rounded-t-3xl sm:rounded-2xl w-full max-w-6xl shadow-2xl overflow-hidden max-h-[94vh] sm:max-h-[92vh] flex flex-col text-[#2D3A2F]">
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 rounded-full bg-[#D8D1C5] mx-auto mt-2.5 sm:hidden" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8E1D5] bg-[#FFFFFF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-0.5 shadow-md shadow-amber-500/10 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-serif font-bold text-slate-100">
                  Danh Sách Công Thức Đã Lưu & So Sánh Song Song (Side-by-Side)
                </h2>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                  {savedFormulas.length} công thức đã lưu
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Chọn 2 công thức bất kỳ để so sánh song song chi tiết từng thành phần, tỉ lệ thay đổi (Δ%) và nồng độ thực tế
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Tab switchers */}
            <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === 'list'
                    ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Danh sách ({savedFormulas.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('compare')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === 'compare'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Columns className="w-3.5 h-3.5 text-cyan-400" />
                <span>So sánh song song (Side-by-Side)</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-all ml-1"
              title="Đóng cửa sổ"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Toast Notification */}
        {notification && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-200 font-medium flex items-center gap-2 animate-fadeIn">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{notification}</span>
          </div>
        )}

        {/* Quick Side-by-Side Selection Bar (Always visible at top of List Tab so user can pick any 2 formulas and jump right into comparison) */}
        {activeTab === 'list' && (
          <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-slate-950 via-cyan-950/25 to-slate-950 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 font-mono uppercase tracking-wider text-cyan-300 font-bold">
                <Columns className="w-4 h-4 text-cyan-400" />
                Chọn nhanh 2 công thức để So sánh song song:
              </span>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-200">
                <span className="font-mono font-bold text-amber-400">[Mẫu A]</span>
                <span className="truncate max-w-[180px] font-medium">{formulaA.name}</span>
              </div>

              <span className="text-slate-500 font-bold">vs</span>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-200">
                <span className="font-mono font-bold text-cyan-400">[Mẫu B]</span>
                <span className="truncate max-w-[180px] font-medium">{formulaB.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
              <button
                type="button"
                onClick={handleSwapFormulas}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1 transition-all"
                title="Đảo vị trí Mẫu A và Mẫu B"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                <span>Đảo A ⇄ B</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('compare')}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Mở Bảng So Sánh Song Song Ngay</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'list' ? (
            /* TAB 1: LIST & MANAGEMENT */
            <div className="space-y-6">
              {/* Quick Save Card */}
              <form
                onSubmit={handleSave}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    Lưu Công Thức Hiện Tại Đang Pha Chế Vào Danh Sách
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {currentFormulaState.seasonTitle} • {currentFormulaState.totalVolume}mL •{' '}
                      {currentFormulaState.totalPercentage}%
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCompareIdA('current');
                        showNotification('Đã chọn Công thức đang pha chế làm [Mẫu A]');
                      }}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-all ${
                        compareIdA === 'current'
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                          : 'bg-slate-900 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                      }`}
                    >
                      {compareIdA === 'current' ? '✓ Đang là Mẫu A' : 'Chọn làm Mẫu A'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <input
                    type="text"
                    placeholder={`Tên phiên bản (VD: Bản thử #${savedFormulas.length + 1} - Tăng hương gỗ)...`}
                    value={newFormulaName}
                    onChange={(e) => setNewFormulaName(e.target.value)}
                    className="sm:col-span-6 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="Ghi chú (VD: Tăng đàn hương thêm 5%, tăng hoa nhài)..."
                    value={newFormulaNote}
                    onChange={(e) => setNewFormulaNote(e.target.value)}
                    className="sm:col-span-4 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="sm:col-span-2 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow-md shadow-amber-900/20 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Lưu ngay</span>
                  </button>
                </div>
              </form>

              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm theo tên phiên bản, mùa hoặc nguyên liệu..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>

                {savedFormulas.length > 0 && (
                  <div className="flex items-center gap-3 self-end">
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      Mẹo: Bấm <strong>[Chọn Mẫu A]</strong> và <strong>[Chọn Mẫu B]</strong> trên 2 thẻ bất kỳ để so sánh song song
                    </span>
                    <button
                      onClick={() => {
                        onClearAllFormulas();
                        showNotification('Đã xóa toàn bộ công thức đã lưu');
                      }}
                      className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Xóa tất cả</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Saved Formula Cards Grid */}
              {savedFormulas.length === 0 ? (
                <div className="text-center py-12 px-4 bg-slate-950/40 rounded-2xl border border-slate-800">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
                    <Bookmark className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200 mb-1">
                    Chưa có công thức nào được lưu
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                    Nhập tên phiên bản ở ô trên và bấm <strong>"Lưu ngay"</strong> để giữ lại các thử nghiệm pha chế khác nhau và so sánh trực tiếp.
                  </p>
                </div>
              ) : filteredFormulas.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  Không tìm thấy công thức nào khớp với từ khóa "{searchTerm}".
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredFormulas.map((f, idx) => {
                    const isSelectedForA = compareIdA === f.id;
                    const isSelectedForB = compareIdB === f.id;

                    return (
                      <div
                        key={f.id}
                        className={`p-4 rounded-xl bg-slate-950/75 border transition-all flex flex-col justify-between space-y-3 relative group ${
                          isSelectedForA
                            ? 'border-amber-500/70 ring-1 ring-amber-500/30'
                            : isSelectedForB
                            ? 'border-cyan-500/70 ring-1 ring-cyan-500/30'
                            : 'border-slate-800/90 hover:border-slate-700'
                        }`}
                      >
                        {/* Top: Name & Badges */}
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[11px] font-bold flex items-center justify-center">
                                  #{idx + 1}
                                </span>
                                <h4 className="font-serif font-bold text-sm text-slate-100 group-hover:text-amber-300 transition-colors">
                                  {f.name}
                                </h4>
                                {isSelectedForA && (
                                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                                    Đang chọn: Mẫu A
                                  </span>
                                )}
                                {isSelectedForB && (
                                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950">
                                    Đang chọn: Mẫu B
                                  </span>
                                )}
                              </div>
                              {f.note && (
                                <p className="text-[11px] text-slate-400 italic mt-0.5 ml-7">
                                  “{f.note}”
                                </p>
                              )}
                            </div>

                            <button
                              onClick={() => {
                                onDeleteFormula(f.id);
                                showNotification(`Đã xóa "${f.name}"`);
                              }}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                              title="Xóa công thức này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Meta details */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-[10px] font-mono">
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                              {f.seasonTitle}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/40 text-cyan-300">
                              {f.totalVolume} mL
                            </span>
                            <span className="px-2 py-0.5 rounded bg-amber-950/40 border border-amber-800/40 text-amber-300">
                              {f.concentrationName.split(' ')[0]} ({f.concentrationPercent}%)
                            </span>
                            <span className="text-slate-500 ml-auto flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(f.createdAt).toLocaleDateString('vi-VN')}{' '}
                              {new Date(f.createdAt).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          {/* Tier Breakdown Mini Bar */}
                          <div className="mt-3 space-y-1">
                            <div className="flex justify-between text-[11px] font-mono text-slate-400">
                              <span>Đầu {f.tierTotals.top}%</span>
                              <span>Giữa {f.tierTotals.heart}%</span>
                              <span>Cuối {f.tierTotals.base}%</span>
                            </div>
                            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden flex">
                              <div
                                style={{ width: `${f.tierTotals.top}%` }}
                                className="bg-yellow-400"
                              />
                              <div
                                style={{ width: `${f.tierTotals.heart}%` }}
                                className="bg-rose-500"
                              />
                              <div
                                style={{ width: `${f.tierTotals.base}%` }}
                                className="bg-amber-600"
                              />
                            </div>
                          </div>

                          {/* Ingredient Pills */}
                          <div className="mt-3 flex flex-wrap gap-1">
                            {f.calculatedIngredients.map((ing) => (
                              <span
                                key={ing.slotKey}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono"
                              >
                                {ing.name.split('(')[0].trim()} {ing.percentage}% ({ing.volumeMl}mL)
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Bottom Actions: Side-by-Side Selection Buttons + Load/Export */}
                        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                          {/* Pick as Formula A or Formula B for Side-by-Side */}
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setCompareIdA(f.id);
                                showNotification(`Đã chọn "${f.name}" làm Mẫu A`);
                              }}
                              className={`px-2 py-1 rounded-lg text-[11px] font-mono font-semibold border transition-all ${
                                isSelectedForA
                                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                                  : 'bg-slate-900 hover:bg-amber-500/15 text-amber-300 border-amber-500/30'
                              }`}
                              title="Chọn công thức này làm Mẫu 1 (A) để so sánh song song"
                            >
                              {isSelectedForA ? '✓ Mẫu A' : 'Chọn Mẫu A'}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setCompareIdB(f.id);
                                showNotification(`Đã chọn "${f.name}" làm Mẫu B`);
                              }}
                              className={`px-2 py-1 rounded-lg text-[11px] font-mono font-semibold border transition-all ${
                                isSelectedForB
                                  ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-sm'
                                  : 'bg-slate-900 hover:bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                              }`}
                              title="Chọn công thức này làm Mẫu 2 (B) để so sánh song song"
                            >
                              {isSelectedForB ? '✓ Mẫu B' : 'Chọn Mẫu B'}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (compareIdA !== f.id) {
                                  setCompareIdB(f.id);
                                }
                                setActiveTab('compare');
                              }}
                              className="px-2 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-500/30 text-[11px] font-medium transition-all flex items-center gap-1"
                              title="Mở bảng so sánh song song ngay"
                            >
                              <Columns className="w-3 h-3 text-cyan-400" />
                              <span>So sánh ngay</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                onLoadFormula(f);
                                onClose();
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-medium transition-all flex items-center gap-1 active:scale-95"
                              title="Nạp công thức này lên bàn pha chế"
                            >
                              <RotateCcw className="w-3 h-3 text-amber-400" />
                              <span>Áp dụng</span>
                            </button>

                            <button
                              onClick={() => handleExportSavedCsv(f)}
                              className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] transition-all flex items-center gap-1"
                              title="Tải bảng CSV của phiên bản này"
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
              )}
            </div>
          ) : (
            /* TAB 2: SIDE-BY-SIDE COMPARISON (SO SÁNH SONG SONG CHI TIẾT) */
            <div className="space-y-6 animate-fadeIn">
              {/* Top Control Bar: Select any 2 formulas + Swap + Export CSV */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Columns className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs sm:text-sm font-mono uppercase tracking-wider text-cyan-300 font-bold">
                      Chọn 2 Công Thức Bất Kỳ Để So Sánh Song Song (Side-by-Side)
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleSwapFormulas}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Đảo vị trí Mẫu A ⇄ Mẫu B</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportComparisonCsv}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Xuất Bảng So Sánh (.CSV)</span>
                    </button>
                  </div>
                </div>

                {/* Dropdowns for Formula A and Formula B */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Selector A */}
                  <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        CÔNG THỨC 1 (MẪU A — GỐC ĐỐI CHIẾU):
                      </label>
                      <span className="text-[11px] font-mono text-amber-200/80">
                        {formulaA.totalVolume}mL • {formulaA.concentrationName.split(' ')[0]} (
                        {formulaA.concentrationPercent}%)
                      </span>
                    </div>
                    <select
                      value={compareIdA}
                      onChange={(e) => setCompareIdA(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-amber-500/40 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="current">
                        ⚡ Đang pha chế trên bàn Studio ({currentFormulaState.seasonTitle} -{' '}
                        {currentFormulaState.totalVolume}mL)
                      </option>
                      {savedFormulas.map((f, index) => (
                        <option key={f.id} value={f.id}>
                          #{index + 1}: {f.name} ({f.seasonTitle} • {f.totalVolume}mL •{' '}
                          {f.concentrationName.split(' ')[0]})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selector B */}
                  <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                        CÔNG THỨC 2 (MẪU B — PHIÊN BẢN SO SÁNH):
                      </label>
                      <span className="text-[11px] font-mono text-cyan-200/80">
                        {formulaB.totalVolume}mL • {formulaB.concentrationName.split(' ')[0]} (
                        {formulaB.concentrationPercent}%)
                      </span>
                    </div>
                    <select
                      value={compareIdB}
                      onChange={(e) => setCompareIdB(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-cyan-500/40 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    >
                      <option value="current">
                        ⚡ Đang pha chế trên bàn Studio ({currentFormulaState.seasonTitle} -{' '}
                        {currentFormulaState.totalVolume}mL)
                      </option>
                      {savedFormulas.map((f, index) => (
                        <option key={f.id} value={f.id}>
                          #{index + 1}: {f.name} ({f.seasonTitle} • {f.totalVolume}mL •{' '}
                          {f.concentrationName.split(' ')[0]})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quick Pill Selector for Saved Formulas */}
                {savedFormulas.length >= 2 && (
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="text-slate-400 font-mono mr-1">Cặp so sánh nhanh:</span>
                    {savedFormulas.slice(0, 4).map((f, i) => {
                      const nextF = savedFormulas[(i + 1) % savedFormulas.length];
                      if (!nextF || nextF.id === f.id) return null;
                      const isCurrentPair =
                        compareIdA === f.id && compareIdB === nextF.id;
                      return (
                        <button
                          key={`${f.id}_${nextF.id}`}
                          type="button"
                          onClick={() => {
                            setCompareIdA(f.id);
                            setCompareIdB(nextF.id);
                          }}
                          className={`px-2.5 py-1 rounded-lg font-mono transition-all border ${
                            isCurrentPair
                              ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/50 font-bold'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          #{i + 1} vs #{((i + 1) % savedFormulas.length) + 1}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* =================================================================
                  BẢNG SO SÁNH SONG SONG CHI TIẾT CÁC THÀNH PHẦN & TỈ LỆ THAY ĐỔI
                 ================================================================= */}
              <div className="rounded-2xl border border-cyan-500/30 bg-slate-950/85 overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-serif font-bold text-slate-100 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-400" />
                      <span>
                        Bảng So Sánh Song Song Chi Tiết Thành Phần & Tỉ Lệ Thay Đổi (Δ%)
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Đối chiếu trực tiếp tỉ lệ phối trộn trong hợp hương (%), thể tích tinh dầu (mL), nồng độ trong thành phẩm (%) và độ biến thiên (B − A)
                    </p>
                  </div>

                  {/* View Mode Switcher: Unified by Ingredient vs 6 Pyramid Slots */}
                  <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 self-start sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => setCompareViewMode('unified')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                        compareViewMode === 'unified'
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Theo từng nguyên liệu ({unifiedComparisonRows.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCompareViewMode('slots')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                        compareViewMode === 'slots'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Theo 6 vị trí tầng hương
                    </button>
                  </div>
                </div>

                {compareViewMode === 'unified' ? (
                  /* MODE 1: UNIFIED INGREDIENT-BY-INGREDIENT SIDE-BY-SIDE TABLE */
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-200">
                      <thead className="bg-slate-900/95 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-3.5">Tầng Hương</th>
                          <th className="py-3 px-3.5">Thành Phần Nguyên Liệu</th>
                          <th className="py-3 px-3.5 text-right bg-amber-950/20 text-amber-300 border-l border-slate-800">
                            Mẫu A: Tỉ Lệ (%)
                          </th>
                          <th className="py-3 px-3.5 text-right bg-amber-950/20 text-amber-200/80">
                            Mẫu A: mL (Thành phẩm %)
                          </th>
                          <th className="py-3 px-3.5 text-right bg-cyan-950/20 text-cyan-300 border-l border-slate-800">
                            Mẫu B: Tỉ Lệ (%)
                          </th>
                          <th className="py-3 px-3.5 text-right bg-cyan-950/20 text-cyan-200/80">
                            Mẫu B: mL (Thành phẩm %)
                          </th>
                          <th className="py-3 px-3.5 text-right border-l border-slate-800">
                            Tỉ Lệ Thay Đổi (Δ%)
                          </th>
                          <th className="py-3 px-3.5">Trạng Thái Biến Thiên</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {unifiedComparisonRows.map((row) => {
                          const tierBadgeClass =
                            row.tier === 'top'
                              ? 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
                              : row.tier === 'heart'
                              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                              : 'bg-amber-600/15 text-amber-300 border-amber-500/30';

                          return (
                            <tr
                              key={row.key}
                              className="hover:bg-slate-900/60 transition-colors"
                            >
                              <td className="py-3 px-3.5 whitespace-nowrap">
                                <span
                                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${tierBadgeClass}`}
                                >
                                  {row.tierLabel}
                                </span>
                              </td>

                              <td className="py-3 px-3.5">
                                <div className="font-semibold text-slate-100">
                                  {row.name}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {row.scentFamily}
                                </div>
                              </td>

                              {/* Formula A columns */}
                              <td className="py-3 px-3.5 text-right font-mono font-bold text-amber-300 bg-amber-950/10 border-l border-slate-800/80">
                                {row.pctA > 0 ? `${row.pctA}%` : '0%'}
                              </td>
                              <td className="py-3 px-3.5 text-right font-mono text-[11px] text-slate-300 bg-amber-950/10">
                                {row.pctA > 0 ? (
                                  <>
                                    <span>{row.mlA}mL</span>{' '}
                                    <span className="text-slate-500">
                                      ({row.finalConcA}%)
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-slate-600">—</span>
                                )}
                              </td>

                              {/* Formula B columns */}
                              <td className="py-3 px-3.5 text-right font-mono font-bold text-cyan-300 bg-cyan-950/10 border-l border-slate-800/80">
                                {row.pctB > 0 ? `${row.pctB}%` : '0%'}
                              </td>
                              <td className="py-3 px-3.5 text-right font-mono text-[11px] text-slate-300 bg-cyan-950/10">
                                {row.pctB > 0 ? (
                                  <>
                                    <span>{row.mlB}mL</span>{' '}
                                    <span className="text-slate-500">
                                      ({row.finalConcB}%)
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-slate-600">—</span>
                                )}
                              </td>

                              {/* Delta % column */}
                              <td className="py-3 px-3.5 text-right font-mono font-bold border-l border-slate-800/80 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md ${
                                    row.deltaPct > 0
                                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                      : row.deltaPct < 0
                                      ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                                      : 'bg-slate-800 text-slate-400'
                                  }`}
                                >
                                  {row.deltaPct > 0 ? (
                                    <ArrowUpRight className="w-3 h-3" />
                                  ) : row.deltaPct < 0 ? (
                                    <ArrowDownRight className="w-3 h-3" />
                                  ) : (
                                    <Minus className="w-3 h-3" />
                                  )}
                                  {row.deltaPct > 0 ? '+' : ''}
                                  {row.deltaPct}%
                                </span>
                                {row.deltaMl !== 0 && (
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    ({row.deltaMl > 0 ? '+' : ''}
                                    {row.deltaMl}mL)
                                  </div>
                                )}
                              </td>

                              {/* Status badge */}
                              <td className="py-3 px-3.5 whitespace-nowrap">
                                {row.status === 'added' && (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                                    + Thêm mới ở Mẫu B
                                  </span>
                                )}
                                {row.status === 'removed' && (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                                    − Bỏ khỏi Mẫu B
                                  </span>
                                )}
                                {row.status === 'increased' && (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                    Tăng tỉ lệ (+{row.deltaPct}%)
                                  </span>
                                )}
                                {row.status === 'decreased' && (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                    Giảm tỉ lệ ({row.deltaPct}%)
                                  </span>
                                )}
                                {row.status === 'unchanged' && (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                                    Giữ nguyên ({row.pctA}%)
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-slate-900/95 border-t border-slate-800 font-mono text-xs font-bold">
                        <tr>
                          <td colSpan={2} className="py-3 px-3.5 text-slate-300">
                            TỔNG CỘNG HỢP HƯƠNG & THỂ TÍCH CỐT TINH DẦU
                          </td>
                          <td className="py-3 px-3.5 text-right text-amber-300 border-l border-slate-800">
                            {formulaA.totalPercentage}%
                          </td>
                          <td className="py-3 px-3.5 text-right text-amber-200">
                            {formulaA.pureFragranceMl}mL ({formulaA.concentrationPercent}%)
                          </td>
                          <td className="py-3 px-3.5 text-right text-cyan-300 border-l border-slate-800">
                            {formulaB.totalPercentage}%
                          </td>
                          <td className="py-3 px-3.5 text-right text-cyan-200">
                            {formulaB.pureFragranceMl}mL ({formulaB.concentrationPercent}%)
                          </td>
                          <td colSpan={2} className="py-3 px-3.5 text-right text-emerald-300 border-l border-slate-800">
                            <span className="inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Chuẩn định lượng 100%
                            </span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  /* MODE 2: SLOT-BY-SLOT (6 POSITIONS) SIDE-BY-SIDE TABLE */
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900/95 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-3.5">Vị Trí Tầng</th>
                          <th className="py-3 px-3.5 bg-amber-950/20 text-amber-300 border-l border-slate-800">
                            Nguyên Liệu Mẫu A
                          </th>
                          <th className="py-3 px-3.5 text-right bg-amber-950/20 text-amber-300">
                            Tỉ Lệ A (%)
                          </th>
                          <th className="py-3 px-3.5 text-right bg-amber-950/20">mL A</th>
                          <th className="py-3 px-3.5 bg-cyan-950/20 text-cyan-300 border-l border-slate-800">
                            Nguyên Liệu Mẫu B
                          </th>
                          <th className="py-3 px-3.5 text-right bg-cyan-950/20 text-cyan-300">
                            Tỉ Lệ B (%)
                          </th>
                          <th className="py-3 px-3.5 text-right bg-cyan-950/20">mL B</th>
                          <th className="py-3 px-3.5 text-right border-l border-slate-800">
                            Tỉ Lệ Thay Đổi (Δ%)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 font-mono">
                        {[0, 1, 2, 3, 4, 5].map((idx) => {
                          const ingA = formulaA.calculatedIngredients[idx];
                          const ingB = formulaB.calculatedIngredients[idx];
                          const sameName = ingA?.name === ingB?.name;
                          const deltaPct = Number(
                            ((ingB?.percentage || 0) - (ingA?.percentage || 0)).toFixed(1)
                          );

                          return (
                            <tr key={idx} className="hover:bg-slate-900/40">
                              <td className="py-3 px-3.5 text-slate-400">
                                {idx < 2 ? 'Đầu' : idx < 4 ? 'Giữa' : 'Cuối'} #{idx + 1}
                              </td>
                              <td className="py-3 px-3.5 font-sans font-medium text-slate-100 border-l border-slate-800/80">
                                {ingA ? ingA.name : '—'}
                              </td>
                              <td className="py-3 px-3.5 text-right text-amber-300 font-bold">
                                {ingA ? `${ingA.percentage}%` : '—'}
                              </td>
                              <td className="py-3 px-3.5 text-right text-slate-400">
                                {ingA ? `${ingA.volumeMl}mL` : '—'}
                              </td>

                              <td className="py-3 px-3.5 font-sans font-medium text-slate-100 border-l border-slate-800/80">
                                {ingB ? ingB.name : '—'}
                                {!sameName && (
                                  <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                                    Đổi chất hương
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3.5 text-right text-cyan-300 font-bold">
                                {ingB ? `${ingB.percentage}%` : '—'}
                              </td>
                              <td className="py-3 px-3.5 text-right text-slate-400">
                                {ingB ? `${ingB.volumeMl}mL` : '—'}
                              </td>

                              <td
                                className={`py-3 px-3.5 text-right font-bold border-l border-slate-800/80 ${
                                  deltaPct > 0
                                    ? 'text-emerald-400'
                                    : deltaPct < 0
                                    ? 'text-rose-400'
                                    : 'text-slate-400'
                                }`}
                              >
                                {deltaPct > 0 ? `+${deltaPct}%` : `${deltaPct}%`}
                                {!sameName && (
                                  <span className="block text-[10px] text-amber-300 font-normal">
                                    (Thay nguyên liệu)
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Comparison Visual Radar & Tier Shift Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Left: Dual Overlay Radar SVG */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Chồng Lớp Hồ Sơ Mùi Hương (Dual Radar)
                  </h4>

                  <div className="relative">
                    <svg width={size} height={size} className="overflow-visible">
                      {/* Guide circles */}
                      {[0.25, 0.5, 0.75, 1].map((scale, idx) => (
                        <circle
                          key={idx}
                          cx={center}
                          cy={center}
                          r={radius * scale}
                          fill="none"
                          stroke="#334155"
                          strokeDasharray={scale === 1 ? 'none' : '3 3'}
                          strokeWidth="1"
                        />
                      ))}

                      {/* Axis lines */}
                      {radarA.map((_, i) => {
                        const angle = i * angleStep - Math.PI / 2;
                        return (
                          <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={center + radius * Math.cos(angle)}
                            y2={center + radius * Math.sin(angle)}
                            stroke="#1e293b"
                            strokeWidth="1.5"
                          />
                        );
                      })}

                      {/* Polygon A (Amber) */}
                      <polygon
                        points={pointsA}
                        fill="rgba(245, 158, 11, 0.2)"
                        stroke="#F59E0B"
                        strokeWidth="2.5"
                      />

                      {/* Polygon B (Cyan) */}
                      <polygon
                        points={pointsB}
                        fill="rgba(6, 182, 212, 0.2)"
                        stroke="#06B6D4"
                        strokeWidth="2.5"
                        strokeDasharray="4 2"
                      />

                      {/* Labels */}
                      {radarA.map((item, i) => {
                        const angle = i * angleStep - Math.PI / 2;
                        const labelRadius = radius + 22;
                        const x = center + labelRadius * Math.cos(angle);
                        const y = center + labelRadius * Math.sin(angle);
                        return (
                          <text
                            key={i}
                            x={x}
                            y={y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="#94A3B8"
                            fontSize="10"
                            className="font-mono"
                          >
                            {item.label}
                          </text>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-amber-300">
                      <span className="w-3 h-1 bg-amber-400 rounded-full" />
                      <span>Mẫu A: {formulaA.name.slice(0, 22)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-cyan-300">
                      <span className="w-3 h-1 bg-cyan-400 rounded-full border border-dashed" />
                      <span>Mẫu B: {formulaB.name.slice(0, 22)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Tier Breakdown Delta Table */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>So Sánh Tổng Tỉ Lệ 3 Tầng Hương (Đầu / Giữa / Cuối)</span>
                      <span className="text-[11px] text-slate-500">Độ lệch (Mẫu B − Mẫu A)</span>
                    </h4>

                    {/* Top Note Row */}
                    <div className="p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-between text-xs">
                      <span className="font-semibold text-yellow-300">Tầng Đầu (Top)</span>
                      <div className="flex items-center gap-4 font-mono">
                        <span className="text-amber-300">Mẫu A: {formulaA.tierTotals.top}%</span>
                        <span className="text-slate-500">→</span>
                        <span className="text-cyan-300">Mẫu B: {formulaB.tierTotals.top}%</span>
                        <span
                          className={`text-[11px] font-bold ${
                            formulaB.tierTotals.top - formulaA.tierTotals.top > 0
                              ? 'text-emerald-400'
                              : formulaB.tierTotals.top - formulaA.tierTotals.top < 0
                              ? 'text-rose-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {formulaB.tierTotals.top - formulaA.tierTotals.top > 0 ? '+' : ''}
                          {(formulaB.tierTotals.top - formulaA.tierTotals.top).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Heart Note Row */}
                    <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs">
                      <span className="font-semibold text-rose-300">Tầng Giữa (Heart)</span>
                      <div className="flex items-center gap-4 font-mono">
                        <span className="text-amber-300">Mẫu A: {formulaA.tierTotals.heart}%</span>
                        <span className="text-slate-500">→</span>
                        <span className="text-cyan-300">Mẫu B: {formulaB.tierTotals.heart}%</span>
                        <span
                          className={`text-[11px] font-bold ${
                            formulaB.tierTotals.heart - formulaA.tierTotals.heart > 0
                              ? 'text-emerald-400'
                              : formulaB.tierTotals.heart - formulaA.tierTotals.heart < 0
                              ? 'text-rose-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {formulaB.tierTotals.heart - formulaA.tierTotals.heart > 0 ? '+' : ''}
                          {(formulaB.tierTotals.heart - formulaA.tierTotals.heart).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Base Note Row */}
                    <div className="p-2.5 rounded-lg bg-amber-600/10 border border-amber-600/30 flex items-center justify-between text-xs">
                      <span className="font-semibold text-amber-300">Tầng Cuối (Base)</span>
                      <div className="flex items-center gap-4 font-mono">
                        <span className="text-amber-300">Mẫu A: {formulaA.tierTotals.base}%</span>
                        <span className="text-slate-500">→</span>
                        <span className="text-cyan-300">Mẫu B: {formulaB.tierTotals.base}%</span>
                        <span
                          className={`text-[11px] font-bold ${
                            formulaB.tierTotals.base - formulaA.tierTotals.base > 0
                              ? 'text-emerald-400'
                              : formulaB.tierTotals.base - formulaA.tierTotals.base < 0
                              ? 'text-rose-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {formulaB.tierTotals.base - formulaA.tierTotals.base > 0 ? '+' : ''}
                          {(formulaB.tierTotals.base - formulaA.tierTotals.base).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Summary insight */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    <strong className="text-amber-400 font-mono">
                      Nhận xét sự thay đổi giữa 2 công thức:{' '}
                    </strong>
                    {formulaA.seasonTitle !== formulaB.seasonTitle && (
                      <span>
                        Mẫu A hướng tới <strong>{formulaA.seasonTitle}</strong> trong khi Mẫu B thiết kế cho{' '}
                        <strong>{formulaB.seasonTitle}</strong>.{' '}
                      </span>
                    )}
                    {formulaB.tierTotals.base > formulaA.tierTotals.base ? (
                      <span>
                        Mẫu B tăng tỉ lệ tầng hương cuối lên <strong>{formulaB.tierTotals.base}%</strong> (
                        +{(formulaB.tierTotals.base - formulaA.tierTotals.base).toFixed(1)}%), giúp giảm tốc độ bay hơi trung bình của hệ dung dịch và kéo dài thời gian lưu hương trên da.{' '}
                      </span>
                    ) : formulaB.tierTotals.top > formulaA.tierTotals.top ? (
                      <span>
                        Mẫu B tăng tỉ lệ tầng hương đầu lên <strong>{formulaB.tierTotals.top}%</strong> (
                        +{(formulaB.tierTotals.top - formulaA.tierTotals.top).toFixed(1)}%), làm tăng áp suất hơi ban đầu giúp mở đầu tươi mát và tỏa hương nhanh hơn.{' '}
                      </span>
                    ) : (
                      <span>
                        Cả hai phiên bản duy trì tỉ lệ cấu trúc 3 tầng hương tương đương, tập trung điều chỉnh tỉ lệ thành phần nội tầng.{' '}
                      </span>
                    )}
                  </div>

                  {/* Load action buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        onLoadFormula(formulaA);
                        onClose();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-medium transition-all flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Nạp Mẫu A vào Bàn Pha Chế</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onLoadFormula(formulaB);
                        onClose();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-all flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Nạp Mẫu B vào Bàn Pha Chế</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span className="italic">
            * Chọn bất kỳ 2 công thức nào trong danh sách để đối chiếu song song (Side-by-Side) và xuất file CSV báo cáo.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
