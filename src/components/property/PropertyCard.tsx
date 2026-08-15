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
      className="group relative overflow-hidden rounded-lg border border-border bg-card shadow-[0_1px_3px_rgba(20,20,20,0.06),0_20px_50px_rgba(20,20,20,0.09)] transition-all duration-500 hover:-translate-y-2 hover:border-accent-gold/30 hover:shadow-[0_1px_3px_rgba(20,20,20,0.08),0_30px_70px_rgba(20,20,20,0.16)]"
    >
      <div className="relative h-64 overflow-hidden">
        <div
          className="relative h-full w-full transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
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
        </div>
        <span className="absolute left-4 top-4 rounded-sm border border-white/10 bg-black/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white backdrop-blur-md">
          {property.type}
        </span>
        <button
          aria-label="Save property"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white backdrop-blur-md transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-110 hover:border-accent-gold/30 hover:text-accent-gold"
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

        {property.subFlats && property.subFlats.length > 0 ? (
          <div className="mt-6 border-t border-border pt-5 relative z-20">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-accent-gold-dark mb-3">Available Configurations</p>
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
              {property.subFlats.map((flat, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-sm bg-surface/30 p-2.5 border border-border/30 text-xs hover:bg-surface/50 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{flat.beds} BHK</span>
                    <span className="text-[10px] text-muted-foreground">{flat.area}</span>
                  </div>
                  <span className="font-display font-semibold text-foreground">{flat.price}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
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
        )}

        <div className="mt-6 flex items-center justify-between">
          <p className="font-display text-xl font-bold text-foreground">
            {property.priceRange || property.price}
          </p>
          <span className="text-sm font-semibold text-accent-gold-dark transition-transform duration-300 group-hover:translate-x-1">
            View Details →
          </span>
        </div>
      </div>

      <Link
        href={`/properties/${property.slug}`}
        className="absolute inset-0 z-10"
        aria-label={`View details for ${property.title}`}
      />
    </motion.article>
  );
}
