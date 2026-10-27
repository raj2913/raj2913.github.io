"use client";

import { MotionConfig } from "motion/react";

// One place to make every Motion animation respect prefers-reduced-motion.
export function MotionRoot({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
