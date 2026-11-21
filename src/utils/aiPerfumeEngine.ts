import { CalculatedIngredient } from './perfumeCalculations';
import {
  AIAdjustmentResult,
  ComparisonItem,
  PrecisionFormulaEntry,
  PrecisionOnlyResult,
  normalizeAdjustmentOutput,
  generateLocalAdjustment,
  enforceClientFormulaIntegrity,
  sanitizeStandalonePrecisionResponse,
} from './precisionFormulaAdjuster';

export type {
  AIAdjustmentResult,
  ComparisonItem,
  PrecisionFormulaEntry,
  PrecisionOnlyResult,
};
export {
  normalizeAdjustmentOutput,
  generateLocalAdjustment,
  enforceClientFormulaIntegrity,
  sanitizeStandalonePrecisionResponse,
};

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
          if (Array.isArray(parsed.comparisonItems)) {
            const merged: AIAdjustmentResult = {
              ...fallback,
              ...parsed,
              isUnchanged: Boolean(parsed.isUnchanged),
              source: parsed.source || 'gemini_api',
            };
            return enforceClientFormulaIntegrity(
              merged,
              params.ingredients,
              params.userRequest,
              params.totalVolume,
              params.concentrationPercent
            );
          }
          return enforceClientFormulaIntegrity(
            {
              ...fallback,
              ...parsed,
              source: parsed.source || 'gemini_api',
            },
            params.ingredients,
            params.userRequest,
            params.totalVolume,
            params.concentrationPercent
          );
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

// Robust Safe Speech-to-Text / Transcribe (Multilingual AI Audio)
export async function safeRequestTranscribeDetailed(
  audioBlob: Blob,
  languageHint = 'auto'
): Promise<{ transcript: string; modelUsed?: string; error?: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = ((reader.result as string) || '').split(',')[1];
        if (!base64String) {
          resolve({ transcript: '' });
          return;
        }

        const cleanMime = (audioBlob.type || 'audio/webm').split(';')[0].trim() || 'audio/webm';
        const urlsToTry = [getApiUrl('/api/perfume/transcribe'), '/api/perfume/transcribe'];
        for (const url of Array.from(new Set(urlsToTry))) {
          try {
            const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audioBase64: base64String,
                mimeType: cleanMime,
                languageHint,
              }),
            });
            const text = await res.text();
            if (!text.trim().startsWith('<')) {
              const data = JSON.parse(text);
              if (typeof data?.transcript === 'string' && data.transcript.trim()) {
                resolve({
                  transcript: data.transcript.trim(),
                  modelUsed: data.modelUsed,
                });
                return;
              }
              if (data?.error) {
                resolve({ transcript: '', error: data.error });
                return;
              }
            }
          } catch {
            continue;
          }
        }
        resolve({ transcript: '' });
      } catch {
        resolve({ transcript: '' });
      }
    };
    reader.onerror = () => resolve({ transcript: '' });
    reader.readAsDataURL(audioBlob);
  });
}

export async function safeRequestTranscribe(audioBlob: Blob, languageHint = 'auto'): Promise<string> {
  const res = await safeRequestTranscribeDetailed(audioBlob, languageHint);
  return res.transcript;
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
