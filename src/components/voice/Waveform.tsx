"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import type { Phase } from "@/lib/useVoiceSession";

const COLORS: Record<Phase, string> = {
  idle: "rgb(244 242 237 / 0.35)",
  listening: "#7cc8ff",
  processing: "rgb(244 242 237 / 0.6)",
  responding: "#ff5a1f",
  interrupted: "#f4f2ed",
  ended: "rgb(244 242 237 / 0.25)",
};

// Mirrored bar spectrum. It reads phase and level from refs, so it never re-renders React.
// With reduced motion it draws one still frame per phase instead of animating.
export function Waveform({
  phase,
  level,
  readMic,
  bars = 96,
  className = "",
}: {
  phase: Phase;
  level: React.RefObject<number>;
  readMic?: () => number | null;
  bars?: number;
  className?: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef(phase);
  const reduce = useReducedMotion();
  const stillKey = reduce ? phase : null;

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    let raf = 0;
    let visible = true;
    const heights = new Float32Array(bars);
    let t = 0;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      el.width = el.clientWidth * dpr;
      el.height = el.clientHeight * dpr;
      if (reduce) frame();
    };

    function frame() {
      raf = 0;
      if (!el || !ctx) return;
      const p = phaseRef.current;
      t += 1 / 60;
      const mic = readMic?.() ?? null;
      if (mic !== null && p === "listening") level.current = Math.max(level.current, mic);
      level.current *= 0.93;
      const lvl = reduce && (p === "responding" || p === "listening") ? 0.6 : level.current;

      const W = el.width;
      const H = el.height;
      const gap = W / bars;
      const bw = Math.max(1.5, gap * 0.48);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = COLORS[p];

      for (let i = 0; i < bars; i++) {
        const x = i / (bars - 1);
        const envelope = Math.sin(x * Math.PI) ** 1.4;
        let target: number;
        if (p === "responding" || p === "listening") {
          const base = p === "listening" ? 0.08 : 0.16;
          const speech = (0.5 + 0.5 * Math.sin(i * 0.9 + t * 9) * Math.cos(i * 0.31 - t * 5)) * lvl;
          target = (base + speech * 0.95) * envelope;
        } else if (p === "processing") {
          const head = ((t * 0.9) % 1.4) - 0.2;
          target = 0.03 + 0.28 * Math.exp(-(((x - (reduce ? 0.5 : head)) / 0.06) ** 2));
        } else if (p === "interrupted") {
          target = 0.6 * envelope * (i % 3 === 0 ? 1 : 0.4);
        } else {
          target = (0.025 + 0.03 * Math.sin(i * 0.5 + t * 1.6)) * envelope + 0.01;
        }
        heights[i] += (target - heights[i]) * (reduce ? 1 : 0.22);
        const h = Math.max(2, heights[i] * H * 0.92);
        ctx.globalAlpha = 0.35 + 0.65 * envelope;
        ctx.beginPath();
        ctx.roundRect(i * gap + (gap - bw) / 2, (H - h) / 2, bw, h, bw / 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (visible && !reduce) raf = requestAnimationFrame(frame);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf && !reduce) raf = requestAnimationFrame(frame);
    });
    io.observe(el);
    if (!reduce) raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [bars, level, readMic, reduce, stillKey]);

  return <canvas ref={canvas} className={`block h-full w-full ${className}`} aria-hidden />;
}
