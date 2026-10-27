"use client";

import { motion, type MotionValue } from "motion/react";

// A regulation half court, drawn top-down in feet × 10 (500 × 470), basket at the top.
const R = 237.5; // three-point radius
const RIM = { x: 250, y: 52.5 };
const ARC_Y = RIM.y + Math.sqrt(R * R - 220 * 220);

export const COURT_PATHS = [
  "M0 0H500V470H0Z", // boundary
  "M170 0V190H330V0", // paint
  "M190 0V190M310 0V190", // inner lane
  "M190 190a60 60 0 0 0 120 0", // free-throw circle (near half)
  "M190 190a60 60 0 0 1 120 0", // free-throw circle (far half)
  `M30 0V${ARC_Y}A${R} ${R} 0 0 0 470 ${ARC_Y}V0`, // three-point line
  "M210 52.5a40 40 0 0 0 80 0", // restricted area
  "M220 40H280", // backboard
  "M190 470a60 60 0 0 1 120 0", // center circle
] as const;

// Where the court becomes a system. Each node sits on a real court landmark.
export const CIRCUIT_NODES = [
  { x: 250, y: 470, label: "caller", sub: "audio in" },
  { x: 30, y: ARC_Y, label: "listen()", sub: "stt · vad" },
  { x: 170, y: 190, label: "classify()", sub: "intent + flags" },
  { x: 250, y: 250, label: "route()", sub: "state machine" },
  { x: 470, y: ARC_Y, label: "eval()", sub: "replay gate" },
  { x: 330, y: 190, label: "guard()", sub: "policy" },
  { x: 250, y: 52.5, label: "respond()", sub: "tts · stream" },
] as const;

const FLOW = "M250 470V250M250 250L170 190M170 190L30 " + ARC_Y + "M250 250L330 190M330 190L470 " + ARC_Y + "M330 190L250 52.5";

export function CourtLines({
  draw,
  circuit,
  stroke = "rgb(244 242 237 / 0.42)",
}: {
  draw: boolean;
  circuit?: MotionValue<number>;
  stroke?: string;
}) {
  return (
    <svg viewBox="-4 -4 508 478" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
      <g fill="none" stroke={stroke} strokeWidth={2.2} strokeLinecap="round">
        {COURT_PATHS.map((d, i) => (
          <motion.path
            key={d}
            d={d}
            initial={draw ? { pathLength: 0 } : false}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.15 + i * 0.06 }}
          />
        ))}
        <circle cx={RIM.x} cy={RIM.y} r={9} stroke="#ff5a1f" strokeWidth={3} />
      </g>

      {circuit && (
        <motion.g style={{ opacity: circuit }}>
          <path d={FLOW} fill="none" stroke="#ff5a1f" strokeWidth={2.4} strokeDasharray="6 10" className="[animation:flow_1.2s_linear_infinite]" />
          {CIRCUIT_NODES.map((n) => (
            <g key={n.label} transform={`translate(${n.x} ${n.y})`}>
              <circle r={11} fill="#08090a" stroke="#ff5a1f" strokeWidth={2.4} />
              <circle r={4} fill="#ff5a1f" />
              <text x={n.x > 400 ? -18 : 18} y={-4} textAnchor={n.x > 400 ? "end" : "start"} fill="#f4f2ed" fontSize={13} style={{ fontFamily: "var(--font-jetbrains)" }}>
                {n.label}
              </text>
              <text x={n.x > 400 ? -18 : 18} y={14} textAnchor={n.x > 400 ? "end" : "start"} fill="#9a9892" fontSize={9.5} style={{ fontFamily: "var(--font-jetbrains)", letterSpacing: "0.1em" }}>
                {n.sub.toUpperCase()}
              </text>
            </g>
          ))}
        </motion.g>
      )}
      <style>{`@keyframes flow { to { stroke-dashoffset: -32; } }`}</style>
    </svg>
  );
}
