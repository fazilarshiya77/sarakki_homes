import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { safeDbCall } from "@/lib/db-safe";

export interface SiteContact {
  phoneDisplay: string;
  phoneHref: string;
  whatsappHref: string;
  /** Raw digits (country code + number, no "+"), for callers that build
   *  their own wa.me links with custom message text — see e.g.
   *  buildAuctionWhatsAppLink in src/lib/auctions.ts. */
  whatsappNumber: string;
  instagramHref: string;
}

export interface SiteSettings {
  companyName: string;
  contact: SiteContact;
  metaTitle: string;
  metaDesc: string;
  heroTitle: string;
  heroDescription: string;
  aboutHeadline: string;
  aboutDescription: string;
}

const DEFAULT_WHATSAPP_MESSAGE = "Hi Sarakki Homes, I'd like to book a consultation.";

// Falls back to the previous static copy (src/lib/data.ts's old CONTACT
// const) if the Setting row is somehow missing — it's seeded on install,
// so this is only a safety net, never the expected path.
const FALLBACK: SiteSettings = {
  companyName: "Sarakki Homes",
  contact: {
    phoneDisplay: "+91 98450 00000",
    phoneHref: "tel:+919845000000",
    whatsappHref:
      "https://wa.me/919845000000?text=" + encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE),
    whatsappNumber: "919845000000",
    instagramHref: "#",
  },
  metaTitle: "Sarakki Homes | Premium Real Estate Consultancy, Bengaluru",
  metaDesc:
    "Sarakki Homes guides you through the complete property journey — selection, legal verification, bank auction process, loan arrangement, registration, and khata transfer. Trust before property.",
  heroTitle: "Trust before property.",
  heroDescription:
    "From bank auctions to ready-to-move homes, we guide every step — legal verification, financing, registration, khata transfer — so your investment is never a leap of faith.",
  aboutHeadline: "BENGALURU'S TRUSTED PROPERTY CONSULTANCY",
  aboutDescription:
    "We guide clients through selection, verification, bidding, and registration. Experience a seamless and secure transaction experience.",
};

/** Builds a tel:/wa.me pair from whatever the admin typed into the
 *  WhatsApp Number field (any spacing/formatting) — never assumes a
 *  fixed country code beyond what's already in the stored digits. */
function contactFromPhone(raw: string): SiteContact {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return FALLBACK.contact;
  return {
    phoneDisplay: raw,
    phoneHref: `tel:+${digits}`,
    whatsappHref: `https://wa.me/${digits}?text=${encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE)}`,
    whatsappNumber: digits,
    instagramHref: FALLBACK.contact.instagramHref,
  };
}

// Wrapped in React's cache() so every call within the SAME request (root
// layout's generateMetadata + layout body, Footer, LoanEligibilityCard,
// and any page that reads it directly) shares one Prisma query instead
// of each triggering its own round-trip to Supabase — previously up to
// 3-4 duplicate identical queries per page load. cache() only dedupes
// within a single request; it's not cross-request/global caching, so
// admin-edited settings still show up on the very next request.
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  return safeDbCall(
    async () => {
      const row = await prisma.setting.findFirst();
      if (!row) return FALLBACK;

      const contact = contactFromPhone(row.whatsappNo || FALLBACK.contact.phoneDisplay);
      contact.instagramHref = row.instagramUrl || FALLBACK.contact.instagramHref;

      return {
        companyName: row.companyName || FALLBACK.companyName,
        contact,
        metaTitle: row.metaTitle || FALLBACK.metaTitle,
        metaDesc: row.metaDesc || FALLBACK.metaDesc,
        heroTitle: row.heroTitle || FALLBACK.heroTitle,
        heroDescription: row.heroDescription || FALLBACK.heroDescription,
        aboutHeadline: row.aboutHeadline || FALLBACK.aboutHeadline,
        aboutDescription: row.aboutDescription || FALLBACK.aboutDescription,
      };
    },
    FALLBACK,
    "getSiteSettings"
  );
});
