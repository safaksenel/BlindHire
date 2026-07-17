"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { AppLogo } from "@/components/AppLogo";
import { useToast } from "@/components/ToastContext";
import {
  LogIn,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  AlertTriangle,
} from "lucide-react";

export default function CandidateLoginPage(): React.JSX.Element {
  return (
    <Suspense fallback={<div className="flex-1 w-full flex items-center justify-center text-white">Yükleniyor...</div>}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect");
  const { addToast } = useToast();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Hardcoded Super Admin login check
    if (email === "admin" && password === "admin") {
      const cookieOpts = rememberMe ? "; Max-Age=2592000" : "";
      document.cookie = `auth_token=authenticated; path=/; SameSite=Lax${cookieOpts}`;
      document.cookie = `user_role=SUPER_ADMIN; path=/; SameSite=Lax${cookieOpts}`;
      document.cookie = `user_name=Admin; path=/; SameSite=Lax${cookieOpts}`;
      document.cookie = `company_name=Sistem Yönetimi; path=/; SameSite=Lax${cookieOpts}`;
      
      addToast("Oturum açıldı. Hoş geldiniz, Sistem Yöneticisi.", "success");
      router.push("/admin");
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.message || "E-posta veya şifre hatalı.");
        } else {
          throw new Error("Sunucu ile bağlantı kurulamadı.");
        }
      }

      const data = await response.json();

      const cookieOpts = rememberMe ? "; Max-Age=2592000" : "";
      // Set auth cookies from successful login
      document.cookie = `auth_token=authenticated; path=/; SameSite=Lax${cookieOpts}`;
      document.cookie = `user_role=${data.role}; path=/; SameSite=Lax${cookieOpts}`;
      if (data.id) document.cookie = `user_id=${data.id}; path=/; SameSite=Lax${cookieOpts}`;
      if (data.fullName) document.cookie = `user_name=${encodeURIComponent(data.fullName)}; path=/; SameSite=Lax${cookieOpts}`;
      if (data.email) document.cookie = `user_email=${encodeURIComponent(data.email)}; path=/; SameSite=Lax${cookieOpts}`;
      if (data.companyName) document.cookie = `company_name=${encodeURIComponent(data.companyName)}; path=/; SameSite=Lax${cookieOpts}`;

      addToast(`Giriş başarılı. Hoş geldiniz, ${data.fullName || "Kullanıcı"}!`, "success");

      if (redirectPath) {
        router.push(redirectPath);
      } else if (data.role === "SUPER_ADMIN") {
        router.push("/admin");
      } else if (data.role === "HR") {
        router.push("/hr/dashboard");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch (err) {
      addToast(err instanceof Error ? err.message : "E-posta veya şifre hatalı.", "error");
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
        className="relative z-10 w-full max-w-md"
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
                Giriş Yap
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                Sisteme erişmek için kimlik bilgilerinizi girin
              </p>
            </div>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Kullanıcı Adı veya E-posta
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com veya admin"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.015] border border-white/[0.06] text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-theme-1/30 focus:border-theme-1/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.015] border border-white/[0.06] text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-theme-1/30 focus:border-theme-1/30 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-white/[0.1] bg-white/[0.02] text-theme-1 focus:ring-theme-1/30 focus:ring-offset-0"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-zinc-400 cursor-pointer select-none">
                Beni Hatırla
              </label>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
            >
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-gradient-to-r from-theme-1 to-theme-2 hover:from-theme-1 hover:to-theme-2 text-black font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-theme-1/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Giriş yapılıyor...
                  </>
                ) : (
                  <>
                    Giriş Yap
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>
          </form>

          {/* Register Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-zinc-500">
              Hesabınız yok mu?{" "}
              <Link
                href="/register"
                className="text-theme-1 hover:text-theme-1 font-medium transition-colors"
              >
                Kayıt Olun
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
