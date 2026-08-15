// Client-safe bank-auction helpers — types and pure functions only, ZERO
// database/Prisma imports. src/lib/auctions.ts (the Prisma-backed data
// layer) imports these, not the other way around.
//
// Why this file exists: several bank-auction client components
// (BankAuctionCard, BankAuctionListItem, AuctionEnquiryPanel) need
// `buildAuctionWhatsAppLink` and the `AuctionProperty`/`AuctionStatus`
// types. Those used to live in auctions.ts alongside `import { prisma }`,
// which meant every client bundle that imported the WhatsApp-link
// function also pulled in Prisma's browser stub — breaking the
// production build with "Module not found: .prisma/client/index-browser"
// (Prisma Client only ever generates a Node target, not a browser one).

export type AuctionStatusTone = "gold" | "emerald" | "muted";

export interface AuctionStatus {
  label: string;
  tone: AuctionStatusTone;
}

export interface AuctionProperty {
  id: string;
  propertyId: string;
  slug: string;
  title: string;
  /** Optional — only present once the admin has filled in auction details. */
  bank?: string;
  location: string;
  propertyType: string;
  area?: string;
  areaSqft?: number;
  reservePrice?: string;
  emd?: string;
  /** ISO string, for sorting/filtering. */
  auctionDateISO?: string;
  auctionDateDisplay?: string;
  physicalPossession?: boolean;
  description: string;
  images: string[];
  status: string;
  derivedStatus: AuctionStatus | null;
  createdAtISO: string;
}

/**
 * Turns raw DB status + auction date + possession into a single badge,
 * grounded entirely in fields that actually exist on the record. Returns
 * `null` rather than guessing when there's nothing to say.
 */
export function deriveAuctionStatus(p: {
  status: string;
  physicalPossession?: boolean;
  auctionDateISO?: string;
}): AuctionStatus | null {
  if (p.physicalPossession) return { label: "Physical Possession", tone: "gold" };
  if (p.status === "SOLD") return { label: "Sold", tone: "muted" };
  if (p.status === "AUCTION_CLOSED") return { label: "Auction Closed", tone: "muted" };
  if (p.status === "UNDER_PROCESS") return { label: "Under Process", tone: "muted" };
  if (p.auctionDateISO) {
    return new Date(p.auctionDateISO) > new Date()
      ? { label: "Auction Upcoming", tone: "emerald" }
      : { label: "Available", tone: "emerald" };
  }
  if (p.status === "PUBLISHED") return { label: "Available", tone: "emerald" };
  return null;
}

/** The WhatsApp number is the live, admin-editable one from Settings
 *  (src/lib/settings.ts) — callers fetch it via useSiteSettings() /
 *  getSiteSettings() and pass the digits through here rather than this
 *  module reading a static value itself. */
export function buildAuctionWhatsAppLink(propertyId: string, whatsappNumber: string): string {
  const message = `Hello Sarakki Homes, I am interested in Bank Auction Property ${propertyId}. Please share the complete property details.`;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
