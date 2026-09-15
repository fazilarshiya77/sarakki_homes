import { cache } from "react";
import { unstable_cache } from "next/cache";
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
    phoneDisplay: "+91 9663676464",
    phoneHref: "tel:+919663676464",
    whatsappHref:
      "https://wa.me/919663676464?text=" + encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE),
    whatsappNumber: "919663676464",
    instagramHref: "https://www.instagram.com/himabasavaiah/",
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

// Two layers of caching, for two different problems:
//  - React's cache() dedupes calls within the SAME request (root layout's
//    generateMetadata + layout body, Footer, LoanEligibilityCard, and any
//    page that reads it directly) so they share one Prisma query instead
//    of each triggering its own round-trip — previously up to 3-4
//    duplicate identical queries per page load.
//  - unstable_cache (Next's persistent Data Cache) dedupes ACROSS
//    requests, which matters because this function runs on every single
//    public page load via the root layout. `next dev` never populates the
//    Full Route Cache, so without this every navigation/refresh re-hit
//    Supabase (ap-northeast-1) even for content that only changes when an
//    admin edits Settings — measured at 1.3-3s+ per query from this
//    project's dev network (see db-safe.ts). This keeps admin edits
//    visible within 60s, same freshness window the site already used in
//    production.
const getCachedSettingsRow = unstable_cache(
  async () => prisma.setting.findFirst(),
  ["site-settings"],
  { revalidate: 60, tags: ["settings"] }
);

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  return safeDbCall(
    async () => {
      const row = await getCachedSettingsRow();
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
