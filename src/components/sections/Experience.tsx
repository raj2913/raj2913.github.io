"use client";

import { animate, motion, useInView, useScroll, useSpring } from "motion/react";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { education, roles, type Role, type Stat } from "@/content/experience";
import { EASE, FadeUp, MaskLine } from "@/components/motion/Reveal";
import { SectionTag } from "@/components/ui/SectionTag";

// Scoreboard digits that count up once, when they first come into view.
function CountUp({ stat }: { stat: Stat }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotionSafe();
  const [n, setN] = useState(0);
  const shown = reduce ? stat.value : n;
  useEffect(() => {
    if (!inView || reduce) return;
    const c = animate(0, stat.value, { duration: 1.2, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, reduce, stat.value]);
  return (
    <span ref={ref} className="tabular-nums">
      {stat.prefix}
      {shown}
      {stat.suffix}
    </span>
  );
}

function RoleRow({ r }: { r: Role }) {
  const [open, setOpen] = useState(!!r.current);
  const id = `role-${r.company.replace(/\W/g, "").toLowerCase()}`;
  return (
    <li className="relative grid gap-6 border-t border-line py-12 md:grid-cols-12 md:gap-10 md:py-16">
      <span
        className={`absolute -left-[5px] top-14 hidden size-[11px] rounded-full border-2 md:-left-[calc(2.5rem+5px)] md:block lg:-left-[calc(3.5rem+5px)] ${r.current ? "border-orange bg-orange shadow-[0_0_0_6px_rgb(255_90_31/0.18)]" : "border-paper/50 bg-ink"}`}
        aria-hidden
      />
      <div className="md:col-span-3">
        <p className={`font-display text-[4.5rem] leading-none md:text-[6rem] ${r.current ? "text-paper" : "text-outline"}`}>{r.year}</p>
        <p className="label mt-3 text-muted">
          {r.start} — {r.end}
        </p>
        <p className="label mt-1 text-dim">{r.location}</p>
        {r.current && (
          <p className="label mt-4 inline-flex items-center gap-2 rounded-full border border-orange/50 px-3 py-1.5 text-[0.6rem] text-orange">
            <span className="live-dot size-1.5 rounded-full bg-orange" /> Now playing
          </p>
        )}
      </div>

      <div className="md:col-span-9">
        <h3 className={`font-display ${r.current ? "text-[clamp(3rem,7vw,6.5rem)]" : "text-[clamp(2.6rem,5.5vw,4.8rem)]"}`}>{r.company}</h3>
        <p className="mt-2 text-lg text-paper md:text-xl">{r.role}</p>
        <p className="mt-4 max-w-3xl leading-relaxed text-paper/70">{r.summary}</p>

        <dl className={`mt-8 grid gap-px overflow-hidden rounded-sm border border-line bg-line ${r.stats.length > 3 ? "grid-cols-2 lg:grid-cols-4" : r.stats.length === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:max-w-sm"}`}>
          {r.stats.map((s) => (
            <div key={s.label} className="bg-ink p-4 md:p-5">
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className={`font-display block text-[2.8rem] leading-none md:text-[3.4rem] ${r.current ? "text-orange" : "text-paper"}`}>
                  <CountUp stat={s} />
                </span>
                <span className="mt-2 block text-[0.82rem] leading-snug text-paper/60" aria-hidden>
                  {s.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={id}
          className="label mt-6 inline-flex items-center gap-2 text-muted transition-colors hover:text-paper"
        >
          Play-by-play
          <ChevronDown className={`size-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
        </button>
        <motion.div
          id={id}
          initial={false}
          animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="overflow-hidden"
        >
          <ul className="mt-4 max-w-3xl space-y-3">
            {r.details.map((d) => (
              <li key={d} className="grid grid-cols-[1rem_1fr] gap-2 leading-relaxed text-paper/80">
                <span className="text-orange" aria-hidden>
                  ›
                </span>
                {d}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            {r.tags.map((t) => (
              <span key={t} className="rounded-full border border-line px-3 py-1 font-mono text-[0.68rem] text-paper/65">
                {t}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </li>
  );
}

export function Experience() {
  const list = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: list, offset: ["start 70%", "end 60%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section id="experience" className="relative scroll-mt-16 bg-ink px-5 py-28 sm:px-8 md:py-36 lg:px-12" aria-labelledby="exp-title">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <SectionTag n="04">The game log</SectionTag>
            <h2 id="exp-title" className="font-display mt-8 text-[clamp(3.4rem,10vw,10rem)]">
              <MaskLine>Minutes</MaskLine>
              <MaskLine delay={0.08}>
                <span className="text-outline">on the floor</span>
                <span className="text-orange">.</span>
              </MaskLine>
            </h2>
          </div>
          <FadeUp className="self-end lg:col-span-4">
            <p className="leading-relaxed text-paper/70">
              From payments data at Razorpay, to owning enterprise voice deployments at Gnani.ai, to building a new voice AI product line at Ignosis. Each step closer to the live call.
            </p>
          </FadeUp>
        </div>

        <div ref={list} className="relative mt-16 md:ml-10 md:pl-0 lg:ml-14">
          <div className="absolute -left-10 bottom-0 top-0 hidden w-px bg-line md:block lg:-left-14" aria-hidden>
            <motion.div className="h-full w-full origin-top bg-orange" style={{ scaleY: fill }} />
          </div>
          <ol>
            {roles.map((r) => (
              <RoleRow key={r.company} r={r} />
            ))}
            <li className="relative grid gap-6 border-y border-line py-10 md:grid-cols-12 md:gap-10">
              <span className="absolute -left-[5px] top-12 hidden size-[11px] rounded-full border-2 border-paper/30 bg-ink md:-left-[calc(2.5rem+5px)] md:block lg:-left-[calc(3.5rem+5px)]" aria-hidden />
              <div className="md:col-span-3">
                <p className="label text-muted">Rookie years</p>
                <p className="label mt-1 text-dim">{education.dates}</p>
              </div>
              <div className="md:col-span-9">
                <h3 className="text-2xl font-semibold text-paper">{education.school}</h3>
                <p className="mt-1 text-paper/70">
                  {education.degree} · {education.note}
                </p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
