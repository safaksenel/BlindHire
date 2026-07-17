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

interface Candidate {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

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

const translateStatus = (status: string) => {
  const map: Record<string, string> = {
    ACTIVE: "Aktif",
    SCHEDULED: "İleri Tarihli",
    EXPIRED: "Süresi Dolmuş",
    ARCHIVED: "Arşivlenmiş",
    PENDING: "Beklemede",
    INVITED: "Mülakata Davet Edildi",
    INTERVIEW_INVITED: "Mülakata Davet Edildi",
    REJECTED: "Reddedildi",
    HIRED: "İşe Alındı",
    COMPLETED: "Tamamlandı"
  };
  return map[status] || status;
};

export default function SuperAdminDashboard(): React.JSX.Element {
 const router = useRouter();

 // State
 const [companies, setCompanies] = useState<Company[]>([]);
 const [hrUsers, setHrUsers] = useState<HRUser[]>([]);
 const [jobs, setJobs] = useState<Job[]>([]);
 const [applications, setApplications] = useState<Application[]>([]);
 const [candidates, setCandidates] = useState<Candidate[]>([]);
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
 const [compRes, hrRes, jobRes, appRes, candRes] = await Promise.all([
 fetch("/api/admin/companies"),
 fetch("/api/admin/hr-users"),
 fetch("/api/admin/jobs"),
 fetch("/api/admin/applications"),
 fetch("/api/admin/candidates"),
 ]);

 if (!compRes.ok || !hrRes.ok || !jobRes.ok || !appRes.ok || !candRes.ok) {
 throw new Error("Veriler yüklenirken hata oluştu.");
 }

 const compData = await compRes.json();
 const hrData = await hrRes.json();
 const jobData = await jobRes.json();
 const appData = await appRes.json();
 const candData = await candRes.json();

 setCompanies(compData);
 setHrUsers(hrData);
 setJobs(jobData);
 setApplications(appData);
 setCandidates(candData);
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

 const handleDeleteCandidate = async (id: string) => {
    if (!confirm("Bu adayı sistemden kalıcı olarak silmek istediğinize emin misiniz?")) return;

    setActionLoading(`delete_cand_${id}`);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/candidates?id=${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error((await response.json()).message || "Aday silinemedi.");

      setSuccess("Aday sistemden başarıyla silindi.");
      void fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
  <main className="min-h-screen text-white py-12 px-6 bg-black">
  <div className="max-w-7xl mx-auto">
 {/* Header */}
 <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/[0.06] pb-8 mb-12">
 <div className="flex items-center gap-3">
 <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-theme-1/10 border border-theme-1/20">
 <Shield className="h-6 w-6 text-theme-1" />
 </div>
 <div>
 <h1 className="text-3xl font-extrabold tracking-tight">Süper Admin Paneli</h1>
 <p className="text-sm text-zinc-500 mt-0.5">Tüm sistem veritabanı yönetim merkezi (CRUD)</p>
 </div>
 </div>
 <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 font-medium transition-colors">
 <LogOut className="h-4 w-4" />
 Çıkış Yap
 </button>
 </header>

 {/* Global Alert Notification */}
 {error && (
 <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2.5 p-4 mb-8 rounded-xl bg-red-500/[0.08] border border-red-500/20 text-red-300 text-sm">
 <AlertTriangle className="h-5 w-5 shrink-0" />
 <span>{error}</span>
 </motion.div>
 )}

 {success && (
 <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2.5 p-4 mb-8 rounded-xl bg-theme-1/[0.08] border border-theme-1/20 text-theme-1 text-sm">
 <CheckCircle2 className="h-5 w-5 shrink-0" />
 <span>{success}</span>
 </motion.div>
 )}

 {/* Loading Overlay */}
 {isLoading ? (
 <div className="flex flex-col items-center justify-center py-24 gap-4">
 <Loader2 className="h-8 w-8 animate-spin text-theme-1" />
 <p className="text-sm text-zinc-500">Supabase Veritabanı bağlantısı kuruluyor...</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
 {/* Forms section */}
 <div className="lg:col-span-5 space-y-8">
 {/* Add Company Card */}
 <div className="rounded-2xl border border-[#222] bg-[#0a0a0a] p-6 shadow-2xl">
 <div className="flex items-center gap-2 mb-6">
 <Building2 className="h-5 w-5 text-theme-1" />
 <h2 className="text-xl font-bold">Firma Ekle</h2>
 </div>
 <form onSubmit={handleAddCompany} className="space-y-4">
 <div>
 <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Firma Adı</label>
 <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Örn: Acme Corporation" required className="w-full px-4 py-3 rounded-xl bg-[#111] border border-[#333] text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-theme-1/30 transition-all" />
 </div>
 <button type="submit" disabled={actionLoading === "add_company"} className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-theme-1 hover:bg-theme-1 text-white font-semibold text-sm transition-all duration-200 disabled:opacity-50">
 {actionLoading === "add_company" ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Firma Oluştur</>}
 </button>
 </form>
 </div>

 {/* Add HR User Card */}
 <div className="rounded-2xl border border-[#222] bg-[#0a0a0a] p-6 shadow-2xl">
 <div className="flex items-center gap-2 mb-6">
 <Users className="h-5 w-5 text-theme-2" />
 <h2 className="text-xl font-bold">İK Kullanıcısı Ekle</h2>
 </div>
 <form onSubmit={handleAddHRUser} className="space-y-4">
 <div>
 <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Firma Seçin</label>
 <select value={selectedCompanyId} onChange={(e) => setSelectedCompanyId(e.target.value)} required className="w-full px-4 py-3 rounded-xl bg-[#111] border border-[#333] text-white text-sm focus:outline-none focus:ring-2 focus:ring-theme-2/30 transition-all">
 <option value="">Seçiniz...</option>
 {companies.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
 </select>
 </div>
 <div>
 <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Ad Soyad</label>
 <div className="relative">
 <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
 <input type="text" value={hrName} onChange={(e) => setHrName(e.target.value)} placeholder="Ad Soyad" required className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#111] border border-[#333] text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-theme-2/30 transition-all" />
 </div>
 </div>
 <div>
 <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">E-posta Adresi</label>
 <div className="relative">
 <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
 <input type="email" value={hrEmail} onChange={(e) => setHrEmail(e.target.value)} placeholder="ik@firma.com" required className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#111] border border-[#333] text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-theme-2/30 transition-all" />
 </div>
 </div>
 <div>
 <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Geçici Şifre</label>
 <div className="relative">
 <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
 <input type="password" value={hrPassword} onChange={(e) => setHrPassword(e.target.value)} placeholder="••••••••" required className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#111] border border-[#333] text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-theme-2/30 transition-all" />
 </div>
 </div>
 <button type="submit" disabled={actionLoading === "add_hr"} className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-theme-2 hover:bg-theme-2 text-white font-semibold text-sm transition-all duration-200 disabled:opacity-50">
 {actionLoading === "add_hr" ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Kullanıcı Oluştur</>}
 </button>
 </form>
 </div>
 </div>

 {/* Lists Section */}
 <div className="lg:col-span-7 space-y-6">
 {/* Companies list */}
 <div className="rounded-2xl border border-[#222] bg-[#0a0a0a] p-6 shadow-2xl">
 <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
 <Building2 className="h-5 w-5 text-theme-1" />
 Kayıtlı Firmalar
 </h3>
 {companies.length === 0 ? (
 <p className="text-sm text-zinc-600 py-4">Kayıtlı firma bulunamadı.</p>
 ) : (
 <div className="divide-y divide-white/[0.04] max-h-48 overflow-y-auto pr-2">
 {companies.map((c) => (
 <div key={c.id} className="flex items-center justify-between py-3">
 <div>
 <p className="text-base font-semibold">{c.name}</p>
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
 <div className="rounded-2xl border border-[#222] bg-[#0a0a0a] p-6 shadow-2xl">
 <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
 <Users className="h-5 w-5 text-theme-2" />
 İK Yetkilileri
 </h3>
 {hrUsers.length === 0 ? (
 <p className="text-sm text-zinc-600 py-4">Kayıtlı İK kullanıcısı bulunamadı.</p>
 ) : (
 <div className="divide-y divide-white/[0.04] max-h-48 overflow-y-auto pr-2">
 {hrUsers.map((u) => (
 <div key={u.id} className="flex items-center justify-between py-3">
 <div>
 <p className="text-base font-semibold">{u.fullName}</p>
 <p className="text-sm text-zinc-400">{u.email}</p>
 <p className="text-xs text-zinc-500">Firma: {u.companyName || "Bilinmiyor"}</p>
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
 <div className="rounded-2xl border border-[#222] bg-[#0a0a0a] p-6 shadow-2xl">
 <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
 <Briefcase className="h-5 w-5 text-theme-1" />
 Tüm İş İlanları
 </h3>
 {jobs.length === 0 ? (
 <p className="text-sm text-zinc-600 py-4">Kayıtlı iş ilanı bulunamadı.</p>
 ) : (
 <div className="divide-y divide-white/[0.04] max-h-48 overflow-y-auto pr-2">
 {jobs.map((j) => (
 <div key={j.id} className="flex items-center justify-between py-3">
 <div>
 <p className="text-base font-semibold">{j.title}</p>
 <p className="text-sm text-theme-1/80">{j.company.name}</p>
 <p className="text-xs text-zinc-500">Durum: {translateStatus(j.status)}</p>
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
 <div className="rounded-2xl border border-[#222] bg-[#0a0a0a] p-6 shadow-2xl">
 <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
 <FileText className="h-5 w-5 text-theme-2" />
 Tüm Başvurular (Sadece Görüntüleme)
 </h3>
 {applications.length === 0 ? (
 <p className="text-sm text-zinc-600 py-4">Kayıtlı başvuru bulunamadı.</p>
 ) : (
 <div className="divide-y divide-white/[0.04] max-h-48 overflow-y-auto pr-2">
 {applications.map((a) => (
 <div key={a.id} className="flex items-center justify-between py-3">
 <div>
 <p className="text-base font-semibold">{a.candidate.fullName}</p>
 <p className="text-sm text-zinc-400">{a.candidate.email}</p>
 <p className="text-xs text-theme-2/80 mt-0.5">{a.jobPosting.title} ({a.jobPosting.company.name})</p>
 <p className="text-xs text-zinc-500">Skor: {a.techScore || "Bekliyor"} | Durum: {translateStatus(a.status)}</p>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Candidates List */}
 <div className="rounded-2xl border border-[#222] bg-[#0a0a0a] p-6 shadow-2xl">
 <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
 <User className="h-5 w-5 text-theme-1" />
 Sisteme Kayıtlı Adaylar
 </h3>
 {candidates.length === 0 ? (
 <p className="text-sm text-zinc-600 py-4">Kayıtlı aday bulunamadı.</p>
 ) : (
 <div className="divide-y divide-white/[0.04] max-h-60 overflow-y-auto pr-2">
 {candidates.map((c) => (
 <div key={c.id} className="flex items-center justify-between py-3">
 <div>
 <p className="text-base font-semibold">{c.fullName}</p>
 <p className="text-sm text-zinc-400">{c.email}</p>
 <p className="text-xs text-zinc-500">Kayıt: {new Date(c.createdAt).toLocaleDateString("tr-TR")}</p>
 </div>
 <button onClick={() => handleDeleteCandidate(c.id)} disabled={actionLoading?.startsWith("delete_cand_")} className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors">
 <Trash2 className="h-4 w-4" />
 </button>
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
