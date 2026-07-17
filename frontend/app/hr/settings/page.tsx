"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Settings, Save, Loader2, AlertTriangle, ShieldCheck, UserX, UserPlus, FileSearch, Bot, BrainCircuit } from "lucide-react";

interface DualSliderProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  min: number;
  max: number;
  val1: number;
  val2: number;
  onChange: (v1: number, v2: number) => void;
  leftLabel: string;
  middleLabel: string;
  rightLabel: string;
  leftColor: string;
  middleColor: string;
  rightColor: string;
}

function DualRangeSlider({
  label, description, icon, min, max, val1, val2, onChange, leftLabel, middleLabel, rightLabel, leftColor, middleColor, rightColor
}: DualSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<"thumb1" | "thumb2" | null>(null);

  const getPercentage = (value: number) => ((value - min) / (max - min)) * 100;

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = x / rect.width;
    let newValue = Math.round(min + percent * (max - min));

    if (isDragging === "thumb1") {
      newValue = Math.min(newValue, val2 - 1);
      onChange(newValue, val2);
    } else {
      newValue = Math.max(newValue, val1 + 1);
      onChange(val1, newValue);
    }
  }, [isDragging, min, max, val1, val2, onChange]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const onMouseUp = () => setIsDragging(null);

    if (isDragging) {
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("touchmove", onTouchMove);
      document.addEventListener("mouseup", onMouseUp);
      document.addEventListener("touchend", onMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchend", onMouseUp);
    };
  }, [isDragging, handleMove]);

  const handleTrackClick = useCallback((e: React.MouseEvent, type: "left" | "right") => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = x / rect.width;
    let newValue = Math.round(min + percent * (max - min));

    if (type === "left") {
      newValue = Math.min(newValue, val2 - 1);
      onChange(newValue, val2);
    } else {
      newValue = Math.max(newValue, val1 + 1);
      onChange(val1, newValue);
    }
  }, [min, max, val1, val2, onChange]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-white text-lg">{label}</h3>
          <p className="text-sm text-white/40 mt-0.5">{description}</p>
        </div>
      </div>

      <div className="relative pt-8 pb-4">
        <div 
          ref={trackRef}
          className="h-3 bg-white/5 rounded-full relative w-full"
        >
          {/* Track segments */}
          <div 
            onClick={(e) => handleTrackClick(e, "left")} 
            className={`absolute top-0 left-0 h-full rounded-l-full cursor-pointer ${leftColor}`} 
            style={{ width: `${getPercentage(val1)}%` }} 
          />
          <div 
            className={`absolute top-0 h-full ${middleColor}`} 
            style={{ left: `${getPercentage(val1)}%`, width: `${getPercentage(val2) - getPercentage(val1)}%` }} 
          />
          <div 
            onClick={(e) => handleTrackClick(e, "right")} 
            className={`absolute top-0 right-0 h-full rounded-r-full cursor-pointer ${rightColor}`} 
            style={{ left: `${getPercentage(val2)}%`, width: `${100 - getPercentage(val2)}%` }} 
          />

          {/* Thumbs */}
          <div 
            className="absolute top-1/2 -mt-3 -ml-3 w-6 h-6 bg-white border-2 border-zinc-800 rounded-full cursor-grab active:cursor-grabbing shadow-lg hover:scale-110 transition-transform flex items-center justify-center text-[10px] font-bold text-black"
            style={{ left: `${getPercentage(val1)}%`, zIndex: isDragging === "thumb1" ? 20 : 10 }}
            onMouseDown={() => setIsDragging("thumb1")}
            onTouchStart={() => setIsDragging("thumb1")}
          >
            {val1}
          </div>
          <div 
            className="absolute top-1/2 -mt-3 -ml-3 w-6 h-6 bg-white border-2 border-zinc-800 rounded-full cursor-grab active:cursor-grabbing shadow-lg hover:scale-110 transition-transform flex items-center justify-center text-[10px] font-bold text-black"
            style={{ left: `${getPercentage(val2)}%`, zIndex: isDragging === "thumb2" ? 20 : 10 }}
            onMouseDown={() => setIsDragging("thumb2")}
            onTouchStart={() => setIsDragging("thumb2")}
          >
            {val2}
          </div>
        </div>

        {/* Labels below */}
        <div className="mt-4 grid grid-cols-3 text-center text-xs font-medium">
          <div className="flex flex-col items-center">
            <span className={`px-2 py-1 rounded-md ${leftColor.replace('bg-', 'text-').replace('/20', '')} bg-white/5 border border-white/5`}>{leftLabel}</span>
            <span className="text-white/30 mt-1">0 - {val1}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className={`px-2 py-1 rounded-md ${middleColor.replace('bg-', 'text-').replace('/20', '')} bg-white/5 border border-white/5`}>{middleLabel}</span>
            <span className="text-white/30 mt-1">{val1} - {val2}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className={`px-2 py-1 rounded-md ${rightColor.replace('bg-', 'text-').replace('/20', '')} bg-white/5 border border-white/5`}>{rightLabel}</span>
            <span className="text-white/30 mt-1">{val2} - 100</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HRSettingsPage(): React.JSX.Element {
  const [s1Reject, setS1Reject] = useState<number>(50);
  const [s1Proceed, setS1Proceed] = useState<number>(75);
  
  const [s2Reject, setS2Reject] = useState<number>(60);
  const [s2Invite, setS2Invite] = useState<number>(75);

  const [s3Reject, setS3Reject] = useState<number>(50);
  const [s3Proceed, setS3Proceed] = useState<number>(75);

  const [s4Reject, setS4Reject] = useState<number>(50);
  const [s4Hire, setS4Hire] = useState<number>(80);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/hr/settings", { cache: "no-store" });
        if (!res.ok) throw new Error("Ayarlar alınamadı.");
        const data = await res.json();
        const parseThresh = (val: any, defaultVal: number) => (val !== undefined && val !== null && !isNaN(parseInt(val))) ? parseInt(val) : defaultVal;
        
        setS1Reject(parseThresh(data.stage1AutoRejectThreshold, 50));
        setS1Proceed(parseThresh(data.stage1AutoProceedThreshold, 75));
        setS2Reject(parseThresh(data.stage2AutoRejectThreshold, 60));
        setS2Invite(parseThresh(data.stage2AutoInviteThreshold, 75));
        setS3Reject(parseThresh(data.stage3AutoRejectThreshold, 50));
        setS3Proceed(parseThresh(data.stage3AutoProceedThreshold, 75));
        setS4Reject(parseThresh(data.stage4AutoRejectThreshold, 50));
        setS4Hire(parseThresh(data.stage4AutoHireThreshold, 80));
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
          stage1AutoProceedThreshold: s1Proceed,
          stage1AutoRejectThreshold: s1Reject,
          stage2AutoInviteThreshold: s2Invite,
          stage2AutoRejectThreshold: s2Reject,
          stage3AutoProceedThreshold: s3Proceed,
          stage3AutoRejectThreshold: s3Reject,
          stage4AutoHireThreshold: s4Hire,
          stage4AutoRejectThreshold: s4Reject
        })
      });

      if (!res.ok) throw new Error("Ayarlar kaydedilemedi.");
      setMessage("Değerlendirme barajları başarıyla güncellendi.");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-theme-1" />
        <p className="text-sm text-white/50">Ayarlar yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl pb-10">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Settings className="w-7 h-7 text-theme-1" />
          Otomasyon Sınır Değerleri
        </h1>
        <p className="mt-2 text-white/50">
          Adayların "Algoritma" ve "Yapay Zeka" aşamalarında hangi puan aralıklarında otomatik reddedileceğini, İK havuzuna düşeceğini veya mülakata davet edileceğini yönetin.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {message && (
        <div className="flex items-center gap-3 rounded-xl border border-theme-1/20 bg-theme-1/10 p-4 text-sm text-theme-1">
          <ShieldCheck className="h-5 w-5 flex-shrink-0" />
          <p>{message}</p>
        </div>
      )}

      <div className="space-y-8">
        
        {/* Aşama 1 Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-black/40 p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Bot className="w-32 h-32" />
          </div>
          <DualRangeSlider 
            label="Aşama 1: Yerel ATS Algoritması (Kelime / Deneyim Eşleşmesi)"
            description="Adayların CV'si sistemde tarandığında alınacak aksiyonları belirler."
            icon={<Bot className="w-6 h-6 text-blue-400" />}
            min={0}
            max={100}
            val1={s1Reject}
            val2={s1Proceed}
            onChange={(v1, v2) => { setS1Reject(v1); setS1Proceed(v2); }}
            leftLabel="Otomatik Ret"
            middleLabel="İK İncelemesi"
            rightLabel="LLM'e Gönder"
            leftColor="bg-red-500"
            middleColor="bg-yellow-500"
            rightColor="bg-blue-500"
          />
        </div>

        {/* Aşama 2 Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-black/40 p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <BrainCircuit className="w-32 h-32" />
          </div>
          <DualRangeSlider 
            label="Aşama 2: Groq Yapay Zeka (Derinlemesine Analiz)"
            description="Algoritmayı geçen adayların LLM tarafından analiz edildikten sonraki aksiyonları."
            icon={<BrainCircuit className="w-6 h-6 text-theme-1" />}
            min={0}
            max={100}
            val1={s2Reject}
            val2={s2Invite}
            onChange={(v1, v2) => { setS2Reject(v1); setS2Invite(v2); }}
            leftLabel="Otomatik Ret"
            middleLabel="İK İncelemesi"
            rightLabel="Mülakat Daveti"
            leftColor="bg-red-500"
            middleColor="bg-yellow-500"
            rightColor="bg-theme-1"
          />
        </div>

        {/* Aşama 3 Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-black/40 p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Bot className="w-32 h-32" />
          </div>
          <DualRangeSlider 
            label="Aşama 3: Mülakat Değerlendirmesi"
            description="Adayın mülakat performansına göre bir sonraki aşamaya geçişini veya reddini belirler."
            icon={<ShieldCheck className="w-6 h-6 text-orange-400" />}
            min={0}
            max={100}
            val1={s3Reject}
            val2={s3Proceed}
            onChange={(v1, v2) => { setS3Reject(v1); setS3Proceed(v2); }}
            leftLabel="Otomatik Ret"
            middleLabel="İK İncelemesi"
            rightLabel="Genel Değerlendirmeye Al"
            leftColor="bg-red-500"
            middleColor="bg-yellow-500"
            rightColor="bg-orange-500"
          />
        </div>

        {/* Aşama 4 Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-black/40 p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <ShieldCheck className="w-32 h-32" />
          </div>
          <DualRangeSlider 
            label="Aşama 4: Genel Puan Onayı / İşe Alım"
            description="Tüm süreç boyunca alınan puanların ortalamasına göre nihai olarak işe alınıp alınmayacağını belirler."
            icon={<ShieldCheck className="w-6 h-6 text-green-400" />}
            min={0}
            max={100}
            val1={s4Reject}
            val2={s4Hire}
            onChange={(v1, v2) => { setS4Reject(v1); setS4Hire(v2); }}
            leftLabel="Otomatik Ret"
            middleLabel="İK İncelemesi"
            rightLabel="İşe Alındı / Onay"
            leftColor="bg-red-500"
            middleColor="bg-yellow-500"
            rightColor="bg-green-500"
          />
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-theme-1 hover:brightness-110 text-black px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Ayarları Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
