"use client";

import { useState, useEffect } from "react";
import { ArchiveRestore, Loader2, AlertTriangle, SearchX, Clock, CalendarDays, Ban } from "lucide-react";

interface HistoryJob {
  readonly id: string;
  readonly position: string;
  readonly department: string;
  readonly totalApplications: number;
  readonly successRate: string;
  readonly archivedAt: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly computedStatus: "ACTIVE" | "SCHEDULED" | "EXPIRED" | "ARCHIVED";
}

export default function JobHistoryPage(): React.JSX.Element {
  const [jobs, setJobs] = useState<HistoryJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/hr/history/jobs");
      if (!res.ok) throw new Error("Veriler alınamadı.");
      const json = await res.json();
      setJobs(json.jobs);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchJobs();
  }, []);

  const handleRestore = async (id: string) => {
    if (!confirm("Bu ilanı tekrar aktif hale getirmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch("/api/hr/jobs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "ACTIVE" })
      });
      if (!res.ok) throw new Error("İlan aktifleştirilemedi.");
      await fetchJobs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        <p className="text-sm text-zinc-500">İlan geçmişi yükleniyor...</p>
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-white">İlan Geçmişi</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Sistemdeki tüm ilanlarınızın geçmişi ve durumları.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Tüm İlanlar
            </h2>
          </div>
          <span className="rounded-full border border-zinc-800 bg-zinc-800/50 px-3 py-1 text-[10px] font-medium text-zinc-400">
            {jobs.length} ilan
          </span>
        </div>

        {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
             <div className="h-16 w-16 rounded-full bg-zinc-800/50 border border-zinc-800 flex items-center justify-center mb-4">
                <SearchX className="h-8 w-8 text-zinc-500" />
             </div>
             <p className="text-sm font-medium text-zinc-400">Henüz geçmişte bir ilanınız yok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Durum</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Pozisyon</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Tarihler</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Başvuru</th>
                  <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-500">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b border-zinc-800/50 transition-colors last:border-0 hover:bg-zinc-800/30">
                    <td className="px-6 py-4">
                      {job.computedStatus === "ACTIVE" && <span className="inline-flex items-center gap-1.5 rounded-md border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-400"><Clock className="h-3.5 w-3.5" /> Aktif</span>}
                      {job.computedStatus === "SCHEDULED" && <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-sm font-semibold text-amber-400"><CalendarDays className="h-3.5 w-3.5" /> İleri Tarihli</span>}
                      {(job.computedStatus === "EXPIRED" || job.computedStatus === "ARCHIVED") && <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-500/20 bg-zinc-500/10 px-2.5 py-1 text-xs font-medium text-zinc-400"><Ban className="h-3.5 w-3.5" /> Pasif</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-zinc-200">{job.position}</span>
                        <span className="text-[11px] text-zinc-500">{job.department}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-sm text-zinc-400 gap-1">
                        <span><span className="text-zinc-500 mr-1">Başlangıç:</span> {job.startDate}</span>
                        <span><span className="text-zinc-500 mr-1">Bitiş:</span> {job.endDate}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-zinc-300">{job.totalApplications}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       {job.computedStatus === "ARCHIVED" && (
                         <button
                           onClick={() => handleRestore(job.id)}
                           className="flex items-center justify-end gap-2 ml-auto p-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                           title="Tekrar Aktifleştir"
                         >
                           <ArchiveRestore className="h-4 w-4" />
                           <span className="text-xs font-semibold">Aktifleştir</span>
                         </button>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
