"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { BedDouble, Bath, Heart, MapPin, Ruler } from "lucide-react";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import type { Property } from "@/lib/data";

export function PropertyCard({ property }: { property: Property }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="group overflow-hidden rounded-lg border border-border bg-card shadow-soft transition-all duration-500 hover:-translate-y-1.5 hover:shadow-soft-lg"
    >
      <Link href={`/properties/${property.slug}`}>
        <div className="relative h-64 overflow-hidden">
          <motion.div
            className="relative h-full w-full"
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {property.image ? (
              <Image
                src={property.image}
                alt={property.title}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <MediaPlaceholder tone={property.gallery[0]} className="h-full w-full" />
            )}
          </motion.div>
          <span className="absolute left-4 top-4 rounded-pill bg-background/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.06em] text-foreground backdrop-blur-sm">
            {property.type}
          </span>
          <button
            aria-label="Save property"
            onClick={(e) => e.preventDefault()}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground transition-colors duration-300 hover:text-accent-gold-dark"
          >
            <Heart size={16} />
          </button>
        </div>

        <div className="p-8">
          <h3 className="font-display text-xl leading-snug">{property.title}</h3>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin size={14} />
            {property.location}
          </p>

          <div className="mt-6 flex items-center gap-5 border-t border-border pt-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <BedDouble size={15} /> {property.beds}
            </span>
            <span className="flex items-center gap-1.5">
              <Bath size={15} /> {property.baths}
            </span>
            <span className="flex items-center gap-1.5">
              <Ruler size={15} /> {property.area}
            </span>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="font-display text-2xl text-foreground">{property.price}</p>
            <span className="text-sm font-semibold text-accent-gold-dark transition-transform duration-300 group-hover:translate-x-1">
              View Details →
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
