export interface SpeechLanguageOption {
  code: string;
  label: string;
  shortLabel: string;
}

export const SPEECH_LANGUAGE_OPTIONS: SpeechLanguageOption[] = [
  { code: 'auto', label: '🌐 Tự động (Trình duyệt · Web Speech)', shortLabel: '🌐 Tự động' },
  { code: 'vi-VN', label: '🇻🇳 Tiếng Việt', shortLabel: '🇻🇳 VI' },
  { code: 'en-US', label: '🇺🇸 English', shortLabel: '🇺🇸 EN' },
  { code: 'fr-FR', label: '🇫🇷 Français', shortLabel: '🇫🇷 FR' },
  { code: 'ja-JP', label: '🇯🇵 日本語', shortLabel: '🇯🇵 JA' },
  { code: 'ko-KR', label: '🇰🇷 한국어', shortLabel: '🇰🇷 KO' },
  { code: 'zh-CN', label: '🇨🇳 中文', shortLabel: '🇨🇳 ZH' },
  { code: 'es-ES', label: '🇪🇸 Español', shortLabel: '🇪🇸 ES' },
  { code: 'de-DE', label: '🇩🇪 Deutsch', shortLabel: '🇩🇪 DE' },
];

export function resolveSpeechRecognitionLang(
  language: string,
  navigatorLanguage?: string
): string {
  if (language && language !== 'auto') {
    return language;
  }
  const browserLang =
    navigatorLanguage ??
    (typeof navigator !== 'undefined' ? navigator.language : '');
  return (browserLang || '').trim() || 'vi-VN';
}

export function cleanAudioMimeType(mimeType?: string): string {
  const raw = (mimeType || '').split(';')[0].trim().toLowerCase();
  if (!raw || !raw.startsWith('audio/')) {
    return 'audio/webm';
  }
  return raw;
}

export interface MultilingualVoiceCallbacks {
  language: string;
  onStatus: (status: string) => void;
  onTranscriptUpdate: (text: string, isFinal: boolean) => void;
  onError: (msg: string) => void;
  onVolumeChange?: (volume: number) => void;
  onFinish?: () => void;
}

export interface MultilingualVoiceController {
  start: () => Promise<boolean>;
  stop: () => void;
}

/**
 * Pure client-side Speech-to-Text recognizer using Web Speech API
 * (window.SpeechRecognition || window.webkitSpeechRecognition).
 * Runs 100% in the browser — sends ZERO POST requests to any server,
 * preventing 405 errors on static hosting such as GitHub Pages.
 */
export function createMultilingualVoiceSession(
  callbacks: MultilingualVoiceCallbacks
): MultilingualVoiceController {
  let recognition: any = null;
  let liveTranscript = '';
  let stoppedManually = false;
  let finishedCalled = false;

  const finishOnce = () => {
    if (finishedCalled) return;
    finishedCalled = true;
    callbacks.onVolumeChange?.(0);
    callbacks.onFinish?.();
  };

  return {
    start: async () => {
      stoppedManually = false;
      finishedCalled = false;
      liveTranscript = '';

      const SpeechRecognitionAPI =
        typeof window !== 'undefined'
          ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
          : null;

      if (!SpeechRecognitionAPI) {
        callbacks.onError(
          'Trình duyệt không hỗ trợ nhận diện giọng nói (SpeechRecognition / webkitSpeechRecognition). Hãy dùng Chrome hoặc Edge, hoặc nhập trực tiếp.'
        );
        finishOnce();
        return false;
      }

      try {
        const rec = new SpeechRecognitionAPI();
        rec.lang = resolveSpeechRecognitionLang(callbacks.language);
        rec.interimResults = true;
        rec.continuous = false;
        rec.maxAlternatives = 1;

        rec.onstart = () => {
          callbacks.onVolumeChange?.(0.45);
          callbacks.onStatus('🎙️ Đang nghe trực tiếp trên trình duyệt...');
        };

        rec.onresult = (event: any) => {
          const results = Array.from(event?.results || []);
          const transcript = results
            .map((r: any) => (r?.[0]?.transcript || '').trim())
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

          if (transcript) {
            liveTranscript = transcript;
            const lastResult = results[results.length - 1] as any;
            const isFinal = Boolean(lastResult?.isFinal);
            callbacks.onVolumeChange?.(isFinal ? 0.25 : 0.75);
            callbacks.onTranscriptUpdate(transcript, isFinal);
          }
        };

        rec.onerror = (event: any) => {
          const errCode = event?.error;
          if (errCode === 'aborted' && stoppedManually) {
            return;
          }
          if (errCode === 'no-speech') {
            callbacks.onStatus('Chưa nghe thấy giọng nói. Hãy thử bấm Nói lại hoặc nhập văn bản.');
            finishOnce();
            return;
          }
          if (errCode === 'not-allowed' || errCode === 'service-not-allowed') {
            callbacks.onError('Chưa được cấp quyền micro. Vui lòng cho phép micro trên trình duyệt.');
            finishOnce();
            return;
          }
          if (errCode === 'network') {
            callbacks.onError('Lỗi mạng khi dùng dịch vụ nhận diện giọng nói của trình duyệt.');
            finishOnce();
            return;
          }
          callbacks.onError('Không nhận diện được giọng nói. Hãy thử nói lại hoặc nhập văn bản.');
          finishOnce();
        };

        rec.onend = () => {
          if (liveTranscript) {
            callbacks.onTranscriptUpdate(liveTranscript, true);
          }
          callbacks.onStatus(
            liveTranscript
              ? 'Đã ghi nhận — bạn có thể kiểm tra và chỉnh sửa trước khi gửi.'
              : 'Chưa nghe rõ giọng nói. Hãy thử nói lại hoặc nhập văn bản.'
          );
          finishOnce();
        };

        recognition = rec;
        rec.start();
        return true;
      } catch {
        callbacks.onError('Không thể khởi tạo webkitSpeechRecognition trên trình duyệt này.');
        finishOnce();
        return false;
      }
    },

    stop: () => {
      if (stoppedManually) return;
      stoppedManually = true;
      if (recognition) {
        try {
          recognition.stop();
        } catch {
          finishOnce();
        }
      } else {
        finishOnce();
      }
    },
  };
}
