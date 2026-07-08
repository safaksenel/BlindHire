"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Loader2, AlertTriangle, ShieldCheck, UserX, UserPlus, FileSearch } from "lucide-react";

export default function HRSettingsPage(): React.JSX.Element {
  const [autoInvite, setAutoInvite] = useState<number>(80);
  const [manualReview, setManualReview] = useState<number>(60);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/hr/settings");
        if (!res.ok) throw new Error("Ayarlar alınamadı.");
        const data = await res.json();
        setAutoInvite(data.autoInviteThreshold || 80);
        setManualReview(data.manualReviewThreshold || 60);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    }
    void fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/hr/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          autoInviteThreshold: autoInvite,
          manualReviewThreshold: manualReview,
          autoRejectThreshold: manualReview - 1
        })
      });

      if (!res.ok) throw new Error("Ayarlar kaydedilemedi.");
      setMessage("Ayarlar başarıyla güncellendi.");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="text-sm text-white/50">Ayarlar yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-400" />
          Otomasyon Ayarları
        </h1>
        <p className="mt-1 text-sm text-white/40">
          AI CV değerlendirme süreçlerinizin sınır değerlerini (threshold) yönetin.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertTriangle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      {message && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          <ShieldCheck className="h-5 w-5" />
          <p>{message}</p>
        </div>
      )}

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] overflow-hidden">
        <div className="p-6 md:p-8 space-y-10">
          
          {/* Auto Invite */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Otomatik Mülakat Daveti</h3>
                  <p className="text-xs text-white/40 mt-0.5">CV puanı bu değerin üzerinde olanlar otomatik davet edilir.</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-emerald-400">{autoInvite}</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={autoInvite}
              onChange={(e) => {
                const val = Number(e.target.value);
                setAutoInvite(val <= manualReview ? manualReview + 1 : val);
              }}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-white/30 font-mono">
              <span>1</span>
              <span>100</span>
            </div>
          </div>

          {/* Manual Review */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                  <FileSearch className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Manuel İnceleme</h3>
                  <p className="text-xs text-white/40 mt-0.5">CV puanı bu değer ile Otomatik Davet puanı arasındaysa İnsan Onayı (HR) gerekir.</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-yellow-400">{manualReview}</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={manualReview}
              onChange={(e) => {
                const val = Number(e.target.value);
                setManualReview(val >= autoInvite ? autoInvite - 1 : val);
              }}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-500"
            />
            <div className="flex justify-between text-xs text-white/30 font-mono">
              <span>1</span>
              <span>100</span>
            </div>
          </div>

          {/* Auto Reject */}
          <div className="pt-6 border-t border-white/[0.06]">
            <div className="flex items-center justify-between opacity-70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <UserX className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Otomatik Red ve Silme</h3>
                  <p className="text-xs text-red-400/80 mt-1 max-w-sm">Bu değerin altındaki adaylar ( &lt; {manualReview} ) doğrudan reddedilir ve sistemden silinir.</p>
                </div>
              </div>
              <span className="text-xl font-bold text-red-400">&lt; {manualReview}</span>
            </div>
          </div>

        </div>
        
        <div className="p-6 bg-white/[0.02] border-t border-white/[0.06] flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Ayarları Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
