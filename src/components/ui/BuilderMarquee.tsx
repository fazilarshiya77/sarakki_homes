"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from "framer-motion";
import { PARTNER_BUILDERS } from "@/lib/data";

// Full cycle (list A fully replaced by list B) target duration — calm,
// financial-news-ticker pace, not breaking news.
const CYCLE_SECONDS = 42;
const HOVER_SPEED_FACTOR = 0.3;

/**
 * Sarakki Homes' signature bottom ticker — a persistent, brand-credibility
 * strip naming every builder the client works with. Always pinned to the
 * viewport bottom (`position: fixed`), on top of whatever is scrolled
 * beneath it — including the footer.
 *
 * Previously this handed off to normal document flow right before the
 * footer so the ticker would never cover footer content. That was
 * deliberately reversed here: the ticker now stays stuck through the
 * footer too, per explicit direction to always keep it visible.
 */
export function BuilderMarquee() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const speedRef = useRef(0);
  const halfWidthRef = useRef(0);

  // Admin/auth screens are a separate application surface, not the
  // marketing site this ticker brands — never render there.
  const hidden = pathname?.startsWith("/admin") ?? false;

  // Measure the (single-copy) track width so the loop wraps at exactly
  // half the doubled track — a real seamless loop, not a visible reset.
  useEffect(() => {
    if (reduceMotion || hidden) return;
    const measure = () => {
      const full = trackRef.current?.scrollWidth ?? 0;
      halfWidthRef.current = full / 2;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [reduceMotion, hidden]);

  // Manual rAF-driven loop (not a CSS/Framer keyframe tween) is what makes
  // the hover slow-down smooth rather than an abrupt stop or a jarring
  // duration-change snap — speed eases toward its target every frame.
  useAnimationFrame((_, delta) => {
    if (reduceMotion || halfWidthRef.current === 0) return;
    const basePxPerSec = halfWidthRef.current / CYCLE_SECONDS;
    const target = hovered ? basePxPerSec * HOVER_SPEED_FACTOR : basePxPerSec;
    speedRef.current += (target - speedRef.current) * Math.min(1, delta / 500);
    let next = x.get() - speedRef.current * (delta / 1000);
    if (next <= -halfWidthRef.current) next += halfWidthRef.current;
    x.set(next);
  });

  if (hidden) return null;

  const doubled = [...PARTNER_BUILDERS, ...PARTNER_BUILDERS];

  return (
    <div
      role="region"
      aria-label="Partner builders Sarakki Homes works with"
      className="fixed inset-x-0 bottom-0 z-30 border-y border-accent-gold/40 bg-[#241E19] shadow-[0_-6px_18px_rgba(0,0,0,0.18)]"
    >
      <div
        className="flex h-10 items-center overflow-hidden md:h-11"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="hidden shrink-0 items-center gap-2 self-stretch border-r border-accent-gold/25 bg-[#241E19] px-4 sm:flex md:px-6">
          <span className="h-1 w-1 shrink-0 rounded-full bg-accent-gold" aria-hidden />
          <span className="whitespace-nowrap font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-gold">
            Partner Builders
          </span>
        </div>

        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#241E19] to-transparent md:w-16" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#241E19] to-transparent md:w-16" />

          {reduceMotion ? (
            <div
              className="flex items-center gap-6 overflow-x-auto px-6 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              tabIndex={0}
              aria-label="Partner builder list, scroll horizontally"
            >
              {PARTNER_BUILDERS.map((name) => (
                <span
                  key={name}
                  className="whitespace-nowrap font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[#F6F3EE] md:text-[11.5px]"
                >
                  {name}
                </span>
              ))}
            </div>
          ) : (
            <motion.div ref={trackRef} style={{ x }} className="flex w-max items-center will-change-transform">
              {doubled.map((name, i) => (
                <span key={`${name}-${i}`} className="flex items-center gap-6 px-3">
                  <span className="whitespace-nowrap font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[#F6F3EE] md:text-[11.5px]">
                    {name}
                  </span>
                  <span className="h-1 w-1 shrink-0 rounded-full bg-accent-gold/70" aria-hidden />
                </span>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
