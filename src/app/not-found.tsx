import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-svh place-items-center bg-ink px-6 text-center">
      <div>
        <p className="led text-2xl">24</p>
        <h1 className="font-display mt-6 text-[clamp(4rem,14vw,10rem)]">
          Air ball<span className="text-orange">.</span>
        </h1>
        <p className="mt-4 text-paper/70">That page isn&rsquo;t on the court.</p>
        <Link href="/" className="mt-8 inline-block rounded-full bg-paper px-6 py-3 text-sm font-semibold text-ink hover:bg-orange">
          Back to tip-off
        </Link>
      </div>
    </main>
  );
}
