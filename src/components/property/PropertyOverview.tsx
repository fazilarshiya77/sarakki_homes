import { BedDouble, Bath, MapPin, Ruler } from "lucide-react";
import type { Property } from "@/lib/data";

export function PropertyOverview({ property }: { property: Property }) {
  return (
    <div className="space-y-6">
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
      </div>

      {!property.subFlats || property.subFlats.length === 0 ? (
        <div className="flex flex-wrap items-center gap-6 border-y border-border py-5 text-sm text-muted-foreground">
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
      ) : null}

      <p className="max-w-2xl text-base leading-relaxed text-[#4F5752]">
        {property.description}
      </p>

      {/* Project spec cards (for multiple flat configurations) */}
      {property.subFlats && property.subFlats.length > 0 && (
        <div className="pt-6 border-t border-border space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-accent-gold-dark">Project Parameters</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {property.landmark && (
              <div className="rounded-sm border border-border/80 bg-card/40 p-4">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Landmark</span>
                <p className="text-xs font-semibold text-foreground mt-1">{property.landmark}</p>
              </div>
            )}
            {property.approval && (
              <div className="rounded-sm border border-border/80 bg-card/40 p-4">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Approval</span>
                <p className="text-xs font-semibold text-foreground mt-1">{property.approval}</p>
              </div>
            )}
            {property.landArea && (
              <div className="rounded-sm border border-border/80 bg-card/40 p-4">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Land Area</span>
                <p className="text-xs font-semibold text-foreground mt-1">{property.landArea}</p>
              </div>
            )}
            {property.floors && (
              <div className="rounded-sm border border-border/80 bg-card/40 p-4">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Floors</span>
                <p className="text-xs font-semibold text-foreground mt-1">{property.floors}</p>
              </div>
            )}
            {property.totalFlats && (
              <div className="rounded-sm border border-border/80 bg-card/40 p-4">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Total Flats</span>
                <p className="text-xs font-semibold text-foreground mt-1">{property.totalFlats} units</p>
              </div>
            )}
            {property.blocks && (
              <div className="rounded-sm border border-border/80 bg-card/40 p-4">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Blocks</span>
                <p className="text-xs font-semibold text-foreground mt-1">{property.blocks}</p>
              </div>
            )}
            {property.availability && (
              <div className="rounded-sm border border-border/80 bg-card/40 p-4">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Availability</span>
                <p className="text-xs font-semibold text-emerald-600 mt-1">{property.availability} units left</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Configurations Table */}
      {property.subFlats && property.subFlats.length > 0 && (
        <div className="pt-6 border-t border-border space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-accent-gold-dark">Available Flat Configurations</h2>
          <div className="overflow-hidden rounded-sm border border-border bg-card/40">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-surface/50 text-muted-foreground font-semibold">
                  <th className="p-4 uppercase tracking-wider font-semibold">Configuration</th>
                  <th className="p-4 uppercase tracking-wider font-semibold">Super Built-up Area</th>
                  <th className="p-4 uppercase tracking-wider font-semibold">Base Price</th>
                </tr>
              </thead>
              <tbody>
                {property.subFlats.map((flat, idx) => (
                  <tr key={idx} className="border-b border-border/40 hover:bg-surface/10">
                    <td className="p-4 font-semibold text-foreground">{flat.beds} BHK Apartment</td>
                    <td className="p-4 font-mono text-muted-foreground">{flat.area}</td>
                    <td className="p-4 font-semibold text-foreground">{flat.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
