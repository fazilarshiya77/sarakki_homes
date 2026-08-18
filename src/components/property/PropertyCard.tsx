"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ArrowUpRight } from "lucide-react";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import type { Property } from "@/lib/data";

/**
 * Image-first, editorial property card — v2 brand direction.
 *
 * Previously: a bordered, rounded, drop-shadowed white box (the generic
 * "SaaS card" pattern repeated for every property/service/testimonial on
 * the site). Now: a tall photograph carries the weight, content sits
 * below on the page's own background with no card chrome of its own —
 * separation comes from a single hairline rule, not a border+shadow+
 * radius stack. Hover state is an image scale + a moving arrow, not a
 * lift-and-shadow "floating card" motion.
 *
 * The whole card is a single click target via an absolutely-positioned
 * `<Link>` layered UNDER the save button (not wrapping it) — a `<button>`
 * inside an `<a>` is invalid HTML (interactive-in-interactive) and
 * breaks keyboard nav/screen readers, per this project's established
 * convention (see PropertyWizard.tsx / CLAUDE.md).
 */
export function PropertyCard({ property }: { property: Property }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        {property.image ? (
          <Image
            src={property.image}
            alt={property.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
          />
        ) : (
          <MediaPlaceholder tone={property.gallery[0]} className="h-full w-full" />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <span className="absolute left-0 top-0 z-20 bg-accent-emerald px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-background">
          {property.type}
        </span>

        <button
          aria-label="Save property"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/25 text-white backdrop-blur-sm transition-all duration-300 hover:border-accent-gold/60 hover:text-accent-gold"
        >
          <Heart size={15} />
        </button>
      </div>

      {/* Content sits directly on the page background, no card box — a
          single hairline rule is the only separator, matching the
          "restrained borders, not floating cards" brand direction. */}
      <div className="border-t border-border pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-display text-2xl leading-snug text-foreground">{property.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{property.location}</p>
          </div>
          <ArrowUpRight
            size={20}
            className="mt-1 shrink-0 text-accent-gold-dark opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
          />
        </div>

        {property.subFlats && property.subFlats.length > 0 ? (
          <div className="mt-4 space-y-1.5">
            {property.subFlats.slice(0, 3).map((flat, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {flat.beds} BHK · {flat.area}
                </span>
                <span className="font-semibold text-foreground">{flat.price}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-xs uppercase tracking-[0.08em] text-muted-foreground">
            {property.beds} Bed · {property.baths} Bath · {property.area}
          </p>
        )}

        <p className="mt-4 font-display text-xl font-semibold text-foreground">
          {property.priceRange || property.price}
        </p>
      </div>

      <Link
        href={`/properties/${property.slug}`}
        className="absolute inset-0 z-10"
        aria-label={`View details for ${property.title}`}
      />
    </motion.article>
  );
}
