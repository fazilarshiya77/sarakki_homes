"use client";

import { useState } from "react";
import { MessageCircle, PhoneCall, Sparkles } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";
import { ButtonFX } from "@/components/ui/ButtonFX";
import { useSiteSettings } from "@/components/providers/SettingsProvider";
import { buildAuctionWhatsAppLink } from "@/lib/auctionHelpers";
import { ConsultationModal } from "@/components/property/ConsultationModal";

/** The client's real workflow is WhatsApp-first — buyer sends the Property
 *  ID, Sarakki Homes shares full details, then coordinates a visit and the
 *  bank officer. "Send Property ID" is deliberately the primary action here,
 *  not a purchase CTA. The tracked-in-CRM "Request a Consultation" option
 *  sits alongside it as a second path, for a buyer who'd rather leave
 *  contact details than start a WhatsApp thread immediately. */
export function AuctionEnquiryPanel({
  dbId,
  propertyId,
  title,
}: {
  /** The real database id — for the CRM-linked consultation request. */
  dbId: string;
  /** The short display id (e.g. "SH-1001") — for the WhatsApp deep link,
   *  matching the client's existing "send us the Property ID" workflow. */
  propertyId: string;
  title: string;
}) {
  const { contact } = useSiteSettings();
  const [consultOpen, setConsultOpen] = useState(false);

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
        <button
          type="button"
          onClick={() => setConsultOpen(true)}
          className={buttonClasses("secondary", "relative w-full")}
        >
          <ButtonFX />
          <Sparkles size={16} />
          Request a Consultation
        </button>
      </div>

      <ConsultationModal
        open={consultOpen}
        onClose={() => setConsultOpen(false)}
        propertyId={dbId}
        propertyTitle={title}
      />
    </div>
  );
}
