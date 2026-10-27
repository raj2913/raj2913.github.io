"use client";

import { motion } from "motion/react";
import { useId, useState } from "react";
import type { Project, PlayEdge, PlayNode } from "@/content/projects";
import { EASE } from "@/components/motion/Reveal";

const ACCENT = { orange: "#ff5a1f", signal: "#7cc8ff", paper: "#f4f2ed" } as const;

function shorten(a: PlayNode, b: PlayNode, startGap: number, endGap: number) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return { x1: a.x + ux * startGap, y1: a.y + uy * startGap, x2: b.x - ux * endGap, y2: b.y - uy * endGap, ux, uy, len };
}

// Playbook notation: pass = dashed, drive = zig-zag dribble, screen = line ending in a bar, shot = solid arrow.
function edgePath(e: PlayEdge, a: PlayNode, b: PlayNode) {
  const s = shorten(a, b, 17, b.kind === "basket" ? 20 : 19);
  if (e.kind === "drive") {
    const n = Math.max(4, Math.floor((s.len - 36) / 12));
    const px = -s.uy * 5;
    const py = s.ux * 5;
    let d = `M${s.x1} ${s.y1}`;
    for (let i = 1; i < n; i++) {
      const t = i / n;
      const sign = i % 2 ? 1 : -1;
      d += ` L${s.x1 + (s.x2 - s.x1) * t + px * sign} ${s.y1 + (s.y2 - s.y1) * t + py * sign}`;
    }
    return d + ` L${s.x2} ${s.y2}`;
  }
  return `M${s.x1} ${s.y1} L${s.x2} ${s.y2}`;
}

function edgeEnd(e: PlayEdge, a: PlayNode, b: PlayNode) {
  const s = shorten(a, b, 17, b.kind === "basket" ? 20 : 19);
  if (e.kind === "screen") {
    const px = -s.uy * 8;
    const py = s.ux * 8;
    return `M${s.x2 - px} ${s.y2 - py} L${s.x2 + px} ${s.y2 + py}`;
  }
  const bx = s.x2 - s.ux * 9;
  const by = s.y2 - s.uy * 9;
  return `M${bx - s.uy * 5} ${by + s.ux * 5} L${s.x2} ${s.y2} L${bx + s.uy * 5} ${by - s.ux * 5}`;
}

export function PlayDiagram({ project, compact = false }: { project: Project; compact?: boolean }) {
  const { nodes, edges } = project.diagram;
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const [active, setActive] = useState(nodes[0].id);
  const accent = ACCENT[project.accent];
  const descId = useId();
  const current = byId[active];

  return (
    <div className="relative overflow-hidden rounded-sm border border-line bg-[#0c0d0f]">
      <div className="label flex items-center justify-between border-b border-line px-4 py-3 text-[0.6rem] text-muted">
        <span>
          Play {project.number} · <span style={{ color: accent }}>{project.call}</span>
        </span>
        <span className="hidden sm:inline">O handles · X checks · ◎ scores</span>
      </div>
      <svg viewBox="0 0 400 300" className="block w-full select-none" role="group" aria-label={`${project.title} architecture as a play diagram`} aria-describedby={descId}>
        <defs>
          <pattern id={`chalk-${project.slug}`} width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill="#0c0d0f" />
            <circle cx="1" cy="1" r="0.35" fill="rgb(244 242 237 / 0.05)" />
          </pattern>
        </defs>
        <rect width="400" height="300" fill={`url(#chalk-${project.slug})`} />
        <g fill="none" stroke="rgb(244 242 237 / 0.08)" strokeWidth="1.2">
          <path d="M140 0V130H260V0" />
          <path d="M140 130a60 60 0 0 0 120 0" />
          <path d="M24 0V60A176 176 0 0 0 376 60V0" />
          <path d="M150 300a50 50 0 0 1 100 0" />
        </g>

        {edges.map((e, i) => {
          const a = byId[e.from];
          const b = byId[e.to];
          const hot = e.from === active || e.to === active;
          const color = e.kind === "shot" ? accent : hot ? "#f4f2ed" : "rgb(244 242 237 / 0.5)";
          return (
            <g key={`${e.from}-${e.to}`} stroke={color} fill="none" strokeWidth={e.kind === "shot" ? 2.4 : 1.8} strokeLinecap="round" strokeLinejoin="round" className="transition-[stroke] duration-300">
              <motion.path
                d={edgePath(e, a, b)}
                strokeDasharray={e.kind === "pass" ? "5 6" : undefined}
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.3 + i * 0.12 }}
              />
              <motion.path
                d={edgeEnd(e, a, b)}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.85 + i * 0.12 }}
              />
            </g>
          );
        })}

        {nodes.map((n, i) => {
          const on = n.id === active;
          const at = n.kind === "basket" ? "right" : (n.labelAt ?? "below");
          const label =
            at === "below" ? { x: n.x, y: n.y + 30, anchor: "middle" } :
            at === "above" ? { x: n.x, y: n.y - 22, anchor: "middle" } :
            at === "left" ? { x: n.x - 22, y: n.y + 4, anchor: "end" } :
            { x: n.x + (n.kind === "basket" ? 28 : 22), y: n.y + 4, anchor: "start" };
          return (
            <motion.g
              key={n.id}
              role="button"
              tabIndex={0}
              aria-pressed={on}
              aria-label={`${n.label}: ${n.note}`}
              className="cursor-pointer outline-none [&:focus-visible>.ring]:opacity-100"
              onMouseEnter={() => setActive(n.id)}
              onFocus={() => setActive(n.id)}
              onClick={() => setActive(n.id)}
              onKeyDown={(ev) => (ev.key === "Enter" || ev.key === " ") && (ev.preventDefault(), setActive(n.id))}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, ease: EASE, delay: 0.1 + i * 0.07 }}
              style={{ transformOrigin: `${n.x}px ${n.y}px` }}
            >
              <circle cx={n.x} cy={n.y} r={24} fill="transparent" />
              <circle className="ring opacity-0" cx={n.x} cy={n.y} r={20} fill="none" stroke="#ff5a1f" strokeWidth={1.5} strokeDasharray="3 3" />
              {n.kind === "player" && (
                <circle cx={n.x} cy={n.y} r={13} fill={on ? accent : "#0c0d0f"} stroke={on ? accent : "#f4f2ed"} strokeWidth={2} className="transition-colors duration-300" />
              )}
              {n.kind === "check" && (
                <g stroke={on ? accent : "#f4f2ed"} strokeWidth={2.6} strokeLinecap="round" className="transition-colors duration-300">
                  <circle cx={n.x} cy={n.y} r={14} fill="#0c0d0f" stroke="none" />
                  <path d={`M${n.x - 8} ${n.y - 8}L${n.x + 8} ${n.y + 8}M${n.x + 8} ${n.y - 8}L${n.x - 8} ${n.y + 8}`} />
                </g>
              )}
              {n.kind === "basket" && (
                <g>
                  <path d={`M${n.x - 22} ${n.y - 13}H${n.x + 22}`} stroke="#f4f2ed" strokeWidth={2.4} />
                  <circle cx={n.x} cy={n.y} r={10} fill={on ? accent : "#0c0d0f"} stroke={accent} strokeWidth={2.6} />
                </g>
              )}
              <text
                x={label.x}
                y={label.y}
                textAnchor={label.anchor as "middle" | "start" | "end"}
                fontSize={compact ? 11 : 10.5}
                fill={on ? "#f4f2ed" : "#9a9892"}
                style={{ fontFamily: "var(--font-jetbrains)", letterSpacing: "0.08em", textTransform: "uppercase" }}
                className="transition-colors duration-300"
              >
                {n.label}
              </text>
            </motion.g>
          );
        })}
      </svg>
      <div id={descId} className="min-h-[5.5rem] border-t border-line px-4 py-3.5" aria-live="polite">
        <p className="label text-[0.62rem]" style={{ color: accent }}>
          {current.kind === "check" ? "X · check" : current.kind === "basket" ? "◎ · score" : "O · handler"} — {current.label}
        </p>
        <p className="mt-1.5 text-[0.92rem] leading-snug text-paper/85">{current.note}</p>
      </div>
    </div>
  );
}
