"use client";

import { MessageCircle, PhoneCall } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import { ButtonFX } from "@/components/ui/ButtonFX";
import { CONTACT } from "@/lib/data";

export function FinalCTA() {
  return (
    <Section className="relative overflow-hidden bg-foreground text-background">
      <MediaPlaceholder tone="charcoal" className="absolute inset-0" grain />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/85 to-foreground/60" />

      <Container className="relative z-10 flex flex-col items-center gap-8 text-center">
        <RevealOnScroll className="max-w-2xl">
          <h2 className="font-display text-4xl leading-[1.1] tracking-[-0.01em] md:text-5xl">
            Let&rsquo;s find the right property, the right way.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-background/75">
            Book a one-on-one consultation with our advisory team — no
            obligation, just clarity.
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={0.1} className="flex flex-wrap items-center justify-center gap-4">
          <a
            href={CONTACT.phoneHref}
            className="btn-fx inline-flex items-center gap-2 rounded-pill bg-accent-gold px-8 py-4 text-sm font-semibold text-foreground transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:scale-[1.02] hover:bg-accent-gold-dark hover:shadow-soft-lg active:translate-y-0 active:scale-[0.98] active:duration-150"
          >
            <ButtonFX />
            <PhoneCall size={16} />
            Book a Consultation
          </a>
          <a
            href={CONTACT.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-fx inline-flex items-center gap-2 rounded-pill border border-background/30 bg-background/10 px-8 py-4 text-sm font-semibold text-background backdrop-blur-md transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:scale-[1.02] hover:bg-background/20 hover:shadow-soft-lg active:translate-y-0 active:scale-[0.98] active:duration-150"
          >
            <ButtonFX />
            <MessageCircle size={16} />
            WhatsApp Us
          </a>
        </RevealOnScroll>
      </Container>
    </Section>
  );
}
