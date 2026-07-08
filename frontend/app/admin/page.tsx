"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  Plus,
  Trash2,
  LogOut,
  Mail,
  User,
  Key,
  Shield,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Briefcase,
  FileText
} from "lucide-react";

interface Company {
  id: string;
  name: string;
  createdAt: string;
}

interface HRUser {
  id: string;
  fullName: string;
  email: string;
  companyId: string;
  companyName?: string;
  createdAt: string;
}

interface Job {
  id: string;
  title: string;
  status: string;
  company: { name: string };
  createdAt: string;
}

interface Application {
  id: string;
  status: string;
  candidate: { id: string; fullName: string; email: string };
  jobPosting: { title: string; company: { name: string } };
  techScore?: number;
  createdAt: string;
}

export default function SuperAdminDashboard(): React.JSX.Element {
  const router = useRouter();

  // State
  const [companies, setCompanies] = useState<Company[]>([]);
  const [hrUsers, setHrUsers] = useState<HRUser[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Form states
  const [companyName, setCompanyName] = useState<string>("");
  const [hrName, setHrName] = useState<string>("");
  const [hrEmail, setHrEmail] = useState<string>("");
  const [hrPassword, setHrPassword] = useState<string>("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const [compRes, hrRes, jobRes, appRes] = await Promise.all([
        fetch("/api/admin/companies"),
        fetch("/api/admin/hr-users"),
        fetch("/api/admin/jobs"),
        fetch("/api/admin/applications"),
      ]);

      if (!compRes.ok || !hrRes.ok || !jobRes.ok || !appRes.ok) {
        throw new Error("Veriler yüklenirken hata oluştu.");
      }

      const compData = await compRes.json();
      const hrData = await hrRes.json();
      const jobData = await jobRes.json();
      const appData = await appRes.json();

      setCompanies(compData);
      setHrUsers(hrData);
      setJobs(jobData);
      setApplications(appData);
    } catch (err: any) {
      setError(err.message || "Sunucu ile bağlantı kurulamadı.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleLogout = useCallback(() => {
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  }, [router]);

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setActionLoading("add_company");
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: companyName }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Firma eklenemedi.");

      setSuccess("Firma başarıyla eklendi.");
      setCompanyName("");
      void fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddHRUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hrName.trim() || !hrEmail.trim() || !hrPassword.trim() || !selectedCompanyId) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    setActionLoading("add_hr");
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/hr-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: hrName,
          email: hrEmail,
          password: hrPassword,
          companyId: selectedCompanyId,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "İK kullanıcısı oluşturulamadı.");

      setSuccess("İK kullanıcısı başarıyla oluşturuldu.");
      setHrName("");
      setHrEmail("");
      setHrPassword("");
      setSelectedCompanyId("");
      void fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (!confirm("Bu firmayı silmek istediğinize emin misiniz? Bağlı İK kullanıcıları ve ilanlar da silinir (Cascade).")) return;

    setActionLoading(`delete_company_${id}`);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/companies?id=${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error((await response.json()).message || "Firma silinemedi.");

      setSuccess("Firma silindi.");
      void fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteHRUser = async (id: string) => {
    if (!confirm("Bu İK kullanıcısını silmek istediğinize emin misiniz?")) return;

    setActionLoading(`delete_hr_${id}`);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/hr-users?id=${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error((await response.json()).message || "Kullanıcı silinemedi.");

      setSuccess("İK kullanıcısı silindi.");
      void fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm("Bu ilanı silmek istediğinize emin misiniz? Bağlı başvurular da silinir.")) return;

    setActionLoading(`delete_job_${id}`);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/jobs?id=${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error((await response.json()).message || "İlan silinemedi.");

      setSuccess("İlan silindi.");
      void fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteApplication = async (id: string, deleteUser: boolean = false) => {
    const msg = deleteUser 
      ? "Bu başvuruyu VE adayın sistemdeki hesabını silmek istediğinize emin misiniz?" 
      : "Sadece bu başvuruyu silmek istediğinize emin misiniz?";
    if (!confirm(msg)) return;

    setActionLoading(`delete_app_${id}`);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/applications?id=${id}&deleteUser=${deleteUser}`, { method: "DELETE" });
      if (!response.ok) throw new Error((await response.json()).message || "Başvuru silinemedi.");

      setSuccess(deleteUser ? "Başvuru ve aday silindi." : "Başvuru silindi.");
      void fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/[0.06] pb-8 mb-12">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20">
              <Shield className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Süper Admin Paneli</h1>
              <p className="text-sm text-zinc-500 mt-0.5">Tüm sistem veritabanı yönetim merkezi (CRUD)</p>
            </div>
          </div>
        </header>

        {/* Global Alert Notification */}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2.5 p-4 mb-8 rounded-xl bg-red-500/[0.08] border border-red-500/20 text-red-300 text-sm">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2.5 p-4 mb-8 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-300 text-sm">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{success}</span>
          </motion.div>
        )}

        {/* Loading Overlay */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-zinc-500">Supabase Veritabanı bağlantısı kuruluyor...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Forms section */}
            <div className="lg:col-span-5 space-y-8">
              {/* Add Company Card */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-6">
                  <Building2 className="h-5 w-5 text-blue-400" />
                  <h2 className="text-lg font-bold">Firma Ekle</h2>
                </div>
                <form onSubmit={handleAddCompany} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Firma Adı</label>
                    <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Örn: Acme Corporation" required className="w-full px-4 py-3 rounded-xl bg-white/[0.015] border border-white/[0.06] text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
                  </div>
                  <button type="submit" disabled={actionLoading === "add_company"} className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all duration-200 disabled:opacity-50">
                    {actionLoading === "add_company" ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Firma Oluştur</>}
                  </button>
                </form>
              </div>

              {/* Add HR User Card */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-6">
                  <Users className="h-5 w-5 text-purple-400" />
                  <h2 className="text-lg font-bold">İK Kullanıcısı Ekle</h2>
                </div>
                <form onSubmit={handleAddHRUser} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Firma Seçin</label>
                    <select value={selectedCompanyId} onChange={(e) => setSelectedCompanyId(e.target.value)} required className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all">
                      <option value="">Seçiniz...</option>
                      {companies.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Ad Soyad</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input type="text" value={hrName} onChange={(e) => setHrName(e.target.value)} placeholder="Ad Soyad" required className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.015] border border-white/[0.06] text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">E-posta Adresi</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input type="email" value={hrEmail} onChange={(e) => setHrEmail(e.target.value)} placeholder="ik@firma.com" required className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.015] border border-white/[0.06] text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Geçici Şifre</label>
                    <div className="relative">
                      <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input type="password" value={hrPassword} onChange={(e) => setHrPassword(e.target.value)} placeholder="••••••••" required className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.015] border border-white/[0.06] text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all" />
                    </div>
                  </div>
                  <button type="submit" disabled={actionLoading === "add_hr"} className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all duration-200 disabled:opacity-50">
                    {actionLoading === "add_hr" ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Kullanıcı Oluştur</>}
                  </button>
                </form>
              </div>
            </div>

            {/* Lists Section */}
            <div className="lg:col-span-7 space-y-6">
              {/* Companies list */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 backdrop-blur-xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-400" />
                  Kayıtlı Firmalar
                </h3>
                {companies.length === 0 ? (
                  <p className="text-sm text-zinc-600 py-4">Kayıtlı firma bulunamadı.</p>
                ) : (
                  <div className="divide-y divide-white/[0.04] max-h-48 overflow-y-auto pr-2">
                    {companies.map((c) => (
                      <div key={c.id} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-semibold">{c.name}</p>
                          <p className="text-[10px] text-zinc-600">ID: {c.id}</p>
                        </div>
                        <button onClick={() => handleDeleteCompany(c.id)} disabled={actionLoading?.startsWith("delete_company_")} className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* HR Users List */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 backdrop-blur-xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-400" />
                  İK Yetkilileri
                </h3>
                {hrUsers.length === 0 ? (
                  <p className="text-sm text-zinc-600 py-4">Kayıtlı İK kullanıcısı bulunamadı.</p>
                ) : (
                  <div className="divide-y divide-white/[0.04] max-h-48 overflow-y-auto pr-2">
                    {hrUsers.map((u) => (
                      <div key={u.id} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-semibold">{u.fullName}</p>
                          <p className="text-xs text-zinc-500">{u.email}</p>
                          <p className="text-[10px] text-zinc-600">Firma: {u.companyName || u.companyId}</p>
                        </div>
                        <button onClick={() => handleDeleteHRUser(u.id)} disabled={actionLoading?.startsWith("delete_hr_")} className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Jobs List */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 backdrop-blur-xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-emerald-400" />
                  Tüm İş İlanları
                </h3>
                {jobs.length === 0 ? (
                  <p className="text-sm text-zinc-600 py-4">Kayıtlı iş ilanı bulunamadı.</p>
                ) : (
                  <div className="divide-y divide-white/[0.04] max-h-48 overflow-y-auto pr-2">
                    {jobs.map((j) => (
                      <div key={j.id} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-semibold">{j.title}</p>
                          <p className="text-xs text-emerald-500/80">{j.company.name}</p>
                          <p className="text-[10px] text-zinc-600">ID: {j.id} - Durum: {j.status}</p>
                        </div>
                        <button onClick={() => handleDeleteJob(j.id)} disabled={actionLoading?.startsWith("delete_job_")} className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Applications List */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 backdrop-blur-xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-400" />
                  Tüm Başvurular
                </h3>
                {applications.length === 0 ? (
                  <p className="text-sm text-zinc-600 py-4">Kayıtlı başvuru bulunamadı.</p>
                ) : (
                  <div className="divide-y divide-white/[0.04] max-h-60 overflow-y-auto pr-2">
                    {applications.map((a) => (
                      <div key={a.id} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-semibold">{a.candidate.fullName}</p>
                          <p className="text-xs text-zinc-500">{a.candidate.email}</p>
                          <p className="text-[11px] text-amber-500/80 mt-0.5">{a.jobPosting.title} ({a.jobPosting.company.name})</p>
                          <p className="text-[10px] text-zinc-600">Skor: {a.techScore || "Bekliyor"} | Durum: {a.status}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleDeleteApplication(a.id, false)} title="Sadece Başvuruyu Sil" disabled={actionLoading?.startsWith("delete_app_")} className="p-2 rounded-lg hover:bg-amber-500/10 text-zinc-500 hover:text-amber-400 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDeleteApplication(a.id, true)} title="Başvuruyu VE Adayı Sil" disabled={actionLoading?.startsWith("delete_app_")} className="px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 text-red-400 text-xs font-medium transition-colors">
                            Adayı da Sil
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </main>
  );
}
