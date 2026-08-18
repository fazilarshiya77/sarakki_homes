import Link from "next/link";
import { Container, Section } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { buttonClasses } from "@/components/ui/Button";
import { ButtonFX } from "@/components/ui/ButtonFX";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { PropertyCard } from "@/components/property/PropertyCard";
import { CollagePhoto } from "@/components/property/CollagePhoto";
import { getFeaturedProperties } from "@/lib/properties";

export async function FeaturedProperties() {
  const featured = await getFeaturedProperties(6);

  // Real photos from among the featured properties themselves — not
  // stock — used to break up the section intro, which was plain
  // eyebrow/headline/button text on a flat surface. Only properties
  // that actually have a real photo (`image` set) qualify; on a slow
  // week where few featured listings have photography yet, the collage
  // simply renders fewer tiles rather than padding out with placeholders.
  const collagePhotos = featured.filter((p) => p.image).slice(0, 3);

  return (
    <Section id="properties" className="bg-surface">
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
          <div>
            <RevealOnScroll className="max-w-2xl">
              <Eyebrow>Featured Properties</Eyebrow>
              <h2 className="mt-4 font-display text-4xl leading-[1.1] tracking-[-0.01em] md:text-5xl">
                A curated selection, not a listing dump.
              </h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
                Every listing here has already been through our own
                verification — legal title, encumbrance, and litigation
                checks — before it ever reaches you.
              </p>
            </RevealOnScroll>
            <RevealOnScroll delay={0.1} className="mt-8">
              <Link href="/properties" className={buttonClasses("secondary")}>
                <ButtonFX />
                View All Properties
              </Link>
            </RevealOnScroll>
          </div>

          {/* Staggered photo collage — real photos of properties actually
              in the grid below, not decorative stock. Ties the section
              intro visually to what it's introducing, and gives this
              header the same photographic weight as every other section
              on the page instead of being the one plain-text block. */}
          {collagePhotos.length > 0 && (
            <div className="relative hidden h-[22rem] sm:block lg:h-[26rem]">
              {collagePhotos[0] && (
                <CollagePhoto
                  src={collagePhotos[0].image!}
                  alt={collagePhotos[0].title}
                  className="absolute left-0 top-0 h-[70%] w-[62%]"
                  rotate={-3}
                  delay={0}
                />
              )}
              {collagePhotos[1] && (
                <CollagePhoto
                  src={collagePhotos[1].image!}
                  alt={collagePhotos[1].title}
                  className="absolute bottom-0 right-0 h-[62%] w-[54%]"
                  rotate={2.5}
                  delay={0.12}
                />
              )}
              {collagePhotos[2] && (
                <CollagePhoto
                  src={collagePhotos[2].image!}
                  alt={collagePhotos[2].title}
                  className="absolute right-[6%] top-[4%] h-[40%] w-[36%]"
                  rotate={-1.5}
                  delay={0.24}
                />
              )}
            </div>
          )}
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
