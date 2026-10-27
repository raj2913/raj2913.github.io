import { Nav } from "@/components/Nav";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Hero } from "@/components/sections/Hero";
import { Kit } from "@/components/sections/Kit";
import { VoiceLab } from "@/components/sections/VoiceLab";
import { Work } from "@/components/sections/Work";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <About />
        <Work />
        <VoiceLab />
        <Experience />
        <Kit />
        <Contact />
      </main>
    </>
  );
}
