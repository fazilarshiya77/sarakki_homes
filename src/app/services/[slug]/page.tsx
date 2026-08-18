import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Container, Section } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import Image from "next/image";
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
  // Position in the canonical CATEGORIES order — drives the "01 / 02 / …"
  // section numeral in the masthead, so the six service pages read as a
  // numbered series rather than six unrelated pages.
  const categoryIndex = CATEGORIES.findIndex((c) => c.slug === slug);
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
          {/* Atmospheric hero photograph. Deliberately decorative — this
              is a category/service page, not a specific listing, so a
              licensed architectural image is appropriate here. Individual
              property cards below still show only that property's own real
              photos (or a placeholder), never a stock stand-in, so nothing
              here can misrepresent an actual listing to a buyer. */}
          {/* Pushed hard into a warm monotone rather than left as a
              recognisable full-colour stock photograph. A neutral stock
              image sitting at full saturation behind a headline is the
              clearest "template" signal on a page like this; grading it
              into the brand's own espresso/bronze range makes it read as
              art direction — texture the page owns, not a picture
              dropped in behind the text. */}
          <Image
            src={`/media/sections/${category.slug}.jpg`}
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ filter: "grayscale(0.85) sepia(0.5) saturate(1.4) brightness(0.5) contrast(1.15)" }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgba(28,23,19,0.35) 0%, rgba(28,23,19,0.7) 60%, rgba(28,23,19,0.96) 100%)" }}
          />
          {/* Editorial masthead rather than the icon-badge + eyebrow +
              headline stack this used to be. That stack — a rounded icon
              chip floating above centred label text — is the single most
              template-looking pattern on a page like this. A numbered
              section marker with a hairline rule reads like a printed
              property brochure instead, which is the register this brand
              is going for. */}
          <Container className="relative z-10 pb-20 pt-48">
            <div className="flex items-center gap-5">
              <span className="font-display text-sm tabular-nums text-accent-gold">
                {String(categoryIndex + 1).padStart(2, "0")}
              </span>
              <span className="h-px w-16 bg-accent-gold/50" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-background/70">
                {category.title}
              </span>
            </div>

            <h1 className="mt-8 max-w-4xl font-display text-[2.75rem] leading-[0.98] tracking-[-0.02em] text-background md:text-[4.5rem]">
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

                {/* Numbered, rule-separated rows instead of the previous
                    circular-checkmark bullets. Check chips in grey circles
                    are stock UI-kit furniture; hairline rules with hanging
                    numerals read as considered editorial layout and match
                    the numbered masthead above. */}
                <h2 className="mt-14 font-display text-2xl">Why this route</h2>
                <ul className="mt-6 border-t border-border/60">
                  {category.highlights.map((highlight, i) => (
                    <li
                      key={highlight}
                      className="flex items-baseline gap-6 border-b border-border/60 py-4"
                    >
                      <span className="shrink-0 font-display text-xs tabular-nums text-accent-gold-dark">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[0.95rem] leading-relaxed text-foreground/85">
                        {highlight}
                      </span>
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
