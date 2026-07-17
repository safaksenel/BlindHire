"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, LogOut, ShieldAlert, X } from "lucide-react";

type AiState = "listening" | "thinking" | "speaking";

const AI_STATES: readonly AiState[] = ["listening", "thinking", "speaking"] as const;

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

const STATE_CONFIG: Record<AiState, StateConfig> = {
  listening: {
    label: "BlindHire Dinliyor...",
    color: "rgb(34, 211, 238)",
    glowColor: "rgba(34, 211, 238, 0.15)",
    ringColor: "rgba(34, 211, 238, 0.08)",
    bgGlow: "rgba(34, 211, 238, 0.04)",
    pulseScale: [1, 1.05],
    pulseDuration: 3,
    outerRingScale: [1, 1.3],
    outerRingOpacity: [0.3, 0],
    innerShadow: "0 0 60px 10px rgba(34,211,238,0.12), 0 0 120px 40px rgba(34,211,238,0.06)",
  },
  thinking: {
    label: "BlindHire Düşünüyor...",
    color: "rgb(168, 85, 247)",
    glowColor: "rgba(168, 85, 247, 0.18)",
    ringColor: "rgba(168, 85, 247, 0.1)",
    bgGlow: "rgba(168, 85, 247, 0.04)",
    pulseScale: [0.95, 1.08],
    pulseDuration: 1.2,
    outerRingScale: [1, 1.5],
    outerRingOpacity: [0.4, 0],
    innerShadow: "0 0 80px 15px rgba(168,85,247,0.15), 0 0 160px 50px rgba(168,85,247,0.07)",
  },
  speaking: {
    label: "BlindHire Konuşuyor...",
    color: "rgb(52, 211, 153)",
    glowColor: "rgba(52, 211, 153, 0.15)",
    ringColor: "rgba(52, 211, 153, 0.08)",
    bgGlow: "rgba(52, 211, 153, 0.04)",
    pulseScale: [0.97, 1.1],
    pulseDuration: 0.8,
    outerRingScale: [1, 1.4],
    outerRingOpacity: [0.35, 0],
    innerShadow: "0 0 70px 12px rgba(52,211,153,0.14), 0 0 140px 45px rgba(52,211,153,0.06)",
  },
} as const;

const MOCK_TRANSCRIPT_LINES: readonly string[] = [
  "BlindHire: Node.js'te memory leak tespiti için hangi toolları kullanırsınız?",
  "BlindHire: Bir production sisteminde bu problemi nasıl izole edersiniz?",
  "BlindHire: Heap snapshot analizi sırasında nelere dikkat edersiniz?",
  "BlindHire: V8 garbage collector'ın davranışını açıklar mısınız?",
] as const;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function InterviewPage(): React.JSX.Element {
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
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
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
    },
    []
  );

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
  const transcriptLine = MOCK_TRANSCRIPT_LINES[AI_STATES.indexOf(aiState) % MOCK_TRANSCRIPT_LINES.length];

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
            BlindHire Session
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
                        height: ["12px", `${22 + Math.random() * 28}px`, "12px"],
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
