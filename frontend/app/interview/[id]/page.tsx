"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Wifi,
  Mic,
  Video,
  Volume2,
  CheckCircle2,
  Play,
  MessageSquare,
  LogOut,
  ShieldAlert,
  X,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

type Stage = "password" | "preflight" | "arena";

type AiState = "listening" | "thinking" | "speaking";

interface PreflightChecks {
  internet: boolean;
  microphone: boolean;
  camera: boolean;
  audio: boolean;
}

interface StateConfig {
  readonly label: string;
  readonly color: string;
  readonly glowColor: string;
  readonly ringColor: string;
  readonly bgGlow: string;
  readonly pulseScale: readonly [number, number];
  readonly pulseDuration: number;
  readonly outerRingScale: readonly [number, number];
  readonly outerRingOpacity: readonly [number, number];
  readonly innerShadow: string;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const AI_STATES: readonly AiState[] = ["listening", "thinking", "speaking"] as const;

const STATE_CONFIG: Record<AiState, StateConfig> = {
  listening: {
    label: "AgenticHR Dinliyor...",
    color: "rgb(34, 211, 238)",
    glowColor: "rgba(34, 211, 238, 0.15)",
    ringColor: "rgba(34, 211, 238, 0.08)",
    bgGlow: "rgba(34, 211, 238, 0.04)",
    pulseScale: [1, 1.05],
    pulseDuration: 3,
    outerRingScale: [1, 1.3],
    outerRingOpacity: [0.3, 0],
    innerShadow:
      "0 0 60px 10px rgba(34,211,238,0.12), 0 0 120px 40px rgba(34,211,238,0.06)",
  },
  thinking: {
    label: "AgenticHR Düşünüyor...",
    color: "rgb(168, 85, 247)",
    glowColor: "rgba(168, 85, 247, 0.18)",
    ringColor: "rgba(168, 85, 247, 0.1)",
    bgGlow: "rgba(168, 85, 247, 0.04)",
    pulseScale: [0.95, 1.08],
    pulseDuration: 1.2,
    outerRingScale: [1, 1.5],
    outerRingOpacity: [0.4, 0],
    innerShadow:
      "0 0 80px 15px rgba(168,85,247,0.15), 0 0 160px 50px rgba(168,85,247,0.07)",
  },
  speaking: {
    label: "AgenticHR Konuşuyor...",
    color: "rgb(52, 211, 153)",
    glowColor: "rgba(52, 211, 153, 0.15)",
    ringColor: "rgba(52, 211, 153, 0.08)",
    bgGlow: "rgba(52, 211, 153, 0.04)",
    pulseScale: [0.97, 1.1],
    pulseDuration: 0.8,
    outerRingScale: [1, 1.4],
    outerRingOpacity: [0.35, 0],
    innerShadow:
      "0 0 70px 12px rgba(52,211,153,0.14), 0 0 140px 45px rgba(52,211,153,0.06)",
  },
} as const;

const MOCK_TRANSCRIPT_LINES: readonly string[] = [
  "AgenticHR: Node.js'te memory leak tespiti için hangi toolları kullanırsınız?",
  "AgenticHR: Bir production sisteminde bu problemi nasıl izole edersiniz?",
  "AgenticHR: Heap snapshot analizi sırasında nelere dikkat edersiniz?",
  "AgenticHR: V8 garbage collector'ın davranışını açıklar mısınız?",
] as const;

const AUDIO_THRESHOLD = 15;

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════

interface InterviewGateProps {
  readonly params: Promise<{ id: string }>;
}

export default function InterviewGatePage({ params }: InterviewGateProps): React.JSX.Element {
  const { id } = use(params);
  const [stage, setStage] = useState<Stage>("password");

  return (
    <AnimatePresence mode="wait">
      {stage === "password" && (
        <motion.div
          key="password"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.4 }}
        >
          <PasswordStage
            interviewId={id}
            onSuccess={() => setStage("preflight")}
          />
        </motion.div>
      )}

      {stage === "preflight" && (
        <motion.div
          key="preflight"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.4 }}
        >
          <PreflightStage onReady={() => setStage("arena")} />
        </motion.div>
      )}

      {stage === "arena" && (
        <motion.div
          key="arena"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="h-screen"
        >
          <ArenaStage interviewId={id} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════
// STAGE 1 — PASSWORD GATE
// ═══════════════════════════════════════════════════════════════

function PasswordStage({
  interviewId,
  onSuccess,
}: {
  readonly interviewId: string;
  readonly onSuccess: () => void;
}): React.JSX.Element {
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verified, setVerified] = useState<boolean>(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!password.trim()) {
        setError("Mülakat şifrenizi girin.");
        return;
      }

      setError(null);
      setIsVerifying(true);

      // Mock validation with 1.5s delay
      setTimeout(() => {
        setIsVerifying(false);
        setVerified(true);
        setTimeout(() => onSuccess(), 800);
      }, 1500);
    },
    [password, onSuccess]
  );

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      {/* Background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-amber-500/[0.04] blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 h-[450px] w-[450px] rounded-full bg-blue-600/[0.05] blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 ring-1 ring-white/[0.06]">
            <KeyRound className="h-6 w-6 text-amber-400" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Mülakat Girişi
          </h1>
          <p className="mt-2 text-sm text-white/35">
            E-posta ile gönderilen mülakat şifrenizi girin.
          </p>
          <p className="mt-1 font-mono text-[10px] text-white/15">
            Oturum: {interviewId}
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6"
          noValidate
        >
          <div>
            <label
              htmlFor="interview-password"
              className="mb-1.5 block text-xs font-medium text-white/40"
            >
              Mülakat Şifresi
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="interview-password"
                type="password"
                autoComplete="off"
                autoFocus
                placeholder="Örn: AX7K29PM"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isVerifying || verified}
                className={`w-full rounded-xl border bg-white/[0.02] py-3.5 pl-10 pr-4 font-mono text-sm tracking-wider text-white placeholder:text-white/15 outline-none transition-all duration-200 focus:bg-white/[0.04] ${
                  error
                    ? "border-red-500/30 focus:border-red-500/50"
                    : "border-white/[0.06] focus:border-amber-500/30"
                }`}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 flex items-center gap-1.5"
              >
                <AlertTriangle className="h-3 w-3 text-red-400/70" />
                <p className="text-[11px] text-red-400/70">{error}</p>
              </motion.div>
            )}
          </div>

          <button
            type="submit"
            disabled={isVerifying || verified}
            className={`mt-5 w-full rounded-xl px-6 py-3.5 text-sm font-semibold transition-all duration-300 ${
              verified
                ? "border border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-400"
                : isVerifying
                  ? "cursor-not-allowed border border-white/[0.04] bg-white/[0.02] text-white/20"
                  : "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/15 hover:shadow-amber-500/25 hover:brightness-110"
            }`}
          >
            {verified ? (
              <span className="flex items-center justify-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Doğrulandı — Hazırlanıyor...
              </span>
            ) : isVerifying ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Şifre doğrulanıyor...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Mülakata Giriş Yap
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </button>
        </motion.form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-5 text-center text-[11px] leading-relaxed text-white/15"
        >
          Şifrenizi bulamıyor musunuz? İK departmanının gönderdiği e-postayı
          kontrol edin. Şifre tek kullanımlıktır ve yalnızca size özeldir.
        </motion.p>
      </div>
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════
// STAGE 2 — ADVANCED PRE-FLIGHT
// ═══════════════════════════════════════════════════════════════

function PreflightStage({
  onReady,
}: {
  readonly onReady: () => void;
}): React.JSX.Element {
  const [checks, setChecks] = useState<PreflightChecks>({
    internet: false,
    microphone: false,
    camera: false,
    audio: false,
  });
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [streamError, setStreamError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number>(0);

  const allPassed = checks.internet && checks.microphone && checks.camera && checks.audio;

  // Mock internet check
  useEffect(() => {
    const timer = setTimeout(() => {
      setChecks((prev) => ({ ...prev, internet: true }));
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Request permissions
  const handlePermission = useCallback(async () => {
    try {
      setStreamError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      setPermissionGranted(true);

      // Attach video
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Check camera
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && videoTrack.readyState === "live") {
        setChecks((prev) => ({ ...prev, camera: true }));
      }

      // Check microphone track exists
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack && audioTrack.readyState === "live") {
        setChecks((prev) => ({ ...prev, microphone: true }));
      }

      // Setup audio analysis
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const detectAudio = () => {
        analyser.getByteFrequencyData(dataArray);
        const average =
          dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(average);
        if (average > AUDIO_THRESHOLD) {
          setChecks((prev) => ({ ...prev, audio: true }));
        }
        animFrameRef.current = requestAnimationFrame(detectAudio);
      };
      animFrameRef.current = requestAnimationFrame(detectAudio);
    } catch {
      setStreamError(
        "Kamera ve mikrofon erişimi reddedildi. Lütfen tarayıcı izinlerini kontrol edin."
      );
    }
  }, []);

  // Cleanup on unmount or transition
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current) {
        void audioContextRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleStart = useCallback(() => {
    // Stop streams before transitioning
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current) {
      void audioContextRef.current.close();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    onReady();
  }, [onReady]);

  const checkItems: {
    key: keyof PreflightChecks;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { key: "internet", label: "İnternet Bağlantısı", icon: <Wifi className="h-4 w-4" /> },
    { key: "microphone", label: "Mikrofon", icon: <Mic className="h-4 w-4" /> },
    { key: "camera", label: "Kamera", icon: <Video className="h-4 w-4" /> },
    { key: "audio", label: "Ortam Sesi", icon: <Volume2 className="h-4 w-4" /> },
  ];

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">
      {/* Background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-600/[0.05] blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-cyan-600/[0.05] blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/15 to-cyan-500/15 ring-1 ring-white/[0.06]">
            <ShieldCheck className="h-6 w-6 text-blue-400" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Ön Uçuş Kontrolü
          </h1>
          <p className="mt-2 text-sm text-white/35">
            Mülakata başlamadan önce cihazlarınızı test edin.
          </p>
        </motion.div>

        {/* Two-column layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid gap-6 md:grid-cols-2"
        >
          {/* Left — Video feed */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black/40">
              {permissionGranted ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3">
                  <Video className="h-10 w-10 text-white/10" />
                  <p className="text-xs text-white/20">
                    Kamera önizlemesi
                  </p>
                </div>
              )}

              {/* Live badge */}
              {permissionGranted && (
                <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md bg-black/50 px-2 py-1 backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-400/70">
                    live
                  </span>
                </div>
              )}
            </div>

            {/* Permission button */}
            {!permissionGranted && (
              <button
                type="button"
                onClick={handlePermission}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/15 transition-all duration-300 hover:shadow-blue-500/25 hover:brightness-110"
              >
                <span className="flex items-center justify-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  İzin Ver
                </span>
              </button>
            )}

            {streamError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/15 bg-red-500/[0.04] p-3"
              >
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400/70" />
                <p className="text-[11px] leading-relaxed text-red-400/70">
                  {streamError}
                </p>
              </motion.div>
            )}
          </div>

          {/* Right — Checks */}
          <div className="flex flex-col gap-4">
            <div className="flex-1 rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/30">
                Sistem Kontrolleri
              </p>

              <div className="flex flex-col gap-3">
                {checkItems.map((item) => (
                  <div
                    key={item.key}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-500 ${
                      checks[item.key]
                        ? "border-emerald-500/15 bg-emerald-500/[0.04]"
                        : "border-white/[0.04] bg-white/[0.01]"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-500 ${
                        checks[item.key]
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-white/[0.04] text-white/20"
                      }`}
                    >
                      {checks[item.key] ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        item.icon
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium transition-colors duration-500 ${
                          checks[item.key] ? "text-emerald-300" : "text-white/50"
                        }`}
                      >
                        {item.label}
                      </p>
                      {item.key === "audio" && permissionGranted && !checks.audio && (
                        <p className="mt-0.5 text-[10px] text-white/20">
                          Konuşarak mikrofonu test edin...
                        </p>
                      )}
                    </div>
                    {checks[item.key] && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-[10px] font-semibold text-emerald-400/60"
                      >
                        TAMAM
                      </motion.span>
                    )}
                  </div>
                ))}
              </div>

              {/* Volume meter */}
              {permissionGranted && (
                <div className="mt-5">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[10px] font-medium text-white/25">
                      Mikrofon Seviyesi
                    </span>
                    <span className="font-mono text-[10px] text-white/15">
                      {Math.round(audioLevel)}/255
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.04]">
                    <motion.div
                      className={`h-full rounded-full transition-colors duration-200 ${
                        audioLevel > AUDIO_THRESHOLD
                          ? "bg-gradient-to-r from-emerald-500 to-green-400"
                          : "bg-gradient-to-r from-blue-500 to-cyan-500"
                      }`}
                      animate={{ width: `${Math.min((audioLevel / 80) * 100, 100)}%` }}
                      transition={{ duration: 0.05, ease: "linear" }}
                    />
                  </div>
                  {!checks.audio && permissionGranted && (
                    <p className="mt-1.5 text-[10px] text-white/15">
                      Eşik değeri: {AUDIO_THRESHOLD} — Mevcut: {Math.round(audioLevel)}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Start button */}
            <button
              type="button"
              disabled={!allPassed}
              onClick={handleStart}
              className={`w-full rounded-xl px-6 py-4 text-sm font-semibold transition-all duration-300 ${
                allPassed
                  ? "bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/25 hover:brightness-110"
                  : "cursor-not-allowed border border-white/[0.04] bg-white/[0.02] text-white/15"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Play className="h-4 w-4" />
                {allPassed ? "Mülakata Başla" : "Tüm kontroller bekleniyor..."}
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════
// STAGE 3 — ARENA (Full Interview UI)
// ═══════════════════════════════════════════════════════════════

function ArenaStage({
  interviewId,
}: {
  readonly interviewId: string;
}): React.JSX.Element {
  const [aiState, setAiState] = useState<AiState>("listening");
  const [timeLeft, setTimeLeft] = useState<number>(900);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const [proctorAlert, setProctorAlert] = useState<boolean>(false);
  const proctorTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Countdown timer ──
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Keyboard controls (demo) ──
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === "Space") {
      e.preventDefault();
      setAiState((prev) => {
        const idx = AI_STATES.indexOf(prev);
        return AI_STATES[(idx + 1) % AI_STATES.length];
      });
    }

    if (e.key === "p" || e.key === "P") {
      if (proctorTimeout.current) clearTimeout(proctorTimeout.current);
      setProctorAlert(true);
      proctorTimeout.current = setTimeout(() => {
        setProctorAlert(false);
        proctorTimeout.current = null;
      }, 3000);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Cleanup proctor timeout
  useEffect(() => {
    return () => {
      if (proctorTimeout.current) clearTimeout(proctorTimeout.current);
    };
  }, []);

  const config = STATE_CONFIG[aiState];
  const transcriptLine =
    MOCK_TRANSCRIPT_LINES[AI_STATES.indexOf(aiState) % MOCK_TRANSCRIPT_LINES.length];

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#030306]">
      {/* ── Ambient background glow ── */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        animate={{ backgroundColor: config.bgGlow }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* ══════════════════════════════════════════════════
          HEADER
         ══════════════════════════════════════════════════ */}
      <header className="relative z-20 flex items-center justify-between border-b border-white/[0.04] px-6 py-4">
        {/* Left — Session label */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-400/70">
              live
            </span>
          </div>
          <span className="text-sm font-medium text-white/40">
            AgenticHR Session
          </span>
          <span className="hidden font-mono text-[10px] text-white/10 sm:inline">
            #{interviewId}
          </span>
        </div>

        {/* Center — Timer */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <span
            className={`font-mono text-lg font-bold tracking-wider ${
              timeLeft <= 60 ? "text-red-400 animate-pulse" : "text-red-500/70"
            }`}
          >
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Right — End session */}
        <Link
          href="/"
          className="group flex items-center gap-2 rounded-lg border border-red-500/10 px-4 py-2 text-xs font-semibold text-red-400/60 transition-all duration-300 hover:border-red-500/30 hover:bg-red-500/[0.06] hover:text-red-400"
        >
          <LogOut className="h-3.5 w-3.5" />
          Mülakatı Bitir
        </Link>
      </header>

      {/* ══════════════════════════════════════════════════
          CENTERPIECE — AI VISUALIZER
         ══════════════════════════════════════════════════ */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
        <div className="relative flex flex-col items-center gap-10">
          {/* Outer expanding ring */}
          <div className="relative">
            <motion.div
              className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-52 sm:w-52"
              style={{ border: `1.5px solid ${config.ringColor}` }}
              animate={{
                scale: config.outerRingScale as unknown as number[],
                opacity: config.outerRingOpacity as unknown as number[],
              }}
              transition={{
                duration: config.pulseDuration * 1.5,
                repeat: Infinity,
                ease: "easeOut",
              }}
              key={`ring1-${aiState}`}
            />
            <motion.div
              className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-52 sm:w-52"
              style={{ border: `1px solid ${config.ringColor}` }}
              animate={{
                scale: config.outerRingScale as unknown as number[],
                opacity: config.outerRingOpacity as unknown as number[],
              }}
              transition={{
                duration: config.pulseDuration * 1.5,
                repeat: Infinity,
                ease: "easeOut",
                delay: config.pulseDuration * 0.5,
              }}
              key={`ring2-${aiState}`}
            />

            {/* Third ring for thinking state — fast */}
            {aiState === "thinking" && (
              <motion.div
                className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-52 sm:w-52"
                style={{ border: `1px solid ${config.ringColor}` }}
                animate={{
                  scale: [1, 1.6],
                  opacity: [0.3, 0],
                }}
                transition={{
                  duration: 0.9,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: 0.3,
                }}
              />
            )}

            {/* Main orb */}
            <motion.div
              className="relative h-44 w-44 rounded-full sm:h-52 sm:w-52"
              animate={{
                scale: config.pulseScale as unknown as number[],
                boxShadow: config.innerShadow,
              }}
              transition={{
                scale: {
                  duration: config.pulseDuration,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                },
                boxShadow: { duration: 1.2, ease: "easeInOut" },
              }}
              key={`orb-${aiState}`}
            >
              {/* Gradient fill */}
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  background: `radial-gradient(circle at 40% 35%, ${config.glowColor} 0%, transparent 60%)`,
                }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />

              {/* Glass inner surface */}
              <div
                className="absolute inset-[3px] rounded-full"
                style={{
                  background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.04) 0%, transparent 50%), radial-gradient(circle at center, ${config.bgGlow} 0%, rgba(3,3,6,0.9) 70%)`,
                  border: `1px solid ${config.ringColor}`,
                }}
              />

              {/* Spinning highlight for thinking */}
              {aiState === "thinking" && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent 0%, rgba(168,85,247,0.08) 25%, transparent 50%)",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              )}

              {/* Waveform bars for speaking */}
              {aiState === "speaking" && (
                <div className="absolute inset-0 flex items-center justify-center gap-[5px]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-[3px] rounded-full bg-emerald-400/40"
                      animate={{
                        height: ["12px", `${22 + (i % 5) * 7}px`, "12px"],
                      }}
                      transition={{
                        duration: 0.6 + (i % 3) * 0.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.08,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Center dot for listening */}
              {aiState === "listening" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="rounded-full bg-cyan-400/20"
                    animate={{
                      width: ["6px", "10px", "6px"],
                      height: ["6px", "10px", "6px"],
                      opacity: [0.4, 0.8, 0.4],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
              )}
            </motion.div>
          </div>

          {/* State label */}
          <AnimatePresence mode="wait">
            <motion.p
              key={aiState}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="text-sm font-medium tracking-wide"
              style={{ color: config.color, opacity: 0.7 }}
            >
              {config.label}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          BOTTOM BAR
         ══════════════════════════════════════════════════ */}
      <div className="relative z-20">
        {/* Transcript overlay */}
        <AnimatePresence>
          {showTranscript && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="mx-4 mb-3 rounded-xl border border-white/[0.06] bg-black/60 p-4 backdrop-blur-xl sm:mx-6"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-500/10">
                  <MessageSquare className="h-3.5 w-3.5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-medium text-blue-400/60 mb-1">
                    Canlı Transkript
                  </p>
                  <motion.p
                    key={transcriptLine}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm leading-relaxed text-white/50"
                  >
                    {transcriptLine}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom controls */}
        <div className="flex items-center justify-center border-t border-white/[0.04] px-6 py-4">
          <button
            type="button"
            onClick={() => setShowTranscript((prev) => !prev)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium transition-all duration-300 ${
              showTranscript
                ? "border border-blue-500/20 bg-blue-500/[0.08] text-blue-400"
                : "border border-white/[0.06] bg-white/[0.02] text-white/30 hover:border-white/[0.1] hover:bg-white/[0.04] hover:text-white/50"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Canlı Alt Yazı
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          PROCTOR ALERT OVERLAY
         ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {proctorAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed left-1/2 top-6 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2"
          >
            <div className="relative overflow-hidden rounded-xl border border-red-500/20 bg-red-950/80 px-5 py-4 shadow-2xl shadow-red-500/10 backdrop-blur-xl">
              {/* Animated top border */}
              <motion.div
                className="absolute left-0 top-0 h-[2px] bg-gradient-to-r from-red-500 via-orange-500 to-red-500"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 3, ease: "linear" }}
              />

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/15">
                  <ShieldAlert className="h-4 w-4 text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-red-400">
                    ⚠️ Uyarı: Şüpheli Davranış Algılandı
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-red-300/60">
                    Lütfen ekrana odaklanın. Şüpheli göz teması kaybı algılandı.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setProctorAlert(false)}
                  className="shrink-0 rounded-md p-1 text-red-400/40 transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
