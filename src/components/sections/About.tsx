"use client";

import { motion } from "motion/react";
import { readDecideExecute, scoutingReport } from "@/content/site";
import { EASE, FadeUp, MaskLine } from "@/components/motion/Reveal";
import { SectionTag } from "@/components/ui/SectionTag";

// A film-room still: one possession drawn on a half court, and the same arc read as a waveform.
function FilmStill() {
  const draw = (delay: number) => ({
    initial: { pathLength: 0 },
    whileInView: { pathLength: 1 },
    viewport: { once: true },
    transition: { duration: 1.1, ease: EASE, delay },
  });
  const pop = (delay: number) => ({
    initial: { opacity: 0, scale: 0.4 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: true },
    transition: { duration: 0.4, ease: EASE, delay },
  });
  const bars = Array.from({ length: 64 }, (_, i) => {
    const t = i / 63;
    const arc = Math.sin(t * Math.PI) * 0.85 + 0.15;
    return 4 + arc * (10 + 22 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.43)));
  });

  return (
    <figure className="relative overflow-hidden rounded-sm border border-line bg-ink-2">
      <div className="label flex items-center justify-between border-b border-line px-4 py-3 text-[0.62rem] text-muted">
        <span>Tape 07 · 4th quarter</span>
        <span className="led text-[0.8rem]">0:24</span>
      </div>
      <svg viewBox="0 0 400 300" className="block w-full" role="img" aria-label="A half-court play diagram: a drive draws the help defender, and the ball is kicked out to the open shooter in the corner.">
        <g fill="none" stroke="rgb(244 242 237 / 0.18)" strokeWidth="1.5">
          <path d="M20 20H380V290H20Z" />
          <path d="M140 20V150H260V20" />
          <path d="M140 150a60 60 0 0 0 120 0" />
          <path d="M42 20V88A170 170 0 0 0 358 88V20" />
          <path d="M175 20H225" />
        </g>
        <circle cx="200" cy="38" r="7" fill="none" stroke="#ff5a1f" strokeWidth="2" />
        {/* drive */}
        <motion.path d="M200 250 L212 236 L196 222 L212 208 L198 194 L208 178" fill="none" stroke="#f4f2ed" strokeWidth="2" {...draw(0.2)} />
        {/* kick-out pass */}
        <motion.path d="M206 176 L66 112" fill="none" stroke="#ff5a1f" strokeWidth="2" strokeDasharray="6 6" {...draw(1.1)} />
        {/* help defender rotates */}
        <motion.path d="M100 140 Q 150 160 180 170" fill="none" stroke="rgb(244 242 237 / 0.45)" strokeWidth="1.5" {...draw(0.8)} />
        <motion.g {...pop(0.1)}>
          <circle cx="200" cy="256" r="11" fill="none" stroke="#f4f2ed" strokeWidth="2" />
          <text x="200" y="260" textAnchor="middle" fontSize="11" fill="#f4f2ed" style={{ fontFamily: "var(--font-jetbrains)" }}>1</text>
        </motion.g>
        <motion.g {...pop(0.5)}>
          <circle cx="60" cy="108" r="11" fill="#ff5a1f" />
          <text x="60" y="112" textAnchor="middle" fontSize="11" fill="#08090a" style={{ fontFamily: "var(--font-jetbrains)" }}>3</text>
        </motion.g>
        <motion.g {...pop(0.6)} stroke="rgb(244 242 237 / 0.6)" strokeWidth="2">
          <path d="M92 132l14 14M106 132l-14 14" />
          <path d="M184 160l12 12M196 160l-12 12" />
        </motion.g>
        <motion.text x="74" y="94" fontSize="10" fill="#ff5a1f" style={{ fontFamily: "var(--font-jetbrains)", letterSpacing: "0.1em" }} {...pop(1.8)}>
          OPEN · CATCH &amp; SHOOT
        </motion.text>
      </svg>
      <div className="border-t border-line px-4 pb-4 pt-3">
        <div className="flex h-12 items-center gap-[3px]" aria-hidden>
          {bars.map((h, i) => (
            <motion.span
              key={i}
              className={`w-full rounded-full ${i > 18 && i < 34 ? "bg-orange" : "bg-paper/35"}`}
              initial={{ height: 2 }}
              whileInView={{ height: h }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.6 + i * 0.012 }}
            />
          ))}
        </div>
        <figcaption className="label mt-3 flex justify-between text-[0.6rem] text-muted">
          <span>Read the moment</span>
          <span className="text-orange">then move</span>
        </figcaption>
      </div>
    </figure>
  );
}

export function About() {
  return (
    <section id="about" className="relative scroll-mt-20 bg-ink px-5 pb-28 pt-28 sm:px-8 md:pb-40 md:pt-40 lg:px-12" aria-labelledby="about-title">
      <div className="mx-auto max-w-[1600px]">
        <SectionTag n="01">The read</SectionTag>
        <h2 id="about-title" className="font-display mt-8 text-[clamp(3rem,9vw,9.5rem)]">
          <MaskLine>A good possession</MaskLine>
          <MaskLine delay={0.08}>
            <span className="text-outline">starts before</span>
          </MaskLine>
          <MaskLine delay={0.16}>
            the ball moves<span className="text-orange">.</span>
          </MaskLine>
        </h2>

        <div className="mt-16 grid gap-12 md:mt-24 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <FilmStill />
            </div>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <FadeUp>
              <p className="text-[1.3rem] leading-snug text-paper md:text-[1.6rem]">
                A live call doesn&rsquo;t wait. A caller interrupts, goes quiet, switches language, asks for a human, and the system has to answer like it saw it coming.
              </p>
            </FadeUp>
            <FadeUp delay={0.1}>
              <p className="mt-6 text-[1.02rem] leading-relaxed text-paper/70 md:text-lg">
                I build the parts that make that possible: backend services, conversation state, and the evaluations that decide what ships. Then I watch the tape: real calls, recurring failures, the next fix.
              </p>
            </FadeUp>

            <FadeUp delay={0.15} className="mt-12">
              <h3 className="label text-orange">Scouting report</h3>
              <dl className="mt-4 divide-y divide-line border-y border-line">
                {scoutingReport.map((r) => (
                  <div key={r.label} className="grid grid-cols-[8.5rem_1fr] gap-4 py-3.5 sm:grid-cols-[11rem_1fr]">
                    <dt className="label pt-0.5 text-muted">{r.label}</dt>
                    <dd className="text-[0.95rem] text-paper/90">{r.value}</dd>
                  </div>
                ))}
              </dl>
            </FadeUp>
          </div>
        </div>

        <ol className="mt-24 grid gap-px overflow-hidden rounded-sm border border-line bg-line md:mt-32 md:grid-cols-3">
          {readDecideExecute.map((s, i) => (
            <FadeUp as="li" key={s.word} delay={i * 0.08} className="group relative bg-ink p-6 md:p-8">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-[3.6rem] transition-colors group-hover:text-orange md:text-[4.6rem]">{s.word}</span>
                <span className="label text-dim">{s.n}</span>
              </div>
              <dl className="mt-6 space-y-5">
                <div>
                  <dt className="label text-muted">On the court</dt>
                  <dd className="mt-1.5 text-paper/80">{s.court}</dd>
                </div>
                <div>
                  <dt className="label text-orange">In production</dt>
                  <dd className="mt-1.5 text-paper">{s.code}</dd>
                </div>
              </dl>
            </FadeUp>
          ))}
        </ol>
      </div>
    </section>
  );
}
