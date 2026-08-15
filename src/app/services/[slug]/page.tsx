import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Container, Section } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { buttonClasses } from "@/components/ui/Button";
import { ButtonFX } from "@/components/ui/ButtonFX";
import { PropertyCard } from "@/components/property/PropertyCard";
import { BankAuctionCard } from "@/components/property/BankAuctionCard";
import { CATEGORIES } from "@/lib/data";
import { getPropertiesByCategory } from "@/lib/properties";
import { getBankAuctionProperties } from "@/lib/auctions";
import { getSiteSettings } from "@/lib/settings";

export const revalidate = 60;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) return {};
  return {
    title: `${category.title} | Sarakki Homes`,
    description: category.description,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) notFound();

  const { contact: CONTACT } = await getSiteSettings();
  const Icon = category.icon;
  const isBankAuctions = category.slug === "bank-auctions";
  // Bank auctions are a fully separate track (src/lib/auctions.ts, its own
  // listing/detail routes) — never pulled through the generic property
  // adapter, so this page fetches from the dedicated source instead.
  const matchingProperties = isBankAuctions ? [] : await getPropertiesByCategory(category.slug, 6);
  const matchingAuctions = isBankAuctions ? (await getBankAuctionProperties()).slice(0, 6) : [];
  const viewAllHref = isBankAuctions ? "/properties/bank-auctions" : "/properties";

  return (
    <>
      <Header solid />
      <main className="flex flex-1 flex-col pt-16">
        <section className="relative flex min-h-[70vh] items-end overflow-hidden bg-foreground">
          <MediaPlaceholder tone={category.tone} className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/60 to-foreground/20" />
          <Container className="relative z-10 pb-16 pt-40">
            <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-background/10 text-accent-gold backdrop-blur-md">
              <Icon size={22} strokeWidth={1.75} />
            </div>
            <Eyebrow light className="mt-6">
              {category.title}
            </Eyebrow>
            <h1 className="mt-4 max-w-2xl font-display text-4xl leading-[1.1] tracking-[-0.01em] text-background md:text-5xl">
              {category.heroTagline}
            </h1>
          </Container>
        </section>

        <Section>
          <Container className="grid grid-cols-1 gap-16 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RevealOnScroll>
                <p className="max-w-2xl text-lg leading-relaxed text-foreground/85">
                  {category.longDescription}
                </p>

                <h2 className="mt-12 font-display text-2xl">Why this route</h2>
                <ul className="mt-5 flex flex-col gap-4">
                  {category.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-3 text-sm leading-relaxed text-foreground/85">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface text-accent-gold-dark">
                        <Check size={12} strokeWidth={2.5} />
                      </span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </RevealOnScroll>
            </div>

            <div>
              <RevealOnScroll delay={0.1} className="rounded-md border border-border bg-surface p-8">
                <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                  Ideal For
                </p>
                <ul className="mt-4 flex flex-col gap-3">
                  {category.idealFor.map((item) => (
                    <li key={item} className="text-sm leading-relaxed text-foreground/85">
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href={CONTACT.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClasses("primary", "mt-7 w-full")}
                >
                  <ButtonFX />
                  Discuss This Route
                </a>
              </RevealOnScroll>
            </div>
          </Container>
        </Section>

        {(matchingProperties.length > 0 || matchingAuctions.length > 0) && (
          <Section className="bg-surface">
            <Container>
              <div className="flex flex-wrap items-end justify-between gap-6">
                <RevealOnScroll className="max-w-2xl">
                  <Eyebrow>Available Now</Eyebrow>
                  <h2 className="mt-4 font-display text-3xl tracking-[-0.01em] md:text-4xl">
                    {category.title}
                  </h2>
                </RevealOnScroll>
                <Link href={viewAllHref} className={buttonClasses("secondary")}>
                  <ButtonFX />
                  View All {isBankAuctions ? "Auction Properties" : "Properties"}
                </Link>
              </div>

              <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {isBankAuctions
                  ? matchingAuctions.map((property) => (
                      <BankAuctionCard key={property.id} property={property} />
                    ))
                  : matchingProperties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
              </div>
            </Container>
          </Section>
        )}

        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
