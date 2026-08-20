"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, Landmark, MapPin, MessageCircle, Ruler } from "lucide-react";
import { NoPropertyImage } from "@/components/property/NoPropertyImage";
import { AuctionStatusBadge } from "@/components/property/AuctionStatusBadge";
import { useSiteSettings } from "@/components/providers/SettingsProvider";
import { buildAuctionWhatsAppLink, type AuctionProperty } from "@/lib/auctionHelpers";

/**
 * Not a single whole-card <Link> (the pattern PropertyCard uses) — this card
 * carries two distinct destinations (the detail page, and a WhatsApp deep
 * link), and nesting an <a> inside an <a> breaks keyboard nav/screen readers.
 * So the image/title area links to the detail page, and both CTAs sit as
 * separate, explicit anchors in the footer.
 */
export function BankAuctionCard({ property }: { property: AuctionProperty }) {
  const { contact } = useSiteSettings();
  const detailHref = `/properties/bank-auctions/${property.propertyId}`;
  const hasImage = property.images.length > 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-[0_1px_3px_rgba(20,20,20,0.06),0_20px_50px_rgba(20,20,20,0.09)] transition-all duration-500 hover:-translate-y-2 hover:border-accent-gold/30 hover:shadow-[0_1px_3px_rgba(20,20,20,0.08),0_30px_70px_rgba(20,20,20,0.16)]"
    >
      <Link href={detailHref} className="relative block h-56 overflow-hidden" aria-label={`View ${property.title}`}>
        {hasImage ? (
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
          />
        ) : (
          <div className="h-full w-full transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]">
            <NoPropertyImage propertyId={property.propertyId} />
          </div>
        )}

        <span className="absolute left-4 top-4 rounded-sm border border-white/10 bg-black/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white backdrop-blur-md">
          Bank Auction
        </span>
        {property.derivedStatus && (
          <span className="absolute right-4 top-4">
            <AuctionStatusBadge status={property.derivedStatus} className="border-white/20 bg-black/60 text-white backdrop-blur-md" />
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
          Property ID · {property.propertyId}
        </p>

        <Link href={detailHref}>
          <h3 className="mt-2 font-display text-xl leading-snug text-foreground transition-colors duration-300 hover:text-accent-gold-dark">
            {property.title}
          </h3>
        </Link>

        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin size={14} className="shrink-0" />
          {property.location}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
          {property.bank && (
            <span className="flex items-center gap-1.5">
              <Landmark size={13} className="text-accent-gold-dark" /> {property.bank}
            </span>
          )}
          <span className="flex items-center gap-1.5">{property.propertyType}</span>
          {property.area && (
            <span className="flex items-center gap-1.5">
              <Ruler size={13} className="text-accent-gold-dark" /> {property.area}
            </span>
          )}
        </div>

        {/* Reserve price + auction date carry the strongest visual weight
            on the card, per spec — everything else is secondary metadata. */}
        <div className="mt-5 flex items-end justify-between gap-4 border-t border-border pt-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Reserve Price</p>
            <p className="mt-1 font-body text-2xl font-bold tracking-tight text-foreground">
              {property.reservePrice || "Not specified"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Auction Date</p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {property.auctionDateDisplay || "Not specified"}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Link
            href={detailHref}
            className="btn-fx group/cta relative isolate flex flex-1 items-center justify-center gap-1.5 overflow-hidden rounded-sm bg-foreground px-4 py-3 text-xs font-semibold uppercase tracking-wider text-background transition-all duration-300 hover:bg-accent-gold-dark"
          >
            View Details
            <ArrowUpRight size={14} className="transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
          </Link>
          <a
            href={buildAuctionWhatsAppLink(property.propertyId, contact.whatsappNumber)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Send Property ID on WhatsApp"
            title="Send Property ID on WhatsApp"
            className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-sm border border-accent-gold/40 text-accent-gold-dark transition-all duration-300 hover:border-accent-gold hover:bg-accent-gold/10"
          >
            <MessageCircle size={17} />
          </a>
        </div>
      </div>
    </motion.article>
  );
}
