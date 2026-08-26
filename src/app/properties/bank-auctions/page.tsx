import type { Metadata } from "next";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { Container, Section } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { BankAuctionExplorer } from "@/components/property/BankAuctionExplorer";
import { BrochureShowcase } from "@/components/property/BrochureShowcase";
import { getBankAuctionProperties } from "@/lib/auctions";
import { getPublishedBrochures } from "@/lib/brochures";
import { cn } from "@/lib/utils";

// Auction listings are admin-managed and can change frequently — re-fetch at
// most once a minute rather than only at build time.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Bank Auction Properties | Sarakki Homes",
  description:
    "Explore bank auction opportunities across Bengaluru — reserve prices, auction dates, and possession status, verified by Sarakki Homes before you ever bid.",
};

export default async function BankAuctionsPage() {
  const [properties, brochures] = await Promise.all([
    getBankAuctionProperties(),
    getPublishedBrochures("bank-auctions"),
  ]);

  return (
    <>
      <Header solid />
      <main className="flex flex-1 flex-col pt-28">
        <Section className="!pb-0 !pt-10 md:!pt-14">
          <Container>
            <Eyebrow>Bank Auction Properties</Eyebrow>
            <h1 className="mt-4 max-w-2xl font-display text-4xl leading-[1.1] tracking-[-0.01em] md:text-5xl">
              Explore bank auction opportunities across Bengaluru.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Bank auctions offer some of the sharpest pricing in Bengaluru&rsquo;s
              property market, but the process is unfamiliar territory for most
              buyers. Sarakki Homes shortlists these listings, verifies title
              and encumbrance status ahead of every auction, and guides you
              through bidding, EMD, registration, and possession — end to end.
            </p>
          </Container>
        </Section>

        {/* Placed above the property grid, right under the intro, so
            it's visible without scrolling past listings first. */}
        <BrochureShowcase brochures={brochures} />

        <Section className={cn("bg-[#EDE6D6]", brochures.length > 0 && "!pt-0")}>
          <Container>
            <BankAuctionExplorer properties={properties} />
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
