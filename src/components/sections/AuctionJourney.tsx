"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Container, Section } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { AUCTION_JOURNEY } from "@/lib/data";
import { cn } from "@/lib/utils";

export function AuctionJourney() {
  const [active, setActive] = useState(0);
  const step = AUCTION_JOURNEY[active];
  const StepIcon = step.icon;

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
            <div className="absolute left-0 right-0 top-5 h-px bg-border" />
            <motion.div
              className="absolute left-0 top-5 h-px origin-left bg-accent-gold"
              animate={{
                width: `${(active / (AUCTION_JOURNEY.length - 1)) * 100}%`,
              }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
            <div className="relative grid grid-cols-2 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
              {AUCTION_JOURNEY.map((item, i) => (
                <button
                  key={item.title}
                  onClick={() => setActive(i)}
                  className="group flex flex-col items-center gap-4 text-center"
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-300",
                      i === active
                        ? "border-accent-gold bg-accent-gold text-foreground scale-110"
                        : i < active
                        ? "border-accent-gold bg-background text-accent-gold-dark"
                        : "border-border bg-background text-muted-foreground group-hover:border-accent-gold-dark"
                    )}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={cn(
                      "max-w-[9rem] text-xs font-medium leading-snug transition-colors duration-300",
                      i === active ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {item.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 flex flex-col items-start gap-6 rounded-md bg-surface p-10 md:flex-row md:items-center"
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-sm bg-accent-gold/15 text-accent-gold-dark">
              <StepIcon size={26} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-accent-gold-dark">
                Step {String(active + 1).padStart(2, "0")} of {AUCTION_JOURNEY.length}
              </p>
              <h3 className="mt-2 font-display text-2xl">{step.title}</h3>
              <p className="mt-2 max-w-xl text-base leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          </motion.div>
        </RevealOnScroll>
      </Container>
    </Section>
  );
}
