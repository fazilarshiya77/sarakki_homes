"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Lamp } from "@/components/ui/lamp";
import { Container } from "@/components/ui/Container";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { PILLARS } from "@/lib/data";

// v2 brand palette: Champagne Gold (was the CRM's espresso/gold hex,
// reused here by mistake — the public site and CRM are meant to have
// entirely separate token systems, see CLAUDE.md).
const GOLD = "#C6A15B";
const CINEMATIC_EASE = [0.22, 1, 0.36, 1] as const;

export function WhySarakkiHomes() {
  return (
    <section id="why-sarakki-homes" className="relative">
      <Lamp
        backgroundColor="#052C27"
        backgroundColorSecondary="#083C35"
        glowColor={GOLD}
        glowCoreColor="#DCC28C"
        backgroundImage="/trust.jfif"
        backgroundImageOpacity={0.32}
      >
        <RevealOnScroll y={16} className="max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: GOLD }}>
            Why Sarakki Homes
          </p>
          <h2
            className="mt-5 font-accent text-5xl leading-[1.08] tracking-[-0.01em] md:text-6xl"
            style={{ color: "#F6F3EE" }}
          >
            We sell trust before property.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed md:text-lg" style={{ color: "rgba(246,243,238,0.68)" }}>
            Every engagement runs on the same four pillars, from the first
            conversation to the final registration.
          </p>
        </RevealOnScroll>
      </Lamp>

      {/* Same dark surface continues beneath the Lamp so the journey below
          reads as part of the same lit room, not a new section. The photo
          continues here too, at the same visible-but-quiet opacity, so the
          two halves read as one continuous background rather than a seam. */}
      <div className="relative overflow-hidden" style={{ backgroundColor: "#052C27" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative background photo, matches the treatment in Lamp */}
        <img
          src="/trust.jfif"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 z-0 h-full w-full object-cover opacity-[0.24] grayscale"
          style={{ filter: "sepia(0.3) saturate(1.1)" }}
        />
        <div
          className="absolute inset-0 z-0"
          style={{ background: "radial-gradient(ellipse 90% 70% at 50% 0%, transparent 0%, #052C27 55%)" }}
        />
        {/* pb kept small deliberately: the next section (AuctionJourney)
            already opens with its own Section wrapper's pt-24/pt-36 — the
            old pb-24/pb-36 here stacked on top of that and doubled the gap
            at this one seam to ~288-384px versus every other section
            transition on the page. */}
        <Container className="relative z-10 pb-12 md:pb-20">
          <TrustJourney />
        </Container>
      </div>
    </section>
  );
}

function TrustJourney() {
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div>
      {/* ==================== DESKTOP: horizontal journey ==================== */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.16, delayChildren: 0.15 } } }}
        className="relative hidden md:grid md:grid-cols-4 md:gap-8"
      >
        {/* Base connecting line — draws in left to right, then sits as a
            faint brass inlay for the whole row. */}
        <motion.div
          className="absolute left-[12.5%] right-[12.5%] top-6 h-px origin-left"
          style={{ backgroundColor: GOLD, opacity: 0.22 }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: reduceMotion ? 0 : 1.1, ease: CINEMATIC_EASE, delay: reduceMotion ? 0 : 0.1 }}
        />

        {/* Per-segment hover highlight — brightens the stretch of line
            leading out of whichever step is currently hovered. */}
        {PILLARS.slice(0, -1).map((_, i) => {
          const left = ((2 * i + 1) / 8) * 100;
          const right = 100 - ((2 * (i + 1) + 1) / 8) * 100;
          return (
            <div
              key={i}
              className="pointer-events-none absolute top-6 h-px transition-opacity duration-500"
              style={{
                left: `${left}%`,
                right: `${right}%`,
                backgroundColor: GOLD,
                opacity: hovered === i ? 0.9 : 0,
              }}
            />
          );
        })}

        {PILLARS.map((pillar, i) => (
          <PillarItem
            key={pillar.title}
            index={i}
            pillar={pillar}
            isHovered={hovered === i}
            onHoverStart={() => setHovered(i)}
            onHoverEnd={() => setHovered(null)}
          />
        ))}
      </motion.div>

      {/* ==================== MOBILE: vertical journey ==================== */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } } }}
        className="flex flex-col items-center gap-3 md:hidden"
      >
        {PILLARS.map((pillar, i) => (
          <div key={pillar.title} className="flex w-full max-w-sm flex-col items-center">
            <PillarItem index={i} pillar={pillar} isHovered={false} mobile />
            {i < PILLARS.length - 1 && (
              <ChevronDown size={16} strokeWidth={1.5} className="my-1" style={{ color: `${GOLD}66` }} />
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function PillarItem({
  index,
  pillar,
  isHovered,
  onHoverStart,
  onHoverEnd,
  mobile = false,
}: {
  index: number;
  pillar: (typeof PILLARS)[number];
  isHovered: boolean;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  mobile?: boolean;
}) {
  const Icon = pillar.icon;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: CINEMATIC_EASE } },
      }}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      className={mobile ? "relative z-10 flex flex-col items-center px-6 py-5 text-center" : "relative z-10 flex flex-col items-center px-2 pt-0 text-center"}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: `${GOLD}99` }}>
        Step {String(index + 1).padStart(2, "0")}
      </p>

      <div
        className="mt-5 flex h-14 w-14 items-center justify-center rounded-full border transition-all duration-500"
        style={{
          borderColor: isHovered ? GOLD : "rgba(196,166,107,0.45)",
          backgroundColor: "rgba(196,166,107,0.05)",
          boxShadow: isHovered ? `0 0 22px ${GOLD}33` : "0 0 0px transparent",
        }}
      >
        <Icon
          size={22}
          strokeWidth={1.5}
          style={{ color: GOLD, opacity: isHovered ? 1 : 0.85 }}
          className="transition-opacity duration-500"
        />
      </div>

      <h3
        className="mt-5 font-display text-xl transition-transform duration-300"
        style={{ color: "#F6F3EE", transform: isHovered ? "translateY(-2px)" : "translateY(0px)" }}
      >
        {pillar.title}
      </h3>
      <p
        className="mt-3 max-w-[15rem] text-sm leading-relaxed transition-colors duration-500"
        style={{ color: isHovered ? "rgba(246,243,238,0.85)" : "rgba(246,243,238,0.6)" }}
      >
        {pillar.description}
      </p>
    </motion.div>
  );
}
