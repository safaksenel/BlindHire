"use client";

import React, { useState, useEffect } from "react";
import { Briefcase, FileSearch, Trophy, Loader2, AlertTriangle, SearchX, Archive, Edit3, ChevronDown, ChevronUp, User, Clock, CalendarDays, Brain, ShieldCheck, UserMinus } from "lucide-react";
import RichTextEditor from '@/components/RichTextEditor';
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastContext";

interface Applicant {
  id: string;
  fullName: string;
  email: string;
  status: string;
  techScore: number;
  reliability: number;
}

interface JobRow {
  readonly id: string;
  readonly position: string;
  readonly description: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly rawStartDate: string | null;
  readonly rawEndDate: string | null;
  readonly totalApplicants: number;
  readonly acceptedCount: number;
  readonly rejectedCount: number;
  readonly interviewCount: number;
  readonly computedStatus: "ACTIVE" | "SCHEDULED" | "EXPIRED" | "ARCHIVED";
  readonly applicants: Applicant[];
}

interface DashboardData {
  activeJobsCount: number;
  totalCVs: number;
  passedCount: number;
  jobs: JobRow[];
}


export default function DashboardPage(): React.JSX.Element {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToast } = useToast();

  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCreatingJob, setIsCreatingJob] = useState(false);

  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

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

  const handleOpenCreateModal = () => {
    setEditingJobId(null);
    setJobTitle("");
    setJobDescription("");
    setStartDate("");
    setEndDate("");
    setIsJobModalOpen(true);
  };

  const handleOpenEditModal = (job: JobRow) => {
    setEditingJobId(job.id);
    setJobTitle(job.position);
    setJobDescription(job.description || "");
    setStartDate(job.rawStartDate ? job.rawStartDate.slice(0, 16) : "");
    setEndDate(job.rawEndDate ? job.rawEndDate.slice(0, 16) : "");
    setIsJobModalOpen(true);
  };

  const handleCreateOrEditJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !jobDescription) return;
    setIsCreatingJob(true);
    
    const payload = {
      id: editingJobId,
      title: jobTitle,
      description: jobDescription,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null,
    };

    try {
      if (editingJobId) {
        const res = await fetch("/api/hr/jobs", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("İlan güncellenemedi.");
        addToast("İlan başarıyla güncellendi.", "success");
      } else {
        const res = await fetch("/api/hr/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("İlan oluşturulamadı.");
        addToast("Yeni ilan oluşturuldu.", "success");
      }
      
      setIsJobModalOpen(false);
      await fetchData();
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setIsCreatingJob(false);
    }
  };

  const handleArchiveJob = async (id: string) => {
    if (!confirm("Bu ilanı arşivlemek istediğinize emin misiniz? Arşivlenen ilanlar İlan Geçmişi sekmesinde görünür.")) return;
    try {
      const res = await fetch("/api/hr/jobs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "ARCHIVED" })
      });
      if (!res.ok) throw new Error("İlan arşivlenemedi.");
      addToast("İlan arşive taşındı.", "success");
      await fetchData();
    } catch (err: any) {
      addToast(err.message, "error");
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedJobId === id) setExpandedJobId(null);
    else setExpandedJobId(id);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Bu adayı (kullanıcıyı) sistemden kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz!")) return;
    try {
      const res = await fetch(`/api/hr/users/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Aday silinemedi.");
      }
      addToast("Aday sistemden başarıyla silindi.", "success");
      await fetchData();
    } catch (err: any) {
      addToast(err.message, "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-theme-1" />
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
      accentColor: "text-theme-1",
      accentBg: "from-theme-1/15 to-theme-1/15",
    },
    {
      label: "İncelenen CV",
      value: data.totalCVs.toString(),
      change: "Toplam başvuru",
      icon: <FileSearch className="h-4 w-4" />,
      accentColor: "text-theme-2",
      accentBg: "from-theme-2/15 to-theme-2/15",
    },
    {
      label: "Mülakatı Geçen",
      value: data.passedCount.toString(),
      change: "Onaylanan aday",
      icon: <Trophy className="h-4 w-4" />,
      accentColor: "text-theme-1",
      accentBg: "from-theme-1/15 to-theme-1/15",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">Gösterge Paneli</h1>
        <p className="mt-1 text-sm text-white/30">
          AI işe alım süreçlerinizin gerçek zamanlı özeti.
        </p>
      </div>

      {/* Metric cards */}
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

      {/* Jobs table */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Yönetimdeki İlanlar
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-[10px] font-medium text-white/30">
              {data.jobs.length} ilan
            </span>
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-1.5 rounded-lg bg-theme-1 px-4 py-2 text-xs font-semibold text-white hover:brightness-110 transition-all"
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
             <p className="text-sm font-medium text-white/70">Henüz ilanınız yok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/20">Pozisyon</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/20">Durum</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/20">Tarihler</th>
                  <th className="px-6 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-white/20">Başvuru Durumları</th>
                  <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-white/20">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {data.jobs.map((job) => (
                  <React.Fragment key={job.id}>
                    <tr className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-white/70">{job.position}</span>
                      </td>
                      <td className="px-6 py-4">
                        {job.computedStatus === "ACTIVE" && <span className="inline-flex items-center gap-1.5 rounded-md border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-400"><Clock className="h-3.5 w-3.5" /> Aktif</span>}
                        {job.computedStatus === "SCHEDULED" && <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-sm font-semibold text-amber-400"><CalendarDays className="h-3.5 w-3.5" /> İleri Tarihli</span>}
                        {job.computedStatus === "EXPIRED" && <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-500/20 bg-zinc-500/10 px-2.5 py-1 text-xs font-medium text-zinc-400"><Archive className="h-3.5 w-3.5" /> Süresi Dolmuş</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col text-sm text-zinc-400 gap-1">
                          <span><span className="text-zinc-500 mr-1">Başlangıç:</span> {job.startDate}</span>
                          <span><span className="text-zinc-500 mr-1">Bitiş:</span> {job.endDate}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-lg min-w-[80px]">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 mb-0.5 whitespace-nowrap">Toplam</span>
                            <span className="text-sm font-bold text-white/80">{job.totalApplicants}</span>
                          </div>
                          <div className="flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-lg min-w-[80px]">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 mb-0.5 whitespace-nowrap">Devam Eden</span>
                            <span className="text-sm font-bold text-white/80">{job.totalApplicants - job.acceptedCount - job.rejectedCount}</span>
                          </div>
                          <div className="flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-lg min-w-[80px]">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 mb-0.5 whitespace-nowrap">Onaylanan</span>
                            <span className="text-sm font-bold text-white/80">{job.acceptedCount}</span>
                          </div>
                          <div className="flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-lg min-w-[80px]">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 mb-0.5 whitespace-nowrap">Reddedilen</span>
                            <span className="text-sm font-bold text-white/80">{job.rejectedCount}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center justify-end gap-2">
                           <button
                             onClick={() => toggleExpand(job.id)}
                             className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                             title="Adayları Gör"
                           >
                             {expandedJobId === job.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                           </button>
                           <button
                             onClick={() => handleOpenEditModal(job)}
                             className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                             title="Düzenle"
                           >
                             <Edit3 className="h-4 w-4" />
                           </button>
                           <button
                             onClick={() => handleArchiveJob(job.id)}
                             className="p-1.5 rounded-lg hover:bg-orange-500/10 text-zinc-400 hover:text-orange-400 transition-colors"
                             title="İlanı Kaldır ve Arşive Gönder"
                           >
                             <Archive className="h-4 w-4" />
                           </button>
                         </div>
                      </td>
                    </tr>
                    <AnimatePresence>
                      {expandedJobId === job.id && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-white/[0.005]"
                        >
                          <td colSpan={5} className="px-6 py-4 border-b border-white/[0.03]">
                            {job.applicants.length === 0 ? (
                              <p className="text-xs text-white/30 text-center py-2">Bu ilana henüz başvuru yapılmamış.</p>
                            ) : (
                              <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-white/50 mb-2">Başvuru Yapan Adaylar</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {job.applicants.map(app => (
                                    <div 
                                      key={app.id} 
                                      onClick={() => router.push(`/hr/candidate/${app.id}`)}
                                      className="flex items-center justify-between p-3 rounded-xl border border-white/[0.04] bg-white/[0.01] cursor-pointer hover:bg-white/[0.05] transition-colors"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-white/[0.05] flex items-center justify-center">
                                          <User className="h-4 w-4 text-white/30" />
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-xs font-medium text-white/80">{app.fullName}</span>
                                          <span className="text-[10px] text-white/30">{app.status}</span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3 text-[10px] text-white/40">
                                        <span className="flex items-center gap-1" title="Algoritma Skoru"><Brain className="h-3 w-3"/> {app.techScore}</span>
                                        <span className="flex items-center gap-1" title="AI Skoru"><ShieldCheck className="h-3 w-3"/> {app.reliability}</span>
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteUser(app.id);
                                          }}
                                          className="ml-2 text-red-400/50 hover:text-red-400 transition-colors p-1"
                                          title="Kullanıcıyı Sil"
                                        >
                                          <UserMinus className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
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
            className="w-full max-w-5xl rounded-2xl border border-white/[0.06] bg-zinc-900 p-8 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-white mb-4">
              {editingJobId ? "İlanı Düzenle" : "Yeni İlan Oluştur"}
            </h3>
            <form onSubmit={handleCreateOrEditJob} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">İlan Başlığı</label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-theme-1/50 transition-colors"
                  placeholder="Örn: Senior Frontend Developer"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Başlangıç Tarihi</label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-theme-1/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Bitiş Tarihi</label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-theme-1/50"
                  />
                </div>
              </div>
              <div className="group">
                <label className="block text-xs font-semibold text-theme-1 mb-1 group-focus-within:text-theme-2 transition-colors">Açıklama (Zengin Metin)</label>
                <RichTextEditor
                  value={jobDescription}
                  onChange={setJobDescription}
                  placeholder="İş ilanı detayları (Şirket bilgisi, sorumluluklar, gereksinimler, yan haklar vb.)..."
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
                  className="flex items-center gap-2 rounded-lg bg-theme-1 px-6 py-2 text-xs font-semibold text-white hover:bg-theme-1 transition-colors disabled:opacity-50"
                >
                  {isCreatingJob ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {editingJobId ? "Güncelle" : "Oluştur"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
