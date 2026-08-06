"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealGroup, RevealOnScroll, revealItemVariants } from "@/components/ui/RevealOnScroll";
import { TESTIMONIALS } from "@/lib/data";

export function Testimonials() {
  return (
    <Section id="testimonials" className="bg-background">
      <Container>
        <RevealOnScroll className="max-w-2xl">
          <Eyebrow>Client Trust</Eyebrow>
          <h2 className="mt-4 font-display text-4xl leading-[1.1] tracking-[-0.01em] md:text-5xl">
            Words from families we&rsquo;ve guided.
          </h2>
        </RevealOnScroll>

        <RevealGroup className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <motion.figure
              key={t.name}
              variants={revealItemVariants}
              className="flex flex-col justify-between rounded-md border border-border bg-card p-8 shadow-soft transition-all duration-500 hover:-translate-y-1.5 hover:shadow-soft-lg"
            >
              <Quote className="text-accent-gold" size={28} strokeWidth={1.5} />
              <blockquote className="mt-6 flex-1 text-[17px] leading-relaxed text-foreground">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-8 border-t border-border pt-5">
                <p className="font-display text-lg">{t.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t.role}</p>
              </figcaption>
            </motion.figure>
          ))}
        </RevealGroup>
      </Container>
    </Section>
  );
}
