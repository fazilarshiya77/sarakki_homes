"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ArrowUpRight } from "lucide-react";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import type { Property } from "@/lib/data";

/**
 * Image-first, editorial property card — the single reusable card used
 * everywhere a property renders (homepage, listing, category pages,
 * related properties, search results). Only the data changes; the
 * design language does not.
 *
 * Hover interaction is deliberately layered across three separate
 * elements rather than one:
 *  - `motion.article` only ever animates the scroll-in reveal
 *    (opacity/y via whileInView). It never touches hover.
 *  - The inner `.group` div owns the hover lift via a plain CSS
 *    transition class. Putting hover-lift on the SAME element as
 *    Framer's reveal animation would fight it — Framer writes
 *    `transform` as an inline style for its own y-offset, which
 *    silently overrides a Tailwind hover:-translate-y class on that
 *    element (the exact bug already hit once in this codebase with
 *    CollagePhoto's rotate — see that component's comment).
 *  - The glow sits as its own absolutely-positioned, negative-inset
 *    sibling BEHIND the image/content stack (lower z-index), so it
 *    reads as light bleeding out from behind the card rather than a
 *    border/ring around it.
 */
export function PropertyCard({ property }: { property: Property }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="group relative">
        {/* Glow — a soft, blurred, low-opacity radial wash in the brand
            gold, sitting behind the card and bleeding slightly past its
            edges. Off by default; fades in slowly on hover. This is
            "light reflecting behind a luxury object," not a neon ring —
            kept subtle (18% peak opacity) and slow (700ms) on purpose. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-5 -z-10 rounded-[2rem] opacity-0 blur-2xl transition-opacity duration-700 ease-out group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 40%, rgba(198,161,91,0.35) 0%, rgba(198,161,91,0) 70%)",
          }}
        />

        {/* Lift — CSS-only, isolated from the entrance animation above. */}
        <div className="relative transition-transform duration-500 ease-out group-hover:-translate-y-2">
          <div className="relative aspect-[4/5] overflow-hidden">
            {property.image ? (
              <Image
                src={property.image}
                alt={property.title}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
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

          {/* Content sits directly on the page background, no card box —
              a single hairline rule is the only separator. Price leads
              (the number a buyer actually scans for first), title
              second — previously title led and price was buried last,
              same weight as the specs line beneath it. */}
          <div className="border-t border-border pt-5">
            <div className="flex items-start justify-between gap-4">
              <p className="font-display text-2xl font-semibold text-accent-emerald">
                {property.priceRange || property.price}
              </p>
              <ArrowUpRight
                size={20}
                className="mt-1.5 shrink-0 text-accent-gold-dark opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
              />
            </div>

            <h3 className="mt-2 font-display text-xl leading-snug text-foreground">{property.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{property.location}</p>

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
