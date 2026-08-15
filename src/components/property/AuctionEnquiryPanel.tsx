"use client";

import { MessageCircle, PhoneCall } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";
import { ButtonFX } from "@/components/ui/ButtonFX";
import { useSiteSettings } from "@/components/providers/SettingsProvider";
import { buildAuctionWhatsAppLink } from "@/lib/auctions";

/** The client's real workflow is WhatsApp-first — buyer sends the Property
 *  ID, Sarakki Homes shares full details, then coordinates a visit and the
 *  bank officer. "Send Property ID" is deliberately the primary action here,
 *  not a purchase CTA. */
export function AuctionEnquiryPanel({ propertyId }: { propertyId: string }) {
  const { contact } = useSiteSettings();

  return (
    <div className="rounded-md border border-border bg-card p-7 shadow-soft">
      <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Interested in this property?</p>
      <p className="mt-1 font-display text-xl">Request the complete details</p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        Send us the Property ID on WhatsApp and our advisors will share full
        documentation, legal status, and next steps.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        <a
          href={buildAuctionWhatsAppLink(propertyId, contact.whatsappNumber)}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses("primary", "w-full")}
        >
          <ButtonFX />
          <MessageCircle size={16} />
          Send Property ID on WhatsApp
        </a>
        <a href={contact.phoneHref} className={buttonClasses("secondary", "w-full")}>
          <ButtonFX />
          <PhoneCall size={16} />
          {contact.phoneDisplay}
        </a>
      </div>
    </div>
  );
}
