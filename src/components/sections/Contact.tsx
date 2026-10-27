"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, ArrowUpRight, CalendarDays, Check, Copy, FileText, Mail, MessageSquare, Phone } from "lucide-react";
import { useState } from "react";
import { site } from "@/content/site";
import { Ball } from "@/components/court/Ball";
import { CourtLines } from "@/components/court/CourtLines";
import { EASE, FadeUp, MaskLine } from "@/components/motion/Reveal";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";
import { MessageForm } from "@/components/contact/MessageForm";
import { BookCall } from "@/components/contact/BookCall";

const TABS = [
  { id: "message", label: "Send a message", icon: MessageSquare },
  { id: "book", label: "Book a 1:1", icon: CalendarDays },
] as const;

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked: the link next to it still works */
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors hover:border-paper hover:text-paper"
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
    >
      {copied ? <Check className="size-3.5 text-orange" /> : <Copy className="size-3.5" />}
    </button>
  );
}

function Line({ icon, label, value, href, copy, external }: { icon: React.ReactNode; label: string; value: string; href: string; copy?: string; external?: boolean }) {
  return (
    <li className="flex items-center gap-3 border-b border-line py-4 last:border-b-0">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-paper/[0.06] text-paper/80">{icon}</span>
      <a href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} className="group min-w-0 flex-1">
        <span className="label block text-[0.58rem] text-muted">{label}</span>
        <span className="mt-0.5 flex items-center gap-1.5 truncate text-[0.95rem] text-paper transition-colors group-hover:text-orange">
          <span className="truncate">{value}</span>
          {external && <ArrowUpRight className="size-3.5 shrink-0 opacity-60" />}
        </span>
      </a>
      {copy && <CopyButton value={copy} label={label.toLowerCase()} />}
    </li>
  );
}

export function Contact() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("message");

  return (
    <section id="contact" className="relative overflow-hidden bg-ink" aria-labelledby="contact-title">
      <div className="relative flex min-h-svh flex-col">
        {/* After the game: one light left on over centre court */}
        <div className="absolute inset-x-0 top-0 h-svh [perspective:1100px] [perspective-origin:50%_0%]" aria-hidden>
          <div className="absolute bottom-[-30svh] left-1/2 aspect-[500/470] w-[max(150vw,140svh)] -translate-x-1/2 md:w-[max(110vw,140svh)]">
            <div className="absolute inset-0 origin-bottom [transform:rotateX(64deg)_rotate(180deg)]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_26%_22%_at_50%_100%,rgb(255_236_210/0.22),transparent_70%)]" />
              <div className="absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_45%_45%_at_50%_100%,black,transparent)]">
                <CourtLines draw={false} boundary={false} />
              </div>
            </div>
          </div>
        </div>
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-svh w-[46vw] min-w-[320px] -translate-x-1/2 bg-[linear-gradient(180deg,rgb(255_244_228/0.16),rgb(255_244_228/0.04)_60%,transparent_85%)] [clip-path:polygon(45%_0,55%_0,100%_100%,0_100%)] blur-[14px]"
          aria-hidden
        />
        <div className="pointer-events-none absolute left-1/2 top-[3svh] h-2.5 w-12 -translate-x-1/2 rounded-full bg-[#fff6ea] shadow-[0_0_40px_14px_rgb(255_240_220/0.5)]" aria-hidden />

        <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-1 flex-col items-center px-5 pb-20 pt-28 sm:px-8 md:pt-32 lg:px-12">
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

          <h2 id="contact-title" className="font-display mt-8 text-center text-[clamp(4.2rem,15vw,15rem)]">
            <MaskLine>The court</MaskLine>
            <MaskLine delay={0.1}>
              is yours<span className="text-orange">.</span>
            </MaskLine>
          </h2>

          <FadeUp delay={0.2} className="mt-8 max-w-xl text-center">
            <p className="text-lg leading-relaxed text-paper/75">
              Building voice agents, LLM systems, or anything that has to work while someone is waiting on the line? Send a note or grab 30 minutes.
            </p>
          </FadeUp>

          <FadeUp delay={0.3} className="mt-14 grid w-full max-w-6xl gap-4 lg:grid-cols-12">
            {/* Message or 1:1 */}
            <div className="min-w-0 overflow-hidden rounded-sm border border-line bg-ink-2/95 lg:col-span-8">
              <div role="tablist" aria-label="How to reach Raj" className="flex border-b border-line">
                {TABS.map((t) => {
                  const on = tab === t.id;
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      role="tab"
                      id={`contact-tab-${t.id}`}
                      aria-selected={on}
                      aria-controls="contact-panel"
                      onClick={() => setTab(t.id)}
                      className={`relative flex flex-1 items-center justify-center gap-2.5 px-4 py-4 text-sm font-semibold transition-colors sm:flex-none sm:px-6 ${on ? "text-paper" : "text-paper/50 hover:text-paper/80"}`}
                    >
                      <Icon className={`size-4 ${on ? "text-orange" : ""}`} />
                      {t.label}
                      {on && <motion.span layoutId="contact-tab" className="absolute inset-x-0 -bottom-px h-0.5 bg-orange" />}
                    </button>
                  );
                })}
              </div>
              <div id="contact-panel" role="tabpanel" aria-labelledby={`contact-tab-${tab}`} className="p-5 md:p-8">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
                    {tab === "message" ? <MessageForm /> : <BookCall />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Direct lines */}
            <aside className="flex flex-col rounded-sm border border-line bg-ink-2/95 p-5 md:p-6 lg:col-span-4" aria-label="Direct contact">
              <p className="label text-orange">Direct lines</p>
              <ul className="mt-2">
                <Line icon={<Mail className="size-4" />} label="Email" value={site.email} href={`mailto:${site.email}`} copy={site.email} />
                <Line icon={<Phone className="size-4" />} label="Phone" value={site.phone.display} href={`tel:${site.phone.tel}`} copy={site.phone.tel} />
                <Line icon={<LinkedinIcon />} label="LinkedIn" value="raj-vardhan" href={site.links.linkedin} external />
                <Line icon={<GithubIcon />} label="GitHub" value="raj2913" href={site.links.github} external />
                {site.resumeUrl && <Line icon={<FileText className="size-4" />} label="Résumé" value="Download PDF" href={site.resumeUrl} external />}
              </ul>
              <div className="mt-auto flex items-end justify-between gap-4 pt-6">
                <p className="text-sm leading-relaxed text-dim">
                  {site.location} · {site.timezone.label} (UTC+5:30)
                </p>
                <motion.div
                  className="w-14 shrink-0"
                  initial={{ opacity: 0, y: -30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: [0.3, 1.4, 0.5, 1], delay: 0.5 }}
                  aria-hidden
                >
                  <Ball id="ball-rest" className="w-full drop-shadow-[0_12px_14px_rgb(0_0_0/0.8)]" />
                </motion.div>
              </div>
            </aside>
          </FadeUp>
        </div>

        <footer className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-col gap-3 border-t border-line px-5 py-6 text-sm text-dim sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <p>
            © {new Date().getFullYear()} {site.name} · {site.location}
          </p>
          <p className="label text-[0.6rem]">Every visual on this page is code. No stock photos.</p>
          <a href="#top" className="inline-flex items-center gap-2 text-paper/70 hover:text-orange">
            Back to tip-off <ArrowUp className="size-3.5" />
          </a>
        </footer>
      </div>
    </section>
  );
}
