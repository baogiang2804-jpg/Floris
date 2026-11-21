import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateFormula, autoBalanceSlots, FormulaSlot } from './perfumeCalculations.ts';
import {
  generateLocalEvaluation,
  normalizeAdjustmentOutput,
  generateLocalAdjustment,
  isStaticHostingEnvironment,
  resolveApiEndpoints,
} from './aiPerfumeEngine.ts';
import {
  adjustStandalonePrecisionFormula,
  detectIngredientMentions,
  checkMissingIngredients,
  sanitizeStandalonePrecisionResponse,
  enforceClientFormulaIntegrity,
} from './precisionFormulaAdjuster.ts';
import {
  cleanAudioMimeType,
  SPEECH_LANGUAGE_OPTIONS,
  resolveSpeechRecognitionLang,
  createMultilingualVoiceSession,
} from './multilingualSpeech.ts';

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

  it('Rule 1 & 2: normalizeAdjustmentOutput keeps inactive 0% slots at 0% and balances active slots to 100%', () => {
    const calc = calculateFormula(SAMPLE_SLOTS, 10, 10);
    const result = normalizeAdjustmentOutput(
      {
        adjustedIngredients: [
          { slotKey: 'top1', newPercentage: 50, reason: 'Boost top' },
          { slotKey: 'top2', newPercentage: 10, reason: 'AI tried adding inactive top2' },
          { slotKey: 'heart1', newPercentage: 30, reason: 'Keep heart' },
          { slotKey: 'heart2', newPercentage: 8, reason: 'AI tried adding inactive heart2' },
          { slotKey: 'base1', newPercentage: 20, reason: 'Keep musk' },
          { slotKey: 'base2', newPercentage: 20, reason: 'Keep vanilla' },
        ],
      },
      calc.calculatedIngredients,
      10,
      10
    );
    const top2 = result.comparisonItems.find((c) => c.slotKey === 'top2')!;
    const heart2 = result.comparisonItems.find((c) => c.slotKey === 'heart2')!;
    assert.equal(top2.newPercentage, 0);
    assert.equal(top2.newDrops, 0);
    assert.equal(heart2.newPercentage, 0);
    assert.equal(heart2.newDrops, 0);

    const sum = result.comparisonItems.reduce((a, b) => a + b.newPercentage, 0);
    assert.equal(sum, 100);
    assert.equal(result.validationReport?.isValid100, true);
    assert.deepEqual(
      result.formula.map((f) => f.name),
      calc.calculatedIngredients.filter((c) => c.percentage > 0).map((c) => c.name)
    );
  });

  it('Rule 3: adjusts only active quantities dynamically relative to current amounts', () => {
    const calc = calculateFormula(SAMPLE_SLOTS, 10, 10);

    // Sensory fresher request increases active Top (Hoa nhài > 40%) while keeping 0% slots untouched
    const fresher = generateLocalAdjustment(
      'Tôi muốn mùi nước hoa tươi mát hơn.',
      'Mùa Xuân (Spring)',
      10,
      10,
      calc.calculatedIngredients,
      calc.tierTotals
    );
    assert.equal(fresher.isUnchanged, false);
    const top1Fresher = fresher.comparisonItems.find((c) => c.slotKey === 'top1')!;
    assert.ok(top1Fresher.newPercentage > 40, `Expected top1 > 40%, got ${top1Fresher.newPercentage}`);
    assert.equal(fresher.comparisonItems.find((c) => c.slotKey === 'top2')!.newPercentage, 0);
    assert.equal(fresher.comparisonItems.find((c) => c.slotKey === 'heart2')!.newPercentage, 0);
    assert.equal(fresher.comparisonItems.reduce((a, b) => a + b.newPercentage, 0), 100);

    // Named active note boost increases Đào > 30%
    const morePeach = generateLocalAdjustment(
      'Tôi muốn hương quả đào ngọt dịu rõ hơn.',
      'Mùa Xuân (Spring)',
      10,
      10,
      calc.calculatedIngredients,
      calc.tierTotals
    );
    const heart1Peach = morePeach.comparisonItems.find((c) => c.slotKey === 'heart1')!;
    assert.ok(heart1Peach.newPercentage > 30, `Expected peach > 30%, got ${heart1Peach.newPercentage}`);
    assert.equal(morePeach.comparisonItems.reduce((a, b) => a + b.newPercentage, 0), 100);

    // Explicit target percentage ("Tăng đào lên 45%")
    const targetPeach = generateLocalAdjustment(
      'Tăng đào lên 45%',
      'Mùa Xuân (Spring)',
      10,
      10,
      calc.calculatedIngredients,
      calc.tierTotals
    );
    assert.equal(targetPeach.comparisonItems.find((c) => c.slotKey === 'heart1')!.newPercentage, 45);
    assert.equal(targetPeach.comparisonItems.reduce((a, b) => a + b.newPercentage, 0), 100);
  });

  it('Rule 4: handles missing ingredients by keeping original amounts strictly unchanged', () => {
    const standaloneFormula = [
      { name: 'Peach', amount: 30 },
      { name: 'Rose', amount: 30 },
      { name: 'Musk', amount: 20 },
      { name: 'Vanilla', amount: 20 },
    ];
    const standaloneRes = adjustStandalonePrecisionFormula('Adjust Jasmine', standaloneFormula);
    assert.deepEqual(standaloneRes.formula, standaloneFormula);
    assert.match(standaloneRes.message, /Jasmine/i);

    const calc = calculateFormula(SAMPLE_SLOTS, 10, 10);
    for (const req of ['Tăng hương Oải hương', 'Tăng hương Cam Bergamot', 'Thêm sắc thái Gỗ đàn hương']) {
      const res = generateLocalAdjustment(
        req,
        'Mùa Xuân (Spring)',
        10,
        10,
        calc.calculatedIngredients,
        calc.tierTotals
      );
      assert.equal(res.isUnchanged, true, `Expected unchanged for "${req}"`);
      assert.deepEqual(
        res.comparisonItems.map((c) => c.newPercentage),
        [40, 0, 30, 0, 15, 15]
      );
      assert.ok(res.comparisonItems.every((c) => c.deltaPercentage === 0));
      assert.ok((res.missingIngredients || []).length > 0);
    }
  });

  it('prevents Vietnamese substring false positives while separating compound flower names', () => {
    const calc = calculateFormula(SAMPLE_SLOTS, 10, 10);
    const active = calc.calculatedIngredients.filter((c) => c.percentage > 0);

    // "cảm giác" must NOT trigger "cam"
    const camGiacCheck = checkMissingIngredients('Tôi muốn giảm cảm giác nồng, mùi thanh khiết nhẹ nhàng.', active);
    assert.equal(camGiacCheck.hasMissingIngredient, false);

    // "tăng ... lên" must NOT trigger "lê"
    const lenCheck = checkMissingIngredients('Tăng hoa nhài lên 50%', active);
    assert.equal(lenCheck.hasMissingIngredient, false);
    assert.equal(lenCheck.matchedActiveIngredients.length, 1);

    // "hoa anh đào" must detect Cherry Blossom as missing rather than matching active "Đào (Peach)"
    const mentions = detectIngredientMentions('Tăng hương hoa anh đào', active);
    assert.deepEqual(
      mentions.map((m) => m.canonicalKey),
      ['cherry_blossom']
    );
    const sakuraCheck = checkMissingIngredients('Tăng hương hoa anh đào', active);
    assert.equal(sakuraCheck.hasMissingIngredient, true);
  });

  it('client-side failsafe rejects unauthorized ingredients or dropped original notes', () => {
    const baseFormula = [
      { name: 'Đào (Peach)', amount: 30 },
      { name: 'Hồng (Rose)', amount: 25 },
      { name: 'Xạ hương (Musk)', amount: 25 },
      { name: 'Vani (Vanilla)', amount: 20 },
    ];

    // Sneaked unauthorized ingredient "Oải hương"
    const tamperedAdd = sanitizeStandalonePrecisionResponse(
      {
        message: 'Added Lavender',
        formula: [
          { name: 'Đào (Peach)', amount: 30 },
          { name: 'Hồng (Rose)', amount: 20 },
          { name: 'Xạ hương (Musk)', amount: 20 },
          { name: 'Vani (Vanilla)', amount: 15 },
          { name: 'Oải hương (Lavender)', amount: 15 },
        ],
      },
      baseFormula,
      'Tăng hương đào'
    );
    assert.equal(tamperedAdd.accepted, false);
    assert.deepEqual(tamperedAdd.result.formula, baseFormula);

    // Valid exact 4-item adjustment accepted
    const validUpdate = sanitizeStandalonePrecisionResponse(
      {
        message: 'Tăng Đào lên 40%',
        formula: [
          { name: 'Đào (Peach)', amount: 40 },
          { name: 'Hồng (Rose)', amount: 20 },
          { name: 'Xạ hương (Musk)', amount: 20 },
          { name: 'Vani (Vanilla)', amount: 20 },
        ],
      },
      baseFormula,
      'Tăng hương đào'
    );
    assert.equal(validUpdate.accepted, true);
    assert.equal(validUpdate.result.formula[0].amount, 40);

    // Floris 6-slot failsafe rejects tampered 0% slot activation
    const calc = calculateFormula(SAMPLE_SLOTS, 10, 10);
    const fakeBadResult = generateLocalAdjustment('Tăng đào', 'Mùa Xuân (Spring)', 10, 10, calc.calculatedIngredients);
    fakeBadResult.comparisonItems = fakeBadResult.comparisonItems.map((item) =>
      item.slotKey === 'top2' ? { ...item, newPercentage: 12, deltaPercentage: 12 } : item
    );
    const guarded = enforceClientFormulaIntegrity(fakeBadResult, calc.calculatedIngredients, 'Tăng đào', 10, 10);
    assert.equal(guarded.isUnchanged, true);
    assert.deepEqual(
      guarded.comparisonItems.map((c) => c.newPercentage),
      [40, 0, 30, 0, 15, 15]
    );
  });

  it('generateLocalEvaluation returns bounded radar values and Spring suitability score', () => {
    const calc = calculateFormula(SAMPLE_SLOTS, 10, 10);
    const evalRes = generateLocalEvaluation('Mùa Xuân (Spring)', 10, '10%', calc.calculatedIngredients, calc.tierTotals);
    assert.ok(evalRes.seasonSuitabilityScore >= 70 && evalRes.seasonSuitabilityScore <= 100);
    assert.ok(evalRes.olfactoryRadar.floral >= 15 && evalRes.olfactoryRadar.floral <= 95);
  });

  it('multilingual speech helper normalizes MIME types and defaults to auto (all languages)', () => {
    assert.equal(cleanAudioMimeType('audio/webm;codecs=opus'), 'audio/webm');
    assert.equal(cleanAudioMimeType('AUDIO/MP4'), 'audio/mp4');
    assert.equal(cleanAudioMimeType('invalid/type'), 'audio/webm');
    assert.equal(cleanAudioMimeType(undefined), 'audio/webm');

    assert.equal(SPEECH_LANGUAGE_OPTIONS[0].code, 'auto');
    const codes = new Set(SPEECH_LANGUAGE_OPTIONS.map((o) => o.code));
    for (const expected of ['auto', 'vi-VN', 'en-US', 'fr-FR', 'ja-JP', 'ko-KR', 'zh-CN', 'es-ES', 'de-DE']) {
      assert.ok(codes.has(expected), `Missing speech language option: ${expected}`);
    }
  });

  it('adjusts formulas and detects missing notes in French, Japanese, Korean, and Chinese', () => {
    const calc = calculateFormula(SAMPLE_SLOTS, 10, 10);

    // French: "Plus de pêche" -> Đào (heart1) increases > 30%
    const frRes = generateLocalAdjustment(
      'Plus de pêche',
      'Mùa Xuân (Spring)',
      10,
      10,
      calc.calculatedIngredients,
      calc.tierTotals
    );
    assert.equal(frRes.isUnchanged, false);
    assert.ok(frRes.comparisonItems.find((c) => c.slotKey === 'heart1')!.newPercentage > 30);
    assert.equal(frRes.comparisonItems.find((c) => c.slotKey === 'top2')!.newPercentage, 0);
    assert.equal(frRes.comparisonItems.reduce((a, b) => a + b.newPercentage, 0), 100);

    // Japanese active: "桃を強く" -> Đào (heart1) increases > 30%
    const jaRes = generateLocalAdjustment(
      '桃を強く',
      'Mùa Xuân (Spring)',
      10,
      10,
      calc.calculatedIngredients,
      calc.tierTotals
    );
    assert.equal(jaRes.isUnchanged, false);
    assert.ok(jaRes.comparisonItems.find((c) => c.slotKey === 'heart1')!.newPercentage > 30);

    // Japanese missing ingredient: "ラベンダーを増やす" -> unchanged (Lavender not in formula)
    const jaMissing = generateLocalAdjustment(
      'ラベンダーを増やす',
      'Mùa Xuân (Spring)',
      10,
      10,
      calc.calculatedIngredients,
      calc.tierTotals
    );
    assert.equal(jaMissing.isUnchanged, true);
    assert.deepEqual(
      jaMissing.comparisonItems.map((c) => c.newPercentage),
      [40, 0, 30, 0, 15, 15]
    );

    // Korean: "복숭아 더 강하게" -> Đào (heart1) increases > 30%
    const koRes = generateLocalAdjustment(
      '복숭아 더 강하게',
      'Mùa Xuân (Spring)',
      10,
      10,
      calc.calculatedIngredients,
      calc.tierTotals
    );
    assert.equal(koRes.isUnchanged, false);
    assert.ok(koRes.comparisonItems.find((c) => c.slotKey === 'heart1')!.newPercentage > 30);

    // Chinese: "增加水蜜桃" -> Đào (heart1) increases > 30%
    const zhRes = generateLocalAdjustment(
      '增加水蜜桃',
      'Mùa Xuân (Spring)',
      10,
      10,
      calc.calculatedIngredients,
      calc.tierTotals
    );
    assert.equal(zhRes.isUnchanged, false);
    assert.ok(zhRes.comparisonItems.find((c) => c.slotKey === 'heart1')!.newPercentage > 30);
  });

  it('prevents 405 internal POSTs on GitHub Pages while supporting external API base URLs', () => {
    assert.equal(isStaticHostingEnvironment('baogiang2804-jpg.github.io', 'https:'), true);
    assert.equal(isStaticHostingEnvironment('floris.pages.dev', 'https:'), true);
    assert.equal(isStaticHostingEnvironment('localhost', 'http:'), false);
    assert.equal(
      isStaticHostingEnvironment('ais-pre-n2dvxop477g75rkp3j6273-248853502236.asia-southeast1.run.app', 'https:'),
      false
    );

    // GitHub Pages without external API -> returns [] (zero 405 POSTs, uses Web Speech API + local engine)
    assert.deepEqual(
      resolveApiEndpoints('/api/perfume/transcribe', {
        hostname: 'baogiang2804-jpg.github.io',
        protocol: 'https:',
        pathname: '/Floris/',
        apiBaseUrl: '',
      }),
      []
    );

    // GitHub Pages WITH external API URL -> points directly to working external API
    assert.deepEqual(
      resolveApiEndpoints('/api/perfume/transcribe', {
        hostname: 'baogiang2804-jpg.github.io',
        protocol: 'https:',
        pathname: '/Floris/',
        apiBaseUrl: 'https://floris-api.example.run.app/',
      }),
      ['https://floris-api.example.run.app/api/perfume/transcribe']
    );

    // Full-stack localhost / Cloud Run -> uses internal server routes
    assert.deepEqual(
      resolveApiEndpoints('/api/perfume/transcribe', {
        hostname: 'localhost',
        protocol: 'http:',
        pathname: '/',
        apiBaseUrl: '',
      }),
      ['/api/perfume/transcribe']
    );

    // Runtime 405 circuit breaker stops further internal POST attempts
    assert.deepEqual(
      resolveApiEndpoints('/api/perfume/adjust', {
        hostname: 'custom-static.example.com',
        protocol: 'https:',
        pathname: '/',
        apiBaseUrl: '',
        internalPostBlocked: true,
      }),
      []
    );
  });

  it('uses browser webkitSpeechRecognition directly with zero POST requests', async () => {
    assert.equal(resolveSpeechRecognitionLang('auto', 'fr-FR'), 'fr-FR');
    assert.equal(resolveSpeechRecognitionLang('auto', ''), 'vi-VN');
    assert.equal(resolveSpeechRecognitionLang('ja-JP', 'en-US'), 'ja-JP');

    const prevWindow = (globalThis as any).window;
    const prevFetch = globalThis.fetch;
    let fetchCount = 0;

    (globalThis as any).fetch = async () => {
      fetchCount++;
      throw new Error('Must not send POST requests during browser speech recognition');
    };

    class FakeWebkitSpeechRecognition {
      lang = '';
      interimResults = false;
      continuous = false;
      maxAlternatives = 1;
      onstart: (() => void) | null = null;
      onresult: ((e: any) => void) | null = null;
      onerror: ((e: any) => void) | null = null;
      onend: (() => void) | null = null;
      start() {
        this.onstart?.();
        this.onresult?.({
          results: [{ 0: { transcript: 'Tăng hương đào' }, isFinal: true }],
        });
        this.onend?.();
      }
      stop() {
        this.onend?.();
      }
    }

    (globalThis as any).window = {
      webkitSpeechRecognition: FakeWebkitSpeechRecognition,
    };

    try {
      let capturedTranscript = '';
      let finalFlag = false;
      let finished = false;
      const session = createMultilingualVoiceSession({
        language: 'vi-VN',
        onStatus: () => {},
        onTranscriptUpdate: (text, isFinal) => {
          capturedTranscript = text;
          finalFlag = isFinal;
        },
        onError: (err) => {
          assert.fail(`Unexpected error: ${err}`);
        },
        onFinish: () => {
          finished = true;
        },
      });

      const started = await session.start();
      assert.equal(started, true);
      assert.equal(capturedTranscript, 'Tăng hương đào');
      assert.equal(finalFlag, true);
      assert.equal(finished, true);
      assert.equal(fetchCount, 0);
    } finally {
      (globalThis as any).window = prevWindow;
      globalThis.fetch = prevFetch;
    }
  });
});

