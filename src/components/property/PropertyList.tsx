"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { PropertyListItem } from "@/components/property/PropertyListItem";
import { EmptyState } from "@/components/property/EmptyState";
import type { Property } from "@/lib/data";

const PAGE_SIZE = 8;

/** List-layout counterpart to PropertyGrid — same lazy-load-on-scroll
 *  pagination, rows instead of a card grid. */
export function PropertyList({
  properties,
  onReset,
}: {
  properties: Property[];
  onReset: () => void;
}) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [prevProperties, setPrevProperties] = useState(properties);
  if (properties !== prevProperties) {
    setPrevProperties(properties);
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
    return <EmptyState onReset={onReset} />;
  }

  const visible = properties.slice(0, visibleCount);
  const hasMore = visibleCount < properties.length;

  return (
    <div>
      <div className="border-t border-border">
        {visible.map((property) => (
          <PropertyListItem key={property.id} property={property} />
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
