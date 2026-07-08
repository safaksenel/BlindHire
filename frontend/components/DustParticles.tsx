"use client";

import { useEffect, useRef } from "react";
import { usePalette } from './PaletteContext';

interface Particle {
  nx: number;       // 0..1 normalised x
  ny: number;       // 0..1 normalised y
  radius: number;   // fixed pixel radius
  color: string;
  vx: number;
  vy: number;
  alpha: number;
  alphaChange: number;
  maxAlpha: number;
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
}

// Target density: 1 particle per this many px² of screen area
const DENSITY = 20000;
const MAX_PARTICLES = 80;

function makeParticle(colors: string[]): Particle {
  return {
    nx: Math.random(),
    ny: Math.random(),
    radius: Math.random() * 30 + 17,
    color: colors[Math.floor(Math.random() * colors.length)],
    vx: (Math.random() - 0.5) * 0.00012,
    vy: (Math.random() - 0.5) * 0.00012,
    alpha: Math.random() * 0.5,
    alphaChange: (Math.random() * 0.003) + 0.001,
    maxAlpha: Math.random() * 0.6 + 0.2,
  };
}

function targetCount(w: number, h: number) {
  return Math.min(Math.floor((w * h) / DENSITY), MAX_PARTICLES);
}

export function DustParticles() {
  const { activePalette, particlesEnabled } = usePalette();
  const COLORS = activePalette.colors;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!particlesEnabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    // Pre-compute rgb values
    const rgbMap = new Map<string, string>();
    COLORS.forEach(c => rgbMap.set(c, hexToRgb(c)));

    // Init particles
    let particles: Particle[] = [];
    const count = targetCount(w, h);
    for (let i = 0; i < count; i++) {
      particles.push(makeParticle(COLORS));
    }

    // Resize: instant, proportional, adjusts count
    const resize = () => {
      const newW = window.innerWidth;
      const newH = window.innerHeight;
      canvas.width = newW;
      canvas.height = newH;
      w = newW;
      h = newH;

      // Adjust particle count to match new density
      const needed = targetCount(w, h);
      if (particles.length < needed) {
        for (let i = particles.length; i < needed; i++) {
          particles.push(makeParticle(COLORS));
        }
      } else if (particles.length > needed) {
        particles.length = needed;
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move in normalised space
        p.nx += p.vx;
        p.ny += p.vy;

        if (p.nx < -0.03) p.nx = 1.03;
        else if (p.nx > 1.03) p.nx = -0.03;
        if (p.ny < -0.03) p.ny = 1.03;
        else if (p.ny > 1.03) p.ny = -0.03;

        p.alpha += p.alphaChange;
        if (p.alpha >= p.maxAlpha || p.alpha <= 0.01) {
          p.alphaChange = -p.alphaChange;
        }

        // Convert to pixel space
        const px = p.nx * w;
        const py = p.ny * h;
        const alpha = Math.max(0, p.alpha);

        const rgb = rgbMap.get(p.color) || '255,255,255';

        const gradient = ctx.createRadialGradient(px, py, 0, px, py, p.radius);
        gradient.addColorStop(0, `rgba(${rgb}, ${alpha * 1.5})`);
        gradient.addColorStop(0.2, `rgba(${rgb}, ${alpha * 0.8})`);
        gradient.addColorStop(1, `rgba(${rgb}, 0)`);

        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [COLORS, particlesEnabled]);

  if (!particlesEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-40 pointer-events-none opacity-80 mix-blend-screen"
    />
  );
}
