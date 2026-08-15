"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { AUCTION_JOURNEY } from "@/lib/data";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const AUTOPLAY_MS = 5200;

export function AuctionJourney() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const step = AUCTION_JOURNEY[active];
  const StepIcon = step.icon;
  const total = AUCTION_JOURNEY.length;

  const goTo = (i: number) => {
    setDirection(i > active ? 1 : -1);
    setActive(i);
  };

  // Gentle autoplay — a quiet "the journey keeps moving" cue rather than a
  // decoration. Pauses on any user interaction and respects reduced motion.
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pauseForInteraction = () => {
    setPaused(true);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setPaused(false), 9000);
  };

  useEffect(() => {
    if (reduceMotion || paused) return;
    const timer = setInterval(() => {
      setDirection(1);
      setActive((i) => (i + 1) % total);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [reduceMotion, paused, total]);

  useEffect(() => () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  }, []);

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: reduceMotion ? 0 : dir * 28 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: reduceMotion ? 0 : dir * -28 }),
  };

  return (
    <Section id="journey" className="bg-background">
      <Container>
        <RevealOnScroll className="max-w-2xl">
          <Eyebrow>The Bank Auction Journey</Eyebrow>
          <h2 className="mt-4 font-display text-4xl leading-[1.1] tracking-[-0.01em] md:text-5xl">
            Six steps. Zero guesswork.
          </h2>
        </RevealOnScroll>

        <RevealOnScroll delay={0.1} className="mt-20">
          <div className="relative">
            <div className="absolute left-0 right-0 top-12 h-px bg-border md:top-14" />
            <motion.div
              className="absolute left-0 top-12 h-px origin-left bg-accent-gold md:top-14"
              animate={{ width: `${(active / (total - 1)) * 100}%` }}
              transition={{ duration: 0.6, ease: EASE }}
            />
            {/* A small comet of light travels the completed portion of the
                line — a quiet "in motion" cue that reads as alive without
                competing with the content. */}
            {!reduceMotion && (
              <motion.div
                className="absolute top-12 h-2 w-2 -translate-y-1/2 rounded-full bg-accent-gold shadow-[0_0_10px_2px_rgba(196,166,107,0.55)] md:top-14"
                animate={{ left: `${(active / (total - 1)) * 100}%` }}
                transition={{ duration: 0.6, ease: EASE }}
                style={{ marginLeft: -4 }}
              />
            )}

            <div className="relative grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
              {AUCTION_JOURNEY.map((item, i) => (
                <button
                  key={item.title}
                  onClick={() => {
                    goTo(i);
                    pauseForInteraction();
                  }}
                  aria-current={i === active}
                  className="group flex flex-col items-center"
                >
                  <span className="relative flex h-24 w-24 items-center justify-center md:h-28 md:w-28">
                    {i === active && !reduceMotion && (
                      <motion.span
                        className="absolute inset-0 rounded-full bg-accent-gold/40"
                        animate={{ scale: [1, 1.28, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                    <AnimatePresence>
                      {i <= active && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.6 }}
                          transition={{ type: "spring", stiffness: 340, damping: 30 }}
                          className="absolute inset-0 rounded-full"
                          style={{
                            background:
                              "radial-gradient(circle at 32% 28%, #F6E7BE 0%, #E3C98F 26%, #C4A66B 55%, #9C7C43 100%)",
                            boxShadow:
                              "0 12px 28px rgba(139,111,63,0.4), inset 0 1.5px 2px rgba(255,255,255,0.55), inset 0 -4px 8px rgba(94,72,34,0.4)",
                            border: "1px solid rgba(139,111,63,0.6)",
                          }}
                        />
                      )}
                    </AnimatePresence>

                    {/* A band of light sweeps diagonally across the plate on
                        a loop — real gold catching light — cascading step to
                        step rather than firing in unison. */}
                    {i <= active && !reduceMotion && (
                      <motion.span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-full mix-blend-overlay"
                        style={{
                          backgroundImage:
                            "linear-gradient(115deg, transparent 25%, rgba(255,255,255,0.85) 45%, rgba(255,255,255,0.2) 52%, transparent 68%)",
                          backgroundSize: "300% 300%",
                        }}
                        animate={{ backgroundPosition: ["120% -20%", "-20% 120%"] }}
                        transition={{
                          duration: 1.5,
                          ease: "easeInOut",
                          repeat: Infinity,
                          repeatDelay: 3.6,
                          delay: i * 0.22,
                        }}
                      />
                    )}
                    <span
                      className={cn(
                        "relative flex h-24 w-24 items-center justify-center rounded-full px-3 text-center transition-all duration-300 group-hover:-translate-y-1 md:h-28 md:w-28",
                        i > active &&
                          "border border-border bg-gradient-to-br from-[#FCFBF9] to-[#EFE9E0] shadow-[0_4px_14px_rgba(20,20,20,0.06)] group-hover:border-accent-gold-dark/50"
                      )}
                    >
                      <span
                        className={cn(
                          "font-display text-[0.8rem] font-semibold leading-tight tracking-[0.01em] md:text-[0.9rem]",
                          i <= active ? "text-[#3B2A12]" : "text-muted-foreground group-hover:text-foreground/80"
                        )}
                        style={
                          i <= active
                            ? { textShadow: "0 1px 0 rgba(255,255,255,0.4), 0 -1px 0 rgba(60,40,10,0.35)" }
                            : undefined
                        }
                      >
                        {item.title}
                      </span>
                    </span>

                    <AnimatePresence>
                      {i < active && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.4, rotate: -90 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0.4 }}
                          transition={{ duration: 0.3, ease: EASE }}
                          className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-[#3B2A12] text-accent-gold shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
                        >
                          <Check size={13} strokeWidth={3} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative mt-16 overflow-hidden rounded-md bg-surface">
            {/* Oversized ghost numeral — a restrained, premium watermark
                that reinforces "which step" without adding new copy. */}
            <span
              aria-hidden
              className="pointer-events-none absolute -right-4 -top-10 select-none font-display text-[10rem] leading-none text-foreground/[0.035] md:text-[13rem]"
            >
              {String(active + 1).padStart(2, "0")}
            </span>

            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={active}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: EASE }}
                className="relative flex flex-col items-start gap-6 p-10 md:flex-row md:items-center"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.7, rotate: reduceMotion ? 0 : -12 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 0.45, ease: EASE, delay: 0.05 }}
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-sm bg-accent-gold/15 text-accent-gold-dark"
                >
                  <StepIcon size={26} strokeWidth={1.75} />
                </motion.div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-accent-gold-dark">
                    Step {String(active + 1).padStart(2, "0")} of {total}
                  </p>
                  <h3 className="mt-2 font-display text-2xl">{step.title}</h3>
                  <p className="mt-2 max-w-xl text-base leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="relative flex items-center justify-between gap-4 border-t border-border/60 px-10 py-5">
              <button
                onClick={() => {
                  goTo(active === 0 ? total - 1 : active - 1);
                  pauseForInteraction();
                }}
                aria-label="Previous step"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300 hover:-translate-x-0.5 hover:border-accent-gold-dark hover:text-accent-gold-dark"
              >
                <ArrowLeft size={15} />
              </button>

              <div className="flex items-center gap-1.5">
                {AUCTION_JOURNEY.map((item, i) => (
                  <span
                    key={item.title}
                    className={cn(
                      "h-1 rounded-full bg-accent-gold transition-all duration-500",
                      i === active ? "w-6 opacity-100" : "w-1.5 opacity-25"
                    )}
                  />
                ))}
              </div>

              <button
                onClick={() => {
                  goTo((active + 1) % total);
                  pauseForInteraction();
                }}
                aria-label="Next step"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300 hover:translate-x-0.5 hover:border-accent-gold-dark hover:text-accent-gold-dark"
              >
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </RevealOnScroll>
      </Container>
    </Section>
  );
}
