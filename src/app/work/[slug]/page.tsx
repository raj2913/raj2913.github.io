import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { projects } from "@/content/projects";
import { site } from "@/content/site";
import { PlayDiagram } from "@/components/work/PlayDiagram";
import { GithubIcon } from "@/components/ui/BrandIcons";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  if (!p) return {};
  return {
    title: `${p.title}: case study`,
    description: p.tagline,
    alternates: { canonical: `/work/${p.slug}/` },
    openGraph: { title: `${p.title} | ${site.name}`, description: p.tagline, url: `/work/${p.slug}/`, images: ["/og.jpg"] },
  };
}

// Inline `code` in case-study copy.
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/).map((part, i) =>
        part.startsWith("`") ? (
          <code key={i} className="rounded-sm bg-paper/[0.07] px-1.5 py-0.5 font-mono text-[0.86em] text-paper">
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}

export default async function CaseStudy({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const i = projects.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  const p = projects[i];
  const next = projects[(i + 1) % projects.length];

  return (
    <main id="main" className="min-h-svh bg-ink px-5 pb-24 pt-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1400px]">
        <nav className="flex items-center justify-between" aria-label="Case study">
          <Link href="/#work" className="label inline-flex items-center gap-2 text-muted transition-colors hover:text-paper">
            <ArrowLeft className="size-3.5" /> Back to the playbook
          </Link>
          <Link href="/" className="font-display text-lg" aria-label={`${site.name}, home`}>
            RV<span className="text-orange">.</span>
          </Link>
        </nav>

        <header className="mt-16 grid gap-10 border-b border-line pb-16 md:mt-24 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="label text-orange">
              Play {p.number} · {p.call} · {p.year}
            </p>
            <h1 className="font-display mt-5 text-[clamp(4.5rem,14vw,12rem)]">{p.title}</h1>
            <p className="mt-6 max-w-2xl text-2xl leading-snug text-paper">{p.tagline}</p>
            <p className="label mt-6 text-dim">{p.role}</p>
          </div>
          <div className="flex flex-col justify-end gap-6 lg:col-span-5">
            <div className="flex flex-wrap gap-2">
              {p.stack.map((s) => (
                <span key={s} className="rounded-full border border-line px-3 py-1 font-mono text-[0.7rem] text-paper/75">
                  {s}
                </span>
              ))}
            </div>
            <a
              href={p.repo}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit items-center gap-2.5 rounded-full bg-paper px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-orange"
            >
              <GithubIcon /> View the source
            </a>
          </div>
        </header>

        <div className="mt-16 grid gap-14 lg:grid-cols-12">
          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-8">
              <p className="label mb-4 text-muted">The play, drawn</p>
              <PlayDiagram project={p} compact />
              <div className="mt-6 rounded-sm border-l-2 border-orange bg-paper/[0.03] py-3 pl-4 pr-3">
                <p className="label text-orange">Play call: {p.call}</p>
                <p className="mt-1.5 text-[0.95rem] leading-snug text-paper/75">{p.callNote}</p>
              </div>
            </div>
          </aside>

          <article className="lg:col-span-6 lg:col-start-7">
            {p.caseStudy.map((s, n) => (
              <section key={s.title} className="border-t border-line py-10 first:border-t-0 first:pt-0">
                <p className="font-mono text-xs text-orange">{String(n + 1).padStart(2, "0")}</p>
                <h2 className="font-display mt-3 text-[2.6rem] md:text-[3.2rem]">{s.title}</h2>
                {s.body.map((b) => (
                  <p key={b} className="mt-4 text-[1.05rem] leading-relaxed text-paper/80">
                    <Rich text={b} />
                  </p>
                ))}
              </section>
            ))}

            <section className="border-t border-line py-10">
              <h2 className="font-display text-[2.6rem] md:text-[3.2rem]">Calls I made</h2>
              <ol className="mt-5 space-y-4">
                {p.decisions.map((d, n) => (
                  <li key={d} className="grid grid-cols-[2rem_1fr] gap-2 leading-relaxed text-paper/85">
                    <span className="font-mono text-xs text-orange">{String(n + 1).padStart(2, "0")}</span>
                    {d}
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-sm border border-line bg-ink-2 p-6">
              <h2 className="label text-paper">Box score · documented in the repo</h2>
              <ul className="mt-4 space-y-3">
                {p.outcome.map((o) => (
                  <li key={o} className="leading-relaxed text-paper/80">
                    {o}
                  </li>
                ))}
              </ul>
            </section>
          </article>
        </div>

        <Link href={`/work/${next.slug}/`} className="group mt-24 block border-t border-line pt-10">
          <p className="label text-muted">Next play</p>
          <p className="font-display mt-3 flex items-center gap-6 text-[clamp(3.5rem,10vw,8rem)] transition-colors group-hover:text-orange">
            {next.title}
            <ArrowRight className="size-[0.5em] transition-transform duration-300 group-hover:translate-x-3" />
          </p>
        </Link>
      </div>
    </main>
  );
}
