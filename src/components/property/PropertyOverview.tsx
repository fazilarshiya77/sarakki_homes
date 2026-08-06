import { BedDouble, Bath, MapPin, Ruler } from "lucide-react";
import type { Property } from "@/lib/data";

export function PropertyOverview({ property }: { property: Property }) {
  return (
    <div>
      <span className="rounded-pill bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.06em] text-accent-gold-dark">
        {property.type}
      </span>
      <h1 className="mt-4 font-display text-3xl leading-[1.1] tracking-[-0.01em] md:text-4xl">
        {property.title}
      </h1>
      <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
        <MapPin size={15} />
        {property.location}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-6 border-y border-border py-5 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <BedDouble size={16} /> {property.beds} Bedrooms
        </span>
        <span className="flex items-center gap-2">
          <Bath size={16} /> {property.baths} Bathrooms
        </span>
        <span className="flex items-center gap-2">
          <Ruler size={16} /> {property.area}
        </span>
      </div>

      <p className="mt-6 max-w-2xl text-base leading-relaxed text-foreground/85">
        {property.description}
      </p>
    </div>
  );
}
