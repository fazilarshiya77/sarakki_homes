"use client";

import { motion } from "framer-motion";
import { InstagramIcon, WhatsappIcon } from "@/components/ui/SocialIcons";
import { CONTACT } from "@/lib/data";

const LINKS = [
  {
    label: "Chat on WhatsApp",
    href: CONTACT.whatsappHref,
    Icon: WhatsappIcon,
  },
  {
    label: "Follow on Instagram",
    href: CONTACT.instagramHref,
    Icon: InstagramIcon,
  },
] as const;

export function FloatingSocialDock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-6 right-6 z-40 flex flex-col gap-3"
    >
      {LINKS.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="glass flex h-12 w-12 items-center justify-center rounded-full text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:text-accent-gold-dark hover:shadow-soft-lg"
        >
          <Icon width={18} height={18} />
        </a>
      ))}
    </motion.div>
  );
}
