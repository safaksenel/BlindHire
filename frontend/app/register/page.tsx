"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { z } from "zod";
import { AppLogo } from "@/components/AppLogo";
import { useToast } from "@/components/ToastContext";
import {
  UserPlus,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
} from "lucide-react";

const registerSchema = z
  .object({
    fullName: z.string().min(3, "Ad soyad en az 3 karakter olmalıdır."),
    email: z.string().email("Geçerli bir e-posta adresi giriniz."),
    password: z
      .string()
      .min(8, "Şifre en az 8 karakter olmalıdır.")
      .regex(/[A-Z]/, "Şifre en az 1 büyük harf içermelidir.")
      .regex(/[a-z]/, "Şifre en az 1 küçük harf içermelidir.")
      .regex(/[0-9]/, "Şifre en az 1 rakam içermelidir.")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "Şifre en az 1 özel karakter içermelidir."),
    confirmPassword: z.string().min(1, "Şifre tekrarı zorunludur."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor.",
    path: ["confirmPassword"],
  });

interface FieldErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage(): React.JSX.Element {
  const router = useRouter();
  const { addToast } = useToast();

  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isPasswordValid = password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isFormValid = fullName.length >= 3 && email.length > 5 && isPasswordValid && password === confirmPassword;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});
    setIsLoading(true);

    const result = registerSchema.safeParse({
      fullName,
      email,
      password,
      confirmPassword,
    });

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

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.message || "Kayıt işlemi başarısız oldu.");
        } else {
          throw new Error("Sunucu ile bağlantı kurulamadı.");
        }
      }

      addToast(`Kayıt işlemi tamamlandı. Aramıza hoş geldiniz, ${fullName}!`, "success");
      router.push("/login?registered=true");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Bir hata oluştu. Lütfen tekrar deneyin.", "error");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden px-4">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0">
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
        className="relative z-10 w-full max-w-md my-12"
      >
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-8 shadow-2xl shadow-black/40">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="flex flex-col items-center gap-4 mb-8"
          >
            <AppLogo className="w-16 h-16 drop-shadow-[0_0_15px_var(--theme-c1)] mb-2 ml-1.5" />
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Aday Kaydı
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                Hesap oluşturarak başvurularınızı yönetin
              </p>
            </div>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
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
                  className={`w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.015] border text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.fullName ? "border-red-500/50 focus:ring-red-500/30 focus:border-red-500/50" : "border-white/[0.06] focus:ring-theme-1/30 focus:border-theme-1/30"
                  }`}
                />
              </div>
              {fieldErrors.fullName && (
                <p className="mt-1.5 text-xs text-red-400">
                  {fieldErrors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
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
                  className={`w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.015] border text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.email ? "border-red-500/50 focus:ring-red-500/30 focus:border-red-500/50" : "border-white/[0.06] focus:ring-theme-1/30 focus:border-theme-1/30"
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1.5 text-xs text-red-400">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
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
                  className={`w-full pl-11 pr-11 py-3 rounded-xl bg-white/[0.015] border text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.password ? "border-red-500/50 focus:ring-red-500/30 focus:border-red-500/50" : "border-white/[0.06] focus:ring-theme-1/30 focus:border-theme-1/30"
                  }`}
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
                      ? "border-theme-1/30 text-theme-1 bg-theme-1/[0.08]"
                      : "border-white/[0.06] text-zinc-600 bg-white/[0.015]"
                  }`}
                >
                  8+ karakter
                </span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-md border ${
                    /[A-Z]/.test(password)
                      ? "border-theme-1/30 text-theme-1 bg-theme-1/[0.08]"
                      : "border-white/[0.06] text-zinc-600 bg-white/[0.015]"
                  }`}
                >
                  1 büyük harf
                </span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-md border ${
                    /[0-9]/.test(password)
                      ? "border-theme-1/30 text-theme-1 bg-theme-1/[0.08]"
                      : "border-white/[0.06] text-zinc-600 bg-white/[0.015]"
                  }`}
                >
                  1 rakam
                </span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-md border ${
                    /[a-z]/.test(password)
                      ? "border-theme-1/30 text-theme-1 bg-theme-1/[0.08]"
                      : "border-white/[0.06] text-zinc-600 bg-white/[0.015]"
                  }`}
                >
                  1 küçük harf
                </span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-md border ${
                    /[!@#$%^&*(),.?":{}|<>]/.test(password)
                      ? "border-theme-1/30 text-theme-1 bg-theme-1/[0.08]"
                      : "border-white/[0.06] text-zinc-600 bg-white/[0.015]"
                  }`}
                >
                  1 özel karakter
                </span>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Şifreyi Onayla
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={`w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.015] border text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.confirmPassword || (confirmPassword && password !== confirmPassword) ? "border-red-500/50 focus:ring-red-500/30 focus:border-red-500/50" : "border-white/[0.06] focus:ring-theme-1/30 focus:border-theme-1/30"
                  }`}
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-400">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-gradient-to-r from-theme-1 to-theme-2 hover:from-theme-1 hover:to-theme-2 text-black font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-theme-1/20"
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
                className="text-theme-1 hover:text-theme-1 font-medium transition-colors"
              >
                Giriş Yapın
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
