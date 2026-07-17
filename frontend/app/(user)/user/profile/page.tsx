"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, BookOpen, Briefcase, FileText, LayoutList, CheckCircle2, Loader2, Save, Plus, Trash2, Upload, Edit, X, Mail, Lock } from "lucide-react";
import { useToast } from "@/components/ToastContext";
import { useRouter } from "next/navigation";

// Zod Schemas
const educationSchema = z.object({
  university: z.string().optional(),
  faculty: z.string().optional(),
  degree: z.string().optional(),
  year: z.string().optional(),
  gpa: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isHighSchool: z.boolean().optional(),
});

const experienceSchema = z.object({
  type: z.string().optional(),
  title: z.string().optional(),
  organization: z.string().optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const profileSchema = z.object({
  fullName: z.string().min(2, "Ad soyad zorunludur."),
  email: z.string().email("Geçerli bir e-posta giriniz."),
  avatarUrl: z.string().optional(),
  tcKimlikNo: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  educations: z.array(educationSchema).optional(),
  internshipPreferences: z.object({
    type: z.string().optional(),
    duration: z.coerce.number().optional(),
    insurance: z.string().optional(),
    workModel: z.string().optional(),
    availability: z.string().optional(),
  }).optional(),
  skills: z.object({
    foreignLanguages: z.string().optional(),
    technicalSkills: z.string().optional(),
    softSkills: z.string().optional(),
  }).optional(),
  experiences: z.array(experienceSchema).optional(),
  documents: z.object({
    cvUrl: z.string().optional(),
    transcriptUrl: z.string().optional(),
    linkedInUrl: z.string().optional(),
    githubUrl: z.string().optional(),
    portfolioUrl: z.string().optional(),
  }).optional()
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const tabs = [
  { id: "kimlik", label: "Kimlik Bilgileri", icon: User },
  { id: "egitim", label: "Eğitim", icon: BookOpen },
  { id: "tercihler", label: "Tercihler", icon: LayoutList },
  { id: "yetenekler", label: "Yetenekler", icon: SparklesIcon },
  { id: "deneyim", label: "Deneyim", icon: Briefcase },
  { id: "belgeler", label: "Belgeler", icon: FileText },
];

function SparklesIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
    </svg>
  );
}

export default function CandidateProfilePage() {
  const [activeTab, setActiveTab] = useState("kimlik");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  
  const { addToast } = useToast();
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    // @ts-ignore
    resolver: zodResolver(profileSchema),
    defaultValues: { educations: [], experiences: [], documents: { cvUrl: "" } }
  });

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control, name: "educations" });
  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control, name: "experiences" });

  const loadProfile = async () => {
    try {
      const res = await fetch("/api/users/profile");
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
        
        if (!data.isProfileComplete) {
          // Do not force edit mode. Let the user see the view page first.
        }

        // Populate form
        if (data.fullName) setValue("fullName", data.fullName);
        if (data.email) setValue("email", data.email);
        if (data.phone) setValue("phone", data.phone);
        if (data.address) setValue("address", data.address);
        if (data.tcKimlikNo) setValue("tcKimlikNo", data.tcKimlikNo);
        if (data.dateOfBirth) setValue("dateOfBirth", new Date(data.dateOfBirth).toISOString().split('T')[0]);
        if (data.avatarUrl) setValue("avatarUrl", data.avatarUrl);
        
        if (data.internshipPreferences) setValue("internshipPreferences", data.internshipPreferences);
        
        if (data.skills) {
          setValue("skills.foreignLanguages", JSON.parse(data.skills.foreignLanguages || "[]").join(", "));
          setValue("skills.technicalSkills", JSON.parse(data.skills.technicalSkills || "[]").join(", "));
          setValue("skills.softSkills", JSON.parse(data.skills.softSkills || "[]").join(", "));
        }
        
        if (data.documents) setValue("documents", data.documents);
        
        if (data.educations && data.educations.length > 0) {
          setValue("educations", data.educations.map((e: any) => ({
            ...e,
            startDate: new Date(e.startDate).toISOString().split('T')[0],
            endDate: e.endDate ? new Date(e.endDate).toISOString().split('T')[0] : "",
          })));
        } else {
          appendEdu({ university: "", faculty: "", degree: "", year: "", gpa: "", startDate: "", isHighSchool: false });
        }

        if (data.experiences && data.experiences.length > 0) {
          setValue("experiences", data.experiences.map((e: any) => ({
            ...e,
            startDate: e.startDate ? new Date(e.startDate).toISOString().split('T')[0] : "",
            endDate: e.endDate ? new Date(e.endDate).toISOString().split('T')[0] : "",
          })));
        }
      } else {
        appendEdu({ university: "", faculty: "", degree: "", year: "", gpa: "", startDate: "", isHighSchool: false });
        // Let the user see the view page even if fetch fails or is new
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [setValue, appendEdu]);

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true);
    try {
      const payload = {
        ...data,
        isProfileComplete: true,
        skills: {
          foreignLanguages: (data.skills?.foreignLanguages || "").split(",").map(s => s.trim()).filter(Boolean),
          technicalSkills: (data.skills?.technicalSkills || "").split(",").map(s => s.trim()).filter(Boolean),
          softSkills: (data.skills?.softSkills || "").split(",").map(s => s.trim()).filter(Boolean),
        }
      };

      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Profil güncellenemedi.");
      
      addToast("Profil başarıyla kaydedildi.", "success");
      setIsEditing(false);
      await loadProfile(); // Refresh view
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: "cvUrl" | "transcriptUrl" | "avatarUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", fieldName === "avatarUrl" ? "avatar" : fieldName === "cvUrl" ? "cv" : "transcript");

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Dosya yüklenemedi.");
      const data = await res.json();
      
      if (fieldName === "avatarUrl") {
        setValue("avatarUrl", data.url);
        
        // Fotoğraf yüklendiği an arka planda doğrudan profile kaydet
        await fetch("/api/users/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatarUrl: data.url }),
        });
        
        await loadProfile(); // Navbar ve diğer yerlerin güncellenmesi için veriyi yenile
        addToast("Profil fotoğrafı başarıyla güncellendi.", "success");
      } else {
        setValue(`documents.${fieldName}`, data.url);
        addToast(`${fieldName === "cvUrl" ? "CV" : "Transkript"} yüklendi.`, "success");
      }
    } catch (err: any) {
      addToast(err.message, "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-theme-1" />
      </div>
    );
  }

  const renderError = (path: string) => {
    const parts = path.split(".");
    let current: any = errors;
    for (const part of parts) {
      if (current && current[part]) {
        current = current[part];
      } else {
        return null;
      }
    }
    if (current && current.message) {
      return <p className="text-red-400 text-xs mt-1">{current.message as string}</p>;
    }
    return null;
  };

  // VIEW MODE
  if (!isEditing && profileData) {
    return (
      <div className="pb-12 max-w-4xl mx-auto">
        {/* Centered Profile Header */}
        <div className="flex flex-col items-center justify-center mb-10 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-theme-1/20 to-theme-2/20 border-2 border-theme-1/30 flex items-center justify-center mb-4 overflow-hidden">
            {profileData.avatarUrl ? (
              <img src={profileData.avatarUrl} alt={profileData.fullName} className="w-full h-full object-cover select-none pointer-events-none" draggable="false" onContextMenu={(e) => e.preventDefault()} />
            ) : (
              <User className="w-8 h-8 text-theme-1" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{profileData.fullName}</h1>
          <p className="text-zinc-400 mt-2 flex flex-col md:flex-row items-center gap-2 justify-center text-sm">
            <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {profileData.email}</span>
            {profileData.phone && (
              <>
                <span className="hidden md:inline text-white/20">•</span>
                <span>{profileData.phone}</span>
              </>
            )}
          </p>
        </div>



        {/* Action Bar for Edit */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 border-b border-white/5 pb-4">
          <h2 className="text-xl font-bold text-white">Profil Detayları</h2>
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-theme-1 hover:bg-theme-1/90 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-theme-1/20 w-full sm:w-auto justify-center">
            <Edit className="w-4 h-4" /> Profili Düzenle
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 space-y-6">
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 backdrop-blur-md">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><User className="w-5 h-5 text-theme-1" /> Temel Bilgiler</h3>
              <div className="space-y-3 text-sm">
                <div><span className="text-zinc-500 block">Doğum Tarihi</span><span className="text-zinc-200">{profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString("tr-TR") : "-"}</span></div>
                <div><span className="text-zinc-500 block">İkametgah</span><span className="text-zinc-200">{profileData.address || "-"}</span></div>
                <div><span className="text-zinc-500 block">Tercih Edilen Model</span><span className="text-zinc-200">{profileData.internshipPreferences?.workModel || "-"}</span></div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 backdrop-blur-md">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-theme-1" /> Yetenekler</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-zinc-500 block mb-1">Yabancı Diller</span>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills?.foreignLanguages ? JSON.parse(profileData.skills.foreignLanguages).map((l: string) => (
                      <span key={l} className="bg-white/5 border border-white/10 px-2 py-1 rounded-md text-zinc-300">{l}</span>
                    )) : "-"}
                  </div>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-1">Teknik Beceriler</span>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills?.technicalSkills ? JSON.parse(profileData.skills.technicalSkills).map((l: string) => (
                      <span key={l} className="bg-theme-1/10 text-theme-1 border border-theme-1/20 px-2 py-1 rounded-md">{l}</span>
                    )) : "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-2 space-y-6">
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 backdrop-blur-md">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-theme-1" /> Eğitim Bilgileri</h3>
              {profileData.educations && profileData.educations.length > 0 ? (
                <div className="space-y-4">
                  {profileData.educations.map((edu: any) => (
                    <div key={edu.id} className="border-l-2 border-theme-1/30 pl-4 py-1">
                      <h4 className="text-base font-semibold text-white">{edu.university}</h4>
                      <p className="text-sm text-zinc-400">{edu.faculty} - {edu.degree}</p>
                      <p className="text-xs text-zinc-500 mt-1">{edu.year} • GANO: {edu.gpa}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">Eğitim bilgisi bulunamadı.</p>
              )}
            </div>

            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 backdrop-blur-md">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-theme-1" /> Deneyim ve Projeler</h3>
              {profileData.experiences && profileData.experiences.length > 0 ? (
                <div className="space-y-4">
                  {profileData.experiences.map((exp: any) => (
                    <div key={exp.id} className="border-l-2 border-theme-1/30 pl-4 py-1">
                      <h4 className="text-base font-semibold text-white">{exp.title}</h4>
                      <p className="text-sm text-zinc-400">{exp.organization} <span className="text-xs ml-2 bg-white/5 px-2 py-0.5 rounded-full">{exp.type}</span></p>
                      {exp.description && <p className="text-sm text-zinc-300 mt-2">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">Deneyim bulunamadı.</p>
              )}
            </div>
            
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 backdrop-blur-md">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-theme-1" /> Belgeler</h3>
              <div className="flex gap-4">
                {profileData.documents?.cvUrl && (
                  <a href={profileData.documents.cvUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-sm text-zinc-300 transition-colors">
                    <FileText className="w-4 h-4" /> Özgeçmişi Görüntüle
                  </a>
                )}
                {profileData.documents?.linkedInUrl && (
                  <a href={profileData.documents.linkedInUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-sm text-zinc-300 transition-colors">
                    LinkedIn
                  </a>
                )}
                {profileData.documents?.githubUrl && (
                  <a href={profileData.documents.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-sm text-zinc-300 transition-colors">
                    GitHub
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // EDIT MODE
  return (
    <div className="pb-12 max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Profili Düzenle</h1>
          <p className="mt-1 text-sm text-zinc-400">Tüm bilgilerinizi eksiksiz doldurarak kayıt olun.</p>
        </div>
        <div className="flex items-center gap-3">
          {profileData?.isProfileComplete && (
            <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 rounded-xl bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10">
              İptal
            </button>
          )}
          <button onClick={handleSubmit(onSubmit as any, (errs) => {
            console.log("Validation errors:", errs);
            const firstErrorKey = Object.keys(errs)[0];
            addToast(`Lütfen tüm zorunlu alanları doldurun. (Eksik/Hatalı alan: ${firstErrorKey})`, "error");
          })} disabled={isSaving} className="flex items-center gap-2 rounded-xl bg-theme-1 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-theme-1/90 disabled:opacity-50 shadow-[0_0_15px_var(--theme-c1)]/30">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Profili Kaydet
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex-shrink-0 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all ${isActive ? "bg-theme-1/10 text-theme-1 border border-theme-1/20" : "text-zinc-400 hover:bg-white/[0.04] hover:text-white border border-transparent"}`}>
                <Icon className={`h-4 w-4 ${isActive ? "text-theme-1" : "text-zinc-500"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 min-w-0">
          <form className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-md">
            
            {activeTab === "kimlik" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-lg font-semibold text-white border-b border-white/[0.06] pb-4 mb-6">Kimlik ve İletişim Bilgileri</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Avatar Upload */}
                  <div className="md:col-span-2 flex items-center gap-6 p-4 border border-white/[0.06] rounded-xl bg-black/20">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-theme-1/20 to-theme-2/20 border-2 border-theme-1/30 flex items-center justify-center shrink-0">
                      {watch("avatarUrl") ? (
                        <img src={watch("avatarUrl")} alt="Profil Avatarı" className="w-full h-full object-cover select-none pointer-events-none" draggable="false" onContextMenu={(e) => e.preventDefault()} />
                      ) : (
                        <User className="w-8 h-8 text-theme-1" />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Profil Fotoğrafı</label>
                      <label className="cursor-pointer flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/10 w-fit">
                        <Upload className="h-4 w-4" />
                        <span className="text-sm text-zinc-300">Fotoğraf Seç</span>
                        <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={(e) => handleFileUpload(e, "avatarUrl")} />
                      </label>
                    </div>
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1.5">Ad Soyad (Kullanıcı Adı) <span className="text-red-400">*</span></label>
                      <input {...register("fullName")} className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:border-theme-1/50 focus:ring-1 focus:ring-theme-1/50 outline-none transition-all" />
                      {renderError("fullName")}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1.5">E-posta <span className="text-red-400">*</span></label>
                      <input type="email" {...register("email")} className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:border-theme-1/50 focus:ring-1 focus:ring-theme-1/50 outline-none transition-all" />
                      {renderError("email")}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Telefon Numarası <span className="text-red-400">*</span></label>
                    <input {...register("phone")} className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:border-theme-1/50 focus:ring-1 focus:ring-theme-1/50 outline-none transition-all" />
                    {renderError("phone")}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Doğum Tarihi <span className="text-red-400">*</span></label>
                    <input type="date" {...register("dateOfBirth")} className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:border-theme-1/50 focus:ring-1 focus:ring-theme-1/50 outline-none transition-all" />
                    {renderError("dateOfBirth")}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">İkametgah Adresi <span className="text-red-400">*</span></label>
                    <textarea {...register("address")} rows={3} className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:border-theme-1/50 outline-none" />
                    {renderError("address")}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">T.C. Kimlik No <span className="text-zinc-500 font-normal">(Opsiyonel)</span></label>
                    <input autoComplete="off" {...register("tcKimlikNo")} className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:border-theme-1/50 outline-none" />
                    {renderError("tcKimlikNo")}
                  </div>
                  
                  {/* Password Change Mock Section */}
                  <div className="md:col-span-2 mt-4 pt-6 border-t border-white/[0.06]">
                    <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-theme-1" /> Parola İşlemleri
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                      <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Eski Parola</label>
                        <input type="password" placeholder="Mevcut parolanız" className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-theme-1/50" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Yeni Parola</label>
                        <input type="password" placeholder="Yeni parolanız" className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-theme-1/50" />
                      </div>
                      <div className="md:col-span-2 flex items-center gap-4 mt-2">
                        <button type="button" className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/10">
                          Şifreyi Değiştir
                        </button>
                        <button type="button" disabled className="bg-theme-1/20 text-theme-1/70 px-4 py-2 rounded-lg text-xs font-medium cursor-not-allowed">
                          Sıfırlama Maili Gönder (Pasif)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "egitim" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-6">
                  <h2 className="text-lg font-semibold text-white">Eğitim Geçmişi</h2>
                  <button type="button" onClick={() => appendEdu({ university: "", faculty: "", degree: "", year: "", gpa: "", startDate: "", isHighSchool: false })} className="text-xs font-semibold text-theme-1 hover:text-theme-1/80 flex items-center gap-1">
                    <Plus className="h-3 w-3" /> Ekle
                  </button>
                </div>
                {renderError("educations")}
                {eduFields.map((field, index) => (
                  <div key={field.id} className="p-5 border border-white/[0.06] rounded-xl bg-black/20 mb-4 relative group">
                    <button type="button" onClick={() => removeEdu(index)} className="absolute right-4 top-4 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 className="h-4 w-4" /></button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2"><label className="block text-xs text-zinc-400 mb-1">Üniversite *</label><input {...register(`educations.${index}.university`)} className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white" />{renderError(`educations.${index}.university`)}</div>
                      <div><label className="block text-xs text-zinc-400 mb-1">Bölüm *</label><input {...register(`educations.${index}.faculty`)} className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white" />{renderError(`educations.${index}.faculty`)}</div>
                      <div><label className="block text-xs text-zinc-400 mb-1">Derece *</label><input {...register(`educations.${index}.degree`)} className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white" />{renderError(`educations.${index}.degree`)}</div>
                      <div><label className="block text-xs text-zinc-400 mb-1">Sınıf/Durum *</label><input {...register(`educations.${index}.year`)} className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white" />{renderError(`educations.${index}.year`)}</div>
                      <div><label className="block text-xs text-zinc-400 mb-1">GANO *</label><input {...register(`educations.${index}.gpa`)} className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white" />{renderError(`educations.${index}.gpa`)}</div>
                      <div><label className="block text-xs text-zinc-400 mb-1">Başlangıç *</label><input type="date" {...register(`educations.${index}.startDate`)} className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white" />{renderError(`educations.${index}.startDate`)}</div>
                      <div><label className="block text-xs text-zinc-400 mb-1">Bitiş</label><input type="date" {...register(`educations.${index}.endDate`)} className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white" /></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "tercihler" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-lg font-semibold text-white border-b border-white/[0.06] pb-4 mb-6">Staj ve Çalışma Tercihleri</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-zinc-300 mb-1.5">Staj Türü *</label>
                    <select {...register("internshipPreferences.type")} className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none">
                      <option value="">Seçiniz...</option><option value="Zorunlu">Zorunlu</option><option value="Gönüllü">Gönüllü</option>
                    </select>
                    {renderError("internshipPreferences.type")}
                  </div>
                  <div><label className="block text-sm text-zinc-300 mb-1.5">Süre (Gün) *</label><input type="number" {...register("internshipPreferences.duration")} className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none" />{renderError("internshipPreferences.duration")}</div>
                  <div>
                    <label className="block text-sm text-zinc-300 mb-1.5">Sigorta *</label>
                    <select {...register("internshipPreferences.insurance")} className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none">
                      <option value="">Seçiniz...</option><option value="Okul">Okul</option><option value="Şirket">Şirket</option>
                    </select>
                    {renderError("internshipPreferences.insurance")}
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-300 mb-1.5">Model *</label>
                    <select {...register("internshipPreferences.workModel")} className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none">
                      <option value="">Seçiniz...</option><option value="Remote">Uzaktan</option><option value="Hybrid">Hibrit</option><option value="Onsite">Ofisten</option>
                    </select>
                    {renderError("internshipPreferences.workModel")}
                  </div>
                  <div className="md:col-span-2"><label className="block text-sm text-zinc-300 mb-1.5">Uygunluk (Ne zaman başlayabilirsiniz?) *</label><input {...register("internshipPreferences.availability")} className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none" />{renderError("internshipPreferences.availability")}</div>
                </div>
              </div>
            )}

            {activeTab === "yetenekler" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-lg font-semibold text-white border-b border-white/[0.06] pb-4 mb-6">Yetenekler ve Diller</h2>
                <div className="space-y-6">
                  <div><label className="block text-sm text-zinc-300 mb-1.5">Yabancı Diller *</label><input {...register("skills.foreignLanguages")} className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none" placeholder="Virgülle ayırın" />{renderError("skills.foreignLanguages")}</div>
                  <div><label className="block text-sm text-zinc-300 mb-1.5">Teknik Yetenekler *</label><textarea {...register("skills.technicalSkills")} rows={3} className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none" placeholder="Virgülle ayırın" />{renderError("skills.technicalSkills")}</div>
                  <div><label className="block text-sm text-zinc-300 mb-1.5">Sosyal Beceriler (Soft Skills)</label><input {...register("skills.softSkills")} className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none" /></div>
                </div>
              </div>
            )}

            {activeTab === "deneyim" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-6">
                  <h2 className="text-lg font-semibold text-white">Deneyim, Proje ve Sertifikalar</h2>
                  <button type="button" onClick={() => appendExp({ type: "", title: "", organization: "" })} className="text-xs font-semibold text-theme-1 hover:text-theme-1/80 flex items-center gap-1"><Plus className="h-3 w-3" /> Ekle</button>
                </div>
                {expFields.map((field, index) => (
                  <div key={field.id} className="p-5 border border-white/[0.06] rounded-xl bg-black/20 mb-4 relative group">
                    <button type="button" onClick={() => removeExp(index)} className="absolute right-4 top-4 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 className="h-4 w-4" /></button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className="block text-xs text-zinc-400 mb-1">Tipi</label><select {...register(`experiences.${index}.type`)} className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white"><option value="">Seçiniz</option><option value="Internship">Staj</option><option value="Project">Proje</option><option value="Club">Kulüp</option></select></div>
                      <div><label className="block text-xs text-zinc-400 mb-1">Başlık</label><input {...register(`experiences.${index}.title`)} className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white" /></div>
                      <div className="md:col-span-2"><label className="block text-xs text-zinc-400 mb-1">Kurum</label><input {...register(`experiences.${index}.organization`)} className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white" /></div>
                      <div className="md:col-span-2"><label className="block text-xs text-zinc-400 mb-1">Açıklama</label><textarea {...register(`experiences.${index}.description`)} rows={2} className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white" /></div>
                      <div><label className="block text-xs text-zinc-400 mb-1">Başlangıç</label><input type="date" {...register(`experiences.${index}.startDate`)} className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white" /></div>
                      <div><label className="block text-xs text-zinc-400 mb-1">Bitiş</label><input type="date" {...register(`experiences.${index}.endDate`)} className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white" /></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "belgeler" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-lg font-semibold text-white border-b border-white/[0.06] pb-4 mb-6">Özgeçmiş ve Bağlantılar</h2>
                <div className="space-y-6">
                  <div className="p-5 border border-white/[0.06] rounded-xl bg-black/20">
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Güncel Özgeçmiş (CV) *</label>
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/10"><Upload className="h-4 w-4" /><span className="text-sm">Dosya Seç</span><input type="file" className="hidden" accept=".pdf,.docx" onChange={(e) => handleFileUpload(e, "cvUrl")} /></label>
                      {watch("documents.cvUrl") && <span className="text-xs text-green-400"><CheckCircle2 className="h-3 w-3 inline mr-1" /> Yüklendi</span>}
                    </div>
                    {renderError("documents.cvUrl")}
                  </div>
                  <div className="p-5 border border-white/[0.06] rounded-xl bg-black/20">
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Transkript</label>
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/10"><Upload className="h-4 w-4" /><span className="text-sm">Dosya Seç</span><input type="file" className="hidden" accept=".pdf" onChange={(e) => handleFileUpload(e, "transcriptUrl")} /></label>
                      {watch("documents.transcriptUrl") && <span className="text-xs text-green-400"><CheckCircle2 className="h-3 w-3 inline mr-1" /> Yüklendi</span>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div><label className="block text-sm mb-1.5 text-zinc-300">LinkedIn</label><input {...register("documents.linkedInUrl")} className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white" /></div>
                    <div><label className="block text-sm mb-1.5 text-zinc-300">GitHub</label><input {...register("documents.githubUrl")} className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white" /></div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
