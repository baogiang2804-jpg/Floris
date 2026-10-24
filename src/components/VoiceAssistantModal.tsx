import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  X,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Check,
  GitCompare,
  AudioWaveform,
  BrainCircuit,
  BookmarkPlus,
  Radio,
  Square,
  Flame,
  RotateCcw,
} from 'lucide-react';
import { CalculatedIngredient, FormulaSlot } from '../utils/perfumeCalculations';
import {
  safeRequestPerfumeAdjustment,
  safeRequestTTS,
  speakWithBrowserSynthesis,
} from '../utils/aiPerfumeEngine';

interface ComparisonItem {
  slotKey: FormulaSlot['key'];
  tier: 'top' | 'heart' | 'base';
  tierLabel: string;
  id: string;
  name: string;
  scentFamily: string;
  oldPercentage: number;
  newPercentage: number;
  deltaPercentage: number;
  oldVolumeMl: number;
  newVolumeMl: number;
  oldDrops: number;
  newDrops: number;
  reason: string;
}

interface AIAdjustmentResult {
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
  source?: string;
}

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  seasonLabel: string;
  totalVolume: number;
  concentrationName: string;
  concentrationPercent: number;
  calculatedIngredients: CalculatedIngredient[];
  tierTotals: { top: number; heart: number; base: number };
  onApplyAdjustedFormula: (
    adjustedItems: { slotKey: FormulaSlot['key']; newPercentage: number }[],
    proposedName?: string,
    summaryNote?: string
  ) => void;
  onSaveProposedToDrawer: (
    adjustedItems: { slotKey: FormulaSlot['key']; newPercentage: number }[],
    proposedName: string,
    note: string
  ) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  seasonLabel,
  totalVolume,
  concentrationName,
  concentrationPercent,
  calculatedIngredients,
  tierTotals,
  onApplyAdjustedFormula,
  onSaveProposedToDrawer,
}) => {
  const [userRequest, setUserRequest] = useState<string>('');
  const [interimText, setInterimText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [audioVolume, setAudioVolume] = useState<number>(0);
  const [voiceStatusText, setVoiceStatusText] = useState<string>('Sẵn sàng tương tác giọng nói trực tiếp cùng Gemini Live');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [adjustmentResult, setAdjustmentResult] = useState<AIAdjustmentResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-speak Vietnamese voice enabled by default (per user confirmation)
  const [autoSpeak, setAutoSpeak] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const silenceTimerRef = useRef<any>(null);
  const lastTranscriptRef = useRef<string>('');

  const stopSpeaking = useCallback(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const stopAudioAnalyser = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioVolume(0);
  };

  const startAudioAnalyser = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(1, avg / 80);
        setAudioVolume(normalized);

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch {
      // Audio stream analysis not critical, speech recognition will still work
    }
  };

  // Read responses with Gemini Live voice, with seamless Vietnamese browser speech fallback
  const speakResponseText = useCallback(
    async (textToSpeak: string) => {
      if (!textToSpeak) return;
      stopSpeaking();
      setIsSpeaking(true);
      setVoiceStatusText('Đang tải giọng phản hồi...');

      try {
        const ttsResult = await safeRequestTTS(textToSpeak);
        if (ttsResult.audioBase64) {
          const audio = new Audio(`data:${ttsResult.mimeType || 'audio/wav'};base64,${ttsResult.audioBase64}`);
          audioPlayerRef.current = audio;
          setVoiceStatusText('Giọng nói AI đang phản hồi...');
          audio.onended = () => {
            setIsSpeaking(false);
            setVoiceStatusText('Đã đọc xong phản hồi.');
          };
          audio.onerror = () => {
            speakWithBrowserSynthesis(textToSpeak, () => {
              setIsSpeaking(false);
              setVoiceStatusText('Đã đọc xong phản hồi.');
            });
          };
          await audio.play();
          return;
        }

        // Fallback to browser synthesis
        speakWithBrowserSynthesis(textToSpeak, () => {
          setIsSpeaking(false);
          setVoiceStatusText('Đã đọc xong phản hồi.');
        });
      } catch {
        speakWithBrowserSynthesis(textToSpeak, () => {
          setIsSpeaking(false);
          setVoiceStatusText('Đã đọc xong phản hồi.');
        });
      }
    },
    [stopSpeaking]
  );

  // Close & clean up
  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
      stopAudioAnalyser();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      setInterimText('');
      lastTranscriptRef.current = '';
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    }
  }, [isOpen, stopSpeaking]);

  const handleAnalyzeVoiceRequest = useCallback(
    async (overrideText?: string) => {
      const promptToUse = (
        overrideText !== undefined
          ? overrideText
          : (lastTranscriptRef.current || userRequest || interimText)
      ).trim();

      if (!promptToUse) {
        setErrorMsg('Hãy nhấn nút Micro để nói hoặc chọn một câu mẫu trước khi gửi!');
        return;
      }

      setUserRequest(promptToUse);
      lastTranscriptRef.current = promptToUse;

      // Stop listening while analyzing
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      stopAudioAnalyser();

      setErrorMsg(null);
      setIsAnalyzing(true);
      setAppliedSuccess(false);
      setSavedSuccess(false);
      stopSpeaking();
      setVoiceStatusText('AI đang phân tích mùi hương và tính toán tỉ lệ tối ưu...');

      try {
        const data = await safeRequestPerfumeAdjustment({
          userRequest: promptToUse,
          seasonLabel,
          totalVolume,
          concentrationName,
          concentrationPercent,
          ingredients: calculatedIngredients,
          tierTotals,
        });

        setAdjustmentResult(data);
        setVoiceStatusText('Đã có đề xuất mới! Tự động phát âm thanh giải thích...');

        if (autoSpeak && data.spokenResponse) {
          speakResponseText(data.spokenResponse);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Có lỗi khi kết nối AI.');
        setVoiceStatusText('Đã xảy ra lỗi, vui lòng thử lại.');
      } finally {
        setIsAnalyzing(false);
      }
    },
    [
      userRequest,
      interimText,
      seasonLabel,
      totalVolume,
      concentrationName,
      concentrationPercent,
      calculatedIngredients,
      tierTotals,
      autoSpeak,
      speakResponseText,
      stopSpeaking,
    ]
  );

  // Micro interaction:
  // 1. Chạm lần 1: AI lắng nghe giọng nói.
  // 2. Chạm lần 2: Dừng lắng nghe, AI lập tức phân tích và trả lời qua giọng nói.
  const handleToggleVoiceInput = async () => {
    if (isListening) {
      // User tapped mic a second time: Stop listening & immediately analyze!
      setIsListening(false);
      stopAudioAnalyser();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }

      const spokenQuery = (lastTranscriptRef.current || userRequest || interimText || '').trim();
      if (spokenQuery) {
        setVoiceStatusText('Đã nhận diện câu nói! AI đang phân tích và chuẩn bị trả lời...');
        handleAnalyzeVoiceRequest(spokenQuery);
      } else {
        const defaultPrompt = 'Tôi muốn mùi hoa nhài ở đầu thanh thoát và tươi mát hơn.';
        setUserRequest(defaultPrompt);
        setVoiceStatusText('Đã ghi nhận, AI tự động phân tích theo gợi ý mùi hương tươi mát...');
        handleAnalyzeVoiceRequest(defaultPrompt);
      }
      return;
    }

    // First tap: Start listening
    setErrorMsg(null);
    stopSpeaking();
    setInterimText('');
    lastTranscriptRef.current = '';

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      try {
        const recognition = new SpeechRecognitionAPI();
        recognition.lang = 'vi-VN';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
          setVoiceStatusText('🎙️ Đang lắng nghe... Hãy nói yêu cầu của bạn, chạm lại vào mic khi xong để AI phân tích!');
          startAudioAnalyser();
        };

        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          let currentInterim = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              currentInterim += transcript;
            }
          }

          if (finalTranscript) {
            setUserRequest((prev) => {
              const updated = prev ? `${prev} ${finalTranscript}` : finalTranscript;
              lastTranscriptRef.current = updated;
              return updated;
            });
            setInterimText('');
          } else {
            setInterimText(currentInterim);
            if (currentInterim) {
              lastTranscriptRef.current = (userRequest ? `${userRequest} ${currentInterim}` : currentInterim).trim();
            }
          }

          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            const combined = (lastTranscriptRef.current || userRequest || currentInterim).trim();
            if (combined.length > 8 && !isAnalyzing) {
              setVoiceStatusText('Đã nhận diện: "' + combined + '" — Chạm mic lần nữa để AI trả lời ngay!');
            }
          }, 3500);
        };

        recognition.onerror = (err: any) => {
          if (err.error !== 'no-speech') {
            setIsListening(false);
            stopAudioAnalyser();
            setVoiceStatusText('Không nhận được giọng nói, bạn có thể chạm lại mic hoặc bấm câu mẫu bên dưới.');
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          stopAudioAnalyser();
        };

        recognitionRef.current = recognition;
        recognition.start();
        return;
      } catch {
        // Fallback
      }
    }

    // Fallback if browser SpeechRecognition is blocked
    setErrorMsg('Trình duyệt chưa cấp quyền Micro hoặc không hỗ trợ Web Speech API. Bạn có thể chọn câu hỏi mẫu nhanh bên dưới.');
  };

  const voicePrompts = [
    'Tôi muốn mùi hoa nhài ở đầu thanh thoát và tươi mát hơn.',
    'Tôi muốn hương thơm quả đào ở tầng giữa ngọt dịu và mọng nước hơn.',
    'Làm sao để công thức này lưu hương lâu và ấm áp hơn với xạ hương trắng và vanilla?',
    'Tôi muốn một mùi hương nhẹ nhàng, trong trẻo tự nhiên chuẩn phong cách Floris.',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#2D3A2F]/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-[#FAF8F5] border-t sm:border border-[#E5DFD5] rounded-t-3xl sm:rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[92vh] text-[#2D3A2F]">
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 rounded-full bg-[#D8D1C5] mx-auto mt-2.5 mb-1 sm:hidden" />

        {/* Modal Header */}
        <div className="p-3.5 sm:p-6 border-b border-[#E8E1D5] bg-[#FFFFFF] flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-3.5">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-[#EEF5F0] border border-[#CFE2D4] flex items-center justify-center shadow-xs">
                <Radio className="w-6 h-6 text-[#3B7A57] animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#10B981] border-2 border-white ring-2 ring-[#10B981]/30 animate-ping" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EEF5F0] text-[#2D5E41] border border-[#CFE2D4] font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#3B7A57]" />
                  Gemini Live
                </span>
                <span className="text-xs text-[#6B7C70] font-sans">
                  Tương tác giọng nói trực tiếp & Phản hồi tiếng Việt
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-serif font-bold text-[#1F2F23] mt-0.5">
                Trợ Lý Giọng Nói Gemini Live • Điều Chỉnh Hương Tự Nhiên
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#F4EFE6] hover:bg-[#EAE3D6] text-[#5A685F] hover:text-[#1F2F23] flex items-center justify-center transition-all border border-[#E3DBD0]"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Active Formula Context Badge */}
          <div className="px-4 py-2.5 rounded-2xl bg-[#EEF5F0]/80 border border-[#CFE2D4] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#2D5E41] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#3B7A57]" />
              <span>Đang kết nối công thức: <strong className="text-[#1F2F23]">{seasonLabel}</strong> ({totalVolume} mL • {concentrationName} {concentrationPercent}%)</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-[#526857]">
              <span>Đầu: {tierTotals.top}%</span>
              <span>·</span>
              <span>Giữa: {tierTotals.heart}%</span>
              <span>·</span>
              <span>Cuối: {tierTotals.base}%</span>
            </div>
          </div>

          {/* Gemini Live Interactive Orb Centerpiece */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#FFFFFF] to-[#F5F1E8] border border-[#E5DFD5] flex flex-col items-center text-center shadow-sm relative overflow-hidden">
            {/* Background ambient glow */}
            <div
              className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-gradient-to-br from-[#3B7A57]/15 to-[#D49A3D]/15 blur-3xl pointer-events-none transition-all duration-700"
              style={{
                transform: `translateX(-50%) scale(${1 + audioVolume * 0.8})`,
                opacity: isListening || isSpeaking ? 0.9 : 0.35,
              }}
            />

            {/* Central Live Visualizer Orb */}
            <div className="relative mb-5 flex items-center justify-center">
              {/* Pulsing rings when listening */}
              {isListening && (
                <>
                  <div
                    className="absolute w-36 h-36 rounded-full border border-[#3B7A57]/30 animate-ping opacity-60"
                    style={{ animationDuration: '2s' }}
                  />
                  <div
                    className="absolute w-44 h-44 rounded-full border border-[#10B981]/20 animate-ping opacity-40"
                    style={{ animationDuration: '3s' }}
                  />
                </>
              )}

              {/* Glowing Orb */}
              <button
                type="button"
                onClick={handleToggleVoiceInput}
                disabled={isAnalyzing}
                style={{
                  transform: `scale(${1 + audioVolume * 0.35})`,
                  transition: 'transform 0.1s ease-out',
                }}
                className={`relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center shadow-xl cursor-pointer transition-all ${
                  isListening
                    ? 'bg-gradient-to-tr from-[#2D6344] via-[#10B981] to-[#38BDF8] text-white ring-8 ring-[#10B981]/30 shadow-emerald-700/25'
                    : isSpeaking
                    ? 'bg-gradient-to-tr from-[#D49A3D] via-[#F59E0B] to-[#3B7A57] text-white ring-8 ring-[#F59E0B]/30 animate-pulse'
                    : 'bg-gradient-to-tr from-[#3B7A57] via-[#4A8F67] to-[#E2A03F] text-white hover:scale-105 hover:shadow-2xl ring-4 ring-[#3B7A57]/20'
                }`}
                title={isListening ? 'Chạm lại để dừng nghe và AI sẽ phân tích trả lời ngay' : 'Chạm để AI lắng nghe giọng nói của bạn'}
              >
                {isAnalyzing ? (
                  <Loader2 className="w-10 h-10 animate-spin text-white" />
                ) : isSpeaking ? (
                  <Volume2 className="w-10 h-10 text-white animate-bounce" />
                ) : isListening ? (
                  <Mic className="w-10 h-10 text-white animate-pulse" />
                ) : (
                  <Mic className="w-10 h-10 text-white" />
                )}
                <span className="text-[10px] font-mono tracking-wider font-bold mt-1 text-white/90">
                  {isListening ? 'CHẠM TRẢ LỜI' : isSpeaking ? 'SPEAKING' : 'CHẠM ĐỂ NÓI'}
                </span>
              </button>
            </div>

            {/* Audio Wave Bars (Active during speech or speaking) */}
            <div className="h-8 flex items-center justify-center gap-1.5 mb-3">
              {[0.4, 0.7, 1.0, 0.8, 0.5, 0.9, 0.6, 0.85, 0.45, 0.75].map((heightRatio, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-100 ${
                    isListening
                      ? 'bg-[#10B981]'
                      : isSpeaking
                      ? 'bg-[#D49A3D]'
                      : 'bg-[#D1DFD6]'
                  }`}
                  style={{
                    height: isListening
                      ? `${Math.max(6, Math.min(32, heightRatio * 32 * (audioVolume * 2 + 0.3)))}px`
                      : isSpeaking
                      ? `${Math.max(6, Math.sin((Date.now() / 200) + i) * 14 + 16)}px`
                      : '6px',
                  }}
                />
              ))}
            </div>

            {/* Live Status text */}
            <div className="max-w-lg">
              <h3 className="text-sm sm:text-base font-bold text-[#1F2F23]">
                {isListening
                  ? 'Gemini Live đang lắng nghe... Bạn có thể nói tự nhiên bằng tiếng Việt'
                  : isSpeaking
                  ? 'Gemini Live đang phản hồi bằng giọng nói tiếng Việt'
                  : isAnalyzing
                  ? 'Đang xử lý phân tích và mô phỏng hóa học hương...'
                  : 'Nhấn vào biểu tượng Micro để trải nghiệm Gemini Live tương tác giọng nói'}
              </h3>
              <p className="text-xs text-[#5E7063] mt-1 font-medium">
                {voiceStatusText}
              </p>
            </div>

            {/* Live Realtime Transcript Box */}
            <div className="w-full max-w-2xl mt-5 text-left space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-semibold text-[#3D4F42] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#3B7A57]" />
                  Lời bạn nói (nhận diện thời gian thực):
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (isSpeaking) stopSpeaking();
                    setAutoSpeak(!autoSpeak);
                  }}
                  className={`text-[11px] px-3 py-1 rounded-full border flex items-center gap-1.5 font-medium transition-colors ${
                    autoSpeak
                      ? 'bg-[#EEF5F0] text-[#245437] border-[#CFE2D4]'
                      : 'bg-[#F5F2EB] text-[#717E75] border-[#E2DBD0]'
                  }`}
                >
                  {autoSpeak ? <Volume2 className="w-3.5 h-3.5 text-[#3B7A57]" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span>Giọng phản hồi Gemini Live: {autoSpeak ? 'BẬT' : 'TẮT'}</span>
                </button>
              </div>

              <div className="relative">
                <textarea
                  rows={2}
                  value={userRequest + (interimText ? ` [${interimText}...]` : '')}
                  onChange={(e) => {
                    setUserRequest(e.target.value);
                    setInterimText('');
                  }}
                  placeholder="Nói vào micro hoặc gõ yêu cầu điều chỉnh... (Ví dụ: Tôi muốn mùi cam Bergamot nổi bật và thơm mát hơn cho mùa hè)"
                  className="w-full p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#DCD5C9] focus:border-[#3B7A57] focus:ring-2 focus:ring-[#3B7A57]/20 text-xs sm:text-sm text-[#1F2F23] placeholder:text-[#8E9B91] focus:outline-none shadow-inner"
                />

                <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
                  {userRequest && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserRequest('');
                        setInterimText('');
                      }}
                      className="p-1.5 rounded-lg text-[#8E9B91] hover:text-[#1F2F23] hover:bg-[#F0EBE1] transition-colors"
                      title="Xóa văn bản"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleAnalyzeVoiceRequest()}
                    disabled={isAnalyzing || (!userRequest && !interimText)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2D6344] to-[#3B7A57] hover:from-[#245237] hover:to-[#2D6344] text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-40 transition-all"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Phân tích</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div className="w-full max-w-2xl text-left space-y-1.5 mt-4">
              <span className="text-[11px] font-mono text-[#6A7B6E] font-medium flex items-center gap-1">
                <Flame className="w-3 h-3 text-[#D49A3D]" />
                Hoặc chạm để thử ngay các câu hỏi thực nghiệm mẫu:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {voicePrompts.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAnalyzeVoiceRequest(q)}
                    disabled={isAnalyzing}
                    className="p-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F2ECE1] border border-[#E5DFD5] hover:border-[#3B7A57]/50 text-left text-xs text-[#3A4B3E] transition-all line-clamp-2 italic shadow-xs group flex items-start gap-2"
                  >
                    <span className="text-[#3B7A57] group-hover:translate-x-0.5 transition-transform mt-0.5">›</span>
                    <span>“{q}”</span>
                  </button>
                ))}
              </div>
            </div>

            {errorMsg && (
              <div className="w-full max-w-2xl p-3 mt-3 rounded-xl bg-[#FDF2F2] border border-[#F5C2C7] text-xs text-[#9B2C2C]">
                {errorMsg}
              </div>
            )}
          </div>

          {/* Gemini Live Response & AI Adjustment Details */}
          {adjustmentResult && (
            <div className="space-y-4 animate-fadeIn">
              {/* Spoken Response Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#EEF5F0] via-[#FAF6EE] to-[#EEF5F0] border border-[#CFE2D4] shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-bold text-[#235336] flex items-center gap-2">
                    <Volume2 className={`w-4 h-4 text-[#3B7A57] ${isSpeaking ? 'animate-bounce' : ''}`} />
                    Phản hồi giọng nói Gemini Live:
                  </span>

                  <div className="flex items-center gap-2">
                    {isSpeaking && (
                      <button
                        type="button"
                        onClick={stopSpeaking}
                        className="px-3 py-1 rounded-lg bg-[#FBEAEB] hover:bg-[#F7D3D6] text-[#9B2C2C] border border-[#F5C2C7] text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <Square className="w-3 h-3 fill-current" />
                        <span>Ngắt lời (Interrupt)</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        isSpeaking
                          ? stopSpeaking()
                          : speakResponseText(adjustmentResult.spokenResponse)
                      }
                      className="px-3 py-1 rounded-lg bg-[#FFFFFF] hover:bg-[#F5F1E8] text-[#2D5E41] border border-[#CFE2D4] text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-[#3B7A57]" />
                      <span>{isSpeaking ? 'Đang đọc (Gemini Live)...' : '🔊 Nghe lại giọng Gemini Live'}</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#1F2F23] italic leading-relaxed bg-[#FFFFFF]/80 p-3 rounded-xl border border-[#E3DBD0]">
                  “{adjustmentResult.spokenResponse}”
                </p>
              </div>

              {/* Proposed Formula Comparison Table */}
              <div className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl overflow-hidden shadow-xs">
                <div className="p-4 border-b border-[#E8E1D5] bg-[#F8F5EE] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <GitCompare className="w-4 h-4 text-[#3B7A57]" />
                    <div>
                      <span className="text-xs font-mono uppercase tracking-wider text-[#6B7C70] block font-semibold">
                        Công thức đề xuất
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-[#1F2F23]">
                        {adjustmentResult.proposedPerfumeName}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onSaveProposedToDrawer(
                          adjustmentResult.comparisonItems.map((i) => ({
                            slotKey: i.slotKey,
                            newPercentage: i.newPercentage,
                          })),
                          `${adjustmentResult.proposedPerfumeName} (Gemini Live)`,
                          `Giọng nói: "${userRequest}"`
                        );
                        setSavedSuccess(true);
                        setTimeout(() => setSavedSuccess(false), 3000);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F0EBE1] text-[#3D4E41] border border-[#E0D8CB] text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      {savedSuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#10B981]" />
                          <span>Đã lưu!</span>
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="w-3.5 h-3.5 text-[#3B7A57]" />
                          <span>Lưu so sánh</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onApplyAdjustedFormula(
                          adjustmentResult.comparisonItems.map((i) => ({
                            slotKey: i.slotKey,
                            newPercentage: i.newPercentage,
                          })),
                          adjustmentResult.proposedPerfumeName,
                          userRequest
                        );
                        setAppliedSuccess(true);
                        setTimeout(() => setAppliedSuccess(false), 3000);
                      }}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#2D6344] to-[#3B7A57] hover:from-[#245237] hover:to-[#2D6344] text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                    >
                      {appliedSuccess ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Đã áp dụng vào Tháp hương!</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Áp dụng ngay vào Tháp hương</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#FAF8F5] border-b border-[#E8E1D5] text-[11px] font-mono text-[#6A7B6E] uppercase">
                        <th className="py-2.5 px-3">Tầng hương</th>
                        <th className="py-2.5 px-3">Nguyên liệu</th>
                        <th className="py-2.5 px-3 text-center">Tỉ lệ gốc</th>
                        <th className="py-2.5 px-3 text-center bg-[#EEF5F0] text-[#245236] font-bold">
                          Tỉ lệ đề xuất mới
                        </th>
                        <th className="py-2.5 px-3 text-center">Chênh lệch</th>
                        <th className="py-2.5 px-3">Cơ sở hóa học & khứu giác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFE9DF]">
                      {adjustmentResult.comparisonItems.map((item) => (
                        <tr key={item.slotKey} className="hover:bg-[#FAF8F5]/80 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-[11px] text-[#6A7B6E]">
                            {item.tierLabel}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-[#1F2F23]">{item.name}</td>
                          <td className="py-2.5 px-3 text-center font-mono text-[#58685B]">
                            {item.oldPercentage}% ({item.oldVolumeMl}mL)
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-[#1F2F23] bg-[#EEF5F0]/60">
                            {item.newPercentage}% ({item.newVolumeMl}mL)
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono">
                            {item.deltaPercentage > 0 ? (
                              <span className="text-[#10B981] font-bold">+{item.deltaPercentage}%</span>
                            ) : item.deltaPercentage < 0 ? (
                              <span className="text-[#DC2626] font-bold">{item.deltaPercentage}%</span>
                            ) : (
                              <span className="text-[#8E9B91]">0%</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-[#4A5B4E]">{item.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Chemical Hypothesis note */}
                {adjustmentResult.olfactoryPredictionHypothesis && (
                  <div className="p-3.5 bg-[#F9F6F0] border-t border-[#E8E1D5] text-xs text-[#526355] flex items-start gap-2">
                    <BrainCircuit className="w-4 h-4 text-[#3B7A57] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#1F2F23]">Giả thuyết bay hơi khứu giác: </strong>
                      <span>{adjustmentResult.olfactoryPredictionHypothesis.overallChange}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E8E1D5] bg-[#FFFFFF] flex items-center justify-between text-xs text-[#6B7C70]">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[#3B7A57]" />
            Gemini Live Voice Engine • Tổ 1 Lớp 12A13 THPT NTMK
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE1] text-[#2D3A2F] border border-[#E0D8CB] text-xs font-medium transition-colors"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
