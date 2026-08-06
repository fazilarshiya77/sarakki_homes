"use client";

import { motion } from "framer-motion";
import { Container, Section } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealGroup, RevealOnScroll, revealItemVariants } from "@/components/ui/RevealOnScroll";
import { PILLARS } from "@/lib/data";

export function WhySarakkiHomes() {
  return (
    <Section className="bg-accent-emerald text-background">
      <Container>
        <RevealOnScroll className="max-w-2xl">
          <Eyebrow light>Why Sarakki Homes</Eyebrow>
          <h2 className="mt-4 font-display text-4xl leading-[1.1] tracking-[-0.01em] md:text-5xl">
            We sell trust before property.
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-background/75">
            Every engagement runs on the same four pillars, from the first
            conversation to the final registration.
          </p>
        </RevealOnScroll>

        <RevealGroup className="relative mt-20 grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-4">
          <div className="absolute top-6 left-0 right-0 hidden h-px bg-background/15 md:block" />
          {PILLARS.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.div key={pillar.title} variants={revealItemVariants} className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-accent-gold/40 bg-accent-emerald text-accent-gold">
                  <Icon size={20} strokeWidth={1.75} />
                </div>
                <p className="mt-6 text-xs uppercase tracking-[0.14em] text-accent-gold/80">
                  Step {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 font-display text-2xl">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-background/70">
                  {pillar.description}
                </p>
              </motion.div>
            );
          })}
        </RevealGroup>
      </Container>
    </Section>
  );
}
