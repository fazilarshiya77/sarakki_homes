import type { Metadata } from "next";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { Testimonials } from "@/components/sections/Testimonials";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Container, Section } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { ProcessTimeline } from "@/components/process/ProcessTimeline";
import { getHomepageTestimonials } from "@/lib/testimonials";

export const metadata: Metadata = {
  title: "Our Process | Sarakki Homes",
  description:
    "From property selection to khata transfer — the complete Sarakki Homes buying journey, step by step.",
};

export const revalidate = 60;

export default async function ProcessPage() {
  const testimonials = await getHomepageTestimonials();

  return (
    <>
      <Header solid />
      <main className="flex flex-1 flex-col pt-28">
        <Section className="relative flex min-h-[280px] items-center justify-center overflow-hidden !py-14 bg-accent-emerald-dark">
          <div aria-hidden className="emerald-shimmer" />
          <Container className="relative flex flex-col items-center text-center">
            <Eyebrow light>Our Process</Eyebrow>
            <h1 className="mt-4 max-w-2xl font-display text-4xl leading-[1.1] tracking-[-0.01em] text-background md:text-5xl">
              The complete buying journey, start to finish.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-background/70">
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

        <Testimonials testimonials={testimonials} />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
