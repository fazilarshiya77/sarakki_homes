"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { revealItemVariants } from "@/components/ui/RevealOnScroll";
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

export function ServiceCard({ slug }: { slug: string }) {
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) return null;
  const Icon = category.icon;
  const accent = ACCENTS[slug] ?? "#C4A66B";

  return (
    <motion.div variants={revealItemVariants}>
      <MotionLink
        href={`/services/${category.slug}`}
        style={{ "--accent": accent } as React.CSSProperties}
        whileTap={{ y: -10, scale: 1.04 }}
        transition={{ type: "spring", stiffness: 420, damping: 22 }}
        className="group relative flex h-full flex-col justify-between overflow-hidden rounded-lg border border-border bg-card p-9 shadow-soft transition-all duration-500 hover:-translate-y-1.5 hover:shadow-soft-lg"
      >
        {/* Colored accent bar — gives each card an immediate, distinct
            identity at rest, not just on hover. */}
        <span className="absolute inset-x-0 top-0 h-1 bg-[var(--accent)]" />

        <div>
          <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-[var(--accent)]/12 text-[var(--accent)] transition-colors duration-500 group-hover:bg-[var(--accent)] group-hover:text-background">
            <Icon size={22} strokeWidth={1.75} />
          </div>
          <h3 className="mt-6 font-display text-xl">{category.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {category.description}
          </p>
        </div>
        <div className="mt-8 flex items-center gap-1.5 text-sm font-semibold text-foreground">
          Explore
          <ArrowUpRight
            size={16}
            className="transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
          />
        </div>
      </MotionLink>
    </motion.div>
  );
}
