import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic,
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  X,
  Loader2,
  CheckCircle2,
  Check,
  GitCompare,
  BookmarkPlus,
  Radio,
  Square,
  RotateCcw,
} from 'lucide-react';
import { CalculatedIngredient, FormulaSlot } from '../utils/perfumeCalculations';
import {
  safeRequestPerfumeAdjustment,
  safeRequestTTS,
  speakWithBrowserSynthesis,
} from '../utils/aiPerfumeEngine';
import { SpringAccordion } from './SpringAccordion';

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
  const [voiceStatusText, setVoiceStatusText] = useState<string>('Chạm Micro hoặc chọn gợi ý nhanh');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [adjustmentResult, setAdjustmentResult] = useState<AIAdjustmentResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
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
        const normalized = Math.min(1, sum / bufferLength / 80);
        setAudioVolume(normalized);
        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch {
      // Non-critical fallback
    }
  };

  const speakResponseText = useCallback(
    async (textToSpeak: string) => {
      if (!textToSpeak) return;
      stopSpeaking();
      setIsSpeaking(true);
      setVoiceStatusText('Đang phát giọng phản hồi...');

      try {
        const ttsResult = await safeRequestTTS(textToSpeak);
        if (ttsResult.audioBase64) {
          const audio = new Audio(`data:${ttsResult.mimeType || 'audio/wav'};base64,${ttsResult.audioBase64}`);
          audioPlayerRef.current = audio;
          audio.onended = () => {
            setIsSpeaking(false);
            setVoiceStatusText('Đã phản hồi xong.');
          };
          audio.onerror = () => {
            speakWithBrowserSynthesis(textToSpeak, () => {
              setIsSpeaking(false);
              setVoiceStatusText('Đã phản hồi xong.');
            });
          };
          await audio.play();
          return;
        }

        speakWithBrowserSynthesis(textToSpeak, () => {
          setIsSpeaking(false);
          setVoiceStatusText('Đã phản hồi xong.');
        });
      } catch {
        speakWithBrowserSynthesis(textToSpeak, () => {
          setIsSpeaking(false);
          setVoiceStatusText('Đã phản hồi xong.');
        });
      }
    },
    [stopSpeaking]
  );

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
          : lastTranscriptRef.current || userRequest || interimText
      ).trim();

      if (!promptToUse) {
        setErrorMsg('Hãy nói hoặc chọn 1 gợi ý mẫu bên dưới.');
        return;
      }

      setUserRequest(promptToUse);
      lastTranscriptRef.current = promptToUse;

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
      setVoiceStatusText('AI đang phân tích tỉ lệ...');

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
        setVoiceStatusText('Đã có công thức đề xuất.');

        if (autoSpeak && data.spokenResponse) {
          speakResponseText(data.spokenResponse);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Có lỗi khi kết nối AI.');
        setVoiceStatusText('Vui lòng thử lại.');
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

  const handleToggleVoiceInput = async () => {
    if (isListening) {
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
        handleAnalyzeVoiceRequest(spokenQuery);
      } else {
        const defaultPrompt = 'Tôi muốn mùi hoa nhài ở đầu thanh thoát và tươi mát hơn.';
        setUserRequest(defaultPrompt);
        handleAnalyzeVoiceRequest(defaultPrompt);
      }
      return;
    }

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
          setVoiceStatusText('Đang nghe... Chạm lại mic để phân tích');
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
        };

        recognition.onerror = (err: any) => {
          if (err.error !== 'no-speech') {
            setIsListening(false);
            stopAudioAnalyser();
            setVoiceStatusText('Chạm lại mic hoặc chọn gợi ý mẫu.');
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

    setErrorMsg('Trình duyệt chưa hỗ trợ Micro. Bạn hãy chọn câu gợi ý bên dưới.');
  };

  const voicePrompts = [
    'Tôi muốn mùi hoa nhài ở đầu thanh thoát và tươi mát hơn.',
    'Tôi muốn hương đào ở tầng giữa ngọt dịu hơn.',
    'Tăng độ lưu hương ấm áp với xạ hương trắng và vanilla.',
    'Giữ nét nhẹ nhàng, trong trẻo chuẩn Floris.',
  ];

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Trợ lý giọng nói Gemini Live"
      className="fixed inset-0 z-50 bg-[#2B342D]/45 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-5 overflow-y-auto animate-fadeIn"
    >
      <div className="bg-[#FFFDF8] border-t sm:border-2 border-[#FBCFE8] rounded-t-3xl sm:rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh] text-[#2B342D]">
        <div className="w-12 h-1.5 rounded-full bg-[#F9A8D4] mx-auto mt-2.5 sm:hidden" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#F5DCE4] bg-gradient-to-r from-[#FFF1F5] via-white to-[#ECFDF3] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FCE7F3] border border-[#F9A8D4] flex items-center justify-center">
              <Radio className="w-5 h-5 text-[#EC4899]" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-white text-[#BE185D] border border-[#FBCFE8] font-bold">
                🎙️ Gemini Live
              </span>
              <h2 className="text-base sm:text-xl font-bold text-[#2B342D] mt-0.5">
                Trợ Lý Giọng Nói
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng trợ lý giọng nói"
            className="w-9 h-9 rounded-full bg-white hover:bg-[#FCE7F3] text-[#5C6B5F] hover:text-[#BE185D] flex items-center justify-center border border-[#F3D5E0]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Active Context Pill */}
          <div className="px-4 py-2 rounded-full bg-[#ECFDF3] border border-[#BBF7D0] flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#166534]">
            <span>
              🧴 {seasonLabel} · {totalVolume} mL · {concentrationPercent}%
            </span>
            <span className="font-mono">
              Đầu {tierTotals.top}% · Giữa {tierTotals.heart}% · Cuối {tierTotals.base}%
            </span>
          </div>

          {/* Interactive Orb Centerpiece */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#FFF1F5] via-[#FFFDF8] to-[#ECFDF3]/50 border-2 border-[#FBCFE8] flex flex-col items-center text-center">
            <div className="relative mb-4 flex items-center justify-center">
              {isListening && (
                <div
                  className="absolute w-32 h-32 rounded-full border-2 border-[#4ADE80]/60 animate-ping"
                  style={{ animationDuration: '1.8s' }}
                />
              )}

              <button
                type="button"
                onClick={handleToggleVoiceInput}
                disabled={isAnalyzing}
                style={{
                  transform: `scale(${1 + audioVolume * 0.25})`,
                  transition: 'transform 0.1s ease-out',
                }}
                className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-lg transition-all ${
                  isListening
                    ? 'bg-gradient-to-tr from-[#16A34A] to-[#4ADE80] text-white ring-8 ring-[#BBF7D0]'
                    : isSpeaking
                    ? 'bg-gradient-to-tr from-[#F59E0B] to-[#F472B6] text-white ring-8 ring-[#FEF08A] animate-pulse'
                    : 'bg-gradient-to-tr from-[#EC4899] via-[#F472B6] to-[#FBBF24] text-white hover:scale-105 ring-4 ring-[#FCE7F3]'
                }`}
              >
                {isAnalyzing ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : isSpeaking ? (
                  <Volume2 className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
                <span className="text-[10px] font-mono font-bold mt-1">
                  {isListening ? 'XONG' : isSpeaking ? 'ĐANG ĐỌC' : 'NÓI'}
                </span>
              </button>
            </div>

            <p className="text-xs font-bold text-[#5C6B5F] mb-4">{voiceStatusText}</p>

            {/* Input Box */}
            <div className="w-full max-w-2xl text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2B342D]">Yêu cầu mùi hương</span>
                <button
                  type="button"
                  onClick={() => {
                    if (isSpeaking) stopSpeaking();
                    setAutoSpeak(!autoSpeak);
                  }}
                  className={`text-[11px] px-3 py-1 rounded-full border font-bold flex items-center gap-1 ${
                    autoSpeak
                      ? 'bg-[#ECFDF3] text-[#15803D] border-[#86EFAC]'
                      : 'bg-white text-[#5C6B5F] border-[#F3D5E0]'
                  }`}
                >
                  {autoSpeak ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                  <span>Đọc phản hồi: {autoSpeak ? 'BẬT' : 'TẮT'}</span>
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
                  placeholder="Nói hoặc nhập yêu cầu (VD: Muốn hoa nhài tươi mát hơn)..."
                  className="w-full p-3.5 pr-28 rounded-2xl bg-white border-2 border-[#FBCFE8] focus:border-[#EC4899] text-xs sm:text-sm text-[#2B342D] focus:outline-none"
                />

                <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
                  {userRequest && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserRequest('');
                        setInterimText('');
                      }}
                      aria-label="Xóa nội dung"
                      className="p-1.5 rounded-xl text-[#5C6B5F] hover:bg-[#FFF5F8]"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleAnalyzeVoiceRequest()}
                    disabled={isAnalyzing || (!userRequest && !interimText)}
                    className="px-3.5 py-2 rounded-xl bg-[#EC4899] hover:bg-[#DB2777] text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-40"
                  >
                    {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Gửi</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
              {voicePrompts.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAnalyzeVoiceRequest(q)}
                  disabled={isAnalyzing}
                  className="p-2.5 rounded-2xl bg-white hover:bg-[#FFF5F8] border border-[#F3D5E0] hover:border-[#F472B6] text-left text-xs font-semibold text-[#2B342D] transition-all"
                >
                  🌸 {q}
                </button>
              ))}
            </div>

            {errorMsg && (
              <div className="w-full max-w-2xl p-3 mt-3 rounded-2xl bg-[#FFF1F2] border border-[#FDA4AF] text-xs font-bold text-[#BE123C]">
                {errorMsg}
              </div>
            )}
          </div>

          {/* Results */}
          {adjustmentResult && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-3xl bg-[#ECFDF3] border-2 border-[#BBF7D0] space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#15803D] flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4" />
                    Phản hồi từ AI
                  </span>
                  <div className="flex items-center gap-2">
                    {isSpeaking && (
                      <button
                        type="button"
                        onClick={stopSpeaking}
                        className="px-3 py-1 rounded-full bg-white text-[#BE123C] border border-[#FDA4AF] text-xs font-bold flex items-center gap-1"
                      >
                        <Square className="w-3 h-3 fill-current" />
                        <span>Dừng</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        isSpeaking
                          ? stopSpeaking()
                          : speakResponseText(adjustmentResult.spokenResponse)
                      }
                      className="px-3 py-1 rounded-full bg-white text-[#15803D] border border-[#86EFAC] text-xs font-bold flex items-center gap-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Nghe lại</span>
                    </button>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-[#2B342D] bg-white/90 p-3 rounded-2xl border border-[#BBF7D0]">
                  “{adjustmentResult.spokenResponse}”
                </p>
              </div>

              {/* Proposed Formula Visual Bar Comparison */}
              <div className="spring-card p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F5DCE4]">
                  <div className="flex items-center gap-2">
                    <GitCompare className="w-4 h-4 text-[#EC4899]" />
                    <h4 className="text-sm font-bold text-[#2B342D]">
                      {adjustmentResult.proposedPerfumeName}
                    </h4>
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
                          `${adjustmentResult.proposedPerfumeName} (Voice)`,
                          `Giọng nói: "${userRequest}"`
                        );
                        setSavedSuccess(true);
                        setTimeout(() => setSavedSuccess(false), 3000);
                      }}
                      className="px-3 py-1.5 rounded-2xl bg-white hover:bg-[#FFF5F8] text-[#BE185D] border border-[#FBCFE8] text-xs font-bold flex items-center gap-1"
                    >
                      {savedSuccess ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                      <span>{savedSuccess ? 'Đã lưu' : 'Lưu'}</span>
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
                      className="px-4 py-1.5 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      {appliedSuccess ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Đã áp dụng</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Áp dụng ngay</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Compact Ratio Bars for Each Changed Ingredient */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {adjustmentResult.comparisonItems.map((item) => (
                    <div
                      key={item.slotKey}
                      className="p-3 rounded-2xl bg-[#FFFDF8] border border-[#F3DCE4] space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#2B342D]">{item.name}</span>
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded-full text-[11px] ${
                            item.deltaPercentage > 0
                              ? 'bg-[#DCFCE7] text-[#15803D]'
                              : item.deltaPercentage < 0
                              ? 'bg-[#FFE4E6] text-[#BE123C]'
                              : 'bg-gray-100 text-[#5C6B5F]'
                          }`}
                        >
                          {item.oldPercentage}% → {item.newPercentage}% (
                          {item.deltaPercentage > 0 ? '+' : ''}
                          {item.deltaPercentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#FCE7F3] overflow-hidden">
                        <div
                          className="h-full bg-[#EC4899] rounded-full"
                          style={{ width: `${Math.min(100, item.newPercentage)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <SpringAccordion title="Bảng chi tiết & Cơ sở Hóa học" tone="butter">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#FDE68A] text-[#5C6B5F]">
                          <th className="py-2 px-2">Nguyên liệu</th>
                          <th className="py-2 px-2 text-center">Gốc</th>
                          <th className="py-2 px-2 text-center">Mới</th>
                          <th className="py-2 px-2">Giải thích</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#FEF3C7]">
                        {adjustmentResult.comparisonItems.map((item) => (
                          <tr key={item.slotKey}>
                            <td className="py-2 px-2 font-bold">{item.name}</td>
                            <td className="py-2 px-2 text-center font-mono">{item.oldPercentage}%</td>
                            <td className="py-2 px-2 text-center font-mono font-bold text-[#15803D]">
                              {item.newPercentage}%
                            </td>
                            <td className="py-2 px-2">{item.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </SpringAccordion>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#F5DCE4] bg-[#FFF5F8] flex items-center justify-between text-xs text-[#5C6B5F]">
          <span className="font-bold">🌸 Gemini Live · Tổ 1 - 12A13</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-2xl bg-white hover:bg-[#FCE7F3] text-[#2B342D] border border-[#F3D5E0] font-bold"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
