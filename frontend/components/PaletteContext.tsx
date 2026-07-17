"use client";
import { createContext, useContext, useState, useEffect } from "react";

import { PALETTES, Palette, PaletteCategory } from "@/lib/theme";

export { PALETTES };
export type { Palette, PaletteCategory };

export type ColorblindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

type PaletteContextType = {
  activePalette: Palette;
  setPalette: (id: number) => void;
  bloomEnabled: boolean;
  setBloomEnabled: (val: boolean) => void;
  particlesEnabled: boolean;
  setParticlesEnabled: (val: boolean) => void;
  colorblindMode: ColorblindMode;
  setColorblindMode: (val: ColorblindMode) => void;
  resetToDefaults: () => void;
};

const PaletteContext = createContext<PaletteContextType | null>(null);

export function PaletteProvider({ children }: { readonly children: React.ReactNode }) {
  const [activePalette, setActivePalette] = useState<Palette>(PALETTES.find(p => p.id === 11)!);
  const [bloomEnabled, setBloomEnabled] = useState(true);
  const [particlesEnabled, setParticlesEnabled] = useState(true);
  const [colorblindMode, setColorblindMode] = useState<ColorblindMode>('none');

  useEffect(() => {
    const savedPalette = localStorage.getItem("BlindHire_palette_id");
    if (savedPalette) {
      const found = PALETTES.find(p => p.id === parseInt(savedPalette));
      if (found) setActivePalette(found);
    } else {
      const defaultPalette = PALETTES.find(p => p.id === 11)!;
      setActivePalette(defaultPalette);
    }
    const savedBloomEnabled = localStorage.getItem("BlindHire_bloom_enabled");
    if (savedBloomEnabled !== null) setBloomEnabled(savedBloomEnabled === 'true');
    
    const savedParticlesEnabled = localStorage.getItem("BlindHire_particles_enabled");
    if (savedParticlesEnabled !== null) setParticlesEnabled(savedParticlesEnabled === 'true');

    const savedCbMode = localStorage.getItem("BlindHire_colorblind_mode");
    if (savedCbMode) setColorblindMode(savedCbMode as ColorblindMode);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--theme-c1", activePalette.colors[0]);
    root.style.setProperty("--theme-c2", activePalette.colors[1]);
    root.style.setProperty("--theme-c3", activePalette.colors[2]);
    root.style.setProperty("--theme-c4", activePalette.colors[3]);
    root.style.setProperty("--theme-c5", activePalette.colors[4]);
  }, [activePalette]);

  useEffect(() => {
    const root = document.documentElement;
    if (colorblindMode === 'none') {
      root.style.filter = '';
    } else {
      root.style.filter = `url(#${colorblindMode})`;
    }
  }, [colorblindMode]);

  const handleSetPalette = (id: number) => {
    const found = PALETTES.find(p => p.id === id);
    if (found) {
      setActivePalette(found);
      localStorage.setItem("BlindHire_palette_id", id.toString());
      
      // Attempt to save to database silently
      fetch('/api/user/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: id.toString() })
      }).catch(err => console.error("Theme save error", err));
    }
  };

  const handleSetBloomEnabled = (val: boolean) => {
    setBloomEnabled(val);
    localStorage.setItem("BlindHire_bloom_enabled", val.toString());
  };

  const handleSetParticlesEnabled = (val: boolean) => {
    setParticlesEnabled(val);
    localStorage.setItem("BlindHire_particles_enabled", val.toString());
  };

  const handleSetColorblindMode = (val: ColorblindMode) => {
    setColorblindMode(val);
    localStorage.setItem("BlindHire_colorblind_mode", val);
  };

  const resetToDefaults = () => {
    const defaultPalette = PALETTES.find(p => p.id === 11)!;
    setActivePalette(defaultPalette);
    setBloomEnabled(true);
    setParticlesEnabled(true);
    setColorblindMode('none');

    localStorage.removeItem("BlindHire_palette_id");
    localStorage.removeItem("BlindHire_bloom_enabled");
    localStorage.removeItem("BlindHire_particles_enabled");
    localStorage.removeItem("BlindHire_colorblind_mode");
  };

  return (
    <PaletteContext.Provider value={{ 
      activePalette, 
      setPalette: handleSetPalette,
      bloomEnabled,
      setBloomEnabled: handleSetBloomEnabled,
      particlesEnabled,
      setParticlesEnabled: handleSetParticlesEnabled,
      colorblindMode,
      setColorblindMode: handleSetColorblindMode,
      resetToDefaults
    }}>
      {children}
    </PaletteContext.Provider>
  );
}

export function usePalette() {
  const ctx = useContext(PaletteContext);
  if (!ctx) throw new Error("usePalette must be used within PaletteProvider");
  return ctx;
}
