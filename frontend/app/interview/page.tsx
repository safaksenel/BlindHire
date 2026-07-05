"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  LogOut,
  ShieldAlert,
  X,
  Mic,
  MicOff,
  Globe,
  Play,
  CheckCircle2,
  WifiOff,
} from "lucide-react";
import {
  useInterview,
  type AiState,
  type InterviewLanguage,
  type Scorecard,
} from "@/lib/use-interview";

// ── State Visual Config ────────────────────────────

interface StateConfig {
  readonly label: string;
  readonly labelEn: string;
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

const STATE_CONFIG: Record<AiState, StateConfig> = {
  idle: {
    label: "Başlamak için hazır",
    labelEn: "Ready to start",
    color: "rgb(148, 163, 184)",
    glowColor: "rgba(148, 163, 184, 0.1)",
    ringColor: "rgba(148, 163, 184, 0.06)",
    bgGlow: "rgba(148, 163, 184, 0.02)",
    pulseScale: [1, 1.02],
    pulseDuration: 4,
    outerRingScale: [1, 1.15],
    outerRingOpacity: [0.2, 0],
    innerShadow:
      "0 0 40px 8px rgba(148,163,184,0.06), 0 0 80px 30px rgba(148,163,184,0.03)",
  },
  listening: {
    label: "Mira Dinliyor...",
    labelEn: "Mira is Listening...",
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
    label: "Mira Düşünüyor...",
    labelEn: "Mira is Thinking...",
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
    label: "Mira Konuşuyor...",
    labelEn: "Mira is Speaking...",
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
};

// ── Time formatter ─────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// ── Scorecard Component ────────────────────────────

function ScorecardView({
  scorecard,
  language,
}: {
  readonly scorecard: Scorecard;
  readonly language: InterviewLanguage;
}) {
  const isTr = language === "tr";

  const labels: Record<string, { tr: string; en: string }> = {
    technical_knowledge: { tr: "Teknik Bilgi", en: "Technical Knowledge" },
    problem_solving: { tr: "Problem Çözme", en: "Problem Solving" },
    analytical_thinking: { tr: "Analitik Düşünme", en: "Analytical Thinking" },
    communication: { tr: "İletişim", en: "Communication" },
    practical_experience: { tr: "Pratik Deneyim", en: "Practical Experience" },
  };

  const recColors: Record<string, string> = {
    STRONG_HIRE: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    HIRE: "text-green-400 bg-green-500/10 border-green-500/20",
    MAYBE: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    NO_HIRE: "text-red-400 bg-red-500/10 border-red-500/20",
  };

  const metrics = [
    "technical_knowledge",
    "problem_solving",
    "analytical_thinking",
    "communication",
    "practical_experience",
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
    >
      <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0a0a12] p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 ring-1 ring-emerald-500/30"
          >
            <CheckCircle2 className="h-7 w-7 text-emerald-400" />
          </motion.div>
          <h2 className="text-xl font-bold text-white">
            {isTr ? "Mülakat Tamamlandı" : "Interview Completed"}
          </h2>
          <p className="mt-1 text-sm text-white/40">
            {isTr ? "Anonim Değerlendirme Raporu" : "Anonymous Evaluation Report"}
          </p>
        </div>

        {/* Recommendation Badge */}
        <div className="mb-5 flex justify-center">
          <span
            className={`rounded-full border px-4 py-1.5 text-sm font-bold ${recColors[scorecard.recommendation]}`}
          >
            {scorecard.recommendation.replace("_", " ")}
          </span>
        </div>

        {/* Overall Score */}
        <div className="mb-5 text-center">
          <span className="text-4xl font-bold text-white">
            {scorecard.overall_score.toFixed(1)}
          </span>
          <span className="text-lg text-white/30"> / 10</span>
        </div>

        {/* Metric Bars */}
        <div className="mb-5 space-y-3">
          {metrics.map((key, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/50">
                  {isTr ? labels[key].tr : labels[key].en}
                </span>
                <span className="font-mono font-bold text-white/70">
                  {(scorecard[key as keyof Scorecard] as number).toFixed(1)}
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((scorecard[key as keyof Scorecard] as number) / 10) * 100}%`,
                  }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="mb-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <p className="text-xs leading-relaxed text-white/50">
            {scorecard.summary}
          </p>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400/60">
              {isTr ? "Güçlü Yönler" : "Strengths"}
            </p>
            {scorecard.strengths.map((s, i) => (
              <p key={i} className="text-[11px] text-emerald-300/50">
                • {s}
              </p>
            ))}
          </div>
          <div className="rounded-xl border border-amber-500/10 bg-amber-500/[0.03] p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-amber-400/60">
              {isTr ? "Gelişim Alanları" : "Improvements"}
            </p>
            {scorecard.areas_for_improvement.map((s, i) => (
              <p key={i} className="text-[11px] text-amber-300/50">
                • {s}
              </p>
            ))}
          </div>
        </div>

        {/* Action */}
        <div className="mt-5 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110"
          >
            {isTr ? "Ana Sayfaya Dön" : "Return to Home"}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Interview Page ────────────────────────────

export default function InterviewPage(): React.JSX.Element {
  const [language, setLanguage] = useState<InterviewLanguage>("tr");
  const [showTranscript, setShowTranscript] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [proctorAlert, setProctorAlert] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const proctorTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const interview = useInterview({
    language,
    onInterviewComplete: (scorecard) => {
      console.log("Interview completed!", scorecard);
    },
  });

  const config = STATE_CONFIG[interview.aiState];
  const isTr = language === "tr";

  // ── Timer ────────────────────────────────────
  useEffect(() => {
    if (!interview.isStarted || interview.isCompleted) return;
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [interview.isStarted, interview.isCompleted]);

  // ── Tab Switch Detection (Proctor) ───────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && interview.isStarted && !interview.isCompleted) {
        if (proctorTimeout.current) clearTimeout(proctorTimeout.current);
        setProctorAlert(true);
        proctorTimeout.current = setTimeout(() => {
          setProctorAlert(false);
          proctorTimeout.current = null;
        }, 4000);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (proctorTimeout.current) clearTimeout(proctorTimeout.current);
    };
  }, [interview.isStarted, interview.isCompleted]);

  // Get the last transcript entry
  const lastTranscript = interview.transcript[interview.transcript.length - 1];

  // Compute dynamic scale based on volume (for the orb)
  const volumeScale = 1 + interview.volumeLevel * 0.15;

  // ── Language Picker Overlay ──────────────────
  if (showLangPicker && !interview.isStarted) {
    return (
      <div className="relative flex h-screen flex-col items-center justify-center overflow-hidden bg-[#030306]">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-blue-500/[0.05] blur-[120px]" />
          <div className="absolute -bottom-48 -left-48 h-[400px] w-[400px] rounded-full bg-purple-600/[0.06] blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 mx-auto max-w-md text-center"
        >
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 ring-1 ring-white/[0.08]">
            <Mic className="h-7 w-7 text-blue-400" />
          </div>

          <h1 className="mb-2 text-2xl font-bold text-white">
            {isTr ? "Sesli Mülakat" : "Voice Interview"}
          </h1>
          <p className="mb-8 text-sm text-white/40">
            {isTr
              ? "Mülakat dilinizi seçin ve başlayın. Mira, AI mülakat ajanınız sizi karşılayacak."
              : "Select your interview language and begin. Mira, your AI interviewer, will greet you."}
          </p>

          {/* Language Selection */}
          <div className="mb-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setLanguage("tr")}
              className={`flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium transition-all duration-300 ${
                language === "tr"
                  ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                  : "border-white/[0.06] bg-white/[0.02] text-white/40 hover:border-white/[0.12] hover:text-white/60"
              }`}
            >
              <Globe className="h-4 w-4" />
              Türkçe
            </button>
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium transition-all duration-300 ${
                language === "en"
                  ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                  : "border-white/[0.06] bg-white/[0.02] text-white/40 hover:border-white/[0.12] hover:text-white/60"
              }`}
            >
              <Globe className="h-4 w-4" />
              English
            </button>
          </div>

          {/* Browser support warning */}
          {!interview.isSpeechSupported && (
            <div className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-4 py-2 text-xs text-amber-400">
              {isTr
                ? "⚠️ Tarayıcınız Web Speech API desteklemiyor. Lütfen Chrome kullanın."
                : "⚠️ Your browser doesn't support Web Speech API. Please use Chrome."}
            </div>
          )}

          {/* Error display */}
          {interview.error && (
            <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/[0.06] px-4 py-2 text-xs text-red-400">
              {interview.error}
            </div>
          )}

          {/* Start Button */}
          <button
            type="button"
            onClick={() => {
              setShowLangPicker(false);
              interview.startInterview();
            }}
            disabled={!interview.isSpeechSupported}
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:shadow-blue-500/30 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Play className="h-4 w-4" />
            {isTr ? "Mülakatı Başlat" : "Start Interview"}
          </button>

          <p className="mt-4 text-[11px] text-white/20">
            {isTr
              ? "Mikrofon ve hoparlör erişimi gereklidir"
              : "Microphone and speaker access required"}
          </p>
        </motion.div>
      </div>
    );
  }

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

      {/* ══════════════════════════════════════════
          HEADER
         ══════════════════════════════════════════ */}
      <header className="relative z-20 flex items-center justify-between border-b border-white/[0.04] px-6 py-4">
        {/* Left — Session status */}
        <div className="flex items-center gap-3">
          {/* Connection indicator */}
          <div className="flex items-center gap-1.5">
            {interview.isConnected ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-400/70">
                  live
                </span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 text-white/20" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/20">
                  {isTr ? "bağlanıyor" : "connecting"}
                </span>
              </>
            )}
          </div>
          <span className="text-sm font-medium text-white/40">
            BlindHire Session
          </span>
        </div>

        {/* Center — Timer */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center gap-3">
            <span className="font-mono text-lg font-bold tracking-wider text-white/50">
              {formatTime(timeElapsed)}
            </span>
            {/* Progress bar */}
            <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-white/[0.06] sm:block">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                animate={{ width: `${interview.progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* Right — End session */}
        <button
          type="button"
          onClick={() => interview.endInterview()}
          className="group flex items-center gap-2 rounded-lg border border-red-500/10 px-4 py-2 text-xs font-semibold text-red-400/60 transition-all duration-300 hover:border-red-500/30 hover:bg-red-500/[0.06] hover:text-red-400"
        >
          <LogOut className="h-3.5 w-3.5" />
          {isTr ? "Mülakatı Bitir" : "End Interview"}
        </button>
      </header>

      {/* ══════════════════════════════════════════
          CENTERPIECE — AI VISUALIZER
         ══════════════════════════════════════════ */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
        <div className="relative flex flex-col items-center gap-10">
          {/* Outer expanding rings */}
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
              key={`ring1-${interview.aiState}`}
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
              key={`ring2-${interview.aiState}`}
            />

            {/* Third ring for thinking state */}
            {interview.aiState === "thinking" && (
              <motion.div
                className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-52 sm:w-52"
                style={{ border: `1px solid ${config.ringColor}` }}
                animate={{ scale: [1, 1.6], opacity: [0.3, 0] }}
                transition={{
                  duration: 0.9,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: 0.3,
                }}
              />
            )}

            {/* Main orb — scale reacts to volume when listening */}
            <motion.div
              className="relative h-44 w-44 rounded-full sm:h-52 sm:w-52"
              animate={{
                scale:
                  interview.aiState === "listening"
                    ? [volumeScale * 0.98, volumeScale * 1.02]
                    : (config.pulseScale as unknown as number[]),
                boxShadow: config.innerShadow,
              }}
              transition={{
                scale: {
                  duration:
                    interview.aiState === "listening"
                      ? 0.15
                      : config.pulseDuration,
                  repeat: interview.aiState === "listening" ? 0 : Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                },
                boxShadow: { duration: 1.2, ease: "easeInOut" },
              }}
              key={`orb-${interview.aiState}`}
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
              {interview.aiState === "thinking" && (
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
              {interview.aiState === "speaking" && (
                <div className="absolute inset-0 flex items-center justify-center gap-[5px]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-[3px] rounded-full bg-emerald-400/40"
                      animate={{
                        height: [
                          "12px",
                          `${22 + Math.random() * 28}px`,
                          "12px",
                        ],
                      }}
                      transition={{
                        duration: 0.6 + Math.random() * 0.4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.08,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Volume-reactive bars for listening */}
              {interview.aiState === "listening" && (
                <div className="absolute inset-0 flex items-center justify-center gap-[4px]">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const offset = Math.abs(i - 3) / 3;
                    const heightBase = 8 + interview.volumeLevel * 50 * (1 - offset * 0.5);
                    return (
                      <motion.div
                        key={i}
                        className="w-[2.5px] rounded-full bg-cyan-400/30"
                        animate={{
                          height: `${Math.max(6, heightBase)}px`,
                        }}
                        transition={{ duration: 0.1, ease: "easeOut" }}
                      />
                    );
                  })}
                </div>
              )}

              {/* Idle center dot */}
              {interview.aiState === "idle" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="rounded-full bg-white/10"
                    animate={{
                      width: ["8px", "12px", "8px"],
                      height: ["8px", "12px", "8px"],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 3,
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
            <motion.div
              key={interview.aiState}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-2"
            >
              <p
                className="text-sm font-medium tracking-wide"
                style={{ color: config.color, opacity: 0.7 }}
              >
                {isTr ? config.label : config.labelEn}
              </p>

              {/* Interim text (what candidate is currently saying) */}
              {interview.interimText && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="max-w-md text-center text-xs italic text-white/30"
                >
                  &ldquo;{interview.interimText}&rdquo;
                </motion.p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          BOTTOM BAR
         ══════════════════════════════════════════ */}
      <div className="relative z-20">
        {/* Transcript overlay */}
        <AnimatePresence>
          {showTranscript && interview.transcript.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="mx-4 mb-3 max-h-48 overflow-y-auto rounded-xl border border-white/[0.06] bg-black/60 p-4 backdrop-blur-xl sm:mx-6"
            >
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-white/20">
                {isTr ? "Canlı Transkript" : "Live Transcript"}
              </p>
              <div className="space-y-2.5">
                {interview.transcript.map((entry, i) => (
                  <div key={i} className="flex gap-2">
                    <span
                      className={`mt-0.5 shrink-0 text-[10px] font-bold uppercase ${
                        entry.role === "interviewer"
                          ? "text-blue-400/50"
                          : "text-cyan-400/50"
                      }`}
                    >
                      {entry.role === "interviewer" ? "Mira" : isTr ? "Siz" : "You"}
                    </span>
                    <p className="text-xs leading-relaxed text-white/40">
                      {entry.content}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom controls */}
        <div className="flex flex-col items-center justify-center gap-3 border-t border-white/[0.04] px-6 py-4">
          {/* Custom text fallback input (for testing and accessibility) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customInput.trim()) {
                interview.sendTextMessage(customInput.trim());
                setCustomInput("");
              }
            }}
            className="flex w-full max-w-lg items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1.5 focus-within:border-blue-500/30"
          >
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder={isTr ? "Mikrofon yerine yazarak yanıt ver..." : "Or type your answer here..."}
              className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white outline-none placeholder:text-white/20"
            />
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white transition-all hover:bg-blue-500"
            >
              {isTr ? "Gönder" : "Send"}
            </button>
          </form>

          <div className="flex items-center justify-center gap-3">
            {/* Mic status */}
            <div
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs ${
                interview.aiState === "listening"
                  ? "border-cyan-500/20 bg-cyan-500/[0.06] text-cyan-400"
                  : "border-white/[0.06] bg-white/[0.02] text-white/25"
              }`}
            >
              {interview.aiState === "listening" ? (
                <Mic className="h-3.5 w-3.5" />
              ) : (
                <MicOff className="h-3.5 w-3.5" />
              )}
              {interview.aiState === "listening"
                ? isTr
                  ? "Mikrofon Aktif"
                  : "Mic Active"
                : isTr
                  ? "Mikrofon Beklemede"
                  : "Mic Standby"}
            </div>

            {/* Transcript toggle */}
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
              {isTr ? "Canlı Alt Yazı" : "Live Captions"}
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          PROCTOR ALERT OVERLAY
         ══════════════════════════════════════════ */}
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
              <motion.div
                className="absolute left-0 top-0 h-[2px] bg-gradient-to-r from-red-500 via-orange-500 to-red-500"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 4, ease: "linear" }}
              />
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/15">
                  <ShieldAlert className="h-4 w-4 text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-red-400">
                    ⚠️ {isTr ? "Uyarı: Sekme Değişikliği Algılandı" : "Warning: Tab Switch Detected"}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-red-300/60">
                    {isTr
                      ? "Mülakat sırasında başka sekmelere geçmek tespit edilmektedir."
                      : "Switching to other tabs during the interview is being tracked."}
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

      {/* ══════════════════════════════════════════
          SCORECARD OVERLAY
         ══════════════════════════════════════════ */}
      {interview.isCompleted && interview.scorecard && (
        <ScorecardView scorecard={interview.scorecard} language={language} />
      )}
    </div>
  );
}
