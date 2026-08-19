"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  PropertyFilters,
  DEFAULT_FILTERS,
  type FilterState,
} from "@/components/property/PropertyFilters";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { PropertyList } from "@/components/property/PropertyList";
import { BUDGET_RANGES, type Property } from "@/lib/data";

export function PropertyExplorer({ properties }: { properties: Property[] }) {
  // Pre-fill the category filter from ?category=<slug> so the header's
  // Properties dropdown lands on an already-filtered grid, not just the
  // generic listing page. An unrecognized slug just yields an empty grid —
  // PropertyGrid's EmptyState already handles that.
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    category: searchParams.get("category") ?? "",
  });

  const filtered = useMemo(() => {
    const budget = BUDGET_RANGES[filters.budgetIndex];
    let result = properties.filter((p) => {
      if (filters.location && !p.location.startsWith(filters.location)) return false;
      if (filters.category && p.categorySlug !== filters.category) return false;
      if (p.priceValueLakh < budget.min || p.priceValueLakh > budget.max) return false;
      return true;
    });

    if (filters.sort === "price-asc") {
      result = [...result].sort((a, b) => a.priceValueLakh - b.priceValueLakh);
    } else if (filters.sort === "price-desc") {
      result = [...result].sort((a, b) => b.priceValueLakh - a.priceValueLakh);
    }

    return result;
  }, [properties, filters]);

  const locations = useMemo(
    () => Array.from(new Set(properties.map((p) => p.location.split(",")[0]))).sort(),
    [properties]
  );

  return (
    <div className="flex flex-col gap-10">
      <PropertyFilters
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        locations={locations}
      />
      {filters.view === "list" ? (
        <PropertyList properties={filtered} onReset={() => setFilters(DEFAULT_FILTERS)} />
      ) : (
        <PropertyGrid properties={filtered} onReset={() => setFilters(DEFAULT_FILTERS)} />
      )}
    </div>
  );
}
