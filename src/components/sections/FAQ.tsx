"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { FAQS } from "@/lib/data";
import { cn } from "@/lib/utils";

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq" className="relative overflow-hidden bg-surface !pt-12 md:!pt-16">
      {/* Was a completely flat bg-surface fill — read as plain/empty next
          to every other section's photography. A quiet architectural photo
          sits behind the copy, heavily washed toward the section's own
          ivory tone so the dark question/answer text stays fully readable;
          it's texture and atmosphere, not a competing visual. */}
      <Image
        src="/media/sections/ready-to-move.jpg"
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="object-cover opacity-[0.14] blur-sm scale-105"
      />
      {/* scale-105 hides the soft blurred edge blur-sm would otherwise
          reveal at the image's boundary. Wash back to the original
          strength — just a light blur to soften the photo's detail, not
          a heavier wash on top of it. */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface/92 to-surface" />

      <Container className="relative z-10 max-w-4xl">
        <RevealOnScroll className="text-center">
          <Eyebrow className="justify-center">Frequently Asked</Eyebrow>
          <h2 className="mt-5 font-display text-4xl font-medium leading-[1.08] tracking-[-0.01em] text-foreground md:text-5xl">
            Questions, answered plainly.
          </h2>
        </RevealOnScroll>

        <RevealOnScroll delay={0.1} className="mt-16 flex flex-col gap-4">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={faq.question}
                className={cn(
                  "rounded-xl border bg-card shadow-soft transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  isOpen ? "border-accent-gold/40 shadow-soft-lg" : "border-border/60 hover:border-accent-gold-dark/30 hover:shadow-soft-lg"
                )}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="group flex w-full items-center gap-5 px-6 py-6 text-left md:gap-6 md:px-8"
                  aria-expanded={isOpen}
                >
                  <span
                    className={cn(
                      "shrink-0 font-display text-sm tabular-nums transition-colors duration-300",
                      isOpen ? "text-accent-gold-dark" : "text-muted-foreground/50 group-hover:text-accent-gold-dark"
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <span
                    className={cn(
                      "flex-1 font-display text-xl font-medium leading-snug transition-colors duration-300 md:text-2xl",
                      isOpen ? "text-accent-emerald" : "text-foreground group-hover:text-accent-emerald"
                    )}
                  >
                    {faq.question}
                  </span>

                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      isOpen
                        ? "rotate-45 border-accent-gold bg-accent-gold text-foreground"
                        : "border-border text-muted-foreground group-hover:border-accent-gold-dark/40 group-hover:text-accent-gold-dark"
                    )}
                  >
                    <Plus size={16} strokeWidth={1.75} />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="flex gap-5 px-6 pb-7 md:gap-6 md:px-8">
                        <span className="w-[1.6rem] shrink-0" aria-hidden="true" />
                        <p className="max-w-2xl border-t border-border/60 pt-5 text-base leading-relaxed text-muted-foreground">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </RevealOnScroll>
      </Container>
    </Section>
  );
}
