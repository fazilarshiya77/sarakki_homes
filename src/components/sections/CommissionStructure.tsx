"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Container, Section } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealGroup, RevealOnScroll, revealItemVariants } from "@/components/ui/RevealOnScroll";
import { COMMISSION_STRUCTURE } from "@/lib/data";

const MotionLink = motion(Link);

// Client-provided business terms — see COMMISSION_STRUCTURE in lib/data.ts.
// Do not alter the percentages or wording rendered here.
export function CommissionStructure() {
  return (
    <Section id="commission-structure" className="bg-[#EFE9E0]">
      <Container>
        <RevealOnScroll className="max-w-2xl">
          <Eyebrow>Pricing &amp; Brokerage</Eyebrow>
          <h2 className="mt-4 font-display text-4xl leading-[1.1] tracking-[-0.01em] text-[#1C1C1C] md:text-5xl">
            Our Commission Structure
          </h2>
          <p className="mt-5 font-accent text-xl italic leading-relaxed text-[#67615B]">
            Transparent terms. No hidden brokerage.
          </p>
        </RevealOnScroll>

        <RevealGroup className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {COMMISSION_STRUCTURE.map((entry, i) => (
            <motion.div key={entry.slug} variants={revealItemVariants}>
              <MotionLink
                href={`/services/${entry.slug}`}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className={`group relative flex h-full flex-col overflow-hidden rounded-lg border bg-[#FCFBF9] p-8 shadow-soft transition-all duration-500 hover:-translate-y-1.5 hover:shadow-soft-lg ${
                  entry.featured
                    ? "border-[#C4A66B]/50 hover:border-[#C4A66B]"
                    : "border-border/60 hover:border-[#C4A66B]/40"
                }`}
              >
                {/* Ambient gold glow on hover */}
                <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-[#C4A66B]/8 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
 
                {/* Subtle warm wash for the featured card, always on — sets it apart at a glance without reading as a banner */}
                {entry.featured && (
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(196,166,107,0.07)_0%,transparent_60%)]" />
                )}
 
                <div className="relative z-10 flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1C1C1C]/30">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {entry.featured && (
                      <span className="rounded-pill border border-[#C4A66B]/40 bg-[#C4A66B]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4A66B]">
                        Sarakki Homes Advantage
                      </span>
                    )}
                  </div>
 
                  <h3 className="mt-5 font-display text-xl leading-snug text-[#1C1C1C]">
                    {entry.category}
                    <br />
                    {entry.categorySuffix}
                  </h3>
 
                  <div className="mt-7">
                    <span
                      className={`block font-display tabular-nums leading-none text-[#C4A66B] transition-transform duration-500 group-hover:scale-[1.03] ${
                        entry.featured ? "text-4xl md:text-[2.75rem]" : "text-5xl md:text-6xl"
                      }`}
                    >
                      {entry.figure}
                    </span>
                    {entry.basis && (
                      <span className="mt-2 block text-sm text-[#67615B]">{entry.basis}</span>
                    )}
                    {entry.note && (
                      <span className="mt-3 block text-sm leading-relaxed text-[#67615B]">
                        {entry.note}
                      </span>
                    )}
                  </div>
                </div>
 
                <span className="absolute inset-x-0 top-0 h-[3px] scale-x-0 bg-[#C4A66B] transition-transform duration-500 origin-left group-hover:scale-x-100" />
              </MotionLink>
            </motion.div>
          ))}
        </RevealGroup>
      </Container>
    </Section>
  );
}
