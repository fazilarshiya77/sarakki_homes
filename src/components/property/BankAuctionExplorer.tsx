"use client";

import { useMemo, useState } from "react";
import { BankAuctionFilters } from "@/components/property/BankAuctionFilters";
import { BankAuctionGrid } from "@/components/property/BankAuctionGrid";
import { BankAuctionList } from "@/components/property/BankAuctionList";
import { AUCTION_DEFAULT_FILTERS, filterAndSortAuctions } from "@/lib/auctionFilters";
import type { AuctionProperty } from "@/lib/auctionHelpers";

export function BankAuctionExplorer({ properties }: { properties: AuctionProperty[] }) {
  const [filters, setFilters] = useState(AUCTION_DEFAULT_FILTERS);

  const options = useMemo(() => {
    const locations = new Set<string>();
    const banks = new Set<string>();
    const types = new Set<string>();
    for (const p of properties) {
      locations.add(p.location.split(",")[0].trim());
      if (p.bank) banks.add(p.bank);
      types.add(p.propertyType);
    }
    return {
      locations: Array.from(locations).sort(),
      banks: Array.from(banks).sort(),
      propertyTypes: Array.from(types).sort(),
    };
  }, [properties]);

  const filtered = useMemo(() => filterAndSortAuctions(properties, filters), [properties, filters]);

  return (
    <div className="flex flex-col gap-10">
      <BankAuctionFilters filters={filters} onChange={setFilters} resultCount={filtered.length} options={options} />
      {filters.view === "grid" ? (
        <BankAuctionGrid properties={filtered} onReset={() => setFilters(AUCTION_DEFAULT_FILTERS)} />
      ) : (
        <BankAuctionList properties={filtered} onReset={() => setFilters(AUCTION_DEFAULT_FILTERS)} />
      )}
    </div>
  );
}
