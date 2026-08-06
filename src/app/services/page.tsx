import type { Metadata } from "next";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { Container, Section } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealGroup } from "@/components/ui/RevealOnScroll";
import { ServiceCard } from "@/components/service/ServiceCard";
import { CATEGORIES } from "@/lib/data";

export const metadata: Metadata = {
  title: "Services | Sarakki Homes",
  description:
    "Six ways to invest with Sarakki Homes — bank auctions, rental income, chance deals, resale, upcoming projects, and ready-to-move properties, every one legally vetted.",
};

export default function ServicesPage() {
  return (
    <>
      <Header solid />
      <main className="flex flex-1 flex-col pt-28">
        <Section className="!pb-0 !pt-10 md:!pt-14">
          <Container>
            <Eyebrow>Our Services</Eyebrow>
            <h1 className="mt-4 max-w-2xl font-display text-4xl leading-[1.1] tracking-[-0.01em] md:text-5xl">
              Six ways to invest, one standard of care.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Whichever route fits your goals, every property we present has
              already been through the same legal and financial scrutiny.
            </p>
          </Container>
        </Section>

        <Section>
          <Container>
            <RevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {CATEGORIES.map((category) => (
                <ServiceCard key={category.slug} slug={category.slug} />
              ))}
            </RevealGroup>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
