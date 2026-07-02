"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  XCircle,
  Clock,
  CheckCircle2,
  Hash,
  BriefcaseBusiness,
  ShieldCheck,
  Brain,
  Send,
  Loader2,
  UserCheck,
} from "lucide-react";
import { sendInterviewInvitation } from "@/lib/email-service";

type ColumnKey = "rejected" | "pending" | "completed";
type CandidateStatus = "waiting" | "approving" | "approved";

interface CandidateCard {
  readonly id: number;
  readonly role: string;
  readonly appliedAt: string;
  readonly techScore?: number;
  readonly reliability?: number;
  readonly email?: string;
}

interface ColumnDef {
  readonly key: ColumnKey;
  readonly title: string;
  readonly icon: React.ReactNode;
  readonly accentBorder: string;
  readonly cards: readonly CandidateCard[];
}

const INITIAL_COLUMNS: readonly ColumnDef[] = [
  {
    key: "rejected",
    title: "CV Reddedildi",
    icon: <XCircle className="h-4 w-4 text-red-400/60" />,
    accentBorder: "border-t-red-500/20",
    cards: [
      { id: 48721, role: "Product Designer", appliedAt: "2 saat önce" },
      { id: 33109, role: "Frontend Engineer", appliedAt: "5 saat önce" },
    ],
  },
  {
    key: "pending",
    title: "Onay Bekleyen",
    icon: <Clock className="h-4 w-4 text-amber-400/60" />,
    accentBorder: "border-t-amber-500/20",
    cards: [
      { id: 10594, role: "Senior Backend", appliedAt: "1 saat önce", techScore: 8.5, reliability: 98, email: "aday10594@ornek.com" },
      { id: 82015, role: "DevOps / SRE", appliedAt: "3 saat önce", techScore: 7.8, reliability: 94, email: "aday82015@ornek.com" },
      { id: 67233, role: "Senior Frontend Engineer", appliedAt: "6 saat önce", techScore: 6.9, reliability: 91, email: "aday67233@ornek.com" },
    ],
  },
  {
    key: "completed",
    title: "Mülakatı Biten",
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-400/60" />,
    accentBorder: "border-t-emerald-500/20",
    cards: [
      { id: 10594, role: "Senior Backend", appliedAt: "30 dk önce", techScore: 8.5, reliability: 98 },
      { id: 55412, role: "Senior Frontend Engineer", appliedAt: "1 saat önce", techScore: 7.2, reliability: 95 },
    ],
  },
] as const;

function CandidateCardUI({
  card,
  columnKey,
  index,
  onApprove,
  approveStatus,
}: {
  readonly card: CandidateCard;
  readonly columnKey: ColumnKey;
  readonly index: number;
  readonly onApprove?: (id: number) => void;
  readonly approveStatus?: CandidateStatus;
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
      {/* Card header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash className="h-3.5 w-3.5 text-white/15" />
          <span className="font-mono text-sm font-semibold text-white/70">
            Aday #{card.id}
          </span>
        </div>
        <span className="text-[10px] text-white/20">{card.appliedAt}</span>
      </div>

      {/* Role */}
      <div className="mt-3 flex items-center gap-2">
        <BriefcaseBusiness className="h-3.5 w-3.5 text-white/15" />
        <span className="text-xs text-white/40">{card.role}</span>
      </div>

      {/* Score badges — for completed and pending with scores */}
      {card.techScore != null && card.reliability != null && (
        <div className="mt-3 flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-blue-500/10 bg-blue-500/[0.06] px-2.5 py-1">
            <Brain className="h-3 w-3 text-blue-400" />
            <span className="text-[11px] font-medium text-blue-300">
              AI Skoru: {card.techScore}/10
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/10 bg-emerald-500/[0.06] px-2.5 py-1">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            <span className="text-[11px] font-medium text-emerald-300">
              Güvenilirlik: %{card.reliability}
            </span>
          </div>
        </div>
      )}

      {/* Rejected reason */}
      {columnKey === "rejected" && (
        <div className="mt-3">
          <span className="rounded-md border border-red-500/10 bg-red-500/[0.04] px-2 py-0.5 text-[10px] text-red-400/50">
            Minimum yetkinlik eşiği karşılanmadı
          </span>
        </div>
      )}

      {/* ── Approve button — only for pending ── */}
      {columnKey === "pending" && onApprove && (
        <div className="mt-3">
          <AnimatePresence mode="wait">
            {approveStatus === "approved" ? (
              <motion.div
                key="approved"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-2 rounded-lg border border-emerald-500/15 bg-emerald-500/[0.06] py-2 text-[11px] font-semibold text-emerald-400"
              >
                <UserCheck className="h-3.5 w-3.5" />
                Onaylandı — Davet Gönderildi
              </motion.div>
            ) : (
              <motion.div key="approve-btn" exit={{ opacity: 0 }}>
                <button
                  type="button"
                  disabled={approveStatus === "approving"}
                  onClick={() => onApprove(card.id)}
                  className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-[11px] font-semibold transition-all duration-300 ${
                    approveStatus === "approving"
                      ? "cursor-not-allowed border border-white/[0.04] bg-white/[0.02] text-white/20"
                      : "border border-emerald-500/15 bg-emerald-500/[0.06] text-emerald-400 hover:bg-emerald-500/[0.1]"
                  }`}
                >
                  {approveStatus === "approving" ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Onaylanıyor...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Onayla ve Davet Gönder
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );

  if (columnKey === "completed") {
    return (
      <Link href={`/hr/candidate/${card.id}`} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

export default function PipelinePage(): React.JSX.Element {
  const [approveStatuses, setApproveStatuses] = useState<Record<number, CandidateStatus>>({});

  const handleApprove = useCallback((candidateId: number) => {
    setApproveStatuses((prev) => ({ ...prev, [candidateId]: "approving" }));

    // Find candidate data from pending column
    const pendingCol = INITIAL_COLUMNS.find((c) => c.key === "pending");
    const candidate = pendingCol?.cards.find((c) => c.id === candidateId);

    setTimeout(() => {
      // Trigger mock email
      if (candidate?.email) {
        const credentials = sendInterviewInvitation(
          candidateId,
          candidate.email,
          `Aday #${candidateId}`
        );

        // Store credentials in localStorage for demo
        const stored = JSON.parse(localStorage.getItem("agentichr_invitations") ?? "[]") as unknown[];
        stored.push(credentials);
        localStorage.setItem("agentichr_invitations", JSON.stringify(stored));
      }

      setApproveStatuses((prev) => ({ ...prev, [candidateId]: "approved" }));
    }, 1500);
  }, []);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-xl font-bold text-white">Aday Hunisi</h1>
        <p className="mt-1 text-sm text-white/30">
          Otonom işe alım hattının gerçek zamanlı görünümü.
        </p>
      </div>

      {/* ── Kanban columns ── */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {INITIAL_COLUMNS.map((column) => (
          <div
            key={column.key}
            className={`w-80 shrink-0 rounded-2xl border border-white/[0.06] border-t-2 ${column.accentBorder} bg-white/[0.01]`}
          >
            {/* Column header */}
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

            {/* Cards */}
            <div className="flex flex-col gap-2.5 px-3 pb-4">
              {column.cards.map((card, i) => (
                <CandidateCardUI
                  key={`${column.key}-${card.id}`}
                  card={card}
                  columnKey={column.key}
                  index={i}
                  onApprove={column.key === "pending" ? handleApprove : undefined}
                  approveStatus={approveStatuses[card.id]}
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
