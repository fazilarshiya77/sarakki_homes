"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { revealItemVariants } from "@/components/ui/RevealOnScroll";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import { CATEGORIES } from "@/lib/data";

// A distinct, muted jewel-tone accent per category — colorful but restrained,
// never a bright/saturated SaaS palette. Keyed by slug rather than the
// shared `tone` field on CATEGORIES, since that only has 4 values and
// repeats across categories (not enough variety for six distinct cards).
const ACCENTS: Record<string, string> = {
  "bank-auctions": "#B08D57",
  "rental-income": "#0E6B5C",
  "chance-deals": "#B5651D",
  resale: "#3D6E85",
  "upcoming-projects": "#7A3B5C",
  "ready-to-move": "#6E7F3D",
};

const MotionLink = motion(Link);

const LISTING_LABELS: Record<string, string> = {
  "bank-auctions": "3 Vetted Listings",
  "rental-income": "3 Yield Assets",
  "chance-deals": "2 Off-Market Deals",
  resale: "3 Verified Resales",
  "upcoming-projects": "2 RERA Projects",
  "ready-to-move": "6 Ready Homes",
};

export function ServiceCard({ slug }: { slug: string }) {
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) return null;
  const Icon = category.icon;
  const accent = ACCENTS[slug] ?? "#C4A66B";
  const label = LISTING_LABELS[slug] ?? "Vetted Listings";

  return (
    <motion.div variants={revealItemVariants} className="h-full">
      <MotionLink
        href={`/services/${category.slug}`}
        style={{ "--accent": accent } as React.CSSProperties}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-soft transition-all duration-500 hover:-translate-y-2 hover:border-[var(--accent)]/40 hover:shadow-soft-lg"
      >
        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          <MediaPlaceholder
            tone={category.tone}
            className="absolute inset-0 h-full w-full transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
          />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border backdrop-blur-sm transition-all duration-500 group-hover:scale-105"
              style={{ borderColor: `${accent}55`, backgroundColor: `${accent}1f` }}
            >
              <div className={`icon-${slug} transition-transform duration-500`}>
                <Icon size={26} strokeWidth={1.5} color={accent} />
              </div>
            </div>
          </div>
        </div>

        {/* Thin accent seam between image and content */}
        <span className="h-1 w-full bg-[var(--accent)] transition-all duration-500 group-hover:h-1.5" />

        <div className="relative flex flex-1 flex-col p-8">
          {/* Ambient Radial Hover Glow */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-[var(--accent)]/5 blur-3xl transition-opacity duration-500 opacity-0 group-hover:opacity-100" />

          <div className="relative z-10">
            <h3 className="font-display text-2xl tracking-wide text-foreground transition-colors duration-300 group-hover:text-accent-gold-dark">
              {category.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {category.description}
            </p>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-border/60 pt-5 relative z-10 text-xs font-semibold">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 group-hover:text-foreground/70 transition-colors">
              {label}
            </span>
            <div className="flex items-center gap-1.5 text-foreground group-hover:text-accent-gold-dark transition-colors">
              Explore Properties
              <ArrowUpRight
                size={15}
                className="transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </div>
          </div>
        </div>
      </MotionLink>
    </motion.div>
  );
}
