"use client";

import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { useRef } from "react";

// Pulls its child a few pixels toward a fine pointer. Used on the primary actions only.
export function Magnetic({ children, strength = 0.25 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 300, damping: 22, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 300, damping: 22, mass: 0.4 });

  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span ref={ref} className="inline-block" style={{ x, y }} onPointerMove={onMove} onPointerLeave={reset}>
      {children}
    </motion.span>
  );
}
