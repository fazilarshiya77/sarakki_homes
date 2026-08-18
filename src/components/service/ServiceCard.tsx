"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
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

// A per-category accent restrained toward the brand palette — Forest and
// Gold in varying weight/tint, rather than an arbitrary jewel-tone map.
// Keyed by slug rather than the shared `tone` field on CATEGORIES, since
// that only has 4 values and repeats across categories (not enough
// variety for six distinct cards).
const ACCENTS: Record<string, string> = {
  "bank-auctions": "#C6A15B",
  "rental-income": "#083C35",
  "chance-deals": "#A8874F",
  resale: "#0E6B5C",
  "upcoming-projects": "#052C27",
  "ready-to-move": "#766F65",
};

const LISTING_LABELS: Record<string, string> = {
  "bank-auctions": "3 Vetted Listings",
  "rental-income": "3 Yield Assets",
  "chance-deals": "2 Off-Market Deals",
  resale: "3 Verified Resales",
  "upcoming-projects": "2 RERA Projects",
  "ready-to-move": "6 Ready Homes",
};

/**
 * Editorial service/category card — restyled to match the PropertyCard
 * reference pattern: image-first, content sits directly on the page
 * background below it (no card box, no shadow), separated by a single
 * hairline rule. Hover state is an image scale + moving arrow, not a
 * lift-and-shadow "floating card" motion.
 */
export function ServiceCard({ slug, featured = false }: { slug: string; featured?: boolean }) {
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) return null;
  const accent = ACCENTS[slug] ?? "#C6A15B";
  const label = LISTING_LABELS[slug] ?? "Vetted Listings";
  const photo = CATEGORY_PHOTO[slug];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/services/${category.slug}`}
        style={{ "--accent": accent } as React.CSSProperties}
        className="group relative block"
      >
        <div
          className={`relative overflow-hidden ${
            featured ? "aspect-[16/11]" : "aspect-[4/5]"
          }`}
        >
          {photo ? (
            <Image
              src={photo}
              alt={category.title}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
            />
          ) : (
            <MediaPlaceholder
              tone={category.tone}
              className="absolute inset-0 h-full w-full transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
            />
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          <span
            className="absolute left-0 top-0 z-10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-background"
            style={{ backgroundColor: "var(--accent)" }}
          >
            {label}
          </span>
        </div>

        {/* Content sits directly on the page background, no card box — a
            single hairline rule is the only separator. */}
        <div className="border-t border-border pt-5">
          <div className="flex items-start justify-between gap-4">
            <h3
              className={`font-display leading-snug text-foreground ${
                featured ? "text-3xl md:text-4xl" : "text-2xl"
              }`}
            >
              {category.title}
            </h3>
            <ArrowUpRight
              size={20}
              className="mt-1 shrink-0 text-accent-gold-dark opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
            />
          </div>
          <p
            className={`mt-3 leading-relaxed text-muted-foreground ${
              featured ? "max-w-md text-base" : "text-sm"
            }`}
          >
            {category.description}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
