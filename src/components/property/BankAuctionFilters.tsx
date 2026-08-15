"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react";
import {
  AUCTION_BUDGET_RANGES,
  AUCTION_DEFAULT_FILTERS,
  type AuctionFilterState,
} from "@/lib/auctionFilters";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

interface FilterOptions {
  locations: string[];
  banks: string[];
  propertyTypes: string[];
}

function FilterFields({
  filters,
  onChange,
  options,
}: {
  filters: AuctionFilterState;
  onChange: (f: AuctionFilterState) => void;
  options: FilterOptions;
}) {
  const selectClass =
    "w-full rounded-sm border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent-gold-dark md:w-auto";

  return (
    <>
      <div className="relative w-full md:w-64">
        <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search by ID, locality, bank…"
          className="w-full rounded-sm border border-border bg-background py-3 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-accent-gold-dark"
        />
      </div>

      <select className={selectClass} value={filters.location} onChange={(e) => onChange({ ...filters, location: e.target.value })}>
        <option value="">All Locations</option>
        {options.locations.map((loc) => (
          <option key={loc} value={loc}>{loc}</option>
        ))}
      </select>

      <select className={selectClass} value={filters.bank} onChange={(e) => onChange({ ...filters, bank: e.target.value })}>
        <option value="">All Banks</option>
        {options.banks.map((b) => (
          <option key={b} value={b}>{b}</option>
        ))}
      </select>

      <select className={selectClass} value={filters.propertyType} onChange={(e) => onChange({ ...filters, propertyType: e.target.value })}>
        <option value="">All Property Types</option>
        {options.propertyTypes.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <select
        className={selectClass}
        value={filters.budgetIndex}
        onChange={(e) => onChange({ ...filters, budgetIndex: Number(e.target.value) })}
      >
        {AUCTION_BUDGET_RANGES.map((range, i) => (
          <option key={range.label} value={i}>{range.label}</option>
        ))}
      </select>

      <select
        className={selectClass}
        value={filters.dateFilter}
        onChange={(e) => onChange({ ...filters, dateFilter: e.target.value as AuctionFilterState["dateFilter"] })}
      >
        <option value="">Any Auction Date</option>
        <option value="upcoming">Upcoming</option>
        <option value="this-week">This Week</option>
        <option value="this-month">This Month</option>
        <option value="past">Past Auctions</option>
      </select>

      <label className="flex w-full cursor-pointer items-center gap-2.5 rounded-sm border border-border bg-background px-4 py-3 text-sm text-foreground md:w-auto">
        <input
          type="checkbox"
          checked={filters.possessionOnly}
          onChange={(e) => onChange({ ...filters, possessionOnly: e.target.checked })}
          className="h-4 w-4 accent-accent-gold-dark"
        />
        Physical Possession Only
      </label>
    </>
  );
}

export function BankAuctionFilters({
  filters,
  onChange,
  resultCount,
  options,
}: {
  filters: AuctionFilterState;
  onChange: (f: AuctionFilterState) => void;
  resultCount: number;
  options: FilterOptions;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const hasActiveFilters =
    filters.search ||
    filters.location ||
    filters.bank ||
    filters.propertyType ||
    filters.budgetIndex !== 0 ||
    filters.dateFilter ||
    filters.possessionOnly;

  return (
    <div className="-mx-6 border-b border-border bg-background/95 px-6 py-5 backdrop-blur-md md:mx-0 md:rounded-md md:border md:px-6 md:shadow-soft">
      {/* Desktop: full horizontal filter bar */}
      <div className="hidden md:flex md:flex-wrap md:items-center md:gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <SlidersHorizontal size={16} className="text-accent-gold-dark" />
          Filters
        </div>
        <FilterFields filters={filters} onChange={onChange} options={options} />

        <div className="ml-auto flex items-center gap-3">
          <select
            className="rounded-sm border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent-gold-dark"
            value={filters.sort}
            onChange={(e) => onChange({ ...filters, sort: e.target.value as AuctionFilterState["sort"] })}
          >
            <option value="newest">Newest Auctions</option>
            <option value="auction-date">Auction Date</option>
            <option value="price-asc">Lowest Reserve Price</option>
            <option value="price-desc">Highest Reserve Price</option>
          </select>
          {hasActiveFilters && (
            <button
              onClick={() => onChange(AUCTION_DEFAULT_FILTERS)}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Mobile: trigger button */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-sm border border-border bg-background py-3 text-sm font-semibold text-foreground md:hidden"
      >
        <SlidersHorizontal size={16} className="text-accent-gold-dark" />
        Filters
        {hasActiveFilters && <span className="h-1.5 w-1.5 rounded-full bg-accent-gold-dark" />}
      </button>

      <div className="mt-4 flex items-center justify-between md:mt-4">
        <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
          {resultCount} Auction {resultCount === 1 ? "Property" : "Properties"}
        </p>
        <div className="flex items-center gap-1 rounded-sm border border-border p-1">
          <button
            onClick={() => onChange({ ...filters, view: "grid" })}
            aria-label="Grid view"
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-sm transition-colors",
              filters.view === "grid" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => onChange({ ...filters, view: "list" })}
            aria-label="List view"
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-sm transition-colors",
              filters.view === "list" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* Mobile filter drawer — slides up from the bottom */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[70] bg-foreground/50 backdrop-blur-sm md:hidden"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.45, ease: EASE }}
              className="fixed inset-x-0 bottom-0 z-[71] max-h-[85vh] overflow-y-auto rounded-t-lg border-t border-border bg-background p-6 shadow-soft-lg md:hidden"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl text-foreground">Filters</h3>
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close filters"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-surface hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-6 flex flex-col gap-4">
                <FilterFields filters={filters} onChange={onChange} options={options} />
                <select
                  className="w-full rounded-sm border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent-gold-dark"
                  value={filters.sort}
                  onChange={(e) => onChange({ ...filters, sort: e.target.value as AuctionFilterState["sort"] })}
                >
                  <option value="newest">Newest Auctions</option>
                  <option value="auction-date">Auction Date</option>
                  <option value="price-asc">Lowest Reserve Price</option>
                  <option value="price-desc">Highest Reserve Price</option>
                </select>
              </div>

              <div className="mt-6 flex gap-3">
                {hasActiveFilters && (
                  <button
                    onClick={() => onChange(AUCTION_DEFAULT_FILTERS)}
                    className="flex-1 rounded-sm border border-border py-3.5 text-sm font-semibold text-foreground"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="flex-1 rounded-sm bg-foreground py-3.5 text-sm font-semibold text-background"
                >
                  Show {resultCount} {resultCount === 1 ? "Property" : "Properties"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
