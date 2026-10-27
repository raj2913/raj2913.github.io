"use client";

import { useReducedMotion } from "motion/react";
import { useSyncExternalStore } from "react";

const noop = () => () => {};

// useReducedMotion, but false until hydration is done, so server and client render the same markup.
export function useReducedMotionSafe() {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const reduce = useReducedMotion();
  return hydrated && !!reduce;
}
