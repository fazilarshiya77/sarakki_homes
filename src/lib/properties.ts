import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Property, MediaTone, PropertyCategorySlug } from "@/lib/data";
import { safeDbCall } from "@/lib/db-safe";

// The public site's `Property` shape (src/lib/data.ts) was designed around
// a richer static dataset than what the admin CMS actually captures today
// (no amenities list, investment highlights, or multi-flat configurations
// in the schema). Every field the DB doesn't have is left `undefined`/`[]`
// below — the existing presentation components already render those
// sections conditionally, so this degrades gracefully rather than needing
// each component rewritten for the DB shape.

const PROPERTY_INCLUDE = {
  category: true,
  builder: true,
  images: { orderBy: { order: "asc" as const } },
  auctionInfo: true,
  loanEligibility: true,
  documents: true,
} satisfies Prisma.PropertyInclude;

type DbProperty = Prisma.PropertyGetPayload<{ include: typeof PROPERTY_INCLUDE }>;

const DATE_FORMAT: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };

function toPublicProperty(p: DbProperty): Property {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    location: p.location,
    price: p.price,
    priceValueLakh: p.priceValueLakh,
    type: p.type,
    // Categories are seeded from the same six slugs PropertyCategorySlug
    // covers, but the DB stores it as a plain string — cast at the
    // boundary rather than threading a wider type through every consumer.
    categorySlug: p.category.slug as PropertyCategorySlug,
    beds: p.beds,
    baths: p.baths,
    area: p.area,
    areaSqft: p.areaSqft,
    featured: p.featured === "true",
    description: p.description,
    image: p.images[0]?.url,
    gallery: [(p.category.tone as MediaTone) || "warm"],
    amenities: [],
    investmentHighlights: [],
    auctionInfo: p.auctionInfo
      ? {
          bankName: p.auctionInfo.bankName,
          auctionDate: p.auctionInfo.auctionDate.toLocaleDateString("en-IN", DATE_FORMAT),
          reservePrice: p.auctionInfo.reservePrice,
          emd: p.auctionInfo.emd,
        }
      : undefined,
    loanEligibility: p.loanEligibility
      ? {
          maxLoanAmount: p.loanEligibility.maxLoanAmount,
          indicativeEmi: p.loanEligibility.indicativeEmi,
          partnerBanks: JSON.parse(p.loanEligibility.partnerBanks || "[]"),
        }
      : { maxLoanAmount: "Contact us for details", indicativeEmi: "Contact us for details", partnerBanks: [] },
    documents: p.documents.map((d) => d.name),
    mapQuery: p.mapQuery,
  };
}

/** Real, uploaded photo URLs for the gallery — separate from the `Property.image`
 *  cover shot and `gallery` placeholder-tone fallback, since PropertyGallery
 *  needs the *full* set, not just the first. */
export function getGalleryImages(p: DbProperty): string[] {
  return p.images.map((img) => img.url);
}

// Bank auction properties have their own dedicated section
// (/properties/bank-auctions) with its own data layer (src/lib/auctions.ts)
// and never appear in the general property listing, homepage featured
// grid, or generic /properties/[slug] detail route — kept as a fully
// separate track per the client's explicit request that the two not mix.
const EXCLUDE_BANK_AUCTIONS = { category: { slug: { not: "bank-auctions" } } };

export async function getPublishedProperties(): Promise<Property[]> {
  return safeDbCall(
    async () => {
      const rows = await prisma.property.findMany({
        where: { status: "PUBLISHED", ...EXCLUDE_BANK_AUCTIONS },
        include: PROPERTY_INCLUDE,
        orderBy: { createdAt: "desc" },
      });
      return rows.map(toPublicProperty);
    },
    [],
    "getPublishedProperties"
  );
}

export async function getFeaturedProperties(limit = 6): Promise<Property[]> {
  return safeDbCall(
    async () => {
      const rows = await prisma.property.findMany({
        where: { status: "PUBLISHED", featured: "true", ...EXCLUDE_BANK_AUCTIONS },
        include: PROPERTY_INCLUDE,
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return rows.map(toPublicProperty);
    },
    [],
    "getFeaturedProperties"
  );
}

export async function getPropertiesByCategory(categorySlug: string, limit = 6): Promise<Property[]> {
  // Bank auctions are served exclusively via src/lib/auctions.ts — never
  // surfaced through this generic adapter, even when explicitly requested.
  if (categorySlug === "bank-auctions") return [];
  return safeDbCall(
    async () => {
      const rows = await prisma.property.findMany({
        where: { status: "PUBLISHED", category: { slug: categorySlug } },
        include: PROPERTY_INCLUDE,
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return rows.map(toPublicProperty);
    },
    [],
    "getPropertiesByCategory"
  );
}

/** Returns both the mapped `Property` and its raw gallery image URLs, since
 *  the detail page needs the full photo set that `Property.gallery` doesn't
 *  carry. */
export async function getPropertyBySlug(
  slug: string
): Promise<{ property: Property; galleryImages: string[] } | null> {
  return safeDbCall(
    async () => {
      const row = await prisma.property.findUnique({
        where: { slug, status: "PUBLISHED" },
        include: PROPERTY_INCLUDE,
      });
      if (!row || row.category.slug === "bank-auctions") return null;
      return { property: toPublicProperty(row), galleryImages: getGalleryImages(row) };
    },
    null,
    "getPropertyBySlug"
  );
}

export async function getRelatedProperties(property: Property, limit = 3): Promise<Property[]> {
  return safeDbCall(
    async () => {
      const rows = await prisma.property.findMany({
        where: {
          status: "PUBLISHED",
          id: { not: property.id },
          category: { slug: property.categorySlug },
        },
        include: PROPERTY_INCLUDE,
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return rows.map(toPublicProperty);
    },
    [],
    "getRelatedProperties"
  );
}

export async function getAllPublishedSlugs(): Promise<string[]> {
  return safeDbCall(
    async () => {
      const rows = await prisma.property.findMany({
        where: { status: "PUBLISHED", ...EXCLUDE_BANK_AUCTIONS },
        select: { slug: true },
      });
      return rows.map((r) => r.slug);
    },
    [],
    "getAllPublishedSlugs"
  );
}
