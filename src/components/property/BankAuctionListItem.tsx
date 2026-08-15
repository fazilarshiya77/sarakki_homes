"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Landmark, MapPin, MessageCircle } from "lucide-react";
import { NoPropertyImage } from "@/components/property/NoPropertyImage";
import { AuctionStatusBadge } from "@/components/property/AuctionStatusBadge";
import { useSiteSettings } from "@/components/providers/SettingsProvider";
import { buildAuctionWhatsAppLink, type AuctionProperty } from "@/lib/auctions";

/** The information-dense row for comparing many listings at once — same
 *  data as the grid card, laid out horizontally so it scans quickly. */
export function BankAuctionListItem({ property }: { property: AuctionProperty }) {
  const { contact } = useSiteSettings();
  const detailHref = `/properties/bank-auctions/${property.propertyId}`;
  const hasImage = property.images.length > 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col gap-5 rounded-lg border border-border bg-card p-5 shadow-[0_1px_3px_rgba(20,20,20,0.06),0_16px_40px_rgba(20,20,20,0.07)] transition-all duration-500 hover:-translate-y-1 hover:border-accent-gold/30 hover:shadow-[0_1px_3px_rgba(20,20,20,0.08),0_24px_55px_rgba(20,20,20,0.13)] sm:flex-row sm:items-center"
    >
      <Link href={detailHref} className="relative block h-40 w-full shrink-0 overflow-hidden rounded-sm sm:h-28 sm:w-40">
        {hasImage ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
          />
        ) : (
          <NoPropertyImage propertyId={property.propertyId} className="rounded-sm" />
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-sm bg-foreground px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-background">
            Bank Auction
          </span>
          <AuctionStatusBadge status={property.derivedStatus} />
        </div>
        <Link href={detailHref}>
          <h3 className="mt-2 truncate font-display text-lg text-foreground transition-colors duration-300 hover:text-accent-gold-dark">
            {property.title}
          </h3>
        </Link>
        <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin size={12} /> {property.location}
          </span>
          {property.bank && (
            <span className="flex items-center gap-1.5">
              <Landmark size={12} className="text-accent-gold-dark" /> {property.bank}
            </span>
          )}
          <span>{property.propertyType}</span>
          {property.area && <span>{property.area}</span>}
          <span className="text-muted-foreground/60">ID · {property.propertyId}</span>
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-6 border-t border-border pt-4 sm:border-t-0 sm:border-l sm:pl-6 sm:pt-0">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Reserve Price</p>
          <p className="mt-0.5 font-display text-xl font-bold text-foreground">{property.reservePrice || "Not specified"}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Auction Date</p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">{property.auctionDateDisplay || "Not specified"}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <Link
          href={detailHref}
          className="btn-fx flex items-center gap-1.5 rounded-sm bg-foreground px-4 py-3 text-xs font-semibold uppercase tracking-wider text-background transition-colors duration-300 hover:bg-accent-gold-dark"
        >
          View Details
          <ArrowUpRight size={13} />
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
    </motion.article>
  );
}
