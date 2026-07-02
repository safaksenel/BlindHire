"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUp, CheckCircle2, Upload, Sparkles, Mail } from "lucide-react";

type UploadStatus = "idle" | "uploading" | "success";

export default function ApplyPage(): React.JSX.Element {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [fileName, setFileName] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startUpload = useCallback((name: string) => {
    setFileName(name);
    setStatus("uploading");
    setProgress(0);

    if (intervalRef.current) clearInterval(intervalRef.current);

    let current = 0;
    intervalRef.current = setInterval(() => {
      current += 2;
      setProgress(current);
      if (current >= 100) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setStatus("success");
      }
    }, 50);
  }, []);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file || status !== "idle") return;
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext !== "pdf" && ext !== "docx") return;
      startUpload(file.name);
    },
    [status, startUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleClick = useCallback(() => {
    if (status === "idle") inputRef.current?.click();
  }, [status]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFile(e.target.files?.[0]);
    },
    [handleFile]
  );

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16">
      {/* Background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-600/[0.06] blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-purple-600/[0.06] blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 ring-1 ring-white/[0.06]">
            <Sparkles className="h-5 w-5 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            CV&apos;nizi Yükleyin{" "}
            <span className="text-white/40">(PDF/DOCX)</span>
          </h1>
          <p className="mt-2 text-sm text-white/40">
            Sadece yeteneklerinize odaklanıyoruz.
          </p>
        </motion.div>

        {/* Upload zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <AnimatePresence mode="wait">
            {/* IDLE STATE */}
            {status === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3 }}
                role="button"
                tabIndex={0}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={handleClick}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleClick();
                }}
                className="group relative cursor-pointer rounded-2xl border-2 border-dashed border-white/[0.08] bg-white/[0.015] p-12 text-center transition-all duration-300 hover:border-blue-500/30 hover:bg-white/[0.03]"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/[0.02] to-purple-500/[0.02] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.06] transition-all duration-300 group-hover:bg-blue-500/10 group-hover:ring-blue-500/20">
                    <FileUp className="h-7 w-7 text-white/30 transition-colors group-hover:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/60 transition-colors group-hover:text-white/80">
                      Dosyanızı sürükleyin veya{" "}
                      <span className="text-blue-400 underline underline-offset-2">
                        seçmek için tıklayın
                      </span>
                    </p>
                    <p className="mt-1.5 text-xs text-white/25">
                      Desteklenen formatlar: PDF, DOCX — Maks. 10MB
                    </p>
                  </div>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={handleChange}
                />
              </motion.div>
            )}

            {/* UPLOADING STATE */}
            {status === "uploading" && (
              <motion.div
                key="uploading"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10"
              >
                <div className="flex flex-col items-center gap-5">
                  <div className="relative flex h-16 w-16 items-center justify-center">
                    <svg className="absolute h-16 w-16 animate-spin" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
                      <circle cx="32" cy="32" r="28" fill="none" stroke="url(#gradient)" strokeWidth="4" strokeLinecap="round" strokeDasharray="80 100" />
                      <defs>
                        <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <Upload className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-white/80">
                      Yapay Zeka CV&apos;nizi inceliyor...
                    </p>
                    <p className="mt-1 text-xs text-white/30 font-mono">{fileName}</p>
                  </div>
                  <div className="w-full">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs text-white/30">İlerleme</span>
                      <span className="text-xs font-mono text-blue-400">%{progress}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.1, ease: "linear" }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SUCCESS STATE */}
            {status === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.03] p-10"
              >
                <div className="flex flex-col items-center gap-5">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20"
                  >
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  </motion.div>

                  <div className="text-center">
                    <p className="text-sm font-semibold text-emerald-300">
                      CV&apos;niz başarıyla yüklendi!
                    </p>
                    <p className="mt-1 text-xs text-white/30 font-mono">{fileName}</p>
                    <p className="mt-4 max-w-sm text-xs leading-relaxed text-white/40">
                      Değerlendirme sonucunda mülakat bağlantınız ve özel şifreniz
                      e-posta adresinize iletilecektir.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-blue-500/10 bg-blue-500/[0.04] px-4 py-2.5">
                    <Mail className="h-4 w-4 text-blue-400/60" />
                    <span className="text-[11px] font-medium text-white/25">
                      E-postanızı kontrol edin
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Privacy footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 text-center text-[11px] leading-relaxed text-white/20"
        >
          CV&apos;niz uçtan uca şifrelenir. Kişisel bilgileriniz (isim, cinsiyet, yaş, fotoğraf)
          değerlendirme sürecinden otomatik olarak çıkarılır.
        </motion.p>
      </div>
    </main>
  );
}
