"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  ArrowLeft,
  FileDown,
  Brain,
  ShieldCheck,
  ScrollText,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Hash,
  Loader2,
  FileText,
  GraduationCap,
  Briefcase,
  Code2
} from "lucide-react";



/* ══════════════════════════════════════════════════════
   CUSTOM TOOLTIP
   ══════════════════════════════════════════════════════ */

interface TooltipPayloadItem {
  readonly value: number;
  readonly payload: any;
}

interface CustomTooltipProps {
  readonly active?: boolean;
  readonly payload?: readonly TooltipPayloadItem[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps): React.JSX.Element | null {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border border-white/[0.08] bg-zinc-900/95 px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="text-xs font-medium text-white/70">{item.payload.subject}</p>
      <p className="mt-0.5 text-sm font-bold text-theme-1">{item.value}/100</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PAGE COMPONENT
   ══════════════════════════════════════════════════════ */

interface CandidatePageProps {
  readonly params: Promise<{ id: string }>;
}

export default function CandidatePage({ params }: CandidatePageProps): React.JSX.Element {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/hr/candidate/${id}`);
        if (!res.ok) throw new Error("Aday bilgileri alınamadı.");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    void fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-theme-1" />
        <p className="text-sm text-white/50">Scorecard yükleniyor...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
          <AlertTriangle className="h-6 w-6" />
          <p>{error || "Aday bulunamadı."}</p>
        </div>
        <Link href="/hr/pipeline" className="text-sm text-theme-1 hover:underline">
          Hunisiye Dön
        </Link>
      </div>
    );
  }

  const overallGrade = data.techScore >= 85 ? "A+" : data.techScore >= 70 ? "B" : "C";

  return (
    <div className="space-y-6">
      {/* ── Back link ── */}
      <Link
        href="/hr/pipeline"
        className="inline-flex items-center gap-1.5 text-xs text-white/25 transition-colors hover:text-white/50"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Aday Hunisine Dön
      </Link>

      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-theme-1/15 to-theme-2/15 ring-1 ring-white/[0.06]">
              <Hash className="h-4 w-4 text-theme-1" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                {data.fullName}
              </h1>
              <p className="text-sm text-white/30">
                Başvurulan Pozisyon:{" "}
                <span className="font-medium text-white/50">
                  {data.role}
                </span>
              </p>
              <p className="text-xs text-theme-1/80 mt-1">{data.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pl-[52px]">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium ${
                data.status === "COMPLETED" 
                    ? "border-theme-1/15 bg-theme-1/[0.06] text-theme-1"
                    : "border-theme-2/15 bg-theme-2/[0.06] text-theme-2"
            }`}>
              {data.status === "COMPLETED" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              {data.status === "COMPLETED" ? "Mülakat Tamamlandı" : "Değerlendirmede"}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-0">
          {data.cvUrl ? (
            <a
              href={data.cvUrl.startsWith('http') ? data.cvUrl : (data.cvUrl.includes('/uploads/') ? data.cvUrl : `/uploads/${data.cvUrl.replace(/^\/+/, '')}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-theme-1/15 bg-theme-1/[0.06] px-4 py-2.5 text-xs font-semibold text-theme-1 transition-all duration-300 hover:border-theme-1/25 hover:bg-theme-1/[0.1]"
            >
              <FileText className="h-3.5 w-3.5" />
              CV Görüntüle
            </a>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-xl border border-red-500/15 bg-red-500/[0.06] px-4 py-2.5 text-xs font-semibold text-red-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              CV dosyası bulunamadı veya yüklenmemiş.
            </span>
          )}
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-xs font-semibold text-white/50 transition-all duration-300 hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white/70"
          >
            <FileDown className="h-3.5 w-3.5" />
            PDF Raporu
          </button>
        </div>
      </div>

      {/* ── 2×2 Grid ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* ─── TOP LEFT: AI Executive Summary ─── */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015]">
          <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-6 py-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-theme-2/10">
              <Brain className="h-3.5 w-3.5 text-theme-2" />
            </div>
            <h2 className="text-sm font-semibold text-white/70">
              AI Yönetici Özeti
            </h2>
          </div>
          <div className="p-6">
            <p className="text-sm leading-relaxed text-white/40">
              Aday, {data.role} gereksinimlerine <span className="font-medium text-white/60">{data.techScore >= 75 ? "yüksek oranda" : "orta düzeyde"} uyum</span> gösterdi. Teknik analizlerde tutarlı cevaplar verirken iletişim becerileri yeterli bulundu.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-theme-1/10 bg-theme-1/[0.04] p-3 text-center">
                <p className="text-xl font-bold text-theme-1">{data.techScore || "-"}</p>
                <p className="mt-0.5 text-[10px] text-white/25">Aşama 1: Algoritma</p>
              </div>
              <div className="rounded-xl border border-theme-1/10 bg-theme-1/[0.04] p-3 text-center">
                <p className="text-xl font-bold text-theme-1">{data.reliability || "-"}</p>
                <p className="mt-0.5 text-[10px] text-white/25">Aşama 2: AI Analizi</p>
              </div>
              <div className="rounded-xl border border-theme-3/10 bg-theme-3/[0.04] p-3 text-center">
                <p className="text-xl font-bold text-theme-3">{data.interviewScore || "-"}</p>
                <p className="mt-0.5 text-[10px] text-white/25">Aşama 3: Mülakat</p>
              </div>
              <div className="rounded-xl border border-theme-4/10 bg-theme-4/[0.04] p-3 text-center">
                <p className="text-xl font-bold text-theme-4">{data.overallScore || "-"}</p>
                <p className="mt-0.5 text-[10px] text-white/25">Aşama 4: Genel Puan</p>
              </div>
              <div className="col-span-2 rounded-xl border border-theme-5/10 bg-theme-5/[0.04] p-3 text-center">
                <p className="text-xl font-bold text-theme-5">{overallGrade}</p>
                <p className="mt-0.5 text-[10px] text-white/25">Performans Derecesi</p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── TOP RIGHT: Radar Chart ─── */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015]">
          <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-6 py-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-theme-1/10">
              <Eye className="h-3.5 w-3.5 text-theme-1" />
            </div>
            <h2 className="text-sm font-semibold text-white/70">
              Yetkinlik Radarı
            </h2>
          </div>
          <div className="p-4">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.radarData}>
                  <PolarGrid
                    stroke="rgba(255,255,255,0.04)"
                    strokeDasharray="3 3"
                  />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{
                      fill: "rgba(255,255,255,0.35)",
                      fontSize: 11,
                      fontWeight: 500,
                    }}
                    stroke="rgba(255,255,255,0.06)"
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{
                      fill: "rgba(255,255,255,0.15)",
                      fontSize: 9,
                    }}
                    stroke="rgba(255,255,255,0.04)"
                    tickCount={5}
                  />
                  <Radar
                    name="Skor"
                    dataKey="score"
                    stroke="rgba(139,92,246,0.8)"
                    fill="url(#radarGradient)"
                    fillOpacity={0.35}
                    strokeWidth={2}
                    dot={{
                      r: 3,
                      fill: "#8b5cf6",
                      stroke: "#8b5cf6",
                      strokeWidth: 0,
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <defs>
                    <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ALT KISIM: EĞİTİM VE DENEYİM */}
        <div className="col-span-1 xl:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Eğitim Bilgileri */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6">
            <div className="mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-theme-1" />
              <h2 className="text-sm font-semibold text-white/70">Eğitim Bilgileri</h2>
            </div>
            {data.educations && data.educations.length > 0 ? (
              <div className="space-y-3">
                {data.educations.map((edu: any) => (
                  <div key={edu.id} className="rounded-xl border border-theme-1/10 bg-theme-1/[0.02] p-4">
                    <h3 className="font-semibold text-white/90">{edu.university}</h3>
                    <p className="text-xs text-white/60 mt-1">{edu.faculty} - {edu.degree}</p>
                    <p className="text-[11px] text-theme-1 mt-2">
                      {new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Devam Ediyor'} • {edu.gpa} Ort.
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-white/30 text-center py-6">Eğitim bilgisi bulunmuyor.</p>
            )}
          </div>

          {/* Deneyimler */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6">
            <div className="mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-theme-1" />
              <h2 className="text-sm font-semibold text-white/70">Deneyimler</h2>
            </div>
            {data.experiences && data.experiences.length > 0 ? (
              <div className="space-y-3">
                {data.experiences.map((exp: any) => (
                  <div key={exp.id} className="rounded-xl border border-theme-1/10 bg-theme-1/[0.02] p-4">
                    <h3 className="font-semibold text-white/90">{exp.organization}</h3>
                    <p className="text-xs text-white/60 mt-1">{exp.title}</p>
                    <p className="text-[11px] text-theme-1 mt-2">
                      {exp.startDate ? new Date(exp.startDate).getFullYear() : ''} - {exp.endDate ? new Date(exp.endDate).getFullYear() : 'Devam Ediyor'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-white/30 text-center py-6">Deneyim bilgisi bulunmuyor.</p>
            )}
          </div>
        </div>

        {/* TEKNİK YETENEKLER */}
        <div className="col-span-1 xl:col-span-3 rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 mt-6">
          <div className="mb-4 flex items-center gap-2">
            <Code2 className="h-5 w-5 text-theme-1" />
            <h2 className="text-sm font-semibold text-white/70">Teknik Yetenekler</h2>
          </div>
          {data.skills?.technicalSkills ? (
            <div className="flex flex-wrap gap-2">
              {data.skills.technicalSkills.replace(/[\[\]"']/g, '').split(',').filter((s: string) => s.trim().length > 0).map((skill: string, idx: number) => (
                <span key={idx} className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70">
                  {skill.trim()}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-white/30 text-center py-6">Teknik yetenek bilgisi bulunmuyor.</p>
          )}
        </div>

      </div>
    </div>
  );
}
