import { MapPin } from "lucide-react";

export function PropertyMap({ mapQuery, location }: { mapQuery: string; location: string }) {
  return (
    <div>
      <h2 className="font-display text-2xl">Location</h2>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
        <MapPin size={14} />
        {location}
      </p>
      <div className="mt-5 overflow-hidden rounded-md border border-border">
        <iframe
          title={`Map showing ${location}`}
          src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
          className="h-80 w-full grayscale-[15%]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
