"use client";

import { motion } from "framer-motion";
import { ArrowRight, Shield, Brain, Zap } from "lucide-react";
import Link from "next/link";

interface FeatureCardProps {
  readonly icon: React.ReactNode;
  readonly title: string;
  readonly description: string;
  readonly delay: number;
}

function FeatureCard({ icon, title, description, delay }: FeatureCardProps): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] to-purple-500/[0.03] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative z-10">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400">
          {icon}
        </div>
        <h3 className="mb-2 text-sm font-semibold text-white">{title}</h3>
        <p className="text-sm leading-relaxed text-white/50">{description}</p>
      </div>
    </motion.div>
  );
}

const FEATURES: readonly Omit<FeatureCardProps, "delay">[] = [
  {
    icon: <Shield className="h-5 w-5" />,
    title: "Sıfır Güven Mimarisi",
    description: "JWT tabanlı, uçtan uca şifreli, denetim günlüklü güvenlik altyapısı.",
  },
  {
    icon: <Brain className="h-5 w-5" />,
    title: "Otonom AI Ajanı",
    description: "İnsan müdahalesi gerektirmeyen, gerçek zamanlı mülakat ve değerlendirme.",
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: "Anlık Liyakat Skoru",
    description: "Yapay zeka destekli, önyargısız yetkinlik analizi ve sıralama.",
  },
] as const;

export default function LandingPage(): React.JSX.Element {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      {/* ── Radial gradient backgrounds ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        {/* Primary blue glow — top right */}
        <div className="absolute -right-32 -top-32 h-[600px] w-[600px] rounded-full bg-blue-500/[0.07] blur-[120px]" />
        {/* Secondary purple glow — bottom left */}
        <div className="absolute -bottom-48 -left-48 h-[500px] w-[500px] rounded-full bg-purple-600/[0.08] blur-[100px]" />
        {/* Cyan accent — center */}
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.04] blur-[80px]" />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* ── Hero content ── */}
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-xs font-medium text-white/60 backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Otonom İşe Alım Platformu
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="mb-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl"
        >
          İşe Alımda{" "}
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Sıfır Önyargı
          </span>
          ,<br />
          Otonom Liyakat.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
          className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-white/50 sm:text-lg"
        >
          AgenticHR.ai ile tanışın. Sadece yeteneğe odaklanan, insan
          müdahalesiz, gerçek zamanlı AI mülakat ajanı.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/login"
            id="cta-candidate"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:shadow-blue-500/30 hover:brightness-110"
          >
            Aday Girişi
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/login?redirect=/hr/dashboard"
            id="cta-hr-panel"
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.03] px-7 py-3.5 text-sm font-semibold text-white/80 backdrop-blur-sm transition-all duration-300 hover:border-white/[0.2] hover:bg-white/[0.06] hover:text-white"
          >
            İK Paneli
          </Link>
        </motion.div>
      </div>

      {/* ── Feature cards ── */}
      <div className="relative z-10 mx-auto mt-24 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        {FEATURES.map((feature, index) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            delay={0.55 + index * 0.12}
          />
        ))}
      </div>

      {/* ── Footer accent line ── */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"
      />
    </main>
  );
}
