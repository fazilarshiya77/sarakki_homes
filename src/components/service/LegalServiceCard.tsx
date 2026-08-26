"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { LEGAL_SERVICES } from "@/lib/data";
import { cn } from "@/lib/utils";

// Same card-object language as PropertyCard/ServiceCard (bordered ivory
// box, rounded corners), but deliberately its own component rather than
// a repurposed ServiceCard — that one is bound to CATEGORIES (property
// investment categories, still used on the homepage's "Six ways to
// invest" grid) and mustn't be touched.
//
// Each service's photo lives at /public/media/services/{slug}.jpg —
// real, license-free photography (Pexels License: free for commercial
// use, no attribution required) chosen per service, not a generic
// stand-in. The wax-seal-style icon badge stays as a small brand touch
// in the corner, same idea as ServiceCard's category label badge.
//
// Looks the service up by slug (like ServiceCard does for CATEGORIES)
// rather than taking title/icon/etc. as props — a Lucide icon component
// can't be passed from the server page into this "use client" component
// as a prop (functions can't cross that boundary), so importing the
// data module directly here is what actually works, not an incidental
// style choice.
const CARD = { bg: "#F7F3EA", border: "#DDD5C5", text: "#17231F", textSecondary: "#6F756F" };

export function LegalServiceCard({ slug }: { slug: string }) {
  const service = LEGAL_SERVICES.find((s) => s.slug === slug);
  if (!service) return null;
  const Icon = service.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/services/${service.slug}`} className="group relative block">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-4 -z-10 rounded-2xl opacity-0 blur-[25px] transition-opacity duration-[400ms] ease-out group-hover:opacity-100"
          style={{
            background: "radial-gradient(circle, rgba(198,161,91,0.18) 0%, transparent 70%)",
          }}
        />

        <div
          className="relative overflow-hidden rounded-lg transition-all duration-[350ms] ease-out group-hover:-translate-y-2"
          style={{
            backgroundColor: CARD.bg,
            border: `1px solid ${CARD.border}`,
            boxShadow: "0 1px 2px rgba(23,35,31,0.04), 0 12px 28px rgba(23,35,31,0.06)",
          }}
        >
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={`/media/services/${service.slug}.jpg`}
              alt={service.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035]"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent" />
            <span className="absolute bottom-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-full border border-background/25 bg-black/40 text-background backdrop-blur-sm">
              <Icon size={16} strokeWidth={1.75} />
            </span>
            {service.featured && (
              <span className="absolute left-0 top-0 px-3.5 py-1.5 text-[14px] font-semibold uppercase tracking-[0.14em] text-background bg-accent-gold">
                Sarakki Homes Advantage
              </span>
            )}
          </div>

          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-display text-xl leading-snug" style={{ color: CARD.text }}>
                {service.title}
              </h3>
              <ArrowUpRight
                size={18}
                className={cn(
                  "mt-1 shrink-0 text-accent-gold-dark opacity-0 transition-all duration-300",
                  "group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                )}
              />
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed" style={{ color: CARD.textSecondary }}>
              {service.description}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
