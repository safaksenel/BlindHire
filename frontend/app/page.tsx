"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Brain, Zap } from "lucide-react";
import { AppLogo } from "@/components/AppLogo";

export default function Home() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const hasAuthToken = document.cookie.includes("auth_token=authenticated");
    const hasHrToken = document.cookie.includes("hr_auth_token=authenticated");
    setIsAuth(hasAuthToken || hasHrToken);
  }, []);
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-20">
      {/* ── Background Elements ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        
        
        {/* Cyan accent — center */}
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-theme-1/[0.04] blur-[80px]" />
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
        {/* Large Central Frameless Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto flex justify-center mb-8 pointer-events-none"
        >
          <div className="relative flex h-28 w-28 items-center justify-center">
            {/* Ambient Glow behind the logo */}
            <div className="absolute inset-0 rounded-full bg-theme-1/10 blur-xl" />
            <AppLogo className="relative h-24 w-24 drop-shadow-[0_0_15px_var(--theme-c1)]" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl"
        >
          İşe Alımda{" "}
          <span className="bg-gradient-to-r from-theme-1 via-theme-2 to-theme-3 bg-clip-text text-transparent">
            Sıfır Önyargı
          </span>
          ,<br />
          Kusursuz Eşleşme.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
          className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-foreground/60 sm:text-lg"
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
            href={isAuth ? "/dashboard" : "/login"}
            id="cta-candidate"
            className="group inline-flex items-center gap-2 rounded-xl bg-theme-1/10 px-7 py-3.5 text-sm font-semibold text-theme-1 shadow-[0_0_15px_var(--theme-c1)]/20 ring-1 ring-theme-1/30 transition-all duration-300 hover:bg-theme-1/20 hover:shadow-[0_0_20px_var(--theme-c1)]/40 hover:ring-theme-1/50"
          >
            {isAuth ? "Aday Paneline Git" : "Aday Girişi"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Features grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
          className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {[
            {
              icon: Brain,
              title: "AI Destekli",
              desc: "Bağlamdan kopmayan mülakat",
            },
            {
              icon: Shield,
              title: "Önyargısız",
              desc: "100% liyakat odaklı",
            },
            {
              icon: Zap,
              title: "Gerçek Zamanlı",
              desc: "Anında analiz ve skorlama",
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="group flex flex-col items-center rounded-2xl border border-foreground/10 bg-foreground/5 p-5 transition-all hover:bg-foreground/10"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-theme-2/10 text-theme-2 transition-transform group-hover:scale-110">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-foreground/90">
                {feature.title}
              </h3>
              <p className="text-xs text-foreground/60">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
