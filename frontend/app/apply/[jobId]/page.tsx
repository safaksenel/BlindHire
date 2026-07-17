"use client";

import { useCallback, useRef, useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUp, CheckCircle2, Upload, Sparkles, Mail, Building2, Loader2, ArrowLeft, Home, Calendar, Clock, ArrowRight, X, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastContext";

type UploadStatus = "idle" | "uploading" | "success";

export default function JobApplyPage({ params }: { params: Promise<{ jobId: string }> }) {
  const router = useRouter();
  const { addToast } = useToast();
  const unwrappedParams = use(params);
  const jobId = unwrappedParams.jobId;

  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [fileName, setFileName] = useState<string>("");
  const [uploadResult, setUploadResult] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const checkRunRef = useRef(false);

  useEffect(() => {
    if (checkRunRef.current) return;
    checkRunRef.current = true;

    async function checkProfileAndFetchJob() {
      try {
        // 1. Profil Kontrolü
        const profileRes = await fetch('/api/users/profile');
        if (!profileRes.ok) {
          router.push('/login');
          return;
        }
        const profileData = await profileRes.json();
        if (!profileData.isProfileComplete) {
          addToast("Başvuru yapmadan önce zorunlu profil alanlarını tamamlamanız gerekmektedir.", "error");
          router.push('/user/profile');
          return; 
        }

        // 2. İlan Detaylarını Çekme
        const res = await fetch(`/api/jobs/${jobId}`);
        if (!res.ok) throw new Error("İlan bulunamadı.");
        const data = await res.json();
        setJob(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    void checkProfileAndFetchJob();
  }, [jobId, router, addToast]);

  const startUpload = useCallback(async (file: File) => {
    setFileName(file.name);
    setStatus("uploading");
    setProgress(0);
    setUploadResult(null);

    if (intervalRef.current) clearInterval(intervalRef.current);

    let current = 0;
    intervalRef.current = setInterval(() => {
      current += 2;
      setProgress(current);
      if (current >= 90) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        
        const formData = new FormData();
        formData.append("jobId", jobId);
        formData.append("file", file);

        fetch("/api/applications", {
          method: "POST",
          body: formData
        }).then(async (res) => {
           if (!res.ok) {
              const e = await res.json();
              addToast(e.message || "Hata", "error");
              setStatus("idle");
              return;
           }
           const result = await res.json();
           setUploadResult(result);
           setProgress(100);
           setStatus("success");
        }).catch(() => {
           addToast("Sunucu hatası", "error");
           setStatus("idle"); 
        });
      }
    }, 50);
  }, [jobId, addToast]);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file || status !== "idle") return;
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext !== "pdf" && ext !== "docx") {
         addToast("Lütfen sadece PDF veya DOCX yükleyin.", "error");
         return;
      }
      void startUpload(file);
    },
    [status, startUpload, addToast]
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white gap-4 bg-[#030306]">
        <Loader2 className="w-8 h-8 animate-spin text-theme-1" />
        <p className="text-zinc-500">İlan detayları yükleniyor...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white gap-6 px-4 bg-[#030306]">
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center max-w-md">
          <p className="text-red-400 font-medium mb-4">{error || "İlan bulunamadı."}</p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Panele Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#030306] p-8 pt-24 relative">
      {/* Background grids */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 flex flex-col gap-6 lg:flex-row">
        
        {/* Left Column - Job Details (60%) */}
        <div className="flex-1 flex flex-col gap-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm w-fit">
            <ArrowLeft className="w-4 h-4" /> Geri Dön
          </Link>
          
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 backdrop-blur-xl">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-theme-1/10 rounded-xl border border-theme-1/20">
                  <Building2 className="w-6 h-6 text-theme-1" />
                </div>
                <div>
                   <h1 className="text-3xl font-bold text-white">{job.title}</h1>
                   <p className="text-zinc-400 text-sm mt-1">{job.companyName}</p>
                </div>
             </div>

             <div className="flex flex-wrap gap-3 mb-8 pb-8 border-b border-white/[0.05]">
                {job.startDate && (
                   <div className="flex items-center gap-2 px-4 py-2 bg-theme-1/[0.06] border border-theme-1/20 rounded-lg text-sm text-theme-1 font-medium">
                     <Calendar className="w-4 h-4" />
                     Başlangıç: {new Date(job.startDate).toLocaleDateString("tr-TR")}
                   </div>
                )}
                {job.endDate && (
                   <div className="flex items-center gap-2 px-4 py-2 bg-theme-2/[0.06] border border-theme-2/20 rounded-lg text-sm text-theme-2 font-medium">
                     <Clock className="w-4 h-4" />
                     Bitiş: {new Date(job.endDate).toLocaleDateString("tr-TR")}
                   </div>
                )}
                {!job.startDate && !job.endDate && (
                   <div className="flex items-center gap-2 px-4 py-2 bg-theme-3/[0.06] border border-theme-3/20 rounded-lg text-sm text-theme-3 font-medium">
                     <Calendar className="w-4 h-4" />
                     Yayın: {new Date(job.createdAt).toLocaleDateString("tr-TR")}
                   </div>
                )}
                <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/[0.05] rounded-lg text-sm text-zinc-300 font-medium">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  Tam Zamanlı
                </div>
                {job.status === "ACTIVE" && (
                   <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-400 font-medium">
                     Aktif İlan
                   </div>
                )}
             </div>

             <div className="prose prose-invert max-w-none text-zinc-300">
                <h3 className="text-xl font-semibold text-white mb-4">İlan Detayları</h3>
                <div 
                   className="leading-relaxed prose-headings:text-theme-1 prose-a:text-theme-2 prose-strong:text-white"
                   dangerouslySetInnerHTML={{ __html: job.description }} 
                />
             </div>
          </div>
        </div>

        {/* Right Column - Upload Panel (40%) */}
        <div className="w-full lg:w-[450px] shrink-0">
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 shadow-2xl backdrop-blur-xl"
            >
                <div className="mb-8 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                  <h3 className="text-lg font-bold mb-6 text-white">Başvuru Süreci</h3>
                  <div className="space-y-0">
                    {(() => {
                      const status = job.userApplication?.status;
                      const techScore = job.userApplication?.techScore;
                      const reliability = job.userApplication?.reliability;

                      let level = 0;
                      let rejectedStep = 0;

                      if (status === "PENDING") level = 2;
                      else if (status === "LLM_REVIEW") level = 3;
                      else if (status === "MANUAL_REVIEW") level = 4;
                      else if (status === "INVITED" || status === "INTERVIEW_INVITED") level = 5;
                      else if (status === "COMPLETED") level = 6;
                      else if (status === "REJECTED") {
                          level = 99;
                          if (!reliability || reliability === 0) {
                              rejectedStep = 2; // ATS
                          } else if (reliability > 0) {
                              // If it has reliability but still rejected, it could be LLM or HR. 
                              // Let's assume LLM if it's below a decent score, otherwise HR.
                              rejectedStep = reliability < 70 ? 3 : 4; 
                          }
                      }

                      const steps = [
                        { num: 1, title: "Başvuru Alındı", desc: "Özgeçmişiniz sisteme başarıyla yüklendi." },
                        { num: 2, title: "ATS Taraması", desc: "Yetkinlikleriniz ATS tarafından değerlendirildi." },
                        { num: 3, title: "Yapay Zeka (LLM)", desc: "Yapay zeka analiz süreci değerlendirildi." },
                        { num: 4, title: "İK Onayı", desc: "İK yetkilisi değerlendirmesi." },
                        { num: 5, title: "Mülakat Aşaması", desc: "Mülakat daveti ve değerlendirmesi." },
                      ];

                      return steps.map((step, idx) => {
                        const isLast = idx === steps.length - 1;
                        let icon, iconBg, lineBg, titleColor, descColor;

                        if (level === 99) {
                            if (step.num < rejectedStep) {
                                // Passthrough steps
                                icon = <CheckCircle2 className="w-5 h-5"/>;
                                iconBg = "bg-theme-1/20 text-theme-1";
                                lineBg = "bg-theme-1/20";
                                titleColor = "text-white";
                                descColor = "text-zinc-400";
                            } else if (step.num === rejectedStep) {
                                // Rejected step
                                icon = <X className="w-5 h-5"/>;
                                iconBg = "bg-red-500/20 text-red-400";
                                lineBg = "bg-white/10";
                                titleColor = "text-white";
                                descColor = "text-red-400/80";
                            } else {
                                // Untouched steps after rejection
                                icon = <div className="w-2 h-2 rounded-full bg-white/20" />;
                                iconBg = "bg-white/5 text-zinc-500";
                                lineBg = "bg-white/10";
                                titleColor = "text-zinc-500";
                                descColor = "text-zinc-600";
                            }
                        } else {
                            if (level > step.num) {
                                // Completed
                                icon = <CheckCircle2 className="w-5 h-5"/>;
                                iconBg = "bg-theme-1/20 text-theme-1";
                                lineBg = "bg-theme-1/20";
                                titleColor = "text-white";
                                descColor = "text-zinc-400";
                            } else if (level === step.num) {
                                // Current active step
                                icon = <Loader2 className="w-4 h-4 animate-spin"/>;
                                iconBg = "bg-white/10 text-zinc-400";
                                lineBg = "bg-white/10";
                                titleColor = "text-white";
                                descColor = "text-zinc-400";
                            } else {
                                // Future step
                                icon = <div className="w-2 h-2 rounded-full bg-white/20" />;
                                iconBg = "bg-white/5 text-zinc-500";
                                lineBg = "bg-white/10";
                                titleColor = "text-zinc-500";
                                descColor = "text-zinc-600";
                            }
                        }

                        // Override desc text for rejected step to make it clear
                        let finalDesc = step.desc;
                        if (level === 99 && step.num === rejectedStep) {
                            if (step.num === 2) finalDesc = "Yetkinlikleriniz kriterleri karşılamadı.";
                            if (step.num === 3) finalDesc = "Yapay zeka analizinden geçemediniz.";
                            if (step.num === 4) finalDesc = "İK değerlendirmesi olumsuz sonuçlandı.";
                            if (step.num === 5) finalDesc = "Mülakat süreciniz olumsuz sonuçlandı.";
                        } else if (level === 6 && step.num === 5) {
                            finalDesc = "Süreciniz olumlu sonuçlandı!";
                            iconBg = "bg-green-500/20 text-green-400";
                            titleColor = "text-green-400";
                            descColor = "text-green-500/80";
                        }

                        return (
                          <div key={step.num} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center`}>
                                {icon}
                              </div>
                              {!isLast && <div className={`w-px h-8 my-1 ${lineBg}`}></div>}
                            </div>
                            <div className={`pb-${isLast ? '0' : '6'}`}>
                              <p className={`text-base font-semibold ${titleColor}`}>
                                {step.title}
                              </p>
                              <p className={`text-sm mt-0.5 ${descColor}`}>
                                {finalDesc}
                              </p>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                  {(job.userApplication?.status === "INTERVIEW_INVITED" || job.userApplication?.status === "INVITED") && (
                    <Link href={`/interview/${job.userApplication.interviewId || 'default'}`} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-theme-1 px-4 py-2.5 text-xs font-bold text-black transition-all hover:bg-theme-1/80">
                      Mülakata Gir <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>

              {!job.userApplication && (
                <>
                  <div className="mb-6 text-center">
                    <h2 className="text-xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
                      <Sparkles className="h-5 w-5 text-theme-1" />
                      Yapay Zeka Destekli Başvuru
                    </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  İlan detaylarına uygunluğunuzu otomatik analiz ediyoruz.
                </p>
              </div>

              <div
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={`group relative overflow-hidden rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
                  status === "idle"
                    ? "cursor-pointer border-white/[0.1] bg-white/[0.01] hover:border-theme-1/50 hover:bg-theme-1/[0.02]"
                    : status === "uploading"
                    ? "border-theme-1/30 bg-theme-1/[0.02]"
                    : "border-theme-1/30 bg-theme-1/[0.05]"
                }`}
              >
                <input
                  type="file"
                  ref={inputRef}
                  onChange={handleChange}
                  accept=".pdf,.docx"
                  className="hidden"
                />

                <AnimatePresence mode="wait">
                  {status === "idle" && (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex flex-col items-center gap-4"
                    >
                      <div className="rounded-full bg-white/[0.04] p-4 transition-transform group-hover:scale-110 group-hover:bg-theme-1/10">
                        <FileUp className="h-8 w-8 text-zinc-400 group-hover:text-theme-1" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          CV'nizi Yükleyin (PDF/DOCX)
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          Sürükleyip bırakın veya seçmek için tıklayın
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {status === "uploading" && (
                    <motion.div
                      key="uploading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-6"
                    >
                      <div className="relative flex h-16 w-16 items-center justify-center">
                        <svg className="absolute h-full w-full -rotate-90">
                          <circle cx="32" cy="32" r="28" className="fill-none stroke-white/[0.05] stroke-[4]" />
                          <motion.circle
                            cx="32"
                            cy="32"
                            r="28"
                            className="fill-none stroke-theme-1 stroke-[4]"
                            strokeDasharray={175.93}
                            strokeDashoffset={175.93 - (175.93 * progress) / 100}
                            strokeLinecap="round"
                            transition={{ duration: 0.1 }}
                          />
                        </svg>
                        <Upload className="h-6 w-6 text-theme-1 animate-pulse" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-theme-1">
                          Yapay Zeka CV'nizi inceliyor...
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">{fileName}</p>
                      </div>
                    </motion.div>
                  )}

                  {status === "success" && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center gap-4 py-4"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className="rounded-full bg-theme-1/20 p-3"
                      >
                        <CheckCircle2 className="h-10 w-10 text-theme-1" />
                      </motion.div>
                      <div className="text-center">
                        <p className="text-base font-bold text-white mb-2">
                          Başvurunuz Alındı!
                        </p>
                        <p className="text-sm text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
                          CV'niz başarıyla yüklendi. Uygun bulunmanız durumunda mülakat bağlantınız e-posta adresinize iletilecektir.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {status === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 text-center"
                  >
                    <Link href="/dashboard" className="inline-flex w-full items-center justify-center gap-2 px-6 py-3 rounded-xl bg-theme-1 hover:brightness-110 text-white font-semibold transition-colors">
                      <Home className="w-4 h-4" />
                      Ana Sayfaya Dön
                    </Link>

                  </motion.div>
                )}
              </AnimatePresence>
              </>
             )}
            </motion.div>



          </div>
        </div>

      </div>
    </main>
  );
}
