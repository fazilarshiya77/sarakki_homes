import type { Metadata } from "next";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { Container, Section } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealGroup } from "@/components/ui/RevealOnScroll";
import { LegalServiceCard } from "@/components/service/LegalServiceCard";
import { LEGAL_SERVICES } from "@/lib/data";

export const metadata: Metadata = {
  title: "Services | Sarakki Homes",
  description:
    "Legal, registration, and documentation services from Sarakki Homes — E-Khata, Sale Deeds, Khata and BESCOM transfers, Encumbrance Certificates, and more, every one handled end to end.",
};

export default function ServicesPage() {
  return (
    <>
      <Header solid />
      <main className="flex flex-1 flex-col pt-28">
        <Section className="relative flex min-h-[280px] items-center justify-center overflow-hidden !py-14 bg-accent-emerald-dark">
          <div aria-hidden className="emerald-shimmer" />
          <Container className="relative flex flex-col items-center text-center">
            <Eyebrow light>Our Services</Eyebrow>
            <h1 className="mt-4 max-w-2xl font-display text-4xl leading-[1.1] tracking-[-0.01em] text-background md:text-5xl">
              Every document, handled properly.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-background/70">
              From E-Khata to Sale Deeds, transfers to loan paperwork — we
              manage the legal and civic groundwork behind every property
              transaction, so nothing is left to chance.
            </p>
          </Container>
        </Section>

        <Section>
          <Container>
            <RevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {LEGAL_SERVICES.map((service) => (
                <LegalServiceCard key={service.slug} slug={service.slug} />
              ))}
            </RevealGroup>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
