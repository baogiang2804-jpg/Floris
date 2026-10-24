import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Download,
  FileCode,
  FlaskConical,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Compass,
  FileSpreadsheet,
  Award,
  Bookmark,
  GitCompare,
  Undo2,
  ChevronDown,
  ChevronUp,
  Loader2,
  QrCode,
  Mic,
  BookOpen,
  Bot,
  ArrowRight,
  Home,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { SeasonalSelector } from './components/SeasonalSelector';
import { VolumeAndConcentration } from './components/VolumeAndConcentration';
import { OlfactoryPyramidSliders } from './components/OlfactoryPyramidSliders';
import { ScentProfileView } from './components/ScentProfileView';
import { FormulaTableAndCsv } from './components/FormulaTableAndCsv';
import { QRAndVoiceAssistantSection } from './components/QRAndVoiceAssistantSection';
import { AIEvaluatorModal } from './components/AIEvaluatorModal';
import { PythonStreamlitModal } from './components/PythonStreamlitModal';
import { SavedFormulasModal } from './components/SavedFormulasModal';
import { WelcomeGuideModal } from './components/WelcomeGuideModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { SubWebCsvStudio } from './components/SubWebCsvStudio';
import { SubWebAIEvaluator } from './components/SubWebAIEvaluator';
import { SubWebExperimentalFormula } from './components/SubWebExperimentalFormula';
import { SubWebPythonStreamlit } from './components/SubWebPythonStreamlit';
import { PresentationShowcaseHub } from './components/PresentationShowcaseHub';
import { AddCustomIngredientModal } from './components/AddCustomIngredientModal';
import { ExperimentalFormulaPopupModal } from './components/ExperimentalFormulaPopupModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import {
  SEASONAL_TEMPLATES,
  EXPERIMENTAL_BASELINE_FORMULA,
  PerfumeIngredient,
} from './data/perfumeData';
import { SavedFormula } from './types/savedFormula';
import { EditHistorySnapshot } from './types/history';
import {
  FormulaSlot,
  calculateFormula,
  autoBalanceSlots,
  generateCsvContent,
  downloadCsvFile,
} from './utils/perfumeCalculations';

const STORAGE_KEY = 'floris_saved_formulas_v4';
const HISTORY_STORAGE_KEY = 'atelier_pyramid_history_v2';
const CUSTOM_INGREDIENTS_KEY = 'atelier_custom_ingredients_v1';

// Initial pre-loaded 3 experimental sample formulas from the group's lab report (Mẫu A - Gốc, Mẫu B - Tươi hơn, Mẫu C - Dịu/Ngọt hơn)
const INITIAL_PRESET_FORMULAS: SavedFormula[] = [
  {
    id: 'preset_floris_sample_a',
    name: 'Mẫu A - Gốc (Floris • Mùa Xuân 10mL)',
    note: 'Mẫu A - Gốc: Hoa nhài 1% (2 giọt), Đào 2% (4 giọt), Xạ hương trắng 2,5% (5 giọt), Vanilla 4,5% (9 giọt) • Dung môi 9,00 mL (180 giọt)',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    season: 'spring',
    seasonTitle: 'Mùa Xuân (Spring)',
    totalVolume: 10,
    concentrationName: 'Cốt hương Thực Nghiệm (10%)',
    concentrationPercent: 10,
    slots: [
      { key: 'top1', tier: 'top', tierLabel: 'Tầng Đầu', slotNumber: 1, ingredientId: 'top_jasmine', percentage: 10 },
      { key: 'top2', tier: 'top', tierLabel: 'Tầng Đầu', slotNumber: 2, ingredientId: 'top_jasmine_fresh', percentage: 0 },
      { key: 'heart1', tier: 'heart', tierLabel: 'Tầng Giữa', slotNumber: 3, ingredientId: 'heart_peach', percentage: 20 },
      { key: 'heart2', tier: 'heart', tierLabel: 'Tầng Giữa', slotNumber: 4, ingredientId: 'heart_peach_ripe', percentage: 0 },
      { key: 'base1', tier: 'base', tierLabel: 'Tầng Cuối', slotNumber: 5, ingredientId: 'base_musk', percentage: 25 },
      { key: 'base2', tier: 'base', tierLabel: 'Tầng Cuối', slotNumber: 6, ingredientId: 'base_vanilla', percentage: 45 },
    ],
    tierTotals: { top: 10, heart: 20, base: 70 },
    totalPercentage: 100,
    calculatedIngredients: calculateFormula(
      [
        { key: 'top1', tier: 'top', tierLabel: 'Tầng Đầu', slotNumber: 1, ingredientId: 'top_jasmine', percentage: 10 },
        { key: 'top2', tier: 'top', tierLabel: 'Tầng Đầu', slotNumber: 2, ingredientId: 'top_jasmine_fresh', percentage: 0 },
        { key: 'heart1', tier: 'heart', tierLabel: 'Tầng Giữa', slotNumber: 3, ingredientId: 'heart_peach', percentage: 20 },
        { key: 'heart2', tier: 'heart', tierLabel: 'Tầng Giữa', slotNumber: 4, ingredientId: 'heart_peach_ripe', percentage: 0 },
        { key: 'base1', tier: 'base', tierLabel: 'Tầng Cuối', slotNumber: 5, ingredientId: 'base_musk', percentage: 25 },
        { key: 'base2', tier: 'base', tierLabel: 'Tầng Cuối', slotNumber: 6, ingredientId: 'base_vanilla', percentage: 45 },
      ],
      10,
      10
    ).calculatedIngredients,
    pureFragranceMl: 1,
    carrierAlcoholMl: 9,
    perfumeTitle: 'Floris — Mẫu A (Gốc)',
  },
  {
    id: 'preset_floris_sample_b',
    name: 'Mẫu B - Tươi hơn (Floris • Tăng Hoa Nhài)',
    note: 'Mẫu B - Tươi hơn: Hoa nhài 6% (12 giọt), Đào 4% (8 giọt), Xạ hương trắng 5% (10 giọt), Vanilla 5% (10 giọt) • Dung môi 8,00 mL (160 giọt)',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    season: 'spring',
    seasonTitle: 'Mùa Xuân (Spring)',
    totalVolume: 10,
    concentrationName: 'Eau de Parfum (EDP)',
    concentrationPercent: 20,
    slots: [
      { key: 'top1', tier: 'top', tierLabel: 'Tầng Đầu', slotNumber: 1, ingredientId: 'top_jasmine', percentage: 30 },
      { key: 'top2', tier: 'top', tierLabel: 'Tầng Đầu', slotNumber: 2, ingredientId: 'top_jasmine_fresh', percentage: 0 },
      { key: 'heart1', tier: 'heart', tierLabel: 'Tầng Giữa', slotNumber: 3, ingredientId: 'heart_peach', percentage: 20 },
      { key: 'heart2', tier: 'heart', tierLabel: 'Tầng Giữa', slotNumber: 4, ingredientId: 'heart_peach_ripe', percentage: 0 },
      { key: 'base1', tier: 'base', tierLabel: 'Tầng Cuối', slotNumber: 5, ingredientId: 'base_musk', percentage: 25 },
      { key: 'base2', tier: 'base', tierLabel: 'Tầng Cuối', slotNumber: 6, ingredientId: 'base_vanilla', percentage: 25 },
    ],
    tierTotals: { top: 30, heart: 20, base: 50 },
    totalPercentage: 100,
    calculatedIngredients: calculateFormula(
      [
        { key: 'top1', tier: 'top', tierLabel: 'Tầng Đầu', slotNumber: 1, ingredientId: 'top_jasmine', percentage: 30 },
        { key: 'top2', tier: 'top', tierLabel: 'Tầng Đầu', slotNumber: 2, ingredientId: 'top_jasmine_fresh', percentage: 0 },
        { key: 'heart1', tier: 'heart', tierLabel: 'Tầng Giữa', slotNumber: 3, ingredientId: 'heart_peach', percentage: 20 },
        { key: 'heart2', tier: 'heart', tierLabel: 'Tầng Giữa', slotNumber: 4, ingredientId: 'heart_peach_ripe', percentage: 0 },
        { key: 'base1', tier: 'base', tierLabel: 'Tầng Cuối', slotNumber: 5, ingredientId: 'base_musk', percentage: 25 },
        { key: 'base2', tier: 'base', tierLabel: 'Tầng Cuối', slotNumber: 6, ingredientId: 'base_vanilla', percentage: 25 },
      ],
      10,
      20
    ).calculatedIngredients,
    pureFragranceMl: 2,
    carrierAlcoholMl: 8,
    perfumeTitle: 'Floris — Mẫu B (Tươi hơn)',
  },
  {
    id: 'preset_floris_sample_c',
    name: 'Mẫu C - Dịu/Ngọt hơn (Floris • Tăng Xạ Hương & Vanilla)',
    note: 'Mẫu C - Dịu/Ngọt hơn: Hoa nhài 4% (8 giọt), Đào 4% (8 giọt), Xạ hương trắng 6% (12 giọt), Vanilla 6% (12 giọt) • Dung môi 8,00 mL (160 giọt)',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    season: 'spring',
    seasonTitle: 'Mùa Xuân (Spring)',
    totalVolume: 10,
    concentrationName: 'Eau de Parfum (EDP)',
    concentrationPercent: 20,
    slots: [
      { key: 'top1', tier: 'top', tierLabel: 'Tầng Đầu', slotNumber: 1, ingredientId: 'top_jasmine', percentage: 20 },
      { key: 'top2', tier: 'top', tierLabel: 'Tầng Đầu', slotNumber: 2, ingredientId: 'top_jasmine_fresh', percentage: 0 },
      { key: 'heart1', tier: 'heart', tierLabel: 'Tầng Giữa', slotNumber: 3, ingredientId: 'heart_peach', percentage: 20 },
      { key: 'heart2', tier: 'heart', tierLabel: 'Tầng Giữa', slotNumber: 4, ingredientId: 'heart_peach_ripe', percentage: 0 },
      { key: 'base1', tier: 'base', tierLabel: 'Tầng Cuối', slotNumber: 5, ingredientId: 'base_musk', percentage: 30 },
      { key: 'base2', tier: 'base', tierLabel: 'Tầng Cuối', slotNumber: 6, ingredientId: 'base_vanilla', percentage: 30 },
    ],
    tierTotals: { top: 20, heart: 20, base: 60 },
    totalPercentage: 100,
    calculatedIngredients: calculateFormula(
      [
        { key: 'top1', tier: 'top', tierLabel: 'Tầng Đầu', slotNumber: 1, ingredientId: 'top_jasmine', percentage: 20 },
        { key: 'top2', tier: 'top', tierLabel: 'Tầng Đầu', slotNumber: 2, ingredientId: 'top_jasmine_fresh', percentage: 0 },
        { key: 'heart1', tier: 'heart', tierLabel: 'Tầng Giữa', slotNumber: 3, ingredientId: 'heart_peach', percentage: 20 },
        { key: 'heart2', tier: 'heart', tierLabel: 'Tầng Giữa', slotNumber: 4, ingredientId: 'heart_peach_ripe', percentage: 0 },
        { key: 'base1', tier: 'base', tierLabel: 'Tầng Cuối', slotNumber: 5, ingredientId: 'base_musk', percentage: 30 },
        { key: 'base2', tier: 'base', tierLabel: 'Tầng Cuối', slotNumber: 6, ingredientId: 'base_vanilla', percentage: 30 },
      ],
      10,
      20
    ).calculatedIngredients,
    pureFragranceMl: 2,
    carrierAlcoholMl: 8,
    perfumeTitle: 'Floris — Mẫu C (Dịu/Ngọt hơn)',
  },
];

export default function App() {
  // 1. Season state
  const [selectedSeason, setSelectedSeason] = useState<'spring' | 'summer' | 'autumn' | 'winter'>(
    EXPERIMENTAL_BASELINE_FORMULA.season
  );

  // 2. Volume & Concentration (Initialized to Group's 10,00 mL / 20% EDP Experimental Formula)
  const [totalVolume, setTotalVolume] = useState<number>(EXPERIMENTAL_BASELINE_FORMULA.totalVolume);
  const [concentrationName, setConcentrationName] = useState<string>(
    EXPERIMENTAL_BASELINE_FORMULA.concentrationName
  );
  const [concentrationPercent, setConcentrationPercent] = useState<number>(
    EXPERIMENTAL_BASELINE_FORMULA.concentrationPercent
  );

  // 3. Formula Slots (3 Tiers / 6 Ingredients) — Initialized with Group's Experimental Baseline Formula
  const baselineSlots = EXPERIMENTAL_BASELINE_FORMULA.slots;
  const [slots, setSlots] = useState<FormulaSlot[]>([
    {
      key: 'top1',
      tier: 'top',
      tierLabel: 'Tầng Đầu',
      slotNumber: 1,
      ingredientId: baselineSlots.top1.id,
      percentage: baselineSlots.top1.percentage,
      observedNote: baselineSlots.top1.observedNote,
    },
    {
      key: 'top2',
      tier: 'top',
      tierLabel: 'Tầng Đầu',
      slotNumber: 2,
      ingredientId: baselineSlots.top2.id,
      percentage: baselineSlots.top2.percentage,
      observedNote: baselineSlots.top2.observedNote,
    },
    {
      key: 'heart1',
      tier: 'heart',
      tierLabel: 'Tầng Giữa',
      slotNumber: 3,
      ingredientId: baselineSlots.heart1.id,
      percentage: baselineSlots.heart1.percentage,
      observedNote: baselineSlots.heart1.observedNote,
    },
    {
      key: 'heart2',
      tier: 'heart',
      tierLabel: 'Tầng Giữa',
      slotNumber: 4,
      ingredientId: baselineSlots.heart2.id,
      percentage: baselineSlots.heart2.percentage,
      observedNote: baselineSlots.heart2.observedNote,
    },
    {
      key: 'base1',
      tier: 'base',
      tierLabel: 'Tầng Cuối',
      slotNumber: 5,
      ingredientId: baselineSlots.base1.id,
      percentage: baselineSlots.base1.percentage,
      observedNote: baselineSlots.base1.observedNote,
    },
    {
      key: 'base2',
      tier: 'base',
      tierLabel: 'Tầng Cuối',
      slotNumber: 6,
      ingredientId: baselineSlots.base2.id,
      percentage: baselineSlots.base2.percentage,
      observedNote: baselineSlots.base2.observedNote,
    },
  ]);

  // Optional custom perfume title (either from AI or user)
  const [perfumeName, setPerfumeName] = useState<string>(EXPERIMENTAL_BASELINE_FORMULA.title);

  // Active Web Page state ('main' = Web Chính, 'experimental' = Web Riêng Công Thức Thực Nghiệm, 'csv' = Web Phụ 1 Nhập Công Thức & CSV, 'ai' = Web Phụ 2 Chuyên Gia AI Thẩm Định, 'python' = Web Phụ 3 App Python Streamlit)
  const [activePage, setActivePage] = useState<'main' | 'experimental' | 'csv' | 'ai' | 'python'>('main');

  // Modals & Widgets state
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isPythonModalOpen, setIsPythonModalOpen] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isVoiceWidgetOpen, setIsVoiceWidgetOpen] = useState(false);
  const [isBottomBarCollapsed, setIsBottomBarCollapsed] = useState(false);
  const [isInlineGuideExpanded, setIsInlineGuideExpanded] = useState(false);
  // Keep guide modal closed on initial open so the Group's Experimental Baseline Formula is shown first before any guide
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  // Dedicated Pop-up for Group's Experimental Baseline Formula (Floris 10mL) — opens immediately on launch before the guide
  const [isExperimentalPopupOpen, setIsExperimentalPopupOpen] = useState<boolean>(true);

  // Saved formulas state with localStorage persistence
  const [savedFormulas, setSavedFormulas] = useState<SavedFormula[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Lỗi nạp danh sách công thức từ localStorage:', e);
    }
    return INITIAL_PRESET_FORMULAS;
  });

  // Save to localStorage whenever savedFormulas changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedFormulas));
    } catch (e) {
      console.error('Lỗi lưu danh sách công thức vào localStorage:', e);
    }
  }, [savedFormulas]);

  // 5 Most Recent Edit Snapshots stored in localStorage for Undo
  const [editHistory, setEditHistory] = useState<EditHistorySnapshot[]>(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed.slice(0, 5);
      }
    } catch (e) {
      console.error('Lỗi nạp lịch sử chỉnh sửa từ localStorage:', e);
    }
    return [];
  });

  // Sync editHistory to localStorage (max 5 items)
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(editHistory));
    } catch (e) {
      console.error('Lỗi lưu lịch sử chỉnh sửa vào localStorage:', e);
    }
  }, [editHistory]);

  // Custom User-Created Ingredients stored in localStorage
  const [customIngredients, setCustomIngredients] = useState<Record<'top' | 'heart' | 'base', PerfumeIngredient[]>>(() => {
    try {
      const stored = localStorage.getItem(CUSTOM_INGREDIENTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Lỗi nạp nguyên liệu tùy chỉnh:', e);
    }
    return { top: [], heart: [], base: [] };
  });

  // Sync custom ingredients to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_INGREDIENTS_KEY, JSON.stringify(customIngredients));
    } catch (e) {
      console.error('Lỗi lưu nguyên liệu tùy chỉnh vào localStorage:', e);
    }
  }, [customIngredients]);

  // Add Custom Ingredient Modal state
  const [isAddCustomIngredientOpen, setIsAddCustomIngredientOpen] = useState(false);
  const [addCustomTargetSlotKey, setAddCustomTargetSlotKey] = useState<FormulaSlot['key'] | null>(null);
  const [addCustomTargetTier, setAddCustomTargetTier] = useState<'top' | 'heart' | 'base'>('heart');

  // Calculations (including custom ingredients in formula lookups)
  const formulaResults = useMemo(() => {
    return calculateFormula(slots, totalVolume, concentrationPercent, customIngredients);
  }, [slots, totalVolume, concentrationPercent, customIngredients]);

  // Toast / notification state for quick action feedback
  const [quickNotification, setQuickNotification] = useState<string | null>(null);
  const triggerNotification = (text: string) => {
    setQuickNotification(text);
    setTimeout(() => setQuickNotification(null), 3500);
  };

  // CSV Export cute waiting and done toast state
  const [csvExportToast, setCsvExportToast] = useState<{
    message: string;
    type: 'waiting' | 'done';
  } | null>(null);

  // Confetti fireworks celebration helper
  const triggerConfettiCelebration = () => {
    try {
      const end = Date.now() + 1100;
      const colors = ['#F59E0B', '#10B981', '#EC4899', '#38BDF8', '#FACC15', '#A855F7'];

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors,
          zIndex: 99999,
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors,
          zIndex: 99999,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();

      // Central burst
      confetti({
        particleCount: 85,
        spread: 100,
        origin: { y: 0.6 },
        colors,
        zIndex: 99999,
      });
    } catch (err) {
      console.warn('Confetti error:', err);
    }
  };

  // Helper to record a snapshot into the 5-step history before making modifications
  const pushHistorySnapshot = (actionSummary: string, snapshotSlots = slots) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const snapshot: EditHistorySnapshot = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: timeStr,
      isoDate: now.toISOString(),
      actionSummary,
      slots: JSON.parse(JSON.stringify(snapshotSlots)),
      tierTotals: { ...formulaResults.tierTotals },
      totalPercentage: formulaResults.totalPercentage,
    };

    setEditHistory((prev) => {
      // If the top snapshot was recorded within the last 1.2s for rapid slider dragging of the same slot,
      // update description but keep the initial baseline slots of that drag
      const isQuickSuccession = prev.length > 0 && (Date.now() - new Date(prev[0].isoDate).getTime() < 1200);
      if (isQuickSuccession && prev[0].actionSummary.split(':')[0] === actionSummary.split(':')[0]) {
        const updatedFirst = { ...prev[0], actionSummary };
        return [updatedFirst, ...prev.slice(1)].slice(0, 5);
      }
      return [snapshot, ...prev].slice(0, 5);
    });
  };

  // Handlers for Formula Management
  const handleSelectSeason = (season: 'spring' | 'summer' | 'autumn' | 'winter') => {
    setSelectedSeason(season);
  };

  const handleApplySeasonalTemplate = () => {
    pushHistorySnapshot(`Tải công thức mẫu ${SEASONAL_TEMPLATES[selectedSeason].title}`);
    const template = SEASONAL_TEMPLATES[selectedSeason].defaultFormula;
    setSlots([
      { ...slots[0], ingredientId: template.top1.id, percentage: template.top1.percentage },
      { ...slots[1], ingredientId: template.top2.id, percentage: template.top2.percentage },
      { ...slots[2], ingredientId: template.heart1.id, percentage: template.heart1.percentage },
      { ...slots[3], ingredientId: template.heart2.id, percentage: template.heart2.percentage },
      { ...slots[4], ingredientId: template.base1.id, percentage: template.base1.percentage },
      { ...slots[5], ingredientId: template.base2.id, percentage: template.base2.percentage },
    ]);
  };

  const handleAutoBalance = () => {
    pushHistorySnapshot(`Cân bằng tự động 100% (từ ${formulaResults.totalPercentage}%)`);
    setSlots((prev) => autoBalanceSlots(prev));
    // Confetti fireworks celebration when balanced to 100%
    triggerConfettiCelebration();
    triggerNotification('🎉 Tuyệt vời! Công thức đã được cân bằng chính xác 100%!');
  };

  const handleResetDefault = () => {
    handleApplySeasonalTemplate();
  };

  const handleUpdateSlotPercentage = (key: FormulaSlot['key'], val: number) => {
    const currentSlot = slots.find((s) => s.key === key);
    if (currentSlot && currentSlot.percentage !== val) {
      const ingName = formulaResults.calculatedIngredients.find((c) => c.slotKey === key)?.name || currentSlot.key;
      pushHistorySnapshot(`Chỉnh ${ingName}: ${currentSlot.percentage}% → ${val}%`);
    }
    setSlots((prev) =>
      prev.map((s) => (s.key === key ? { ...s, percentage: Math.max(0, val) } : s))
    );
  };

  const handleUpdateSlotIngredient = (key: FormulaSlot['key'], ingredientId: string) => {
    const currentSlot = slots.find((s) => s.key === key);
    if (currentSlot && currentSlot.ingredientId !== ingredientId) {
      pushHistorySnapshot(`Đổi nguyên liệu #${currentSlot.slotNumber} (${currentSlot.tierLabel})`);
    }
    setSlots((prev) => prev.map((s) => (s.key === key ? { ...s, ingredientId } : s)));
  };

  const handleUpdateSlotCustomName = (key: FormulaSlot['key'], customName: string) => {
    setSlots((prev) => prev.map((s) => (s.key === key ? { ...s, customName } : s)));
  };

  const handleUpdateSlotObservedNote = (key: FormulaSlot['key'], observedNote: string) => {
    setSlots((prev) => prev.map((s) => (s.key === key ? { ...s, observedNote } : s)));
  };

  const handleRestoreExperimentalBaseline = () => {
    pushHistorySnapshot('Khôi phục công thức thực nghiệm gốc của nhóm');
    const b = EXPERIMENTAL_BASELINE_FORMULA;
    setSelectedSeason(b.season);
    setTotalVolume(b.totalVolume);
    setConcentrationName(b.concentrationName);
    setConcentrationPercent(b.concentrationPercent);
    setPerfumeName(b.title);
    setSlots([
      {
        key: 'top1',
        tier: 'top',
        tierLabel: 'Tầng Đầu',
        slotNumber: 1,
        ingredientId: b.slots.top1.id,
        percentage: b.slots.top1.percentage,
        observedNote: b.slots.top1.observedNote,
      },
      {
        key: 'top2',
        tier: 'top',
        tierLabel: 'Tầng Đầu',
        slotNumber: 2,
        ingredientId: b.slots.top2.id,
        percentage: b.slots.top2.percentage,
        observedNote: b.slots.top2.observedNote,
      },
      {
        key: 'heart1',
        tier: 'heart',
        tierLabel: 'Tầng Giữa',
        slotNumber: 3,
        ingredientId: b.slots.heart1.id,
        percentage: b.slots.heart1.percentage,
        observedNote: b.slots.heart1.observedNote,
      },
      {
        key: 'heart2',
        tier: 'heart',
        tierLabel: 'Tầng Giữa',
        slotNumber: 4,
        ingredientId: b.slots.heart2.id,
        percentage: b.slots.heart2.percentage,
        observedNote: b.slots.heart2.observedNote,
      },
      {
        key: 'base1',
        tier: 'base',
        tierLabel: 'Tầng Cuối',
        slotNumber: 5,
        ingredientId: b.slots.base1.id,
        percentage: b.slots.base1.percentage,
        observedNote: b.slots.base1.observedNote,
      },
      {
        key: 'base2',
        tier: 'base',
        tierLabel: 'Tầng Cuối',
        slotNumber: 6,
        ingredientId: b.slots.base2.id,
        percentage: b.slots.base2.percentage,
        observedNote: b.slots.base2.observedNote,
      },
    ]);
    triggerNotification('🧪 Đã khôi phục Công thức nước hoa thực nghiệm gốc của nhóm!');
  };

  // Undo and History Handlers
  const handleUndo = () => {
    if (editHistory.length === 0) return;
    const [lastSnapshot, ...remaining] = editHistory;
    setSlots(JSON.parse(JSON.stringify(lastSnapshot.slots)));
    setEditHistory(remaining);
    triggerNotification(`Đã hoàn tác: ${lastSnapshot.actionSummary}`);
  };

  const handleRestoreHistorySnapshot = (snapshot: EditHistorySnapshot) => {
    pushHistorySnapshot(`Trước khi quay lại bước (${snapshot.timestamp})`);
    setSlots(JSON.parse(JSON.stringify(snapshot.slots)));
    triggerNotification(`Đã quay lại trạng thái lúc ${snapshot.timestamp}`);
  };

  const handleClearHistory = () => {
    setEditHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
    triggerNotification('Đã xóa toàn bộ lịch sử 5 bước gần nhất');
  };

  // Custom Ingredient Handlers
  const handleOpenAddCustomIngredient = (
    slotKey: FormulaSlot['key'],
    tier: 'top' | 'heart' | 'base'
  ) => {
    setAddCustomTargetSlotKey(slotKey);
    setAddCustomTargetTier(tier);
    setIsAddCustomIngredientOpen(true);
  };

  const handleAddCustomIngredient = (
    ingredient: PerfumeIngredient,
    slotKey?: FormulaSlot['key']
  ) => {
    // 1. Save new custom ingredient into state
    setCustomIngredients((prev) => ({
      ...prev,
      [ingredient.tier]: [ingredient, ...(prev[ingredient.tier] || [])],
    }));

    // 2. Automatically select this ingredient for the target slot
    if (slotKey) {
      handleUpdateSlotIngredient(slotKey, ingredient.id);
    }

    triggerNotification(`Đã thêm nguyên liệu "${ingredient.name}" và áp dụng vào tầng hương!`);
  };


  const handleSaveCurrentFormula = (name: string, note?: string) => {
    const newFormula: SavedFormula = {
      id: `formula_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name,
      note,
      createdAt: new Date().toISOString(),
      season: selectedSeason,
      seasonTitle: SEASONAL_TEMPLATES[selectedSeason].title,
      totalVolume,
      concentrationName,
      concentrationPercent,
      slots: JSON.parse(JSON.stringify(slots)),
      tierTotals: { ...formulaResults.tierTotals },
      totalPercentage: formulaResults.totalPercentage,
      calculatedIngredients: JSON.parse(JSON.stringify(formulaResults.calculatedIngredients)),
      pureFragranceMl: formulaResults.pureFragranceMl,
      carrierAlcoholMl: formulaResults.carrierAlcoholMl,
      perfumeTitle: perfumeName,
    };

    setSavedFormulas((prev) => [newFormula, ...prev]);
    triggerNotification(`Đã lưu "${name}" thành công! Có thể so sánh trực tiếp.`);
  };

  const handleQuickSave = () => {
    const count = savedFormulas.length + 1;
    const autoName = `Bản thử #${count} - ${SEASONAL_TEMPLATES[selectedSeason].title.split(' ')[0]} (${totalVolume}mL)`;
    handleSaveCurrentFormula(autoName, `Tỉ lệ ${formulaResults.tierTotals.top}/${formulaResults.tierTotals.heart}/${formulaResults.tierTotals.base}%`);
  };

  const handleLoadFormula = (f: SavedFormula) => {
    setSelectedSeason(f.season);
    setTotalVolume(f.totalVolume);
    setConcentrationName(f.concentrationName);
    setConcentrationPercent(f.concentrationPercent);
    setSlots(JSON.parse(JSON.stringify(f.slots)));
    if (f.perfumeTitle) setPerfumeName(f.perfumeTitle);
    triggerNotification(`Đã nạp công thức "${f.name}" vào phòng pha chế!`);
  };

  const handleDeleteFormula = (id: string) => {
    setSavedFormulas((prev) => prev.filter((f) => f.id !== id));
  };

  const handleClearAllFormulas = () => {
    setSavedFormulas([]);
  };

  const handleExportCsv = () => {
    // 1. Hiển thị thông báo chờ: "Chờ tý nho, tụi mình đang xuất🥺🥺"
    setCsvExportToast({
      message: 'Chờ tý nho, tụi mình đang xuất🥺🥺',
      type: 'waiting',
    });

    // 2. Tạo độ trễ chân thực và xuất file CSV
    setTimeout(() => {
      try {
        const csvStr = generateCsvContent(
          perfumeName,
          SEASONAL_TEMPLATES[selectedSeason].title,
          totalVolume,
          concentrationName,
          formulaResults.calculatedIngredients,
          formulaResults.tierTotals,
          'Gemini AI Master Perfumer'
        );
        downloadCsvFile(csvStr, `cong_thuc_nuoc_hoa_${totalVolume}ml_${selectedSeason}.csv`);

        // 3. Thay thế bằng thông báo hoàn thành: "Xong rùi nàaa"
        setCsvExportToast({
          message: 'Xong rùi nàaa',
          type: 'done',
        });

        // Bắn pháo hoa nhỏ ăn mừng xuất file
        try {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.75 },
            colors: ['#F59E0B', '#10B981', '#38BDF8'],
            zIndex: 99999,
          });
        } catch (e) {
          console.warn(e);
        }

        // Tự động đóng thông báo sau 3.5 giây
        setTimeout(() => {
          setCsvExportToast(null);
        }, 3500);
      } catch (err) {
        console.error(err);
        setCsvExportToast(null);
        triggerNotification('Có lỗi khi tạo file CSV, vui lòng thử lại!');
      }
    }, 1200);
  };

  // QR Visitor Mode state & URL parameter loader when scanning QR Code
  const [isQrVisitorMode, setIsQrVisitorMode] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const pageParam = params.get('page');
      if (pageParam === 'csv' || pageParam === 'ai' || pageParam === 'main') {
        setActivePage(pageParam);
      }

      if (params.get('qr') === '1') {
        setIsQrVisitorMode(true);
        setActivePage('ai');
        // Hide initial welcome guide if entering via QR scan so visitor goes straight to interaction
        setIsGuideOpen(false);

        const seasonParam = params.get('season');
        if (
          seasonParam === 'spring' ||
          seasonParam === 'summer' ||
          seasonParam === 'autumn' ||
          seasonParam === 'winter'
        ) {
          setSelectedSeason(seasonParam);
        }

        const volParam = parseInt(params.get('vol') || '', 10);
        if (!isNaN(volParam) && volParam >= 5 && volParam <= 1000) {
          setTotalVolume(volParam);
        }

        const concParam = parseInt(params.get('conc') || '', 10);
        if (!isNaN(concParam) && concParam >= 5 && concParam <= 40) {
          setConcentrationPercent(concParam);
        }

        const nameParam = params.get('name');
        if (nameParam) {
          setPerfumeName(nameParam);
        }

        const slotsParam = params.get('s');
        if (slotsParam) {
          const parsedParts = slotsParam.split(',');
          setSlots((prev) =>
            prev.map((slot) => {
              const match = parsedParts.find((p) => p.startsWith(`${slot.key}:`));
              if (!match) return slot;
              const [, ingId, pctStr] = match.split(':');
              const pct = parseInt(pctStr, 10);
              return {
                ...slot,
                ingredientId: ingId || slot.ingredientId,
                percentage: !isNaN(pct) ? pct : slot.percentage,
              };
            })
          );
        }

        setTimeout(() => {
          const el = document.getElementById('qr-voice-interactive-station');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          triggerNotification('📱 Đã nạp công thức từ mã QR! Hãy nhập hoặc nói yêu cầu điều chỉnh.');
        }, 400);
      }
    } catch (e) {
      console.warn('QR param parse error:', e);
    }
  }, []);

  // Handlers for applying or saving AI-proposed formula from QR/Voice station
  const handleApplyAIAdjustedFormula = (
    adjustedItems: { slotKey: FormulaSlot['key']; newPercentage: number }[],
    proposedName?: string,
    summaryNote?: string
  ) => {
    pushHistorySnapshot(
      `AI điều chỉnh: ${summaryNote ? summaryNote.slice(0, 32) : 'Tỉ lệ mới 100%'}`
    );
    setSlots((prev) =>
      prev.map((slot) => {
        const found = adjustedItems.find((a) => a.slotKey === slot.key);
        return found ? { ...slot, percentage: found.newPercentage } : slot;
      })
    );
    if (proposedName) {
      setPerfumeName(proposedName);
    }
    triggerConfettiCelebration();
    triggerNotification('✨ Đã áp dụng công thức đề xuất của AI lên thanh trượt!');
  };

  const handleSaveProposedFormulaToDrawer = (
    adjustedItems: { slotKey: FormulaSlot['key']; newPercentage: number }[],
    proposedName: string,
    note: string
  ) => {
    const proposedSlots: FormulaSlot[] = slots.map((slot) => {
      const found = adjustedItems.find((a) => a.slotKey === slot.key);
      return found ? { ...slot, percentage: found.newPercentage } : { ...slot };
    });
    const proposedCalc = calculateFormula(
      proposedSlots,
      totalVolume,
      concentrationPercent,
      customIngredients
    );

    const newFormula: SavedFormula = {
      id: `formula_ai_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: proposedName,
      note,
      createdAt: new Date().toISOString(),
      season: selectedSeason,
      seasonTitle: SEASONAL_TEMPLATES[selectedSeason].title,
      totalVolume,
      concentrationName,
      concentrationPercent,
      slots: proposedSlots,
      tierTotals: { ...proposedCalc.tierTotals },
      totalPercentage: proposedCalc.totalPercentage,
      calculatedIngredients: proposedCalc.calculatedIngredients,
      pureFragranceMl: proposedCalc.pureFragranceMl,
      carrierAlcoholMl: proposedCalc.carrierAlcoholMl,
      perfumeTitle: proposedName,
    };

    setSavedFormulas((prev) => [newFormula, ...prev]);
    triggerNotification(`💾 Đã lưu "${proposedName}" vào danh sách so sánh!`);
  };

  // Handler for syncing formula from Python Streamlit app
  const handleSyncFromPython = (
    items: { name: string; percentage: number }[],
    pythonSeason: string,
    pythonVolume: number
  ) => {
    pushHistorySnapshot('Trước khi đồng bộ công thức từ App Python');
    const seasonMap: Record<string, 'spring' | 'summer' | 'autumn' | 'winter'> = {
      'Xuân': 'spring',
      'Hạ': 'summer',
      'Thu': 'autumn',
      'Đông': 'winter',
    };
    if (seasonMap[pythonSeason]) {
      setSelectedSeason(seasonMap[pythonSeason]);
    }
    setTotalVolume(pythonVolume);

    const fragranceItems = items.filter(
      (it) => !it.name.toLowerCase().includes('ethanol') && !it.name.toLowerCase().includes('nước cất')
    );
    const totalFragranceRawPct = fragranceItems.reduce((acc, it) => acc + it.percentage, 0);

    if (totalFragranceRawPct > 0) {
      const concentration = Math.min(40, Math.max(10, Math.round(totalFragranceRawPct)));
      setConcentrationPercent(concentration);
      setConcentrationName(concentration >= 20 ? 'Eau de Parfum (EDP)' : 'Eau de Toilette (EDT)');

      const jasmine = items.find((i) => i.name.includes('nhài'))?.percentage || 0;
      const peach = items.find((i) => i.name.includes('Đào') || i.name.includes('đào'))?.percentage || 0;
      const vanilla = items.find((i) => i.name.includes('Vanilla') || i.name.includes('Vani'))?.percentage || 0;
      const musk = items.find((i) => i.name.includes('Xạ hương'))?.percentage || 0;

      const normTop1 = Math.round((peach / totalFragranceRawPct) * 100);
      const normHeart1 = Math.round((jasmine / totalFragranceRawPct) * 100);
      const normBase1 = Math.round((musk / totalFragranceRawPct) * 100);
      const normBase2 = Math.max(0, 100 - (normTop1 + normHeart1 + normBase1));

      setSlots((prev) =>
        prev.map((slot) => {
          if (slot.key === 'top1') return { ...slot, percentage: normTop1 };
          if (slot.key === 'top2') return { ...slot, percentage: 0 };
          if (slot.key === 'heart1') return { ...slot, percentage: normHeart1 };
          if (slot.key === 'heart2') return { ...slot, percentage: 0 };
          if (slot.key === 'base1') return { ...slot, percentage: normBase1 };
          if (slot.key === 'base2') return { ...slot, percentage: normBase2 };
          return slot;
        })
      );
    }

    setPerfumeName(`Floris — Công thức từ App Python (${pythonSeason} ${pythonVolume}mL)`);
    triggerConfettiCelebration();
    triggerNotification('🌸 Đã đồng bộ công thức từ App Python vào Xưởng pha chế!');
    setActivePage('main');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler for importing formula from CSV in SubWebCsvStudio
  const handleImportFormulaFromCsv = (importedData: {
    perfumeName?: string;
    season?: 'spring' | 'summer' | 'autumn' | 'winter';
    totalVolume?: number;
    UpdatedSlots: {
      key: FormulaSlot['key'];
      percentage: number;
      customName?: string;
      ingredientId?: string;
    }[];
  }) => {
    pushHistorySnapshot('Trước khi nhập công thức từ file CSV');
    if (importedData.perfumeName) {
      setPerfumeName(importedData.perfumeName);
    }
    if (importedData.season) {
      setSelectedSeason(importedData.season);
    }
    if (importedData.totalVolume) {
      setTotalVolume(importedData.totalVolume);
    }
    setSlots((prev) =>
      prev.map((slot) => {
        const found = importedData.UpdatedSlots.find((u) => u.key === slot.key);
        if (!found) return slot;
        return {
          ...slot,
          percentage: found.percentage,
          ingredientId: found.ingredientId || slot.ingredientId,
          customName: found.customName !== undefined ? found.customName : slot.customName,
        };
      })
    );
    triggerConfettiCelebration();
    triggerNotification('📂 Đã nhập công thức từ file CSV thành công!');
  };

  // Global Keyboard Shortcuts Listener:
  // - Ctrl+S / Cmd+S: Lưu nhanh (Quick Save)
  // - Ctrl+Z / Cmd+Z: Hoàn tác (Undo)
  // - Ctrl+E / Cmd+E: Xuất file CSV (Export CSV)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey) return;

      const key = e.key.toLowerCase();
      const target = e.target as HTMLElement | null;
      const isTextInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (key === 's') {
        e.preventDefault();
        handleQuickSave();
      } else if (key === 'e') {
        e.preventDefault();
        handleExportCsv();
      } else if (key === 'z' && !e.shiftKey) {
        // Allow native text undo inside input/textarea, otherwise undo formula state
        if (!isTextInput) {
          e.preventDefault();
          if (editHistory.length > 0) {
            handleUndo();
          } else {
            triggerNotification('Chưa có bước chỉnh sửa nào để hoàn tác (Ctrl+Z)');
          }
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* 1. Header with Sub-Webs Navigation, Voice Widget & User Guide */}
      <Header
        isValidTotal={formulaResults.isValidTotal}
        totalPercentage={formulaResults.totalPercentage}
        savedCount={savedFormulas.length}
        activePage={activePage}
        onChangePage={(page) => {
          setActivePage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSavedFormulas={() => setIsSavedModalOpen(true)}
        onQuickSave={handleQuickSave}
        onOpenPythonCode={() => setIsPythonModalOpen(true)}
        onExportCsv={handleExportCsv}
        onAutoBalance={handleAutoBalance}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenVoiceWidget={() => setIsVoiceWidgetOpen(true)}
        onOpenExperimentalPopup={() => setIsExperimentalPopupOpen(true)}
      />

      {/* Floating Global Quick Toast */}
      {quickNotification && (
        <div className="fixed top-16 right-4 sm:right-8 z-50 bg-slate-900 border border-slate-700 text-slate-100 px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2.5 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{quickNotification}</span>
        </div>
      )}

      {/* CSV Export Notification Toast */}
      {csvExportToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div
            className={`px-4 py-2.5 rounded-lg shadow-lg border flex items-center gap-2.5 text-xs font-medium transition-opacity duration-200 ${
              csvExportToast.type === 'waiting'
                ? 'bg-slate-900 text-amber-200 border-slate-700'
                : 'bg-slate-900 text-emerald-200 border-emerald-500/40'
            }`}
          >
            {csvExportToast.type === 'waiting' ? (
              <>
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                <span>{csvExportToast.message}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{csvExportToast.message}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* 2. Clean Editorial Intro Header on Main Page */}
      {activePage === 'main' && (
        <section className="border-b border-slate-800/80 bg-slate-950 px-4 py-8 sm:px-8">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span>Báo cáo thực hành Hóa học</span>
                <span aria-hidden="true">·</span>
                <span>Chủ đề Mùa Xuân (EDP 20%)</span>
                <span aria-hidden="true">·</span>
                <span>Tổ 1 — Lớp 12A13 THPT Nguyễn Thị Minh Khai</span>
              </div>

              <h1
                className="text-3xl sm:text-4xl font-serif font-bold text-slate-100 tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Dự án nước hoa thực nghiệm Floris &amp; góc thử nghiệm mùi hương
              </h1>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Tổng hợp số liệu pha chế mẫu nước hoa thực nghiệm ban đầu của nhóm (10,00 mL), kết hợp công cụ điều chỉnh tỉ lệ 3 tầng hương và đối chiếu giả thuyết cải tiến cùng AI.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActivePage('experimental');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Mở trang Công thức thực nghiệm</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExperimentalPopupOpen(true)}
                className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>Xem nhanh Pop-up</span>
              </button>

              <button
                type="button"
                onClick={() => setIsVoiceWidgetOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#2D6344] to-[#3B7A57] hover:from-[#245237] hover:to-[#2D6344] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-2 whitespace-nowrap ring-2 ring-[#3B7A57]/20 group active:scale-95"
                title="Mở trợ lý giọng nói Gemini Live để tương tác trực tiếp"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-200"></span>
                </span>
                <Mic className="w-3.5 h-3.5 text-emerald-100 group-hover:scale-110 transition-transform" />
                <span>Gemini Live (Nói để chỉnh)</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 3. Workspace Router */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 md:px-8 pt-4 sm:pt-8 pb-32 md:pb-12 space-y-8 sm:space-y-10">
        {activePage === 'main' && (
          <>
            {/* 1. CÔNG THỨC NƯỚC HOA THỰC NGHIỆM BAN ĐẦU CỦA NHÓM & TƯ VẤN CẢI TIẾN CÙNG AI */}
            <PresentationShowcaseHub
              seasonKey={selectedSeason}
              seasonLabel={SEASONAL_TEMPLATES[selectedSeason].title}
              totalVolume={totalVolume}
              concentrationName={concentrationName}
              concentrationPercent={concentrationPercent}
              pureFragranceMl={formulaResults.pureFragranceMl}
              carrierAlcoholMl={formulaResults.carrierAlcoholMl}
              slots={slots}
              calculatedIngredients={formulaResults.calculatedIngredients}
              tierTotals={formulaResults.tierTotals}
              totalPercentage={formulaResults.totalPercentage}
              isValidTotal={formulaResults.isValidTotal}
              perfumeName={perfumeName}
              isQrVisitorMode={isQrVisitorMode}
              onRestoreExperimentalBaseline={handleRestoreExperimentalBaseline}
              onUpdateSlotObservedNote={handleUpdateSlotObservedNote}
              onApplyAdjustedFormula={handleApplyAIAdjustedFormula}
              onSaveProposedToDrawer={handleSaveProposedFormulaToDrawer}
              onOpenVoiceWidget={() => setIsVoiceWidgetOpen(true)}
              onAutoBalance={handleAutoBalance}
              onOpenExperimentalPopup={() => setIsExperimentalPopupOpen(true)}
              onOpenExperimentalWeb={() => {
                setActivePage('experimental');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* 2. SƠ ĐỒ TÓM TẮT QUY TRÌNH THUYẾT TRÌNH & LƯU Ý HÓA HỌC */}
            <section className="rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>Tài liệu tóm tắt cho buổi báo cáo</span>
                    <span aria-hidden="true">·</span>
                    <span>Chuẩn IFRA 51st (Category 4)</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-100 mt-0.5">
                    Quy trình trình bày 5 bước &amp; ghi chú Hóa học cần nhớ
                  </h2>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsGuideOpen(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mở sổ tay hướng dẫn</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsInlineGuideExpanded((prev) => !prev)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium flex items-center gap-1 transition-colors whitespace-nowrap"
                  >
                    <span>{isInlineGuideExpanded ? 'Thu gọn' : 'Xem chi tiết'}</span>
                    {isInlineGuideExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              {isInlineGuideExpanded && (
                <div className="p-4 sm:p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                    <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/90 space-y-1.5">
                      <span className="text-xs font-mono text-slate-400 block">
                        01. Công thức gốc
                      </span>
                      <h3 className="text-xs font-semibold text-slate-100">
                        Giới thiệu mẫu thực nghiệm
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Trình bày 6 nguyên liệu của mẫu <em>Floris (10 mL)</em>: Lê, Bergamot, Hoa anh đào, Hoa nhài, Xạ hương trắng, Vanilla cùng 3 mẫu thử A, B, C.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/90 space-y-1.5">
                      <span className="text-xs font-mono text-slate-400 block">
                        02. Đặt yêu cầu
                      </span>
                      <h3 className="text-xs font-semibold text-slate-100">
                        Nhận câu hỏi từ người xem
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Chọn câu hỏi gợi ý (tươi mát hơn, rõ hương hoa, giảm độ nồng, thêm nốt gỗ...) hoặc nhập trực tiếp yêu cầu của người tham quan.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/90 space-y-1.5">
                      <span className="text-xs font-mono text-slate-400 block">
                        03. Giả thuyết AI
                      </span>
                      <h3 className="text-xs font-semibold text-slate-100">
                        Kiểm tra tỉ lệ 100%
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Hệ thống kiểm tra tổng tỉ lệ hợp hương bằng 100%, nêu lý do điều chỉnh dựa trên độ bay hơi, phân tử khối và liên kết hydro.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/90 space-y-1.5">
                      <span className="text-xs font-mono text-slate-400 block">
                        04. Đối chiếu số liệu
                      </span>
                      <h3 className="text-xs font-semibold text-slate-100">
                        So sánh mẫu gốc &amp; đề xuất
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Đặt cạnh nhau tỉ lệ hợp hương (%), nồng độ thành phẩm (%) và độ lệch (Δ%) để thấy rõ sự thay đổi ở từng tầng hương.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/90 space-y-1.5">
                      <span className="text-xs font-mono text-slate-400 block">
                        05. Phản biện &amp; lưu trữ
                      </span>
                      <h3 className="text-xs font-semibold text-slate-100">
                        Nhận xét của nhóm
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Ghi lại đánh giá của nhóm về tính hợp lý, cách pha mẫu đối chứng để kiểm chứng thực tế và xuất bảng báo cáo CSV.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800/90 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <strong className="text-slate-200 block mb-0.5">Phân biệt tỉ lệ và nồng độ</strong>
                      <span className="text-slate-400 leading-relaxed">
                        Tỉ lệ hợp hương luôn có tổng bằng 100%. Nồng độ thành phẩm (%) = [Tỉ lệ hợp hương × Nồng độ dòng nước hoa (EDP 20%)] / 100.
                      </span>
                    </div>

                    <div>
                      <strong className="text-slate-200 block mb-0.5">Giới hạn an toàn IFRA Cat.4</strong>
                      <span className="text-slate-400 leading-relaxed">
                        Tra cứu từ tài liệu kỹ thuật (ví dụ: Bergamot ép lạnh giới hạn 0,4% trên da do <em>Bergapten</em>, nên dùng loại Bergamot FCF đã tách furocoumarin).
                      </span>
                    </div>

                    <div>
                      <strong className="text-slate-200 block mb-0.5">Dự đoán mùi hương là giả thuyết</strong>
                      <span className="text-slate-400 leading-relaxed">
                        Mọi nhận định của AI chỉ đóng vai trò giả thuyết ban đầu, cần pha mẫu thực nghiệm và thử mù trên giấy thử (blotter) để kiểm chứng.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Khu vực tùy chỉnh chuyên sâu */}
            <div className="pt-4 border-t border-slate-800/80">
              <div className="mb-2">
                <p className="text-xs text-slate-400">
                  Bàn pha chế thủ công
                </p>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100">
                  Tùy chỉnh công thức theo mùa, nồng độ &amp; thanh trượt 3 tầng hương
                </h2>
              </div>
            </div>

            {/* Step 1: Chọn Mùa */}
            <SeasonalSelector
              selectedSeason={selectedSeason}
              onSelectSeason={handleSelectSeason}
              onApplySeasonalTemplate={handleApplySeasonalTemplate}
            />

            {/* Step 2: Nhập Thể Tích & Nồng Độ */}
            <VolumeAndConcentration
              totalVolume={totalVolume}
              onChangeVolume={setTotalVolume}
              concentrationName={concentrationName}
              concentrationPercent={concentrationPercent}
              onChangeConcentration={(name, pct) => {
                setConcentrationName(name);
                setConcentrationPercent(pct);
              }}
              pureFragranceMl={formulaResults.pureFragranceMl}
              carrierAlcoholMl={formulaResults.carrierAlcoholMl}
            />

            {/* Step 3: Kéo Tỉ Lệ 3 Tầng / 6 Nguyên Liệu */}
            <OlfactoryPyramidSliders
              slots={slots}
              calculatedIngredients={formulaResults.calculatedIngredients}
              totalPercentage={formulaResults.totalPercentage}
              isValidTotal={formulaResults.isValidTotal}
              difference={formulaResults.difference}
              tierTotals={formulaResults.tierTotals}
              totalVolume={totalVolume}
              editHistory={editHistory}
              canUndo={editHistory.length > 0}
              onUndo={handleUndo}
              onRestoreHistorySnapshot={handleRestoreHistorySnapshot}
              onClearHistory={handleClearHistory}
              customIngredients={customIngredients}
              onOpenAddCustomIngredient={handleOpenAddCustomIngredient}
              onUpdateSlotPercentage={handleUpdateSlotPercentage}
              onUpdateSlotIngredient={handleUpdateSlotIngredient}
              onUpdateSlotCustomName={handleUpdateSlotCustomName}
              onAutoBalance={handleAutoBalance}
              onResetDefault={handleResetDefault}
            />

            {/* Step 4: Hiện "Hồ Sơ Mùi" */}
            <ScentProfileView
              calculatedIngredients={formulaResults.calculatedIngredients}
              tierTotals={formulaResults.tierTotals}
              seasonName={SEASONAL_TEMPLATES[selectedSeason].title}
              concentrationName={concentrationName}
              totalVolume={totalVolume}
            />

            {/* Clean Navigation Cards to Dedicated Pages */}
            <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-xs text-slate-400">
                    Các trang chức năng trong dự án
                  </p>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-100">
                    Chuyển nhanh sang các trang làm việc riêng
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPythonModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium flex items-center gap-1.5"
                  >
                    <FileCode className="w-3.5 h-3.5 text-slate-400" />
                    <span>Mã nguồn Python</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  onClick={() => {
                    setActivePage('experimental');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors group flex flex-col justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <span className="text-xs text-emerald-400 font-medium block">
                      01 · Phiếu thực hành gốc
                    </span>
                    <h3 className="text-base font-serif font-bold text-slate-100">
                      Trang Công thức thực nghiệm (Floris 10 mL)
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Xem đầy đủ báo cáo pha chế của nhóm: ý tưởng mùi hương, bảng tỉ lệ 10 mL, 3 mẫu thử A/B/C, dụng cụ, 7 bước tiến hành và quy tắc an toàn.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-300 group-hover:translate-x-0.5 transition-transform">
                    <span>Mở trang công thức thực nghiệm</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div
                  onClick={() => {
                    setActivePage('csv');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors group flex flex-col justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <span className="text-xs text-slate-400 font-medium block">
                      02 · Bảng số liệu
                    </span>
                    <h3 className="text-base font-serif font-bold text-slate-100">
                      Trang Bảng tính &amp; Nhập/Xuất file CSV
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Nhập nhanh tỉ lệ công thức theo dạng bảng, tải file .CSV từ máy tính lên hoặc xuất bảng định lượng sang Excel.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300 group-hover:translate-x-0.5 transition-transform">
                    <span>Mở trang bảng tính CSV</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div
                  onClick={() => {
                    setActivePage('ai');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors group flex flex-col justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <span className="text-xs text-amber-400 font-medium block">
                      03 · Phân tích chuyên sâu
                    </span>
                    <h3 className="text-base font-serif font-bold text-slate-100">
                      Góc Tư vấn &amp; Thẩm định mùi hương cùng AI
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Đánh giá độ hợp mùa, ước tính độ lưu hương, kiểm tra giới hạn IFRA và chia sẻ công thức qua mã QR.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-amber-300 group-hover:translate-x-0.5 transition-transform">
                    <span>Mở góc tư vấn AI</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div
                  onClick={() => {
                    setActivePage('python');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-5 rounded-xl bg-slate-950/80 border border-[#FF4B4B]/30 hover:border-[#FF4B4B]/60 cursor-pointer transition-colors group flex flex-col justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <span className="text-xs text-[#FF4B4B] font-medium block flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#FF4B4B] animate-pulse"></span>
                      04 · Mô hình Python Streamlit
                    </span>
                    <h3 className="text-base font-serif font-bold text-slate-100">
                      App Python Phối Trộn Nước Hoa
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Tích hợp ứng dụng Streamlit (app1_8ba4d2ea.py), tương thích dữ liệu chuẩn lớp học, kéo thanh trượt an toàn, xuất CSV &amp; tải mã nguồn.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#FF4B4B] group-hover:translate-x-0.5 transition-transform">
                    <span>Mở App Python Streamlit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {activePage === 'experimental' && (
          <SubWebExperimentalFormula
            totalVolume={totalVolume}
            concentrationName={concentrationName}
            concentrationPercent={concentrationPercent}
            pureFragranceMl={formulaResults.pureFragranceMl}
            carrierAlcoholMl={formulaResults.carrierAlcoholMl}
            calculatedIngredients={formulaResults.calculatedIngredients}
            tierTotals={formulaResults.tierTotals}
            totalPercentage={formulaResults.totalPercentage}
            perfumeName={perfumeName}
            onRestoreExperimentalBaseline={handleRestoreExperimentalBaseline}
            onUpdateSlotObservedNote={handleUpdateSlotObservedNote}
            onApplyVariantToStudio={(adjustedItems, proposedName, summaryNote) => {
              handleApplyAIAdjustedFormula(adjustedItems, proposedName, summaryNote);
            }}
            onOpenExperimentalPopup={() => setIsExperimentalPopupOpen(true)}
            onOpenGuideModal={() => setIsGuideOpen(true)}
            onBackToMainWeb={() => {
              setActivePage('main');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onGoToAIWeb={() => {
              setActivePage('ai');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activePage === 'csv' && (
          <SubWebCsvStudio
            perfumeName={perfumeName}
            onChangePerfumeName={setPerfumeName}
            selectedSeason={selectedSeason}
            onSelectSeason={handleSelectSeason}
            totalVolume={totalVolume}
            onChangeVolume={setTotalVolume}
            concentrationName={concentrationName}
            concentrationPercent={concentrationPercent}
            onChangeConcentration={(name, pct) => {
              setConcentrationName(name);
              setConcentrationPercent(pct);
            }}
            slots={slots}
            calculatedIngredients={formulaResults.calculatedIngredients}
            tierTotals={formulaResults.tierTotals}
            totalPercentage={formulaResults.totalPercentage}
            isValidTotal={formulaResults.isValidTotal}
            customIngredients={customIngredients}
            onUpdateSlotPercentage={handleUpdateSlotPercentage}
            onUpdateSlotIngredient={handleUpdateSlotIngredient}
            onUpdateSlotCustomName={handleUpdateSlotCustomName}
            onOpenAddCustomIngredient={handleOpenAddCustomIngredient}
            onAutoBalance={handleAutoBalance}
            onQuickSave={handleQuickSave}
            onExportCsv={handleExportCsv}
            onImportFormulaFromCsv={handleImportFormulaFromCsv}
            onBackToMainWeb={() => {
              setActivePage('main');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activePage === 'ai' && (
          <SubWebAIEvaluator
            seasonKey={selectedSeason}
            seasonLabel={SEASONAL_TEMPLATES[selectedSeason].title}
            totalVolume={totalVolume}
            concentrationName={concentrationName}
            concentrationPercent={concentrationPercent}
            pureFragranceMl={formulaResults.pureFragranceMl}
            carrierAlcoholMl={formulaResults.carrierAlcoholMl}
            slots={slots}
            ingredients={formulaResults.calculatedIngredients}
            tierTotals={formulaResults.tierTotals}
            totalPercentage={formulaResults.totalPercentage}
            isValidTotal={formulaResults.isValidTotal}
            perfumeName={perfumeName}
            isQrVisitorMode={isQrVisitorMode}
            onSavePerfumeName={(name) => setPerfumeName(name)}
            onAutoBalance={handleAutoBalance}
            onOpenVoiceWidget={() => setIsVoiceWidgetOpen(true)}
            onRestoreExperimentalBaseline={handleRestoreExperimentalBaseline}
            onUpdateSlotObservedNote={handleUpdateSlotObservedNote}
            onApplyAdjustedFormula={handleApplyAIAdjustedFormula}
            onSaveProposedToDrawer={handleSaveProposedFormulaToDrawer}
            onBackToMainWeb={() => {
              setActivePage('main');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activePage === 'python' && (
          <SubWebPythonStreamlit
            onBackToMainWeb={() => {
              setActivePage('main');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSyncFormulaToWeb={handleSyncFromPython}
          />
        )}
      </main>

      {/* Quiet, Subtle Bottom Bar for Quick Save / Compare / Undo (Desktop & Tablet) */}
      <aside
        aria-label="Thanh công cụ nhanh"
        className={`hidden md:block sticky bottom-4 z-20 mx-auto px-4 w-full transition-all duration-200 ${
          isBottomBarCollapsed ? 'max-w-xs' : 'max-w-xl'
        }`}
      >
        <div className="bg-slate-900/95 border border-slate-800 rounded-xl px-3.5 py-2 shadow-lg backdrop-blur-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">
              Tổng tỉ lệ:{' '}
              <strong className={formulaResults.isValidTotal ? 'text-emerald-400' : 'text-amber-400'}>
                {formulaResults.totalPercentage}%
              </strong>
            </span>
          </div>

          {isBottomBarCollapsed ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsBottomBarCollapsed(false)}
                type="button"
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 text-xs"
              >
                <span>Mở thanh công cụ</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center flex-wrap gap-1.5">
              {editHistory.length > 0 && (
                <button
                  onClick={handleUndo}
                  type="button"
                  className="text-xs px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1"
                  title="Hoàn tác bước vừa chỉnh (Ctrl + Z)"
                >
                  <Undo2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Hoàn tác ({editHistory.length})</span>
                </button>
              )}

              {!formulaResults.isValidTotal && (
                <button
                  onClick={handleAutoBalance}
                  type="button"
                  className="text-xs px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors font-medium"
                >
                  Cân bằng 100%
                </button>
              )}

              <button
                onClick={handleQuickSave}
                type="button"
                className="text-xs px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                <span>Lưu bản này</span>
              </button>

              <button
                onClick={() => setIsSavedModalOpen(true)}
                type="button"
                className="text-xs px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <GitCompare className="w-3.5 h-3.5 text-slate-400" />
                <span>So sánh ({savedFormulas.length})</span>
              </button>

              <button
                onClick={() => setIsBottomBarCollapsed(true)}
                type="button"
                className="p-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
                title="Thu gọn"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 px-4 text-center text-xs text-slate-400 mb-14 md:mb-0">
        <p className="font-medium text-slate-300">
          Dự án thực hành Hóa học — Nước hoa Floris · Tổ 1, lớp 12A13 THPT Nguyễn Thị Minh Khai
        </p>
      </footer>

      {/* Mobile Floating Action Button (FAB) for Gemini Live Voice */}
      <button
        type="button"
        onClick={() => setIsVoiceWidgetOpen(true)}
        className="fixed right-4 bottom-[72px] z-40 md:hidden w-14 h-14 rounded-full bg-gradient-to-tr from-[#2D6344] via-[#3B7A57] to-[#10B981] text-white shadow-xl flex items-center justify-center ring-4 ring-[#3B7A57]/20 active:scale-95 group transition-transform"
        title="Mở trợ lý giọng nói Gemini Live"
        aria-label="Mở trợ lý giọng nói Gemini Live"
      >
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#10B981] border-2 border-[#FAF8F5] animate-ping" />
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#10B981] border-2 border-[#FAF8F5]" />
        <Mic className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Native-style Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activePage={activePage}
        onChangePage={(page) => {
          setActivePage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenExperimentalPopup={() => setIsExperimentalPopupOpen(true)}
        onOpenSavedFormulas={() => setIsSavedModalOpen(true)}
        savedCount={savedFormulas.length}
      />

      {/* Modal 1: Saved Formulas & Comparison Drawer */}
      <SavedFormulasModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedFormulas={savedFormulas}
        currentFormulaState={{
          season: selectedSeason,
          seasonTitle: SEASONAL_TEMPLATES[selectedSeason].title,
          totalVolume,
          concentrationName,
          concentrationPercent,
          slots,
          tierTotals: formulaResults.tierTotals,
          totalPercentage: formulaResults.totalPercentage,
          calculatedIngredients: formulaResults.calculatedIngredients,
          pureFragranceMl: formulaResults.pureFragranceMl,
          carrierAlcoholMl: formulaResults.carrierAlcoholMl,
          perfumeTitle: perfumeName,
        }}
        onSaveCurrentFormula={handleSaveCurrentFormula}
        onLoadFormula={handleLoadFormula}
        onDeleteFormula={handleDeleteFormula}
        onClearAllFormulas={handleClearAllFormulas}
      />

      {/* Modal 2: AI Evaluator Quick Modal */}
      <AIEvaluatorModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        seasonLabel={SEASONAL_TEMPLATES[selectedSeason].title}
        totalVolume={totalVolume}
        concentrationName={concentrationName}
        ingredients={formulaResults.calculatedIngredients}
        tierTotals={formulaResults.tierTotals}
        isValidTotal={formulaResults.isValidTotal}
        onSavePerfumeName={(name) => setPerfumeName(name)}
      />

      {/* Modal 3: Python / Streamlit Source Code */}
      <PythonStreamlitModal
        isOpen={isPythonModalOpen}
        onClose={() => setIsPythonModalOpen(false)}
        seasonLabel={SEASONAL_TEMPLATES[selectedSeason].title}
        totalVolume={totalVolume}
        slots={slots}
        onOpenPythonSubWeb={() => {
          setActivePage('python');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Modal 4: Welcome & User Guide Widget (with Voice Guide & Sub-Webs Map) */}
      <WelcomeGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onOpenVoiceWidget={() => setIsVoiceWidgetOpen(true)}
        onNavigatePage={(page) => {
          setActivePage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Modal 5: Dedicated Voice Recognition Widget (Separate Widget like User Guide) */}
      <VoiceAssistantModal
        isOpen={isVoiceWidgetOpen}
        onClose={() => setIsVoiceWidgetOpen(false)}
        seasonLabel={SEASONAL_TEMPLATES[selectedSeason].title}
        totalVolume={totalVolume}
        concentrationName={concentrationName}
        concentrationPercent={concentrationPercent}
        calculatedIngredients={formulaResults.calculatedIngredients}
        tierTotals={formulaResults.tierTotals}
        onApplyAdjustedFormula={handleApplyAIAdjustedFormula}
        onSaveProposedToDrawer={handleSaveProposedFormulaToDrawer}
      />

      {/* Modal 6: Add Custom Ingredient Screen */}
      <AddCustomIngredientModal
        isOpen={isAddCustomIngredientOpen}
        onClose={() => setIsAddCustomIngredientOpen(false)}
        targetSlotKey={addCustomTargetSlotKey}
        targetTier={addCustomTargetTier}
        onAddIngredient={handleAddCustomIngredient}
      />

      {/* Modal 7: Dedicated Group Experimental Perfume Formula Pop-up (∼✿∼ THỰC HÀNH LÀM NƯỚC HOA ∼✿∼) */}
      <ExperimentalFormulaPopupModal
        isOpen={isExperimentalPopupOpen}
        onClose={() => setIsExperimentalPopupOpen(false)}
        onOpenExperimentalWeb={() => {
          setIsExperimentalPopupOpen(false);
          setActivePage('experimental');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onApplyVariantToStudio={(adjustedItems, proposedName, summaryNote) => {
          handleApplyAIAdjustedFormula(adjustedItems, proposedName, summaryNote);
          setActivePage('main');
        }}
        onOpenGuideModal={() => setIsGuideOpen(true)}
      />
    </div>
  );
}

