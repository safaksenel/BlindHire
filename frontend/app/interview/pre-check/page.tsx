"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mic, Video, CheckCircle2, AlertCircle, Loader2, Play, Volume2, VideoOff, MicOff } from "lucide-react";

type TestStatus = "idle" | "testing" | "passed" | "failed";

function PreCheckContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const interviewId = searchParams.get("id") || "test-id";

  const [camStatus, setCamStatus] = useState<TestStatus>("idle");
  const [micStatus, setMicStatus] = useState<TestStatus>("idle");
  const [camError, setCamError] = useState("");
  const [micError, setMicError] = useState("");
  const [micVolume, setMicVolume] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const testCamera = async () => {
    setCamStatus("testing");
    setCamError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.error("Video play error:", e));
      }

      if (!streamRef.current) streamRef.current = new MediaStream();
      stream.getTracks().forEach(t => streamRef.current?.addTrack(t));

      // Wait a bit for video feed to render, then check pixels
      setTimeout(() => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        
        if (ctx && video.videoWidth > 0) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          let isAllBlackOrWhite = true;
          // Simple variance check to ensure it's a real camera feed
          const firstR = data[0];
          const firstG = data[1];
          const firstB = data[2];
          
          for (let i = 0; i < data.length; i += 40) { // Sample every 10th pixel
            if (Math.abs(data[i] - firstR) > 10 || Math.abs(data[i+1] - firstG) > 10 || Math.abs(data[i+2] - firstB) > 10) {
              isAllBlackOrWhite = false;
              break;
            }
          }

          if (isAllBlackOrWhite) {
            setCamStatus("failed");
            setCamError("Kamera algılandı ancak görüntü alınamıyor (Siyah veya donmuş ekran). Lütfen kameranızı kontrol edin.");
          } else {
            setCamStatus("passed");
          }
        } else {
          setCamStatus("failed");
          setCamError("Kameradan veri akışı sağlanamadı.");
        }
      }, 2500);

    } catch (err) {
      setCamStatus("failed");
      setCamError("Kamera izni reddedildi veya bulunamadı.");
    }
  };

  const testMic = async () => {
    setMicStatus("testing");
    setMicError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!streamRef.current) streamRef.current = new MediaStream();
      stream.getTracks().forEach(t => streamRef.current?.addTrack(t));

      // Use modern AudioContext
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;

      microphone.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);

      let consecutiveLoudFrames = 0;

      scriptProcessor.onaudioprocess = () => {
        const array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        let values = 0;
        const length = array.length;
        for (let i = 0; i < length; i++) {
          values += (array[i]);
        }
        const average = values / length;
        setMicVolume(Math.round(average));

        // Wait for user to make a clear sound (volume > 20)
        if (average > 20) {
          consecutiveLoudFrames++;
          if (consecutiveLoudFrames > 8) { // Requires sustained sound for a moment
            setMicStatus("passed");
            scriptProcessor.disconnect();
            analyser.disconnect();
            microphone.disconnect();
            setMicVolume(100); // Visual lock
          }
        } else {
          // Reset if it was just a tiny blip
          consecutiveLoudFrames = Math.max(0, consecutiveLoudFrames - 1);
        }
      };
    } catch (err) {
      setMicStatus("failed");
      setMicError("Mikrofon izni reddedildi veya bulunamadı.");
    }
  };

  const handleProceed = () => {
    if (camStatus === "passed" && micStatus === "passed") {
      router.push(`/interview/${interviewId}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-theme-1/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-theme-1/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl grid md:grid-cols-2 gap-8 items-start">
        
        {/* Left Column: Info & Tests */}
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-theme-1 to-white bg-clip-text text-transparent">
              Donanım Kontrolü
            </h1>
            <p className="text-white/50 mt-3 text-lg leading-relaxed">
              Mülakata başlamadan önce kamera ve mikrofonunuzun sorunsuz çalıştığından emin olmalıyız. Lütfen aşağıdaki testleri tamamlayın.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Camera Test Card */}
            <div className={`p-5 rounded-2xl border transition-all duration-300 ${
              camStatus === "passed" ? "bg-theme-1/10 border-theme-1/30" :
              camStatus === "failed" ? "bg-red-500/10 border-red-500/30" :
              "bg-white/[0.03] border-white/10"
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                    camStatus === "passed" ? "bg-theme-1/20 text-theme-1" :
                    camStatus === "failed" ? "bg-red-500/20 text-red-400" :
                    "bg-white/5 text-white/50"
                  }`}>
                    {camStatus === "passed" ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white">Kamera Testi</h3>
                    <p className="text-sm text-white/40">Görüntü akışınız kontrol edilecek.</p>
                  </div>
                </div>
                {camStatus === "idle" && (
                  <button onClick={testCamera} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                    İzin Ver & Test Et
                  </button>
                )}
                {camStatus === "testing" && <Loader2 className="w-6 h-6 animate-spin text-theme-1" />}
                {camStatus === "passed" && <CheckCircle2 className="w-6 h-6 text-theme-1" />}
              </div>
              {camError && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{camError}</p>
                </div>
              )}
              {camStatus === "failed" && (
                <button onClick={testCamera} className="mt-4 w-full px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors">
                  Tekrar Dene
                </button>
              )}
            </div>

            {/* Mic Test Card */}
            <div className={`p-5 rounded-2xl border transition-all duration-300 ${
              micStatus === "passed" ? "bg-theme-1/10 border-theme-1/30" :
              micStatus === "failed" ? "bg-red-500/10 border-red-500/30" :
              "bg-white/[0.03] border-white/10"
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                    micStatus === "passed" ? "bg-theme-1/20 text-theme-1" :
                    micStatus === "failed" ? "bg-red-500/20 text-red-400" :
                    "bg-white/5 text-white/50"
                  }`}>
                    {micStatus === "passed" ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white">Mikrofon Testi</h3>
                    <p className="text-sm text-white/40">Lütfen mikrofona konuşarak ses verin.</p>
                  </div>
                </div>
                {micStatus === "idle" && (
                  <button onClick={testMic} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                    İzin Ver & Test Et
                  </button>
                )}
                {micStatus === "testing" && <Loader2 className="w-6 h-6 animate-spin text-theme-1" />}
                {micStatus === "passed" && <CheckCircle2 className="w-6 h-6 text-theme-1" />}
              </div>

              {(micStatus === "testing" || micStatus === "passed") && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs text-white/40">
                    <span>Ses Seviyesi (Lütfen Konuşun)</span>
                    <span>{micStatus === "passed" ? "Başarılı" : `${Math.min(100, Math.round((micVolume / 50) * 100))}%`}</span>
                  </div>
                  <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-100 ${micStatus === "passed" ? "bg-theme-1" : "bg-white"}`}
                      style={{ width: `${Math.min(100, (micVolume / 50) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {micError && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{micError}</p>
                </div>
              )}
              {micStatus === "failed" && (
                <button onClick={testMic} className="mt-4 w-full px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors">
                  Tekrar Dene
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Right Column: Visual Feedback & Proceed */}
        <div className="flex flex-col gap-6">
          <div className="relative aspect-video rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center group">
            {/* Real Video Element */}
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${camStatus === "passed" || camStatus === "testing" ? "opacity-100" : "opacity-0"}`} 
            />
            
            {camStatus !== "passed" && camStatus !== "testing" && (
              <div className="absolute flex flex-col items-center text-white/20">
                <VideoOff className="w-12 h-12 mb-2" />
                <span className="font-medium text-sm">Kamera Bekleniyor</span>
              </div>
            )}
            
            {/* Hidden canvas for pixel analysis */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Overlays */}
            {camStatus === "testing" && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                <div className="flex items-center gap-3 text-white">
                  <Loader2 className="w-5 h-5 animate-spin text-theme-1" />
                  <span className="font-medium">Kamera Sinyali Doğrulanıyor...</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleProceed}
            disabled={camStatus !== "passed" || micStatus !== "passed"}
            className="w-full flex items-center justify-center gap-3 bg-theme-1 hover:brightness-110 disabled:bg-white/10 disabled:text-white/30 text-black py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_40px_rgba(205,255,113,0.1)] disabled:shadow-none"
          >
            {camStatus === "passed" && micStatus === "passed" ? (
              <>
                <Play className="w-5 h-5 fill-current" />
                Mülakata Katıl
              </>
            ) : (
              "Testleri Tamamlayın"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-theme-1 animate-spin" />
      </div>
    }>
      <PreCheckContent />
    </Suspense>
  );
}
