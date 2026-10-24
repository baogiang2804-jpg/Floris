import { FormulaSlot, CalculatedIngredient } from '../utils/perfumeCalculations';

export interface SavedFormula {
  id: string;
  name: string;
  note?: string;
  createdAt: string; // ISO string
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
  perfumeTitle?: string;
}
