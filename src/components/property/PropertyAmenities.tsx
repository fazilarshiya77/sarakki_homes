import { Check } from "lucide-react";

export function PropertyAmenities({ amenities }: { amenities: string[] }) {
  return (
    <div>
      <h2 className="font-display text-2xl">Amenities</h2>
      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        {amenities.map((amenity) => (
          <div key={amenity} className="flex items-center gap-2.5 text-sm text-foreground/85">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-accent-gold-dark">
              <Check size={13} strokeWidth={2.5} />
            </span>
            {amenity}
          </div>
        ))}
      </div>
    </div>
  );
}
