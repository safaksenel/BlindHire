"use client";

import { useState, useEffect } from "react";
import { History, Loader2, AlertTriangle, SearchX, CheckCircle2, XCircle, FileText, User, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HistoryApplication {
  readonly id: string;
  readonly candidateId?: string;
  readonly fullName: string;
  readonly email: string;
  readonly jobTitle: string;
  readonly cvUrl: string;
  readonly techScore: number;
  readonly reliability: number;
  readonly status: string;
  readonly finalizedAt: string;
}

export default function ApplicationHistoryPage(): React.JSX.Element {
  const [apps, setApps] = useState<HistoryApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/hr/history/applications");
      if (!res.ok) throw new Error("Veriler alınamadı.");
      const json = await res.json();
      setApps(json.applications);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu başvuru kaydını silmek istediğinize emin misiniz? (Bu işlem adayın tekrar başvurabilmesini sağlar)")) return;
    
    try {
      const res = await fetch(`/api/hr/history/applications/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Silme işlemi başarısız oldu.");
      setApps(apps.filter(app => app.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  useEffect(() => {
    void fetchApplications();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        <p className="text-sm text-zinc-500">Geçmiş başvurular yükleniyor...</p>
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
        <h1 className="text-xl font-bold text-white">Başvuru Geçmişi</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Sistemdeki tüm adayların başvuru geçmişleri ve durumları.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Tüm Başvurular
            </h2>
          </div>
          <span className="rounded-full border border-zinc-800 bg-zinc-800/50 px-3 py-1 text-[10px] font-medium text-zinc-400">
            {apps.length} başvuru
          </span>
        </div>

        {apps.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
             <div className="h-16 w-16 rounded-full bg-zinc-800/50 border border-zinc-800 flex items-center justify-center mb-4">
                <SearchX className="h-8 w-8 text-zinc-500" />
             </div>
             <p className="text-sm font-medium text-zinc-400">Henüz kaydedilmiş bir başvuru geçmişi yok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Aday Adı</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Başvurulan İlan</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Son İşlem</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Skorlar (ATS & LLM)</th>
                  <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Durum</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((app) => (
                  <tr key={app.id} className="border-b border-zinc-800/50 transition-colors last:border-0 hover:bg-zinc-800/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700">
                           <User className="h-4 w-4 text-zinc-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-zinc-200">{app.fullName}</span>
                          <span className="text-xs text-zinc-500">{app.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-zinc-300">{app.jobTitle}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <History className="h-3.5 w-3.5 text-zinc-500" />
                        {app.finalizedAt}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 min-w-[120px]">
                        <div className="flex items-center justify-between gap-3 text-xs">
                           <span className="text-zinc-400">ATS (Algoritma):</span>
                           <span><strong className="text-zinc-200">{app.techScore}</strong><span className="text-zinc-600">/100</span></span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-xs">
                           <span className="text-zinc-400">LLM (Groq AI):</span>
                           <span>
                             {app.reliability > 0 ? (
                               <><strong className="text-theme-1">{app.reliability}</strong><span className="text-zinc-600">/100</span></>
                             ) : (
                               <span className="text-zinc-600 italic">Girmedi</span>
                             )}
                           </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       {app.status === "APPROVED" || app.status === "COMPLETED" ? (
                         <span className="inline-flex items-center gap-1.5 rounded-md border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-400">
                           <CheckCircle2 className="h-3.5 w-3.5" /> İşe Alındı (Aktif)
                         </span>
                       ) : app.status === "REJECTED" ? (
                         <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-500/20 bg-zinc-500/10 px-2.5 py-1 text-xs font-medium text-zinc-400">
                           <XCircle className="h-3.5 w-3.5" /> Reddedildi (Pasif)
                         </span>
                       ) : (
                         <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400">
                           <History className="h-3.5 w-3.5" /> {app.status} (Süreçte)
                         </span>
                       )}
                       
                       <button
                         onClick={() => handleDelete(app.id)}
                         title="Başvuru Kaydını Sil (Aday tekrar başvurabilir)"
                         className="ml-3 inline-flex items-center justify-center rounded-lg border border-transparent p-1.5 text-zinc-500 transition-all hover:border-red-500/30 hover:bg-gradient-to-br hover:from-red-500/10 hover:to-theme-1/10 hover:text-red-400 hover:shadow-[0_0_12px_rgba(239,68,68,0.3)]"
                       >
                         <Trash2 className="h-4 w-4" />
                       </button>
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
