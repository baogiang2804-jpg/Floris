import { FormulaSlot } from '../utils/perfumeCalculations';

export interface EditHistorySnapshot {
  id: string;
  timestamp: string; // e.g. "14:32:05"
  isoDate: string;
  actionSummary: string; // e.g. "Đổi tỉ lệ Top 1 (15% → 20%)" or "Cân bằng 100%"
  slots: FormulaSlot[];
  tierTotals: { top: number; heart: number; base: number };
  totalPercentage: number;
}
