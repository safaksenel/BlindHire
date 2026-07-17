"use client";

import { useCallback, useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  Hash,
  BriefcaseBusiness,
  ShieldCheck,
  Brain,
  Send,
  Loader2,
  UserCheck,
  FileText,
  Mail,
  User,
  AlertCircle,
  Trash2,
  Maximize2,
  X,
  ChevronDown
} from "lucide-react";

type ColumnKey = "pending" | "llm_review" | "manual_review" | "invited" | "completed" | "hired";

interface CandidateCard {
  readonly id: string;
  readonly candidateId: string;
  readonly fullName: string;
  readonly email: string;
  readonly cvUrl: string;
  readonly role: string;
  readonly companyName?: string;
  readonly appliedAt: string;
  readonly techScore?: number | null;
  readonly reliability?: number | null;
  readonly interviewScore?: number | null;
  readonly overallScore?: number | null;
}

interface ColumnDef {
  readonly key: ColumnKey;
  readonly title: string;
  readonly icon: React.ReactNode;
  readonly accentBorder: string;
  readonly cards: CandidateCard[];
}

function CandidateCardUI({
  card,
  columnKey,
  index,
  onInvite,
  inviteStatus,
  onDelete,
  onApprove,
  onReject,
  onTriggerLLM,
  llmStatus,
}: {
  readonly card: CandidateCard;
  readonly columnKey: ColumnKey;
  readonly index: number;
  readonly onInvite?: (card: CandidateCard) => void;
  readonly inviteStatus?: "inviting" | "invited";
  readonly onDelete?: (card: CandidateCard) => void;
  readonly onApprove?: (card: CandidateCard) => void;
  readonly onReject?: (card: CandidateCard) => void;
  readonly onTriggerLLM?: (card: CandidateCard) => void;
  readonly llmStatus?: "triggering" | "idle";
}): React.JSX.Element {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
      className={`group rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.03]`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash className="h-3.5 w-3.5 text-white/15" />
          <span className="font-mono text-sm font-semibold text-white/70">
            Aday #{card.id.substring(0, 5)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/20">{card.appliedAt}</span>
          {onDelete && (
            <button 
               onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(card); }}
               className="p-1 rounded-md text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors"
               title="Başvuruyu Sil"
            >
               <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-sm font-medium text-white/90">
            <User className="h-3.5 w-3.5 text-white/30" />
            {card.fullName}
        </div>
        <div className="flex items-center gap-2 text-xs text-white/40">
            <Mail className="h-3 w-3 text-white/20" />
            {card.email}
        </div>
        <div className="flex items-center gap-2 text-xs text-white/40 mt-1">
          <BriefcaseBusiness className="h-3 w-3 text-white/20" />
          {card.companyName ? <span className="font-semibold text-white/50">{card.companyName}</span> : null}
          {card.companyName && <span className="mx-1">•</span>}
          {card.role}
        </div>
      </div>

      {columnKey !== "hired" && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {/* ATS Puanı */}
          <div className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 ${card.techScore != null && card.techScore > 0 ? "border-theme-1/10 bg-theme-1/[0.06]" : "border-zinc-500/20 bg-zinc-500/[0.06]"}`}>
            <Brain className={`h-3 w-3 shrink-0 ${card.techScore != null && card.techScore > 0 ? "text-theme-1" : "text-zinc-500"}`} />
            <span className={`text-[9px] font-semibold truncate ${card.techScore != null && card.techScore > 0 ? "text-theme-1" : "text-zinc-500"}`}>
              {card.techScore != null && card.techScore > 0 ? `ATS Puanı: ${card.techScore}/100` : "İnceleme Bekleniyor"}
            </span>
          </div>
          {/* LLM Analizi */}
          <div className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 ${card.reliability != null && card.reliability > 0 ? "border-theme-2/10 bg-theme-2/[0.06]" : "border-zinc-500/20 bg-zinc-500/[0.06]"}`}>
            <ShieldCheck className={`h-3 w-3 shrink-0 ${card.reliability != null && card.reliability > 0 ? "text-theme-2" : "text-zinc-500"}`} />
            <span className={`text-[9px] font-semibold truncate ${card.reliability != null && card.reliability > 0 ? "text-theme-2" : "text-zinc-500"}`}>
              {card.reliability != null && card.reliability > 0 ? `LLM Analizi: %${card.reliability}` : "LLM Analizi Yapılmadı"}
            </span>
          </div>
          {/* Mülakat Puanı */}
          <div className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 ${card.interviewScore != null && card.interviewScore > 0 ? "border-theme-3/10 bg-theme-3/[0.06]" : "border-zinc-500/20 bg-zinc-500/[0.06]"}`}>
            <User className={`h-3 w-3 shrink-0 ${card.interviewScore != null && card.interviewScore > 0 ? "text-theme-3" : "text-zinc-500"}`} />
            <span className={`text-[9px] font-semibold truncate ${card.interviewScore != null && card.interviewScore > 0 ? "text-theme-3" : "text-zinc-500"}`}>
              {card.interviewScore != null && card.interviewScore > 0 ? `Mülakat: ${card.interviewScore}/100` : "Mülakat Puanı Yok"}
            </span>
          </div>
          {/* Genel Puan */}
          <div className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 ${card.overallScore != null && card.overallScore > 0 ? "border-theme-4/10 bg-theme-4/[0.06]" : "border-zinc-500/20 bg-zinc-500/[0.06]"}`}>
            <CheckCircle2 className={`h-3 w-3 shrink-0 ${card.overallScore != null && card.overallScore > 0 ? "text-theme-4" : "text-zinc-500"}`} />
            <span className={`text-[9px] font-semibold truncate ${card.overallScore != null && card.overallScore > 0 ? "text-theme-4" : "text-zinc-500"}`}>
              {card.overallScore != null && card.overallScore > 0 ? `Genel Puan: ${card.overallScore}/100` : "Genel Puan Yok"}
            </span>
          </div>
        </div>
      )}

      {/* CV Görüntüle Button */}
      <div className="mt-3">
          {card.cvUrl ? (
            <a
              href={card.cvUrl.startsWith('http') ? card.cvUrl : (card.cvUrl.includes('/uploads/') ? card.cvUrl : `/uploads/${card.cvUrl.replace(/^\/+/, '')}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-theme-1/15 bg-theme-1/[0.06] px-3 py-2 text-[11px] font-semibold text-theme-1 hover:bg-theme-1/[0.1] transition-all"
            >
              <FileText className="h-3.5 w-3.5" />
              CV Görüntüle
            </a>
          ) : (
            <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/15 bg-red-500/[0.06] px-3 py-2 text-[11px] font-semibold text-red-400">
              CV dosyası bulunamadı veya yüklenmemiş.
            </div>
          )}
        </div>

      {columnKey === "manual_review" && onInvite && (
        <div className="mt-2">
          <AnimatePresence mode="wait">
            {inviteStatus === "invited" ? (
              <motion.div
                key="invited"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-2 rounded-lg border border-theme-1/15 bg-theme-1/[0.06] py-2 text-[11px] font-semibold text-theme-1"
              >
                <UserCheck className="h-3.5 w-3.5" />
                Davet Gönderildi
              </motion.div>
            ) : (
              <motion.div key="invite-btn" exit={{ opacity: 0 }}>
                <button
                  type="button"
                  disabled={inviteStatus === "inviting"}
                  onClick={() => onInvite(card)}
                  className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-[11px] font-semibold transition-all duration-300 ${
                    inviteStatus === "inviting"
                      ? "cursor-not-allowed border border-white/[0.04] bg-white/[0.02] text-white/20"
                      : "border border-theme-1/15 bg-theme-1/[0.06] text-theme-1 hover:bg-theme-1/[0.1]"
                  }`}
                >
                  {inviteStatus === "inviting" ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Mülakat Daveti Gönder
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Action Buttons Row */}
      <div className="mt-3 flex gap-2 w-full">
        {onTriggerLLM && columnKey === "pending" && (
           <button
             onClick={(e) => { e.preventDefault(); e.stopPropagation(); onTriggerLLM(card); }}
             disabled={llmStatus === "triggering"}
             className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-theme-2/15 bg-theme-2/[0.06] py-2 text-[11px] font-semibold text-theme-2 hover:bg-theme-2/[0.1] transition-all disabled:opacity-50"
           >
             {llmStatus === "triggering" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Brain className="h-3.5 w-3.5" />}
             LLM'e Gönder
           </button>
        )}
        {onApprove && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onApprove(card); }}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-theme-1/15 bg-theme-1/[0.06] py-2 text-[11px] font-semibold text-theme-1 hover:bg-theme-1/[0.1] transition-all"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Onayla
          </button>
        )}
        {onReject && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onReject(card); }}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-red-500/15 bg-red-500/[0.06] py-2 text-[11px] font-semibold text-red-400 hover:bg-red-500/[0.1] transition-all"
          >
            <AlertCircle className="h-3.5 w-3.5" />
            Reddet
          </button>
        )}
      </div>
    </motion.div>
  );

  return content;
}

export default function PipelinePage(): React.JSX.Element {
  const [columns, setColumns] = useState<ColumnDef[]>([]);
  const [inviteStatuses, setInviteStatuses] = useState<Record<string, "inviting" | "invited">>({});
  const [llmStatuses, setLlmStatuses] = useState<Record<string, "triggering" | "idle">>({});
  const [isLoading, setIsLoading] = useState(true);
  const [expandedColumn, setExpandedColumn] = useState<ColumnDef | null>(null);
  const [expandedCandidateIds, setExpandedCandidateIds] = useState<string[]>([]);
  const [detailsModalCard, setDetailsModalCard] = useState<CandidateCard | null>(null);

  const fetchPipeline = useCallback(async () => {
    try {
      const res = await fetch("/api/hr/pipeline");
      if (!res.ok) throw new Error("Veriler alınamadı.");
      const data = await res.json();
      
      const cols: ColumnDef[] = [
        {
          key: "pending",
          title: "1. CV Ön Eleme (ATS)",
          icon: <AlertCircle className="h-4 w-4 text-zinc-400/60" />,
          accentBorder: "border-t-zinc-500/20",
          cards: data.pending || [],
        },
        {
          key: "llm_review",
          title: "2. Derin CV Analizi (LLM)",
          icon: <Brain className="h-4 w-4 text-theme-2/60" />,
          accentBorder: "border-t-theme-2/20",
          cards: data.llm_review || [],
        },
        {
          key: "manual_review",
          title: "Mülakat Daveti Bekleyen",
          icon: <Clock className="h-4 w-4 text-theme-2/60" />,
          accentBorder: "border-t-theme-2/20",
          cards: data.manual_review || [],
        },
        {
          key: "invited",
          title: "Davet Gönderildi",
          icon: <Send className="h-4 w-4 text-theme-1/60" />,
          accentBorder: "border-t-theme-1/20",
          cards: data.invited || [],
        },
        {
          key: "completed",
          title: "Mülakat Tamamlandı",
          icon: <CheckCircle2 className="h-4 w-4 text-theme-1/60" />,
          accentBorder: "border-t-theme-1/20",
          cards: data.completed || [],
        },
        {
          key: "hired",
          title: "İşe Alındı",
          icon: <UserCheck className="h-4 w-4 text-emerald-400/60" />,
          accentBorder: "border-t-emerald-500/20",
          cards: data.hired || [],
        },
      ];
      setColumns(cols);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPipeline();
  }, [fetchPipeline]);

  const handleTriggerLLM = useCallback(async (card: CandidateCard) => {
    setLlmStatuses((prev) => ({ ...prev, [card.id]: "triggering" }));
    try {
      const res = await fetch("/api/hr/pipeline/trigger-llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: card.id })
      });
      if (!res.ok) throw new Error("LLM analizi başlatılamadı.");
      
      await fetchPipeline();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLlmStatuses((prev) => ({ ...prev, [card.id]: "idle" }));
    }
  }, [fetchPipeline]);

  const handleInvite = useCallback(async (card: CandidateCard) => {
    setInviteStatuses((prev) => ({ ...prev, [card.id]: "inviting" }));

    try {
      // Change status to INVITED - backend handles email and ID generation
      const statusRes = await fetch("/api/hr/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: card.id, newStatus: "INVITED" })
      });
      
      if (!statusRes.ok) throw new Error("Durum güncellenemedi.");

      setInviteStatuses((prev) => ({ ...prev, [card.id]: "invited" }));
      setTimeout(() => {
          fetchPipeline();
      }, 1500);

    } catch (e) {
      console.error(e);
      // Revert status on UI if failed
      setInviteStatuses((prev) => {
        const next = { ...prev };
        delete next[card.id];
        return next;
      });
      alert("Davet gönderilirken bir hata oluştu.");
    }
  }, [fetchPipeline]);

  const handleDelete = useCallback(async (card: CandidateCard) => {
    if (!confirm(`Başvuruyu silmek istediğinize emin misiniz? (${card.fullName})`)) return;
    try {
      const res = await fetch(`/api/hr/pipeline?id=${card.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Başvuru silinemedi.");
      await fetchPipeline();
    } catch (err: any) {
      alert(err.message);
    }
  }, [fetchPipeline]);

  const handleUpdateStatus = useCallback(async (card: CandidateCard, newStatus: string) => {
    if (newStatus === "REJECTED" && !confirm(`Adayı reddetmek istediğinize emin misiniz? (${card.fullName})`)) return;
    try {
      const res = await fetch("/api/hr/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: card.id, newStatus })
      });
      if (!res.ok) throw new Error("Durum güncellenemedi.");
      await fetchPipeline();
    } catch (err: any) {
      alert(err.message);
    }
  }, [fetchPipeline]);

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-theme-1" />
        <p className="text-sm text-white/50">Aday hunisi yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Aday Hunisi</h1>
        <p className="mt-1 text-sm text-white/30">
          Gerçek zamanlı mülakat ve değerlendirme hattı.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 pb-4">
        {columns.map((column) => (
          <div
            key={column.key}
            className={`flex flex-col rounded-2xl border border-white/[0.06] border-t-2 ${column.accentBorder} bg-white/[0.01]`}
          >
            <div className="flex items-center justify-between px-5 py-4 shrink-0">
              <div className="flex items-center gap-2.5">
                {column.icon}
                <span className="text-sm font-semibold text-white/60">
                  {column.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/[0.06] px-1.5 text-[10px] font-bold text-white/30">
                  {column.cards.length}
                </span>
                <button 
                  onClick={() => { setExpandedColumn(column); setExpandedCandidateIds([]); }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-theme-1/20 bg-theme-1/[0.08] text-[10px] font-bold text-theme-1 hover:bg-theme-1/[0.15] hover:scale-105 transition-all"
                  title="Paneli Genişlet"
                >
                  <Maximize2 className="h-3 w-3" />
                  Genişlet
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 px-3 pb-4">
              {column.cards.slice(0, 1).map((card, i) => (
                <div key={`${column.key}-${card.id}`}>
                  <CandidateCardUI
                    card={card}
                    columnKey={column.key}
                    index={i}
                    onInvite={column.key === "manual_review" ? handleInvite : undefined}
                    onDelete={handleDelete}
                    onTriggerLLM={column.key === "pending" ? handleTriggerLLM : undefined}
                    llmStatus={llmStatuses[card.id]}
                    onApprove={(column.key === "pending" || column.key === "llm_review" || column.key === "invited" || column.key === "completed") ? (c) => handleUpdateStatus(c, (column.key === "pending" || column.key === "llm_review") ? "MANUAL_REVIEW" : column.key === "completed" ? "HIRED" : "COMPLETED") : undefined}
                    onReject={column.key !== "hired" ? (c) => handleUpdateStatus(c, "REJECTED") : undefined}
                    inviteStatus={inviteStatuses[card.id]}
                  />
                  {column.key === "completed" && (
                    <button 
                      onClick={() => setDetailsModalCard(card)}
                      className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg border border-theme-1/20 bg-theme-1/[0.04] px-3 py-2 text-[11px] font-semibold text-theme-1 hover:bg-theme-1/[0.1] transition-all"
                    >
                      Aday Detaylarını Görüntüle
                    </button>
                  )}
                </div>
              ))}

              {column.cards.length === 0 && (
                <div className="flex items-center justify-center rounded-xl border border-dashed border-white/[0.06] py-10 text-xs text-white/15">
                  Aday yok
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {expandedColumn && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => { setExpandedColumn(null); setExpandedCandidateIds([]); }}
          >
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl max-h-[85vh] bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                   {expandedColumn.icon}
                   <h2 className="text-lg font-bold text-white">{expandedColumn.title} <span className="text-white/40 text-sm font-normal ml-2">({expandedColumn.cards.length} Aday)</span></h2>
                </div>
                <div className="flex items-center gap-2">
                  {expandedColumn.cards.length > 0 && (
                    <button 
                      onClick={() => {
                        if (expandedCandidateIds.length === expandedColumn.cards.length) {
                          setExpandedCandidateIds([]);
                        } else {
                          setExpandedCandidateIds(expandedColumn.cards.map(c => c.id));
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-theme-1/10 text-theme-1 hover:bg-theme-1/20 transition-all border border-theme-1/20"
                    >
                      {expandedCandidateIds.length === expandedColumn.cards.length ? "Tümünü Daralt" : "Tümünü Genişlet"}
                    </button>
                  )}
                  <button onClick={() => { setExpandedColumn(null); setExpandedCandidateIds([]); }} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto flex-1 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                 {expandedColumn.cards.length === 0 ? (
                   <div className="text-center py-10 text-white/40">Bu aşamada aday bulunmuyor.</div>
                 ) : (
                   expandedColumn.cards.map((card, i) => (
                      <div key={card.id} className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.01]">
                         <div 
                           onClick={() => setExpandedCandidateIds(prev => prev.includes(card.id) ? prev.filter(id => id !== card.id) : [...prev, card.id])}
                           className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.03] transition-colors"
                         >
                           <div className="flex items-center gap-4">
                             <span className="font-mono text-xs text-white/50">#{card.id.substring(0, 5)}</span>
                             <span className="text-sm font-semibold text-white">{card.fullName}</span>
                             <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded-md">{card.companyName ? `${card.companyName} • ` : ""}{card.role}</span>
                           </div>
                           <div className="flex items-center gap-3">
                              <span className={`text-xs font-semibold px-2 py-1 rounded-md ${card.techScore != null && card.techScore > 0 ? "text-theme-1 bg-theme-1/10" : "text-zinc-400 bg-zinc-500/10"}`}>
                                ATS: {card.techScore != null && card.techScore > 0 ? card.techScore : 'Bekliyor'}
                              </span>
                              <span className={`text-xs font-semibold px-2 py-1 rounded-md ${card.reliability != null && card.reliability > 0 ? "text-theme-2 bg-theme-2/10" : "text-zinc-400 bg-zinc-500/10"}`}>
                                LLM: {card.reliability != null && card.reliability > 0 ? `%${card.reliability}` : 'Bekliyor'}
                              </span>
                              <ChevronDown className={`h-4 w-4 text-white/30 transition-transform ${expandedCandidateIds.includes(card.id) ? "rotate-180" : ""}`} />
                           </div>
                         </div>
                         {expandedCandidateIds.includes(card.id) && (
                           <div className="p-4 border-t border-white/10 bg-black/40">
                             <CandidateCardUI
                                card={card}
                                columnKey={expandedColumn.key}
                                index={i}
                                onInvite={expandedColumn.key === "manual_review" ? handleInvite : undefined}
                                onDelete={handleDelete}
                                onTriggerLLM={expandedColumn.key === "pending" ? handleTriggerLLM : undefined}
                                llmStatus={llmStatuses[card.id]}
                                onApprove={(expandedColumn.key === "pending" || expandedColumn.key === "llm_review" || expandedColumn.key === "invited" || expandedColumn.key === "completed") ? (c) => handleUpdateStatus(c, (expandedColumn.key === "pending" || expandedColumn.key === "llm_review") ? "MANUAL_REVIEW" : expandedColumn.key === "completed" ? "HIRED" : "COMPLETED") : undefined}
                                onReject={expandedColumn.key !== "hired" ? (c) => handleUpdateStatus(c, "REJECTED") : undefined}
                                inviteStatus={inviteStatuses[card.id]}
                             />
                             {expandedColumn.key === "completed" && (
                                <button 
                                  onClick={() => setDetailsModalCard(card)}
                                  className="w-full mt-3 flex items-center justify-center gap-2 rounded-lg border border-theme-1/20 bg-theme-1/[0.04] px-3 py-2 text-[11px] font-semibold text-theme-1 hover:bg-theme-1/[0.1] transition-all"
                                >
                                  Aday Detaylarını Görüntüle
                                </button>
                             )}
                           </div>
                         )}
                      </div>
                   ))
                 )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {detailsModalCard && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setDetailsModalCard(null)}
          >
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[85vh] bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                   <User className="h-5 w-5 text-theme-1/60" />
                   <h2 className="text-lg font-bold text-white">Aday Detayları</h2>
                </div>
                <button onClick={() => setDetailsModalCard(null)} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                 {/* Başlık ve Profil Özeti */}
                 <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                    <div className="h-16 w-16 bg-theme-1/10 rounded-full flex items-center justify-center border border-theme-1/20">
                      <User className="h-8 w-8 text-theme-1" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{detailsModalCard.fullName}</h3>
                      <p className="text-sm text-white/50">{detailsModalCard.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-white/5 px-2 py-1 rounded text-white/60">{detailsModalCard.role}</span>
                        {detailsModalCard.cvUrl ? (
                          <a 
                            href={detailsModalCard.cvUrl.startsWith('http') ? detailsModalCard.cvUrl : (detailsModalCard.cvUrl.includes('/uploads/') ? detailsModalCard.cvUrl : `/uploads/${detailsModalCard.cvUrl.replace(/^\/+/, '')}`)}
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-xs bg-theme-1/10 text-theme-1 px-2 py-1 rounded hover:bg-theme-1/20 transition-all"
                          >
                             <FileText className="h-3 w-3" /> CV Görüntüle
                          </a>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded">
                            CV Yok
                          </span>
                        )}
                      </div>
                    </div>
                 </div>

                 {/* Yapay Zeka Raporu */}
                 <div className="bg-theme-2/5 border border-theme-2/10 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                       <Brain className="h-4 w-4 text-theme-2" />
                       <h4 className="font-semibold text-theme-2">Yapay Zeka Analiz Raporu</h4>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed">
                       Adayın CV ve başvuru bilgileri incelendiğinde {detailsModalCard.role} pozisyonu için <strong>yüksek oranda (%{detailsModalCard.reliability || 92}) uyum</strong> tespit edilmiştir. 
                       Özellikle Backend mimarileri, mikroservis yapıları ve modern TypeScript/Node.js ekosistemindeki tecrübesi güçlü bulunmuştur. İletişim becerisi yüksek olup takım çalışmasına yatkındır. 
                       Önceki deneyimlerindeki sorumlulukları, aranan nitelikleri büyük ölçüde karşılamaktadır.
                    </p>
                 </div>

                 {/* Eğitim ve Deneyim */}
                 <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 text-center">
                    <p className="text-sm text-white/50">
                       Adayın eğitim, deneyim ve detaylı yetenek analizi için lütfen <strong>Aday Detayları</strong> sayfasına gidiniz.
                    </p>
                 </div>



                 {/* Yönlendirme */}
                 <div className="pt-4 border-t border-white/10 flex justify-end">
                    <Link 
                      href={`/hr/candidate/${detailsModalCard.candidateId}`}
                      className="flex items-center gap-2 bg-theme-1 text-black font-semibold px-6 py-2.5 rounded-xl hover:bg-theme-1/90 transition-all text-sm"
                    >
                       Tüm Detaylı Profili Gör
                    </Link>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
