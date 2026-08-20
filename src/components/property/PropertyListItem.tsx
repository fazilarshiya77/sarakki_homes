"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import type { Property } from "@/lib/data";

// Same card-system palette as PropertyCard — kept as local constants
// there for the same reason (values close to but distinct from the
// site-wide background/surface/border tokens). Duplicated rather than
// shared to keep each card component self-contained.
const CARD = {
  bg: "#F7F3EA",
  bgHover: "#EEE7DA",
  border: "#DDD5C5",
  text: "#17231F",
  textSecondary: "#6F756F",
  brand: "#083C35",
  gold: "#C6A15B",
  glow: "rgba(198,161,91,0.18)",
};

/**
 * The list-layout counterpart to PropertyCard — same data, same card
 * system (ivory fill, warm-beige border, restrained hover glow), laid
 * out as a dense horizontal row for comparing many listings at once.
 * Toggled via PropertyFilters' grid/list control.
 */
export function PropertyListItem({ property }: { property: Property }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="group relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-3 -z-10 rounded-2xl opacity-0 blur-[22px] transition-opacity duration-[400ms] ease-out group-hover:opacity-100"
          style={{ background: `radial-gradient(circle, ${CARD.glow} 0%, transparent 70%)` }}
        />

        <div
          className="relative flex flex-col gap-5 overflow-hidden rounded-lg p-4 transition-all duration-[350ms] ease-out group-hover:-translate-y-1 sm:flex-row sm:items-center"
          style={{
            backgroundColor: CARD.bg,
            border: `1px solid ${CARD.border}`,
            boxShadow: "0 1px 2px rgba(23,35,31,0.04), 0 12px 28px rgba(23,35,31,0.06)",
          }}
        >
          <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-md sm:h-28 sm:w-40">
            {property.image ? (
              <Image
                src={property.image}
                alt={property.title}
                fill
                sizes="(min-width: 640px) 160px, 100vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035]"
              />
            ) : (
              <MediaPlaceholder tone={property.gallery[0]} className="h-full w-full" />
            )}
            <span
              className="absolute left-0 top-0 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em]"
              style={{ backgroundColor: CARD.brand, color: CARD.bg }}
            >
              {property.type}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <h3
              className="line-clamp-1 font-display text-xl leading-snug"
              style={{ color: CARD.text }}
            >
              {property.title}
            </h3>
            <p className="mt-1 line-clamp-1 text-sm" style={{ color: CARD.textSecondary }}>
              {property.location}
            </p>
            <p className="mt-1.5 text-xs uppercase tracking-[0.08em]" style={{ color: CARD.textSecondary }}>
              {property.beds} Bed · {property.baths} Bath · {property.area}
            </p>
          </div>

          <div
            className="flex shrink-0 items-center gap-6 border-t pt-4 sm:border-t-0 sm:border-l sm:pl-6 sm:pt-0"
            style={{ borderColor: CARD.border }}
          >
            <p className="font-body text-xl font-bold tracking-tight" style={{ color: CARD.brand }}>
              {property.priceRange || property.price}
            </p>
            <span
              className="hidden items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-transform duration-300 group-hover:translate-x-1 sm:flex"
              style={{ color: CARD.gold }}
            >
              View
              <ArrowUpRight size={14} />
            </span>
          </div>
        </div>

        <Link
          href={`/properties/${property.slug}`}
          className="absolute inset-0 z-10"
          aria-label={`View details for ${property.title}`}
        />
      </div>
    </motion.article>
  );
}
