"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BankAuctionCard } from "@/components/property/BankAuctionCard";
import { AuctionEmptyState } from "@/components/property/AuctionEmptyState";
import type { AuctionProperty } from "@/lib/auctionHelpers";

const PAGE_SIZE = 9;

export function BankAuctionGrid({ properties, onReset }: { properties: AuctionProperty[]; onReset: () => void }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [prev, setPrev] = useState(properties);
  if (properties !== prev) {
    setPrev(properties);
    setVisibleCount(PAGE_SIZE);
  }

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((c) => Math.min(c + PAGE_SIZE, properties.length));
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [properties.length]);

  if (properties.length === 0) {
    return <AuctionEmptyState onReset={onReset} />;
  }

  const visible = properties.slice(0, visibleCount);
  const hasMore = visibleCount < properties.length;

  return (
    <div>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((property) => (
          <BankAuctionCard key={property.id} property={property} />
        ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center pt-16">
          <motion.div
            className="h-1.5 w-1.5 rounded-full bg-accent-gold"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      )}
    </div>
  );
}
