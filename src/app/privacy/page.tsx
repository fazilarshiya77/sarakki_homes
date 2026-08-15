import type { Metadata } from "next";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { Container, Section } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Privacy Policy | Sarakki Homes",
  description:
    "How Sarakki Homes collects, uses, and protects the information you share with us.",
};

const SECTIONS = [
  {
    heading: "Information we collect",
    body: "When you enquire about a property, request a consultation, or use our search and filter tools, we may collect your name, phone number, email address, and details of the properties or services you're interested in. If you contact us via WhatsApp or phone, we receive whatever information you choose to share in that conversation.",
  },
  {
    heading: "How we use it",
    body: "We use your information to respond to enquiries, share relevant property recommendations, coordinate site visits and consultations, and improve the properties and services we present. We do not sell your personal information to third parties.",
  },
  {
    heading: "Sharing with partners",
    body: "Where you ask us to help with financing or legal verification, we may share relevant details with partner banks or empanelled legal advisors solely to progress that specific request — never for unrelated marketing.",
  },
  {
    heading: "Cookies and analytics",
    body: "This website may use basic, privacy-respecting analytics to understand how visitors use our pages, so we can improve navigation and content. This data is aggregated and not used to identify you personally.",
  },
  {
    heading: "Your choices",
    body: "You can ask us at any time to tell you what information we hold about you, correct it, or delete it. Reach out using the contact details below and we'll action it promptly.",
  },
  {
    heading: "Changes to this policy",
    body: "We may update this policy from time to time as our services evolve. The date of the most recent update will always be reflected on this page.",
  },
];

export default async function PrivacyPolicyPage() {
  const { contact: CONTACT } = await getSiteSettings();

  return (
    <>
      <Header solid />
      <main className="flex flex-1 flex-col pt-28">
        <Section className="!pb-0 !pt-10 md:!pt-14">
          <Container>
            <Eyebrow>Legal</Eyebrow>
            <h1 className="mt-4 max-w-2xl font-display text-4xl leading-[1.1] tracking-[-0.01em] md:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Last updated{" "}
              {new Date().toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric",
              })}
              . This page explains what we collect, how we use it, and the
              choices you have.
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
                <h2 className="font-display text-xl">Questions about your data?</h2>
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
