"use client";

import { useState } from "react";
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
    <Section id="faq" className="bg-surface !pt-12 md:!pt-16">
      <Container className="max-w-4xl">
        <RevealOnScroll className="text-center">
          <Eyebrow className="justify-center">Frequently Asked</Eyebrow>
          <h2 className="mt-4 font-display text-4xl leading-[1.1] tracking-[-0.01em] md:text-5xl">
            Questions, answered plainly.
          </h2>
        </RevealOnScroll>

        <RevealOnScroll delay={0.1} className="mt-16 flex flex-col">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={faq.question} className="border-b border-border">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-display text-xl leading-snug">
                    {faq.question}
                  </span>
                  <Plus
                    size={20}
                    className={cn(
                      "shrink-0 text-accent-gold-dark transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      isOpen && "rotate-45"
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
                      <p className="max-w-2xl pb-6 text-base leading-relaxed text-muted-foreground">
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
