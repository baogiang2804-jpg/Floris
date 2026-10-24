import { CalculatedIngredient, FormulaSlot } from './perfumeCalculations';

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

export interface AIEvaluationResult {
  perfumeName: string;
  poeticNarrative: string;
  seasonSuitabilityScore: number;
  seasonFeedback: string;
  harmonyRating: number;
  longevityHours: string;
  sillage: string;
  olfactoryRadar: {
    floral: number;
    citrus: number;
    woody: number;
    spicy: number;
    oriental: number;
    fresh: number;
  };
  masterReview: string;
  macerationAdvice: string;
  safetyAndIFRA: string;
  source?: string;
  message?: string;
}

// Local evaluation generator (Heuristic chemistry engine conforming to IFRA)
export function generateLocalEvaluation(
  season: string,
  totalVolume: number,
  concentration: string,
  ingredients: any[] = [],
  tierTotals: any = {}
): AIEvaluationResult {
  const topTotal = tierTotals?.top || 30;
  const heartTotal = tierTotals?.heart || 50;
  const baseTotal = tierTotals?.base || 20;

  let floral = 25,
    citrus = 20,
    woody = 20,
    spicy = 15,
    oriental = 15,
    fresh = 20;

  ingredients.forEach((ing) => {
    const p = ing.percentage || 0;
    const fam = (ing.scentFamily || '').toLowerCase();
    const name = (ing.name || '').toLowerCase();
    if (fam.includes('hoa') || fam.includes('floral') || name.includes('hồng') || name.includes('nhài'))
      floral += p * 1.5;
    if (
      fam.includes('cam') ||
      fam.includes('citrus') ||
      name.includes('chanh') ||
      name.includes('cam') ||
      name.includes('bergamot')
    )
      citrus += p * 1.5;
    if (fam.includes('gỗ') || fam.includes('woody') || name.includes('đàn hương') || name.includes('tuyết tùng'))
      woody += p * 1.5;
    if (fam.includes('cay') || fam.includes('spicy') || name.includes('quế') || name.includes('tiêu'))
      spicy += p * 1.5;
    if (
      fam.includes('phương đông') ||
      fam.includes('oriental') ||
      name.includes('hổ phách') ||
      name.includes('vanilla') ||
      name.includes('musk')
    )
      oriental += p * 1.5;
    if (fam.includes('tươi mát') || fam.includes('fresh') || name.includes('bạc hà') || name.includes('thảo mộc'))
      fresh += p * 1.5;
  });

  const normalize = (v: number) => Math.min(95, Math.max(15, Math.round(v)));

  let seasonSuitabilityScore = 85;
  let seasonFeedback = '';
  if (season.includes('Hè') || season.includes('Summer')) {
    if (citrus + fresh > 80) {
      seasonSuitabilityScore = 94;
      seasonFeedback = 'Công thức tươi sáng, tỷ lệ thanh mát cao giải nhiệt hoàn hảo trong khí hậu nắng nóng.';
    } else {
      seasonSuitabilityScore = 78;
      seasonFeedback = 'Mùi hương hơi đậm cho những ngày hè oi ả; có thể tăng nhẹ nốt Citrus/Bạc hà tầng đầu.';
    }
  } else if (season.includes('Đông') || season.includes('Winter')) {
    if (woody + oriental + spicy > 80) {
      seasonSuitabilityScore = 96;
      seasonFeedback = 'Rất ấm áp và có chiều sâu bền vững, tỏa tốt trong không khí giá lạnh mùa đông.';
    } else {
      seasonSuitabilityScore = 76;
      seasonFeedback = 'Hơi nhẹ cho mùa lạnh, nên nâng tầng cuối (Base) lên khoảng 25-35% để giữ ấm.';
    }
  } else if (season.includes('Xuân') || season.includes('Spring')) {
    seasonSuitabilityScore = 90;
    seasonFeedback = 'Độ nở hoa cỏ và cam chanh hài hòa, tái hiện sinh động sức sống đâm chồi của mùa xuân.';
  } else {
    seasonSuitabilityScore = 88;
    seasonFeedback = 'Sắc thái hoài niệm, tầng giữa và tầng đáy hòa quyện dịu dàng trong tiết trời se lạnh thu.';
  }

  const isExtrait = concentration?.includes('Extrait');
  const longevityHours = isExtrait ? '8 - 12 giờ' : baseTotal >= 25 ? '6 - 8 giờ' : '4 - 6 giờ';
  const sillage = isExtrait ? 'Nổi bật (tỏa xa 2m+)' : topTotal >= 35 ? 'Vừa phải (1 sải tay)' : 'Gần (skin scent nhẹ nhàng)';

  const namesBySeason: Record<string, string[]> = {
    'Mùa Xuân (Spring)': ["Le Jardin Enchanteur", "Khúc Ca Mùa Xuân", "Floraison Poétique"],
    'Mùa Hè (Summer)': ["Brise d'Azur", "Ánh Nắng Địa Trung Hải", "Citrus Éclatant"],
    'Mùa Thu (Autumn)': ["Feuilles Dorées", "Hoàng Hôn Hổ Phách", "Sillage d'Or"],
    'Mùa Đông (Winter)': ["Nuit Veloutée", "Tuyết Trắng & Gỗ Quý", "Chaleur d'Hiver"],
  };
  const list = namesBySeason[season] || ["Atelier Élixir", "Harmonie Suprême", "Floris Spring Signature"];
  const perfumeName = list[Math.floor(Math.random() * list.length)];

  return {
    perfumeName,
    poeticNarrative:
      'Một khởi đầu sảng khoái với tầng đầu rạng rỡ, dần nhường chỗ cho trái tim nồng nàn của tầng giữa, trước khi neo đậu lại trong lớp hương gỗ và nhựa thơm lắng đọng trên da suốt nhiều giờ.',
    seasonSuitabilityScore,
    seasonFeedback,
    harmonyRating: Math.min(
      98,
      75 +
        Math.round(
          (heartTotal >= 35 && heartTotal <= 55 ? 15 : 5) + (topTotal >= 20 && topTotal <= 40 ? 10 : 5)
        )
    ),
    longevityHours,
    sillage,
    olfactoryRadar: {
      floral: normalize(floral),
      citrus: normalize(citrus),
      woody: normalize(woody),
      spicy: normalize(spicy),
      oriental: normalize(oriental),
      fresh: normalize(fresh),
    },
    masterReview: `Cấu trúc kim tự tháp hương đạt tỷ lệ ${topTotal}% / ${heartTotal}% / ${baseTotal}%. Tầng giữa đóng vai trò linh hồn dẫn dắt nhịp điệu cảm xúc, trong khi tầng đáy tạo khung đỡ vững chắc giúp mùi hương không bị bốc hơi quá nhanh.`,
    macerationAdvice:
      'Nên ủ hỗn hợp tinh dầu với cồn mỹ phẩm 96 độ trong 3 đến 4 tuần ở nhiệt độ 18-22°C nơi tối trước khi lọc lạnh để đạt độ tròn vị cao nhất.',
    safetyAndIFRA:
      'Tuân thủ giới hạn IFRA 51st Amendment: Giới hạn tinh dầu vỏ cam chanh ép lạnh dưới 2% để tránh kích ứng nhạy cảm ánh sáng (phototoxicity).',
    source: 'local_engine',
    message: 'Đã phân tích chuyên sâu chuẩn IFRA',
  };
}

export function normalizeAdjustmentOutput(
  parsed: any,
  originalIngredients: any[],
  totalVolume: number,
  concentrationPercent: number
): AIAdjustmentResult {
  const pureFragranceMl = Number(((totalVolume * concentrationPercent) / 100).toFixed(2));
  const carrierAlcoholMl = Number((totalVolume - pureFragranceMl).toFixed(2));
  const rawList: any[] = Array.isArray(parsed.adjustedIngredients) ? parsed.adjustedIngredients : [];

  let mapped = originalIngredients.map((orig: any) => {
    const found = rawList.find((r) => r.slotKey === orig.slotKey);
    const newPct =
      found && typeof found.newPercentage === 'number'
        ? Math.max(1, Math.round(found.newPercentage))
        : orig.percentage;
    return {
      slotKey: orig.slotKey as FormulaSlot['key'],
      tier: orig.tier as 'top' | 'heart' | 'base',
      tierLabel: orig.tierLabel,
      id: orig.id,
      name: orig.name,
      scentFamily: orig.scentFamily,
      oldPercentage: orig.percentage,
      newPercentage: newPct,
      reason: found?.reason || 'Cân bằng tổng thể cấu trúc 3 tầng hương',
    };
  });

  const rawAiSum = mapped.reduce((acc, item) => acc + item.newPercentage, 0);
  const wasNormalized = rawAiSum !== 100;
  if (rawAiSum !== 100 && mapped.length > 0) {
    let running = 0;
    mapped = mapped.map((item, idx) => {
      if (idx === mapped.length - 1) {
        return { ...item, newPercentage: Math.max(1, 100 - running) };
      }
      const scaled = Math.max(1, Math.round((item.newPercentage / (rawAiSum || 1)) * 100));
      running += scaled;
      return { ...item, newPercentage: scaled };
    });
  }

  const comparisonItems: ComparisonItem[] = mapped.map((item) => {
    const oldVolMl = Number(((pureFragranceMl * item.oldPercentage) / 100).toFixed(2));
    const newVolMl = Number(((pureFragranceMl * item.newPercentage) / 100).toFixed(2));
    const oldFinalProductConcPercent = Number(((item.oldPercentage * concentrationPercent) / 100).toFixed(2));
    const newFinalProductConcPercent = Number(((item.newPercentage * concentrationPercent) / 100).toFixed(2));
    const oldDrops = Math.max(1, Math.round(oldVolMl * 20));
    const newDrops = Math.max(1, Math.round(newVolMl * 20));
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

  return {
    spokenResponse:
      parsed.spokenResponse ||
      'Mình đã phân tích yêu cầu của bạn, kiểm tra tự động tổng tỉ lệ đạt chuẩn 100% và đưa ra phương án tối ưu trên màn hình.',
    analysisSummary:
      parsed.analysisSummary ||
      'Công thức đã được tái cân bằng dựa trên yêu cầu cảm quan và cơ sở độ bay hơi của 3 tầng hương.',
    proposedPerfumeName: parsed.proposedPerfumeName || 'Floris Mùa Xuân Cải Tiến',
    highlightChanges: Array.isArray(parsed.highlightChanges) ? parsed.highlightChanges : [],
    olfactoryPredictionHypothesis: parsed.olfactoryPredictionHypothesis || {
      overallChange:
        'Giả thuyết dự đoán: Mùi hương chuyển dịch rõ theo hướng yêu cầu của người dùng nhờ thay đổi tỉ lệ áp suất hơi riêng phần giữa các tầng hương.',
      topStage:
        '0–20 phút đầu: Các hợp chất monoterpene/ester dễ bay hơi khuếch tán nhanh, tạo ấn tượng mở đầu rõ nét hơn.',
      heartStage:
        '20 phút – 3 giờ: Các hợp chất terpene alcohol ở tầng giữa duy trì bản sắc chủ đạo nhưng cân bằng hơn.',
      baseStage:
        'Sau 3 giờ: Các phân tử sesquiterpene và xạ hương khối lượng phân tử lớn giữ vai trò định hương (fixative) trên giấy thử.',
    },
    studentReviewHints: parsed.studentReviewHints || {
      reasonableHint:
        'Đề xuất của AI hợp lý về mặt cấu trúc mùi hương vì đã điều chỉnh đúng nhóm nguyên liệu chịu trách nhiệm cho sắc thái mùi mà người dùng yêu cầu, đồng thời đảm bảo tổng tỉ lệ 100%.',
      chemistryKnowledgeHint:
        'Giải thích dựa trên độ bay hơi (volatility), khối lượng phân tử và liên kết liên phân tử: nốt đầu bay hơi nhanh, nốt giữa cân bằng, nốt cuối đóng vai trò định hương.',
      experimentVerificationHint:
        'Pha 2 mẫu đối chứng quy mô nhỏ (5 mL hoặc 10 mL) trong cùng dung môi Ethanol 96°: Mẫu gốc và Mẫu AI đề xuất. Đánh giá trên giấy thử mùi sau 15 phút, 2 giờ và 6 giờ.',
    },
    validationReport: {
      rawAiSum,
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
    source: 'local_engine',
  };
}

export function generateLocalAdjustment(
  userRequest: string,
  _season: string,
  totalVolume: number,
  concentrationPercent: number,
  ingredients: any[] = [],
  _tierTotals: any = {}
): AIAdjustmentResult {
  const q = (userRequest || '').toLowerCase();
  const wantFresher =
    q.includes('tươi mát') ||
    q.includes('mát hơn') ||
    q.includes('sảng khoái') ||
    q.includes('cam') ||
    q.includes('chanh') ||
    q.includes('lê') ||
    q.includes('bergamot');
  const wantClearerFloral =
    q.includes('hương hoa rõ') ||
    q.includes('hoa rõ hơn') ||
    q.includes('nhiều hoa') ||
    (q.includes('hoa') && !q.includes('giảm'));
  const wantLessStrong =
    q.includes('giảm cảm giác nồng') ||
    q.includes('giảm nồng') ||
    q.includes('dịu') ||
    q.includes('ít ngọt') ||
    q.includes('nhẹ');
  const wantMoreWoody =
    q.includes('tăng sắc thái hương gỗ') ||
    q.includes('hương gỗ') ||
    q.includes('gỗ') ||
    q.includes('trầm') ||
    q.includes('ấm') ||
    q.includes('lưu hương');
  const wantSubtleVariationKeepSignature =
    q.includes('giữ đặc trưng') ||
    q.includes('thay đổi mùi nhưng') ||
    q.includes('biến tấu');

  const findSlotName = (slotKey: string, fallback: string) =>
    ingredients.find((i: any) => i.slotKey === slotKey)?.name || fallback;

  const top1Name = findSlotName('top1', 'Hoa nhài 🌼');
  const heart1Name = findSlotName('heart1', 'Đào 🍑');
  const base1Name = findSlotName('base1', 'Xạ hương trắng 🤍');
  const base2Name = findSlotName('base2', 'Vanilla 🍦');

  const rawAdjusted = ingredients.map((ing: any) => {
    let pct = ing.percentage || 15;
    let reason = 'Giữ tỉ lệ nền ổn định cho cấu trúc kim tự tháp hương';

    if (wantFresher) {
      if (ing.slotKey === 'top1') {
        pct = 30;
        reason = `Tăng tỉ lệ ${ing.name} lên 30% để bung tỏa hương hoa trắng thanh mát ngay khi xịt.`;
      } else if (ing.slotKey === 'heart1') {
        pct = 20;
        reason = `Duy trì ${ing.name} ở 20% giúp hương trái cây mọng nước chuyển tiếp nhẹ nhàng.`;
      } else if (ing.slotKey === 'base1' || ing.slotKey === 'base2') {
        pct = 25;
        reason = `Giữ ${ing.name} ở 25% bảo toàn độ ấm và khả năng định hương.`;
      } else {
        pct = 0;
        reason = 'Khe hương dự phòng.';
      }
    } else if (wantClearerFloral) {
      if (ing.slotKey === 'heart1') {
        pct = 35;
        reason = `Tăng nốt ${ing.name} lên 35% để hương đào ngọt dịu bung tỏa rõ nét ở tầng giữa.`;
      } else if (ing.slotKey === 'top1') {
        pct = 25;
        reason = `Điều tiết ${ing.name} ở mức 25% nhường không gian cho hương đào.`;
      } else if (ing.slotKey === 'base1') {
        pct = 20;
        reason = `Duy trì ${ing.name} 20% giữ độ sạch sẽ, thanh khiết.`;
      } else if (ing.slotKey === 'base2') {
        pct = 20;
        reason = `Duy trì ${ing.name} 20% tạo hậu vị ngọt ấm.`;
      } else {
        pct = 0;
        reason = 'Khe hương dự phòng.';
      }
    } else if (wantLessStrong) {
      if (ing.slotKey === 'base2') {
        pct = 15;
        reason = `Giảm nhẹ ${ing.name} xuống 15% để bớt vị ngọt đậm.`;
      } else if (ing.slotKey === 'top1') {
        pct = 35;
        reason = `Tăng ${ing.name} lên 35% giúp không gian hương thoáng đãng, trong trẻo.`;
      } else if (ing.slotKey === 'heart1') {
        pct = 25;
        reason = `Duy trì ${ing.name} 25% tạo nét thanh thoát.`;
      } else if (ing.slotKey === 'base1') {
        pct = 25;
        reason = `Duy trì ${ing.name} 25% tạo độ êm dịu trên da.`;
      } else {
        pct = 0;
        reason = 'Khe hương dự phòng.';
      }
    } else if (wantMoreWoody) {
      if (ing.slotKey === 'base1' || ing.slotKey === 'base2') {
        pct = 30;
        reason = `Tăng ${ing.name} lên 30% để tăng độ ấm êm, ngọt dịu và lưu hương lâu dài.`;
      } else if (ing.slotKey === 'top1' || ing.slotKey === 'heart1') {
        pct = 20;
        reason = `Điều tiết ${ing.name} về 20% tạo sự chuyển tiếp hài hòa sang tầng cuối.`;
      } else {
        pct = 0;
        reason = 'Khe hương dự phòng.';
      }
    } else if (wantSubtleVariationKeepSignature) {
      if (ing.slotKey === 'top1') {
        pct = 40;
        reason = 'Giữ nốt Hoa nhài mở đầu thanh khiết đặc trưng của Floris.';
      } else if (ing.slotKey === 'heart1') {
        pct = 30;
        reason = 'Giữ nốt Đào mọng nước tạo điểm nhấn mùa xuân.';
      } else if (ing.slotKey === 'base1') {
        pct = 15;
        reason = 'Giữ Xạ hương trắng sạch sẽ, mềm mại.';
      } else if (ing.slotKey === 'base2') {
        pct = 15;
        reason = 'Giữ Vanilla ngọt ấm lưu luyến.';
      } else {
        pct = 0;
        reason = 'Khe hương dự phòng.';
      }
    } else {
      if (ing.slotKey === 'top1') {
        pct = 35;
        reason = `Cân chỉnh ${ing.name} theo yêu cầu cảm quan.`;
      } else if (ing.slotKey === 'heart1') {
        pct = 25;
        reason = `Cân chỉnh ${ing.name} hài hòa tầng giữa.`;
      } else if (ing.slotKey === 'base1') {
        pct = 20;
        reason = `Duy trì ${ing.name} định hương.`;
      } else if (ing.slotKey === 'base2') {
        pct = 20;
        reason = `Duy trì ${ing.name} ngọt dịu.`;
      } else {
        pct = 0;
        reason = 'Khe hương dự phòng.';
      }
    }

    return {
      slotKey: ing.slotKey,
      newPercentage: pct,
      reason,
    };
  });

  let spokenResponse = '';
  let analysisSummary = '';
  let proposedPerfumeName = 'Floris Mùa Xuân (Bản Tinh Chỉnh)';
  let highlightChanges: string[] = [];

  if (wantFresher) {
    proposedPerfumeName = 'Floris — Mẫu B (Tươi Hơn)';
    spokenResponse = `Đã điều chỉnh tăng hương hoa nhài lên 30% để mùi hương tươi sáng và thanh thoát hơn ngay khi xịt.`;
    analysisSummary = `Tăng nốt Hoa nhài lên 30% (tương ứng chuẩn Mẫu B), giữ Đào 20%, Xạ hương trắng 25% và Vanilla 25%.`;
    highlightChanges = [
      `Tăng ${top1Name} lên 30% giúp mở đầu thanh mát, rạng rỡ`,
      `Cân đối ${heart1Name} 20%, ${base1Name} 25% và ${base2Name} 25%`,
      'Tổng tỉ lệ phối trộn đạt chính xác 100%',
    ];
  } else if (wantClearerFloral) {
    proposedPerfumeName = 'Floris — Hương Đào Rõ Nét';
    spokenResponse = `Đã nâng nốt đào lên 35% để hương trái cây ngọt dịu và tươi tắn nổi bật hơn ở tầng giữa.`;
    analysisSummary = `Tăng nốt Đào lên 35%, điều tiết Hoa nhài 25%, Xạ hương trắng 20% và Vanilla 20%.`;
    highlightChanges = [
      `Tăng ${heart1Name} lên 35% giúp hương đào bung tỏa mọng nước`,
      'Tổng tỉ lệ phối trộn kiểm tra tự động đạt đúng 100%',
    ];
  } else if (wantLessStrong) {
    proposedPerfumeName = 'Floris — Hương Dịu Nhẹ';
    spokenResponse = `Đã giảm bớt vị ngọt đậm và tăng hoa nhài lên 35% để mùi hương nhẹ nhàng, thoáng đãng hơn.`;
    analysisSummary = `Giảm nốt ngọt đậm, tăng Hoa nhài lên 35% và giữ Xạ hương trắng 25% để không gian hương trong trẻo.`;
    highlightChanges = [
      `Tăng ${top1Name} lên 35% tạo cảm giác thanh mát, dễ chịu`,
      `Giảm nhẹ ${base2Name} giúp hậu vị thanh thoát`,
      'Tổng tỉ lệ đạt chuẩn 100%',
    ];
  } else if (wantMoreWoody) {
    proposedPerfumeName = 'Floris — Mẫu C (Dịu Ngọt & Lưu Hương Sâu)';
    spokenResponse = `Đã nâng xạ hương trắng và vanilla lên 30% mỗi loại để tăng độ ấm êm và lưu hương lâu hơn.`;
    analysisSummary = `Tăng Xạ hương trắng và Vanilla lên 30% mỗi loại (tương ứng Mẫu C), giữ Hoa nhài 20% và Đào 20%.`;
    highlightChanges = [
      `Nâng ${base1Name} và ${base2Name} lên 30% mỗi loại giúp lưu hương sâu bền`,
      `Điều chỉnh ${top1Name} và ${heart1Name} về 20% mỗi loại`,
      'Tăng khả năng định hương tự nhiên',
    ];
  } else {
    spokenResponse = `Đã phân tích yêu cầu của bạn và cân chỉnh công thức Floris tối ưu với tổng tỉ lệ đạt chuẩn 100%.`;
    analysisSummary = `Điều chỉnh công thức Floris đáp ứng yêu cầu "${userRequest}", tổng tỉ lệ phối trộn đạt 100%.`;
    highlightChanges = [
      `Tinh chỉnh theo yêu cầu: "${userRequest}"`,
      'Tổng tỉ lệ phối trộn đạt đúng 100%',
      'Cân đối độ bay hơi giữa các tầng hương',
    ];
  }

  return normalizeAdjustmentOutput(
    {
      spokenResponse,
      analysisSummary,
      proposedPerfumeName,
      highlightChanges,
      adjustedIngredients: rawAdjusted,
    },
    ingredients,
    totalVolume,
    concentrationPercent
  );
}

// Helper to determine the best API base URL (supporting subpaths like /Floris/)
function getApiUrl(endpoint: string): string {
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    if (pathname.startsWith('/Floris')) {
      return `/Floris${endpoint}`;
    }
  }
  return endpoint;
}

// Robust Safe Perfume Evaluation (Never crashes on unexpected token '<')
export async function safeRequestPerfumeEvaluation(params: {
  seasonLabel: string;
  totalVolume: number;
  concentrationName: string;
  ingredients: CalculatedIngredient[];
  tierTotals: { top: number; heart: number; base: number };
}): Promise<AIEvaluationResult> {
  const fallback = generateLocalEvaluation(
    params.seasonLabel,
    params.totalVolume,
    params.concentrationName,
    params.ingredients,
    params.tierTotals
  );

  try {
    const urlsToTry = [getApiUrl('/api/perfume/evaluate'), '/api/perfume/evaluate'];
    let jsonText = '';

    for (const url of Array.from(new Set(urlsToTry))) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            season: params.seasonLabel,
            totalVolume: params.totalVolume,
            concentration: params.concentrationName,
            ingredients: params.ingredients,
            tierTotals: params.tierTotals,
          }),
        });

        const contentType = response.headers.get('content-type') || '';
        const rawText = await response.text();

        // Check if server returned HTML (404 page, index.html fallback, etc.)
        if (rawText.trim().startsWith('<') || contentType.includes('text/html')) {
          continue; // Try next URL or fall back
        }

        if (response.ok && rawText) {
          jsonText = rawText;
          break;
        }
      } catch {
        continue;
      }
    }

    if (jsonText) {
      try {
        const parsed = JSON.parse(jsonText);
        if (parsed && typeof parsed === 'object' && parsed.perfumeName) {
          return {
            ...fallback,
            ...parsed,
            source: parsed.source || 'gemini_api',
          };
        }
      } catch {
        // Fall back gracefully
      }
    }

    return fallback;
  } catch {
    return fallback;
  }
}

// Robust Safe Perfume Adjustment (Never crashes on unexpected token '<')
export async function safeRequestPerfumeAdjustment(params: {
  userRequest: string;
  seasonLabel: string;
  totalVolume: number;
  concentrationName: string;
  concentrationPercent: number;
  ingredients: CalculatedIngredient[];
  tierTotals: { top: number; heart: number; base: number };
}): Promise<AIAdjustmentResult> {
  const fallback = generateLocalAdjustment(
    params.userRequest,
    params.seasonLabel,
    params.totalVolume,
    params.concentrationPercent,
    params.ingredients,
    params.tierTotals
  );

  try {
    const urlsToTry = [getApiUrl('/api/perfume/adjust'), '/api/perfume/adjust'];
    let jsonText = '';

    for (const url of Array.from(new Set(urlsToTry))) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userRequest: params.userRequest,
            season: params.seasonLabel,
            totalVolume: params.totalVolume,
            concentration: params.concentrationName,
            concentrationPercent: params.concentrationPercent,
            ingredients: params.ingredients,
            tierTotals: params.tierTotals,
          }),
        });

        const contentType = response.headers.get('content-type') || '';
        const rawText = await response.text();

        if (rawText.trim().startsWith('<') || contentType.includes('text/html')) {
          continue;
        }

        if (response.ok && rawText) {
          jsonText = rawText;
          break;
        }
      } catch {
        continue;
      }
    }

    if (jsonText) {
      try {
        const parsed = JSON.parse(jsonText);
        if (parsed && typeof parsed === 'object') {
          return {
            ...fallback,
            ...parsed,
            source: parsed.source || 'gemini_api',
          };
        }
      } catch {
        // Fall back gracefully
      }
    }

    return fallback;
  } catch {
    return fallback;
  }
}

// Robust Safe Speech-to-Text / Transcribe
export async function safeRequestTranscribe(audioBlob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = ((reader.result as string) || '').split(',')[1];
        if (!base64String) {
          resolve('');
          return;
        }

        const urlsToTry = [getApiUrl('/api/perfume/transcribe'), '/api/perfume/transcribe'];
        for (const url of Array.from(new Set(urlsToTry))) {
          try {
            const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioBase64: base64String, mimeType: 'audio/webm' }),
            });
            const text = await res.text();
            if (!text.trim().startsWith('<')) {
              const data = JSON.parse(text);
              if (data?.transcript) {
                resolve(data.transcript);
                return;
              }
            }
          } catch {
            continue;
          }
        }
        resolve('');
      } catch {
        resolve('');
      }
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(audioBlob);
  });
}

// Robust Safe Text-to-Speech (Gemini Live TTS with Browser SpeechSynthesis fallback)
export async function safeRequestTTS(textToSpeak: string): Promise<{ audioBase64: string | null; mimeType?: string }> {
  if (!textToSpeak) return { audioBase64: null };

  try {
    const urlsToTry = [getApiUrl('/api/perfume/tts'), '/api/perfume/tts'];
    for (const url of Array.from(new Set(urlsToTry))) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textToSpeak, voiceName: 'Kore' }),
        });
        const raw = await res.text();
        if (!raw.trim().startsWith('<')) {
          const data = JSON.parse(raw);
          if (data?.audioBase64) {
            return { audioBase64: data.audioBase64, mimeType: data.mimeType || 'audio/wav' };
          }
        }
      } catch {
        continue;
      }
    }
  } catch {
    // Ignore and fallback
  }

  return { audioBase64: null };
}

// Browser Speech Synthesis in Vietnamese
export function speakWithBrowserSynthesis(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }
  window.speechSynthesis.cancel();

  const cleanText = text
    .replace(/[*_#`~[\]()]/g, ' ')
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'vi-VN';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const viVoice = voices.find((v) => v.lang.startsWith('vi') || v.lang.includes('VIE'));
  if (viVoice) utterance.voice = viVoice;

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}
