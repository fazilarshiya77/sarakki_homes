import { prisma } from "@/lib/prisma";
import { safeDbCall } from "@/lib/db-safe";

/** Public-facing shape — deliberately its own type, not reused from the
 *  admin Brochure API responses, since the public site never needs
 *  createdAt/updatedAt/categoryId and must never leak an unpublished
 *  brochure regardless of what the admin API returns elsewhere. */
export interface PublicBrochure {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  thumbnailUrl: string | null;
}

export interface PublicCategory {
  id: string;
  slug: string;
  title: string;
  description: string;
  heroTagline: string;
  longDescription: string;
}

/** Every published brochure for one category, in the admin's chosen
 *  display order. Returns an empty array (never throws, never renders a
 *  broken section) if the category has no brochures, isn't found, or
 *  the DB is briefly unreachable — the calling page/component is
 *  expected to hide the whole brochure section on an empty array. */
export async function getPublishedBrochures(categorySlug: string): Promise<PublicBrochure[]> {
  return safeDbCall(
    async () => {
      const rows = await prisma.brochure.findMany({
        where: { published: true, category: { slug: categorySlug } },
        select: { id: true, title: true, description: true, fileUrl: true, thumbnailUrl: true },
        orderBy: { order: "asc" },
      });
      return rows;
    },
    [],
    "getPublishedBrochures"
  );
}

/** The DB-backed Category record (title/heroTagline/longDescription —
 *  same fields the CRM's Category form edits) for a category landing
 *  page's intro block. Returns null if the slug doesn't match any
 *  category or the DB is briefly unreachable, so the page can 404
 *  cleanly rather than rendering with missing copy. */
export async function getCategoryBySlug(slug: string): Promise<PublicCategory | null> {
  return safeDbCall(
    async () => {
      const category = await prisma.category.findUnique({
        where: { slug },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          heroTagline: true,
          longDescription: true,
        },
      });
      return category;
    },
    null,
    "getCategoryBySlug"
  );
}

/** Every category slug that actually exists in the DB — used by the
 *  category page's generateStaticParams so build-time prerendering
 *  covers whatever the admin has configured, not a hardcoded list. */
export async function getAllCategorySlugs(): Promise<string[]> {
  return safeDbCall(
    async () => {
      const rows = await prisma.category.findMany({ select: { slug: true } });
      return rows.map((r) => r.slug);
    },
    [],
    "getAllCategorySlugs"
  );
}
