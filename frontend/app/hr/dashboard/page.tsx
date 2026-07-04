"use client";

import { useState, useEffect } from "react";
import { Briefcase, FileSearch, Trophy, ArrowUpRight, TrendingUp, Loader2, AlertTriangle, SearchX } from "lucide-react";
import { motion } from "framer-motion";

interface JobRow {
  readonly id: string;
  readonly position: string;
  readonly department: string;
  readonly credits: number;
  readonly successRate: string;
  readonly trend: "up" | "stable";
}

interface DashboardData {
  activeJobsCount: number;
  totalCVs: number;
  passedCount: number;
  jobs: JobRow[];
}

export default function DashboardPage(): React.JSX.Element {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isCreatingJob, setIsCreatingJob] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/hr/dashboard");
      if (!res.ok) throw new Error("Veriler alınamadı.");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !jobDescription) return;
    setIsCreatingJob(true);
    try {
      const res = await fetch("/api/hr/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: jobTitle, description: jobDescription }),
      });
      if (!res.ok) throw new Error("İlan oluşturulamadı.");
      setIsJobModalOpen(false);
      setJobTitle("");
      setJobDescription("");
      await fetchData(); // Refresh data
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsCreatingJob(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm text-white/50">Gösterge paneli yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
        <AlertTriangle className="h-6 w-6" />
        <p>{error}</p>
      </div>
    );
  }

  if (!data) return <></>;

  const METRICS = [
    {
      label: "Aktif İlanlar",
      value: data.activeJobsCount.toString(),
      change: "Şu an aktif",
      icon: <Briefcase className="h-4 w-4" />,
      accentColor: "text-blue-400",
      accentBg: "from-blue-500/15 to-blue-600/15",
    },
    {
      label: "İncelenen CV",
      value: data.totalCVs.toString(),
      change: "Toplam başvuru",
      icon: <FileSearch className="h-4 w-4" />,
      accentColor: "text-purple-400",
      accentBg: "from-purple-500/15 to-purple-600/15",
    },
    {
      label: "Mülakatı Geçen",
      value: data.passedCount.toString(),
      change: "Onaylanan aday",
      icon: <Trophy className="h-4 w-4" />,
      accentColor: "text-emerald-400",
      accentBg: "from-emerald-500/15 to-emerald-600/15",
    },
  ];

  return (
    <div className="space-y-8">
      {/* ── Page header ── */}
      <div>
        <h1 className="text-xl font-bold text-white">Gösterge Paneli</h1>
        <p className="mt-1 text-sm text-white/30">
          AI işe alım süreçlerinizin gerçek zamanlı özeti.
        </p>
      </div>

      {/* ── Metric cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {METRICS.map((metric, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={metric.label}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.025]"
          >
            <div
              className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${metric.accentBg} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${metric.accentBg} ${metric.accentColor}`}
                >
                  {metric.icon}
                </div>
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight text-white">
                {metric.value}
              </p>
              <div className="mt-1.5 flex items-center justify-between">
                <p className="text-xs text-white/40">{metric.label}</p>
                <p className={`text-[10px] font-medium ${metric.accentColor} opacity-70`}>
                  {metric.change}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Jobs table ── */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-white">
              İş İlanları & İstatistikler
            </h2>
            <p className="mt-0.5 text-xs text-white/30">
              Şirketinize ait aktif ve pasif ilanların durumu
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-[10px] font-medium text-white/30">
              {data.jobs.length} ilan
            </span>
            <button
              onClick={() => setIsJobModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              Yeni İlan Oluştur
            </button>
          </div>
        </div>

        {data.jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
             <div className="h-16 w-16 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-4">
                <SearchX className="h-8 w-8 text-white/20" />
             </div>
             <p className="text-sm font-medium text-white/70">Henüz hiç ilanınız yok.</p>
             <p className="text-xs text-white/40 mt-1">Sistem üzerinde oluşturulmuş bir iş ilanı bulunamadı.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/20">
                    Pozisyon
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/20">
                    Departman
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/20">
                    Kalan Kredi (Örnek)
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/20">
                    Onay Oranı
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-white/[0.03] transition-colors last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-white/70">
                        {job.position}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-xs text-white/40">
                        {job.department}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/[0.04]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500/60 to-purple-500/60 transition-all"
                            style={{ width: `${Math.max(0, Math.min(job.credits, 100))}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-white/40">
                          {job.credits}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {job.trend === "up" && (
                          <TrendingUp className="h-3 w-3 text-emerald-400/60" />
                        )}
                        <span className="text-xs font-medium text-emerald-400/70">
                          {job.successRate}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-white/[0.06] bg-zinc-900 p-6 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-white mb-4">Yeni İlan Oluştur</h3>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">İlan Başlığı</label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                  placeholder="Örn: Senior Frontend Developer"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Açıklama</label>
                <textarea
                  required
                  rows={4}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                  placeholder="İş ilanı detayları..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsJobModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-white/50 hover:text-white transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isCreatingJob}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors disabled:opacity-50"
                >
                  {isCreatingJob ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Oluştur
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
