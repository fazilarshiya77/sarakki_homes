import Link from "next/link";
import { Container, Section } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { buttonClasses } from "@/components/ui/Button";
import { ButtonFX } from "@/components/ui/ButtonFX";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PROPERTIES } from "@/lib/data";

export function FeaturedProperties() {
  const featured = PROPERTIES.filter((p) => p.featured).slice(0, 6);

  return (
    <Section id="properties" className="bg-surface">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <RevealOnScroll className="max-w-2xl">
            <Eyebrow>Featured Properties</Eyebrow>
            <h2 className="mt-4 font-display text-4xl leading-[1.1] tracking-[-0.01em] md:text-5xl">
              A curated selection, not a listing dump.
            </h2>
          </RevealOnScroll>
          <RevealOnScroll delay={0.1}>
            <Link href="/properties" className={buttonClasses("secondary")}>
              <ButtonFX />
              View All Properties
            </Link>
          </RevealOnScroll>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
