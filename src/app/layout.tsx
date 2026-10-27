import type { Metadata, Viewport } from "next";
import { Anton, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { site } from "@/content/site";
import { MotionRoot } from "@/components/motion/MotionRoot";
import "./globals.css";

const anton = Anton({ variable: "--font-anton", weight: "400", subsets: ["latin"] });
const grotesk = Space_Grotesk({ variable: "--font-grotesk", subsets: ["latin"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

const title = `${site.name} | ${site.role}, ${site.focus}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: `%s | ${site.name}` },
  description: site.description,
  authors: [{ name: site.name, url: site.url }],
  openGraph: {
    type: "website",
    url: site.url,
    title,
    description: site.description,
    siteName: site.name,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: `${site.name}: Built for live play.` }],
  },
  twitter: { card: "summary_large_image", title, description: site.description, images: ["/og.jpg"] },
};

export const viewport: Viewport = { themeColor: "#08090a" };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: site.role,
  url: site.url,
  email: `mailto:${site.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Mumbai", addressCountry: "IN" },
  alumniOf: "Vellore Institute of Technology",
  sameAs: [site.links.github, site.links.linkedin],
  knowsAbout: ["Voice AI", "Conversational AI", "Python", "FastAPI", "LLM evaluation", "Backend engineering"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${anton.variable} ${grotesk.variable} ${jetbrains.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <MotionRoot>{children}</MotionRoot>
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
