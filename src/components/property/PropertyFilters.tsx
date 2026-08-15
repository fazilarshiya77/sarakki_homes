"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { CATEGORIES, BUDGET_RANGES } from "@/lib/data";
import { cn } from "@/lib/utils";

// Bank Auction Properties live exclusively at /properties/bank-auctions —
// never mixed into this general listing/filter set.
const FILTERABLE_CATEGORIES = CATEGORIES.filter((c) => c.slug !== "bank-auctions");

export type SortOption = "relevant" | "price-asc" | "price-desc";

export interface FilterState {
  location: string;
  category: string;
  budgetIndex: number;
  sort: SortOption;
}

export const DEFAULT_FILTERS: FilterState = {
  location: "",
  category: "",
  budgetIndex: 0,
  sort: "relevant",
};

export function PropertyFilters({
  filters,
  onChange,
  resultCount,
  locations,
}: {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  resultCount: number;
  /** Derived from the live property set — see PropertyExplorer — rather
   *  than a fixed list, so it never offers a location with zero results. */
  locations: string[];
}) {
  const hasActiveFilters =
    filters.location || filters.category || filters.budgetIndex !== 0;

  const selectClass =
    "rounded-sm border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent-gold-dark md:w-auto w-full";

  return (
    <div className="-mx-6 border-b border-border bg-background/95 px-6 py-5 backdrop-blur-md md:mx-0 md:rounded-md md:border md:px-6 md:shadow-soft">
      <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <SlidersHorizontal size={16} className="text-accent-gold-dark" />
          Filters
        </div>

        <select
          className={selectClass}
          value={filters.location}
          onChange={(e) => onChange({ ...filters, location: e.target.value })}
        >
          <option value="">All Locations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value })}
        >
          <option value="">All Property Types</option>
          {FILTERABLE_CATEGORIES.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.title}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={filters.budgetIndex}
          onChange={(e) =>
            onChange({ ...filters, budgetIndex: Number(e.target.value) })
          }
        >
          {BUDGET_RANGES.map((range, i) => (
            <option key={range.label} value={i}>
              {range.label}
            </option>
          ))}
        </select>

        <div className="md:ml-auto flex items-center gap-3">
          <select
            className={selectClass}
            value={filters.sort}
            onChange={(e) =>
              onChange({ ...filters, sort: e.target.value as SortOption })
            }
          >
            <option value="relevant">Most Relevant</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={() => onChange(DEFAULT_FILTERS)}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>
      </div>

      <p
        className={cn(
          "mt-4 text-xs uppercase tracking-[0.1em] text-muted-foreground",
          "md:mt-3"
        )}
      >
        {resultCount} {resultCount === 1 ? "Property" : "Properties"} Found
      </p>
    </div>
  );
}
