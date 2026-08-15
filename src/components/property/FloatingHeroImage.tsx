"use client";

import { motion } from "framer-motion";

/**
 * A full-bleed photograph spanning the entire hero section behind the
 * heading — kept fully sharp and at full opacity so it's genuinely
 * clear/visible, with a slow, continuous drift so it never sits static.
 * A scrim sits only under the text column itself (not over the whole
 * photo) so the heading stays readable without dulling the image.
 */
export function FloatingHeroImage() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: [1.02, 1.07, 1.02], x: [0, 14, 0] }}
        transition={{
          opacity: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
          scale: { duration: 10, repeat: Infinity, ease: "easeInOut" },
          x: { duration: 10, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- .jfif source; next/image's optimizer doesn't reliably handle this extension */}
        <img
          src="/property%20section.jfif"
          alt=""
          className="h-full w-full object-cover"
        />
      </motion.div>

      {/* Scrim confined to roughly the text column's width so the heading
          stays legible — the rest of the photo is left fully clear. */}
      <div className="absolute inset-y-0 left-0 w-full max-w-xl bg-gradient-to-r from-[#FAF8F5] via-[#FAF8F5]/70 to-transparent md:max-w-2xl" />
    </div>
  );
}
