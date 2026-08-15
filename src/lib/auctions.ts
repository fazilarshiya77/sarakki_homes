import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { deriveAuctionStatus, type AuctionProperty } from "@/lib/auctionHelpers";
import { safeDbCall } from "@/lib/db-safe";

// Bank Auction Properties render through this dedicated adapter rather than
// the generic `Property` shape in src/lib/properties.ts — the auction
// listing/detail experience needs raw fields (bank, reserve price, auction
// date, possession, full image set, live status) that the generic shape
// either omits or collapses into a single cover image. Both adapters read
// the same Property + AuctionInfo tables; this isn't a second data source.
//
// Server-only (imports Prisma) — client components must import types and
// pure helpers (buildAuctionWhatsAppLink, deriveAuctionStatus,
// AuctionProperty, AuctionStatus) from src/lib/auctionHelpers instead, or
// they'll drag the Prisma module into the browser bundle. See that file's
// header comment for the full story.

const AUCTION_INCLUDE = {
  category: true,
  images: { orderBy: { order: "asc" as const } },
  auctionInfo: true,
} satisfies Prisma.PropertyInclude;

type DbAuctionProperty = Prisma.PropertyGetPayload<{ include: typeof AUCTION_INCLUDE }>;

const DATE_FORMAT: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };

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
  return safeDbCall(
    async () => {
      const rows = await prisma.property.findMany({
        where: { status: "PUBLISHED", category: { slug: "bank-auctions" } },
        include: AUCTION_INCLUDE,
        orderBy: { createdAt: "desc" },
      });
      return rows.map(toAuctionProperty);
    },
    [],
    "getBankAuctionProperties"
  );
}

export async function getBankAuctionByPropertyId(propertyId: string): Promise<AuctionProperty | null> {
  return safeDbCall(
    async () => {
      const row = await prisma.property.findFirst({
        where: { propertyId, status: "PUBLISHED", category: { slug: "bank-auctions" } },
        include: AUCTION_INCLUDE,
      });
      return row ? toAuctionProperty(row) : null;
    },
    null,
    "getBankAuctionByPropertyId"
  );
}

export async function getAllBankAuctionPropertyIds(): Promise<string[]> {
  return safeDbCall(
    async () => {
      const rows = await prisma.property.findMany({
        where: { status: "PUBLISHED", category: { slug: "bank-auctions" } },
        select: { propertyId: true },
      });
      return rows.map((r) => r.propertyId);
    },
    [],
    "getAllBankAuctionPropertyIds"
  );
}
