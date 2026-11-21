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
  SakuraPetalsBackdrop,
  SakuraBranchIllustration,
} from './components/SpringDecorations';
import { SpringAccordion } from './components/SpringAccordion';
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
const PETAL_EFFECT_KEY = 'floris_petal_effect_v1';

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

  // Falling petals ambient effect toggle (default ON, persisted)
  const [effectsEnabled, setEffectsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(PETAL_EFFECT_KEY);
      return saved === null ? true : saved !== 'false';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(PETAL_EFFECT_KEY, effectsEnabled ? 'true' : 'false');
    } catch {
      // ignore storage errors
    }
  }, [effectsEnabled]);

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
  // Dedicated Pop-up for Group's Experimental Baseline Formula (Floris 10mL) — skips if ?autostart=1
  const [isExperimentalPopupOpen, setIsExperimentalPopupOpen] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('autostart') === '1' || params.get('qr') === '1') return false;
      }
    } catch {
      // ignore
    }
    return true;
  });

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
    <div className="min-h-screen overflow-x-clip text-[#2B342D] flex flex-col font-sans relative selection:bg-[#FCE7F3] selection:text-[#BE185D]">
      <SakuraPetalsBackdrop enabled={effectsEnabled} />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* 1. Spring Pastel Header */}
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
          effectsEnabled={effectsEnabled}
          onToggleEffects={() => setEffectsEnabled((prev) => !prev)}
        />

        {/* Floating Global Quick Toast */}
        {quickNotification && (
          <div className="fixed top-16 right-4 sm:right-8 z-50 bg-white border-2 border-[#BBF7D0] text-[#15803D] px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
            <span>{quickNotification}</span>
          </div>
        )}

        {/* CSV Export Notification Toast */}
        {csvExportToast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <div
              className={`px-4 py-2.5 rounded-2xl shadow-lg border-2 flex items-center gap-2 text-xs font-bold ${
                csvExportToast.type === 'waiting'
                  ? 'bg-[#FFFDF0] text-[#92400E] border-[#FDE68A]'
                  : 'bg-[#ECFDF3] text-[#15803D] border-[#86EFAC]'
              }`}
            >
              {csvExportToast.type === 'waiting' ? (
                <Loader2 className="w-4 h-4 text-[#D97706] animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              )}
              <span>{csvExportToast.message}</span>
            </div>
          </div>
        )}

        {/* 2. Minimal Visual Spring Hero Banner */}
        {activePage === 'main' && (
          <section className="px-3 sm:px-6 md:px-8 pt-4 sm:pt-6">
            <div className="max-w-7xl mx-auto rounded-3xl bg-gradient-to-r from-[#FFF1F5] via-[#FFFDF2] to-[#ECFDF3] border-2 border-[#FBCFE8] p-5 sm:p-7 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5 overflow-hidden relative">
              <div className="space-y-2.5 max-w-xl relative z-10">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-white text-[#BE185D] text-xs font-bold border border-[#F9A8D4]">
                    🌸 Mùa Xuân · 10 mL
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] text-xs font-bold border border-[#86EFAC]">
                    🌿 Tổ 1 · 12A13
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-bold text-[#2B342D] tracking-tight">
                  Xưởng hương Floris
                </h1>

                {/* Visual Scent Notes Pill Strip instead of long paragraph */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs font-bold">
                  <span className="px-2.5 py-1 rounded-full bg-[#FEF9C3] text-[#854D0E]">🌼 Hoa nhài</span>
                  <span className="px-2.5 py-1 rounded-full bg-[#FFEDD5] text-[#9A3412]">🍑 Đào</span>
                  <span className="px-2.5 py-1 rounded-full bg-white text-[#374151] border border-[#E5E7EB]">🤍 Xạ hương</span>
                  <span className="px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#92400E]">🍦 Vanilla</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 relative z-10">
                <SakuraBranchIllustration className="w-40 h-24 hidden sm:block animate-sakura-float shrink-0" />
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActivePage('experimental');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs"
                  >
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>Phiếu thực nghiệm</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsExperimentalPopupOpen(true)}
                    className="px-4 py-2.5 rounded-2xl bg-white hover:bg-[#FFF5F8] text-[#BE185D] border border-[#FBCFE8] text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Xem nhanh</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsVoiceWidgetOpen(true)}
                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#EC4899] to-[#F472B6] hover:from-[#DB2777] hover:to-[#EC4899] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Gemini Live</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 3. Workspace Router */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 md:px-8 pt-5 pb-32 md:pb-12 space-y-6 sm:space-y-8">
          {activePage === 'main' && (
            <>
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

              {/* Compact 5-Step Process tucked cleanly in an Accordion */}
              <SpringAccordion
                title="Quy trình báo cáo 5 bước & Ghi chú IFRA"
                badge="5 bước"
                icon={<BookOpen className="w-4 h-4 text-[#DB2777]" />}
                tone="butter"
                defaultOpen={isInlineGuideExpanded}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {[
                    { step: '01 · Mẫu gốc', desc: 'Giới thiệu 4 nốt hương Floris 10 mL (Nhài, Đào, Xạ hương, Vanilla).' },
                    { step: '02 · Yêu cầu', desc: 'Chọn hoặc nói mong muốn tinh chỉnh mùi hương.' },
                    { step: '03 · Giả thuyết', desc: 'AI cân chỉnh đủ 100% và giải thích độ bay hơi.' },
                    { step: '04 · Đối chiếu', desc: 'So sánh thanh tỷ lệ & mL trước/sau điều chỉnh.' },
                    { step: '05 · Kiểm chứng', desc: 'Ghi nhận xét Hóa học và xuất file CSV.' },
                  ].map((s) => (
                    <div key={s.step} className="p-3 rounded-2xl bg-white border border-[#FDE68A] space-y-1">
                      <span className="font-bold text-[#92400E] block">{s.step}</span>
                      <p className="text-[#4A4D48]">{s.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsInlineGuideExpanded((p) => !p);
                      setIsGuideOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-2xl bg-[#FCE7F3] text-[#BE185D] font-bold text-xs"
                  >
                    Mở sổ tay đầy đủ
                  </button>
                </div>
              </SpringAccordion>

              {/* Step 1: Chọn Mùa */}
              <SeasonalSelector
                selectedSeason={selectedSeason}
                onSelectSeason={handleSelectSeason}
                onApplySeasonalTemplate={handleApplySeasonalTemplate}
              />

              {/* Step 2: Thể Tích & Nồng Độ */}
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

              {/* Step 3: Thanh Trượt 3 Tầng */}
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

              {/* Step 4: Hồ Sơ Mùi & Chai Đổ Màu */}
              <ScentProfileView
                calculatedIngredients={formulaResults.calculatedIngredients}
                tierTotals={formulaResults.tierTotals}
                seasonName={SEASONAL_TEMPLATES[selectedSeason].title}
                concentrationName={concentrationName}
                concentrationPercent={concentrationPercent}
                totalVolume={totalVolume}
                perfumeName={perfumeName}
                onApplyAdjustedFormula={handleApplyAIAdjustedFormula}
                onSaveProposedToDrawer={handleSaveProposedFormulaToDrawer}
              />

              {/* Visual Workspace Cards */}
              <section className="spring-card p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#FCE7F3] text-[#BE185D] text-xs font-bold border border-[#FBCFE8]">
                      Khám phá thêm
                    </span>
                    <h2 className="text-lg font-bold text-[#2B342D]">Công cụ chuyên sâu</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPythonModalOpen(true)}
                    className="px-3 py-1.5 rounded-2xl bg-[#FFFDF0] hover:bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-xs font-bold flex items-center gap-1.5"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Mã Python</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {[
                    {
                      page: 'experimental' as const,
                      emoji: '🧪',
                      tag: 'Mẫu A · B · C',
                      title: 'Công thức thực nghiệm',
                      tone: 'from-[#ECFDF3] to-white border-[#86EFAC] text-[#15803D]',
                    },
                    {
                      page: 'csv' as const,
                      emoji: '📊',
                      tag: 'Nhập · Xuất',
                      title: 'Bảng tính CSV',
                      tone: 'from-[#FFFDF0] to-white border-[#FDE68A] text-[#92400E]',
                    },
                    {
                      page: 'ai' as const,
                      emoji: '✨',
                      tag: 'IFRA · Radar',
                      title: 'Góc tư vấn AI',
                      tone: 'from-[#FFF1F5] to-white border-[#FBCFE8] text-[#BE185D]',
                    },
                    {
                      page: 'python' as const,
                      emoji: '🐍',
                      tag: 'Streamlit App',
                      title: 'App Python',
                      tone: 'from-[#FFF5F5] to-white border-[#FECACA] text-[#B91C1C]',
                    },
                  ].map((card) => (
                    <button
                      key={card.page}
                      type="button"
                      onClick={() => {
                        setActivePage(card.page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`p-4 rounded-3xl bg-gradient-to-br border-2 text-left transition-all hover:scale-[1.01] flex flex-col justify-between gap-4 ${card.tone}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-xl shadow-xs">
                          {card.emoji}
                        </span>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/90 border border-black/5">
                          {card.tag}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-[#2B342D]">{card.title}</h3>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </div>
                    </button>
                  ))}
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

        {/* Spring Pastel Sticky Quick Toolbar (Desktop bottom-right capsule) */}
        <aside
          aria-label="Thanh công cụ nhanh"
          className="hidden md:flex justify-end sticky bottom-4 z-20 max-w-7xl mx-auto px-6 w-full pointer-events-none"
        >
          <div className="pointer-events-auto bg-white/95 border-2 border-[#FBCFE8] rounded-3xl px-4 py-2 shadow-lg backdrop-blur-md flex items-center justify-between gap-3">
            <span className="text-xs font-mono font-bold text-[#5C6B5F]">
              Tổng:{' '}
              <strong className={formulaResults.isValidTotal ? 'text-[#15803D]' : 'text-[#D97706]'}>
                {formulaResults.totalPercentage}%
              </strong>
            </span>

            {isBottomBarCollapsed ? (
              <button
                onClick={() => setIsBottomBarCollapsed(false)}
                type="button"
                className="px-3 py-1 rounded-2xl bg-[#FCE7F3] text-[#BE185D] font-bold flex items-center gap-1 text-xs"
              >
                <span>Mở công cụ</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center flex-wrap gap-1.5">
                {editHistory.length > 0 && (
                  <button
                    onClick={handleUndo}
                    type="button"
                    className="text-xs px-2.5 py-1 rounded-2xl bg-[#FFFDF0] hover:bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] font-bold flex items-center gap-1"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>Hoàn tác ({editHistory.length})</span>
                  </button>
                )}

                {!formulaResults.isValidTotal && (
                  <button
                    onClick={handleAutoBalance}
                    type="button"
                    className="text-xs px-2.5 py-1 rounded-2xl bg-[#F59E0B] text-white font-bold"
                  >
                    Cân 100%
                  </button>
                )}

                <button
                  onClick={handleQuickSave}
                  type="button"
                  className="text-xs px-3 py-1 rounded-2xl bg-[#ECFDF3] hover:bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0] font-bold flex items-center gap-1"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Lưu</span>
                </button>

                <button
                  onClick={() => setIsSavedModalOpen(true)}
                  type="button"
                  className="text-xs px-3 py-1 rounded-2xl bg-[#FCE7F3] hover:bg-[#FBCFE8] text-[#BE185D] border border-[#F9A8D4] font-bold flex items-center gap-1"
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>So sánh ({savedFormulas.length})</span>
                </button>

                <button
                  onClick={() => setIsBottomBarCollapsed(true)}
                  type="button"
                  className="p-1.5 rounded-full bg-[#FFF5F8] text-[#BE185D]"
                  title="Thu gọn"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Spring Pastel Footer */}
        <footer className="border-t border-[#F5DCE4] bg-white/80 py-5 px-4 text-center text-xs text-[#5C6B5F] mb-16 md:mb-0">
          <p className="font-bold text-[#2B342D]">
            🌸 Floris — Dự án Hóa học Mùa Xuân · Tổ 1, lớp 12A13 THPT Nguyễn Thị Minh Khai
          </p>
        </footer>

        {/* Mobile Floating Action Button (FAB) */}
        <button
          type="button"
          onClick={() => setIsVoiceWidgetOpen(true)}
          className="fixed right-3.5 bottom-[74px] z-40 md:hidden w-11 h-11 rounded-full bg-gradient-to-tr from-[#EC4899] to-[#F472B6] text-white shadow-lg flex items-center justify-center ring-4 ring-[#FCE7F3] active:scale-95"
          title="Gemini Live"
          aria-label="Mở trợ lý giọng nói Gemini Live"
        >
          <Mic className="w-5 h-5 text-white" />
        </button>

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
      </div>

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

