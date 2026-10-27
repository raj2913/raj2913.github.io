"use client";

import { ArrowUpRight, CalendarPlus, Check, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { site } from "@/content/site";
import { Field, sendViaForm } from "@/components/contact/fields";

// Slots offered when no scheduler link is configured, in Raj's time zone (IST, no DST).
const TIMES = ["10:00", "11:30", "13:00", "16:00", "18:00", "19:30"];
const MINUTES = 30;
const DAYS_AHEAD = 12;

type Slot = { day: number; time: string };

// Midnight IST on the n-th day from now, as a UTC timestamp.
function istDay(n: number) {
  const offset = site.timezone.utcOffsetMinutes * 60_000;
  const nowIst = new Date(Date.now() + offset);
  return Date.UTC(nowIst.getUTCFullYear(), nowIst.getUTCMonth(), nowIst.getUTCDate() + n) - offset;
}

function slotStart(s: Slot) {
  const [h, m] = s.time.split(":").map(Number);
  return new Date(istDay(s.day) + (h * 60 + m) * 60_000);
}

const gcalStamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

function fmt(d: Date, opts: Intl.DateTimeFormatOptions, timeZone?: string) {
  return new Intl.DateTimeFormat("en-GB", { ...opts, timeZone }).format(d);
}

function SchedulerEmbed({ url }: { url: string }) {
  return (
    <div>
      <iframe src={url} title="Book a 1:1 with Raj" className="h-[40rem] w-full rounded-sm border border-line bg-paper" loading="lazy" />
      <a href={url} target="_blank" rel="noreferrer" className="label mt-3 inline-flex items-center gap-1.5 text-muted hover:text-paper">
        Open the scheduler in a new tab <ArrowUpRight className="size-3.5" />
      </a>
    </div>
  );
}

export function BookCall() {
  const days = useMemo(
    () =>
      Array.from({ length: DAYS_AHEAD }, (_, i) => i + 1).filter((n) => {
        const wd = fmt(new Date(istDay(n)), { weekday: "short" }, site.timezone.id);
        return wd !== "Sun";
      }),
    [],
  );
  const visitorTz = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const [day, setDay] = useState(days[0]);
  const [time, setTime] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", topic: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [gcal, setGcal] = useState("");

  if (site.bookingUrl) return <SchedulerEmbed url={site.bookingUrl} />;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const start = time ? slotStart({ day, time }) : null;
  const sameTz = visitorTz === site.timezone.id;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!start) return;
    const end = new Date(start.getTime() + MINUTES * 60_000);
    const when = `${fmt(start, { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }, site.timezone.id)} ${site.timezone.label}`;
    const title = `1:1 — ${form.name} × ${site.name}`;
    const details = `${form.topic || "Intro call"}\n\nBooked from ${site.url}\n${form.name} <${form.email}>`;
    const url =
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      `&text=${encodeURIComponent(title)}` +
      `&dates=${gcalStamp(start)}/${gcalStamp(end)}` +
      `&details=${encodeURIComponent(details)}` +
      `&add=${encodeURIComponent(site.email)}` +
      "&location=Video%20call";
    setGcal(url);
    // Open the calendar tab inside the click, before any await, so it isn't blocked as a pop-up.
    window.open(url, "_blank", "noopener");
    setStatus("sending");
    try {
      await sendViaForm(site.contactFormEndpoint, {
        _subject: `1:1 request: ${when} — ${form.name}`,
        _replyto: form.email,
        name: form.name,
        email: form.email,
        slot: `${when} (${MINUTES} min)`,
        visitor_timezone: visitorTz,
        topic: form.topic || "—",
      });
    } catch {
      // The calendar invite is the main path; the email is a heads-up, so a failure here is not fatal.
    }
    setStatus("done");
  };

  if (status === "done" && start) {
    return (
      <div className="flex min-h-[22rem] flex-col items-start justify-center" role="status">
        <span className="grid size-12 place-items-center rounded-full bg-orange text-ink">
          <Check className="size-5" />
        </span>
        <p className="font-display mt-6 text-5xl">Tip-off is set.</p>
        <p className="mt-3 max-w-md text-paper/75">
          Google Calendar opened in a new tab with the slot filled in and me as a guest. Hit <span className="text-paper">Save</span> and the invite lands in my calendar. I&rsquo;ve also had an email about it.
        </p>
        <a href={gcal} target="_blank" rel="noreferrer" className="label mt-6 inline-flex items-center gap-1.5 text-orange hover:underline">
          Didn&rsquo;t open? Open Google Calendar <ArrowUpRight className="size-3.5" />
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <fieldset>
        <legend className="label text-[0.6rem] text-muted">Pick a day</legend>
        <div className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1">
          {days.map((n) => {
            const d = new Date(istDay(n) + 12 * 3_600_000);
            const on = n === day;
            return (
              <button
                key={n}
                type="button"
                aria-pressed={on}
                onClick={() => setDay(n)}
                className={`flex w-14 shrink-0 flex-col items-center rounded-sm border py-2 transition-colors ${on ? "border-orange bg-orange text-ink" : "border-line text-paper/80 hover:border-paper/50"}`}
              >
                <span className="label text-[0.55rem]">{fmt(d, { weekday: "short" }, site.timezone.id)}</span>
                <span className="font-display mt-1 text-2xl leading-none">{fmt(d, { day: "numeric" }, site.timezone.id)}</span>
                <span className="label mt-1 text-[0.5rem] opacity-70">{fmt(d, { month: "short" }, site.timezone.id)}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label text-[0.6rem] text-muted">
          Pick a time · {site.timezone.label}
          {!sameTz && <span className="normal-case tracking-normal text-dim"> (your time below)</span>}
        </legend>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {TIMES.map((t) => {
            const local = fmt(slotStart({ day, time: t }), { hour: "2-digit", minute: "2-digit", hour12: false }, visitorTz);
            const on = t === time;
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                onClick={() => setTime(t)}
                className={`rounded-sm border px-2 py-2.5 text-center transition-colors ${on ? "border-orange bg-orange/15 text-paper" : "border-line text-paper/80 hover:border-paper/50"}`}
              >
                <span className="led block text-[1rem] leading-none !text-current ![text-shadow:none]">{t}</span>
                {!sameTz && <span className="label mt-1 block text-[0.52rem] text-dim">{local} you</span>}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" id="book-name" required autoComplete="name" value={form.name} onChange={set("name")} />
        <Field label="Your email" id="book-email" type="email" required autoComplete="email" value={form.email} onChange={set("email")} />
      </div>
      <Field label="What should we talk about? (optional)" id="book-topic" value={form.topic} onChange={set("topic")} placeholder="A role, a voice agent, a hard bug…" />

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={!time || status === "sending"}
          className="inline-flex items-center gap-3 rounded-full bg-orange px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === "sending" ? <Loader2 className="size-4 animate-spin" /> : <CalendarPlus className="size-4" />}
          {start ? `Send invite · ${fmt(start, { weekday: "short", day: "numeric", month: "short" }, site.timezone.id)}, ${time}` : "Pick a time first"}
        </button>
        <span className="max-w-xs text-sm text-dim">{MINUTES}-minute video call. Opens Google Calendar with me added as a guest.</span>
      </div>
    </form>
  );
}
