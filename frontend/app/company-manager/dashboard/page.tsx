"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, Briefcase, Loader2, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { translateStatus } from "@/lib/utils";

export default function CompanyManagerDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/company-manager/dashboard");
      if (!response.ok) throw new Error("Veriler yüklenemedi.");
      const json = await response.json();
      setData(json);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-theme-1" />
        <p className="text-sm text-zinc-400">Yönetici paneli yükleniyor...</p>
      </div>
    );
  }

  // Calculate simple stats
  const totalJobs = data.jobs?.length || 0;
  const totalApplications = data.jobs?.reduce((acc: number, job: any) => acc + (job.applications?.length || 0), 0) || 0;
  const activeJobs = data.jobs?.filter((j: any) => j.status === "ACTIVE").length || 0;
  const pendingJobs = data.jobs?.filter((j: any) => j.status === "PENDING").length || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="border-b border-white/[0.06] pb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard Özeti</h1>
        <p className="text-zinc-400 mt-2">Firmanızın genel durumu ve aktif ilan performansları.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-white/[0.06] bg-[#111] p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-theme-1/10 text-theme-1 rounded-xl">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Toplam İlan</p>
              <p className="text-2xl font-bold text-white">{totalJobs}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-[#111] p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-theme-1/10 text-theme-1 rounded-xl">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Aktif İlanlar</p>
              <p className="text-2xl font-bold text-white">{activeJobs}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-[#111] p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-theme-1/10 text-theme-1 rounded-xl">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Onay Bekleyenler</p>
              <p className="text-2xl font-bold text-white">{pendingJobs}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-[#111] p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-theme-1/10 text-theme-1 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Toplam Başvuru</p>
              <p className="text-2xl font-bold text-white">{totalApplications}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="rounded-2xl border border-[#222] bg-[#111] p-6 shadow-xl">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
          <Briefcase className="h-5 w-5 text-theme-1" />
          Tüm İş İlanları ve Başvurular
        </h3>
        {data.jobs?.length === 0 ? (
          <p className="text-sm text-zinc-500">Kayıtlı iş ilanı bulunamadı.</p>
        ) : (
          <div className="divide-y divide-[#222]">
            {data.jobs.map((j: any) => (
              <div key={j.id} className="py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white">{j.title}</p>
                    <p className="text-sm text-zinc-400 mt-1">Durum: {translateStatus(j.status)}</p>
                  </div>
                  <button 
                    onClick={() => setExpandedJobId(expandedJobId === j.id ? null : j.id)}
                    className="flex items-center gap-2 text-sm font-medium text-theme-1 bg-theme-1/10 hover:bg-theme-1/20 transition-colors px-4 py-2 rounded-xl"
                  >
                    {j.applications?.length || 0} Başvuru
                    {expandedJobId === j.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {expandedJobId === j.id && (
                  <div className="mt-6 pt-6 border-t border-[#222]">
                    {(!j.applications || j.applications.length === 0) ? (
                      <p className="text-sm text-zinc-500 text-center py-4">Bu ilana henüz başvuru yapılmamış.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {j.applications.map((a: any) => (
                          <div key={a.id} className="flex flex-col p-4 rounded-xl bg-[#0a0a0a] border border-[#222]">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="font-semibold text-white">{a.candidate?.fullName}</p>
                                {(a.techScore > 0 || a.reliability > 0) && (
                                  <p className="text-xs text-zinc-500 mt-1">
                                    {a.techScore ? `Skor: ${a.techScore} ` : ""}
                                    {a.reliability ? ` | Güvenilirlik: ${a.reliability}%` : ""}
                                  </p>
                                )}
                              </div>
                              <span className="text-xs font-medium px-3 py-1 rounded-full bg-white/5 border border-white/10 shrink-0 ml-2 text-zinc-300">
                                {translateStatus(a.status)}
                              </span>
                            </div>
                            {a.cvUrl && (
                              <a 
                                href={a.cvUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-2 bg-[#111] hover:bg-[#222] border border-white/[0.04] rounded-lg text-xs font-medium text-theme-1 transition-colors mt-auto"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                CV Görüntüle
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
