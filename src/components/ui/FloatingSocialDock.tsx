"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { InstagramIcon, WhatsappIcon } from "@/components/ui/SocialIcons";
import { useSiteSettings } from "@/components/providers/SettingsProvider";

// Each platform's real brand color, as solid filled circles rather than
// tinted icons on glass — asked to be "much bigger and much more
// colorful." Filled circles read as distinctly WhatsApp-green /
// Instagram-pink at a glance, which a tinted outline on glass didn't.
const BRAND = {
  whatsapp: { solid: "#25D366", glow: "rgba(37,211,102,0.6)" },
  instagram: { solid: "#E1306C", glow: "rgba(225,48,108,0.6)" },
} as const;

export function FloatingSocialDock() {
  const pathname = usePathname();
  const { contact } = useSiteSettings();

  // Same pattern as BuilderMarquee: this is a public-marketing-site
  // affordance (WhatsApp/Instagram for site visitors), rendered from the
  // root layout so it's unintentionally showing on every /admin CRM
  // page too, floating over staff-only screens where it has no purpose.
  if (pathname?.startsWith("/admin")) return null;

  const LINKS = [
    {
      label: "Chat on WhatsApp",
      href: contact.whatsappHref,
      Icon: WhatsappIcon,
      brand: BRAND.whatsapp,
    },
    {
      label: "Follow on Instagram",
      href: contact.instagramHref,
      Icon: InstagramIcon,
      brand: BRAND.instagram,
    },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      // Raised to clear the BuilderMarquee ticker bar fixed along the
      // viewport bottom (src/components/ui/BuilderMarquee.tsx) — without
      // this, the lowest dock icon would sit under/against the ticker.
      className="fixed bottom-[4.75rem] right-6 z-40 flex flex-col gap-3 md:bottom-20"
    >
      {/* href comes straight from live Settings (contact.whatsappHref /
          instagramHref — src/lib/settings.ts), so the link mechanism
          itself always works. If a tap goes nowhere, the Setting row's
          WhatsApp number / Instagram URL is still a placeholder in the
          CRM (/admin/settings), not a bug in this component. */}
      {LINKS.map(({ label, href, Icon, brand }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="group relative block">
          {/* Slow blinking halo — a soft glow that breathes rather than a
              harsh flash, so it draws the eye without feeling like a
              notification badge or an ad. */}
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: brand.glow, filter: "blur(4px)" }}
            animate={{ opacity: [0.35, 0.85, 0.35], scale: [1, 1.18, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <div
            className="relative flex h-11 w-11 items-center justify-center rounded-full text-white shadow-[0_6px_20px_rgba(0,0,0,0.25)] transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: brand.solid }}
          >
            <Icon width={18} height={18} />
          </div>
        </a>
      ))}
    </motion.div>
  );
}
