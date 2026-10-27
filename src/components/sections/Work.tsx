"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GithubIcon } from "@/components/ui/BrandIcons";
import { archive, projects, type Project } from "@/content/projects";
import { FadeUp, MaskLine } from "@/components/motion/Reveal";
import { SectionTag } from "@/components/ui/SectionTag";
import { PlayDiagram } from "@/components/work/PlayDiagram";

const ACCENT_TEXT = { orange: "text-orange", signal: "text-signal", paper: "text-paper" } as const;

function Play({ p }: { p: Project }) {
  return (
    <article id={`play-${p.slug}`} className="relative border-t border-line py-20 md:py-28" aria-labelledby={`play-${p.slug}-title`}>
      {/* The jersey number, cropped by the section edge */}
      <svg viewBox="0 0 200 150" className="pointer-events-none absolute -top-6 right-0 w-[clamp(14rem,40vw,36rem)] select-none" aria-hidden>
        <text x="200" y="146" textAnchor="end" fontSize="190" fill="rgb(244 242 237 / 0.035)" style={{ fontFamily: "var(--font-anton)" }}>
          {p.number}
        </text>
      </svg>

      <div className="relative grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <p className="label flex items-center gap-3 text-muted">
              <span className={ACCENT_TEXT[p.accent]}>Play {p.number}</span>
              <span>·</span>
              <span>{p.year}</span>
            </p>
            <h3 id={`play-${p.slug}-title`} className="font-display mt-4 text-[clamp(4rem,10vw,8.5rem)]">
              <MaskLine>{p.title}</MaskLine>
            </h3>
            <p className="mt-4 text-xl leading-snug text-paper md:text-2xl">{p.tagline}</p>

            <div className="mt-8 rounded-sm border-l-2 border-orange bg-paper/[0.03] py-3 pl-4 pr-3">
              <p className="label text-orange">Play call: {p.call}</p>
              <p className="mt-1.5 text-[0.95rem] leading-snug text-paper/75">{p.callNote}</p>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {p.stack.map((s) => (
                <span key={s} className="rounded-full border border-line px-3 py-1 font-mono text-[0.7rem] text-paper/75">
                  {s}
                </span>
              ))}
            </div>
            <p className="label mt-6 text-dim">{p.role}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/work/${p.slug}/`}
                className="group inline-flex items-center gap-2.5 rounded-full bg-paper px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-orange"
              >
                Read the case study
                <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <a
                href={p.repo}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 rounded-full border border-paper/25 px-5 py-3 text-sm font-semibold transition-colors hover:border-paper"
              >
                <GithubIcon /> Source
              </a>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <FadeUp>
            <PlayDiagram project={p} />
          </FadeUp>

          <div className="mt-10 grid gap-10 md:grid-cols-2">
            <FadeUp>
              <h4 className="label text-muted">The problem</h4>
              <p className="mt-3 leading-relaxed text-paper/85">{p.problem}</p>
            </FadeUp>
            <FadeUp delay={0.08}>
              <h4 className="label text-muted">The approach</h4>
              <p className="mt-3 leading-relaxed text-paper/85">{p.approach}</p>
            </FadeUp>
          </div>

          <FadeUp className="mt-10">
            <h4 className="label text-muted">Calls I made</h4>
            <ol className="mt-4 space-y-4">
              {p.decisions.map((d, i) => (
                <li key={d} className="grid grid-cols-[2rem_1fr] gap-2 border-t border-line pt-4">
                  <span className={`font-mono text-xs ${ACCENT_TEXT[p.accent]}`}>{String(i + 1).padStart(2, "0")}</span>
                  <span className="leading-relaxed text-paper/85">{d}</span>
                </li>
              ))}
            </ol>
          </FadeUp>

          <FadeUp className="mt-10 rounded-sm border border-line bg-ink-2 p-5 md:p-6">
            <h4 className="label flex items-center gap-2 text-paper">
              <span className="size-1.5 rounded-full bg-orange" /> Box score <span className="text-dim">· documented in the repo</span>
            </h4>
            <ul className="mt-4 space-y-2.5">
              {p.outcome.map((o) => (
                <li key={o} className="text-[0.95rem] leading-relaxed text-paper/80">
                  {o}
                </li>
              ))}
            </ul>
          </FadeUp>
        </div>
      </div>
    </article>
  );
}

export function Work() {
  return (
    <section id="work" className="relative scroll-mt-16 bg-ink px-5 pb-20 pt-10 sm:px-8 lg:px-12" aria-labelledby="work-title">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid gap-8 pb-16 md:pb-20 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <SectionTag n="02">The playbook</SectionTag>
            <h2 id="work-title" className="font-display mt-8 text-[clamp(3.4rem,10vw,10rem)]">
              <MaskLine>Three plays,</MaskLine>
              <MaskLine delay={0.08}>
                <span className="text-outline">tip to buzzer</span>
                <span className="text-orange">.</span>
              </MaskLine>
            </h2>
          </div>
          <FadeUp className="self-end lg:col-span-4">
            <p className="leading-relaxed text-paper/70">
              Personal projects I designed and built end to end. Each diagram is the real architecture, drawn the way a coach would draw it: <span className="text-paper">O</span> handles the ball, <span className="text-paper">X</span> is a check that can stop it, <span className="text-orange">◎</span> is where it scores. Hover, tap or tab through the nodes.
            </p>
          </FadeUp>
        </div>

        {projects.map((p) => (
          <Play key={p.slug} p={p} />
        ))}

        <div id="archive" className="scroll-mt-24 border-t border-line pt-10">
          <p className="label text-muted">From the archive</p>
          <ul className="mt-4 grid gap-px overflow-hidden rounded-sm border border-line bg-line md:grid-cols-2">
            {archive.map((a) => (
              <li key={a.title} className="bg-ink p-5">
                {a.href ? (
                  <a href={a.href} target="_blank" rel="noreferrer" className="group flex items-start justify-between gap-4">
                    <span>
                      <span className="block font-semibold text-paper group-hover:text-orange">{a.title}</span>
                      <span className="mt-1 block text-sm text-paper/65">{a.note}</span>
                    </span>
                    <ArrowUpRight className="size-4 shrink-0 text-muted transition-colors group-hover:text-orange" />
                  </a>
                ) : (
                  <>
                    <span className="block font-semibold text-paper">{a.title}</span>
                    <span className="mt-1 block text-sm text-paper/65">{a.note}</span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
