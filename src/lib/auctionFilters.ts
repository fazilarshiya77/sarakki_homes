import type { AuctionProperty } from "@/lib/auctionHelpers";

export type AuctionSortOption = "newest" | "auction-date" | "price-asc" | "price-desc";
export type AuctionView = "grid" | "list";
export type AuctionDateFilter = "" | "upcoming" | "this-week" | "this-month" | "past";

export interface AuctionFilterState {
  search: string;
  location: string;
  bank: string;
  propertyType: string;
  budgetIndex: number;
  dateFilter: AuctionDateFilter;
  possessionOnly: boolean;
  sort: AuctionSortOption;
  view: AuctionView;
}

export const AUCTION_DEFAULT_FILTERS: AuctionFilterState = {
  search: "",
  location: "",
  bank: "",
  propertyType: "",
  budgetIndex: 0,
  dateFilter: "",
  possessionOnly: false,
  sort: "newest",
  view: "grid",
};

export const AUCTION_BUDGET_RANGES = [
  { label: "Any Reserve Price", min: 0, max: Infinity },
  { label: "Under ₹50 Lakh", min: 0, max: 50 },
  { label: "₹50 Lakh – ₹1 Cr", min: 50, max: 100 },
  { label: "₹1 Cr – ₹2 Cr", min: 100, max: 200 },
  { label: "Above ₹2 Cr", min: 200, max: Infinity },
];

/** Reserve prices arrive as free-text rupee amounts (client data, Indian
 *  digit grouping — e.g. "2,70,84,000") rather than a structured number, so
 *  filtering/sorting by price parses the digits out at read time. Returns
 *  `null` for blank/unparseable values rather than guessing a number. */
export function parseReserveLakh(reservePrice?: string): number | null {
  if (!reservePrice) return null;
  const digits = reservePrice.replace(/[^0-9]/g, "");
  if (!digits) return null;
  const rupees = parseInt(digits, 10);
  if (!Number.isFinite(rupees) || rupees <= 0) return null;
  return rupees / 100000;
}

export function filterAndSortAuctions(
  properties: AuctionProperty[],
  filters: AuctionFilterState
): AuctionProperty[] {
  const budget = AUCTION_BUDGET_RANGES[filters.budgetIndex];
  const now = new Date();
  const search = filters.search.trim().toLowerCase();

  let result = properties.filter((p) => {
    if (search) {
      const haystack = `${p.title} ${p.propertyId} ${p.location} ${p.bank ?? ""} ${p.propertyType}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (filters.location && !p.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.bank && p.bank !== filters.bank) return false;
    if (filters.propertyType && p.propertyType !== filters.propertyType) return false;

    if (budget) {
      const lakh = parseReserveLakh(p.reservePrice);
      if (lakh === null) {
        if (filters.budgetIndex !== 0) return false; // unknown price excluded from any specific bucket
      } else if (lakh < budget.min || lakh > budget.max) {
        return false;
      }
    }

    if (filters.dateFilter && p.auctionDateISO) {
      const d = new Date(p.auctionDateISO);
      const days = (d.getTime() - now.getTime()) / 86_400_000;
      if (filters.dateFilter === "upcoming" && days < 0) return false;
      if (filters.dateFilter === "this-week" && (days < 0 || days > 7)) return false;
      if (filters.dateFilter === "this-month" && (days < 0 || days > 31)) return false;
      if (filters.dateFilter === "past" && days >= 0) return false;
    } else if (filters.dateFilter) {
      return false; // date filter active but property has no auction date
    }

    if (filters.possessionOnly && !p.physicalPossession) return false;

    return true;
  });

  result = [...result].sort((a, b) => {
    switch (filters.sort) {
      case "price-asc":
        return (parseReserveLakh(a.reservePrice) ?? Infinity) - (parseReserveLakh(b.reservePrice) ?? Infinity);
      case "price-desc":
        return (parseReserveLakh(b.reservePrice) ?? -Infinity) - (parseReserveLakh(a.reservePrice) ?? -Infinity);
      case "auction-date":
        return new Date(a.auctionDateISO ?? 0).getTime() - new Date(b.auctionDateISO ?? 0).getTime();
      case "newest":
      default:
        return new Date(b.createdAtISO).getTime() - new Date(a.createdAtISO).getTime();
    }
  });

  return result;
}
