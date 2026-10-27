"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { kit } from "@/content/skills";
import { projects } from "@/content/projects";
import { FadeUp, MaskLine } from "@/components/motion/Reveal";
import { SectionTag } from "@/components/ui/SectionTag";

const projectSlugs = new Set(projects.map((p) => p.slug));
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function Kit() {
  const [cat, setCat] = useState(kit[0].id);
  const current = kit.find((k) => k.id === cat)!;
  const [toolName, setToolName] = useState(current.tools[0].name);
  const tool = current.tools.find((t) => t.name === toolName) ?? current.tools[0];

  const pick = (id: string) => {
    setCat(id);
    setToolName(kit.find((k) => k.id === id)!.tools[0].name);
  };

  return (
    <section id="kit" className="relative scroll-mt-16 border-t border-line bg-ink px-5 py-28 sm:px-8 md:py-36 lg:px-12" aria-labelledby="kit-title">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <SectionTag n="05">The kit</SectionTag>
            <h2 id="kit-title" className="font-display mt-8 text-[clamp(3.4rem,10vw,10rem)]">
              <MaskLine>What&rsquo;s in</MaskLine>
              <MaskLine delay={0.08}>
                <span className="text-outline">the bag</span>
                <span className="text-orange">.</span>
              </MaskLine>
            </h2>
          </div>
          <FadeUp className="self-end lg:col-span-4">
            <p className="leading-relaxed text-paper/70">No percentages, no logo wall. Pick a tool and see where it was actually used.</p>
          </FadeUp>
        </div>

        <div className="mt-14 grid gap-6 lg:mt-20 lg:grid-cols-12 lg:gap-10">
          <div className="min-w-0 lg:col-span-4">
            <div role="tablist" aria-label="Skill categories" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:px-0">
              {kit.map((k, i) => {
                const on = k.id === cat;
                return (
                  <button
                    key={k.id}
                    role="tab"
                    id={`tab-${k.id}`}
                    aria-selected={on}
                    aria-controls="kit-panel"
                    onClick={() => pick(k.id)}
                    className={`group flex shrink-0 items-baseline gap-4 rounded-sm border px-4 py-3 text-left transition-colors lg:w-full lg:border-0 lg:border-b lg:px-0 lg:py-5 ${on ? "border-orange lg:border-line" : "border-line"}`}
                  >
                    <span className={`font-mono text-xs ${on ? "text-orange" : "text-dim"}`}>{String(i + 1).padStart(2, "0")}</span>
                    <span className={`whitespace-nowrap text-base transition-colors lg:whitespace-normal lg:text-2xl ${on ? "text-paper" : "text-paper/50 group-hover:text-paper/80"}`}>
                      {k.title}
                    </span>
                    {on && <motion.span layoutId="kit-mark" className="ml-auto hidden h-px w-10 self-center bg-orange lg:block" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div id="kit-panel" role="tabpanel" aria-labelledby={`tab-${cat}`} className="min-w-0 lg:col-span-8">
            <div className="overflow-hidden rounded-sm border border-line bg-ink-2">
              <div className="flex items-center gap-2 border-b border-line px-4 py-3">
                <span className="size-2.5 rounded-full bg-paper/15" />
                <span className="size-2.5 rounded-full bg-paper/15" />
                <span className="size-2.5 rounded-full bg-orange/70" />
                <span className="label ml-3 truncate text-[0.62rem] text-muted">
                  ~/kit $ inspect <span className="text-paper">{slugify(tool.name)}</span>
                </span>
              </div>

              <div className="p-5 md:p-7">
                <p className="text-paper/60">{current.blurb}</p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {current.tools.map((t) => {
                    const on = t.name === tool.name;
                    return (
                      <li key={t.name}>
                        <button
                          type="button"
                          aria-pressed={on}
                          onClick={() => setToolName(t.name)}
                          onMouseEnter={() => setToolName(t.name)}
                          onFocus={() => setToolName(t.name)}
                          className={`rounded-full border px-4 py-2 text-sm transition-colors ${on ? "border-orange bg-orange text-ink" : "border-line text-paper/80 hover:border-paper/50"}`}
                        >
                          {t.name}
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={tool.name}
                    className="mt-8 border-t border-line pt-6"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    aria-live="polite"
                  >
                    <p className="font-display text-[clamp(2.2rem,5vw,3.6rem)]">{tool.name}</p>
                    <p className="mt-3 max-w-2xl text-lg leading-relaxed text-paper/85">{tool.evidence}</p>
                    {tool.where.length > 0 && (
                      <div className="mt-6">
                        <p className="label text-muted">Shows up in</p>
                        <ul className="mt-3 flex flex-wrap gap-2">
                          {tool.where.map((w) => {
                            const isPlay = projectSlugs.has(w);
                            return (
                              <li key={w}>
                                <a
                                  href={isPlay ? `#play-${w}` : "#experience"}
                                  className="label inline-flex items-center gap-2 rounded-sm border border-line px-3 py-2 text-[0.62rem] text-paper/80 transition-colors hover:border-orange hover:text-orange"
                                >
                                  <span className={isPlay ? "text-orange" : "text-signal"}>{isPlay ? "Play" : "Role"}</span>
                                  {w}
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
