"use client";

import { motion } from "motion/react";
import { ArrowUp, ArrowUpRight, Check, Copy, FileText, Mail } from "lucide-react";
import { useState } from "react";
import { site } from "@/content/site";
import { Ball } from "@/components/court/Ball";
import { CourtLines } from "@/components/court/CourtLines";
import { EASE, MaskLine } from "@/components/motion/Reveal";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";

export function Contact() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${site.email}`;
    }
  };

  return (
    <section id="contact" className="relative scroll-mt-0 overflow-hidden bg-ink" aria-labelledby="contact-title">
      <div className="relative flex min-h-svh flex-col">
        {/* After the game: one light left on over centre court */}
        <div className="absolute inset-0 [perspective:1100px] [perspective-origin:50%_0%]" aria-hidden>
          <div className="absolute bottom-[-30svh] left-1/2 aspect-[500/470] w-[max(150vw,140svh)] -translate-x-1/2 md:w-[max(110vw,140svh)]">
            <div className="absolute inset-0 origin-bottom [transform:rotateX(64deg)_rotate(180deg)]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_26%_22%_at_50%_100%,rgb(255_236_210/0.22),transparent_70%)]" />
              <div className="absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_45%_45%_at_50%_100%,black,transparent)]">
                <CourtLines draw={false} />
              </div>
            </div>
          </div>
        </div>
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-full w-[46vw] min-w-[320px] -translate-x-1/2 bg-[linear-gradient(180deg,rgb(255_244_228/0.16),rgb(255_244_228/0.04)_60%,transparent_85%)] [clip-path:polygon(45%_0,55%_0,100%_100%,0_100%)] blur-[14px]"
          aria-hidden
        />
        <div className="pointer-events-none absolute left-1/2 top-[3svh] h-2.5 w-12 -translate-x-1/2 rounded-full bg-[#fff6ea] shadow-[0_0_40px_14px_rgb(255_240_220/0.5)]" aria-hidden />

        <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-1 flex-col items-center justify-center px-5 pb-16 pt-28 text-center sm:px-8 lg:px-12">
          <motion.div
            className="flex items-center gap-3 rounded-md border border-orange/60 bg-orange/10 px-3 py-1.5"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
            aria-hidden
          >
            <span className="label text-[0.58rem] text-muted">Final buzzer</span>
            <span className="led text-lg leading-none">0.0</span>
          </motion.div>

          <h2 id="contact-title" className="font-display mt-8 text-[clamp(4.2rem,15vw,15rem)]">
            <MaskLine>The court</MaskLine>
            <MaskLine delay={0.1}>
              is yours<span className="text-orange">.</span>
            </MaskLine>
          </h2>

          <motion.p
            className="mt-8 max-w-xl text-lg leading-relaxed text-paper/75"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
          >
            Building voice agents, LLM systems, or anything that has to work while someone is waiting on the line? I&rsquo;d like to hear about it.
          </motion.p>

          <motion.div
            className="mt-10 flex w-full flex-col items-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.45 }}
          >
            <div className="flex w-full max-w-xl items-stretch gap-2">
              <a
                href={`mailto:${site.email}`}
                className="group flex min-w-0 flex-1 items-center justify-between gap-3 rounded-full bg-orange py-2 pl-5 pr-2 text-ink sm:pl-6 transition-colors hover:bg-paper"
              >
                <span className="truncate text-[0.86rem] font-semibold sm:text-lg">{site.email}</span>
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-paper transition-transform duration-300 group-hover:rotate-[-12deg]">
                  <Mail className="size-4" />
                </span>
              </a>
              <button
                type="button"
                onClick={copy}
                className="grid size-[3.25rem] shrink-0 self-center sm:size-[3.75rem] place-items-center rounded-full border border-paper/25 transition-colors hover:border-paper"
                aria-label={copied ? "Email address copied" : "Copy email address"}
              >
                {copied ? <Check className="size-4 text-orange" /> : <Copy className="size-4" />}
              </button>
            </div>
            <p className="label h-4 text-[0.6rem] text-orange" aria-live="polite">
              {copied ? "Copied to clipboard" : ""}
            </p>

            <div className="flex flex-wrap justify-center gap-2">
              <a href={site.links.linkedin} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2.5 rounded-full border border-paper/20 px-5 py-3 text-sm transition-colors hover:border-paper hover:bg-paper hover:text-ink">
                <LinkedinIcon /> LinkedIn <ArrowUpRight className="size-3.5 opacity-60" />
              </a>
              <a href={site.links.github} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2.5 rounded-full border border-paper/20 px-5 py-3 text-sm transition-colors hover:border-paper hover:bg-paper hover:text-ink">
                <GithubIcon /> GitHub <ArrowUpRight className="size-3.5 opacity-60" />
              </a>
              {site.resumeUrl && (
                <a href={site.resumeUrl} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2.5 rounded-full border border-paper/20 px-5 py-3 text-sm transition-colors hover:border-paper hover:bg-paper hover:text-ink">
                  <FileText className="size-4" /> Résumé
                </a>
              )}
            </div>
          </motion.div>

          <motion.div
            className="mt-14 w-20 md:w-24"
            initial={{ opacity: 0, y: -40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.3, 1.4, 0.5, 1], delay: 0.6 }}
            aria-hidden
          >
            <Ball id="ball-rest" className="w-full drop-shadow-[0_18px_22px_rgb(0_0_0/0.8)]" />
          </motion.div>
        </div>

        <footer className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-col gap-3 border-t border-line px-5 py-6 text-sm text-dim sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <p>© {new Date().getFullYear()} {site.name} · {site.location}</p>
          <p className="label text-[0.6rem]">Every visual on this page is code. No stock photos.</p>
          <a href="#top" className="inline-flex items-center gap-2 text-paper/70 hover:text-orange">
            Back to tip-off <ArrowUp className="size-3.5" />
          </a>
        </footer>
      </div>
    </section>
  );
}
