"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { COMMISSION_STRUCTURE } from "@/lib/data";
import { cn } from "@/lib/utils";

const MotionLink = motion(Link);

// Client-provided business terms — see COMMISSION_STRUCTURE in lib/data.ts.
// Do not alter the percentages or wording rendered here.
export function CommissionStructure() {
  return (
    <Section id="commission-structure" className="bg-surface">
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          <RevealOnScroll className="lg:col-span-5">
            <Eyebrow>Pricing &amp; Brokerage</Eyebrow>
            <h2 className="mt-5 font-display text-4xl font-medium leading-[1.08] tracking-[-0.01em] text-foreground md:text-5xl">
              Our Commission Structure
            </h2>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-muted-foreground">
              Transparent terms, published plainly — no hidden brokerage, no
              surprises at closing.
            </p>
          </RevealOnScroll>

          <div className="lg:col-span-7">
            <div className="flex flex-col border-t border-border/70">
              {COMMISSION_STRUCTURE.map((entry, i) => (
                <RevealOnScroll key={entry.slug} delay={i * 0.06}>
                  <MotionLink
                    href={`/services/${entry.slug}`}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    className={cn(
                      "group relative grid grid-cols-1 items-baseline gap-3 border-b border-border/70 py-8 transition-colors duration-300 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8",
                      entry.featured ? "bg-accent-gold/[0.05]" : "hover:bg-foreground/[0.02]"
                    )}
                  >
                    <div className="flex items-start gap-5 sm:gap-8">
                      <span className="pt-1 font-body text-xs font-semibold tabular-nums tracking-[0.08em] text-muted-foreground/60 sm:text-sm">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-display text-xl font-medium leading-snug text-foreground md:text-2xl">
                            {entry.category} {entry.categorySuffix}
                          </h3>
                          {entry.featured && (
                            <span className="rounded-pill border border-accent-gold/40 bg-accent-gold/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-accent-gold-dark">
                              Sarakki Homes Advantage
                            </span>
                          )}
                        </div>
                        {entry.note && (
                          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                            {entry.note}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-end gap-3 pl-10 sm:flex-col sm:items-end sm:gap-1 sm:pl-0 sm:text-right">
                      <span className="font-body text-4xl font-bold leading-none tracking-tight tabular-nums text-accent-emerald transition-transform duration-500 group-hover:scale-[1.03] md:text-5xl">
                        {entry.figure}
                      </span>
                      {entry.basis && (
                        <span className="text-xs text-muted-foreground">{entry.basis}</span>
                      )}
                    </div>

                    <ArrowUpRight
                      size={16}
                      strokeWidth={1.75}
                      className="pointer-events-none absolute right-0 top-8 text-accent-gold-dark opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 sm:hidden"
                    />
                  </MotionLink>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
