import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { Container, Section } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PropertyCard } from "@/components/property/PropertyCard";
import { BrochureShowcase } from "@/components/property/BrochureShowcase";
import { getPropertiesByCategory } from "@/lib/properties";
import { getCategoryBySlug, getPublishedBrochures, getAllCategorySlugs } from "@/lib/brochures";
import { cn } from "@/lib/utils";

// Category content (title/tagline/description) and its brochures are
// admin-managed and can change anytime — re-fetch at most once a minute
// rather than only at build time, same convention as every other
// listing page in this project.
export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllCategorySlugs();
  // bank-auctions has its own dedicated page/UI (auction-specific fields,
  // bid guidance, etc. — see src/app/properties/bank-auctions/page.tsx)
  // and must never be double-served here.
  return slugs.filter((slug) => slug !== "bank-auctions").map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: `${category.title} | Sarakki Homes`,
    description: category.description || category.heroTagline,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // bank-auctions already has a purpose-built page with its own
  // auction-specific UI — send visitors there instead of a second,
  // thinner version of the same category.
  if (slug === "bank-auctions") redirect("/properties/bank-auctions");

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [properties, brochures] = await Promise.all([
    getPropertiesByCategory(slug, 100),
    getPublishedBrochures(slug),
  ]);

  return (
    <>
      <Header solid />
      <main className="flex flex-1 flex-col pt-28">
        {/* Category introduction */}
        <Section className="!pb-0 !pt-10 md:!pt-14">
          <Container>
            <Eyebrow>{category.title}</Eyebrow>
            <h1 className="mt-4 max-w-2xl font-display text-4xl leading-[1.1] tracking-[-0.01em] md:text-5xl">
              {category.heroTagline || category.title}
            </h1>
            {category.longDescription && (
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
                {category.longDescription}
              </p>
            )}
          </Container>
        </Section>

        {/* Brochure showcase — placed right under the category intro,
            above the property grid, so it's visible without scrolling
            past listings first (client request: brochures near the top,
            not buried at the bottom). Renders nothing at all when this
            category has no published brochures (see BrochureShowcase),
            so a brochure-less category's layout is unaffected. */}
        <BrochureShowcase brochures={brochures} />

        {/* Property listings — same PropertyCard used everywhere else on
            the site; the brochure section above is deliberately a
            visually separate section, never mixed into this grid. */}
        <Section className={cn("bg-[#EDE6D6]", brochures.length > 0 && "!pt-0")}>
          <Container>
            {properties.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border py-24 text-center">
                <h3 className="font-display text-2xl">No listings live in this category right now</h3>
                <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                  New properties are added regularly — check back soon, or get in touch and we&rsquo;ll notify you directly.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
