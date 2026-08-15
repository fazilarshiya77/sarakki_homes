import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// Bank Auction Properties render through this dedicated adapter rather than
// the generic `Property` shape in src/lib/properties.ts — the auction
// listing/detail experience needs raw fields (bank, reserve price, auction
// date, possession, full image set, live status) that the generic shape
// either omits or collapses into a single cover image. Both adapters read
// the same Property + AuctionInfo tables; this isn't a second data source.

const AUCTION_INCLUDE = {
  category: true,
  images: { orderBy: { order: "asc" as const } },
  auctionInfo: true,
} satisfies Prisma.PropertyInclude;

type DbAuctionProperty = Prisma.PropertyGetPayload<{ include: typeof AUCTION_INCLUDE }>;

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

const DATE_FORMAT: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };

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

function toAuctionProperty(p: DbAuctionProperty): AuctionProperty {
  const auctionDateISO = p.auctionInfo?.auctionDate.toISOString();
  return {
    id: p.id,
    propertyId: p.propertyId,
    slug: p.slug,
    title: p.title,
    bank: p.auctionInfo?.bankName,
    location: p.location,
    propertyType: p.type,
    area: p.area || undefined,
    areaSqft: p.areaSqft || undefined,
    reservePrice: p.auctionInfo?.reservePrice,
    emd: p.auctionInfo?.emd,
    auctionDateISO,
    auctionDateDisplay: p.auctionInfo?.auctionDate.toLocaleDateString("en-IN", DATE_FORMAT),
    physicalPossession: p.auctionInfo?.physicalPossession,
    description: p.description,
    images: p.images.map((img) => img.url),
    status: p.status,
    derivedStatus: deriveAuctionStatus({
      status: p.status,
      physicalPossession: p.auctionInfo?.physicalPossession,
      auctionDateISO,
    }),
    createdAtISO: p.createdAt.toISOString(),
  };
}

export async function getBankAuctionProperties(): Promise<AuctionProperty[]> {
  const rows = await prisma.property.findMany({
    where: { status: "PUBLISHED", category: { slug: "bank-auctions" } },
    include: AUCTION_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toAuctionProperty);
}

export async function getBankAuctionByPropertyId(propertyId: string): Promise<AuctionProperty | null> {
  const row = await prisma.property.findFirst({
    where: { propertyId, status: "PUBLISHED", category: { slug: "bank-auctions" } },
    include: AUCTION_INCLUDE,
  });
  return row ? toAuctionProperty(row) : null;
}

export async function getAllBankAuctionPropertyIds(): Promise<string[]> {
  const rows = await prisma.property.findMany({
    where: { status: "PUBLISHED", category: { slug: "bank-auctions" } },
    select: { propertyId: true },
  });
  return rows.map((r) => r.propertyId);
}

/** The WhatsApp number is the live, admin-editable one from Settings
 *  (src/lib/settings.ts) — callers fetch it via useSiteSettings() /
 *  getSiteSettings() and pass the digits through here rather than this
 *  module reading a static value itself. */
export function buildAuctionWhatsAppLink(propertyId: string, whatsappNumber: string): string {
  const message = `Hello Sarakki Homes, I am interested in Bank Auction Property ${propertyId}. Please share the complete property details.`;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
