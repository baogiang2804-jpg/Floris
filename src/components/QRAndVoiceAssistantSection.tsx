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
  GitCompare,
  Check,
  Copy,
  Maximize2,
  X,
  ArrowRight,
  Loader2,
  CheckCircle2,
  BookmarkPlus,
  Smartphone,
  MessageSquare,
  BrainCircuit,
  BarChart3,
  AudioWaveform,
} from 'lucide-react';
import { CalculatedIngredient, FormulaSlot } from '../utils/perfumeCalculations';
import {
  safeRequestPerfumeAdjustment,
  safeRequestTTS,
  safeRequestTranscribe,
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
  source?: string;
}

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

  // Voice Recognition (STT) states
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isTranscribingServer, setIsTranscribingServer] = useState<boolean>(false);
  const [voiceStatusText, setVoiceStatusText] = useState<string>('');
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const lastTranscriptRef = useRef<string>('');

  // Voice Synthesis / Playback (TTS) states
  const [autoSpeak, setAutoSpeak] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // QR Code states
  const [copiedQrLink, setCopiedQrLink] = useState<boolean>(false);
  const [isQrFullscreenOpen, setIsQrFullscreenOpen] = useState<boolean>(false);
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);
  const [savedToDrawerSuccess, setSavedToDrawerSuccess] = useState<boolean>(false);

  // Build dynamic shareable URL encoding the current group's formula for QR scanning
  const qrShareUrl = React.useMemo(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
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

  // Stop any ongoing speech playback
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

  // Cleanup audio and speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleCopyQrUrl = () => {
    navigator.clipboard.writeText(qrShareUrl);
    setCopiedQrLink(true);
    setTimeout(() => setCopiedQrLink(false), 2500);
  };

  // Play AI response with Gemini Live voice or Vietnamese browser speech fallback
  const speakResponseText = async (textToSpeak: string) => {
    if (!textToSpeak) return;
    stopSpeaking();
    setIsSpeaking(true);

    try {
      const ttsResult = await safeRequestTTS(textToSpeak);
      if (ttsResult.audioBase64) {
        const audio = new Audio(`data:${ttsResult.mimeType || 'audio/wav'};base64,${ttsResult.audioBase64}`);
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

  // Toggle Microphone:
  // Chạm lần 1: Lắng nghe giọng nói.
  // Chạm lần 2: Dừng nghe, AI lập tức phân tích và đưa ra phản hồi.
  const handleToggleVoiceInput = async () => {
    if (isListening) {
      // User tapped second time to stop listening and trigger AI analysis
      setIsListening(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      const promptToAnalyze = (lastTranscriptRef.current || userRequest || '').trim();
      if (promptToAnalyze) {
        setVoiceStatusText('Đã nhận diện lời nói! AI đang phân tích và chuẩn bị trả lời...');
        handleSendRequestToAI(promptToAnalyze);
      } else {
        const defaultPrompt = 'Tôi muốn mùi hoa nhài ở đầu thanh thoát và tươi mát hơn.';
        setUserRequest(defaultPrompt);
        setVoiceStatusText('Đang tự động phân tích theo gợi ý mùi hương tươi mát...');
        handleSendRequestToAI(defaultPrompt);
      }
      return;
    }

    // First tap: Start listening
    setErrorMsg(null);
    stopSpeaking();
    lastTranscriptRef.current = '';

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      try {
        const recognition = new SpeechRecognitionAPI();
        recognition.lang = 'vi-VN';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
          setIsListening(true);
          setVoiceStatusText('🎙️ Đang lắng nghe... Hãy nói yêu cầu, chạm lại mic khi nói xong để AI phân tích!');
        };

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            setUserRequest(transcript);
            lastTranscriptRef.current = transcript;
            setVoiceStatusText(`Đã nghe: "${transcript}" — Chạm mic lần nữa để AI trả lời!`);
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
          setVoiceStatusText('');
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        return;
      } catch {
        // Fallback to MediaRecorder
      }
    }

    // Fallback: Record audio via MediaRecorder & transcribe safely
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setIsTranscribingServer(true);
        setVoiceStatusText('Đang chuyển giọng nói thành văn bản bằng AI...');

        const transcript = await safeRequestTranscribe(audioBlob);
        setIsTranscribingServer(false);
        if (transcript) {
          setUserRequest(transcript);
          lastTranscriptRef.current = transcript;
          setVoiceStatusText(`Đã nhận diện: "${transcript}" — Chạm mic lần nữa để AI trả lời!`);
          handleSendRequestToAI(transcript);
        } else {
          setVoiceStatusText('');
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsListening(true);
      setVoiceStatusText('🎙️ Đang thu âm... Chạm lại nút Micro khi nói xong để AI phân tích!');
    } catch {
      setErrorMsg(
        'Không thể truy cập Micro. Vui lòng cấp quyền Micro cho trình duyệt hoặc chọn nhanh các câu hỏi mẫu bên dưới.'
      );
    }
  };

  // Send Request to AI for Formula Adjustment & Comparison (Safe from JSON parse errors)
  const handleSendRequestToAI = async (customPrompt?: string) => {
    const promptToUse = (customPrompt !== undefined ? customPrompt : (lastTranscriptRef.current || userRequest)).trim();
    if (!promptToUse) {
      setErrorMsg('Vui lòng nhập yêu cầu hoặc nhấn nút Micro để nói mong muốn của bạn.');
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
      setErrorMsg(err.message || 'Không thể kết nối tới AI để điều chỉnh công thức.');
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
      `${adjustmentResult.proposedPerfumeName} (Đề xuất AI)`,
      `Yêu cầu: "${userRequest}"`
    );
    setSavedToDrawerSuccess(true);
    setTimeout(() => setSavedToDrawerSuccess(false), 3500);
  };

  const samplePrompts = [
    {
      badge: 'Ví dụ Nhóm Mùa Thu (QR)',
      text: 'Tôi muốn hương thơm dịu hơn, ít ngọt hơn',
    },
    {
      badge: 'Ví dụ Nhóm Mùa Hè (Giọng nói)',
      text: 'Tôi thích mùi nước hoa mùa hè của nhóm nhưng muốn mùi cam nổi bật hơn. Bạn có thể điều chỉnh công thức không?',
    },
    {
      badge: 'Tăng hương hoa',
      text: 'Tôi muốn hương hoa ở tầng giữa nổi bật, nữ tính hơn và bớt mùi gỗ',
    },
    {
      badge: 'Lưu hương trầm ấm',
      text: 'Hãy điều chỉnh để nước hoa có mùi gỗ trầm ấm áp và lưu hương lâu hơn trên da',
    },
  ];

  return (
    <section
      id="qr-voice-interactive-station"
      className={`rounded-2xl border p-5 sm:p-6 backdrop-blur-sm shadow-xl transition-all ${
        isQrVisitorMode
          ? 'bg-gradient-to-br from-amber-950/50 via-slate-900 to-slate-950 border-amber-500/60 ring-2 ring-amber-500/30'
          : 'bg-slate-900/60 border-slate-800'
      }`}
    >
      {/* Top Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
              Trạm Tương Tác Trực Tiếp • QR & Voice AI
            </span>
            {isQrVisitorMode && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                📱 Đã kết nối từ Mã QR Sản Phẩm
              </span>
            )}
          </div>
          <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-100 mt-1 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Quét QR & Trợ Lý Giọng Nói AI Điều Chỉnh Công Thức
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Học sinh nhóm khác quét mã QR hoặc dùng giọng nói yêu cầu điều chỉnh mùi hương — AI sẽ phân tích, phản hồi bằng giọng nói và lập bảng so sánh tỉ lệ gốc với tỉ lệ đề xuất.
          </p>
        </div>

        {/* Dual Interactive Process Flow Diagrams (Matching the 2 Reference Images) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 shrink-0">
          {/* Flow 1: QR Interaction */}
          <div className="px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
              Quy trình tương tác QR
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                <Smartphone className="w-3 h-3 text-amber-400" /> Quét QR
              </span>
              <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                <MessageSquare className="w-3 h-3 text-cyan-400" /> Yêu cầu
              </span>
              <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                <BrainCircuit className="w-3 h-3 text-purple-400" /> AI
              </span>
              <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                <BarChart3 className="w-3 h-3 text-emerald-400" /> So sánh
              </span>
            </div>
          </div>

          {/* Flow 2: Voice Interaction */}
          <div className="px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Quy trình tương tác Giọng nói
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                <Mic className="w-3 h-3 text-rose-400" /> Giọng nói
              </span>
              <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                <AudioWaveform className="w-3 h-3 text-amber-400" /> Nhận dạng
              </span>
              <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                <BrainCircuit className="w-3 h-3 text-purple-400" /> AI xử lý
              </span>
              <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                <Volume2 className="w-3 h-3 text-emerald-400" /> Phản hồi
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left (QR Code Product Card) & Right (Voice/Text Input & AI Controls) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column (4 cols): QR Code Generator for the Current Formula */}
        <div className="lg:col-span-4 bg-slate-950/70 border border-slate-800/90 rounded-2xl p-5 flex flex-col items-center justify-between text-center">
          <div className="w-full">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-300 font-semibold flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-amber-400" />
                Mã QR Sản Phẩm Nhóm
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {seasonLabel.split(' ')[0]} {seasonLabel.split(' ')[1]}
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Dán mã QR này lên lọ nước hoa mẫu. Khi nhóm khác quét QR bằng điện thoại, công thức hiện tại sẽ tự động nạp để họ gửi yêu cầu điều chỉnh.
            </p>
          </div>

          {/* Crisp SVG QR Code Container */}
          <div className="p-4 bg-white rounded-2xl shadow-lg border-4 border-amber-500/30 my-1">
            <QRCodeSVG
              value={qrShareUrl}
              size={168}
              level="M"
              includeMargin={false}
              bgColor="#FFFFFF"
              fgColor="#0F172A"
            />
          </div>

          <div className="mt-3 space-y-1">
            <p className="text-xs font-serif font-bold text-slate-200">{perfumeName}</p>
            <p className="text-[11px] font-mono text-slate-400">
              {totalVolume} mL • {concentrationName} • Đầu {tierTotals.top}% / Giữa {tierTotals.heart}% / Cuối {tierTotals.base}%
            </p>
          </div>

          {/* QR Action Buttons */}
          <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleCopyQrUrl}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              {copiedQrLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Đã chép link</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Chép Link QR</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsQrFullscreenOpen(true)}
              className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-medium transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Phóng to QR</span>
            </button>
          </div>
        </div>

        {/* Right Column (8 cols): Voice Recognition & Natural Language Request Input */}
        <div className="lg:col-span-8 bg-slate-950/70 border border-slate-800/90 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-rose-400" />
                  Nhập Yêu Cầu Hoặc Nói Trực Tiếp Với AI Master Perfumer
                </h3>
                <p className="text-xs text-slate-400">
                  Hỗ trợ thu âm giọng nói tiếng Việt chuyển thành văn bản (Speech-to-Text) và AI trả lời bằng giọng nói (Text-to-Speech)
                </p>
              </div>

              {/* Auto-speak toggle */}
              <button
                type="button"
                onClick={() => {
                  if (isSpeaking) stopSpeaking();
                  setAutoSpeak(!autoSpeak);
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 self-start sm:self-auto ${
                  autoSpeak
                    ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
                title="Bật/tắt chế độ AI tự động phát giọng nói khi trả lời"
              >
                {autoSpeak ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Giọng Phản Hồi Gemini Live: BẬT</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                    <span>Giọng Phản Hồi Gemini Live: TẮT</span>
                  </>
                )}
              </button>
            </div>

            {/* Sample Scenario Pills from the 2 uploaded images */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-slate-400">
                Chọn nhanh tình huống mẫu (như trong đề bài) hoặc tự nói/nhập:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {samplePrompts.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendRequestToAI(sample.text)}
                    disabled={isAnalyzing}
                    className="text-left p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/40 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {sample.badge}
                      </span>
                      <span className="text-[10px] text-slate-500 group-hover:text-amber-400 transition-colors">
                        Thử ngay →
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 line-clamp-2 italic">
                      “{sample.text}”
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Recording & Textarea Box */}
            <div className="relative">
              <textarea
                rows={3}
                value={userRequest}
                onChange={(e) => setUserRequest(e.target.value)}
                placeholder="Ví dụ: “Tôi muốn hương thơm dịu hơn, ít ngọt hơn” hoặc “Tôi thích mùi nước hoa mùa hè của nhóm nhưng muốn mùi cam nổi bật hơn...”"
                className="w-full p-3.5 pr-14 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none"
              />

              {/* Floating Microphone Button inside textarea */}
              <button
                type="button"
                onClick={handleToggleVoiceInput}
                disabled={isTranscribingServer}
                className={`absolute right-3 bottom-3 w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-500/30'
                    : 'bg-slate-800 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-slate-700'
                }`}
                title={isListening ? 'Chạm lại để dừng nghe và AI sẽ phân tích trả lời ngay' : 'Chạm để nói bằng giọng nói (AI sẽ lắng nghe)'}
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

            {/* Live Voice Recognition Status Bar */}
            {(isListening || voiceStatusText) && (
              <div className="px-3.5 py-2 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-200">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                <span>{voiceStatusText}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300">
                {errorMsg}
              </div>
            )}
          </div>

          {/* Submit Action Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span>💡 Bạn có thể bấm biểu tượng</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">🎙️ Micro</span>
              <span>để nói trực tiếp hoặc nhập chữ rồi ấn Gửi.</span>
            </div>

            <button
              type="button"
              onClick={() => handleSendRequestToAI()}
              disabled={isAnalyzing}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-900/20 transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>AI Đang Phân Tích & Tính Tỉ Lệ Mới...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-slate-950" />
                  <span>Gửi Yêu Cầu Để AI Điều Chỉnh & So Sánh</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AI ADJUSTMENT & SIDE-BY-SIDE COMPARISON RESULT */}
      {adjustmentResult && (
        <div className="mt-6 pt-6 border-t border-slate-800 space-y-5 animate-fadeIn">
          {/* 1. AI Voice Response Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-950 border border-amber-500/40 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <Volume2 className={`w-5 h-5 text-amber-400 ${isSpeaking ? 'animate-bounce' : ''}`} />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                    Phản Hồi Giọng Nói Từ AI Master Perfumer
                  </span>
                  <h4 className="text-sm sm:text-base font-serif font-bold text-slate-100">
                    Đề xuất: {adjustmentResult.proposedPerfumeName}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isSpeaking ? (
                  <button
                    type="button"
                    onClick={stopSpeaking}
                    className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-medium flex items-center gap-1.5 transition-all"
                  >
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Dừng đọc</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => speakResponseText(adjustmentResult.spokenResponse)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-medium flex items-center gap-1.5 transition-all"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>🔊 Phát lại giọng Gemini Live</span>
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-amber-100/95 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-amber-500/20 italic">
              “{adjustmentResult.spokenResponse}”
            </p>

            {adjustmentResult.highlightChanges && adjustmentResult.highlightChanges.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {adjustmentResult.highlightChanges.map((hl, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    {hl}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 2. Tier Totals Before vs After Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                label: '🍋 Tầng Hương Đầu (Top)',
                oldVal: tierTotals.top,
                newVal: adjustmentResult.newTierTotals.top,
                color: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-300',
              },
              {
                label: '🌹 Tầng Hương Giữa (Heart)',
                oldVal: tierTotals.heart,
                newVal: adjustmentResult.newTierTotals.heart,
                color: 'border-rose-500/30 bg-rose-500/5 text-rose-300',
              },
              {
                label: '🌲 Tầng Hương Cuối (Base)',
                oldVal: tierTotals.base,
                newVal: adjustmentResult.newTierTotals.base,
                color: 'border-amber-600/30 bg-amber-600/5 text-amber-300',
              },
            ].map((t, idx) => {
              const diff = Number((t.newVal - t.oldVal).toFixed(1));
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border ${t.color} flex items-center justify-between`}
                >
                  <span className="text-xs font-medium">{t.label}</span>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-slate-400">{t.oldVal}%</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-bold text-slate-100 text-sm">{t.newVal}%</span>
                    {diff !== 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          diff > 0
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {diff > 0 ? `+${diff}%` : `${diff}%`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3. Side-by-Side Comparison Table: Original Formula vs AI Proposed Formula */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-slate-100">
                  Bảng So Sánh Công Thức Gốc & Công Thức Đề Xuất Của AI (Bình {totalVolume} mL)
                </h4>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleSaveToComparisonList}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all flex items-center gap-1.5"
                >
                  {savedToDrawerSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Đã lưu vào bộ so sánh!</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Lưu bản đề xuất</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleApplyToMainWorkspace}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-md"
                >
                  {appliedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-slate-950" />
                      <span>Đã áp dụng lên thanh trượt!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                      <span>Áp dụng tỉ lệ mới này</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400 bg-slate-900/70">
                    <th className="py-3 px-4">Tầng hương</th>
                    <th className="py-3 px-4">Nguyên liệu</th>
                    <th className="py-3 px-4 text-center">Công thức gốc</th>
                    <th className="py-3 px-4 text-center bg-amber-500/10 text-amber-300">
                      Công thức AI đề xuất
                    </th>
                    <th className="py-3 px-4 text-center">Thay đổi</th>
                    <th className="py-3 px-4">Giải thích chuyên môn từ AI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {adjustmentResult.comparisonItems.map((item) => (
                    <tr key={item.slotKey} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                        {item.tierLabel}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-100">{item.name}</div>
                        <div className="text-[11px] text-slate-400">{item.scentFamily}</div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono whitespace-nowrap">
                        <span className="text-slate-200 font-semibold">{item.oldPercentage}%</span>
                        <span className="block text-[10px] text-slate-500">
                          {item.oldVolumeMl} mL (~{item.oldDrops} giọt)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono whitespace-nowrap bg-amber-500/5">
                        <span className="text-amber-300 font-bold text-sm">
                          {item.newPercentage}%
                        </span>
                        <span className="block text-[10px] text-amber-200/70">
                          {item.newVolumeMl} mL (~{item.newDrops} giọt)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono whitespace-nowrap">
                        {item.deltaPercentage === 0 ? (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[11px]">
                            Giữ nguyên
                          </span>
                        ) : item.deltaPercentage > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                            +{item.deltaPercentage}%
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-[11px]">
                            {item.deltaPercentage}%
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-300 leading-relaxed min-w-[220px]">
                        {item.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900/90 border-t border-slate-800 font-mono text-xs font-bold">
                    <td colSpan={2} className="py-3 px-4 text-slate-300">
                      TỔNG CỘNG (Chuẩn 100%):
                    </td>
                    <td className="py-3 px-4 text-center text-slate-300">100% ({totalVolume} mL)</td>
                    <td className="py-3 px-4 text-center text-emerald-400 bg-amber-500/10">
                      100% ({totalVolume} mL)
                    </td>
                    <td colSpan={2} className="py-3 px-4 text-slate-400 font-sans font-normal text-[11px]">
                      {adjustmentResult.analysisSummary}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen QR Modal for Classroom Presentation */}
      {isQrFullscreenOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-md w-full p-6 text-center shadow-2xl relative animate-fadeIn">
            <button
              type="button"
              onClick={() => setIsQrFullscreenOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
              Thẻ QR Trải Nghiệm Sản Phẩm
            </span>

            <h3 className="text-xl font-serif font-bold text-slate-100 mt-3">
              {perfumeName}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {seasonLabel} • Bình {totalVolume} mL • {concentrationName}
            </p>

            <div className="my-6 inline-block p-6 bg-white rounded-3xl shadow-2xl border-4 border-amber-400">
              <QRCodeSVG
                value={qrShareUrl}
                size={260}
                level="M"
                includeMargin={false}
                bgColor="#FFFFFF"
                fgColor="#0F172A"
              />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              📱 Dùng camera điện thoại quét mã QR này để mở trực tiếp công thức của nhóm, sau đó nhập hoặc nói yêu cầu (VD: <em>“Tôi muốn hương thơm dịu hơn, ít ngọt hơn”</em>) để AI điều chỉnh và so sánh!
            </p>

            <button
              type="button"
              onClick={() => setIsQrFullscreenOpen(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all"
            >
              Đóng thẻ QR
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
