"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { Counter } from "@/components/ui/Counter";
import { ButtonFX } from "@/components/ui/ButtonFX";
import { COMMISSION_STRUCTURE } from "@/lib/data";
import { cn } from "@/lib/utils";

// Not imported from @/lib/media — that module also exports a
// fs/path-based server helper (mediaFileExists), which would pull
// Node-only APIs into this "use client" component's browser bundle.
// Same value, just declared locally instead.
const HERO_POSTER = "/media/hero-poster.jpg";

const MotionLink = motion(Link);

// A figure is either a plain percentage ("2%") or prose ("No Brokerage").
// Only the numeric ones count up — text like "No Brokerage" gets its own
// entrance treatment instead (see the non-numeric branch below).
function parseFigure(figure: string): number | null {
  const match = figure.match(/^(\d+(?:\.\d+)?)%$/);
  return match ? Number(match[1]) : null;
}

// Client-provided business terms — see COMMISSION_STRUCTURE in lib/data.ts.
// Do not alter the percentages or wording rendered here.
export function CommissionStructure() {
  return (
    <Section id="commission-structure" className="relative overflow-hidden bg-surface">
      {/* Background photo — the same hero-poster image used up top, but
          treated completely differently here: cropped tighter, held
          static (no ken-burns), and washed under a heavy `--surface`
          gradient so it reads as texture behind the section rather than
          a second hero. Keeps every row's text at full contrast — the
          gradient is strongest exactly where the numbers/labels sit. */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <Image
          src={HERO_POSTER}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-[0.14]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(100deg, var(--surface) 0%, var(--surface) 38%, color-mix(in srgb, var(--surface) 55%, transparent) 68%, color-mix(in srgb, var(--surface) 78%, transparent) 100%)",
          }}
        />
        <div className="absolute inset-0" style={{ background: "var(--surface)", opacity: 0.35 }} />
      </div>

      <Container className="relative">
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
              {COMMISSION_STRUCTURE.map((entry, i) => {
                const numericFigure = parseFigure(entry.figure);

                return (
                  <motion.div
                    key={entry.slug}
                    initial={{ opacity: 0, y: 22, scale: 0.985 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{
                      duration: 0.6,
                      delay: i * 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="relative"
                  >
                    <MotionLink
                      href={`/services/${entry.slug}`}
                      whileTap={{ scale: 0.99 }}
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                      className={cn(
                        "btn-fx group relative grid grid-cols-1 items-baseline gap-3 overflow-hidden border-b border-border/70 py-8 pl-6 transition-colors duration-300 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8",
                        entry.featured ? "bg-accent-gold/[0.05]" : "hover:bg-foreground/[0.02]"
                      )}
                    >
                      {/* Left accent rule — draws in top-to-bottom on
                          scroll, a quiet "this row just arrived" cue
                          that also doubles as a hover-brightened spine
                          rather than a plain static border. */}
                      <motion.span
                        aria-hidden="true"
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.5, delay: i * 0.08 + 0.15, ease: [0.22, 1, 0.36, 1] }}
                        className={cn(
                          "absolute left-0 top-0 h-full w-[3px] origin-top transition-colors duration-300",
                          entry.featured
                            ? "bg-accent-gold"
                            : "bg-border/70 group-hover:bg-accent-gold-dark"
                        )}
                      />

                      {/* Premium shine + sparkle sweep, same interaction
                          language as every CTA button on the site
                          (DESIGN_SYSTEM.md §5) — brought here so this
                          list reads as a set of premium objects, not a
                          plain data table. */}
                      <ButtonFX />

                      <div className="flex items-start gap-5 sm:gap-8">
                        <motion.span
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true, amount: 0.3 }}
                          transition={{ duration: 0.4, delay: i * 0.08 + 0.1 }}
                          className="pt-1 font-body text-xs font-semibold tabular-nums tracking-[0.08em] text-muted-foreground sm:text-sm"
                        >
                          {String(i + 1).padStart(2, "0")}
                        </motion.span>
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="font-display text-xl font-medium leading-snug text-foreground md:text-2xl">
                              {entry.category} {entry.categorySuffix}
                            </h3>
                            {entry.featured && (
                              <motion.span
                                initial={{ opacity: 0, scale: 0.85 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ duration: 0.4, delay: i * 0.08 + 0.25, ease: [0.22, 1, 0.36, 1] }}
                                className="rounded-pill border border-accent-gold/40 bg-accent-gold/10 px-2.5 py-0.5 text-[14px] font-semibold uppercase tracking-[0.1em] text-accent-gold-dark"
                              >
                                Sarakki Homes Advantage
                              </motion.span>
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
                        {numericFigure !== null ? (
                          <Counter
                            value={numericFigure}
                            suffix="%"
                            className="font-body text-4xl font-bold leading-none tracking-tight tabular-nums text-accent-emerald transition-transform duration-500 group-hover:scale-[1.03] md:text-5xl"
                          />
                        ) : (
                          <motion.span
                            initial={{ opacity: 0, y: 8 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.5, delay: i * 0.08 + 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className="font-body text-3xl font-bold leading-none tracking-tight text-accent-emerald transition-transform duration-500 group-hover:scale-[1.03] md:text-4xl"
                          >
                            {entry.figure}
                          </motion.span>
                        )}
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
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
