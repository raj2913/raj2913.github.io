"use client";

import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  AnimatePresence,
} from "motion/react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { Ball } from "@/components/court/Ball";
import { CourtLines } from "@/components/court/CourtLines";
import { EASE, MaskLine } from "@/components/motion/Reveal";
import { Magnetic } from "@/components/ui/Magnetic";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";

const LIGHTS = [
  { left: "14%", rotate: 14, delay: 0.05, width: "26vw" },
  { left: "50%", rotate: 0, delay: 0.22, width: "34vw" },
  { left: "86%", rotate: -14, delay: 0.38, width: "26vw" },
];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotionSafe();
  const [shots, setShots] = useState(0);
  const [shooting, setShooting] = useState(false);

  // Pointer parallax: one normalised pointer, read at different depths by each layer.
  const px = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 });
  const py = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 });
  const onPointerMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse") return;
    px.set(e.clientX / window.innerWidth - 0.5);
    py.set(e.clientY / window.innerHeight - 0.5);
  };

  // Scroll: the camera rises over the court until it reads as a diagram.
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const tilt = useTransform(p, [0, 0.62], [63, 0]);
  // How far the camera pulls back: enough for the whole court to fit the screen width.
  const plane = useRef<HTMLDivElement>(null);
  const fitScale = useMotionValue(0.62);
  const fitLift = useMotionValue(0);
  useEffect(() => {
    const fit = () => {
      const el = plane.current;
      if (!el) return;
      const s = Math.min(0.62, (window.innerWidth * 0.98) / el.offsetWidth);
      const vh = window.innerHeight;
      fitScale.set(s);
      // Lift the flattened court so its centre sits mid-screen.
      fitLift.set(Math.max(0, 0.6 * vh - (el.offsetHeight * s) / 2));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [fitScale, fitLift]);
  const floorScale = useTransform(() => 1 + (fitScale.get() - 1) * Math.min(1, p.get() / 0.62));
  const floorLift = useTransform(() => -fitLift.get() * Math.min(1, p.get() / 0.62));
  const wood = useTransform(p, [0.1, 0.5], [1, 0]);
  const circuit = useTransform(p, [0.45, 0.68], [0, 1]);
  const textY = useTransform(p, [0, 0.35], [0, -120]);
  const textOpacity = useTransform(p, [0, 0.28], [1, 0]);
  const nameY = useTransform(p, [0, 0.4], ["0%", "40%"]);
  const nameOpacity = useTransform(p, [0.05, 0.38], [1, 0]);
  const ballY = useTransform(p, [0, 0.4], ["0vh", "-75vh"]);
  const ballX = useTransform(p, [0, 0.4], ["0vw", "-12vw"]);
  const ballScale = useTransform(p, [0, 0.4], [1, 0.55]);
  const lightsOpacity = useTransform(p, [0.2, 0.55], [1, 0.25]);
  const captionOpacity = useTransform(p, [0.6, 0.75, 0.95, 1], [0, 1, 1, 0.9]);
  const captionY = useTransform(p, [0.6, 0.75], [30, 0]);
  const exitFade = useTransform(p, [0.55, 0.85], [0, 1]);

  const lightX = useTransform(px, (v) => v * -24);
  const courtX = useTransform(px, (v) => v * 30);
  const courtRotZ = useTransform(px, (v) => v * 2.5);
  const ballPX = useTransform(px, (v) => v * 46);
  const ballPY = useTransform(py, (v) => v * 30);
  const textPX = useTransform(px, (v) => v * -10);

  const shoot = () => {
    if (shooting) return;
    setShooting(true);
    setShots((s) => s + 1);
    window.setTimeout(() => setShooting(false), reduce ? 50 : 1200);
  };

  const animated = !reduce;

  return (
    <section
      id="top"
      ref={ref}
      onPointerMove={onPointerMove}
      className={animated ? "relative h-[210svh]" : "relative h-svh min-h-[640px]"}
      aria-label="Introduction"
    >
      <div className="sticky top-0 h-svh min-h-[640px] overflow-hidden">
        {/* Arena air */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_8%,rgb(255_236_214/0.10),transparent_70%),radial-gradient(ellipse_60%_40%_at_50%_100%,rgb(255_90_31/0.10),transparent_70%)]" />

        {/* Stadium lights */}
        <motion.div className="pointer-events-none absolute inset-0" style={{ x: lightX, opacity: lightsOpacity }} aria-hidden>
          {LIGHTS.map((l) => (
            <div
              key={l.left}
              className="absolute top-[-8vh] h-[115vh] -translate-x-1/2 origin-top"
              style={{ left: l.left, width: l.width, rotate: `${l.rotate}deg` }}
            >
              <div
                className="h-full w-full bg-[linear-gradient(180deg,rgb(255_244_228/0.30),rgb(255_244_228/0.06)_55%,transparent_85%)] [clip-path:polygon(44%_0,56%_0,100%_100%,0_100%)] blur-[18px]"
                style={animated ? { animation: `flicker 1.1s ${l.delay}s both` } : undefined}
              />
              <div
                className="absolute left-1/2 top-[7vh] h-3 w-14 -translate-x-1/2 rounded-full bg-[#fff6ea] shadow-[0_0_40px_14px_rgb(255_240_220/0.55)]"
                style={animated ? { animation: `flicker 1.1s ${l.delay}s both` } : undefined}
              />
            </div>
          ))}
        </motion.div>

        {/* The floor */}
        <div className="absolute inset-0 [perspective:1100px] [perspective-origin:50%_0%]" aria-hidden>
          <div ref={plane} className="absolute bottom-[-14svh] left-1/2 aspect-[500/470] w-[max(150vw,150svh)] -translate-x-1/2 [transform-style:preserve-3d] md:w-[max(118vw,150svh)]">
          <motion.div
            className="absolute inset-0 origin-bottom"
            style={animated ? { rotateX: tilt, scale: floorScale, y: floorLift, x: courtX, rotateZ: courtRotZ } : { rotateX: 63 }}
          >
            <motion.div
              className="absolute inset-0 [mask-image:linear-gradient(to_top,black_35%,transparent_95%)]"
              style={{ opacity: animated ? wood : 1 }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(180deg,#140b06,#1d0f07_55%,#120804)]" />
              <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgb(0_0_0/0.4)_0_2px,transparent_2px_86px),repeating-linear-gradient(90deg,rgb(255_170_110/0.05)_0_19px,rgb(0_0_0/0.08)_19px_43px,rgb(255_150_90/0.04)_43px_86px)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_22%_16%_at_50%_70%,rgb(255_236_210/0.30),transparent_70%),radial-gradient(ellipse_18%_14%_at_16%_62%,rgb(255_240_220/0.12),transparent_70%),radial-gradient(ellipse_18%_14%_at_84%_62%,rgb(255_240_220/0.12),transparent_70%)]" />
              <div className="absolute left-[34%] top-0 h-[40.4%] w-[32%] bg-[#ff5a1f]/[0.10]" />
            </motion.div>
            <div className="absolute inset-0 [mask-image:linear-gradient(to_top,black_45%,transparent_100%)]">
              <CourtLines draw={animated} circuit={animated ? circuit : undefined} />
            </div>
          </motion.div>
          </div>
        </div>

        {/* Horizon haze: the far end of the court disappears into the dark */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-ink via-ink/70 to-transparent" aria-hidden />

        {/* Scrim so the copy never fights the court lines */}
        <div className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(ellipse_48%_62%_at_14%_42%,rgb(8_9_10/0.82),rgb(8_9_10/0.45)_55%,transparent_80%)] md:bg-[radial-gradient(ellipse_40%_58%_at_18%_44%,rgb(8_9_10/0.85),rgb(8_9_10/0.5)_55%,transparent_80%)]" aria-hidden />
        {/* Edge vignette */}
        <div className="pointer-events-none absolute inset-0 z-[4] bg-[radial-gradient(ellipse_90%_80%_at_50%_45%,transparent_55%,rgb(8_9_10/0.75))]" aria-hidden />

        {/* Copy */}
        <motion.div
          className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col px-5 pt-24 sm:px-8 md:pt-28 lg:px-12"
          style={animated ? { y: textY, opacity: textOpacity, x: textPX } : undefined}
        >
          <motion.p
            className="label flex flex-wrap items-center gap-x-3 gap-y-1 text-muted md:pr-[30vw]"
            initial={animated ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="text-paper">{site.name}</span>
            <span className="text-orange">/</span>
            <span>{site.role}</span>
            <span className="text-orange">/</span>
            <span>{site.focus}</span>
            <span className="text-orange">/</span>
            <span>{site.location}</span>
          </motion.p>

          <p className="font-display mt-5 text-[clamp(3.6rem,min(15.5vw,9.5svh),7rem)] md:mt-6 md:text-[clamp(4.5rem,min(9.6vw,15svh),10.5rem)]" aria-hidden>
            <MaskLine inView={false} delay={0.45}>
              {site.headline[0]}
            </MaskLine>
            <MaskLine inView={false} delay={0.58}>
              <span>live play</span>
              <span className="text-orange">.</span>
            </MaskLine>
          </p>

          <motion.div
            className="mt-6 max-w-[27rem] md:mt-8"
            initial={animated ? { opacity: 0, y: 16 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.6 }}
          >
            <p className="text-[0.98rem] leading-relaxed text-paper/80 md:text-[1.05rem] [@media(max-height:760px)]:hidden">{site.intro}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3 [@media(max-height:760px)]:mt-0">
              <Magnetic>
                <a
                  href="#work"
                  className="group inline-flex items-center gap-3 rounded-full bg-orange px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-paper"
                >
                  Explore the work
                  <ArrowDownRight className="size-4 transition-transform duration-300 group-hover:rotate-[-45deg]" />
                </a>
              </Magnetic>
              <Magnetic>
                <a
                  href="#contact"
                  className="group inline-flex items-center gap-3 rounded-full border border-paper/25 px-6 py-3.5 text-sm font-semibold text-paper transition-colors hover:border-paper hover:bg-paper/5"
                >
                  Let&rsquo;s connect
                  <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </Magnetic>
            </div>
          </motion.div>
        </motion.div>

        {/* The ball, under a tracking box */}
        <motion.div
          className="absolute right-[8vw] top-[61svh] z-20 w-[32vw] max-w-[240px] sm:top-[50svh] md:right-[9vw] md:top-[18svh] md:w-[22vw] md:max-w-[340px]"
          style={animated ? { y: ballY, x: ballX, scale: ballScale } : undefined}
        >
          <motion.div style={animated ? { x: ballPX, y: ballPY } : undefined}>
            <motion.div
              initial={animated ? { y: "-80svh", x: "-30vw", rotate: -140, opacity: 0 } : false}
              animate={{ y: 0, x: 0, rotate: 0, opacity: 1 }}
              transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
            >
              <motion.button
                type="button"
                onClick={shoot}
                aria-label={`Take a shot. ${shots * 2} points so far.`}
                className="relative block w-full cursor-pointer rounded-full"
                animate={shooting ? { y: ["0%", "-140%", "0%"], rotate: [0, 260, 360], scale: [1, 0.7, 1] } : { y: "0%" }}
                transition={shooting ? { duration: 1.1, ease: [0.45, 0, 0.2, 1], times: [0, 0.5, 1] } : { duration: 0.2 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Ball className="w-full drop-shadow-[0_30px_50px_rgb(0_0_0/0.65)]" />
              </motion.button>
            </motion.div>

            {/* Tracking HUD */}
            <motion.div
              className="pointer-events-none absolute -inset-[14%]"
              initial={animated ? { opacity: 0, scale: 1.25 } : false}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: EASE, delay: 1.55 }}
              aria-hidden
            >
              {["left-0 top-0 border-l border-t", "right-0 top-0 border-r border-t", "left-0 bottom-0 border-l border-b", "right-0 bottom-0 border-r border-b"].map((c) => (
                <span key={c} className={`absolute size-5 border-orange ${c}`} />
              ))}
              <span className="label absolute -top-6 right-0 whitespace-nowrap text-[0.6rem] text-orange md:left-0 md:right-auto">
                track_01 · ball <span className="text-paper/70">0.98</span>
              </span>
              <span className="label absolute -bottom-6 right-0 whitespace-nowrap text-[0.6rem] text-paper/50">
                {shots > 0 ? `${shots * 2} pts · tap to shoot` : "tap to shoot"}
              </span>
            </motion.div>
          </motion.div>
          <AnimatePresence>
            {shooting && (
              <motion.span
                key={shots}
                className="font-display pointer-events-none absolute -top-10 left-1/2 text-5xl text-orange"
                initial={{ opacity: 0, y: 10, x: "-50%" }}
                animate={{ opacity: 1, y: -30 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                aria-hidden
              >
                +2
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        {/* The name, standing on the floor */}
        <motion.h1
          className="absolute inset-x-0 bottom-[-2.2vw] z-10 px-2 sm:px-4"
          style={animated ? { y: nameY, opacity: nameOpacity } : undefined}
        >
          <span className="sr-only">
            {site.name}, {site.role}, {site.focus}. Built for live play.
          </span>
          <span className="block overflow-hidden" aria-hidden>
            <motion.svg
              viewBox="0 0 1000 152"
              className="block w-full"
              initial={animated ? { y: "100%" } : false}
              animate={{ y: "0%" }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.7 }}
            >
              <defs>
                <linearGradient id="name-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f4f2ed" />
                  <stop offset="70%" stopColor="#f4f2ed" stopOpacity="0.92" />
                  <stop offset="100%" stopColor="#f4f2ed" stopOpacity="0.35" />
                </linearGradient>
              </defs>
              <text
                x="0"
                y="150"
                textLength="1000"
                lengthAdjust="spacing"
                fill="url(#name-fill)"
                fontSize="200"
                style={{ fontFamily: "var(--font-anton)" }}
              >
                RAJ VARDHAN
              </text>
            </motion.svg>
          </span>
        </motion.h1>

        {/* Hand-off to the next scene */}
        {animated && (
          <motion.div className="pointer-events-none absolute inset-x-0 bottom-0 z-[6] h-[38%] bg-gradient-to-t from-ink via-ink/80 to-transparent" style={{ opacity: exitFade }} aria-hidden />
        )}

        {/* Scene change caption */}
        {animated && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center px-6 pb-[9svh]"
            style={{ opacity: captionOpacity, y: captionY }}
            aria-hidden
          >
            <div className="px-6 py-5 text-center [text-shadow:0_4px_40px_rgb(8_9_10/0.9)]">
              <p className="label text-orange">Same floor. Different game.</p>
              <p className="font-display mt-3 text-[clamp(2.6rem,7vw,6rem)]">
                Every system
                <br />
                is a court<span className="text-orange">.</span>
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
