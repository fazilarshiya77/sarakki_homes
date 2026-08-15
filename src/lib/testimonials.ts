import { prisma } from "@/lib/prisma";
import type { TestimonialData } from "@/components/sections/Testimonials";

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
export async function getHomepageTestimonials(): Promise<TestimonialData[]> {
  const rows = await prisma.testimonial.findMany({
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
}
