"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ArrowUpRight } from "lucide-react";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import { cn } from "@/lib/utils";
import type { Property } from "@/lib/data";

/**
 * The one reusable property card — homepage, listing, category pages,
 * related properties, search results all render this component; only
 * the data changes.
 *
 * v3: rebuilt as an actual bordered card object (ivory fill, warm-beige
 * border, rounded top corners on the image) rather than the previous
 * "content floats on the page background under a hairline rule" style —
 * that read as too flat/disconnected, no catalogue object to look at.
 *
 * Palette is the client's exact card-system spec — kept as local
 * constants rather than folded into the site-wide design tokens, since
 * the values are close to but not identical to `--background`/
 * `--surface`/`--border` (which are used well beyond cards).
 *
 * Hover interaction, same architecture as the rest of this card family:
 *  - `motion.article` only ever animates the scroll-in reveal
 *    (opacity/y via whileInView) — never hover.
 *  - The inner `.group` div owns the hover lift via a plain CSS
 *    transition. Putting hover-lift on the Framer-controlled element
 *    would fight it — Framer writes `transform` as an inline style for
 *    its own y-offset, silently overriding a Tailwind hover:-translate-y
 *    class on that same node (hit and fixed once already this session,
 *    see CollagePhoto.tsx).
 *  - The glow is its own absolutely-positioned, negative-inset sibling
 *    BEHIND the card (lower z-index) — light bleeding out from under a
 *    luxury object, not a border or ring around it.
 */

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

// Featured-property variant (separate from the default card palette
// above) — client-specified in an earlier request, unchanged here.
const FEATURED = {
  card: "#123F38",
  text: "#F5F1E8",
  secondaryText: "#C9C3B7",
  price: "#D2B46A",
  border: "rgba(198,161,91,0.25)",
  glow: "rgba(198,161,91,0.20)",
};

export function PropertyCard({ property }: { property: Property }) {
  const isFeatured = property.featured;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="group relative">
        {/* Glow — blurred radial wash behind the card, off by default. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-4 -z-10 rounded-2xl opacity-0 blur-[25px] transition-opacity duration-[400ms] ease-out group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle, ${isFeatured ? FEATURED.glow : CARD.glow} 0%, transparent 70%)`,
          }}
        />

        {/* Card object — border + fill, rounded corners, soft neutral
            shadow that deepens (never darkens toward black) on hover.
            Lift lives here too, isolated from the entrance animation. */}
        <div
          className="relative overflow-hidden rounded-lg transition-all duration-[350ms] ease-out group-hover:-translate-y-2"
          style={{
            backgroundColor: isFeatured ? FEATURED.card : CARD.bg,
            border: `1px solid ${isFeatured ? FEATURED.border : CARD.border}`,
            boxShadow: "0 1px 2px rgba(23,35,31,0.04), 0 12px 28px rgba(23,35,31,0.06)",
          }}
        >
          <div className="relative aspect-[4/5] overflow-hidden">
            {property.image ? (
              <Image
                src={property.image}
                alt={property.title}
                fill
                sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035]"
              />
            ) : (
              <MediaPlaceholder tone={property.gallery[0]} className="h-full w-full" />
            )}
            {/* Bottom gradient so the category badge stays legible over
                any photo. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent" />

            <span
              className="absolute left-0 top-0 z-20 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
              style={{ backgroundColor: CARD.brand, color: CARD.bg }}
            >
              {property.type}
            </span>

            {/* Favorite — small translucent circle over the image, gold
                only once actively pressed (kept as a hover cue here
                since there's no persisted "saved" state yet). */}
            <button
              aria-label="Save property"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="absolute right-3.5 top-3.5 z-20 flex h-8 w-8 items-center justify-center rounded-full text-white backdrop-blur-sm transition-all duration-300 hover:text-accent-gold active:text-accent-gold"
              style={{ backgroundColor: "rgba(255,255,255,0.20)", border: "1px solid rgba(255,255,255,0.35)" }}
            >
              <Heart size={14} />
            </button>
          </div>

          {/* Info area — the "premium property catalogue" section this
              redesign is really about: title -> price -> location ->
              specs -> CTA, all clamped to fixed line counts so no card
              grows taller than its neighbors over long text. */}
          <div
            className={cn(
              "p-5 transition-colors duration-[350ms] ease-out",
              // Inline `style` always wins over a Tailwind class at equal
              // specificity, so the featured card's fixed dark fill is
              // set inline (it never changes on hover) while the default
              // card's bg + hover-tint are plain classes instead —
              // setting both on the same element would make the
              // group-hover class dead code, silently overridden.
              !isFeatured && "bg-[#F7F3EA] group-hover:bg-[#EEE7DA]"
            )}
            style={isFeatured ? { backgroundColor: FEATURED.card } : undefined}
          >
            <h3
              className="line-clamp-1 font-display text-xl leading-snug"
              style={{ color: isFeatured ? FEATURED.text : CARD.text }}
            >
              {property.title}
            </h3>
            <p
              className="mt-1 line-clamp-1 text-sm"
              style={{ color: isFeatured ? FEATURED.secondaryText : CARD.textSecondary }}
            >
              {property.location}
            </p>

            {property.subFlats && property.subFlats.length > 0 ? (
              <p
                className="mt-3 line-clamp-1 text-xs uppercase tracking-[0.08em]"
                style={{ color: isFeatured ? FEATURED.secondaryText : CARD.textSecondary }}
              >
                {property.subFlats.length} Configurations · From {property.subFlats[0].area}
              </p>
            ) : (
              <p
                className="mt-3 line-clamp-1 text-xs uppercase tracking-[0.08em]"
                style={{ color: isFeatured ? FEATURED.secondaryText : CARD.textSecondary }}
              >
                {property.beds} BHK · {property.area}
              </p>
            )}

            <div
              className="mt-4 flex items-center justify-between border-t pt-4"
              style={{ borderColor: isFeatured ? FEATURED.border : CARD.border }}
            >
              {/* Prices are UI/metadata, not editorial content — Manrope
                  per the typography spec, kept bold/tight-tracked so it
                  still reads as the strongest thing on the card. */}
              <p
                className="font-body text-xl font-bold tracking-tight"
                style={{ color: isFeatured ? FEATURED.price : CARD.brand }}
              >
                {property.subFlats && property.subFlats.length > 0
                  ? `From ${property.subFlats[0].price}`
                  : property.priceRange || property.price}
              </p>

              <span
                className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-transform duration-300 group-hover:translate-x-1"
                style={{ color: CARD.gold }}
              >
                View
                <ArrowUpRight size={14} />
              </span>
            </div>
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
