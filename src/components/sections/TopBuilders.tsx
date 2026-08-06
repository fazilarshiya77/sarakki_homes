"use client";

import { motion } from "framer-motion";
import { Container, Section } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { BUILDERS } from "@/lib/data";

export function TopBuilders() {
  const loop = [...BUILDERS, ...BUILDERS];

  return (
    <Section className="bg-surface">
      <Container>
        <RevealOnScroll className="text-center">
          <Eyebrow className="justify-center">Trusted Builder Network</Eyebrow>
          <h2 className="mt-4 font-display text-3xl tracking-[-0.01em] md:text-4xl">
            We work with Bengaluru&rsquo;s finest developers.
          </h2>
        </RevealOnScroll>
      </Container>

      <div className="relative mt-14 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <motion.div
          className="flex w-max items-center gap-16"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        >
          {loop.map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="whitespace-nowrap font-display text-2xl text-muted-foreground/60 transition-colors duration-300 hover:text-foreground"
            >
              {name}
            </span>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}
