import type { Metadata } from "next";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { Testimonials } from "@/components/sections/Testimonials";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Container, Section } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { ProcessTimeline } from "@/components/process/ProcessTimeline";

export const metadata: Metadata = {
  title: "Our Process | Sarakki Homes",
  description:
    "From property selection to khata transfer — the complete Sarakki Homes buying journey, step by step.",
};

export default function ProcessPage() {
  return (
    <>
      <Header solid />
      <main className="flex flex-1 flex-col pt-28">
        <Section className="!pb-0 !pt-10 md:!pt-14">
          <Container>
            <Eyebrow>Our Process</Eyebrow>
            <h1 className="mt-4 max-w-2xl font-display text-4xl leading-[1.1] tracking-[-0.01em] md:text-5xl">
              The complete buying journey, start to finish.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Most agents stop at the sale. We stay engaged through legal
              verification, financing, registration, and khata transfer —
              because that&rsquo;s where deals actually go wrong.
            </p>
          </Container>
        </Section>

        <Section>
          <Container className="max-w-4xl">
            <RevealOnScroll>
              <ProcessTimeline />
            </RevealOnScroll>
          </Container>
        </Section>

        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
