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
  Trash2
} from "lucide-react";

type ColumnKey = "pending" | "manual_review" | "invited" | "completed";

interface CandidateCard {
  readonly id: string;
  readonly candidateId: string;
  readonly fullName: string;
  readonly email: string;
  readonly cvUrl: string;
  readonly role: string;
  readonly appliedAt: string;
  readonly techScore?: number;
  readonly reliability?: number;
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
}: {
  readonly card: CandidateCard;
  readonly columnKey: ColumnKey;
  readonly index: number;
  readonly onInvite?: (card: CandidateCard) => void;
  readonly inviteStatus?: "inviting" | "invited";
  readonly onDelete?: (card: CandidateCard) => void;
  readonly onApprove?: (card: CandidateCard) => void;
  readonly onReject?: (card: CandidateCard) => void;
}): React.JSX.Element {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
      className={`group rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.03] ${
        columnKey === "completed" ? "cursor-pointer" : ""
      }`}
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
          {card.role}
        </div>
      </div>

      {card.techScore != null && card.reliability != null && (
        <div className="mt-3 flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-blue-500/10 bg-blue-500/[0.06] px-2.5 py-1">
            <Brain className="h-3 w-3 text-blue-400" />
            <span className="text-[11px] font-medium text-blue-300">
              AI Skoru: {card.techScore}/100
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/10 bg-emerald-500/[0.06] px-2.5 py-1">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            <span className="text-[11px] font-medium text-emerald-300">
              Güven: %{card.reliability}
            </span>
          </div>
        </div>
      )}

      {/* CV Görüntüle Button */}
      {(columnKey === "manual_review" || columnKey === "pending") && (
        <div className="mt-3">
          {card.cvUrl ? (
            <a
              href={card.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-500/15 bg-blue-500/[0.06] px-3 py-2 text-[11px] font-semibold text-blue-400 hover:bg-blue-500/[0.1] transition-all"
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
      )}

      {columnKey === "manual_review" && onInvite && (
        <div className="mt-2">
          <AnimatePresence mode="wait">
            {inviteStatus === "invited" ? (
              <motion.div
                key="invited"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-2 rounded-lg border border-emerald-500/15 bg-emerald-500/[0.06] py-2 text-[11px] font-semibold text-emerald-400"
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
                      : "border border-emerald-500/15 bg-emerald-500/[0.06] text-emerald-400 hover:bg-emerald-500/[0.1]"
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
        {onApprove && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onApprove(card); }}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/15 bg-emerald-500/[0.06] py-2 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500/[0.1] transition-all"
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

  if (columnKey === "completed") {
    return (
      <Link href={`/hr/candidate/${card.candidateId}`} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

export default function PipelinePage(): React.JSX.Element {
  const [columns, setColumns] = useState<ColumnDef[]>([]);
  const [inviteStatuses, setInviteStatuses] = useState<Record<string, "inviting" | "invited">>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchPipeline = useCallback(async () => {
    try {
      const res = await fetch("/api/hr/pipeline");
      if (!res.ok) throw new Error("Veriler alınamadı.");
      const data = await res.json();
      
      const cols: ColumnDef[] = [
        {
          key: "pending",
          title: "Değerlendirme Bekleyen",
          icon: <AlertCircle className="h-4 w-4 text-zinc-400/60" />,
          accentBorder: "border-t-zinc-500/20",
          cards: data.pending || [],
        },
        {
          key: "manual_review",
          title: "Mülakat Daveti Bekleyen",
          icon: <Clock className="h-4 w-4 text-amber-400/60" />,
          accentBorder: "border-t-amber-500/20",
          cards: data.manual_review || [],
        },
        {
          key: "invited",
          title: "Davet Gönderildi",
          icon: <Send className="h-4 w-4 text-blue-400/60" />,
          accentBorder: "border-t-blue-500/20",
          cards: data.invited || [],
        },
        {
          key: "completed",
          title: "Mülakat Tamamlandı",
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-400/60" />,
          accentBorder: "border-t-emerald-500/20",
          cards: data.completed || [],
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

  const handleInvite = useCallback(async (card: CandidateCard) => {
    setInviteStatuses((prev) => ({ ...prev, [card.id]: "inviting" }));

    try {
      // Generate password
      const password = Math.random().toString(36).slice(-8).toUpperCase();
      const inviteUrl = `${window.location.origin}/interview?token=${card.id}`;

      // Trigger email
      const emailRes = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: card.email,
          candidateName: card.fullName,
          interviewLink: inviteUrl,
          interviewPassword: password
        })
      });

      if (!emailRes.ok) throw new Error("E-posta gönderilemedi.");

      // Change status to INVITED
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
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
        {columns.map((column) => (
          <div
            key={column.key}
            className={`flex flex-col rounded-2xl border border-white/[0.06] border-t-2 ${column.accentBorder} bg-white/[0.01]`}
          >
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-2.5">
                {column.icon}
                <span className="text-sm font-semibold text-white/60">
                  {column.title}
                </span>
              </div>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/[0.06] px-1.5 text-[10px] font-bold text-white/30">
                {column.cards.length}
              </span>
            </div>

            <div className="flex flex-col gap-2.5 px-3 pb-4">
              {column.cards.map((card, i) => (
                <CandidateCardUI
                  key={`${column.key}-${card.id}`}
                  card={card}
                  columnKey={column.key}
                  index={i}
                  onInvite={column.key === "manual_review" ? handleInvite : undefined}
                  onDelete={handleDelete}
                  onApprove={(column.key === "pending" || column.key === "invited") ? (c) => handleUpdateStatus(c, column.key === "pending" ? "MANUAL_REVIEW" : "COMPLETED") : undefined}
                  onReject={column.key !== "completed" ? (c) => handleUpdateStatus(c, "REJECTED") : undefined}
                  inviteStatus={inviteStatuses[card.id]}
                />
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
    </div>
  );
}
