import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { TestimonialData } from "@/components/sections/Testimonials";
import { safeDbCall } from "@/lib/db-safe";

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** The homepage book-flip section is fixed at 4 pages — this returns the 4
 *  most recent testimonials the admin has added, newest first isn't quite
 *  right for a "client stories" feel, so oldest-first (chronological,
 *  matching how the original hardcoded copy read) via createdAt asc. */
// Wrapped in unstable_cache (Next's persistent Data Cache) rather than
// relying on the page's `export const revalidate` alone — that route-level
// setting only feeds the Full Route Cache, which next dev never populates,
// so every local refresh re-ran this query from scratch against Supabase
// (measured at 1.3-3s+ per query from this project's dev network — see
// db-safe.ts's note on ap-northeast-1 latency). unstable_cache's Data Cache
// persists across requests even in dev, so repeat loads within the window
// are instant; production keeps the same 60s freshness it already had via
// the route's revalidate.
const getCachedHomepageTestimonials = unstable_cache(
  async () => {
    const rows = await prisma.testimonial.findMany({
      where: { published: true },
      orderBy: { createdAt: "asc" },
      take: 4,
    });

    return rows.map((t) => ({
      name: t.name,
      initials: initialsFor(t.name),
      location: t.location ?? "",
      category: t.role,
      quote: t.quote,
    }));
  },
  ["homepage-testimonials"],
  { revalidate: 60, tags: ["testimonials"] }
);

export async function getHomepageTestimonials(): Promise<TestimonialData[]> {
  return safeDbCall(getCachedHomepageTestimonials, [], "getHomepageTestimonials");
}
