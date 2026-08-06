"use client";

import { useMemo, useState } from "react";
import {
  PropertyFilters,
  DEFAULT_FILTERS,
  type FilterState,
} from "@/components/property/PropertyFilters";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { BUDGET_RANGES, type Property } from "@/lib/data";

export function PropertyExplorer({ properties }: { properties: Property[] }) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

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

  return (
    <div className="flex flex-col gap-10">
      <PropertyFilters
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
      />
      <PropertyGrid properties={filtered} onReset={() => setFilters(DEFAULT_FILTERS)} />
    </div>
  );
}
