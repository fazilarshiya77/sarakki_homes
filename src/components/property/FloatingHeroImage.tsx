"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/**
 * A full-bleed photograph spanning the entire hero section behind the
 * heading — kept fully sharp and at full opacity so it's genuinely
 * clear/visible, with a slow, continuous drift so it never sits static.
 * A scrim sits only under the text column itself (not over the whole
 * photo) so the heading stays readable without dulling the image.
 *
 * Previously used a raw <img> pointed at a 626x417px source file — small
 * to begin with, then stretched full-bleed AND continuously scaled up
 * to 1.07x by the animation below, both of which amplified how blurry
 * it read. Replaced with a 3000px licensed photo through next/image,
 * which also gets proper responsive sizing/optimization the old <img>
 * never had.
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
        <Image
          src="/media/sections/properties-hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>

      {/* Scrim confined to roughly the text column's width so the heading
          stays legible — the rest of the photo is left fully clear. */}
      <div className="absolute inset-y-0 left-0 w-full max-w-xl bg-gradient-to-r from-[#FAF8F5] via-[#FAF8F5]/70 to-transparent md:max-w-2xl" />
    </div>
  );
}
