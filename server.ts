import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

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
app.post('/api/perfume/evaluate', async (req: Request, res: Response) => {
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
app.post('/api/perfume/adjust', async (req: Request, res: Response) => {
  try {
    const {
      userRequest,
      season,
      totalVolume = 50,
      concentration = 'Eau de Parfum (EDP)',
      concentrationPercent = 18,
      ingredients = [],
      tierTotals = {},
    } = req.body;

    if (!userRequest || typeof userRequest !== 'string') {
      return res.status(400).json({ error: 'Vui lòng nhập hoặc nói yêu cầu điều chỉnh mùi hương.' });
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

    const prompt = `Bạn là Chuyên gia Điều chế Nước hoa & Cố vấn Hóa học Mùi hương (AI Perfumery & Chemistry Advisor) hỗ trợ nhóm học sinh thuyết trình khoa học.
Người dùng / người tham quan vừa đưa ra yêu cầu cải tiến công thức nước hoa thực nghiệm như sau:
"${userRequest}"

THÔNG TIN CÔNG THỨC THỰC NGHIỆM GỐC:
- Bối cảnh / Mùa: ${season}
- Quy mô pha chế: Chai ${totalVolume} mL thành phẩm
- Nồng độ pha chế: ${concentration} (${concentrationPercent}% cốt hương liệu nguyên chất = ${pureFragranceMl} mL tinh dầu + ${100 - concentrationPercent}% dung môi Ethanol 96° = ${carrierAlcoholMl} mL cồn).
- Phân bổ 3 tầng hương hiện tại (tính trên 100% hỗn hợp cốt hương liệu):
  * Tầng Đầu (Top Notes): ${tierTotals?.top || 0}%
  * Tầng Giữa (Heart Notes): ${tierTotals?.heart || 0}%
  * Tầng Cuối (Base Notes): ${tierTotals?.base || 0}%
- Chi tiết 6 nguyên liệu trong công thức thực nghiệm gốc:
${(ingredients || [])
  .map(
    (ing: any, idx: number) =>
      `  ${idx + 1}. Slot [${ing.slotKey}] (${ing.tierLabel}) - Tên: "${ing.name}" (${ing.scentFamily}): Tỉ lệ phối trộn trong cốt hương = ${ing.percentage}% (Nồng độ trong sản phẩm nước hoa hoàn chỉnh = ${Number(((ing.percentage * concentrationPercent) / 100).toFixed(2))}%)`
  )
  .join('\n')}

NHIỆM VỤ BẮT BUỘC CỦA BẠN:
1. Phân tích yêu cầu "${userRequest}" dựa trên thành phần đang có và tính chất hóa học (độ bay hơi, áp suất hơi, khối lượng phân tử, nhóm chức terpene/alcohol/ester/sesquiterpene, liên kết hydro).
2. Đề xuất tỉ lệ phối trộn mới (newPercentage) cho đúng 6 slot (top1, top2, heart1, heart2, base1, base2) trong hỗn hợp cốt hương liệu sao cho TỔNG CẢ 6 NGUYÊN LIỆU BẮT BUỘC BẰNG ĐÚNG 100%.
3. Giải thích rõ lý do điều chỉnh từng nguyên liệu (vì sao tăng/giảm và vai trò hóa học/khứu giác).
4. Đưa ra "olfactoryPredictionHypothesis" (Dự đoán sự thay đổi về mùi hương): Phải thể hiện rõ đây là GIẢ THUYẾT DỰ ĐOÁN dựa trên lý thuyết bay hơi và tương tác phân tử, KHÔNG khẳng định tuyệt đối như kết quả thực nghiệm đã chứng minh.
5. Cung cấp gợi ý cơ sở Hóa học ("chemistryKnowledgeHint") và gợi ý thực nghiệm đối chứng ("experimentVerificationHint") để học sinh thảo luận, phản biện và kiểm chứng.
6. YÊU CẦU ĐẶC BIỆT BẮT BUỘC CHO ĐẦU RA ÂM THANH ("spokenResponse"):
   - Trường "spokenResponse" là văn bản sẽ được hệ thống trực tiếp chuyển thành ÂM THANH GIỌNG NÓI phát qua loa cho người dùng.
   - BẮT BUỘC TRẢ LỜI CỰC KỲ NGẮN GỌN (CHỈ 1 ĐẾN 2 CÂU NGẮN, TỐI ĐA 30 TỪ).
   - Đi thẳng vào kết quả điều chỉnh nốt hương theo yêu cầu của người dùng, tự nhiên và súc tích.
   - TUYỆT ĐỐI KHÔNG DÀI DÒNG, TUYỆT ĐỐI KHÔNG NÓI CÁC CÂU RÀO ĐÓN NHƯ: "Nói hoàn toàn bằng tiếng Việt", "Tôi xin phép trả lời bằng tiếng Việt", hay giải thích việc đã đổi ngôn ngữ. Coi việc nói tiếng Việt tự nhiên là hiển nhiên và bắt buộc phải làm, không cần nói ra.
   - Tuyệt đối không gắn nhãn hay phân bua về việc thay đổi công thức.`;

    const cacheKey = JSON.stringify({
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
        spokenResponse: {
          type: Type.STRING,
          description:
            'Câu trả lời tóm tắt ngắn gọn BẮT BUỘC LUÔN LUÔN 100% bằng TIẾNG VIỆT thuần túy để chuyển thành âm thanh giọng nói qua loa (TTS), tuyệt đối không dùng tiếng Anh.',
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

// 3. Audio Transcription Endpoint (Speech-to-Text via Gemini 3.5 Transcribe)
app.post('/api/perfume/transcribe', async (req: Request, res: Response) => {
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
app.post('/api/perfume/tts', async (req: Request, res: Response) => {
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

function normalizeAdjustmentOutput(
  parsed: any,
  originalIngredients: any[],
  totalVolume: number,
  concentrationPercent: number
) {
  const pureFragranceMl = Number(((totalVolume * concentrationPercent) / 100).toFixed(2));
  const carrierAlcoholMl = Number((totalVolume - pureFragranceMl).toFixed(2));
  const rawList: any[] = Array.isArray(parsed.adjustedIngredients)
    ? parsed.adjustedIngredients
    : [];

  // Map back to the 6 original slots
  let mapped = originalIngredients.map((orig: any) => {
    const found = rawList.find((r) => r.slotKey === orig.slotKey);
    const newPct =
      found && typeof found.newPercentage === 'number'
        ? Math.max(2, Math.round(found.newPercentage))
        : orig.percentage;
    return {
      slotKey: orig.slotKey,
      tier: orig.tier,
      tierLabel: orig.tierLabel,
      id: orig.id,
      name: orig.name,
      scentFamily: orig.scentFamily,
      oldPercentage: orig.percentage,
      newPercentage: newPct,
      ifraMaxPercent: orig.ifraMaxPercent ?? 5.0,
      reason: found?.reason || 'Cân bằng tổng thể cấu trúc 3 tầng hương',
    };
  });

  // Automated Program Validation Check: Ensure sum is strictly 100%
  const rawAiSum = mapped.reduce((acc, item) => acc + item.newPercentage, 0);
  const wasNormalized = rawAiSum !== 100;
  if (rawAiSum !== 100 && mapped.length > 0) {
    let running = 0;
    mapped = mapped.map((item, idx) => {
      if (idx === mapped.length - 1) {
        return { ...item, newPercentage: Math.max(1, 100 - running) };
      }
      const scaled = Math.max(1, Math.round((item.newPercentage / rawAiSum) * 100));
      running += scaled;
      return { ...item, newPercentage: scaled };
    });
  }

  const comparisonItems = mapped.map((item) => {
    // Distinguish clearly:
    // - item.oldPercentage / newPercentage: Tỉ lệ phối trộn trong cốt hương liệu nguyên chất (Tổng = 100%)
    // - oldFinalProductConcPercent / newFinalProductConcPercent: Nồng độ trong sản phẩm nước hoa hoàn chỉnh (pha loãng trong cồn Ethanol)
    // - oldVolMl / newVolMl: Thể tích tinh dầu nguyên chất thực tế (mL) = pureFragranceMl * pct / 100
    const oldVolMl = Number(((pureFragranceMl * item.oldPercentage) / 100).toFixed(2));
    const newVolMl = Number(((pureFragranceMl * item.newPercentage) / 100).toFixed(2));
    const oldFinalProductConcPercent = Number(
      ((item.oldPercentage * concentrationPercent) / 100).toFixed(2)
    );
    const newFinalProductConcPercent = Number(
      ((item.newPercentage * concentrationPercent) / 100).toFixed(2)
    );
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
    top: comparisonItems
      .filter((i) => i.tier === 'top')
      .reduce((a, b) => a + b.newPercentage, 0),
    heart: comparisonItems
      .filter((i) => i.tier === 'heart')
      .reduce((a, b) => a + b.newPercentage, 0),
    base: comparisonItems
      .filter((i) => i.tier === 'base')
      .reduce((a, b) => a + b.newPercentage, 0),
  };

  const validatedSum = comparisonItems.reduce((a, b) => a + b.newPercentage, 0);

  return {
    spokenResponse:
      parsed.spokenResponse ||
      'Mình đã phân tích yêu cầu của bạn, kiểm tra tự động tổng tỉ lệ đạt chuẩn 100% và tính toán phương án điều chỉnh. Mời nhóm học sinh và người tham quan đối chiếu công thức gốc với công thức đề xuất trên màn hình!',
    analysisSummary:
      parsed.analysisSummary ||
      'Công thức đã được tái cân bằng dựa trên yêu cầu cảm quan và cơ sở độ bay hơi của 3 tầng hương.',
    proposedPerfumeName: parsed.proposedPerfumeName || 'Phiên Bản Cải Tiến AI',
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
        'Đề xuất của AI hợp lý về mặt cấu trúc mùi hương vì đã điều chỉnh đúng nhóm nguyên liệu chịu trách nhiệm cho sắc thái mùi mà người dùng yêu cầu, đồng thời vẫn giữ nguyên bộ khung 6 nguyên liệu gốc và đảm bảo tổng tỉ lệ 100%.',
      chemistryKnowledgeHint:
        'Giải thích dựa trên độ bay hơi (volatility), khối lượng phân tử (M) và liên kết liên phân tử: Tinh dầu tầng đầu chứa nhiều hydrocarbon monoterpene (như Limonene, M=136 g/mol) ít phân cực nên áp suất hơi cao, bay hơi nhanh; tầng giữa chứa alcohol thơm (Citronellol, Geraniol có nhóm -OH) tạo liên kết hydro trung bình; tầng cuối chứa sesquiterpene alcohol (Santalol, M=220 g/mol) và vòng macrocyclic có khối lượng phân tử lớn, làm giảm áp suất hơi riêng phần (theo định luật Raoult) và giữ mùi lâu hơn.',
      experimentVerificationHint:
        'Pha 2 mẫu đối chứng quy mô nhỏ (5 mL hoặc 10 mL) trong cùng dung môi Ethanol 96° (tỉ lệ 18% cốt hương : 82% cồn): Mẫu A (Công thức gốc) và Mẫu B (Công thức AI đề xuất). Nhỏ lên 2 que giấy thử mùi (blotter) có đánh mã số ẩn (thử mù đôi - blind test) và đánh giá mùi ở 3 mốc thời gian: sau 15 phút (Tầng đầu), sau 2 giờ (Tầng giữa) và sau 6 giờ (Tầng cuối).',
    },
    validationReport: {
      rawAiSum,
      validatedSum,
      wasNormalized,
      isValid100: validatedSum === 100,
      pureFragranceMl,
      carrierAlcoholMl,
      concentrationPercent,
      concentrationDistinctionNote: `Tổng tỉ lệ phối trộn trong hỗn hợp cốt hương liệu = ${validatedSum}%. Khi pha vào chai ${totalVolume} mL ở nồng độ ${concentrationPercent}%, tổng lượng cốt tinh dầu là ${pureFragranceMl} mL và dung môi cồn Ethanol 96° là ${carrierAlcoholMl} mL.`,
    },
    comparisonItems,
    newTierTotals,
  };
}

function generateLocalAdjustment(
  userRequest: string,
  _season: string,
  totalVolume: number,
  concentrationPercent: number,
  ingredients: any[] = [],
  _tierTotals: any = {}
) {
  const q = userRequest.toLowerCase();
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

  // Identify dynamic names from the current 6 slots (Floris Spring: Hoa nhài, Đào, Xạ hương trắng, Vanilla)
  const findSlotName = (slotKey: string, fallback: string) =>
    ingredients.find((i: any) => i.slotKey === slotKey)?.name || fallback;

  const top1Name = findSlotName('top1', 'Hoa nhài 🌼');
  const top2Name = findSlotName('top2', 'Hoa nhài Trắng 🌼');
  const heart1Name = findSlotName('heart1', 'Đào 🍑');
  const heart2Name = findSlotName('heart2', 'Đào Mùa Xuân 🍑');
  const base1Name = findSlotName('base1', 'Xạ hương trắng 🤍');
  const base2Name = findSlotName('base2', 'Vanilla 🍦');

  const rawAdjusted = ingredients.map((ing: any) => {
    let pct = ing.percentage || 15;
    let reason = 'Giữ tỉ lệ nền ổn định cho cấu trúc kim tự tháp hương';

    if (wantFresher) {
      // Matches Mẫu B - Tươi hơn: Tăng Hoa nhài lên 30%, Đào 20%, Xạ hương 25%, Vanilla 25%
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
      // Matches Mẫu C - Dịu ngọt / lưu hương: Tăng Xạ hương 30%, Vanilla 30%, Nhài 20%, Đào 20%
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
  let olfactoryPredictionHypothesis = {
    overallChange:
      'Mùi hương chuyển dịch cân bằng theo đúng yêu cầu cảm quan của bạn.',
    topStage: `Giai đoạn đầu: Hương ${top1Name} khuếch tán thanh thoát, tươi mới.`,
    heartStage: `Giai đoạn giữa: Hương ${heart1Name} mọng nước lan tỏa nhẹ nhàng.`,
    baseStage: `Giai đoạn cuối: Nền ${base1Name} và ${base2Name} lưu lại êm dịu, ấm áp.`,
  };
  let studentReviewHints = {
    reasonableHint:
      'Đề xuất đã điều chỉnh đúng nhóm hương liên quan, đảm bảo tổng tỉ lệ phối trộn đúng 100%.',
    chemistryKnowledgeHint:
      'Các phân tử hương đầu bay hơi nhanh, hương giữa duy trì 2–4 giờ, và các phân tử tầng cuối khối lượng lớn đóng vai trò chất định hương tự nhiên.',
    experimentVerificationHint: `Pha mẫu thử nghiệm ${totalVolume} mL theo công thức mới, nhỏ lên que thử và theo dõi cảm quan sau 24h, 48h, 72h.`,
  };

  if (wantFresher) {
    proposedPerfumeName = 'Floris — Mẫu B (Tươi Hơn)';
    spokenResponse = `Đã điều chỉnh tăng hương hoa nhài lên 30% để mùi hương tươi sáng và thanh thoát hơn ngay khi xịt.`;
    analysisSummary = `Tăng nốt Hoa nhài lên 30% (tương ứng chuẩn Mẫu B), giữ Đào 20%, Xạ hương trắng 25% và Vanilla 25%.`;
    highlightChanges = [
      `Tăng ${top1Name} lên 30% giúp mở đầu thanh mát, rạng rỡ`,
      `Cân đối ${heart1Name} 20%, ${base1Name} 25% và ${base2Name} 25%`,
      'Tổng tỉ lệ phối trộn đạt chính xác 100%',
    ];
    olfactoryPredictionHypothesis = {
      overallChange:
        'Hương thơm trở nên tươi sáng, thanh thoát và bừng sức sống mùa xuân rõ rệt.',
      topStage: `0–25 phút: Benzyl acetate trong ${top1Name} bay hơi nhanh, tỏa hương hoa trắng thanh mát.`,
      heartStage: `25 phút – 2.5 giờ: Hương ${heart1Name} chuyển tiếp nhẹ nhàng, không bị nồng.`,
      baseStage: `Sau 2.5 giờ: Lớp nền ${base1Name} và ${base2Name} giữ độ lưu hương êm dịu.`,
    };
    studentReviewHints = {
      reasonableHint:
        'Trùng khớp với phương án Mẫu B (Tươi hơn): tăng hương hoa nhài mở đầu.',
      chemistryKnowledgeHint:
        'Hương hoa nhài chứa Benzyl acetate và Linalool có áp suất hơi cao, giúp khuếch tán nhanh vào không khí.',
      experimentVerificationHint:
        'So sánh trực tiếp Mẫu A và Mẫu B trên giấy thử sau 15 phút và sau 24h–72h ủ mẫu.',
    };
  } else if (wantClearerFloral) {
    proposedPerfumeName = 'Floris — Hương Đào Rõ Nét';
    spokenResponse = `Đã nâng nốt đào lên 35% để hương trái cây ngọt dịu và tươi tắn nổi bật hơn ở tầng giữa.`;
    analysisSummary = `Tăng nốt Đào lên 35%, điều tiết Hoa nhài 25%, Xạ hương trắng 20% và Vanilla 20%.`;
    highlightChanges = [
      `Tăng ${heart1Name} lên 35% giúp hương đào bung tỏa mọng nước`,
      'Tổng tỉ lệ phối trộn kiểm tra tự động đạt đúng 100%',
    ];
    olfactoryPredictionHypothesis = {
      overallChange: `Sắc thái quả đào mọng nước của ${heart1Name} tỏa rõ và đầy đặn hơn từ phút thứ 15.`,
      topStage: `0–15 phút: Hương ${top1Name} mở màn thanh nhẹ.`,
      heartStage: `15 phút – 3.5 giờ: Lactone đào lan tỏa ngọt dịu, trẻ trung.`,
      baseStage: `Sau 3.5 giờ: Hòa quyện êm ái cùng ${base1Name} và ${base2Name}.`,
    };
    studentReviewHints = {
      reasonableHint: `Tăng nồng độ ${heart1Name} giúp làm nổi bật chủ đề hương trái cây mùa xuân.`,
      chemistryKnowledgeHint: `Lactone đào bay hơi ở tốc độ trung bình, duy trì hương thơm bền bỉ suốt giai đoạn giữa.`,
      experimentVerificationHint:
        'Thử ngửi mù đôi trên que giấy thử ở mốc 30 phút để đánh giá độ nổi bật của nốt đào.',
    };
  } else if (wantLessStrong) {
    proposedPerfumeName = 'Floris — Hương Dịu Nhẹ';
    spokenResponse = `Đã giảm bớt vị ngọt đậm và tăng hoa nhài lên 35% để mùi hương nhẹ nhàng, thoáng đãng hơn.`;
    analysisSummary = `Giảm nốt ngọt đậm, tăng Hoa nhài lên 35% và giữ Xạ hương trắng 25% để không gian hương trong trẻo.`;
    highlightChanges = [
      `Tăng ${top1Name} lên 35% tạo cảm giác thanh mát, dễ chịu`,
      `Giảm nhẹ ${base2Name} giúp hậu vị thanh thoát`,
      'Tổng tỉ lệ đạt chuẩn 100%',
    ];
    olfactoryPredictionHypothesis = {
      overallChange:
        'Mùi hương trở nên thanh nhẹ, thoáng đãng và ôm sát da nhẹ nhàng.',
      topStage: `0–25 phút: Mở đầu thanh tao, không nồng gắt.`,
      heartStage: `25 phút – 2.5 giờ: Lớp hương đào mỏng nhẹ như sương mai.`,
      baseStage: `Sau 2.5 giờ: Hậu vị sạch sẽ, êm ái nhờ ${base1Name}.`,
    };
    studentReviewHints = {
      reasonableHint:
        'Giảm bớt hợp chất thơm đậm đặc giúp làm dịu cảm giác nồng khứu giác.',
      chemistryKnowledgeHint:
        'Giảm phân số mol của vanillin làm giảm áp suất hơi riêng phần của nó theo định luật Raoult.',
      experimentVerificationHint:
        'Đối chiếu mẫu gốc và mẫu giảm nồng trên cổ tay sau 30 phút.',
    };
  } else if (wantMoreWoody) {
    proposedPerfumeName = 'Floris — Mẫu C (Dịu Ngọt & Lưu Hương Sâu)';
    spokenResponse = `Đã nâng xạ hương trắng và vanilla lên 30% mỗi loại để tăng độ ấm êm và lưu hương lâu hơn.`;
    analysisSummary = `Tăng Xạ hương trắng và Vanilla lên 30% mỗi loại (tương ứng Mẫu C), giữ Hoa nhài 20% và Đào 20%.`;
    highlightChanges = [
      `Nâng ${base1Name} và ${base2Name} lên 30% mỗi loại giúp lưu hương sâu bền`,
      `Điều chỉnh ${top1Name} và ${heart1Name} về 20% mỗi loại`,
      'Tăng khả năng định hương tự nhiên (fixative)',
    ];
    olfactoryPredictionHypothesis = {
      overallChange:
        'Mùi hương trở nên ấm êm, ngọt dịu và lưu lại bền bỉ trên da suốt nhiều giờ.',
      topStage: `0–15 phút: ${top1Name} vẫn giữ độ mở tươi tắn vừa vặn.`,
      heartStage: `15 phút – 3 giờ: Hương đào quyện chặt với nền xạ hương và vanilla.`,
      baseStage: `Sau 3 giờ: Sắc thái ngọt dịu, sạch sẽ lưu lại bền bỉ.`,
    };
    studentReviewHints = {
      reasonableHint:
        'Trùng khớp với phương án Mẫu C: nâng tầng cuối để tăng độ lưu hương và độ êm dịu.',
      chemistryKnowledgeHint:
        'Xạ hương vòng lớn và vanillin có nhiệt độ sôi cao, áp suất hơi thấp, đóng vai trò chất định hương giúp toàn bộ hệ hương bay hơi chậm rãi.',
      experimentVerificationHint:
        'Đối chiếu độ lưu hương của Mẫu A và Mẫu C trên giấy thử sau 6 giờ và sau 24h–72h.',
    };
  } else if (wantSubtleVariationKeepSignature) {
    proposedPerfumeName = 'Floris — Mùa Xuân Thanh Nhã';
    spokenResponse = `Đã cân bằng công thức để làm nổi bật nét ngọt dịu của hoa nhài và đào mà vẫn giữ trọn linh hồn mùa xuân.`;
    analysisSummary = `Bảo toàn cấu trúc Floris Mùa Xuân: Hoa nhài mở đầu, Đào ở giữa và Xạ hương trắng + Vanilla lắng đọng.`;
    highlightChanges = [
      `Tôn vinh nét thanh thoát của ${top1Name} và ${heart1Name}`,
      `Bảo tồn nền định hương êm ái của ${base1Name} và ${base2Name}`,
      'Tổng tỉ lệ phối trộn đạt đúng 100%',
    ];
    olfactoryPredictionHypothesis = {
      overallChange:
        'Mùi hương giữ trọn vẹn bản sắc trong trẻo của Floris với điểm nhấn hoa quả mùa xuân tươi mới.',
      topStage: `0–20 phút: Hương hoa nhài thanh khiết mở lối.`,
      heartStage: `20 phút – 3 giờ: Nét ngọt dịu của đào bung tỏa tự nhiên.`,
      baseStage: 'Sau 3 giờ: Nền xạ hương và vani lưu lại ấm áp, khó quên.',
    };
    studentReviewHints = {
      reasonableHint:
        'Giữ vững tỉ lệ các tầng hương giúp bảo toàn chữ ký mùi hương đặc trưng của nhóm.',
      chemistryKnowledgeHint:
        'Đường cong bay hơi phân đoạn được duy trì liên tục và mượt mà.',
      experimentVerificationHint:
        'Thử nghiệm cảm quan so sánh để đánh giá độ hài hòa của các nốt hương.',
    };
  } else {
    spokenResponse = `Đã điều chỉnh công thức nước hoa Floris theo yêu cầu của bạn, đảm bảo tổng tỉ lệ đạt chuẩn 100%.`;
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
      olfactoryPredictionHypothesis,
      studentReviewHints,
      highlightChanges,
      adjustedIngredients: rawAdjusted,
    },
    ingredients,
    totalVolume,
    concentrationPercent
  );
}

async function startServer() {
  app.get(['/Floris', '/Floris/*'], (req: Request, res: Response) => {
    const target = req.url.replace(/^\/Floris\/?/, '/') || '/';
    res.redirect(302, target);
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
