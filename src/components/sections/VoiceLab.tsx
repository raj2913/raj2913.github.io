"use client";

import { AnimatePresence, motion } from "motion/react";
import { Mic, MicOff, RotateCcw, Send, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatTime, suggestions, type Slots } from "@/lib/courtside";
import { useVoiceSession, type Phase } from "@/lib/useVoiceSession";
import { Waveform } from "@/components/voice/Waveform";
import { EASE, FadeUp, MaskLine } from "@/components/motion/Reveal";
import { SectionTag } from "@/components/ui/SectionTag";

const RAIL: { id: Phase; label: string }[] = [
  { id: "listening", label: "Listening" },
  { id: "processing", label: "Processing" },
  { id: "responding", label: "Responding" },
];

const NOTES = [
  {
    title: "Speech in, speech out",
    body: "Streaming speech-to-text produces partial transcripts while the caller is still talking, and text-to-speech has to start before the full reply exists. Every hop is delay the caller can hear.",
  },
  {
    title: "Orchestration",
    body: "Something has to own the turn: what the caller meant, which step of the flow this is, and whether a model should answer at all. Anything with legal or business weight belongs in code, not in a prompt.",
  },
  {
    title: "Latency & turn-taking",
    body: "People leave very short gaps between turns. Call end-of-speech too early and you cut callers off; too late and it feels like a bad line. Endpointing is a product decision as much as a model one.",
  },
  {
    title: "Conversation state",
    body: "Slots, stage, what's been confirmed, what's been said. Keep it explicit and serialisable, so a call can be replayed, regression-tested, and handed to a person without starting over.",
  },
  {
    title: "Interruptions & silence",
    body: "Barge-in means stopping audio mid-word and remembering only what the caller actually heard. Silence needs a policy too: reprompt once, then end gracefully.",
  },
];

const TRY = [
  "Interrupt the agent mid-sentence",
  "Say nothing for 9 seconds",
  "Ask for a person",
  "Ask to switch to Hindi",
];

function StateRail({ phase }: { phase: Phase }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-2" role="status" aria-label={`Agent state: ${phase}`}>
      {RAIL.map((r, i) => {
        const on = phase === r.id;
        return (
          <div key={r.id} className="flex items-center gap-2">
            <span
              className={`label flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.62rem] transition-colors duration-300 ${
                on
                  ? r.id === "listening"
                    ? "border-signal bg-signal/10 text-signal"
                    : r.id === "responding"
                      ? "border-orange bg-orange/10 text-orange"
                      : "border-paper/60 bg-paper/10 text-paper"
                  : "border-line text-dim"
              }`}
            >
              <span className={`size-1.5 rounded-full ${on ? "live-dot bg-current" : "bg-dim/60"}`} />
              {r.label}
            </span>
            {i < RAIL.length - 1 && <span className="text-dim" aria-hidden>→</span>}
          </div>
        );
      })}
      <AnimatePresence>
        {phase === "interrupted" && (
          <motion.span
            className="label rounded-full border border-paper bg-paper px-3 py-1.5 text-[0.62rem] text-ink"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            Barge-in
          </motion.span>
        )}
        {phase === "ended" && (
          <motion.span className="label rounded-full border border-line px-3 py-1.5 text-[0.62rem] text-muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            Call ended
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

function SlotBoard({ slots, filled }: { slots: Slots; filled: string[] }) {
  const cells = [
    { k: "day", label: "Day", v: slots.day },
    { k: "time", label: "Time", v: slots.time && formatTime(slots.time) },
    { k: "court", label: "Court", v: slots.court },
    { k: "hours", label: "Length", v: slots.hours ? `${slots.hours}h` : slots.day || slots.time || slots.court ? "1h" : undefined },
  ];
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
      {cells.map((c) => (
        <div key={c.k} className="bg-ink px-3 py-3">
          <p className="label text-[0.58rem] text-muted">{c.label}</p>
          <motion.p
            key={c.v ?? "empty"}
            className={`led mt-1.5 truncate text-[0.95rem] ${c.v ? "" : "!text-dim ![text-shadow:none]"}`}
            initial={filled.includes(c.k) ? { opacity: 0, y: 6 } : false}
            animate={{ opacity: 1, y: 0 }}
          >
            {c.v ?? "--"}
          </motion.p>
        </div>
      ))}
    </div>
  );
}

export function VoiceLab() {
  const s = useVoiceSession();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [s.entries]);

  const enter = () => {
    setOpen(true);
    s.start();
    window.setTimeout(() => input.current?.focus({ preventScroll: true }), 400);
  };
  const leave = () => {
    s.end();
    setOpen(false);
  };
  const submit = (text: string) => {
    if (!text.trim()) return;
    s.send(text);
    setDraft("");
  };

  const canType = s.phase === "listening" || s.phase === "responding";
  const chips = s.phase === "ended" ? [] : suggestions[s.agent.stage];

  return (
    <section id="voice-lab" className="relative scroll-mt-16 overflow-hidden bg-[#0b0d10] px-5 py-28 sm:px-8 md:py-36 lg:px-12" aria-labelledby="lab-title">
      <div className="scanlines pointer-events-none absolute inset-0" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-ink to-transparent" aria-hidden />
      <div className="pointer-events-none absolute -right-[20vw] top-[10%] size-[60vw] rounded-full bg-[radial-gradient(circle,rgb(124_200_255/0.08),transparent_65%)]" aria-hidden />

      <div className="relative mx-auto max-w-[1600px]">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <SectionTag n="03" tone="signal">
              The voice lab
            </SectionTag>
            <h2 id="lab-title" className="font-display mt-8 text-[clamp(3.2rem,9vw,9rem)]">
              <MaskLine>Voice is the hardest</MaskLine>
              <MaskLine delay={0.08}>
                <span className="text-outline">real-time UI</span> there is<span className="text-signal">.</span>
              </MaskLine>
            </h2>
          </div>
          <FadeUp className="self-end lg:col-span-4">
            <p className="leading-relaxed text-paper/75">
              No buttons, no spinner, no second try. Just a person waiting for an answer. This is the loop I work on every day, in a form you can poke at: a small agent that books court time at a made-up gym.
            </p>
          </FadeUp>
        </div>

        <div className="mt-14 md:mt-20">
          <AnimatePresence mode="wait" initial={false}>
            {!open ? (
              <motion.div
                key="closed"
                className="relative overflow-hidden rounded-sm border border-line bg-ink/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.25 } }}
              >
                <div className="h-40 px-4 md:h-56">
                  <Waveform phase="idle" level={s.level} />
                </div>
                <div className="flex flex-col items-start gap-6 border-t border-line p-5 md:flex-row md:items-center md:justify-between md:p-8">
                  <div>
                    <p className="label text-signal">Courtside · demo agent</p>
                    <p className="mt-2 max-w-xl text-paper/70">
                      Type or talk. Interrupt it. Go quiet. Watch the state machine handle it. Works without a microphone, and nothing you say leaves your browser.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={enter}
                    className="group relative inline-flex shrink-0 items-center gap-4 overflow-hidden rounded-full border border-signal/60 bg-signal/10 py-4 pl-6 pr-4 font-semibold text-paper transition-colors hover:bg-signal hover:text-ink"
                  >
                    <span className="label text-[0.78rem] tracking-[0.18em]">Enter the voice lab</span>
                    <span className="grid size-9 place-items-center rounded-full bg-signal text-ink transition-colors group-hover:bg-ink group-hover:text-signal">
                      <Mic className="size-4" />
                    </span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="open"
                className="grid gap-4 lg:grid-cols-12"
                initial={{ opacity: 0, y: 20, clipPath: "inset(0 0 30% 0)" }}
                animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                {/* Console */}
                <div className="flex min-w-0 flex-col overflow-hidden rounded-sm border border-line bg-ink/80 lg:col-span-8">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="label text-paper">Courtside</span>
                      <span className="label rounded-sm border border-orange/50 bg-orange/10 px-2 py-1 text-[0.58rem] text-orange">
                        Simulated · rule-based, no model attached
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={s.toggleVoice}
                        disabled={!s.support.tts}
                        aria-pressed={s.voiceOn}
                        className={`label flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.6rem] transition-colors disabled:opacity-40 ${s.voiceOn ? "border-orange text-orange" : "border-line text-muted hover:text-paper"}`}
                      >
                        {s.voiceOn ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
                        <span>Voice {s.voiceOn ? "on" : "off"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={s.toggleMic}
                        aria-pressed={s.micOn}
                        className={`label flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.6rem] transition-colors ${s.micOn ? "border-signal bg-signal/10 text-signal" : "border-line text-muted hover:text-paper"}`}
                      >
                        {s.micOn ? <Mic className="size-3.5" /> : <MicOff className="size-3.5" />}
                        <span>Mic {s.micOn ? "on" : "off"}</span>
                      </button>
                      <button type="button" onClick={s.start} className="grid size-8 place-items-center rounded-full border border-line text-muted hover:text-paper" aria-label="Restart the call">
                        <RotateCcw className="size-3.5" />
                      </button>
                      <button type="button" onClick={leave} className="grid size-8 place-items-center rounded-full border border-line text-muted hover:text-paper" aria-label="Close the voice lab">
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="border-b border-line px-4 py-3">
                    <StateRail phase={s.phase} />
                  </div>

                  <div className="h-28 border-b border-line px-3 md:h-32">
                    <Waveform phase={s.phase} level={s.level} readMic={s.readMic} />
                  </div>

                  <div ref={scroller} className="h-[19rem] space-y-3 overflow-y-auto px-4 py-4 md:h-[21rem]" aria-live="polite" aria-label="Transcript">
                    {s.entries.map((e) =>
                      e.who === "system" ? (
                        <p key={e.id} className="label text-center text-[0.6rem] text-dim">
                          — {e.text} —
                        </p>
                      ) : (
                        <motion.div
                          key={e.id}
                          className={`flex ${e.who === "caller" ? "justify-end" : "justify-start"}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className={`max-w-[85%] ${e.who === "caller" ? "text-right" : ""}`}>
                            <p className={`label mb-1 text-[0.58rem] ${e.who === "caller" ? "text-signal" : "text-orange"}`}>{e.who === "caller" ? "You" : "Agent"}</p>
                            <p
                              className={`rounded-sm px-3.5 py-2.5 text-[0.95rem] leading-snug ${
                                e.who === "caller" ? "bg-signal/10 text-paper" : "border border-line bg-paper/[0.03] text-paper"
                              }`}
                            >
                              {e.who === "agent" ? (
                                <>
                                  <span className="sr-only">{e.text}</span>
                                  <span aria-hidden>
                                    {e.text.split(" ").slice(0, e.shown).join(" ")}
                                    {e.cut && <span className="text-orange"> —</span>}
                                    {!e.cut && e.shown < e.text.split(" ").length && <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 bg-orange live-dot" />}
                                  </span>
                                </>
                              ) : (
                                e.text
                              )}
                            </p>
                            {e.cut && <p className="label mt-1 text-[0.55rem] text-dim">Cut off. Only the words before the cut count as said.</p>}
                          </div>
                        </motion.div>
                      ),
                    )}
                    {s.partial && (
                      <p className="text-right text-[0.95rem] italic text-signal/70" aria-hidden>
                        {s.partial}…
                      </p>
                    )}
                  </div>

                  <div className="border-t border-line p-3">
                    {chips.length > 0 && (
                      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                        {chips.map((c) => (
                          <button
                            key={c}
                            type="button"
                            disabled={!canType}
                            onClick={() => submit(c)}
                            className="shrink-0 rounded-full border border-line px-3 py-1.5 text-[0.8rem] text-paper/75 transition-colors hover:border-signal hover:text-paper disabled:opacity-40"
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    )}
                    {s.phase === "ended" ? (
                      <button type="button" onClick={s.start} className="w-full rounded-full bg-paper py-3 text-sm font-semibold text-ink hover:bg-orange">
                        Start a new call
                      </button>
                    ) : (
                      <form
                        className="flex items-center gap-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          submit(draft);
                        }}
                      >
                        <label htmlFor="lab-input" className="sr-only">
                          Say something to the agent
                        </label>
                        <input
                          id="lab-input"
                          ref={input}
                          value={draft}
                          onChange={(e) => {
                            setDraft(e.target.value);
                            s.nudge();
                          }}
                          placeholder={s.phase === "responding" ? "Type to interrupt…" : "Say something to the agent…"}
                          autoComplete="off"
                          className="min-w-0 flex-1 rounded-full border border-line bg-transparent px-4 py-3 text-[0.95rem] placeholder:text-dim focus:border-signal focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={!canType || !draft.trim()}
                          className="grid size-11 shrink-0 place-items-center rounded-full bg-signal text-ink transition-opacity disabled:opacity-30"
                          aria-label="Send"
                        >
                          <Send className="size-4" />
                        </button>
                      </form>
                    )}
                    {s.micError && <p className="mt-2 text-sm text-orange">{s.micError}</p>}
                    {s.micOn && <p className="label mt-2 text-[0.58rem] text-dim">Speech is transcribed by your browser&rsquo;s speech service. Use headphones if agent voice is on.</p>}
                  </div>
                </div>

                {/* Under the hood */}
                <aside className="flex flex-col gap-4 lg:col-span-4" aria-label="Under the hood">
                  <div className="rounded-sm border border-line bg-ink/80 p-4">
                    <p className="label text-muted">Conversation state</p>
                    <div className="mt-3">
                      <SlotBoard slots={s.agent.slots} filled={s.turn?.filled ?? []} />
                    </div>
                    <dl className="mt-4 grid grid-cols-2 gap-y-2.5 text-sm">
                      <dt className="label pt-0.5 text-[0.6rem] text-muted">Stage</dt>
                      <dd className="font-mono text-paper">{s.agent.stage}</dd>
                      <dt className="label pt-0.5 text-[0.6rem] text-muted">Last intent</dt>
                      <dd className="font-mono text-paper">{s.turn?.intent ?? "—"}</dd>
                      <dt className="label pt-0.5 text-[0.6rem] text-muted">Turns</dt>
                      <dd className="font-mono text-paper">{s.agent.turns}</dd>
                    </dl>
                  </div>

                  <div className="rounded-sm border border-line bg-ink/80 p-4">
                    <p className="label text-muted">Last turn timing</p>
                    <div className="mt-3 space-y-3">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span className="text-paper/80">Rules engine</span>
                          <span className="font-mono text-signal">{s.turn ? (s.turn.engineMs < 0.1 ? "< 0.1 ms" : `${s.turn.engineMs.toFixed(2)} ms`) : "—"}</span>
                        </div>
                        <p className="label mt-0.5 text-[0.55rem] text-dim">Measured in your browser</p>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm">
                          <span className="text-paper/80">Think time</span>
                          <span className="font-mono text-orange">{s.turn ? `${s.turn.thinkMs} ms` : "—"}</span>
                        </div>
                        <p className="label mt-0.5 text-[0.55rem] text-dim">Artificial delay standing in for a model call</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-sm border border-line bg-ink/80 p-4">
                    <p className="label text-muted">Things to try</p>
                    <ul className="mt-3 space-y-2">
                      {TRY.map((t) => (
                        <li key={t} className="flex gap-2.5 text-sm text-paper/80">
                          <span className="text-signal">›</span>
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </aside>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-20 md:mt-28">
          <p className="label text-muted">How the loop works</p>
          <ol className="mt-5 grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
            {NOTES.map((n, i) => (
              <FadeUp as="li" key={n.title} delay={i * 0.06} className="bg-[#0b0d10] p-5">
                <span className="font-mono text-xs text-signal">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 font-semibold text-paper">{n.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-paper/65">{n.body}</p>
              </FadeUp>
            ))}
          </ol>
          <p className="mt-4 text-sm text-dim">
            The demo is a teaching version of the loop. It is not the internals of any system I&rsquo;ve built at work, and it runs entirely in your browser.
          </p>
        </div>
      </div>
    </section>
  );
}
