"use client";

import { useState } from "react";
import Image from "next/image";
import { NoPropertyImage } from "@/components/property/NoPropertyImage";
import { cn } from "@/lib/utils";

export function BankAuctionGallery({ images, propertyId, title }: { images: string[]; propertyId: string; title: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="h-[50vh] max-h-[480px] w-full overflow-hidden rounded-md">
        <NoPropertyImage propertyId={propertyId} />
      </div>
    );
  }

  return (
    <div>
      <div className="relative h-[50vh] max-h-[480px] w-full overflow-hidden rounded-md">
        <Image
          src={images[active]}
          alt={title}
          fill
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              className={cn(
                "relative h-16 overflow-hidden rounded-sm ring-2 ring-offset-2 ring-offset-background transition-all duration-300",
                i === active ? "ring-accent-gold" : "ring-transparent opacity-70 hover:opacity-100"
              )}
            >
              <Image src={src} alt="" fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
