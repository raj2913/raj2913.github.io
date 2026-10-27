"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { nav, site } from "@/content/site";
import { EASE } from "@/components/motion/Reveal";

// The shot clock runs from 24 to 0 across the page. It hits zero on the contact section.
function ShotClock() {
  const { scrollYProgress } = useScroll();
  const [t, setT] = useState(24);
  useMotionValueEvent(scrollYProgress, "change", (v) => setT(Math.max(0, 24 * (1 - Math.min(1, v / 0.97)))));
  const buzzer = t <= 0.05;
  const text = t < 5 ? t.toFixed(1) : String(Math.ceil(t)).padStart(2, "0");
  return (
    <div
      className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 transition-colors ${buzzer ? "border-orange bg-orange/15" : "border-line bg-ink/60"}`}
      title="Shot clock: how much page is left"
      aria-hidden
    >
      <span className="label hidden text-[0.55rem] text-muted sm:inline">Shot clock</span>
      <span className="led w-[2.4ch] text-right text-[1.05rem] leading-none">{text}</span>
    </div>
  );
}

export function Nav() {
  const [active, setActive] = useState<string>("top");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 40));

  useEffect(() => {
    const els = nav.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <a href="#main" className="sr-only z-[80] rounded bg-paper px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
      >
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink/90 via-ink/50 to-transparent transition-opacity duration-500 ${scrolled ? "opacity-100" : "opacity-0"}`}
          aria-hidden
        />
        <div
          className={`relative mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 transition-all duration-500 sm:px-8 lg:px-12 ${scrolled ? "md:py-3" : "md:py-5"}`}
        >
          <a href="#top" className="group flex items-center gap-2.5" aria-label={`RV, ${site.name}: back to top`}>
            <span className="relative grid size-9 place-items-center rounded-full border border-paper/20 bg-ink/60 backdrop-blur transition-colors group-hover:border-orange">
              <span className="font-display text-[0.95rem] tracking-wide">RV</span>
              <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-orange" />
            </span>
            <span className="label hidden text-paper/80 xl:inline">{site.name}</span>
          </a>

          <nav aria-label="Sections" className="hidden lg:block">
            <ul className="flex items-center gap-1 rounded-full border border-line bg-ink/70 p-1 backdrop-blur-md">
              {nav.slice(1).map((n) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    aria-current={active === n.id ? "location" : undefined}
                    className={`relative flex items-center gap-2 rounded-full px-3.5 py-2 text-[0.8rem] transition-colors ${active === n.id ? "text-ink" : "text-paper/70 hover:text-paper"}`}
                  >
                    {active === n.id && (
                      <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-paper" transition={{ type: "spring", stiffness: 420, damping: 36 }} />
                    )}
                    <span className={`relative font-mono text-[0.62rem] ${active === n.id ? "text-orange" : "text-dim"}`}>{n.short}</span>
                    <span className="relative">{n.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <ShotClock />
            <a
              href="#contact"
              className="hidden rounded-full bg-paper px-4 py-2 text-[0.8rem] font-semibold text-ink transition-colors hover:bg-orange sm:inline-block"
            >
              Get in touch
            </a>
            <button
              type="button"
              className="grid size-10 place-items-center rounded-full border border-paper/20 bg-ink/60 backdrop-blur lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col bg-ink/97 px-5 pb-8 pt-24 backdrop-blur-lg lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <nav aria-label="Sections">
              <ul className="space-y-1">
                {nav.slice(1).map((n, i) => (
                  <motion.li
                    key={n.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + i * 0.05, duration: 0.5, ease: EASE }}
                  >
                    <a href={`#${n.id}`} onClick={() => setOpen(false)} className="flex items-baseline gap-4 border-b border-line py-3">
                      <span className="font-mono text-xs text-orange">{n.short}</span>
                      <span className="font-display text-[2.6rem]">{n.label}</span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <div className="mt-auto space-y-2">
              <a href={`mailto:${site.email}`} className="block rounded-full bg-orange px-5 py-4 text-center font-semibold text-ink">
                {site.email}
              </a>
              <a href={`tel:${site.phone.tel}`} className="block rounded-full border border-paper/20 py-3 text-center text-sm">
                {site.phone.display}
              </a>
              <div className="grid grid-cols-2 gap-2">
                <a href={site.links.linkedin} target="_blank" rel="noreferrer" className="rounded-full border border-paper/20 py-3 text-center text-sm">
                  LinkedIn
                </a>
                <a href={site.links.github} target="_blank" rel="noreferrer" className="rounded-full border border-paper/20 py-3 text-center text-sm">
                  GitHub
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
