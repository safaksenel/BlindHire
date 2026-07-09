"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings2, Check, Palette as PaletteIcon, Sparkles, RefreshCw } from "lucide-react";
import { usePalette, PALETTES, ColorblindMode } from "./PaletteContext";
import { useToast } from "./ToastContext";

export function PaletteSwitcher() {
  const { 
    activePalette, setPalette, 
    bloomEnabled, setBloomEnabled,
    particlesEnabled, setParticlesEnabled,
    colorblindMode, setColorblindMode,
    resetToDefaults
  } = usePalette();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'themes' | 'effects'>('themes');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { addToast } = useToast();

  const handleReset = () => {
    resetToDefaults();
    addToast("Görünüm ayarları sıfırlandı.", "info");
  };

  return (
    <>
      <div className="relative pointer-events-auto z-50" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] text-white/70 transition-all hover:bg-white/[0.06] hover:text-white"
        title="Görünüm Ayarları"
      >
        <Settings2 className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-[360px] max-h-[80vh] flex flex-col rounded-2xl border border-white/[0.1] bg-black/90 p-4 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)]"
          >
            {/* Header / Reset Button */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-white/40 font-medium px-1">Görünüm Ayarları</span>
              <button 
                onClick={handleReset}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                title="Fabrika Ayarlarına Dön"
              >
                <RefreshCw className="w-3 h-3" />
                Sıfırla
              </button>
            </div>

            {/* Tabs */}
            <div className="flex bg-white/[0.05] p-1 rounded-xl mb-4 shrink-0">
              <button 
                onClick={() => setActiveTab('themes')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-colors ${activeTab === 'themes' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
              >
                <PaletteIcon className="w-4 h-4" /> Temalar
              </button>
              <button 
                onClick={() => setActiveTab('effects')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-colors ${activeTab === 'effects' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
              >
                <Sparkles className="w-4 h-4" /> Efektler
              </button>
            </div>
            
            <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
              {activeTab === 'themes' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {PALETTES.map((p) => {
                      const isActive = activePalette.id === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setPalette(p.id)}
                          className={"group relative flex items-center justify-between overflow-hidden rounded-xl border p-2 transition-all " + (
                            isActive 
                              ? "border-[var(--theme-c1)] bg-white/[0.06]" 
                              : "border-white/[0.05] bg-white/[0.01] hover:border-white/[0.1] hover:bg-white/[0.04]"
                          )}
                        >
                          <div className="flex w-full flex-col items-start gap-1.5">
                            <span className={"text-[10px] font-medium " + (isActive ? "text-white" : "text-white/60")}>{p.name}</span>
                            <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full opacity-80 transition-opacity group-hover:opacity-100 border border-white/10">
                              {p.colors.map((c, i) => (
                                <div key={i} className="h-full flex-1" style={{ backgroundColor: c }} />
                              ))}
                            </div>
                          </div>
                          {isActive && (
                            <Check className="absolute right-2 top-2 h-3.5 w-3.5" style={{ color: "var(--theme-c1)" }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'effects' && (
                <div className="space-y-6 pb-2">
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-white px-1">Görsel Efektler</h4>
                    
                    {/* Bloom Toggle */}
                    <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.05] p-3 rounded-xl">
                      <div>
                        <p className="text-sm text-white font-medium">Ortam Işığı (Bloom)</p>
                        <p className="text-xs text-white/40">Arka plandaki dev ışık dalgaları</p>
                      </div>
                      <button 
                        onClick={() => setBloomEnabled(!bloomEnabled)}
                        className={`w-10 h-6 rounded-full p-1 transition-colors ${bloomEnabled ? 'bg-theme-1' : 'bg-white/10'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${bloomEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Particles Toggle */}
                    <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.05] p-3 rounded-xl">
                      <div>
                        <p className="text-sm text-white font-medium">Hareketli Parçacıklar</p>
                        <p className="text-xs text-white/40">Ekranda süzülen ortam tozları</p>
                      </div>
                      <button 
                        onClick={() => setParticlesEnabled(!particlesEnabled)}
                        className={`w-10 h-6 rounded-full p-1 transition-colors ${particlesEnabled ? 'bg-theme-1' : 'bg-white/10'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${particlesEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>

                  </div>

                  <div className="w-full h-px bg-white/10 my-4" />

                  <div className="space-y-3 px-1">
                    <h4 className="text-sm font-semibold text-white">Erişilebilirlik</h4>
                    
                    <div className="space-y-2">
                      <label className="text-xs text-white/70">Renk Körü Modu</label>
                      <select 
                        value={colorblindMode}
                        onChange={(e) => setColorblindMode(e.target.value as ColorblindMode)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-theme-1/50"
                      >
                        <option value="none">Kapalı (Normal Görüş)</option>
                        <option value="protanopia">Protanopia (Kırmızı Renk Körlüğü)</option>
                        <option value="deuteranopia">Deuteranopia (Yeşil Renk Körlüğü)</option>
                        <option value="tritanopia">Tritanopia (Mavi Renk Körlüğü)</option>
                      </select>
                    </div>
                  </div>

                </div>
              )}
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}} />
    </div>
    </>
  );
}
