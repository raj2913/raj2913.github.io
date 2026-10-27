"use client";

import { motion } from "motion/react";

export const EASE = [0.16, 1, 0.3, 1] as const;

// A line of type that rises out of a mask, the way a title card cuts in.
// The mask (not the clipped line inside it) is what gets observed, so the trigger always fires.
export function MaskLine({
  children,
  delay = 0,
  className = "",
  inView = true,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  inView?: boolean;
}) {
  const trigger = inView
    ? { whileInView: "show", viewport: { once: true, margin: "0px 0px -8% 0px" } }
    : { animate: "show" };
  return (
    <motion.span className={`block overflow-hidden pb-[0.06em] -mb-[0.06em] ${className}`} initial="hidden" {...trigger}>
      <motion.span
        className="block will-change-transform"
        variants={{ hidden: { y: "110%" }, show: { y: "0%" } }}
        transition={{ duration: 0.9, ease: EASE, delay }}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}

// Fades and lifts content once it scrolls into view.
export function FadeUp({
  children,
  delay = 0,
  className = "",
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "p" | "article";
}) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      {children}
    </Tag>
  );
}
