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
  LogOut,
  Loader2,
  AlertTriangle,
} from "lucide-react";

interface JobPosting {
  id: string;
  title: string;
  description: string;
  companyId: string;
  companyName: string;
  createdAt: string;
}

export default function CandidateDashboard(): React.JSX.Element {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

  const handleLogout = () => {
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/[0.06] pb-8 mb-12">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <Briefcase className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Aday Paneli
              </h1>
              <p className="text-sm text-zinc-500 mt-0.5">
                Aktif ilanları görüntüleyin ve başvurun
              </p>
            </div>
          </div>
        </header>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2.5 p-4 mb-8 rounded-xl bg-red-500/[0.08] border border-red-500/20 text-red-300 text-sm"
          >
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <p className="text-sm text-zinc-500">İlanlar yükleniyor...</p>
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
            {jobs.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 backdrop-blur-xl transition-all hover:bg-white/[0.03] hover:border-emerald-500/30"
              >
                <div>
                  <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                    <Building2 className="h-3 w-3" />
                    {job.companyName}
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-sm text-zinc-400 line-clamp-3 mb-6">
                    {job.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(job.createdAt).toLocaleDateString("tr-TR")}
                  </div>
                  <Link
                    href={`/apply/${job.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-400"
                  >
                    Başvur
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
