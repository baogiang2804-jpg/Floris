import { safeRequestTranscribeDetailed } from './aiPerfumeEngine';

export interface SpeechLanguageOption {
  code: string;
  label: string;
  shortLabel: string;
}

export const SPEECH_LANGUAGE_OPTIONS: SpeechLanguageOption[] = [
  { code: 'auto', label: '🌐 Tự động (Tất cả ngôn ngữ · AI)', shortLabel: '🌐 Mọi ngôn ngữ' },
  { code: 'vi-VN', label: '🇻🇳 Tiếng Việt', shortLabel: '🇻🇳 VI' },
  { code: 'en-US', label: '🇺🇸 English', shortLabel: '🇺🇸 EN' },
  { code: 'fr-FR', label: '🇫🇷 Français', shortLabel: '🇫🇷 FR' },
  { code: 'ja-JP', label: '🇯🇵 日本語', shortLabel: '🇯🇵 JA' },
  { code: 'ko-KR', label: '🇰🇷 한국어', shortLabel: '🇰🇷 KO' },
  { code: 'zh-CN', label: '🇨🇳 中文', shortLabel: '🇨🇳 ZH' },
  { code: 'es-ES', label: '🇪🇸 Español', shortLabel: '🇪🇸 ES' },
  { code: 'de-DE', label: '🇩🇪 Deutsch', shortLabel: '🇩🇪 DE' },
];

export function cleanAudioMimeType(mimeType?: string): string {
  const raw = (mimeType || '').split(';')[0].trim().toLowerCase();
  if (!raw || !raw.startsWith('audio/')) {
    return 'audio/webm';
  }
  return raw;
}

export function pickSupportedRecorderMimeType(): string {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
    return 'audio/webm';
  }
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
    'audio/wav',
  ];
  for (const type of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    } catch {
      // continue
    }
  }
  return 'audio/webm';
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
 * Hybrid multilingual voice recognizer:
 * 1) Records microphone audio via MediaRecorder and transcribes via server Gemini AI (/api/perfume/transcribe),
 *    which natively detects and transcribes ALL languages (Vietnamese, English, French, Japanese, Korean, Chinese, etc.).
 * 2) Runs browser SpeechRecognition alongside (or as fallback when getUserMedia is unavailable) for live preview.
 * 3) Always delivers editable text via onTranscriptUpdate without auto-submitting formulas.
 */
export function createMultilingualVoiceSession(
  callbacks: MultilingualVoiceCallbacks
): MultilingualVoiceController {
  let mediaRecorder: MediaRecorder | null = null;
  let micStream: MediaStream | null = null;
  let audioCtx: AudioContext | null = null;
  let animFrame: number | null = null;
  let recognition: any = null;
  let audioChunks: Blob[] = [];
  let liveBrowserTranscript = '';
  let stoppedManually = false;
  let finishedCalled = false;

  const finishOnce = () => {
    if (finishedCalled) return;
    finishedCalled = true;
    callbacks.onFinish?.();
  };

  const cleanupAudioAnalyser = () => {
    if (animFrame !== null) {
      cancelAnimationFrame(animFrame);
      animFrame = null;
    }
    if (micStream) {
      micStream.getTracks().forEach((t) => t.stop());
      micStream = null;
    }
    if (audioCtx && audioCtx.state !== 'closed') {
      audioCtx.close().catch(() => {});
      audioCtx = null;
    }
    callbacks.onVolumeChange?.(0);
  };

  const startLiveSpeechPreview = () => {
    const SpeechRecognitionAPI =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognitionAPI) return false;

    try {
      const rec = new SpeechRecognitionAPI();
      // In 'auto' mode, if browser language is known use it only for live preview; AI server handles all languages on stop
      if (callbacks.language && callbacks.language !== 'auto') {
        rec.lang = callbacks.language;
      } else if (typeof navigator !== 'undefined' && navigator.language) {
        rec.lang = navigator.language;
      }
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onresult = (event: any) => {
        const text = Array.from(event.results || [])
          .map((r: any) => r?.[0]?.transcript || '')
          .join('')
          .trim();
        if (text) {
          liveBrowserTranscript = text;
          // Show live preview immediately when not relying solely on final AI transcription
          callbacks.onTranscriptUpdate(text, false);
        }
      };

      rec.onerror = () => {
        // Ignore preview errors when MediaRecorder AI transcription is active
        if (!mediaRecorder) {
          callbacks.onError('Không nhận diện được giọng nói. Hãy thử nói lại hoặc nhập văn bản.');
          finishOnce();
        }
      };

      rec.onend = () => {
        if (!mediaRecorder) {
          if (liveBrowserTranscript) {
            callbacks.onTranscriptUpdate(liveBrowserTranscript, true);
          }
          callbacks.onStatus('Đã ghi nhận — bạn có thể kiểm tra và chỉnh sửa trước khi gửi.');
          finishOnce();
        }
      };

      recognition = rec;
      rec.start();
      return true;
    } catch {
      return false;
    }
  };

  return {
    start: async () => {
      stoppedManually = false;
      finishedCalled = false;
      liveBrowserTranscript = '';
      audioChunks = [];

      const hasMediaDevices =
        typeof navigator !== 'undefined' &&
        navigator.mediaDevices &&
        typeof navigator.mediaDevices.getUserMedia === 'function' &&
        typeof MediaRecorder !== 'undefined';

      if (hasMediaDevices) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          micStream = stream;

          // Optional live volume meter
          if (callbacks.onVolumeChange) {
            try {
              const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
              audioCtx = new AudioCtx();
              const analyser = audioCtx.createAnalyser();
              analyser.fftSize = 256;
              const src = audioCtx.createMediaStreamSource(stream);
              src.connect(analyser);
              const dataArray = new Uint8Array(analyser.frequencyBinCount);
              const tick = () => {
                if (!audioCtx || audioCtx.state === 'closed') return;
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
                callbacks.onVolumeChange?.(Math.min(1, sum / dataArray.length / 80));
                animFrame = requestAnimationFrame(tick);
              };
              tick();
            } catch {
              // ignore analyser failure
            }
          }

          const mimeType = pickSupportedRecorderMimeType();
          const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
          mediaRecorder = recorder;

          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              audioChunks.push(e.data);
            }
          };

          recorder.onstop = async () => {
            if (recognition) {
              try {
                recognition.stop();
              } catch {}
            }
            cleanupAudioAnalyser();

            const cleanMime = cleanAudioMimeType(recorder.mimeType || mimeType);
            const blob = new Blob(audioChunks, { type: cleanMime });

            if (blob.size > 0) {
              callbacks.onStatus('AI đang nhận diện giọng nói (đa ngôn ngữ)...');
              const res = await safeRequestTranscribeDetailed(blob, callbacks.language);
              if (res.transcript) {
                callbacks.onTranscriptUpdate(res.transcript, true);
                callbacks.onStatus(
                  'Đã nhận diện xong — bạn có thể kiểm tra hoặc chỉnh sửa câu chữ trước khi gửi.'
                );
                finishOnce();
                return;
              }
            }

            if (liveBrowserTranscript) {
              callbacks.onTranscriptUpdate(liveBrowserTranscript, true);
              callbacks.onStatus(
                'Đã ghi nhận từ trình duyệt — bạn có thể chỉnh sửa câu chữ trước khi gửi.'
              );
            } else {
              callbacks.onStatus('Chưa nghe rõ âm thanh. Hãy thử nói lại hoặc nhập trực tiếp.');
            }
            finishOnce();
          };

          recorder.start();
          startLiveSpeechPreview();
          callbacks.onStatus(
            callbacks.language === 'auto'
              ? '🎙️ Đang nghe mọi ngôn ngữ (AI)... Bấm dừng khi nói xong.'
              : '🎙️ Đang nghe... Bấm dừng khi nói xong.'
          );
          return true;
        } catch {
          cleanupAudioAnalyser();
          mediaRecorder = null;
        }
      }

      // Fallback to browser SpeechRecognition if MediaRecorder/microphone stream is unavailable
      const started = startLiveSpeechPreview();
      if (started) {
        callbacks.onStatus('🎙️ Đang nghe qua trình duyệt... Nói xong sẽ đưa vào ô chỉnh sửa.');
        return true;
      }

      callbacks.onError('Trình duyệt không hỗ trợ ghi âm hoặc micro chưa được cấp quyền.');
      finishOnce();
      return false;
    },

    stop: () => {
      if (stoppedManually) return;
      stoppedManually = true;
      if (recognition) {
        try {
          recognition.stop();
        } catch {}
      }
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        try {
          mediaRecorder.stop();
        } catch {
          cleanupAudioAnalyser();
          finishOnce();
        }
      } else {
        cleanupAudioAnalyser();
        finishOnce();
      }
    },
  };
}
