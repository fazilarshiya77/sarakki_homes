import { Container, Section } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PropertyCard } from "@/components/property/PropertyCard";
import type { Property } from "@/lib/data";

export function RelatedProperties({ properties }: { properties: Property[] }) {
  if (properties.length === 0) return null;

  return (
    <Section className="bg-surface">
      <Container>
        <Eyebrow>You May Also Like</Eyebrow>
        <h2 className="mt-4 font-display text-3xl tracking-[-0.01em] md:text-4xl">
          Related Properties
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
