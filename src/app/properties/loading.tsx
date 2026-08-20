import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { Container, Section } from "@/components/ui/Container";

// Shown only while this route segment's async Server Component is still
// resolving — for an ISR page (revalidate = 60) that's effectively just
// the very first request before the static HTML exists, or a background
// regeneration miss, not something most visitors will ever see. Mirrors
// the real grid's structure (filter bar + card tiles) at roughly correct
// proportions so there's no layout jump once real content swaps in, and
// uses a single restrained CSS pulse rather than any per-card animation.
function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-[#DDD5C5] bg-[#F7F3EA]">
      <div className="aspect-[4/3] animate-pulse bg-[#EEE7DA]" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-3/4 animate-pulse rounded-sm bg-[#EEE7DA]" />
        <div className="h-3 w-1/2 animate-pulse rounded-sm bg-[#EEE7DA]" />
        <div className="h-5 w-1/3 animate-pulse rounded-sm bg-[#EEE7DA]" />
      </div>
    </div>
  );
}

export default function PropertiesLoading() {
  return (
    <>
      <Header solid />
      <main className="flex flex-1 flex-col pt-20">
        <Section className="relative flex min-h-[220px] items-center overflow-hidden !py-10 bg-surface">
          <Container>
            <div className="h-3 w-32 animate-pulse rounded-sm bg-border" />
            <div className="mt-4 h-10 w-full max-w-2xl animate-pulse rounded-sm bg-border md:h-12" />
          </Container>
        </Section>
        <Section className="bg-[#EDE6D6] !py-12 md:!py-16">
          <Container>
            <div className="h-14 w-full animate-pulse rounded-sm bg-[#F7F3EA]" />
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
