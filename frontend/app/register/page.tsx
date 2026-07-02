"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { z } from "zod";
import {
  UserPlus,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  ShieldCheck,
} from "lucide-react";

const registerSchema = z.object({
  fullName: z
    .string()
    .min(3, "Ad soyad en az 3 karakter olmalıdır."),
  email: z
    .string()
    .email("Geçerli bir e-posta adresi giriniz."),
  password: z
    .string()
    .min(8, "Şifre en az 8 karakter olmalıdır.")
    .regex(/[A-Z]/, "Şifre en az 1 büyük harf içermelidir.")
    .regex(/[0-9]/, "Şifre en az 1 rakam içermelidir."),
});

interface CandidateRecord {
  candidateId: number;
  fullName: string;
  email: string;
  password: string;
  techScore: number;
  reliability: number;
  registeredAt: string;
}

interface FieldErrors {
  fullName?: string;
  email?: string;
  password?: string;
}

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});
    setGlobalError("");
    setIsLoading(true);

    // Validate with Zod
    const result = registerSchema.safeParse({ fullName, email, password });

    if (!result.success) {
      const errors: FieldErrors = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof FieldErrors;
        if (!errors[field]) {
          errors[field] = err.message;
        }
      });
      setFieldErrors(errors);
      setIsLoading(false);
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 600));

    try {
      const raw = localStorage.getItem("agentichr_candidates");
      const candidates: CandidateRecord[] = raw ? JSON.parse(raw) : [];

      // Duplicate check
      const exists = candidates.some((c) => c.email === email);
      if (exists) {
        setGlobalError(
          "Bu e-posta adresi ile zaten kayıtlı bir hesap bulunuyor."
        );
        setIsLoading(false);
        return;
      }

      // Generate random data
      const candidateId =
        Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
      const techScore =
        Math.round((Math.random() * (10 - 6) + 6) * 10) / 10;
      const reliability =
        Math.round((Math.random() * (100 - 88) + 88) * 10) / 10;

      const newCandidate: CandidateRecord = {
        candidateId,
        fullName,
        email,
        password,
        techScore,
        reliability,
        registeredAt: new Date().toISOString(),
      };

      candidates.push(newCandidate);
      localStorage.setItem(
        "agentichr_candidates",
        JSON.stringify(candidates)
      );
      localStorage.setItem(
        "agentichr_current_user",
        JSON.stringify(newCandidate)
      );

      router.push("/apply");
    } catch {
      setGlobalError("Bir hata oluştu. Lütfen tekrar deneyin.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-zinc-950 overflow-hidden">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-violet-500/[0.07] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-cyan-500/[0.05] rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-8 shadow-2xl shadow-black/40">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="flex flex-col items-center gap-4 mb-8"
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <UserPlus className="w-7 h-7 text-violet-400" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Aday Kaydı
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                Hesap oluşturarak başvurularınızı yönetin
              </p>
            </div>
          </motion.div>

          {/* Global Error */}
          {globalError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 p-3 mb-6 rounded-xl bg-red-500/[0.08] border border-red-500/20"
            >
              <ShieldCheck className="w-4 h-4 text-red-400 shrink-0" />
              <span className="text-sm text-red-300">{globalError}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Ad Soyad
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Adınız Soyadınız"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.015] border border-white/[0.06] text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/30 transition-all"
                />
              </div>
              {fieldErrors.fullName && (
                <p className="mt-1.5 text-xs text-red-400">
                  {fieldErrors.fullName}
                </p>
              )}
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                E-posta
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.015] border border-white/[0.06] text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/30 transition-all"
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1.5 text-xs text-red-400">
                  {fieldErrors.email}
                </p>
              )}
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-white/[0.015] border border-white/[0.06] text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1.5 text-xs text-red-400">
                  {fieldErrors.password}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-md border ${
                    password.length >= 8
                      ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/[0.08]"
                      : "border-white/[0.06] text-zinc-600 bg-white/[0.015]"
                  }`}
                >
                  8+ karakter
                </span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-md border ${
                    /[A-Z]/.test(password)
                      ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/[0.08]"
                      : "border-white/[0.06] text-zinc-600 bg-white/[0.015]"
                  }`}
                >
                  1 büyük harf
                </span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-md border ${
                    /[0-9]/.test(password)
                      ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/[0.08]"
                      : "border-white/[0.06] text-zinc-600 bg-white/[0.015]"
                  }`}
                >
                  1 rakam
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Kayıt oluşturuluyor...
                  </>
                ) : (
                  <>
                    Kayıt Ol
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>
          </form>

          {/* Login Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-zinc-500">
              Zaten hesabınız var mı?{" "}
              <Link
                href="/login"
                className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
              >
                Giriş Yapın
              </Link>
            </p>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-6 pt-6 border-t border-white/[0.04] text-center"
          >
            <p className="text-xs text-zinc-600">
              AgenticHR.ai — Yapay Zeka Destekli İK Platformu
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
