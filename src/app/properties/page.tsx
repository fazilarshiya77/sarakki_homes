import type { Metadata } from "next";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { Container, Section } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PropertyExplorer } from "@/components/property/PropertyExplorer";
import { PROPERTIES } from "@/lib/data";

export const metadata: Metadata = {
  title: "Properties | Sarakki Homes",
  description:
    "Browse verified bank auction, rental income, resale, and ready-to-move properties across Bengaluru — every listing legally vetted by Sarakki Homes.",
};

export default function PropertiesPage() {
  return (
    <>
      <Header solid />
      <main className="flex flex-1 flex-col pt-28">
        <Section className="!pb-0 !pt-10 md:!pt-14">
          <Container>
            <Eyebrow>Explore Properties</Eyebrow>
            <h1 className="mt-4 max-w-2xl font-display text-4xl leading-[1.1] tracking-[-0.01em] md:text-5xl">
              Every property here has already been through our scrutiny.
            </h1>
          </Container>
        </Section>

        <Section className="bg-surface">
          <Container>
            <PropertyExplorer properties={PROPERTIES} />
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
