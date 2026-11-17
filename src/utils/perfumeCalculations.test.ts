import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateFormula, autoBalanceSlots, FormulaSlot } from './perfumeCalculations.ts';
import { generateLocalEvaluation, normalizeAdjustmentOutput } from './aiPerfumeEngine.ts';

const SAMPLE_SLOTS: FormulaSlot[] = [
  { key: 'top1', tier: 'top', tierLabel: 'Tầng Đầu', slotNumber: 1, ingredientId: 'top_jasmine', percentage: 40 },
  { key: 'top2', tier: 'top', tierLabel: 'Tầng Đầu', slotNumber: 2, ingredientId: 'top_jasmine_fresh', percentage: 0 },
  { key: 'heart1', tier: 'heart', tierLabel: 'Tầng Giữa', slotNumber: 3, ingredientId: 'heart_peach', percentage: 30 },
  { key: 'heart2', tier: 'heart', tierLabel: 'Tầng Giữa', slotNumber: 4, ingredientId: 'heart_peach_ripe', percentage: 0 },
  { key: 'base1', tier: 'base', tierLabel: 'Tầng Cuối', slotNumber: 5, ingredientId: 'base_musk', percentage: 15 },
  { key: 'base2', tier: 'base', tierLabel: 'Tầng Cuối', slotNumber: 6, ingredientId: 'base_vanilla', percentage: 15 },
];

describe('Floris Perfume Calculation & AI Normalization Logic', () => {
  it('calculates exact mL, drops, and IFRA compliance for 10mL 10% Floris baseline', () => {
    const res = calculateFormula(SAMPLE_SLOTS, 10, 10);
    assert.equal(res.totalPercentage, 100);
    assert.equal(res.isValidTotal, true);
    assert.equal(res.pureFragranceMl, 1);
    assert.equal(res.carrierAlcoholMl, 9);
    assert.deepEqual(res.tierTotals, { top: 40, heart: 30, base: 30 });

    const jasmine = res.calculatedIngredients.find((i) => i.slotKey === 'top1')!;
    assert.equal(jasmine.volumeMl, 0.4);
    assert.equal(jasmine.drops, 8);
    assert.equal(jasmine.finalProductConcentrationPercent, 4);
    assert.equal(jasmine.isExceedingIfra, false);
  });

  it('flags IFRA violation when cold-pressed Bergamot exceeds 0.4% finished concentration', () => {
    const bergamotSlots: FormulaSlot[] = SAMPLE_SLOTS.map((s) =>
      s.key === 'top1' ? { ...s, ingredientId: 'top_bergamot', percentage: 20 } : s
    );
    const res = calculateFormula(bergamotSlots, 10, 20);
    const berg = res.calculatedIngredients.find((i) => i.slotKey === 'top1')!;
    assert.equal(berg.finalProductConcentrationPercent, 4);
    assert.equal(berg.isExceedingIfra, true);
  });

  it('autoBalanceSlots normalizes skewed percentages cleanly to 100%', () => {
    const skewed: FormulaSlot[] = [
      { ...SAMPLE_SLOTS[0], percentage: 20 },
      { ...SAMPLE_SLOTS[1], percentage: 10 },
      { ...SAMPLE_SLOTS[2], percentage: 15 },
      { ...SAMPLE_SLOTS[3], percentage: 5 },
      { ...SAMPLE_SLOTS[4], percentage: 10 },
      { ...SAMPLE_SLOTS[5], percentage: 5 },
    ];
    const balanced = autoBalanceSlots(skewed);
    const sum = balanced.reduce((acc, s) => acc + s.percentage, 0);
    assert.equal(sum, 100);
  });

  it('normalizeAdjustmentOutput enforces 100% sum even if raw AI output does not add to 100', () => {
    const calc = calculateFormula(SAMPLE_SLOTS, 10, 10);
    const result = normalizeAdjustmentOutput(
      {
        adjustedIngredients: [
          { slotKey: 'top1', newPercentage: 50, reason: 'Boost top' },
          { slotKey: 'heart1', newPercentage: 30, reason: 'Keep heart' },
          { slotKey: 'base1', newPercentage: 20, reason: 'Keep musk' },
          { slotKey: 'base2', newPercentage: 20, reason: 'Keep vanilla' },
        ],
      },
      calc.calculatedIngredients,
      10,
      10
    );
    const sum = result.comparisonItems.reduce((a, b) => a + b.newPercentage, 0);
    assert.equal(sum, 100);
    assert.equal(result.validationReport?.isValid100, true);
  });

  it('generateLocalEvaluation returns bounded radar values and Spring suitability score', () => {
    const calc = calculateFormula(SAMPLE_SLOTS, 10, 10);
    const evalRes = generateLocalEvaluation('Mùa Xuân (Spring)', 10, '10%', calc.calculatedIngredients, calc.tierTotals);
    assert.ok(evalRes.seasonSuitabilityScore >= 70 && evalRes.seasonSuitabilityScore <= 100);
    assert.ok(evalRes.olfactoryRadar.floral >= 15 && evalRes.olfactoryRadar.floral <= 95);
  });
});
