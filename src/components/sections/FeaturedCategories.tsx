import { Container, Section } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { ServiceCard } from "@/components/service/ServiceCard";
import { CATEGORIES } from "@/lib/data";

// Asymmetric editorial grid rather than a uniform 3-up: the first category
// is given extra visual weight (wider column, taller image) as the lead
// story, the rest fall into a tighter supporting rhythm — same treatment
// as an editorial "featured + grid" magazine layout.
const SPAN: Record<number, string> = {
  0: "md:col-span-7",
  1: "md:col-span-5",
  2: "md:col-span-4",
  3: "md:col-span-4",
  4: "md:col-span-4",
};

export function FeaturedCategories() {
  return (
    <Section id="categories" className="bg-background">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <RevealOnScroll className="max-w-2xl">
            <Eyebrow>What We Offer</Eyebrow>
            <h2 className="mt-4 font-display text-4xl leading-[1.1] tracking-[-0.01em] md:text-5xl">
              Six ways to invest, one standard of care.
            </h2>
          </RevealOnScroll>
          <RevealOnScroll delay={0.1} className="max-w-sm text-sm leading-relaxed text-muted-foreground md:text-right">
            Every route into the market — from bank auctions to ready-to-move
            homes — is vetted, documented and guided end to end.
          </RevealOnScroll>
        </div>

        {/* items-start: grid cells default to align-items:stretch, so the
            shorter featured card (16:11 image) was being stretched to
            match its taller row-mate (4:5 image) — its own box didn't
            grow to fill that stretched cell, leaving a visible empty gap
            beneath it. Aligning to the top lets each card sit at its own
            natural height instead. */}
        <div className="mt-16 grid grid-cols-1 items-start gap-x-8 gap-y-12 md:grid-cols-12">
          {CATEGORIES.map((category, i) => (
            <div key={category.slug} className={SPAN[i] ?? "md:col-span-4"}>
              <ServiceCard slug={category.slug} featured={i === 0} />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
