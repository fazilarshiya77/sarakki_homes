"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

// Cinematic easing — slow, weighted, no overshoot. Reused for every motion
// value in this component so the whole reveal reads as one deliberate
// gesture rather than several unrelated animations firing at once.
const CINEMATIC_EASE = [0.22, 1, 0.36, 1] as const;

interface LampProps {
  children: React.ReactNode;
  className?: string;
  /** Primary light color — the architectural glow and the thin line beneath it. */
  glowColor?: string;
  /** Warm core color at the very center of the glow, used sparingly. */
  glowCoreColor?: string;
  /** Base surface the light sits on. */
  backgroundColor?: string;
  /** Secondary dark tone — a subtle center-to-edge gradient partner for `backgroundColor`, giving the surface depth rather than a flat fill. */
  backgroundColorSecondary?: string;
  /** 0–1. Scales opacity/blur of every glow layer — dial down for restraint. */
  intensity?: number;
  /** Optional textural photo behind the glow — kept barely visible, tinted to the palette, never competing with the light or the content. */
  backgroundImage?: string;
  /** 0–1. How visible `backgroundImage` is before the depth/vignette layers mute it further. Default keeps it a whisper. */
  backgroundImageOpacity?: number;
}

/**
 * A reusable "architectural light" atmosphere — a soft twin-cone glow
 * converging on a point above its children, in the spirit of the Aceternity
 * Lamp but deliberately de-neoned: heavily diffused, low-opacity, warm.
 * Colors are entirely prop-driven; this component carries no Sarakki-
 * specific content or copy — see WhySarakkiHomes.tsx for that.
 */
export function Lamp({
  children,
  className,
  glowColor = "#C4A66B",
  glowCoreColor = "#D8C18D",
  backgroundColor = "#241E19",
  backgroundColorSecondary = "#332C26",
  intensity = 1,
  backgroundImage,
  backgroundImageOpacity = 0.16,
}: LampProps) {
  const reduceMotion = useReducedMotion();
  const collapsed = { width: "10rem" };
  const expanded = { width: "24rem" };
  const initial = reduceMotion ? expanded : collapsed;
  const transition = { duration: reduceMotion ? 0 : 1.1, ease: CINEMATIC_EASE };

  return (
    <div
      className={cn(
        "relative z-0 flex w-full flex-col items-center justify-center overflow-hidden pt-32 md:pt-44",
        className
      )}
      style={{ backgroundColor }}
    >
      {/* Textural photo, kept to a whisper — grayscale so it never fights
          the champagne palette, and layered under the gradients below so
          they mute it further rather than sitting on top and washing it out. */}
      {backgroundImage && (
        // eslint-disable-next-line @next/next/no-img-element -- decorative background photo, not a next/image candidate (arbitrary aspect, no LCP concerns this far down the page)
        <img
          src={backgroundImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 z-0 h-full w-full object-cover grayscale"
          style={{ opacity: backgroundImageOpacity * intensity }}
        />
      )}

      {/* Depth wash — the secondary dark-chocolate tone breathes in gently
          around the center before the vignette pulls the edges back to the
          base espresso, so the surface reads as a room, not a flat fill. */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: `radial-gradient(ellipse 70% 55% at 50% 15%, ${backgroundColorSecondary} 0%, transparent 65%)`,
        }}
      />
      {/* Dark vignette — pulls the edges back into shadow so the glow reads
          as a lit fixture in a room, not a full-bleed wash. */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 20%, transparent 0%, ${backgroundColor} 75%)`,
        }}
      />

      <div className="relative isolate z-0 flex w-full flex-1 items-center justify-center">
        {/* Left cone */}
        <motion.div
          initial={initial}
          whileInView={expanded}
          viewport={{ once: true }}
          transition={transition}
          style={{
            backgroundImage: `conic-gradient(from 70deg at center top, ${glowColor}, transparent, transparent)`,
            opacity: 0.35 * intensity,
          }}
          className="absolute inset-auto right-1/2 h-56 w-[24rem] overflow-visible blur-2xl"
        >
          <div
            className="absolute bottom-0 left-0 z-20 h-24 w-full [mask-image:linear-gradient(to_top,white,transparent)]"
            style={{ backgroundColor }}
          />
          <div
            className="absolute bottom-0 left-0 z-20 h-full w-32 [mask-image:linear-gradient(to_right,white,transparent)]"
            style={{ backgroundColor }}
          />
        </motion.div>

        {/* Right cone (mirrored) */}
        <motion.div
          initial={initial}
          whileInView={expanded}
          viewport={{ once: true }}
          transition={transition}
          style={{
            backgroundImage: `conic-gradient(from 290deg at center top, transparent, transparent, ${glowColor})`,
            opacity: 0.35 * intensity,
          }}
          className="absolute inset-auto left-1/2 h-56 w-[24rem] overflow-visible blur-2xl"
        >
          <div
            className="absolute bottom-0 right-0 z-20 h-full w-32 [mask-image:linear-gradient(to_left,white,transparent)]"
            style={{ backgroundColor }}
          />
          <div
            className="absolute bottom-0 right-0 z-20 h-24 w-full [mask-image:linear-gradient(to_top,white,transparent)]"
            style={{ backgroundColor }}
          />
        </motion.div>

        {/* Base cover — settles the cones' lower edge back into the surface. */}
        <div className="absolute inset-auto z-30 h-36 w-full -translate-y-1/2" style={{ backgroundColor }} />

        {/* Warm core — a diffused wash sitting behind the heading. */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.5 * intensity }}
          viewport={{ once: true }}
          transition={{ duration: reduceMotion ? 0 : 1.4, ease: CINEMATIC_EASE, delay: reduceMotion ? 0 : 0.2 }}
          className="absolute inset-auto z-30 h-32 w-[26rem] -translate-y-14 rounded-full blur-[80px]"
          style={{ backgroundColor: glowCoreColor }}
        />

        {/* Thin architectural light line — the "brass inlay" seam. */}
        <motion.div
          initial={initial}
          whileInView={expanded}
          viewport={{ once: true }}
          transition={transition}
          className="absolute inset-auto z-40 h-px -translate-y-[3.5rem]"
          style={{ backgroundColor: glowColor, opacity: 0.7 * intensity }}
        />
      </div>

      <div className="relative z-40 -mt-10 flex flex-col items-center px-5 pb-16 md:-mt-14 md:pb-20">
        {children}
      </div>
    </div>
  );
}
