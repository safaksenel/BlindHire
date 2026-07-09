"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { usePalette } from './PaletteContext';

export function BackgroundBloom() {
  const pathname = usePathname();
  const { bloomEnabled } = usePalette();
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const update = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (!bloomEnabled || dims.w === 0) return null;

  const { w, h } = dims;

  // Fixed sizes, positions computed from current window
  const blobs = [
    { x: w * 0.05,  y: h * 0.05,  size: 350, color: 'var(--theme-c1)', opacity: 0.40, blur: 160, anim: 'animate-bloom-drift-1' },
    { x: w * 0.80,  y: h * 0.15,  size: 300, color: 'var(--theme-c2)', opacity: 0.35, blur: 160, anim: 'animate-bloom-drift-2' },
    { x: w * 0.85,  y: h * 0.55,  size: 320, color: 'var(--theme-c3)', opacity: 0.35, blur: 170, anim: 'animate-bloom-drift-3' },
    { x: w * 0.15,  y: h * 0.80,  size: 350, color: 'var(--theme-c4)', opacity: 0.40, blur: 160, anim: 'animate-bloom-drift-4' },
    { x: w * 0.50,  y: h * 0.45,  size: 400, color: 'var(--theme-c5)', opacity: 0.45, blur: 170, anim: 'animate-bloom-drift-5' },
  ];

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none opacity-90">
      {blobs.map((b, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${b.anim}`}
          style={{
            left: b.x - b.size / 2,
            top: b.y - b.size / 2,
            width: b.size,
            height: b.size,
            background: `radial-gradient(circle, ${b.color} 0%, transparent 70%)`,
            opacity: b.opacity,
            filter: `blur(${b.blur}px)`,
          }}
        />
      ))}
    </div>
  );
}
