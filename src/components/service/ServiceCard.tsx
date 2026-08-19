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

// Same card-system palette as PropertyCard/PropertyListItem.
const CARD = { bg: "#F7F3EA", border: "#DDD5C5", text: "#17231F", textSecondary: "#6F756F" };

/**
 * Editorial service/category card — brought into the same card-object
 * language as PropertyCard (bordered ivory box, rounded corners on the
 * image only) rather than the earlier "content floats on the page
 * background" style.
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
        {/* Glow — same "light behind a luxury object" treatment as
            PropertyCard, tinted per-category via --accent. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-4 -z-10 rounded-2xl opacity-0 blur-[25px] transition-opacity duration-[400ms] ease-out group-hover:opacity-100"
          style={{
            background: "radial-gradient(circle, color-mix(in srgb, var(--accent) 22%, transparent) 0%, transparent 70%)",
          }}
        />

        <div
          className="relative overflow-hidden rounded-lg transition-all duration-[350ms] ease-out group-hover:-translate-y-2"
          style={{
            backgroundColor: CARD.bg,
            border: `1px solid ${CARD.border}`,
            boxShadow: "0 1px 2px rgba(23,35,31,0.04), 0 12px 28px rgba(23,35,31,0.06)",
          }}
        >
          <div className={featured ? "relative aspect-[16/11] overflow-hidden" : "relative aspect-[4/5] overflow-hidden"}>
            {photo ? (
              <Image
                src={photo}
                alt={category.title}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035]"
              />
            ) : (
              <MediaPlaceholder
                tone={category.tone}
                className="absolute inset-0 h-full w-full transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035]"
              />
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />

            <span
              className="absolute left-0 top-0 z-10 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-background"
              style={{ backgroundColor: "var(--accent)" }}
            >
              {label}
            </span>
          </div>

          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <h3
                className={featured ? "font-display text-2xl leading-snug md:text-3xl" : "font-display text-xl leading-snug"}
                style={{ color: CARD.text }}
              >
                {category.title}
              </h3>
              <ArrowUpRight
                size={18}
                className="mt-1 shrink-0 text-accent-gold-dark opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
              />
            </div>
            <p
              className={featured ? "mt-2 line-clamp-2 max-w-md text-sm leading-relaxed" : "mt-2 line-clamp-2 text-sm leading-relaxed"}
              style={{ color: CARD.textSecondary }}
            >
              {category.description}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
