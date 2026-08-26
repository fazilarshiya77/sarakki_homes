import { MapPin } from "lucide-react";

export function PropertyMap({ mapQuery, location }: { mapQuery: string; location: string }) {
  // A property saved without a Google Maps location (CRM field is
  // optional) left `mapQuery` empty — that rendered an iframe pointed at
  // `?q=&output=embed`, a request that always aborts/fails and shows a
  // blank grey box. Fall back to the location string, which still
  // produces a real (if less precise) map; only give up entirely if
  // there's truly nothing to query.
  const query = mapQuery.trim() || location.trim();

  return (
    <div>
      <h2 className="font-display text-2xl">Location</h2>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
        <MapPin size={14} />
        {location}
      </p>
      {query && (
        <div className="mt-5 overflow-hidden rounded-md border border-border">
          <iframe
            title={`Map showing ${location}`}
            src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`}
            className="h-80 w-full grayscale-[15%]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}
    </div>
  );
}
