import { FormulaSlot } from './perfumeCalculations';

export interface PrecisionFormulaEntry {
  name: string;
  amount: number;
}

export interface PrecisionOnlyResult {
  message: string;
  formula: PrecisionFormulaEntry[];
}

export interface ComparisonItem {
  slotKey: FormulaSlot['key'];
  tier: 'top' | 'heart' | 'base';
  tierLabel: string;
  id: string;
  name: string;
  scentFamily: string;
  oldPercentage: number;
  newPercentage: number;
  deltaPercentage: number;
  oldFinalProductConcPercent?: number;
  newFinalProductConcPercent?: number;
  oldVolumeMl: number;
  newVolumeMl: number;
  oldDrops: number;
  newDrops: number;
  reason: string;
}

export interface AIAdjustmentResult {
  message: string;
  formula: PrecisionFormulaEntry[];
  isUnchanged?: boolean;
  missingIngredients?: string[];
  spokenResponse: string;
  analysisSummary: string;
  proposedPerfumeName: string;
  highlightChanges: string[];
  comparisonItems: ComparisonItem[];
  newTierTotals: { top: number; heart: number; base: number };
  olfactoryPredictionHypothesis?: {
    overallChange?: string;
    topStage?: string;
    heartStage?: string;
    baseStage?: string;
  };
  studentReviewHints?: {
    reasonableHint?: string;
    chemistryKnowledgeHint?: string;
    experimentVerificationHint?: string;
  };
  validationReport?: {
    rawAiSum: number;
    validatedSum: number;
    wasNormalized: boolean;
    isValid100: boolean;
    pureFragranceMl: number;
    carrierAlcoholMl: number;
    concentrationPercent: number;
    concentrationDistinctionNote: string;
  };
  source?: string;
}

interface IngredientLexiconEntry {
  canonicalKey: string;
  displayName: string;
  tierHint: 'top' | 'heart' | 'base';
  /** Ordered longest-first inside each entry; global matching also sorts all phrases longest-first */
  aliases: string[];
}

const KNOWN_INGREDIENT_LEXICON: IngredientLexiconEntry[] = [
  {
    canonicalKey: 'cherry_blossom',
    displayName: 'Hoa anh đào (Cherry Blossom)',
    tierHint: 'heart',
    aliases: ['hoa anh đào', 'cherry blossom', 'sakura', 'anh đào'],
  },
  {
    canonicalKey: 'jasmine',
    displayName: 'Hoa nhài (Jasmine)',
    tierHint: 'top',
    aliases: ['hoa nhài trắng', 'fresh jasmine', 'jasmine sambac', 'hoa nhài', 'jasmine', 'hoa lài', 'nhài', 'lài'],
  },
  {
    canonicalKey: 'peach',
    displayName: 'Đào (Peach)',
    tierHint: 'heart',
    aliases: ['spring peach', 'peach blossom', 'đào mùa xuân', 'quả đào', 'trái đào', 'hương đào', 'peach', 'đào'],
  },
  {
    canonicalKey: 'musk',
    displayName: 'Xạ hương trắng (White Musk)',
    tierHint: 'base',
    aliases: ['xạ hương trắng', 'white musk', 'macrocyclic musk', 'xạ hương', 'musk'],
  },
  {
    canonicalKey: 'vanilla',
    displayName: 'Vanilla',
    tierHint: 'base',
    aliases: ['vanilla planifolia', 'vani bourbon', 'vanilla', 'vani'],
  },
  {
    canonicalKey: 'rose',
    displayName: 'Hoa hồng (Rose)',
    tierHint: 'heart',
    aliases: ['hoa hồng grasse', 'rose de mai', 'hoa hồng', 'rose'],
  },
  {
    canonicalKey: 'bergamot',
    displayName: 'Cam Bergamot',
    tierHint: 'top',
    aliases: ['cam bergamot', 'citrus bergamia', 'bergamot'],
  },
  {
    canonicalKey: 'lemon',
    displayName: 'Chanh vàng (Lemon)',
    tierHint: 'top',
    aliases: ['chanh vàng sicily', 'chanh vàng', 'lemon', 'chanh'],
  },
  {
    canonicalKey: 'neroli',
    displayName: 'Hoa cam Neroli',
    tierHint: 'top',
    aliases: ['hoa cam neroli', 'hoa cam', 'neroli'],
  },
  {
    canonicalKey: 'mandarin',
    displayName: 'Quýt hồng Mandarin',
    tierHint: 'top',
    aliases: ['quýt hồng mandarin', 'quýt hồng', 'mandarin', 'quýt'],
  },
  {
    canonicalKey: 'orange',
    displayName: 'Cam ngọt (Orange)',
    tierHint: 'top',
    aliases: ['cam ngọt valencia', 'cam ngọt', 'vỏ cam', 'hương cam', 'mùi cam', 'sweet orange', 'orange', 'cam'],
  },
  {
    canonicalKey: 'pear',
    displayName: 'Lê (Pear)',
    tierHint: 'top',
    aliases: ['quả lê', 'hương lê', 'pear accord', 'pear', 'lê'],
  },
  {
    canonicalKey: 'peppermint',
    displayName: 'Bạc hà (Peppermint)',
    tierHint: 'top',
    aliases: ['bạc hà băng', 'peppermint', 'spearmint', 'bạc hà', 'mint'],
  },
  {
    canonicalKey: 'pink_pepper',
    displayName: 'Tiêu hồng (Pink Pepper)',
    tierHint: 'top',
    aliases: ['tiêu hồng bourbon', 'tiêu hồng', 'pink pepper'],
  },
  {
    canonicalKey: 'cardamom',
    displayName: 'Bạch đậu khấu (Cardamom)',
    tierHint: 'top',
    aliases: ['bạch đậu khấu xanh', 'bạch đậu khấu', 'cardamom'],
  },
  {
    canonicalKey: 'lavender',
    displayName: 'Oải hương (Lavender)',
    tierHint: 'heart',
    aliases: ['oải hương provence', 'hoa oải hương', 'oải hương', 'lavender'],
  },
  {
    canonicalKey: 'ylang',
    displayName: 'Ngọc lan tây (Ylang Ylang)',
    tierHint: 'heart',
    aliases: ['ngọc lan tây', 'ylang ylang', 'ylang-ylang', 'ylang'],
  },
  {
    canonicalKey: 'geranium',
    displayName: 'Phong lữ (Geranium)',
    tierHint: 'heart',
    aliases: ['phong lữ bourbon', 'phong lữ', 'geranium'],
  },
  {
    canonicalKey: 'iris',
    displayName: 'Diên vĩ (Iris / Orris)',
    tierHint: 'heart',
    aliases: ['rễ diên vĩ', 'diên vĩ', 'orris', 'iris'],
  },
  {
    canonicalKey: 'cinnamon',
    displayName: 'Quế (Cinnamon)',
    tierHint: 'heart',
    aliases: ['quế ceylon', 'hương quế', 'cinnamon', 'quế'],
  },
  {
    canonicalKey: 'sandalwood',
    displayName: 'Gỗ đàn hương (Sandalwood)',
    tierHint: 'base',
    aliases: ['gỗ đàn hương mysore', 'gỗ đàn hương', 'đàn hương', 'sandalwood'],
  },
  {
    canonicalKey: 'cedarwood',
    displayName: 'Gỗ tuyết tùng (Cedarwood)',
    tierHint: 'base',
    aliases: ['gỗ tuyết tùng virginia', 'gỗ tuyết tùng', 'tuyết tùng', 'cedarwood', 'cedar'],
  },
  {
    canonicalKey: 'patchouli',
    displayName: 'Hoắc hương (Patchouli)',
    tierHint: 'base',
    aliases: ['hoắc hương indonesia', 'hoắc hương', 'patchouli'],
  },
  {
    canonicalKey: 'amber',
    displayName: 'Hổ phách (Amber)',
    tierHint: 'base',
    aliases: ['hổ phách hoàng gia', 'hổ phách', 'ambergris', 'amber'],
  },
  {
    canonicalKey: 'vetiver',
    displayName: 'Cỏ hương bài (Vetiver)',
    tierHint: 'base',
    aliases: ['cỏ hương bài haiti', 'cỏ hương bài', 'hương bài', 'vetiver'],
  },
  {
    canonicalKey: 'oud',
    displayName: 'Trầm hương (Oud / Agarwood)',
    tierHint: 'base',
    aliases: ['gỗ trầm hương', 'trầm hương', 'agarwood', 'oud'],
  },
  {
    canonicalKey: 'peony',
    displayName: 'Hoa mẫu đơn (Peony)',
    tierHint: 'heart',
    aliases: ['hoa mẫu đơn', 'mẫu đơn', 'peony'],
  },
  {
    canonicalKey: 'lotus',
    displayName: 'Hoa sen (Lotus)',
    tierHint: 'heart',
    aliases: ['hoa sen', 'lotus'],
  },
  {
    canonicalKey: 'gardenia',
    displayName: 'Hoa dành dành (Gardenia)',
    tierHint: 'heart',
    aliases: ['hoa dành dành', 'dành dành', 'gardenia'],
  },
  {
    canonicalKey: 'lily',
    displayName: 'Hoa linh lan / Hoa ly (Lily)',
    tierHint: 'heart',
    aliases: ['lily of the valley', 'hoa linh lan', 'linh lan', 'hoa ly', 'lily'],
  },
  {
    canonicalKey: 'tonka',
    displayName: 'Đậu Tonka (Tonka Bean)',
    tierHint: 'base',
    aliases: ['tonka bean', 'đậu tonka', 'tonka'],
  },
  {
    canonicalKey: 'coffee',
    displayName: 'Cà phê (Coffee)',
    tierHint: 'base',
    aliases: ['cà phê', 'coffee'],
  },
  {
    canonicalKey: 'green_tea',
    displayName: 'Trà xanh (Green Tea)',
    tierHint: 'top',
    aliases: ['trà xanh', 'trà trắng', 'white tea', 'green tea'],
  },
  {
    canonicalKey: 'coconut',
    displayName: 'Dừa (Coconut)',
    tierHint: 'heart',
    aliases: ['nước dừa', 'cốt dừa', 'coconut', 'dừa'],
  },
  {
    canonicalKey: 'strawberry',
    displayName: 'Dâu tây (Strawberry)',
    tierHint: 'heart',
    aliases: ['dâu tây', 'strawberry'],
  },
  {
    canonicalKey: 'apple',
    displayName: 'Táo xanh (Apple)',
    tierHint: 'top',
    aliases: ['táo xanh', 'green apple', 'apple'],
  },
  {
    canonicalKey: 'saffron',
    displayName: 'Nghệ tây (Saffron)',
    tierHint: 'heart',
    aliases: ['nhụy hoa nghệ tây', 'nghệ tây', 'saffron'],
  },
];

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildWordBoundaryRegex(phrase: string): RegExp {
  const escaped = escapeRegex(phrase.toLowerCase());
  return new RegExp(`(^|[^\\p{L}\\p{N}])(${escaped})(?=$|[^\\p{L}\\p{N}])`, 'giu');
}

export interface DetectedMention {
  canonicalKey: string;
  displayName: string;
  matchedText: string;
}

/**
 * Detects specific named fragrance ingredients in a user prompt.
 * Sorts aliases longest-first and masks matched spans so compound names like
 * "hoa anh đào" do not falsely match "đào", and "hoa cam" does not falsely match "cam".
 */
export function detectIngredientMentions(
  userRequest: string,
  customIngredients: Array<{ name: string; id?: string }> = []
): DetectedMention[] {
  let working = (userRequest || '').toLowerCase();
  const found: DetectedMention[] = [];
  const seenKeys = new Set<string>();

  // Build global sorted phrase table (longest phrases first)
  const phraseEntries: Array<{ phrase: string; entry: IngredientLexiconEntry }> = [];
  for (const entry of KNOWN_INGREDIENT_LEXICON) {
    for (const alias of entry.aliases) {
      phraseEntries.push({ phrase: alias.toLowerCase(), entry });
    }
  }

  // Include custom active/catalog ingredient base names
  for (const ci of customIngredients) {
    const cleanBase = cleanIngredientDisplayName(ci.name).toLowerCase();
    if (cleanBase.length >= 2) {
      const existingMatch = KNOWN_INGREDIENT_LEXICON.find((e) =>
        e.aliases.some((a) => cleanBase.includes(a) || a.includes(cleanBase))
      );
      if (!existingMatch) {
        phraseEntries.push({
          phrase: cleanBase,
          entry: {
            canonicalKey: `custom_${cleanBase}`,
            displayName: cleanIngredientDisplayName(ci.name),
            tierHint: 'heart',
            aliases: [cleanBase],
          },
        });
      }
    }
  }

  phraseEntries.sort((a, b) => b.phrase.length - a.phrase.length);

  for (const { phrase, entry } of phraseEntries) {
    const regex = buildWordBoundaryRegex(phrase);
    const match = regex.exec(working);
    if (match) {
      if (!seenKeys.has(entry.canonicalKey)) {
        seenKeys.add(entry.canonicalKey);
        found.push({
          canonicalKey: entry.canonicalKey,
          displayName: entry.displayName,
          matchedText: match[2],
        });
      }
      // Mask out matched phrase so shorter overlapping words inside it don't double-trigger
      working = working.replace(regex, (full, prefix, word) => `${prefix}${' '.repeat(word.length)}`);
    }
  }

  return found;
}

export function cleanIngredientDisplayName(name: string): string {
  return (name || '')
    .split('(')[0]
    .replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/gu, '')
    .trim();
}

export function getIngredientCanonicalKeys(ing: { id?: string; name: string }): string[] {
  const keys: string[] = [];
  const lowerName = (ing.name || '').toLowerCase();
  const lowerId = (ing.id || '').toLowerCase();

  for (const entry of KNOWN_INGREDIENT_LEXICON) {
    const matched = entry.aliases.some((alias) => {
      const rx = buildWordBoundaryRegex(alias);
      return rx.test(lowerName);
    });
    if (matched || (lowerId && lowerId.includes(entry.canonicalKey))) {
      keys.push(entry.canonicalKey);
    }
  }

  // Fallback exact custom key
  const clean = cleanIngredientDisplayName(ing.name).toLowerCase();
  if (clean) {
    keys.push(`custom_${clean}`);
  }

  return Array.from(new Set(keys));
}

export interface ExplicitCommandInfo {
  isExplicitAdd: boolean;
  isExplicitRemove: boolean;
  explicitTargetPhrase: string | null;
}

/**
 * Only treats strict explicit commands ("add [ingredient]", "remove [ingredient]",
 * "thêm nguyên liệu [ingredient]", "xóa/bỏ nguyên liệu [ingredient]") as explicit list mutations.
 * Casual requests like "adjust Jasmine", "more Lavender", "tăng hương cam" are NOT explicit adds
 * and fall under Rule 4 (keep numbers unchanged if missing).
 */
export function parseExplicitAddRemoveCommand(userRequest: string): ExplicitCommandInfo {
  const raw = (userRequest || '').trim();
  const addMatch =
    raw.match(/^(?:please\s+)?add\s+(?:the\s+)?(?:ingredient\s+|note\s+)?(.+)$/i) ||
    raw.match(/\badd\s+ingredient\s+([^.,;!?]+)/i) ||
    raw.match(/\b(?:thêm|bổ sung)\s+nguyên liệu\s+([^.,;!?]+)/i);

  const removeMatch =
    raw.match(/^(?:please\s+)?remove\s+(?:the\s+)?(?:ingredient\s+|note\s+)?(.+)$/i) ||
    raw.match(/\bremove\s+ingredient\s+([^.,;!?]+)/i) ||
    raw.match(/\b(?:xóa|loại bỏ|bỏ hẳn)\s+(?:nguyên liệu\s+)?([^.,;!?]+)/i);

  if (removeMatch) {
    return {
      isExplicitAdd: false,
      isExplicitRemove: true,
      explicitTargetPhrase: removeMatch[1].trim(),
    };
  }
  if (addMatch) {
    return {
      isExplicitAdd: true,
      isExplicitRemove: false,
      explicitTargetPhrase: addMatch[1].trim(),
    };
  }
  return {
    isExplicitAdd: false,
    isExplicitRemove: false,
    explicitTargetPhrase: null,
  };
}

export interface MissingIngredientCheck {
  hasMissingIngredient: boolean;
  missingIngredients: DetectedMention[];
  matchedActiveIngredients: Array<{ mention: DetectedMention; ingredientName: string }>;
}

/**
 * Checks whether the user request mentions any specific ingredient that is NOT in the active formula.
 */
export function checkMissingIngredients(
  userRequest: string,
  activeIngredients: Array<{ id?: string; name: string; percentage?: number; amount?: number }>
): MissingIngredientCheck {
  const mentions = detectIngredientMentions(userRequest, activeIngredients);
  const activeKeyMap = activeIngredients.map((ing) => ({
    ing,
    keys: getIngredientCanonicalKeys(ing),
    cleanLower: cleanIngredientDisplayName(ing.name).toLowerCase(),
    rawLower: (ing.name || '').toLowerCase(),
  }));

  const missingIngredients: DetectedMention[] = [];
  const matchedActiveIngredients: Array<{ mention: DetectedMention; ingredientName: string }> = [];

  for (const mention of mentions) {
    const matchingActive = activeKeyMap.find(
      (item) =>
        item.keys.includes(mention.canonicalKey) ||
        item.cleanLower === mention.matchedText.toLowerCase() ||
        item.rawLower.includes(mention.matchedText.toLowerCase())
    );
    if (matchingActive) {
      matchedActiveIngredients.push({
        mention,
        ingredientName: matchingActive.ing.name,
      });
    } else {
      missingIngredients.push(mention);
    }
  }

  return {
    hasMissingIngredient: missingIngredients.length > 0,
    missingIngredients,
    matchedActiveIngredients,
  };
}

/**
 * Distributes integer amounts cleanly across active items so their sum equals targetSum (default 100),
 * preserving strictly positive >= 1 integer weights for every active item.
 */
function rebalanceIntegersToSum(rawWeights: number[], targetSum = 100): number[] {
  const n = rawWeights.length;
  if (n === 0) return [];
  if (n === 1) return [targetSum];

  const safeWeights = rawWeights.map((w) => Math.max(1, Number.isFinite(w) ? w : 1));
  const totalWeight = safeWeights.reduce((a, b) => a + b, 0);

  const exact = safeWeights.map((w) => (w / totalWeight) * targetSum);
  const floored = exact.map((val) => Math.max(1, Math.floor(val)));
  let currentSum = floored.reduce((a, b) => a + b, 0);

  // If min-1 clamp pushed sum over targetSum, trim from largest items > 1
  while (currentSum > targetSum) {
    let maxIdx = -1;
    let maxVal = 1;
    for (let i = 0; i < n; i++) {
      if (floored[i] > maxVal) {
        maxVal = floored[i];
        maxIdx = i;
      }
    }
    if (maxIdx === -1) break;
    floored[maxIdx] -= 1;
    currentSum -= 1;
  }

  // Distribute remaining points by largest fractional remainder
  const remainders = exact.map((val, idx) => ({
    idx,
    rem: val - Math.floor(val),
  }));
  remainders.sort((a, b) => b.rem - a.rem);

  let remPtr = 0;
  while (currentSum < targetSum) {
    const idx = remainders[remPtr % n].idx;
    floored[idx] += 1;
    currentSum += 1;
    remPtr += 1;
  }

  return floored;
}

/**
 * Normalizes AI adjustment output strictly obeying Rules 1-4:
 * - Inactive 0% slots remain 0% (unless explicitly added).
 * - Active >0% slots remain >= 1% (unless explicitly removed).
 * - Preserves exact original amounts when `parsed.isUnchanged` is true.
 * - Ensures active sum === 100% cleanly via largest-remainder rounding.
 */
export function normalizeAdjustmentOutput(
  parsed: any,
  originalIngredients: any[],
  totalVolume: number,
  concentrationPercent: number
): AIAdjustmentResult {
  const pureFragranceMl = Number(((totalVolume * concentrationPercent) / 100).toFixed(2));
  const carrierAlcoholMl = Number((totalVolume - pureFragranceMl).toFixed(2));
  const rawList: any[] = Array.isArray(parsed.adjustedIngredients) ? parsed.adjustedIngredients : [];
  const forceUnchanged = Boolean(parsed?.isUnchanged);
  const explicitAddSlots = new Set<string>(Array.isArray(parsed?.explicitAddSlotKeys) ? parsed.explicitAddSlotKeys : []);
  const explicitRemoveSlots = new Set<string>(Array.isArray(parsed?.explicitRemoveSlotKeys) ? parsed.explicitRemoveSlotKeys : []);

  let mapped = originalIngredients.map((orig: any) => {
    const wasActive = (orig.percentage || 0) > 0;
    const found = rawList.find((r) => r.slotKey === orig.slotKey);

    if (forceUnchanged) {
      return {
        slotKey: orig.slotKey as FormulaSlot['key'],
        tier: orig.tier as 'top' | 'heart' | 'base',
        tierLabel: orig.tierLabel,
        id: orig.id,
        name: orig.name,
        scentFamily: orig.scentFamily,
        oldPercentage: orig.percentage,
        newPercentage: orig.percentage,
        reason: found?.reason || 'Giữ nguyên tỷ lệ gốc',
      };
    }

    // Rule 1 & 2: Inactive 0% slots MUST remain 0% unless explicitly added
    if (!wasActive && !explicitAddSlots.has(orig.slotKey)) {
      return {
        slotKey: orig.slotKey as FormulaSlot['key'],
        tier: orig.tier as 'top' | 'heart' | 'base',
        tierLabel: orig.tierLabel,
        id: orig.id,
        name: orig.name,
        scentFamily: orig.scentFamily,
        oldPercentage: 0,
        newPercentage: 0,
        reason: 'Khe hương không dùng trong công thức gốc (giữ nguyên 0%)',
      };
    }

    // Rule 2: Explicit removal sets slot to 0%
    if (wasActive && explicitRemoveSlots.has(orig.slotKey)) {
      return {
        slotKey: orig.slotKey as FormulaSlot['key'],
        tier: orig.tier as 'top' | 'heart' | 'base',
        tierLabel: orig.tierLabel,
        id: orig.id,
        name: orig.name,
        scentFamily: orig.scentFamily,
        oldPercentage: orig.percentage,
        newPercentage: 0,
        reason: found?.reason || 'Đã loại bỏ theo lệnh trực tiếp của người dùng',
      };
    }

    const newPct =
      found && typeof found.newPercentage === 'number' && Number.isFinite(found.newPercentage)
        ? Math.max(1, Math.round(found.newPercentage))
        : Math.max(1, orig.percentage);

    return {
      slotKey: orig.slotKey as FormulaSlot['key'],
      tier: orig.tier as 'top' | 'heart' | 'base',
      tierLabel: orig.tierLabel,
      id: orig.id,
      name: orig.name,
      scentFamily: orig.scentFamily,
      oldPercentage: orig.percentage,
      newPercentage: newPct,
      reason: found?.reason || 'Điều chỉnh tỷ lệ cân bằng trong công thức hiện có',
    };
  });

  // Normalize ONLY active items (newPercentage > 0) so total is strictly 100%
  const activeIndices: number[] = [];
  const activeWeights: number[] = [];
  mapped.forEach((item, idx) => {
    if (item.newPercentage > 0) {
      activeIndices.push(idx);
      activeWeights.push(item.newPercentage);
    }
  });

  const rawAiSum = activeWeights.reduce((acc, v) => acc + v, 0);
  const wasNormalized = !forceUnchanged && rawAiSum !== 100 && activeIndices.length > 0;
  if (wasNormalized) {
    const balanced = rebalanceIntegersToSum(activeWeights, 100);
    activeIndices.forEach((slotIdx, pos) => {
      mapped[slotIdx] = {
        ...mapped[slotIdx],
        newPercentage: balanced[pos],
      };
    });
  }

  const comparisonItems: ComparisonItem[] = mapped.map((item) => {
    const oldVolMl = Number(((pureFragranceMl * item.oldPercentage) / 100).toFixed(2));
    const newVolMl = Number(((pureFragranceMl * item.newPercentage) / 100).toFixed(2));
    const oldFinalProductConcPercent = Number(((item.oldPercentage * concentrationPercent) / 100).toFixed(2));
    const newFinalProductConcPercent = Number(((item.newPercentage * concentrationPercent) / 100).toFixed(2));
    const oldDrops = item.oldPercentage === 0 ? 0 : Math.max(1, Math.round(oldVolMl * 20));
    const newDrops = item.newPercentage === 0 ? 0 : Math.max(1, Math.round(newVolMl * 20));
    return {
      ...item,
      deltaPercentage: item.newPercentage - item.oldPercentage,
      oldFinalProductConcPercent,
      newFinalProductConcPercent,
      oldVolumeMl: oldVolMl,
      newVolumeMl: newVolMl,
      oldDrops,
      newDrops,
    };
  });

  const newTierTotals = {
    top: comparisonItems.filter((i) => i.tier === 'top').reduce((a, b) => a + b.newPercentage, 0),
    heart: comparisonItems.filter((i) => i.tier === 'heart').reduce((a, b) => a + b.newPercentage, 0),
    base: comparisonItems.filter((i) => i.tier === 'base').reduce((a, b) => a + b.newPercentage, 0),
  };

  const validatedSum = comparisonItems.reduce((a, b) => a + b.newPercentage, 0);
  const isUnchanged =
    forceUnchanged || comparisonItems.every((c) => c.deltaPercentage === 0);

  const formula: PrecisionFormulaEntry[] = comparisonItems
    .filter((c) => c.newPercentage > 0)
    .map((c) => ({
      name: c.name,
      amount: c.newPercentage,
    }));

  const summaryMsg =
    parsed.message ||
    parsed.analysisSummary ||
    'Công thức đã được tái cân bằng giữ nguyên danh sách nguyên liệu hiện có.';

  return {
    message: summaryMsg,
    formula,
    isUnchanged,
    missingIngredients: Array.isArray(parsed.missingIngredients) ? parsed.missingIngredients : undefined,
    spokenResponse:
      parsed.spokenResponse ||
      summaryMsg,
    analysisSummary: summaryMsg,
    proposedPerfumeName: parsed.proposedPerfumeName || 'Floris (Bản Tinh Chỉnh)',
    highlightChanges: Array.isArray(parsed.highlightChanges) ? parsed.highlightChanges : [],
    olfactoryPredictionHypothesis: parsed.olfactoryPredictionHypothesis || {
      overallChange: isUnchanged
        ? 'Giữ nguyên tỷ lệ gốc vì nguyên liệu được yêu cầu không có trong công thức hiện tại.'
        : 'Giả thuyết dự đoán: Mùi hương dịch chuyển cân đối theo tỷ lệ mới giữa các nguyên liệu hiện có.',
      topStage: '0–20 phút đầu: Nhóm phân tử tầng đầu bay hơi nhanh mở ra ấn tượng ban đầu.',
      heartStage: '20 phút – 3 giờ: Tầng giữa duy trì chủ đạo hài hòa.',
      baseStage: 'Sau 3 giờ: Tầng cuối định hương bền bỉ trên da.',
    },
    studentReviewHints: parsed.studentReviewHints || {
      reasonableHint: isUnchanged
        ? 'Tuân thủ nguyên tắc không tự ý thêm nguyên liệu ngoài công thức gốc.'
        : 'Đề xuất chỉ điều chỉnh tỷ lệ các nguyên liệu đang có trong công thức và đảm bảo tổng 100%.',
      chemistryKnowledgeHint:
        'Sự thay đổi phần trăm mol điều chỉnh áp suất hơi riêng phần theo định luật Raoult mà không làm xáo trộn cấu trúc nguyên liệu gốc.',
      experimentVerificationHint:
        'Pha 2 mẫu đối chứng quy mô nhỏ (5 mL hoặc 10 mL) và kiểm tra mùi hương sau 15 phút, 2 giờ và 6 giờ.',
    },
    validationReport: {
      rawAiSum: forceUnchanged ? 100 : rawAiSum,
      validatedSum,
      wasNormalized,
      isValid100: validatedSum === 100,
      pureFragranceMl,
      carrierAlcoholMl,
      concentrationPercent,
      concentrationDistinctionNote: `Tổng tỉ lệ phối trộn = ${validatedSum}%. Trong chai ${totalVolume} mL ở nồng độ ${concentrationPercent}%, tổng lượng cốt tinh dầu là ${pureFragranceMl} mL và dung môi cồn là ${carrierAlcoholMl} mL.`,
    },
    comparisonItems,
    newTierTotals,
    source: parsed.source || 'local_engine',
  };
}

/**
 * Local deterministic precision adjustment engine obeying STRICT RULES 1-4.
 * Works dynamically on ANY active ingredient set (not hardcoded to a fixed 4-note formula).
 */
export function generateLocalAdjustment(
  userRequest: string,
  _season: string,
  totalVolume: number,
  concentrationPercent: number,
  ingredients: any[] = [],
  _tierTotals: any = {}
): AIAdjustmentResult {
  const activeIngredients = ingredients.filter((i) => (i.percentage || 0) > 0);
  const activeListText = activeIngredients.map((i) => cleanIngredientDisplayName(i.name)).join(', ');
  const cmd = parseExplicitAddRemoveCommand(userRequest);

  // Check if user explicitly mentions a specific ingredient not in the active formula (Rule 4)
  const missingCheck = checkMissingIngredients(userRequest, activeIngredients);

  // Rule 2 exception: Explicit REMOVE of an existing active ingredient
  if (cmd.isExplicitRemove && missingCheck.matchedActiveIngredients.length > 0 && activeIngredients.length > 1) {
    const targetsToRemove = new Set(missingCheck.matchedActiveIngredients.map((m) => m.ingredientName));
    const remainingActive = activeIngredients.filter((i) => !targetsToRemove.has(i.name));
    const rebalanced = rebalanceIntegersToSum(
      remainingActive.map((i) => i.percentage),
      100
    );
    const newMap = new Map<string, number>();
    remainingActive.forEach((ing, idx) => newMap.set(ing.slotKey, rebalanced[idx]));

    const removedNames = Array.from(targetsToRemove).map(cleanIngredientDisplayName).join(', ');
    const msg = `Đã loại bỏ ${removedNames} theo yêu cầu và phân bổ lại tỷ lệ các nguyên liệu còn lại về đúng 100%.`;
    return normalizeAdjustmentOutput(
      {
        message: msg,
        spokenResponse: msg,
        analysisSummary: msg,
        proposedPerfumeName: 'Floris (Loại bỏ nốt theo yêu cầu)',
        explicitRemoveSlotKeys: activeIngredients.filter((i) => targetsToRemove.has(i.name)).map((i) => i.slotKey),
        highlightChanges: [`Loại bỏ ${removedNames}`, 'Cân đối phần còn lại đạt 100%'],
        adjustedIngredients: ingredients.map((ing) => ({
          slotKey: ing.slotKey,
          newPercentage: targetsToRemove.has(ing.name) ? 0 : newMap.get(ing.slotKey) ?? ing.percentage,
          reason: targetsToRemove.has(ing.name)
            ? `Đã loại bỏ theo lệnh trực tiếp`
            : `Tái phân bổ tỷ lệ sau khi loại bỏ ${removedNames}`,
        })),
      },
      ingredients,
      totalVolume,
      concentrationPercent
    );
  }

  // Rule 4: Ambiguity / Missing ingredient requested -> Keep original quantities 100% unchanged
  if (missingCheck.hasMissingIngredient) {
    const missingNames = missingCheck.missingIngredients.map((m) => m.displayName);
    const missingNamesStr = missingNames.join(', ');
    const msg = `Nguyên liệu "${missingNamesStr}" không có trong công thức hiện tại (${activeListText}). Hệ thống giữ nguyên toàn bộ tỷ lệ gốc để đảm bảo không tự ý thêm chất mới.`;
    const spoken = `Không tìm thấy ${missingNamesStr} trong công thức hiện tại, nên mình giữ nguyên toàn bộ tỷ lệ gốc.`;

    return normalizeAdjustmentOutput(
      {
        isUnchanged: true,
        missingIngredients: missingNames,
        message: msg,
        spokenResponse: spoken,
        analysisSummary: msg,
        proposedPerfumeName: 'Giữ Nguyên Công Thức Gốc',
        highlightChanges: [
          `Không có "${missingNamesStr}" trong công thức hiện tại`,
          'Giữ nguyên 100% tỷ lệ các nguyên liệu ban đầu',
        ],
        adjustedIngredients: ingredients.map((ing) => ({
          slotKey: ing.slotKey,
          newPercentage: ing.percentage,
          reason:
            (ing.percentage || 0) > 0
              ? `Giữ nguyên ${ing.percentage}% vì "${missingNamesStr}" không có trong công thức hiện tại`
              : 'Khe hương không sử dụng (0%)',
        })),
      },
      ingredients,
      totalVolume,
      concentrationPercent
    );
  }

  // Rule 3: Adjust ONLY quantities of active ingredients
  if (activeIngredients.length === 0) {
    const emptyMsg = 'Chưa có nguyên liệu nào có tỷ lệ lớn hơn 0% trong công thức hiện tại.';
    return normalizeAdjustmentOutput(
      {
        isUnchanged: true,
        message: emptyMsg,
        spokenResponse: emptyMsg,
        analysisSummary: emptyMsg,
        adjustedIngredients: [],
      },
      ingredients,
      totalVolume,
      concentrationPercent
    );
  }

  const q = (userRequest || '').toLowerCase();
  const explicitTargetPctMatch = q.match(/(?:lên|thành|tới|đến|to|at|=)\s*(\d{1,3})\s*%?/i);
  const explicitPct = explicitTargetPctMatch ? parseInt(explicitTargetPctMatch[1], 10) : null;

  const isDecreaseIntent =
    /\b(giảm|bớt|ít|nhẹ|dịu hơn|ít ngọt|decrease|reduce|less|lower|softer)\b/i.test(q);
  const isIncreaseIntent =
    /\b(tăng|nhiều|rõ|đậm|nổi bật|mạnh|increase|boost|more|higher|stronger|prominent|clearer)\b/i.test(q);

  const targetActiveKeys = new Set(missingCheck.matchedActiveIngredients.map((m) => m.ingredientName));

  // Case A: User named one or more active ingredients directly (e.g. "Tăng hương đào rõ hơn", "Giảm vanilla")
  if (targetActiveKeys.size > 0) {
    const targetNamesDisplay = Array.from(targetActiveKeys).map(cleanIngredientDisplayName).join(', ');
    const desiredWeights = new Map<string, number>();

    if (explicitPct !== null && explicitPct >= 1 && explicitPct <= 95 && targetActiveKeys.size === 1) {
      const onlyTarget = Array.from(targetActiveKeys)[0];
      const targetIng = activeIngredients.find((i) => i.name === onlyTarget)!;
      const otherActive = activeIngredients.filter((i) => i.name !== onlyTarget);
      const clampedTarget = Math.min(100 - otherActive.length, Math.max(1, explicitPct));
      desiredWeights.set(targetIng.slotKey, clampedTarget);

      if (otherActive.length > 0) {
        const remainingBudget = 100 - clampedTarget;
        const otherBalanced = rebalanceIntegersToSum(
          otherActive.map((i) => i.percentage),
          remainingBudget
        );
        otherActive.forEach((ing, idx) => desiredWeights.set(ing.slotKey, otherBalanced[idx]));
      }
    } else if (isDecreaseIntent && !isIncreaseIntent) {
      const targetGroup = activeIngredients.filter((i) => targetActiveKeys.has(i.name));
      const otherGroup = activeIngredients.filter((i) => !targetActiveKeys.has(i.name));
      let freed = 0;
      targetGroup.forEach((ing) => {
        const drop = Math.min(ing.percentage - 1, Math.max(4, Math.round(ing.percentage * 0.25)));
        const nextVal = Math.max(1, ing.percentage - drop);
        freed += ing.percentage - nextVal;
        desiredWeights.set(ing.slotKey, nextVal);
      });
      if (otherGroup.length > 0) {
        const targetBudget = otherGroup.reduce((a, b) => a + b.percentage, 0) + freed;
        const otherBalanced = rebalanceIntegersToSum(
          otherGroup.map((i) => i.percentage),
          targetBudget
        );
        otherGroup.forEach((ing, idx) => desiredWeights.set(ing.slotKey, otherBalanced[idx]));
      }
    } else {
      // Default: increase the targeted active ingredient(s) and proportionally reduce others
      const targetGroup = activeIngredients.filter((i) => targetActiveKeys.has(i.name));
      const otherGroup = activeIngredients.filter((i) => !targetActiveKeys.has(i.name));
      const boostPerItem = Math.max(6, Math.round(12 / targetGroup.length));
      let newTargetSum = 0;
      targetGroup.forEach((ing) => {
        const nextVal = Math.min(100 - otherGroup.length, ing.percentage + boostPerItem);
        newTargetSum += nextVal;
        desiredWeights.set(ing.slotKey, nextVal);
      });
      if (otherGroup.length > 0) {
        const remaining = 100 - newTargetSum;
        const otherBalanced = rebalanceIntegersToSum(
          otherGroup.map((i) => i.percentage),
          remaining
        );
        otherGroup.forEach((ing, idx) => desiredWeights.set(ing.slotKey, otherBalanced[idx]));
      }
    }

    const finalWeights = rebalanceIntegersToSum(
      activeIngredients.map((i) => desiredWeights.get(i.slotKey) ?? i.percentage),
      100
    );
    const finalMap = new Map<string, number>();
    activeIngredients.forEach((i, idx) => finalMap.set(i.slotKey, finalWeights[idx]));

    const actionVerb = isDecreaseIntent && !isIncreaseIntent ? 'Giảm' : 'Tăng';
    const msg = `${actionVerb} tỷ lệ ${targetNamesDisplay} và cân chỉnh các thành phần hiện có về đúng 100%.`;
    const spoken = `Đã ${actionVerb.toLowerCase()} tỷ lệ ${targetNamesDisplay} và cân bằng lại các nốt hương trong công thức.`;

    return normalizeAdjustmentOutput(
      {
        message: msg,
        spokenResponse: spoken,
        analysisSummary: msg,
        proposedPerfumeName: `Floris (${actionVerb} ${targetNamesDisplay})`,
        highlightChanges: activeIngredients.map((i) => {
          const next = finalMap.get(i.slotKey) ?? i.percentage;
          const delta = next - i.percentage;
          return `${cleanIngredientDisplayName(i.name)}: ${i.percentage}% → ${next}% (${delta >= 0 ? '+' : ''}${delta}%)`;
        }),
        adjustedIngredients: ingredients.map((ing) => {
          const next = finalMap.get(ing.slotKey) ?? 0;
          const delta = next - (ing.percentage || 0);
          return {
            slotKey: ing.slotKey,
            newPercentage: next,
            reason:
              (ing.percentage || 0) === 0
                ? 'Khe hương không sử dụng (0%)'
                : delta > 0
                ? `Tăng ${cleanIngredientDisplayName(ing.name)} (+${delta}%) theo yêu cầu của bạn`
                : delta < 0
                ? `Giảm nhẹ ${cleanIngredientDisplayName(ing.name)} (${delta}%) để giữ tổng công thức đúng 100%`
                : `Giữ ổn định ${cleanIngredientDisplayName(ing.name)}`,
          };
        }),
      },
      ingredients,
      totalVolume,
      concentrationPercent
    );
  }

  // Case B: Sensory direction (fresh / softer / warmer-longer / floral / keep signature)
  const wantFresher =
    q.includes('tươi mát') ||
    q.includes('mát hơn') ||
    q.includes('sảng khoái') ||
    q.includes('thoáng') ||
    q.includes('fresher') ||
    q.includes('fresh') ||
    q.includes('brighter');
  const wantLessStrong =
    q.includes('giảm cảm giác nồng') ||
    q.includes('giảm nồng') ||
    q.includes('dịu') ||
    q.includes('ít ngọt') ||
    q.includes('nhẹ nhàng') ||
    q.includes('nhẹ hơn') ||
    q.includes('thanh khiết') ||
    q.includes('softer') ||
    q.includes('lighter');
  const wantClearerFloral =
    q.includes('hương hoa') ||
    q.includes('hoa rõ') ||
    q.includes('nhiều hoa') ||
    q.includes('ngọt dịu') ||
    q.includes('trái cây') ||
    q.includes('floral') ||
    q.includes('fruity');
  const wantLongerWarm =
    q.includes('lưu hương') ||
    q.includes('lưu lâu') ||
    q.includes('ngọt ấm') ||
    q.includes('ấm áp') ||
    q.includes('bền mùi') ||
    q.includes('longer') ||
    q.includes('warm');
  const wantKeepSignature =
    q.includes('giữ đặc trưng') ||
    q.includes('cân bằng') ||
    q.includes('biến tấu');

  // Compute relative shifts strictly within existing active ingredients
  const rawActiveWeights = activeIngredients.map((ing) => {
    const p = ing.percentage;
    const fam = (ing.scentFamily || '').toLowerCase();
    const isSweetGourmand = fam.includes('gourmand') || ing.name.toLowerCase().includes('vanilla');

    if (wantFresher) {
      if (ing.tier === 'top') return p + 10;
      if (ing.tier === 'heart') return Math.max(1, p + 2);
      return Math.max(1, p - (isSweetGourmand ? 8 : 4));
    }
    if (wantLessStrong) {
      if (ing.tier === 'top') return p + 8;
      if (isSweetGourmand) return Math.max(1, p - 8);
      if (ing.tier === 'base') return Math.max(1, p - 3);
      return p + 2;
    }
    if (wantClearerFloral) {
      if (ing.tier === 'heart' || fam.includes('floral') || fam.includes('hoa')) return p + 8;
      return Math.max(1, p - 4);
    }
    if (wantLongerWarm) {
      if (ing.tier === 'base') return p + 8;
      if (ing.tier === 'top') return Math.max(1, p - 8);
      return Math.max(1, p - 2);
    }
    if (wantKeepSignature) {
      if (ing.tier === 'top') return p + 3;
      if (ing.tier === 'heart') return p + 2;
      return Math.max(1, p - 2);
    }
    // Generic subtle refinement if user entered non-specific text without missing ingredients
    if (ing.tier === 'top') return p + 4;
    if (ing.tier === 'base') return Math.max(1, p - 4);
    return p;
  });

  const balancedActive = rebalanceIntegersToSum(rawActiveWeights, 100);
  const newPctBySlot = new Map<string, number>();
  activeIngredients.forEach((ing, idx) => newPctBySlot.set(ing.slotKey, balancedActive[idx]));

  let title = 'Floris (Bản Tinh Chỉnh)';
  let summary = `Đã điều chỉnh tỷ lệ các nguyên liệu hiện có đáp ứng yêu cầu "${userRequest}" với tổng 100%.`;
  let spoken = summary;

  if (wantFresher) {
    title = 'Floris — Thanh Mát Hơn';
    summary = `Tăng tỷ lệ nốt mở đầu thanh mát trong công thức hiện có và giảm nhẹ nốt ngọt nền, giữ nguyên danh sách nguyên liệu.`;
    spoken = 'Đã tăng tỷ lệ nốt hương đầu thanh mát và tiết giảm độ ngọt nền để mùi hương thoáng đãng hơn.';
  } else if (wantLessStrong) {
    title = 'Floris — Dịu Nhẹ Thanh Khiết';
    summary = `Giảm nhẹ các nốt ngọt đậm ở tầng cuối và nâng tỷ lệ nốt thanh thoát để mùi hương dịu nhẹ, không bị nồng.`;
    spoken = 'Đã giảm bớt nốt ngọt đậm và tăng độ thoáng ở tầng đầu để hương thơm nhẹ nhàng hơn.';
  } else if (wantClearerFloral) {
    title = 'Floris — Nổi Bật Hoa & Trái Cây';
    summary = `Tăng cường tỷ lệ nhóm hương hoa cỏ và trái cây trong công thức hiện có, cân đối lại nền về đúng 100%.`;
    spoken = 'Đã nâng tỷ lệ tầng hương giữa để sắc thái hoa quả bung tỏa rõ nét hơn.';
  } else if (wantLongerWarm) {
    title = 'Floris — Lưu Hương Bền & Ấm';
    summary = `Tăng tỷ lệ các nốt tầng cuối giúp giữ mùi lâu và ấm dịu hơn mà không thêm chất mới.`;
    spoken = 'Đã nâng tỷ lệ tầng cuối để tăng độ ấm êm và thời gian lưu hương trên da.';
  } else if (wantKeepSignature) {
    title = 'Floris — Cân Bằng Đặc Trưng';
    summary = `Tinh chỉnh nhẹ tỷ lệ giữa 3 tầng hương để giữ trọn bản sắc Floris trong trẻo.`;
    spoken = 'Đã tinh chỉnh nhẹ tỷ lệ 3 tầng hương để giữ trọn nét đặc trưng dịu nhẹ của Floris.';
  }

  return normalizeAdjustmentOutput(
    {
      message: summary,
      spokenResponse: spoken,
      analysisSummary: summary,
      proposedPerfumeName: title,
      highlightChanges: activeIngredients.map((i) => {
        const next = newPctBySlot.get(i.slotKey) ?? i.percentage;
        const delta = next - i.percentage;
        return `${cleanIngredientDisplayName(i.name)}: ${i.percentage}% → ${next}% (${delta >= 0 ? '+' : ''}${delta}%)`;
      }),
      adjustedIngredients: ingredients.map((ing) => {
        const next = newPctBySlot.get(ing.slotKey) ?? 0;
        const delta = next - (ing.percentage || 0);
        return {
          slotKey: ing.slotKey,
          newPercentage: next,
          reason:
            (ing.percentage || 0) === 0
              ? 'Khe hương không sử dụng (0%)'
              : delta > 0
              ? `Tăng nhẹ ${cleanIngredientDisplayName(ing.name)} (+${delta}%) theo hướng cảm quan yêu cầu`
              : delta < 0
              ? `Điều tiết giảm ${cleanIngredientDisplayName(ing.name)} (${delta}%) để giữ cân bằng 100%`
              : `Giữ ổn định ${cleanIngredientDisplayName(ing.name)}`,
        };
      }),
    },
    ingredients,
    totalVolume,
    concentrationPercent
  );
}

/**
 * Standalone precision formula adjuster matching the exact JSON output contract:
 * { "message": "...", "formula": [{ "name": "Exact Ingredient Name", "amount": 10 }] }
 */
export function adjustStandalonePrecisionFormula(
  userRequest: string,
  currentFormula: PrecisionFormulaEntry[]
): PrecisionOnlyResult {
  const safeFormula = (currentFormula || []).filter((f) => f && typeof f.name === 'string');
  const activeNames = safeFormula.map((f) => f.name).join(', ');
  const cmd = parseExplicitAddRemoveCommand(userRequest);
  const missingCheck = checkMissingIngredients(
    userRequest,
    safeFormula.map((f, idx) => ({ id: `item_${idx}`, name: f.name, percentage: f.amount }))
  );

  // Rule 2 exception: Explicit "remove [ingredient]"
  if (cmd.isExplicitRemove && missingCheck.matchedActiveIngredients.length > 0 && safeFormula.length > 1) {
    const toRemove = new Set(missingCheck.matchedActiveIngredients.map((m) => m.ingredientName));
    const kept = safeFormula.filter((f) => !toRemove.has(f.name));
    const totalOriginal = safeFormula.reduce((a, b) => a + Math.max(0, b.amount), 0) || 100;
    const rebalanced = rebalanceIntegersToSum(
      kept.map((k) => k.amount),
      Math.round(totalOriginal)
    );
    const removedStr = Array.from(toRemove).join(', ');
    return {
      message: `Removed ${removedStr} as explicitly commanded and rebalanced remaining ingredients.`,
      formula: kept.map((k, idx) => ({ name: k.name, amount: rebalanced[idx] })),
    };
  }

  // Rule 2 exception: Explicit "add [ingredient]"
  if (cmd.isExplicitAdd && cmd.explicitTargetPhrase) {
    const missingMention = missingCheck.missingIngredients[0];
    const nameToAdd = missingMention ? missingMention.displayName : cmd.explicitTargetPhrase;
    const alreadyExists = safeFormula.some(
      (f) => f.name.toLowerCase() === nameToAdd.toLowerCase()
    );
    if (!alreadyExists) {
      const totalOriginal = safeFormula.reduce((a, b) => a + Math.max(0, b.amount), 0) || 100;
      const addAmount = Math.max(5, Math.round(totalOriginal * 0.1));
      const remainingTarget = Math.max(safeFormula.length, totalOriginal - addAmount);
      const rebalancedExisting = rebalanceIntegersToSum(
        safeFormula.map((f) => f.amount),
        remainingTarget
      );
      return {
        message: `Added ${nameToAdd} (${addAmount}%) as explicitly commanded and adjusted existing proportions.`,
        formula: [
          ...safeFormula.map((f, idx) => ({ name: f.name, amount: rebalancedExisting[idx] })),
          { name: nameToAdd, amount: totalOriginal - remainingTarget },
        ],
      };
    }
  }

  // Rule 4: Ambiguity — requested ingredient not in current formula -> keep original numbers unchanged
  if (missingCheck.hasMissingIngredient) {
    const missingNames = missingCheck.missingIngredients.map((m) => m.displayName).join(', ');
    return {
      message: `${missingNames} is not in the current formula (${activeNames}). Original amounts were kept unchanged.`,
      formula: safeFormula.map((f) => ({ name: f.name, amount: f.amount })),
    };
  }

  // Map standalone entries to pseudo-slots to reuse core quantity adjuster
  const pseudoSlots = safeFormula.map((f, idx) => {
    const matchedLex = KNOWN_INGREDIENT_LEXICON.find((e) =>
      e.aliases.some((a) => buildWordBoundaryRegex(a).test(f.name.toLowerCase()))
    );
    const tier = matchedLex?.tierHint || (idx === 0 ? 'top' : idx === safeFormula.length - 1 ? 'base' : 'heart');
    return {
      slotKey: `slot_${idx}` as FormulaSlot['key'],
      tier,
      tierLabel: tier,
      id: `item_${idx}`,
      name: f.name,
      scentFamily: tier === 'top' ? 'Fresh' : tier === 'heart' ? 'Floral' : 'Base',
      percentage: f.amount,
    };
  });

  const adjusted = generateLocalAdjustment(userRequest, 'Spring', 10, 10, pseudoSlots, {});
  return {
    message: adjusted.message,
    formula: safeFormula.map((orig, idx) => {
      const item = adjusted.comparisonItems[idx];
      return {
        name: orig.name,
        amount: item ? item.newPercentage : orig.amount,
      };
    }),
  };
}

/**
 * Normalizes LLM response for standalone `{ message, formula }` precision endpoint,
 * enforcing exact ingredient names and unchanged fallback on missing ingredients.
 */
export function normalizeStandalonePrecisionOutput(
  parsed: any,
  currentFormula: PrecisionFormulaEntry[],
  userRequest: string
): PrecisionOnlyResult {
  const safeFormula = (currentFormula || []).filter((f) => f && typeof f.name === 'string');
  const cmd = parseExplicitAddRemoveCommand(userRequest);
  const missingCheck = checkMissingIngredients(
    userRequest,
    safeFormula.map((f, idx) => ({ id: `item_${idx}`, name: f.name, percentage: f.amount }))
  );

  // Pre-guard missing ingredient ambiguity
  if (missingCheck.hasMissingIngredient && !cmd.isExplicitAdd) {
    const missingNames = missingCheck.missingIngredients.map((m) => m.displayName).join(', ');
    return {
      message:
        typeof parsed?.message === 'string' && parsed.message.trim()
          ? parsed.message
          : `${missingNames} is not in the current formula. Original amounts were kept unchanged.`,
      formula: safeFormula.map((f) => ({ name: f.name, amount: f.amount })),
    };
  }

  const rawList: any[] = Array.isArray(parsed?.formula) ? parsed.formula : [];
  const totalOrig = safeFormula.reduce((a, b) => a + Math.max(0, b.amount), 0) || 100;

  if (!cmd.isExplicitAdd && !cmd.isExplicitRemove) {
    // Strictly keep exact same ingredient list and map numbers
    const mappedWeights = safeFormula.map((orig) => {
      const found = rawList.find(
        (r) => typeof r?.name === 'string' && r.name.trim().toLowerCase() === orig.name.trim().toLowerCase()
      );
      return found && typeof found.amount === 'number' && Number.isFinite(found.amount)
        ? Math.max(1, Math.round(found.amount))
        : Math.max(1, Math.round(orig.amount));
    });

    const isAllSame = mappedWeights.every((amt, i) => amt === Math.round(safeFormula[i].amount));
    const finalAmounts = isAllSame
      ? safeFormula.map((f) => f.amount)
      : rebalanceIntegersToSum(mappedWeights, Math.round(totalOrig));

    return {
      message:
        typeof parsed?.message === 'string' && parsed.message.trim()
          ? parsed.message.trim()
          : 'Adjusted ingredient proportions while preserving the exact formula list.',
      formula: safeFormula.map((orig, idx) => ({
        name: orig.name,
        amount: finalAmounts[idx],
      })),
    };
  }

  return adjustStandalonePrecisionFormula(userRequest, safeFormula);
}

/**
 * Client-side failsafe for standalone `{ message, formula }` responses:
 * filters out unauthorized ingredients and rejects any response that alters the original ingredient list
 * (unless an explicit add/remove command was requested).
 */
export function sanitizeStandalonePrecisionResponse(
  aiData: any,
  currentFormula: PrecisionFormulaEntry[],
  userInstruction = ''
): { accepted: boolean; result: PrecisionOnlyResult } {
  const safeOriginal = (currentFormula || []).map((item) => ({
    name: item.name,
    amount: item.amount,
  }));
  const cmd = parseExplicitAddRemoveCommand(userInstruction);
  if (cmd.isExplicitAdd || cmd.isExplicitRemove) {
    return {
      accepted: true,
      result: normalizeStandalonePrecisionOutput(aiData, safeOriginal, userInstruction),
    };
  }

  const allowedNames = new Set(safeOriginal.map((item) => item.name.trim().toLowerCase()));
  const incomingFormula: any[] = Array.isArray(aiData?.formula) ? aiData.formula : [];

  const hasUnauthorized = incomingFormula.some(
    (item) => typeof item?.name !== 'string' || !allowedNames.has(item.name.trim().toLowerCase())
  );
  const sanitizedFormula = incomingFormula
    .filter((item) => typeof item?.name === 'string' && allowedNames.has(item.name.trim().toLowerCase()))
    .map((item) => ({
      name:
        safeOriginal.find((o) => o.name.trim().toLowerCase() === item.name.trim().toLowerCase())?.name ||
        item.name,
      amount: typeof item.amount === 'number' && Number.isFinite(item.amount) ? Math.round(item.amount) : 0,
    }));

  const uniqueSanitizedNames = new Set(sanitizedFormula.map((s) => s.name.trim().toLowerCase()));

  if (
    hasUnauthorized ||
    sanitizedFormula.length !== safeOriginal.length ||
    uniqueSanitizedNames.size !== allowedNames.size
  ) {
    return {
      accepted: false,
      result: {
        message: 'AI đã cố gắng thay đổi danh sách nguyên liệu gốc. Hệ thống giữ nguyên toàn bộ công thức ban đầu.',
        formula: safeOriginal,
      },
    };
  }

  return {
    accepted: true,
    result: {
      message:
        typeof aiData?.message === 'string' && aiData.message.trim()
          ? aiData.message.trim()
          : 'Đã điều chỉnh tỷ lệ các nguyên liệu hiện có.',
      formula: sanitizedFormula,
    },
  };
}

/**
 * Client-side failsafe for Floris 6-slot `AIAdjustmentResult`:
 * filters and verifies that every active original ingredient (>0%) remains active with the exact same name
 * and every inactive 0% slot remains 0%, reverting safely if any unauthorized alteration slipped through.
 */
export function enforceClientFormulaIntegrity(
  candidate: AIAdjustmentResult,
  originalIngredients: any[],
  userRequest = '',
  totalVolume = 10,
  concentrationPercent = 10
): AIAdjustmentResult {
  const cmd = parseExplicitAddRemoveCommand(userRequest);
  if (cmd.isExplicitAdd || cmd.isExplicitRemove) {
    return candidate;
  }

  const activeOrig = (originalIngredients || []).filter((i) => (i.percentage || 0) > 0);
  const allowedActiveNames = new Set(activeOrig.map((i) => (i.name || '').trim().toLowerCase()));
  const allowedActiveSlots = new Set(activeOrig.map((i) => i.slotKey));

  const candidateItems = Array.isArray(candidate?.comparisonItems) ? candidate.comparisonItems : [];
  const candidateFormula = Array.isArray(candidate?.formula) ? candidate.formula : [];

  const sanitizedActiveItems = candidateItems.filter(
    (item) =>
      item.newPercentage > 0 &&
      allowedActiveSlots.has(item.slotKey) &&
      allowedActiveNames.has((item.name || '').trim().toLowerCase())
  );

  const sanitizedFormulaEntries = candidateFormula.filter(
    (entry) => entry.amount > 0 && allowedActiveNames.has((entry.name || '').trim().toLowerCase())
  );

  const zeroSlotTampered = candidateItems.some(
    (item) => !allowedActiveSlots.has(item.slotKey) && item.newPercentage > 0
  );

  const structureIntact =
    !zeroSlotTampered &&
    sanitizedActiveItems.length === activeOrig.length &&
    (sanitizedFormulaEntries.length === 0 || sanitizedFormulaEntries.length === activeOrig.length);

  if (!structureIntact) {
    const rejectMsg =
      'Phát hiện thay đổi danh sách nguyên liệu ngoài công thức gốc. Hệ thống giữ nguyên toàn bộ tỷ lệ ban đầu để bảo toàn công thức.';
    return normalizeAdjustmentOutput(
      {
        isUnchanged: true,
        message: rejectMsg,
        spokenResponse: 'Phát hiện đề xuất làm thay đổi danh sách nguyên liệu gốc nên mình giữ nguyên công thức ban đầu.',
        analysisSummary: rejectMsg,
        proposedPerfumeName: 'Giữ Nguyên Công Thức Gốc',
        highlightChanges: ['Bảo vệ cấu trúc công thức: Giữ nguyên 100% nguyên liệu và tỷ lệ ban đầu'],
        adjustedIngredients: (originalIngredients || []).map((orig) => ({
          slotKey: orig.slotKey,
          newPercentage: orig.percentage,
          reason:
            (orig.percentage || 0) > 0
              ? `Giữ nguyên ${orig.percentage}% (từ chối thay đổi danh sách nguyên liệu)`
              : 'Khe hương không sử dụng (0%)',
        })),
        source: 'client_failsafe',
      },
      originalIngredients,
      totalVolume,
      concentrationPercent
    );
  }

  return candidate;
}

