import type { Metadata } from "next";
import type { ElementType } from "react";
import { notFound } from "next/navigation";
import { CalendarClock, Gavel, Landmark, MapPin, Ruler, Wallet } from "lucide-react";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { Container, Section } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { BankAuctionGallery } from "@/components/property/BankAuctionGallery";
import { AuctionStatusBadge } from "@/components/property/AuctionStatusBadge";
import { AuctionEnquiryPanel } from "@/components/property/AuctionEnquiryPanel";
import { getAllBankAuctionPropertyIds, getBankAuctionByPropertyId } from "@/lib/auctions";

export const dynamicParams = true;
export const revalidate = 60;

export async function generateStaticParams() {
  const ids = await getAllBankAuctionPropertyIds();
  return ids.map((propertyId) => ({ propertyId }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}): Promise<Metadata> {
  const { propertyId } = await params;
  const property = await getBankAuctionByPropertyId(propertyId);
  if (!property) return {};
  return {
    title: `${property.title} | Bank Auction Property ${property.propertyId} | Sarakki Homes`,
    description: property.description,
  };
}

// Only rendered when the underlying field actually has a value — never a
// fabricated "Not specified" placeholder for data the record doesn't carry.
function DetailRow({ icon: Icon, label, value }: { icon: ElementType; label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs uppercase tracking-[0.1em] text-background/60">
        <Icon size={13} className="text-accent-gold" />
        {label}
      </p>
      <p className="mt-1.5 text-lg text-background">{value}</p>
    </div>
  );
}

export default async function BankAuctionDetailPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;
  const property = await getBankAuctionByPropertyId(propertyId);
  if (!property) notFound();

  return (
    <>
      <Header solid />
      <main className="flex flex-1 flex-col pt-24">
        <Section className="!pb-0 !pt-8 md:!pt-10">
          <Container>
            <BankAuctionGallery images={property.images} propertyId={property.propertyId} title={property.title} />
          </Container>
        </Section>

        <Section>
          <Container className="grid grid-cols-1 gap-16 lg:grid-cols-3">
            <div className="flex flex-col gap-10 lg:col-span-2">
              <RevealOnScroll>
                <div className="flex flex-wrap items-center gap-3">
                  <Eyebrow>Bank Auction Property</Eyebrow>
                  <AuctionStatusBadge status={property.derivedStatus} />
                </div>
                <h1 className="mt-4 font-display text-3xl leading-[1.1] tracking-[-0.01em] md:text-4xl">
                  {property.title}
                </h1>
                <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin size={15} />
                  {property.location}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.1em] text-muted-foreground/70">
                  Property ID · {property.propertyId}
                </p>

                <p className="mt-6 max-w-2xl text-base leading-relaxed text-foreground/85">
                  {property.description}
                </p>
              </RevealOnScroll>

              <RevealOnScroll className="rounded-md border border-accent-gold/30 bg-accent-emerald p-8 text-background">
                <h2 className="flex items-center gap-2.5 font-display text-2xl">
                  <Gavel size={20} className="text-accent-gold" />
                  Auction Information
                </h2>
                <div className="mt-6 grid grid-cols-1 gap-5 text-background sm:grid-cols-2">
                  <DetailRow icon={Landmark} label="Conducting Bank" value={property.bank} />
                  <DetailRow icon={CalendarClock} label="Auction Date" value={property.auctionDateDisplay} />
                  <DetailRow icon={Wallet} label="Reserve Price" value={property.reservePrice} />
                  <DetailRow icon={Gavel} label="EMD Amount" value={property.emd} />
                  <DetailRow icon={Ruler} label="Property Type" value={property.propertyType} />
                  <DetailRow icon={Ruler} label="Area" value={property.area} />
                </div>
                {property.physicalPossession && (
                  <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-accent-gold">
                    Physical possession already available
                  </p>
                )}
                <p className="mt-6 text-xs leading-relaxed text-background/60">
                  Sarakki Homes independently verifies title and encumbrance
                  status ahead of every auction we present — ask your advisor
                  for the full legal report.
                </p>
              </RevealOnScroll>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-28">
                <AuctionEnquiryPanel
                  dbId={property.id}
                  propertyId={property.propertyId}
                  title={property.title}
                />
              </div>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
