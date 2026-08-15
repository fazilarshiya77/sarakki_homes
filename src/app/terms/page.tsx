import type { Metadata } from "next";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { Container, Section } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Terms of Service | Sarakki Homes",
  description: "The terms that govern your use of the Sarakki Homes website and services.",
};

const SECTIONS = [
  {
    heading: "About this website",
    body: "This website is operated by Sarakki Homes, a Bengaluru-based real estate consultancy, to help you discover properties and understand our advisory services. Browsing and using this site means you accept these terms.",
  },
  {
    heading: "Property information",
    body: "Property listings, prices, availability, and specifications shown on this site are indicative and sourced from sellers, builders, or auction notices. We take reasonable care to verify what we present, but all details should be independently confirmed before any transaction — nothing on this site constitutes a binding offer.",
  },
  {
    heading: "No warranty",
    body: "We provide our advisory services with care and diligence, but property transactions carry inherent legal and financial risk. We do not guarantee any specific outcome, valuation, or investment return, and recommend independent legal and financial advice before any purchase.",
  },
  {
    heading: "Third-party links and services",
    body: "This site links to third-party services such as WhatsApp and partner bank portals for your convenience. We aren't responsible for the content, availability, or practices of those third-party services once you leave our site.",
  },
  {
    heading: "Intellectual property",
    body: "The design, text, and imagery on this website belong to Sarakki Homes unless otherwise credited, and may not be reproduced without permission.",
  },
  {
    heading: "Governing law",
    body: "These terms are governed by the laws of India, and any disputes will be subject to the jurisdiction of the courts in Bengaluru, Karnataka.",
  },
];

export default async function TermsOfServicePage() {
  const { contact: CONTACT } = await getSiteSettings();

  return (
    <>
      <Header solid />
      <main className="flex flex-1 flex-col pt-28">
        <Section className="!pb-0 !pt-10 md:!pt-14">
          <Container>
            <Eyebrow>Legal</Eyebrow>
            <h1 className="mt-4 max-w-2xl font-display text-4xl leading-[1.1] tracking-[-0.01em] md:text-5xl">
              Terms of Service
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Last updated{" "}
              {new Date().toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric",
              })}
              . Please read these terms before using our website or services.
            </p>
          </Container>
        </Section>

        <Section>
          <Container className="max-w-3xl">
            <RevealOnScroll className="flex flex-col gap-10">
              {SECTIONS.map((section) => (
                <div key={section.heading}>
                  <h2 className="font-display text-2xl">{section.heading}</h2>
                  <p className="mt-3 leading-relaxed text-foreground/80">
                    {section.body}
                  </p>
                </div>
              ))}

              <div className="rounded-md border border-border bg-surface p-7">
                <h2 className="font-display text-xl">Questions about these terms?</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Write to us at{" "}
                  <a href="mailto:hello@sarakkihomes.com" className="font-medium text-accent-gold-dark">
                    hello@sarakkihomes.com
                  </a>{" "}
                  or call{" "}
                  <a href={CONTACT.phoneHref} className="font-medium text-accent-gold-dark">
                    {CONTACT.phoneDisplay}
                  </a>
                  .
                </p>
              </div>
            </RevealOnScroll>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
