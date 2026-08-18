"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * One staggered, slightly-rotated photo tile in the FeaturedProperties
 * intro collage. Split out as its own "use client" component because it
 * needs Framer Motion's whileInView reveal, while FeaturedProperties
 * itself stays a server component (it awaits getFeaturedProperties()
 * directly) — motion can't be used inline inside a server component.
 */
export function CollagePhoto({
  src,
  alt,
  className,
  rotate = 0,
  delay = 0,
}: {
  src: string;
  alt: string;
  className?: string;
  /** Degrees. Passed through Framer's own transform rather than a
   *  Tailwind `rotate-*` class — Motion writes `style.transform`
   *  directly for the y-slide animation below, which would silently
   *  override a class-based rotate on the same element. */
  rotate?: number;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotate }}
      whileInView={{ opacity: 1, y: 0, rotate }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "overflow-hidden rounded-md border-4 border-background shadow-[0_20px_45px_rgba(20,20,20,0.18)]",
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 24vw, 40vw"
        className="object-cover"
      />
    </motion.div>
  );
}
