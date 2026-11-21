export type ScentFacetName =
  | 'Tươi Mát'
  | 'Cam Chanh'
  | 'Nồng Nàn'
  | 'Ngọt Ngào'
  | 'Gỗ Trầm'
  | 'Hoa Cỏ'
  | 'Quyến Rũ';

export type ScentFacetKey =
  | 'fresh'
  | 'citrus'
  | 'spicy'
  | 'sweet'
  | 'woody'
  | 'floral'
  | 'musk';

export interface ScentFacetMeta {
  facet: ScentFacetName;
  key: ScentFacetKey;
  emoji: string;
  english: string;
  description: string;
  color: string;
  weightMultiplier: number;
}

export interface ScentDimensionContributor {
  name: string;
  pct: number;
}

export interface ScentDimension {
  facet: ScentFacetName;
  key: ScentFacetKey;
  emoji: string;
  english: string;
  score: number;
  fullMark: number;
  contributors: ScentDimensionContributor[];
  description: string;
  color: string;
}

export interface ScentTargetDelta {
  facet: ScentFacetName;
  baseline: number;
  target: number;
  delta: number;
}

export interface IngredientForScentProfile {
  slotKey?: string;
  id?: string;
  name: string;
  scentFamily?: string;
  tier?: 'top' | 'heart' | 'base';
  percentage: number;
}

export const SCENT_FACET_META: ScentFacetMeta[] = [
  {
    facet: 'Tươi Mát',
    key: 'fresh',
    emoji: '🌿',
    english: 'Fresh & Herbs',
    description: 'Thanh sạch, sảng khoái từ thảo mộc xanh và lá non',
    color: '#22C55E',
    weightMultiplier: 1.8,
  },
  {
    facet: 'Cam Chanh',
    key: 'citrus',
    emoji: '🍋',
    english: 'Citrus Zest',
    description: 'Tươi sáng, mọng nước từ cam bergamot và vỏ chanh',
    color: '#EAB308',
    weightMultiplier: 1.8,
  },
  {
    facet: 'Nồng Nàn',
    key: 'spicy',
    emoji: '✨',
    english: 'Warm Spicy',
    description: 'Cay ấm nhẹ từ quế và tiêu hồng',
    color: '#F43F5E',
    weightMultiplier: 2.0,
  },
  {
    facet: 'Ngọt Ngào',
    key: 'sweet',
    emoji: '🍦',
    english: 'Sweet Gourmand',
    description: 'Ngọt dịu, êm ái từ vani và hổ phách',
    color: '#F59E0B',
    weightMultiplier: 1.7,
  },
  {
    facet: 'Gỗ Trầm',
    key: 'woody',
    emoji: '🪵',
    english: 'Woody & Earthy',
    description: 'Mộc mạc, tĩnh tại từ đàn hương và tuyết tùng',
    color: '#B45309',
    weightMultiplier: 1.8,
  },
  {
    facet: 'Hoa Cỏ',
    key: 'floral',
    emoji: '🌸',
    english: 'Floral Bouquet',
    description: 'Thanh tao, mềm mại từ hoa nhài, hoa anh đào và hoa hồng',
    color: '#EC4899',
    weightMultiplier: 1.8,
  },
  {
    facet: 'Quyến Rũ',
    key: 'musk',
    emoji: '🤍',
    english: 'Musk & Amber',
    description: 'Sạch sẽ, trong trẻo từ xạ hương trắng',
    color: '#A855F7',
    weightMultiplier: 1.8,
  },
];

export function getIngredientMatchingFacets(ing: {
  name: string;
  scentFamily?: string;
}): ScentFacetName[] {
  const fam = (ing.scentFamily || '').toLowerCase();
  const name = (ing.name || '').toLowerCase();
  const matches: ScentFacetName[] = [];

  if (
    fam.includes('tươi') ||
    fam.includes('fresh') ||
    fam.includes('thảo mộc') ||
    name.includes('bạc hà') ||
    name.includes('neroli') ||
    name.includes('phong lữ') ||
    name.includes('geranium') ||
    name.includes('lê')
  ) {
    matches.push('Tươi Mát');
  }

  if (
    fam.includes('cam') ||
    fam.includes('citrus') ||
    name.includes('bergamot') ||
    name.includes('chanh') ||
    name.includes('cam') ||
    name.includes('quýt') ||
    name.includes('mandarin')
  ) {
    matches.push('Cam Chanh');
  }

  if (
    fam.includes('cay') ||
    fam.includes('gia vị') ||
    fam.includes('spicy') ||
    name.includes('quế') ||
    name.includes('tiêu') ||
    name.includes('đậu khấu') ||
    name.includes('cardamom')
  ) {
    matches.push('Nồng Nàn');
  }

  if (
    fam.includes('ngọt') ||
    fam.includes('gourmand') ||
    fam.includes('trái cây') ||
    name.includes('đào') ||
    name.includes('vani') ||
    name.includes('vanilla') ||
    name.includes('hổ phách') ||
    name.includes('amber') ||
    name.includes('ylang')
  ) {
    matches.push('Ngọt Ngào');
  }

  if (
    fam.includes('gỗ') ||
    fam.includes('woody') ||
    fam.includes('đất') ||
    name.includes('đàn hương') ||
    name.includes('tuyết tùng') ||
    name.includes('hoắc hương') ||
    name.includes('patchouli') ||
    name.includes('vetiver')
  ) {
    matches.push('Gỗ Trầm');
  }

  if (
    fam.includes('hoa') ||
    fam.includes('floral') ||
    name.includes('hồng') ||
    name.includes('nhài') ||
    name.includes('jasmine') ||
    name.includes('anh đào') ||
    name.includes('oải hương') ||
    name.includes('diên vĩ')
  ) {
    matches.push('Hoa Cỏ');
  }

  if (
    fam.includes('phương đông') ||
    fam.includes('oriental') ||
    fam.includes('xạ hương') ||
    fam.includes('musk') ||
    fam.includes('phấn') ||
    name.includes('xạ hương') ||
    name.includes('musk')
  ) {
    matches.push('Quyến Rũ');
  }

  return matches;
}

export function computeScentDimensions(
  ingredients: IngredientForScentProfile[]
): ScentDimension[] {
  const facetsState = new Map<
    ScentFacetName,
    { base: number; contributors: ScentDimensionContributor[] }
  >();

  for (const meta of SCENT_FACET_META) {
    facetsState.set(meta.facet, { base: 15, contributors: [] });
  }

  for (const ing of ingredients || []) {
    const p = ing.percentage || 0;
    if (p <= 0) continue;

    const matchedFacets = getIngredientMatchingFacets(ing);
    for (const facet of matchedFacets) {
      const meta = SCENT_FACET_META.find((m) => m.facet === facet);
      const state = facetsState.get(facet);
      if (meta && state) {
        state.base += p * meta.weightMultiplier;
        state.contributors.push({ name: ing.name, pct: p });
      }
    }
  }

  return SCENT_FACET_META.map((meta) => {
    const state = facetsState.get(meta.facet)!;
    const score = Math.min(100, Math.max(15, Math.round(state.base)));
    return {
      facet: meta.facet,
      key: meta.key,
      emoji: meta.emoji,
      english: meta.english,
      score,
      fullMark: 100,
      contributors: state.contributors,
      description: meta.description,
      color: meta.color,
    };
  });
}

export function buildSensoryAdjustmentPrompt(
  deltas: ScentTargetDelta[],
  perfumeName?: string
): string {
  const changed = (deltas || []).filter((d) => d.delta !== 0);
  if (changed.length === 0) return '';

  const parts = changed.map((d) => {
    const sign = d.delta > 0 ? `+${d.delta}` : `${d.delta}`;
    return `${d.facet} ${d.baseline}→${d.target} (${sign})`;
  });

  const baseLabel = perfumeName ? ` "${perfumeName}"` : '';
  return `Điều chỉnh tỷ lệ các nguyên liệu đang có trong công thức gốc${baseLabel} theo mức độ cảm giác mục tiêu trên biểu đồ mùi hương (chỉ thay đổi tỷ lệ nguyên liệu hiện có, không thêm chất mới): [Cảm giác: ${parts.join('; ')}]`;
}

export function parseSensoryAdjustmentDeltas(
  userRequest: string
): ScentTargetDelta[] {
  const match = (userRequest || '').match(/\[Cảm giác:\s*([^\]]+)\]/i);
  if (!match) return [];

  const body = match[1];
  const entries = body.split(';').map((s) => s.trim()).filter(Boolean);
  const parsed: ScentTargetDelta[] = [];

  for (const entry of entries) {
    const m = entry.match(/^(.+?)\s+(\d+)\s*(?:→|->)\s*(\d+)\s*\(([+-]?\d+)\)$/);
    if (!m) continue;
    const rawFacet = m[1].trim();
    const meta = SCENT_FACET_META.find(
      (f) => f.facet.toLowerCase() === rawFacet.toLowerCase()
    );
    if (!meta) continue;
    const baseline = Number(m[2]);
    const target = Number(m[3]);
    const delta = Number(m[4]);
    if (
      Number.isFinite(baseline) &&
      Number.isFinite(target) &&
      Number.isFinite(delta) &&
      delta !== 0
    ) {
      parsed.push({
        facet: meta.facet,
        baseline,
        target,
        delta,
      });
    }
  }

  return parsed;
}

export function stripSensoryDirectiveTag(userRequest: string): string {
  return (userRequest || '').replace(/\[Cảm giác:[^\]]*\]/gi, ' ').trim();
}
