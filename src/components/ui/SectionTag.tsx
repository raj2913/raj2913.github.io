// The small mono marker that opens each section: quarter number, name, and a hairline.
export function SectionTag({ n, children, tone = "orange" }: { n: string; children: React.ReactNode; tone?: "orange" | "signal" }) {
  return (
    <div className="label flex items-center gap-3 text-muted">
      <span className={tone === "signal" ? "text-signal" : "text-orange"}>{n}</span>
      <span>{children}</span>
      <span className="h-px w-16 bg-line" aria-hidden />
    </div>
  );
}
