import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { safeDbCall } from "@/lib/db-safe";

/** Revalidates whichever public page actually serves this category, so
 *  a brochure add/edit/delete/publish-toggle in the CRM shows up on the
 *  site immediately instead of waiting out that page's `revalidate`
 *  window (up to 60s — see `export const revalidate` on the category
 *  pages). bank-auctions has its own dedicated route rather than the
 *  generic /properties/category/[slug]; every caller must go through
 *  this helper rather than hardcoding the path, or a bank-auctions
 *  brochure change would silently revalidate the wrong URL.
 *
 *  Only valid to call from a Route Handler or Server Action (Next.js
 *  restriction on `revalidatePath`) — never from a page/Server
 *  Component's render path, which is why this lives here rather than
 *  being invoked directly by the public pages that only ever *read*
 *  brochures via the functions below. */
export function revalidateCategoryPage(slug: string) {
  revalidatePath(slug === "bank-auctions" ? "/properties/bank-auctions" : `/properties/category/${slug}`);
}

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
