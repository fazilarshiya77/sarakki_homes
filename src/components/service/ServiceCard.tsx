"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { revealItemVariants } from "@/components/ui/RevealOnScroll";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import { CATEGORIES } from "@/lib/data";

// Card imagery, in order of preference:
//  1. A real photo of an actual Sarakki Homes property in that category
//     (preferred — it's genuinely ours).
//  2. A licensed architectural photograph for categories with no real
//     property photography yet.
// Either way these illustrate a *category*, not a specific listing, so
// nothing here can misrepresent a property to a buyer — individual
// property cards elsewhere still only ever show their own real photos.
const CATEGORY_PHOTO: Record<string, string> = {
  // Real Sarakki Homes properties:
  "upcoming-projects": "/media/properties/narayana-nagar/img1.jpg",
  "ready-to-move": "/media/properties/maya-indraprastha/img1.jpg",
  "rental-income": "/media/properties/hosa-road/img1.jpg",
  // Licensed stock, pending real photography:
  "bank-auctions": "/media/sections/bank-auctions.jpg",
  "chance-deals": "/media/sections/chance-deals.jpg",
  resale: "/media/sections/resale.jpg",
};

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
  const accent = ACCENTS[slug] ?? "#C4A66B";
  const label = LISTING_LABELS[slug] ?? "Vetted Listings";
  const photo = CATEGORY_PHOTO[slug];

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
          {photo ? (
            <Image
              src={photo}
              alt={category.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
            />
          ) : (
            <MediaPlaceholder
              tone={category.tone}
              className="absolute inset-0 h-full w-full transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
            />
          )}
          {/* The centred icon-in-a-translucent-circle that used to sit here
              has been removed. Once each card carries a real photograph,
              that chip stopped being a stand-in for missing art and became
              a badge obscuring the middle of the image — the exact
              stock-UI-kit look this page is trying to avoid. The photo
              alone now carries the card; the category is named directly
              underneath it. */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
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
