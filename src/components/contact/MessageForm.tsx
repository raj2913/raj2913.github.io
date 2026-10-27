"use client";

import { ArrowUpRight, Check, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { site } from "@/content/site";
import { Field, sendViaForm } from "@/components/contact/fields";

const TOPICS = ["A role", "A project", "Voice AI", "Just saying hi"];

export function MessageForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const mailto = `mailto:${site.email}?subject=${encodeURIComponent(`${topic}: from ${form.name || "your site"}`)}&body=${encodeURIComponent(form.message)}`;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const honey = new FormData(e.currentTarget).get("_honey");
    if (honey) return;
    setStatus("sending");
    try {
      await sendViaForm(site.contactFormEndpoint, {
        _subject: `Portfolio: ${topic} — ${form.name}`,
        _replyto: form.email,
        name: form.name,
        email: form.email,
        topic,
        message: form.message,
      });
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="flex min-h-[22rem] flex-col items-start justify-center" role="status">
        <span className="grid size-12 place-items-center rounded-full bg-orange text-ink">
          <Check className="size-5" />
        </span>
        <p className="font-display mt-6 text-5xl">Swish.</p>
        <p className="mt-3 max-w-md text-paper/75">
          Your message is in my inbox. I&rsquo;ll reply to <span className="text-paper">{form.email}</span>.
        </p>
        <button type="button" onClick={() => (setForm({ name: "", email: "", message: "" }), setStatus("idle"))} className="label mt-6 text-muted hover:text-paper">
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <fieldset>
        <legend className="label text-[0.6rem] text-muted">What&rsquo;s it about?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={topic === t}
              onClick={() => setTopic(t)}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${topic === t ? "border-orange bg-orange text-ink" : "border-line text-paper/75 hover:border-paper/50"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" id="msg-name" name="name" required autoComplete="name" value={form.name} onChange={set("name")} />
        <Field label="Your email" id="msg-email" name="email" type="email" required autoComplete="email" value={form.email} onChange={set("email")} />
      </div>
      <Field label="Message" id="msg-body" name="message" textarea required placeholder="What are you building?" value={form.message} onChange={set("message")} />
      <input type="text" name="_honey" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="flex flex-wrap items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={status === "sending"}
          className="group inline-flex items-center gap-3 rounded-full bg-orange px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-paper disabled:opacity-60"
        >
          {status === "sending" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4 transition-transform group-hover:-rotate-12" />}
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
        <span className="text-sm text-dim">Goes straight to my inbox.</span>
      </div>
      {status === "error" && (
        <p className="rounded-sm border border-orange/40 bg-orange/10 px-4 py-3 text-sm text-paper/85" role="alert">
          That didn&rsquo;t go through ({error}).{" "}
          <a href={mailto} className="inline-flex items-center gap-1 text-orange underline-offset-4 hover:underline">
            Send it from your email app instead <ArrowUpRight className="size-3.5" />
          </a>
        </p>
      )}
    </form>
  );
}
