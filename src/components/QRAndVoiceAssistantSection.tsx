import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  Check,
  Copy,
  Maximize2,
  X,
  ArrowRight,
  Loader2,
  BookmarkPlus,
} from 'lucide-react';
import { CalculatedIngredient, FormulaSlot } from '../utils/perfumeCalculations';
import {
  safeRequestPerfumeAdjustment,
  safeRequestTTS,
  speakWithBrowserSynthesis,
  AIAdjustmentResult,
} from '../utils/aiPerfumeEngine';
import {
  SPEECH_LANGUAGE_OPTIONS,
  createMultilingualVoiceSession,
  MultilingualVoiceController,
} from '../utils/multilingualSpeech';
import { ScentFamilyVisualBadge } from './SpringDecorations';

interface QRAndVoiceAssistantSectionProps {
  seasonKey: 'spring' | 'summer' | 'autumn' | 'winter';
  seasonLabel: string;
  totalVolume: number;
  concentrationName: string;
  concentrationPercent: number;
  slots: FormulaSlot[];
  calculatedIngredients: CalculatedIngredient[];
  tierTotals: { top: number; heart: number; base: number };
  perfumeName: string;
  isQrVisitorMode?: boolean;
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

export const QRAndVoiceAssistantSection: React.FC<QRAndVoiceAssistantSectionProps> = ({
  seasonKey,
  seasonLabel,
  totalVolume,
  concentrationName,
  concentrationPercent,
  slots,
  calculatedIngredients,
  tierTotals,
  perfumeName,
  isQrVisitorMode = false,
  onApplyAdjustedFormula,
  onSaveProposedToDrawer,
}) => {
  const [userRequest, setUserRequest] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [adjustmentResult, setAdjustmentResult] = useState<AIAdjustmentResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isListening, setIsListening] = useState<boolean>(false);
  const [isTranscribingServer, setIsTranscribingServer] = useState<boolean>(false);
  const [voiceStatusText, setVoiceStatusText] = useState<string>('');
  const [speechLanguage, setSpeechLanguage] = useState<string>('auto');
  const lastTranscriptRef = useRef<string>('');
  const promptInputRef = useRef<HTMLTextAreaElement | null>(null);
  const voiceSessionRef = useRef<MultilingualVoiceController | null>(null);

  const [autoSpeak, setAutoSpeak] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const [copiedQrLink, setCopiedQrLink] = useState<boolean>(false);
  const [isQrFullscreenOpen, setIsQrFullscreenOpen] = useState<boolean>(false);
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);
  const [savedToDrawerSuccess, setSavedToDrawerSuccess] = useState<boolean>(false);

  const qrShareUrl = React.useMemo(() => {
    const baseUrl =
      typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
    const slotsCompact = slots.map((s) => `${s.key}:${s.ingredientId}:${s.percentage}`).join(',');
    const params = new URLSearchParams({
      qr: '1',
      season: seasonKey,
      vol: String(totalVolume),
      conc: String(concentrationPercent),
      name: perfumeName,
      s: slotsCompact,
    });
    return `${baseUrl}?${params.toString()}`;
  }, [seasonKey, totalVolume, concentrationPercent, perfumeName, slots]);

  const stopSpeaking = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  useEffect(() => {
    return () => {
      stopSpeaking();
      voiceSessionRef.current?.stop();
    };
  }, []);

  const handleCopyQrUrl = () => {
    navigator.clipboard.writeText(qrShareUrl);
    setCopiedQrLink(true);
    setTimeout(() => setCopiedQrLink(false), 2500);
  };

  const speakResponseText = async (textToSpeak: string) => {
    if (!textToSpeak) return;
    stopSpeaking();
    setIsSpeaking(true);

    try {
      const ttsResult = await safeRequestTTS(textToSpeak);
      if (ttsResult.audioBase64) {
        const audio = new Audio(
          `data:${ttsResult.mimeType || 'audio/wav'};base64,${ttsResult.audioBase64}`
        );
        audioPlayerRef.current = audio;
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => {
          speakWithBrowserSynthesis(textToSpeak, () => setIsSpeaking(false));
        };
        await audio.play();
        return;
      }

      speakWithBrowserSynthesis(textToSpeak, () => setIsSpeaking(false));
    } catch {
      speakWithBrowserSynthesis(textToSpeak, () => setIsSpeaking(false));
    }
  };

  const handleToggleVoiceInput = async () => {
    if (isListening) {
      setIsTranscribingServer(true);
      voiceSessionRef.current?.stop();
      setIsListening(false);
      return;
    }

    setErrorMsg(null);
    stopSpeaking();
    lastTranscriptRef.current = '';

    const controller = createMultilingualVoiceSession({
      language: speechLanguage,
      onStatus: (msg) => setVoiceStatusText(msg),
      onTranscriptUpdate: (text) => {
        if (text) {
          setUserRequest(text);
          lastTranscriptRef.current = text;
        }
      },
      onError: (err) => {
        setIsListening(false);
        setIsTranscribingServer(false);
        setErrorMsg(err);
      },
      onFinish: () => {
        setIsListening(false);
        setIsTranscribingServer(false);
        setTimeout(() => promptInputRef.current?.focus(), 0);
      },
    });

    voiceSessionRef.current = controller;
    const started = await controller.start();
    setIsListening(started);
  };

  const handleSendRequestToAI = async (customPrompt?: string) => {
    const promptToUse = (
      customPrompt !== undefined ? customPrompt : lastTranscriptRef.current || userRequest
    ).trim();
    if (!promptToUse) {
      setErrorMsg('Hãy nhập yêu cầu hoặc chạm Micro để nói.');
      return;
    }

    setUserRequest(promptToUse);
    lastTranscriptRef.current = promptToUse;
    setErrorMsg(null);
    setIsAnalyzing(true);
    setAppliedSuccess(false);
    setSavedToDrawerSuccess(false);
    stopSpeaking();

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

      if (autoSpeak && data.spokenResponse) {
        speakResponseText(data.spokenResponse);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi kết nối AI.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyToMainWorkspace = () => {
    if (!adjustmentResult) return;
    onApplyAdjustedFormula(
      adjustmentResult.comparisonItems.map((item) => ({
        slotKey: item.slotKey,
        newPercentage: item.newPercentage,
      })),
      adjustmentResult.proposedPerfumeName,
      userRequest
    );
    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 3500);
  };

  const handleSaveToComparisonList = () => {
    if (!adjustmentResult) return;
    onSaveProposedToDrawer(
      adjustmentResult.comparisonItems.map((item) => ({
        slotKey: item.slotKey,
        newPercentage: item.newPercentage,
      })),
      `${adjustmentResult.proposedPerfumeName} (AI)`,
      `Yêu cầu: "${userRequest}"`
    );
    setSavedToDrawerSuccess(true);
    setTimeout(() => setSavedToDrawerSuccess(false), 3500);
  };

  const samplePrompts = [
    { badge: '🍃 Dịu nhẹ', text: 'Tôi muốn hương thơm dịu hơn, ít ngọt hơn' },
    { badge: '🌼 Tươi mới', text: 'Tôi muốn mùi tươi mát và thanh thoát hơn' },
    { badge: '🍑 Rõ đào', text: 'Tôi muốn hương đào ở tầng giữa nổi bật hơn' },
    { badge: '🪵 Lưu lâu', text: 'Tăng xạ hương và vanilla để lưu hương lâu hơn' },
  ];

  return (
    <section
      id="qr-voice-interactive-station"
      className={`spring-card p-5 sm:p-6 space-y-5 ${
        isQrVisitorMode ? 'ring-2 ring-[#F472B6]' : ''
      }`}
    >
      {/* Minimal Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#F6DCE5]">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="px-3 py-1 rounded-full bg-[#FCE7F3] text-[#BE185D] text-xs font-bold border border-[#FBCFE8]">
            QR &amp; Giọng nói
          </span>
          <h2 className="text-lg font-bold text-[#2B342D] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#EC4899]" />
            <span>Chia sẻ &amp; chỉnh hương</span>
          </h2>
        </div>

        {/* Visual Icon Step Strip */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#4A4D48]">
          <span className="px-2.5 py-1 rounded-full bg-[#FFFDF0] border border-[#FDE68A]">📱 Quét QR</span>
          <ArrowRight className="w-3 h-3 text-[#EC4899]" />
          <span className="px-2.5 py-1 rounded-full bg-[#FFF1F5] border border-[#FBCFE8]">🎙️ Yêu cầu</span>
          <ArrowRight className="w-3 h-3 text-[#EC4899]" />
          <span className="px-2.5 py-1 rounded-full bg-[#ECFDF3] border border-[#BBF7D0]">✨ Tỷ lệ mới</span>
        </div>
      </div>

      {/* Main Grid: QR + Voice/Text */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 p-4 rounded-3xl bg-[#FFFDF8] border border-[#FBCFE8] flex flex-col items-center justify-between text-center gap-3">
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-bold text-[#BE185D] flex items-center gap-1.5">
              <QrCode className="w-4 h-4" />
              Mã QR chia sẻ
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] font-bold">
              {totalVolume} mL
            </span>
          </div>

          <div className="p-3.5 bg-white rounded-3xl shadow-xs border-2 border-[#FBCFE8]">
            <QRCodeSVG
              value={qrShareUrl}
              size={156}
              level="M"
              includeMargin={false}
              bgColor="#FFFFFF"
              fgColor="#2B342D"
            />
          </div>

          <div className="w-full grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCopyQrUrl}
              className="px-3 py-2 rounded-2xl bg-white hover:bg-[#FFF5F8] text-[#2B342D] border border-[#F3DCE4] text-xs font-bold flex items-center justify-center gap-1.5"
            >
              {copiedQrLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span className="text-[#15803D]">Đã chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#DB2777]" />
                  <span>Chép link</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsQrFullscreenOpen(true)}
              className="px-3 py-2 rounded-2xl bg-[#FCE7F3] hover:bg-[#FBCFE8] text-[#BE185D] border border-[#F9A8D4] text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Phóng to</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-8 p-4 sm:p-5 rounded-3xl bg-[#FFFDF8] border border-[#C8F0D4] flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#15803D] flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-[#EC4899]" />
                Nói (mọi ngôn ngữ) hoặc nhập mong muốn
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Chọn ngôn ngữ giọng nói"
                  value={speechLanguage}
                  disabled={isListening || isAnalyzing}
                  onChange={(e) => setSpeechLanguage(e.target.value)}
                  className="px-2.5 py-1 rounded-full border border-[#FBCFE8] bg-white text-[11px] font-bold text-[#9D174D] focus:outline-none"
                >
                  {SPEECH_LANGUAGE_OPTIONS.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {opt.shortLabel}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (isSpeaking) stopSpeaking();
                    setAutoSpeak(!autoSpeak);
                  }}
                  className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${
                    autoSpeak
                      ? 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]'
                      : 'bg-white text-[#5C6B5F] border-[#E5E7EB]'
                  }`}
                >
                  {autoSpeak ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span>{autoSpeak ? 'Đọc giọng: BẬT' : 'Đọc giọng: TẮT'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {samplePrompts.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendRequestToAI(sample.text)}
                  disabled={isAnalyzing}
                  className="text-left p-2.5 rounded-2xl bg-white hover:bg-[#FFF5F8] border border-[#F3DCE4] hover:border-[#F472B6] transition-all"
                >
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF9C3] text-[#854D0E] border border-[#FDE047]">
                    {sample.badge}
                  </span>
                  <p className="text-xs font-semibold text-[#2B342D] mt-1 line-clamp-1">
                    “{sample.text}”
                  </p>
                </button>
              ))}
            </div>

            <div className="relative">
              <textarea
                ref={promptInputRef}
                rows={2}
                value={userRequest}
                onChange={(e) => {
                  setUserRequest(e.target.value);
                  lastTranscriptRef.current = e.target.value;
                }}
                placeholder="Ví dụ: Hương tươi mát hơn, giảm ngọt..."
                className="w-full p-3.5 pr-14 rounded-2xl bg-white border-2 border-[#FBCFE8] focus:border-[#EC4899] text-xs sm:text-sm text-[#2B342D] focus:outline-none resize-none"
              />
              <button
                type="button"
                onClick={handleToggleVoiceInput}
                disabled={isTranscribingServer}
                className={`absolute right-2.5 bottom-2.5 w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-xs ${
                  isListening
                    ? 'bg-[#EC4899] text-white animate-pulse'
                    : 'bg-[#FCE7F3] hover:bg-[#FBCFE8] text-[#BE185D]'
                }`}
                title="Thu âm giọng nói"
              >
                {isTranscribingServer ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            </div>

            {(isListening || voiceStatusText) && (
              <div className="px-3 py-2 rounded-2xl bg-[#FFF1F5] border border-[#FBCFE8] text-xs font-semibold text-[#9D174D]">
                {voiceStatusText}
              </div>
            )}
            {errorMsg && (
              <div className="p-2.5 rounded-2xl bg-[#FFE4E6] border border-[#FDA4AF] text-xs font-semibold text-[#9F1239]">
                {errorMsg}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => handleSendRequestToAI()}
              disabled={isAnalyzing}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#EC4899] to-[#F472B6] hover:from-[#DB2777] hover:to-[#EC4899] disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-xs flex items-center gap-2 active:scale-95"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang phân tích...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Đề xuất tỷ lệ mới</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Visual Side-by-Side Results */}
      {adjustmentResult && (
        <div className="pt-4 border-t border-[#F6DCE5] space-y-4">
          <div
            className={`p-4 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              adjustmentResult.isUnchanged
                ? 'bg-[#FFFDF0] border-[#FCD34D]'
                : 'bg-[#FFF5F8] border-[#FBCFE8]'
            }`}
          >
            <div>
              <span
                className={`text-[11px] font-bold uppercase ${
                  adjustmentResult.isUnchanged ? 'text-[#92400E]' : 'text-[#BE185D]'
                }`}
              >
                {adjustmentResult.isUnchanged ? '⚠️ Giữ nguyên tỷ lệ gốc' : '✨ Đề xuất AI'}
              </span>
              <h4 className="text-base font-bold text-[#2B342D]">
                {adjustmentResult.proposedPerfumeName}
              </h4>
              <p className="text-xs text-[#4A4D48] mt-1">
                {adjustmentResult.message || adjustmentResult.spokenResponse}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {isSpeaking ? (
                <button
                  type="button"
                  onClick={stopSpeaking}
                  className="px-3 py-1.5 rounded-2xl bg-white text-[#BE185D] border border-[#FBCFE8] text-xs font-bold flex items-center gap-1"
                >
                  <VolumeX className="w-3.5 h-3.5" /> Dừng
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => speakResponseText(adjustmentResult.spokenResponse)}
                  className="px-3 py-1.5 rounded-2xl bg-white text-[#15803D] border border-[#BBF7D0] text-xs font-bold flex items-center gap-1"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Nghe
                </button>
              )}

              {!adjustmentResult.isUnchanged && (
                <>
                  <button
                    type="button"
                    onClick={handleSaveToComparisonList}
                    className="px-3 py-1.5 rounded-2xl bg-[#FEF9C3] text-[#854D0E] border border-[#FDE047] text-xs font-bold flex items-center gap-1"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>{savedToDrawerSuccess ? 'Đã lưu' : 'Lưu'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyToMainWorkspace}
                    className="px-4 py-1.5 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{appliedSuccess ? 'Đã áp dụng' : 'Áp dụng'}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Visual Comparison Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {adjustmentResult.comparisonItems
              .filter((item) => item.oldPercentage > 0 || item.newPercentage > 0)
              .map((item) => (
              <div
                key={item.slotKey}
                className="p-3.5 rounded-2xl bg-white border border-[#F3DCE4] space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#2B342D] truncate">
                    {item.name.split('(')[0].trim()}
                  </span>
                  <ScentFamilyVisualBadge scentFamily={item.scentFamily} name={item.name} />
                </div>

                <div className="space-y-1 text-[11px] font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-10 text-[#5C6B5F]">Gốc</span>
                    <div className="flex-1 h-2.5 rounded-full bg-[#F3F4F6] overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, item.oldPercentage * 2)}%` }}
                        className="h-full bg-[#9CA3AF] rounded-full"
                      />
                    </div>
                    <span className="w-9 text-right font-bold">{item.oldPercentage}%</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-10 text-[#BE185D] font-bold">Mới</span>
                    <div className="flex-1 h-2.5 rounded-full bg-[#FFF1F5] overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, item.newPercentage * 2)}%` }}
                        className="h-full bg-[#EC4899] rounded-full"
                      />
                    </div>
                    <span className="w-9 text-right font-bold text-[#BE185D]">
                      {item.newPercentage}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isQrFullscreenOpen && (
        <div className="fixed inset-0 z-50 bg-[#2B342D]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFDF8] border-2 border-[#FBCFE8] rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative space-y-4">
            <button
              type="button"
              onClick={() => setIsQrFullscreenOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#FCE7F3] text-[#BE185D] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold text-[#2B342D]">{perfumeName}</h3>
            <div className="inline-block p-5 bg-white rounded-3xl border-2 border-[#FBCFE8]">
              <QRCodeSVG value={qrShareUrl} size={220} level="M" bgColor="#FFFFFF" fgColor="#2B342D" />
            </div>
            <button
              type="button"
              onClick={() => setIsQrFullscreenOpen(false)}
              className="w-full py-2.5 rounded-2xl bg-[#EC4899] text-white font-bold text-xs"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
