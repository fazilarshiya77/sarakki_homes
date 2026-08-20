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
        className="object-cover opacity-[0.14]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface/92 to-surface" />

      <Container className="relative z-10 max-w-4xl">
        <RevealOnScroll className="text-center">
          <Eyebrow className="justify-center">Frequently Asked</Eyebrow>
          <h2 className="mt-5 font-display text-4xl font-medium leading-[1.08] tracking-[-0.01em] text-foreground md:text-5xl">
            Questions, answered plainly.
          </h2>
        </RevealOnScroll>

        <RevealOnScroll delay={0.1} className="mt-20 flex flex-col">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={faq.question} className="border-b border-border/70">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="group flex w-full items-center justify-between gap-8 py-7 text-left"
                  aria-expanded={isOpen}
                >
                  <span
                    className={cn(
                      "font-display text-xl font-medium leading-snug transition-colors duration-300 md:text-2xl",
                      isOpen ? "text-accent-emerald" : "text-foreground group-hover:text-accent-emerald"
                    )}
                  >
                    {faq.question}
                  </span>
                  <Plus
                    size={18}
                    strokeWidth={1.75}
                    className={cn(
                      "shrink-0 text-muted-foreground transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      isOpen && "rotate-45 text-accent-gold"
                    )}
                  />
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
                      <p className="max-w-2xl pb-8 text-base leading-relaxed text-muted-foreground">
                        {faq.answer}
                      </p>
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
