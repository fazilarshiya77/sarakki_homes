"use client";

import { MessageCircle, PhoneCall } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import Image from "next/image";
import { ButtonFX } from "@/components/ui/ButtonFX";
import { useSiteSettings } from "@/components/providers/SettingsProvider";

export function FinalCTA() {
  const { contact: CONTACT } = useSiteSettings();

  return (
    <Section className="relative overflow-hidden bg-foreground text-background">
      {/* Decorative closing image — licensed stock, warm-graded and heavily
          washed so it reads as atmosphere behind the CTA rather than a
          photo competing with it. */}
      <Image
        src="/media/sections/final-cta.jpg"
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="object-cover"
        style={{ filter: "grayscale(0.35) sepia(0.45) saturate(1.25) brightness(0.7)" }}
      />
      <div className="absolute inset-0 backdrop-blur-[1px] bg-gradient-to-t from-foreground via-foreground/85 to-foreground/65" />

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
