"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import type { Property } from "@/lib/data";

/**
 * The list-layout counterpart to PropertyCard — same data, same editorial
 * language (hairline separators, no card-box chrome, price-forward
 * hierarchy, restrained hover), laid out as a dense horizontal row for
 * comparing many listings at once. Toggled via PropertyFilters' grid/list
 * control, same pattern already established on the bank-auctions page.
 */
export function PropertyListItem({ property }: { property: Property }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col gap-5 border-b border-border py-6 sm:flex-row sm:items-center"
    >
      <div className="relative h-48 w-full shrink-0 overflow-hidden sm:h-28 sm:w-40">
        {property.image ? (
          <Image
            src={property.image}
            alt={property.title}
            fill
            sizes="(min-width: 640px) 160px, 100vw"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          />
        ) : (
          <MediaPlaceholder tone={property.gallery[0]} className="h-full w-full" />
        )}
        <span className="absolute left-0 top-0 bg-accent-emerald px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-background">
          {property.type}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-display text-lg font-semibold text-accent-emerald">
          {property.priceRange || property.price}
        </p>
        <h3 className="mt-1 truncate font-display text-xl leading-snug text-foreground transition-colors duration-300 group-hover:text-accent-gold-dark">
          {property.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{property.location}</p>
        <p className="mt-2 text-xs uppercase tracking-[0.08em] text-muted-foreground">
          {property.beds} Bed · {property.baths} Bath · {property.area}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2 pt-1 text-xs font-semibold uppercase tracking-wider text-accent-gold-dark opacity-0 transition-all duration-300 sm:pt-0 group-hover:opacity-100">
        View Details
        <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>

      <Link
        href={`/properties/${property.slug}`}
        className="absolute inset-0"
        aria-label={`View details for ${property.title}`}
      />
    </motion.article>
  );
}
