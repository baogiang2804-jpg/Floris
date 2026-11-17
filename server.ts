import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import {
  checkMissingIngredients,
  parseExplicitAddRemoveCommand,
  normalizeAdjustmentOutput,
  generateLocalAdjustment,
  adjustStandalonePrecisionFormula,
  normalizeStandalonePrecisionOutput,
  PrecisionFormulaEntry,
} from './src/utils/precisionFormulaAdjuster.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '15mb' }));

// Track model quota cooldowns so a 429 on one model automatically routes to the next available model
const TEXT_MODEL_CANDIDATES = [
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-2.5-flash',
];
const modelCooldownUntil: Record<string, number> = {};
const aiResponseCache = new Map<string, any>();

function isQuotaOrRateLimitError(err: any): boolean {
  const msg = String(err?.message || err || '');
  return (
    err?.status === 429 ||
    err?.code === 429 ||
    msg.includes('429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('quota')
  );
}

async function generateJsonWithModelFallback(
  ai: GoogleGenAI,
  prompt: string,
  responseSchema: any
): Promise<{ text: string; modelUsed: string }> {
  const now = Date.now();
  let lastError: any = null;

  for (const modelName of TEXT_MODEL_CANDIDATES) {
    if (modelCooldownUntil[modelName] && modelCooldownUntil[modelName] > now) {
      continue;
    }
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout waiting for model ${modelName}`)), 8000)
      );

      const generatePromise = ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);
      return {
        text: response.text || '{}',
        modelUsed: modelName,
      };
    } catch (err: any) {
      lastError = err;
      if (isQuotaOrRateLimitError(err)) {
        // Put this specific model on cooldown for 15 minutes and immediately try the next candidate model
        modelCooldownUntil[modelName] = Date.now() + 15 * 60 * 1000;
        continue;
      }
      // For other transient errors or timeouts, try the next candidate model as well
      continue;
    }
  }

  throw lastError || new Error('All candidate Gemini models are temporarily unavailable.');
}

// Perfume evaluation endpoint
app.post(['/api/perfume/evaluate', '/Floris/api/perfume/evaluate'], async (req: Request, res: Response) => {
  try {
    const { season, totalVolume, concentration, ingredients, tierTotals } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Graceful fallback when API key is not yet configured in Secrets
      const fallbackResult = generateLocalEvaluation(season, totalVolume, concentration, ingredients, tierTotals);
      return res.json({
        ...fallbackResult,
        source: 'local_engine',
        message: 'Đánh giá bằng thuật toán chuyên gia nội bộ (Chưa cấu hình GEMINI_API_KEY trong Settings > Secrets)'
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `Bạn là một Chuyên gia Thẩm hương (Master Perfumer / Nez) và Nhà Hóa học Mỹ phẩm Quốc tế theo tiêu chuẩn IFRA (Hiệp hội Nước hoa Quốc tế).
Hãy thẩm định và phân tích chuyên sâu công thức nước hoa 3 tầng - 6 nguyên liệu sau đây:

THÔNG TIN CÔNG THỨC:
- Mùa phù hợp mong muốn: ${season} (Xuân / Hạ / Thu / Đông)
- Tổng thể tích: ${totalVolume} mL
- Nồng độ mong muốn: ${concentration || 'Eau de Parfum (15-20%)'}
- Phân bổ 3 tầng hương:
  * Tầng Đầu (Top Notes): ${tierTotals?.top || 0}%
  * Tầng Giữa (Heart/Middle Notes): ${tierTotals?.heart || 0}%
  * Tầng Cuối (Base Notes): ${tierTotals?.base || 0}%

- Chi tiết 6 nguyên liệu:
${(ingredients || []).map((ing: any, idx: number) => `  ${idx + 1}. [${ing.tier.toUpperCase()}] ${ing.name} (${ing.scentFamily}): ${ing.percentage}% = ${ing.volumeMl} mL (${ing.drops} giọt)`).join('\n')}

HÃY ĐÁNH GIÁ VÀ TRẢ VỀ DẠNG JSON với các trường:
1. perfumeName: Tên tác phẩm nước hoa nghệ thuật (kèm tiếng Pháp hoặc phong cách thi vị, ví dụ "Symphonie d'Automne", "Bình Minh Cam Ngọt")
2. poeticNarrative: Câu chuyện mùi hương mô tả hành trình từ khi xịt, lớp hương mở đầu, biến chuyển sang hương giữa và đọng lại trên da ở hương cuối (khoảng 3-4 câu truyền cảm).
3. seasonSuitabilityScore: Điểm số phù hợp với mùa đã chọn (0-100).
4. seasonFeedback: Nhận xét vì sao công thức này hợp/chưa hợp với mùa ${season} (ví dụ nhiệt độ, độ ẩm ảnh hưởng tốc độ bay hơi ra sao).
5. harmonyRating: Điểm hài hòa tổng thể giữa 6 nốt hương (0-100).
6. longevityHours: Ước lượng độ lưu hương (ví dụ "6 - 8 giờ").
7. sillage: Độ tỏa hương ("Gần (skin scent, 0.5m)", "Vừa phải (1 sải tay)", hoặc "Nổi bật (tỏa xa 2m+)").
8. olfactoryRadar: Điểm từ 0 đến 100 cho 6 nhóm hương: floral (hoa cỏ), citrus (cam chanh tươi), woody (gỗ), spicy (gia vị cay), oriental (ấm áp/phương Đông), fresh (tươi mát/thảo mộc).
9. masterReview: Đánh giá chuyên môn chi tiết: nốt hương nào đóng vai trò chủ đạo, nốt nào hỗ trợ, điểm hòa hợp và lời khuyên tỉ lệ tinh chỉnh.
10. macerationAdvice: Thời gian ủ lạnh (ủ hương/maceration) khuyến nghị (ví dụ: "Ủ 3-4 tuần ở nơi thoáng mát tránh ánh sáng").
11. safetyAndIFRA: Cảnh báo an toàn IFRA (ví dụ: lưu ý quang độc tính nếu có Bergamot/Lemon tự nhiên chứa furanocoumarin, giới hạn dermal limit).`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        perfumeName: { type: Type.STRING },
        poeticNarrative: { type: Type.STRING },
        seasonSuitabilityScore: { type: Type.NUMBER },
        seasonFeedback: { type: Type.STRING },
        harmonyRating: { type: Type.NUMBER },
        longevityHours: { type: Type.STRING },
        sillage: { type: Type.STRING },
        olfactoryRadar: {
          type: Type.OBJECT,
          properties: {
            floral: { type: Type.NUMBER },
            citrus: { type: Type.NUMBER },
            woody: { type: Type.NUMBER },
            spicy: { type: Type.NUMBER },
            oriental: { type: Type.NUMBER },
            fresh: { type: Type.NUMBER },
          },
          required: ['floral', 'citrus', 'woody', 'spicy', 'oriental', 'fresh'],
        },
        masterReview: { type: Type.STRING },
        macerationAdvice: { type: Type.STRING },
        safetyAndIFRA: { type: Type.STRING },
      },
      required: [
        'perfumeName',
        'poeticNarrative',
        'seasonSuitabilityScore',
        'seasonFeedback',
        'harmonyRating',
        'longevityHours',
        'sillage',
        'olfactoryRadar',
        'masterReview',
        'macerationAdvice',
        'safetyAndIFRA',
      ],
    };

    const { text } = await generateJsonWithModelFallback(ai, prompt, responseSchema);
    const parsedData = JSON.parse(text || '{}');
    return res.json({
      ...parsedData,
      source: 'gemini_api',
      message: 'Đã thẩm định thành công với AI Master Perfumer'
    });

  } catch (_error: any) {
    // Gracefully return chemistry heuristic response on API quota or network error without noisy stderr crash logs
    const { season, totalVolume, concentration, ingredients, tierTotals } = req.body;
    const fallback = generateLocalEvaluation(season, totalVolume, concentration, ingredients, tierTotals);
    return res.json({
      ...fallback,
      source: 'local_engine',
      message: 'Đã phân tích bằng Hệ Chuyên Gia Hóa Học Mùi Hương Floris (Chuẩn IFRA)'
    });
  }
});

// Heuristic fallback generator when AI API key is pending
function generateLocalEvaluation(
  season: string,
  totalVolume: number,
  concentration: string,
  ingredients: any[] = [],
  tierTotals: any = {}
) {
  const topTotal = tierTotals?.top || 30;
  const heartTotal = tierTotals?.heart || 50;
  const baseTotal = tierTotals?.base || 20;

  // Calculate radar scores based on ingredient families
  let floral = 25, citrus = 20, woody = 20, spicy = 15, oriental = 15, fresh = 20;

  ingredients.forEach((ing) => {
    const p = ing.percentage || 0;
    const fam = (ing.scentFamily || '').toLowerCase();
    const name = (ing.name || '').toLowerCase();
    if (fam.includes('hoa') || fam.includes('floral') || name.includes('hồng') || name.includes('nhài')) floral += p * 1.5;
    if (fam.includes('cam') || fam.includes('citrus') || name.includes('chanh') || name.includes('cam') || name.includes('bergamot')) citrus += p * 1.5;
    if (fam.includes('gỗ') || fam.includes('woody') || name.includes('đàn hương') || name.includes('tuyết tùng')) woody += p * 1.5;
    if (fam.includes('cay') || fam.includes('spicy') || name.includes('quế') || name.includes('tiêu')) spicy += p * 1.5;
    if (fam.includes('phương đông') || fam.includes('oriental') || name.includes('hổ phách') || name.includes('vanilla') || name.includes('musk')) oriental += p * 1.5;
    if (fam.includes('tươi mát') || fam.includes('fresh') || name.includes('bạc hà') || name.includes('thảo mộc')) fresh += p * 1.5;
  });

  const normalize = (v: number) => Math.min(95, Math.max(15, Math.round(v)));

  // Season suitability
  let seasonSuitabilityScore = 85;
  let seasonFeedback = '';
  if (season === 'Mùa Hè (Summer)') {
    if (citrus + fresh > 80) {
      seasonSuitabilityScore = 94;
      seasonFeedback = 'Công thức tươi sáng, tỷ lệ thanh mát cao giải nhiệt hoàn hảo trong khí hậu nắng nóng.';
    } else {
      seasonSuitabilityScore = 78;
      seasonFeedback = 'Mùi hương hơi đậm cho những ngày hè oi ả; có thể tăng nhẹ nốt Citrus/Bạc hà tầng đầu.';
    }
  } else if (season === 'Mùa Đông (Winter)') {
    if (woody + oriental + spicy > 80) {
      seasonSuitabilityScore = 96;
      seasonFeedback = 'Rất ấm áp và có chiều sâu bền vững, tỏa tốt trong không khí giá lạnh mùa đông.';
    } else {
      seasonSuitabilityScore = 76;
      seasonFeedback = 'Hơi nhẹ cho mùa lạnh, nên nâng tầng cuối (Base) lên khoảng 25-35% để giữ ấm.';
    }
  } else if (season === 'Mùa Xuân (Spring)') {
    seasonSuitabilityScore = 90;
    seasonFeedback = 'Độ nở hoa cỏ và cam chanh hài hòa, tái hiện sinh động sức sống đâm chồi của mùa xuân.';
  } else {
    seasonSuitabilityScore = 88;
    seasonFeedback = 'Sắc thái hoài niệm, tầng giữa và tầng đáy hòa quyện dịu dàng trong tiết trời se lạnh thu.';
  }

  // Sillage and longevity based on base notes and concentration
  const isExtrait = concentration?.includes('Extrait');
  const longevityHours = isExtrait ? '8 - 12 giờ' : baseTotal >= 25 ? '6 - 8 giờ' : '4 - 6 giờ';
  const sillage = isExtrait ? 'Nổi bật (tỏa xa 2m+)' : topTotal >= 35 ? 'Vừa phải (1 sải tay)' : 'Gần (skin scent nhẹ nhàng)';

  const namesBySeason: Record<string, string[]> = {
    'Mùa Xuân (Spring)': ["Le Jardin Enchanteur", "Khúc Ca Mùa Xuân", "Floraison Poétique"],
    'Mùa Hè (Summer)': ["Brise d'Azur", "Ánh Nắng Địa Trung Hải", "Citrus Éclatant"],
    'Mùa Thu (Autumn)': ["Feuilles Dorées", "Hoàng Hôn Hổ Phách", "Sillage d'Or"],
    'Mùa Đông (Winter)': ["Nuit Veloutée", "Tuyết Trắng & Gỗ Quý", "Chaleur d'Hiver"],
  };
  const list = namesBySeason[season] || ["Atelier Élixir", "Harmonie Suprême"];
  const perfumeName = list[Math.floor(Math.random() * list.length)];

  return {
    perfumeName,
    poeticNarrative: `Một khởi đầu sảng khoái với tầng đầu rạng rỡ, dần nhường chỗ cho trái tim nồng nàn của tầng giữa, trước khi neo đậu lại trong lớp hương gỗ và nhựa thơm lắng đọng trên da suốt nhiều giờ.`,
    seasonSuitabilityScore,
    seasonFeedback,
    harmonyRating: Math.min(98, 75 + Math.round((heartTotal >= 35 && heartTotal <= 55 ? 15 : 5) + (topTotal >= 20 && topTotal <= 40 ? 10 : 5))),
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
    macerationAdvice: 'Nên ủ hỗn hợp tinh dầu với cồn mỹ phẩm 96 độ trong 3 đến 4 tuần ở nhiệt độ 18-22°C nơi tối trước khi lọc lạnh để đạt độ tròn vị cao nhất.',
    safetyAndIFRA: 'Tuân thủ giới hạn IFRA 51st Amendment: Giới hạn tinh dầu vỏ cam chanh ép lạnh dưới 2% để tránh kích ứng nhạy cảm ánh sáng (phototoxicity).'
  };
}

// 2. Interactive QR & Voice AI Formula Adjustment Endpoint
app.post(['/api/perfume/adjust', '/Floris/api/perfume/adjust'], async (req: Request, res: Response) => {
  try {
    const bodyFormula: PrecisionFormulaEntry[] | undefined = Array.isArray(req.body?.formula)
      ? req.body.formula
      : Array.isArray(req.body?.currentFormula)
      ? req.body.currentFormula
      : undefined;

    const {
      userRequest = req.body?.request,
      season = 'Mùa Xuân (Spring)',
      totalVolume = 10,
      concentration = 'Eau de Parfum (EDP)',
      concentrationPercent = 20,
      ingredients = [],
      tierTotals = {},
    } = req.body;

    if (!userRequest || typeof userRequest !== 'string') {
      return res.status(400).json({ error: 'Vui lòng nhập hoặc nói yêu cầu điều chỉnh mùi hương.' });
    }

    // Standalone { message, formula: [{ name, amount }] } precision mode
    if (bodyFormula && (!Array.isArray(ingredients) || ingredients.length === 0)) {
      const result = await handleStandalonePrecisionRequest(userRequest, bodyFormula);
      return res.json(result);
    }

    const activeIngredients = (ingredients || []).filter((i: any) => (i.percentage || 0) > 0);
    const cmd = parseExplicitAddRemoveCommand(userRequest);
    const missingCheck = checkMissingIngredients(userRequest, activeIngredients);

    // Rule 4 pre-guard: If user asks to adjust an ingredient NOT in active formula, keep original numbers unchanged
    if (missingCheck.hasMissingIngredient && !cmd.isExplicitRemove) {
      const localUnchanged = generateLocalAdjustment(
        userRequest,
        season,
        totalVolume,
        concentrationPercent,
        ingredients,
        tierTotals
      );
      return res.json({
        ...localUnchanged,
        source: 'precision_guard',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      const localResult = generateLocalAdjustment(
        userRequest,
        season,
        totalVolume,
        concentrationPercent,
        ingredients,
        tierTotals
      );
      return res.json({
        ...localResult,
        source: 'local_engine',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const pureFragranceMl = Number(((totalVolume * concentrationPercent) / 100).toFixed(2));
    const carrierAlcoholMl = Number((totalVolume - pureFragranceMl).toFixed(2));

    const prompt = `You are a precision perfume formulation assistant and Chemistry Advisor. Your ONLY job is to adjust the proportions of an existing fragrance formula based on the user's request.

USER REQUEST:
"${userRequest}"

CURRENT FORMULA CONTEXT (${season}, ${totalVolume} mL, ${concentration} ${concentrationPercent}% = ${pureFragranceMl} mL fragrance oil + ${carrierAlcoholMl} mL Ethanol):
Active Ingredients (ONLY these exist in the current formula):
${activeIngredients
  .map(
    (ing: any, idx: number) =>
      `  ${idx + 1}. Slot [${ing.slotKey}] (${ing.tierLabel}) - Exact Name: "${ing.name}" (${ing.scentFamily}): Current Amount = ${ing.percentage}%`
  )
  .join('\n')}

Inactive 0% Slots (MUST STAY 0% — NOT in current formula):
${(ingredients || [])
  .filter((i: any) => (i.percentage || 0) === 0)
  .map((i: any) => `  - Slot [${i.slotKey}] "${i.name}": 0% (MUST STAY 0%)`)
  .join('\n') || '  (none)'}

STRICT RULES (NO EXCEPTIONS):
1. IMMUTABLE INGREDIENT LIST: You MUST keep the exact same list of active ingredients provided above. Keep all inactive 0% slots at 0%.
2. DO NOT ADD OR REMOVE: Never add new ingredients, base notes, fixatives, or solvents, and never delete existing active ones unless the user explicitly commands "add [ingredient]" or "remove [ingredient]".
3. ONLY ADJUST QUANTITIES: Modify ONLY the numerical percentage (newPercentage >= 1) of the active ingredients so the sum equals 100%.
4. HANDLE AMBIGUITY: If the user mentions an ingredient that is NOT in the active ingredients list (for example asking to adjust "Jasmine" or "Lavender" when it does not exist in Active Ingredients above), do NOT add it and do NOT modify other ingredients. Instead set isUnchanged = true, keep EVERY ingredient's newPercentage IDENTICAL to its original Current Amount, and explain clearly in Vietnamese inside spokenResponse and analysisSummary that the requested ingredient is not in the current formula.

LANGUAGE & AUDIO REQUIREMENTS:
- Write spokenResponse, analysisSummary, and all explanations naturally in Vietnamese.
- "spokenResponse" must be concise (1-2 sentences, max 30 words) directly suitable for Vietnamese TTS.`;

    const cacheKey = JSON.stringify({
      v: 2,
      userRequest: userRequest.trim().toLowerCase(),
      season,
      totalVolume,
      concentrationPercent,
      ings: (ingredients || []).map((i: any) => `${i.slotKey}:${i.name}:${i.percentage}`),
    });

    if (aiResponseCache.has(cacheKey)) {
      return res.json(aiResponseCache.get(cacheKey));
    }

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        isUnchanged: {
          type: Type.BOOLEAN,
          description: 'True if a requested ingredient is not in the active formula and original numbers were kept unchanged.',
        },
        spokenResponse: {
          type: Type.STRING,
          description:
            'Câu trả lời tóm tắt ngắn gọn 100% bằng TIẾNG VIỆT thuần túy để phát âm thanh TTS.',
        },
        analysisSummary: { type: Type.STRING },
        proposedPerfumeName: { type: Type.STRING },
        olfactoryPredictionHypothesis: {
          type: Type.OBJECT,
          properties: {
            overallChange: { type: Type.STRING },
            topStage: { type: Type.STRING },
            heartStage: { type: Type.STRING },
            baseStage: { type: Type.STRING },
          },
          required: ['overallChange', 'topStage', 'heartStage', 'baseStage'],
        },
        studentReviewHints: {
          type: Type.OBJECT,
          properties: {
            reasonableHint: { type: Type.STRING },
            chemistryKnowledgeHint: { type: Type.STRING },
            experimentVerificationHint: { type: Type.STRING },
          },
          required: ['reasonableHint', 'chemistryKnowledgeHint', 'experimentVerificationHint'],
        },
        highlightChanges: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        adjustedIngredients: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              slotKey: { type: Type.STRING },
              newPercentage: { type: Type.NUMBER },
              reason: { type: Type.STRING },
            },
            required: ['slotKey', 'newPercentage', 'reason'],
          },
        },
      },
      required: [
        'isUnchanged',
        'spokenResponse',
        'analysisSummary',
        'proposedPerfumeName',
        'olfactoryPredictionHypothesis',
        'studentReviewHints',
        'highlightChanges',
        'adjustedIngredients',
      ],
    };

    const { text } = await generateJsonWithModelFallback(ai, prompt, responseSchema);
    const parsed = JSON.parse(text || '{}');
    const normalizedResult = normalizeAdjustmentOutput(
      parsed,
      ingredients,
      totalVolume,
      concentrationPercent
    );

    const payload = {
      ...normalizedResult,
      source: 'gemini_api',
    };
    aiResponseCache.set(cacheKey, payload);
    return res.json(payload);
  } catch (_error: any) {
    const {
      userRequest = '',
      season = 'Mùa Xuân (Spring)',
      totalVolume = 10,
      concentrationPercent = 20,
      ingredients = [],
      tierTotals = {},
    } = req.body;
    const fallback = generateLocalAdjustment(
      userRequest,
      season,
      totalVolume,
      concentrationPercent,
      ingredients,
      tierTotals
    );
    return res.json({
      ...fallback,
      source: 'local_engine',
    });
  }
});

// Dedicated strict JSON precision adjustment endpoint returning ONLY { message, formula }
app.post(
  [
    '/api/perfume/precision-adjust',
    '/Floris/api/perfume/precision-adjust',
    '/api/adjust-formula',
    '/Floris/api/adjust-formula',
  ],
  async (req: Request, res: Response) => {
    try {
      const userRequest = req.body?.userInstruction || req.body?.userRequest || req.body?.request;
      const currentFormula: PrecisionFormulaEntry[] = Array.isArray(req.body?.formula)
        ? req.body.formula
        : Array.isArray(req.body?.currentFormula)
        ? req.body.currentFormula
        : [];

      if (!userRequest || typeof userRequest !== 'string') {
        return res.status(400).json({ error: 'Missing userInstruction / userRequest string.' });
      }
      if (currentFormula.length === 0) {
        return res.status(400).json({ error: 'Missing currentFormula / formula array.' });
      }

      const result = await handleStandalonePrecisionRequest(userRequest, currentFormula);
      return res.json(result);
    } catch (_error: any) {
      const userRequest = String(req.body?.userInstruction || req.body?.userRequest || req.body?.request || '');
      const currentFormula: PrecisionFormulaEntry[] = Array.isArray(req.body?.formula)
        ? req.body.formula
        : Array.isArray(req.body?.currentFormula)
        ? req.body.currentFormula
        : [];
      return res.json(adjustStandalonePrecisionFormula(userRequest, currentFormula));
    }
  }
);

async function handleStandalonePrecisionRequest(
  userRequest: string,
  currentFormula: PrecisionFormulaEntry[]
) {
  const cmd = parseExplicitAddRemoveCommand(userRequest);
  const missingCheck = checkMissingIngredients(
    userRequest,
    currentFormula.map((f, idx) => ({ id: `item_${idx}`, name: f.name, percentage: f.amount }))
  );

  if (missingCheck.hasMissingIngredient && !cmd.isExplicitAdd) {
    return adjustStandalonePrecisionFormula(userRequest, currentFormula);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return adjustStandalonePrecisionFormula(userRequest, currentFormula);
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `You are a precision perfume formulation assistant. Your ONLY job is to adjust the proportions of an existing fragrance formula based on the user's request.

CURRENT FORMULA:
${JSON.stringify(currentFormula, null, 2)}

USER REQUEST:
"${userRequest}"

STRICT RULES (NO EXCEPTIONS):
1. IMMUTABLE INGREDIENT LIST: You MUST keep the exact same list of ingredients provided in the current formula.
2. DO NOT ADD OR REMOVE: Never add new ingredients, base notes, fixatives, or solvents, and never delete existing ones unless the user explicitly commands "add [ingredient]" or "remove [ingredient]".
3. ONLY ADJUST QUANTITIES: Modify only the numerical amount/percentage of the existing ingredients to reflect the user's request.
4. HANDLE AMBIGUITY: If the user mentions an ingredient that is NOT in the current formula, do NOT add it. Instead, keep the original numbers unchanged and explain in the message field that the ingredient is not in the current formula.

OUTPUT FORMAT:
Return ONLY valid JSON matching:
{
  "message": "Brief explanation of the adjustment made",
  "formula": [
    { "name": "Exact Ingredient Name", "amount": 10 }
  ]
}`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        message: { type: Type.STRING },
        formula: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              amount: { type: Type.NUMBER },
            },
            required: ['name', 'amount'],
          },
        },
      },
      required: ['message', 'formula'],
    };

    const { text } = await generateJsonWithModelFallback(ai, prompt, schema);
    const parsed = JSON.parse(text || '{}');
    return normalizeStandalonePrecisionOutput(parsed, currentFormula, userRequest);
  } catch {
    return adjustStandalonePrecisionFormula(userRequest, currentFormula);
  }
}

// 3. Audio Transcription Endpoint (Speech-to-Text via Gemini 3.5 Transcribe)
app.post(['/api/perfume/transcribe', '/Floris/api/perfume/transcribe'], async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: 'Không nhận được dữ liệu âm thanh.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'Chưa cấu hình GEMINI_API_KEY trên máy chủ, hệ thống sẽ dùng nhận diện giọng nói trực tiếp của trình duyệt.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: audioBase64,
            },
          },
          {
            text: 'Chuyển đoạn ghi âm tiếng Việt này thành văn bản chính xác. Chỉ trả về câu nói của người dùng, không thêm giải thích.',
          },
        ],
      },
    });

    return res.json({
      transcript: (response.text || '').trim(),
    });
  } catch (error: any) {
    return res.json({
      transcript: '',
      fallbackToBrowser: true,
      error: 'Dịch vụ âm thanh máy chủ tạm bận, hệ thống tự động kích hoạt nhận diện trực tiếp bằng trình duyệt.',
    });
  }
});

// 4. Text-to-Speech Endpoint (AI Voice Response via Gemini 3.8 Flash Lite TTS)
app.post(['/api/perfume/tts', '/Floris/api/perfume/tts'], async (req: Request, res: Response) => {
  try {
    const { text, voiceName = 'Kore' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Thiếu văn bản cần đọc.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        audioBase64: null,
        fallbackBrowserTts: true,
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Làm sạch ký tự markdown, biểu tượng cảm xúc để bộ máy TTS phát âm tự nhiên, chuẩn tiếng Việt
    const cleanText = text
      .replace(/[*_#`~[\]()]/g, ' ')
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Output âm thanh phát bằng giọng AI Gemini Live ấm áp, tự nhiên
    const ttsPrompt = `Hãy đọc to đoạn văn sau bằng giọng đọc tự nhiên, ấm áp và truyền cảm: "${cleanText}"`;

    const TTS_MODELS = ['gemini-3.8-flash-lite-tts', 'gemini-3.8-flash-tts'];
    let base64Audio: string | undefined;

    for (const m of TTS_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: m,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: ttsPrompt,
                  speechMetadata: {
                    style: 'Giọng đọc Gemini Live tiếng Việt tự nhiên, ấm áp, truyền cảm, phát âm tiếng Việt chuẩn 100%',
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
              },
            },
          },
        });

        base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) break;
      } catch {
        continue;
      }
    }

    if (base64Audio) {
      return res.json({
        audioBase64: base64Audio,
        mimeType: 'audio/wav',
        voiceName: voiceName || 'Kore',
        engine: 'Gemini Live Voice',
      });
    }

    return res.status(503).json({
      error: 'Không thể tạo âm thanh giọng nói Gemini Live lúc này.',
      audioBase64: null,
    });
  } catch (_error: any) {
    return res.status(500).json({
      error: 'Lỗi máy chủ khi tạo âm thanh Gemini Live.',
      audioBase64: null,
    });
  }
});

// 5. Python Streamlit app asset retrieval
app.get('/api/python/app1', (_req: Request, res: Response) => {
  try {
    const filePath = path.join(process.cwd(), 'public/assets/aistudio/app1_8ba4d2ea.py');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return res.json({
        success: true,
        filename: 'app1_8ba4d2ea.py',
        content,
      });
    }
    return res.status(404).json({ error: 'File not found' });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Error reading python file' });
  }
});



async function startServer() {
  app.get(['/Floris', '/Floris/*'], (req: Request, res: Response, next) => {
    if (req.url.startsWith('/Floris/api/')) {
      return next();
    }
    const target = req.url.replace(/^\/Floris\/?/, '/') || '/';
    res.redirect(302, target);
  });

  // API catch-all to guarantee JSON responses (never HTML)
  app.all(['/api/*', '/Floris/api/*'], (_req: Request, res: Response) => {
    res.status(404).json({ error: 'API endpoint not found' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
