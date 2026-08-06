import { Container, Section } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealGroup, RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { ServiceCard } from "@/components/service/ServiceCard";
import { CATEGORIES } from "@/lib/data";

export function FeaturedCategories() {
  return (
    <Section id="categories" className="bg-background">
      <Container>
        <RevealOnScroll className="max-w-2xl">
          <Eyebrow>What We Offer</Eyebrow>
          <h2 className="mt-4 font-display text-4xl leading-[1.1] tracking-[-0.01em] md:text-5xl">
            Six ways to invest, one standard of care.
          </h2>
        </RevealOnScroll>

        <RevealGroup className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category) => (
            <ServiceCard key={category.slug} slug={category.slug} />
          ))}
        </RevealGroup>
      </Container>
    </Section>
  );
}
