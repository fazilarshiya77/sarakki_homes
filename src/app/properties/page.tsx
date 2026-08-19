import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { Container, Section } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PropertyExplorer } from "@/components/property/PropertyExplorer";
import { getPublishedProperties } from "@/lib/properties";

// Property listings are admin-managed and can change anytime — re-fetch
// from the database at most once a minute rather than only at build time.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Properties | Sarakki Homes",
  description:
    "Browse verified bank auction, rental income, resale, and ready-to-move properties across Bengaluru — every listing legally vetted by Sarakki Homes.",
};

export default async function PropertiesPage() {
  const properties = await getPublishedProperties();

  return (
    <>
      <Header solid />
      <main className="flex flex-1 flex-col pt-28">
        <Section className="relative flex min-h-[320px] items-center overflow-hidden !py-14 bg-surface">
          <Container className="relative">
            <Eyebrow>Explore Properties</Eyebrow>
            <h1 className="relative mt-4 max-w-2xl font-display text-4xl leading-[1.1] tracking-[-0.01em] md:text-5xl">
              Every property here has already been through our scrutiny.
            </h1>
          </Container>
        </Section>

        {/* Deeper than the standard bg-surface token — white cards need a
            more contrasted backdrop to read as distinct tiles rather than
            blending into the section behind them. */}
        <Section className="bg-[#EDE6D6]">
          <Container>
            <Suspense fallback={null}>
              <PropertyExplorer properties={properties} />
            </Suspense>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
