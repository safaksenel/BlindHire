"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
 Briefcase,
 Building2,
 Calendar,
 ArrowRight,
 Loader2,
 AlertTriangle,
 CheckCircle2,
 X
} from "lucide-react";

interface JobPosting {
 id: string;
 title: string;
 description: string;
 companyId: string;
 companyName: string;
 createdAt: string;
 userApplication?: any;
}

const THEME_CLASSES = [
  { text: 'text-theme-1', bg: 'bg-theme-1/10', border: 'border-theme-1/20', hoverBorder: 'hover:border-theme-1/30', hoverText: 'group-hover:text-theme-1', bgSolid: 'bg-theme-1' },
  { text: 'text-theme-2', bg: 'bg-theme-2/10', border: 'border-theme-2/20', hoverBorder: 'hover:border-theme-2/30', hoverText: 'group-hover:text-theme-2', bgSolid: 'bg-theme-2' },
  { text: 'text-theme-3', bg: 'bg-theme-3/10', border: 'border-theme-3/20', hoverBorder: 'hover:border-theme-3/30', hoverText: 'group-hover:text-theme-3', bgSolid: 'bg-theme-3' },
  { text: 'text-theme-4', bg: 'bg-theme-4/10', border: 'border-theme-4/20', hoverBorder: 'hover:border-theme-4/30', hoverText: 'group-hover:text-theme-4', bgSolid: 'bg-theme-4' },
  { text: 'text-theme-5', bg: 'bg-theme-5/10', border: 'border-theme-5/20', hoverBorder: 'hover:border-theme-5/30', hoverText: 'group-hover:text-theme-5', bgSolid: 'bg-theme-5' },
];

export default function CandidateDashboard(): React.JSX.Element {
 const router = useRouter();
 const [jobs, setJobs] = useState<JobPosting[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState("");
 const [selectedApp, setSelectedApp] = useState<any>(null);

 const fetchJobs = useCallback(async () => {
 setIsLoading(true);
 try {
 const res = await fetch("/api/jobs");
 if (!res.ok) throw new Error("İlanlar yüklenirken hata oluştu.");
 const data = await res.json();
 setJobs(data);
 } catch (err: any) {
 setError(err.message);
 } finally {
 setIsLoading(false);
 }
 }, []);

 useEffect(() => {
 void fetchJobs();
 }, [fetchJobs]);

 return (
 <main className="flex-1 flex flex-col p-8 pt-24 min-h-screen relative overflow-hidden">
 <div className="max-w-6xl mx-auto w-full relative z-10 flex flex-col bg-black/[0.35] backdrop-blur-md rounded-3xl border border-white/10 p-8 mb-8">
 <div className="flex items-center justify-between mb-8">
 <div>
 <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">Hoş Geldiniz</h1>
 <p className="text-zinc-400">AgenticHR'ın otonom dünyasına hazır mısınız?</p>
 </div>
 </div>

 {error && (
 <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400 flex items-start gap-3">
 <AlertTriangle className="h-5 w-5 shrink-0" />
 <p>{error}</p>
 </div>
 )}

 {isLoading ? (
 <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-12 text-center flex flex-col items-center justify-center">
 <Loader2 className="h-8 w-8 animate-spin text-[var(--theme-c1)] mb-4" />
 <p className="text-zinc-400">İlanlar yükleniyor...</p>
 </div>
 ) : jobs.length === 0 ? (
 <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-12 text-center flex flex-col items-center justify-center">
 <div className="h-16 w-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4 border border-white/[0.06]">
 <Briefcase className="h-8 w-8 text-zinc-600" />
 </div>
 <h3 className="text-xl font-bold mb-2">Henüz Aktif İlan Yok</h3>
 <p className="text-zinc-500 max-w-md">Şu anda platformda başvuruya açık aktif bir ilan bulunmuyor. Lütfen daha sonra tekrar kontrol edin.</p>
 </div>
 ) : (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {jobs.map((job, idx) => {
    const t = THEME_CLASSES[idx % THEME_CLASSES.length];
    return (
  <motion.div
  key={job.id}
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  className={`group relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 backdrop-blur-xl transition-all hover:bg-white/[0.06] ${t.hoverBorder}`}
  >
  <div>
  {/* Status Badge */}
  <div className="absolute right-6 top-6 flex items-center gap-1.5 rounded-md border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-green-400">
    <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
    Aktif İlan
  </div>

  <div className={`mb-4 inline-flex items-center gap-1.5 rounded-full border ${t.border} ${t.bg} px-3 py-1 text-xs font-medium ${t.text}`}>
  <Building2 className="h-3 w-3" />
  {job.companyName}
  </div>
  <h3 className={`text-xl font-bold mb-2 transition-colors ${t.hoverText}`}>
  {job.title}
  </h3>
  <p className="text-sm text-zinc-400 line-clamp-3 mb-6">
  {job.description}
  </p>
  </div>
  
  <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
  <div className="flex flex-col gap-1">
   <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
   <Calendar className="h-3.5 w-3.5" />
   Başlangıç: {new Date(job.createdAt).toLocaleDateString("tr-TR")}
   </div>
   <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
   <Calendar className="h-3.5 w-3.5" />
   Bitiş: {new Date(new Date(job.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("tr-TR")}
   </div>
  </div>
  
  {!job.userApplication ? (
    <Link
      href={`/apply/${job.id}`}
      className={`inline-flex items-center gap-1.5 rounded-lg ${t.bgSolid} px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90`}
    >
      Başvur
      <ArrowRight className="h-4 w-4" />
    </Link>
  ) : (
    <button onClick={() => setSelectedApp(job.userApplication)} className={`inline-flex items-center gap-1.5 rounded-lg border ${t.border} ${t.bg} px-4 py-2 text-sm font-semibold ${t.text} transition-all hover:opacity-80 cursor-pointer shadow-lg`}>
      <Briefcase className="h-4 w-4" />
      Başvuruyu Görüntüle
    </button>
  )}
  </div>
  </motion.div>
  )})}
  </div>
  )}
 </div>

 {selectedApp && (
   <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
     <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-md bg-[#09090b] border border-white/10 rounded-2xl p-6 shadow-2xl">
       <button onClick={() => setSelectedApp(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-white"><X className="w-5 h-5"/></button>
       <h2 className="text-xl font-bold mb-6 text-white">Başvuru Durumu</h2>
       <div className="space-y-0">
         <div className="flex gap-4">
           <div className="flex flex-col items-center">
             <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400"><CheckCircle2 className="w-5 h-5"/></div>
             <div className="w-0.5 h-10 bg-green-500/20 my-1"></div>
           </div>
           <div className="pb-6 pt-1">
             <p className="font-semibold text-white">Başvuru Alındı</p>
             <p className="text-sm text-zinc-400">Özgeçmişiniz sisteme başarıyla yüklendi.</p>
           </div>
         </div>
         <div className="flex gap-4">
           <div className="flex flex-col items-center">
             <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400"><CheckCircle2 className="w-5 h-5"/></div>
             <div className="w-0.5 h-10 bg-white/10 my-1"></div>
           </div>
           <div className="pb-6 pt-1">
             <p className="font-semibold text-white">Yapay Zeka İncelemesi</p>
             <p className="text-sm text-zinc-400">Özgeçmişiniz yapay zeka tarafından değerlendirildi.</p>
           </div>
         </div>
         <div className="flex gap-4">
           <div className="flex flex-col items-center">
             {selectedApp.status === "REJECTED" ? (
               <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400"><X className="w-5 h-5"/></div>
             ) : (selectedApp.status === "INTERVIEW_INVITED" || selectedApp.status === "INVITED") ? (
               <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400"><CheckCircle2 className="w-5 h-5"/></div>
             ) : (
               <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-zinc-400"><Loader2 className="w-4 h-4 animate-spin"/></div>
             )}
           </div>
           <div className="pb-2 pt-1">
             <p className="font-semibold text-white">Değerlendirme Sonucu</p>
             <p className="text-sm text-zinc-400">
               {selectedApp.status === "REJECTED" ? "Maalesef bu aşamada olumlu ilerleyemiyoruz." : (selectedApp.status === "INTERVIEW_INVITED" || selectedApp.status === "INVITED") ? "Tebrikler! Mülakata hak kazandınız." : "İnceleme süreciniz devam ediyor."}
             </p>
           </div>
         </div>
       </div>
       {(selectedApp.status === "INTERVIEW_INVITED" || selectedApp.status === "INVITED") && (
         <Link href={`/interview/${selectedApp.interviewId || 'default'}`} className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 text-sm font-bold text-black transition-all hover:bg-green-400">
           Mülakata Gir <ArrowRight className="w-4 h-4" />
         </Link>
       )}
     </motion.div>
   </div>
 )}
 </main>
 );
}
