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
  Unlock,
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
  FileText
} from "lucide-react";

/* ══════════════════════════════════════════════════════
   TYPES & DATA (Proctoring/Transcript are still UI mockups)
   ══════════════════════════════════════════════════════ */

interface RadarDataPoint {
  readonly subject: string;
  readonly score: number;
  readonly fullMark: number;
}

type ProctorSeverity = "low" | "negligible" | "clean";

interface ProctorEvent {
  readonly time: string;
  readonly type: string;
  readonly detail: string;
  readonly severity: ProctorSeverity;
}

const PROCTOR_LOG: readonly ProctorEvent[] = [
  { time: "14:02", type: "İnceleme", detail: "İkinci ses algılandı (Düşük risk)", severity: "low" },
  { time: "12:45", type: "Göz teması", detail: "Kamera odak kaybı (İhmal edilebilir)", severity: "negligible" },
  { time: "09:10", type: "Teknik", detail: "Kusursuz cevap", severity: "clean" },
  { time: "07:30", type: "Ortam", detail: "Arka plan sesi normlarda", severity: "clean" },
  { time: "03:15", type: "Bağlantı", detail: "Stabil bağlantı doğrulandı", severity: "clean" },
] as const;

interface TranscriptLine {
  readonly speaker: "ai" | "candidate";
  readonly text: string;
}

const TRANSCRIPT: readonly TranscriptLine[] = [
  { speaker: "ai", text: "Önceki deneyimlerinizde karşılaştığınız en büyük teknik zorluk neydi?" },
  { speaker: "candidate", text: "Büyük bir veri taşıma operasyonunda [SANSÜRLENDİ] downtime olmadan geçiş yapmamız gerekiyordu. Veritabanı replikasyonu ve dual-write stratejisi ile bu sorunu çözdük." },
  { speaker: "ai", text: "Bu süreçte öğrendiğiniz en önemli ders neydi?" },
  { speaker: "candidate", text: "Rollback planının en az deployment planı kadar detaylı olması gerektiği. Özellikle [SANSÜRLENDİ] aşamasında yaşanan bir darboğaz bizi bu konuda çok şey öğretti." },
] as const;

const SEVERITY_STYLES: Record<ProctorSeverity, { dot: string; bg: string; text: string }> = {
  low: { dot: "bg-amber-500", bg: "bg-amber-500/[0.06] border-amber-500/10", text: "text-amber-400/70" },
  negligible: { dot: "bg-zinc-500", bg: "bg-zinc-500/[0.04] border-zinc-500/10", text: "text-zinc-400/60" },
  clean: { dot: "bg-emerald-500", bg: "bg-emerald-500/[0.04] border-emerald-500/10", text: "text-emerald-400/60" },
} as const;

/* ══════════════════════════════════════════════════════
   CUSTOM TOOLTIP
   ══════════════════════════════════════════════════════ */

interface TooltipPayloadItem {
  readonly value: number;
  readonly payload: RadarDataPoint;
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
      <p className="mt-0.5 text-sm font-bold text-blue-400">{item.value}/100</p>
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
  const [showIdentity, setShowIdentity] = useState(false);

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
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
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
        <Link href="/hr/pipeline" className="text-sm text-blue-400 hover:underline">
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 to-purple-500/15 ring-1 ring-white/[0.06]">
              <Hash className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                {showIdentity ? data.fullName : `Aday #${data.id.substring(0, 5)}`}
              </h1>
              <p className="text-sm text-white/30">
                Başvurulan Pozisyon:{" "}
                <span className="font-medium text-white/50">
                  {data.role}
                </span>
              </p>
              {showIdentity && (
                  <p className="text-xs text-blue-400/80 mt-1">{data.email}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 pl-[52px]">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium ${
                data.status === "COMPLETED" 
                    ? "border-emerald-500/15 bg-emerald-500/[0.06] text-emerald-400"
                    : "border-amber-500/15 bg-amber-500/[0.06] text-amber-400"
            }`}>
              {data.status === "COMPLETED" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              {data.status === "COMPLETED" ? "Mülakat Tamamlandı" : "Değerlendirmede"}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-0">
          <button
            type="button"
            onClick={() => setShowIdentity(!showIdentity)}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-500/15 bg-amber-500/[0.06] px-4 py-2.5 text-xs font-semibold text-amber-400 transition-all duration-300 hover:border-amber-500/25 hover:bg-amber-500/[0.1]"
          >
            <Unlock className="h-3.5 w-3.5" />
            {showIdentity ? "Kimliği Gizle" : "Kimliği Aç"}
          </button>
          {data.cvUrl ? (
            <a
              href={data.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-blue-500/15 bg-blue-500/[0.06] px-4 py-2.5 text-xs font-semibold text-blue-400 transition-all duration-300 hover:border-blue-500/25 hover:bg-blue-500/[0.1]"
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
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10">
              <Brain className="h-3.5 w-3.5 text-purple-400" />
            </div>
            <h2 className="text-sm font-semibold text-white/70">
              AI Yönetici Özeti
            </h2>
          </div>
          <div className="p-6">
            <p className="text-sm leading-relaxed text-white/40">
              Aday, {data.role} gereksinimlerine <span className="font-medium text-white/60">{data.techScore >= 75 ? "yüksek oranda" : "orta düzeyde"} uyum</span> gösterdi. Teknik analizlerde tutarlı cevaplar verirken iletişim becerileri yeterli bulundu.
            </p>
            <div className="mt-5 flex gap-3">
              <div className="flex-1 rounded-xl border border-blue-500/10 bg-blue-500/[0.04] p-3 text-center">
                <p className="text-xl font-bold text-blue-400">{data.techScore}</p>
                <p className="mt-0.5 text-[10px] text-white/25">Teknik Skor</p>
              </div>
              <div className="flex-1 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.04] p-3 text-center">
                <p className="text-xl font-bold text-emerald-400">%{data.reliability}</p>
                <p className="mt-0.5 text-[10px] text-white/25">Güvenilirlik</p>
              </div>
              <div className="flex-1 rounded-xl border border-purple-500/10 bg-purple-500/[0.04] p-3 text-center">
                <p className="text-xl font-bold text-purple-400">{overallGrade}</p>
                <p className="mt-0.5 text-[10px] text-white/25">Genel Derece</p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── TOP RIGHT: Radar Chart ─── */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015]">
          <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-6 py-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
              <Eye className="h-3.5 w-3.5 text-blue-400" />
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

        {/* ─── BOTTOM LEFT: Proctoring Log ─── */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015]">
          <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-6 py-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <h2 className="text-sm font-semibold text-white/70">
              Proctoring Log
            </h2>
            <span className="ml-auto text-[10px] text-white/15">Örnek Veri</span>
          </div>
          <div className="divide-y divide-white/[0.03]">
            {PROCTOR_LOG.map((event, i) => {
              const style = SEVERITY_STYLES[event.severity];
              return (
                <div
                  key={i}
                  className="flex items-start gap-4 px-6 py-3.5 transition-colors hover:bg-white/[0.01]"
                >
                  <span className="mt-0.5 shrink-0 font-mono text-xs text-white/20">
                    {event.time}
                  </span>
                  <span className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-medium ${style.bg} ${style.text}`}>
                        {event.type}
                      </span>
                      {event.severity === "low" && (
                        <AlertTriangle className="h-3 w-3 text-amber-500/40" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-white/35">{event.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── BOTTOM RIGHT: Anonymous Transcript ─── */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015]">
          <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-6 py-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10">
              <ScrollText className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <h2 className="text-sm font-semibold text-white/70">
              Transkript
            </h2>
            <span className="ml-auto text-[10px] text-white/15">
               {showIdentity ? "Açık" : "Anonim"}
            </span>
          </div>
          <div className="max-h-[320px] overflow-y-auto">
            <div className="space-y-0 divide-y divide-white/[0.03]">
              {TRANSCRIPT.map((line, i) => (
                <div
                  key={i}
                  className={`px-6 py-3.5 ${
                    line.speaker === "ai" ? "bg-white/[0.01]" : ""
                  }`}
                >
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider ${
                      line.speaker === "ai"
                        ? "text-blue-400/50"
                        : "text-emerald-400/50"
                    }`}
                  >
                    {line.speaker === "ai" ? "AgenticHR" : (showIdentity ? data.fullName : `Aday #${data.id.substring(0, 5)}`)}
                  </span>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/40">
                    {showIdentity ? line.text.replace(/\[SANSÜRLENDİ\]/g, "---") : line.text.split("[SANSÜRLENDİ]").map((part, j, arr) => (
                      <span key={j}>
                        {part}
                        {j < arr.length - 1 && (
                          <span className="mx-0.5 rounded bg-red-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-red-400/60">
                            [SANSÜRLENDİ]
                          </span>
                        )}
                      </span>
                    ))}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
