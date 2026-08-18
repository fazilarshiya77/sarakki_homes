"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, MessageCircle, X, Phone, MapPin, Clock, Mail, Globe, Map, ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ButtonFX } from "@/components/ui/ButtonFX";
import { CATEGORIES } from "@/lib/data";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Properties", href: "/properties" },
  { label: "Services", href: "/services" },
  { label: "Our Process", href: "/process" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "FAQ", href: "/#faq" },
];

// Nav items that expand into a category dropdown instead of navigating
// directly. Keyed by label so both the desktop hover panel and the mobile
// accordion can share one data source. "Properties" links each category to
// a pre-filtered listing (the live inventory); "Services" links to the
// descriptive category pages — same six categories, different destination,
// on purpose.
const NAV_DROPDOWNS: Record<
  string,
  { items: { label: string; href: string }[]; viewAllHref: string; viewAllLabel: string }
> = {
  Properties: {
    items: [
      // Bank Auction Properties gets its own dedicated, richer listing
      // experience (filters, grid/list, search) — every other category
      // still links to the generic listing pre-filtered by category.
      ...CATEGORIES.map((category) => ({
        label: category.title,
        href:
          category.slug === "bank-auctions"
            ? "/properties/bank-auctions"
            : `/properties?category=${category.slug}`,
      })),
      { label: "Auction Properties", href: "/properties/bank-auctions" },
    ],
    viewAllHref: "/properties",
    viewAllLabel: "View All Properties →",
  },
  Services: {
    items: CATEGORIES.map((category) => ({
      label: category.title,
      href: `/services/${category.slug}`,
    })),
    viewAllHref: "/services",
    viewAllLabel: "View All Services →",
  },
};

const EASE = [0.22, 1, 0.36, 1] as const;

export function Header({ solid = false }: { solid?: boolean }) {
  const [scrolled, setScrolled] = useState(solid);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  // Which mobile accordion (by link label) is expanded, if any — only one
  // open at a time.
  const [mobileOpenAccordion, setMobileOpenAccordion] = useState<string | null>(null);

  useEffect(() => {
    if (solid) return;

    // On the homepage, the nav should stay transparent over the full-bleed
    // Hero photograph and only turn solid once the user has scrolled past
    // it. Other pages have no such hero, so this falls back to a small
    // fixed threshold.
    let threshold = 32;
    const heroEl = document.getElementById("hero");

    const computeThreshold = () => {
      if (!heroEl) return 32;
      return Math.max(heroEl.offsetTop + heroEl.offsetHeight - 120, 32);
    };

    threshold = computeThreshold();
    const onScroll = () => setScrolled(window.scrollY > threshold);
    const onResize = () => {
      threshold = computeThreshold();
      onScroll();
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [solid]);

  // Close the mobile menu on route change (link click) and lock body scroll
  // while it's open, same pattern as the intro Loader.
  useEffect(() => {
    if (!menuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [menuOpen]);

  const isSolid = solid || scrolled || menuOpen;

  return (
    <motion.div
      initial={{ y: -90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, delay: solid ? 0 : 2.2, ease: EASE }}
      className="fixed inset-x-0 top-5 z-50 px-4 md:top-6"
    >
      <Container>
        <header
          className={cn(
            "mx-auto flex max-w-5xl items-center justify-between gap-8 rounded-pill border px-5 py-3 transition-all duration-500 md:px-7 md:py-3.5",
            isSolid
              ? "border-border/70 bg-background/85 shadow-soft backdrop-blur-xl"
              : "border-white/10 bg-foreground/10 shadow-none backdrop-blur-md"
          )}
        >
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className={cn(
              "shrink-0 font-display text-lg tracking-[0.01em] transition-colors",
              isSolid ? "text-foreground" : "text-background"
            )}
            style={isSolid ? undefined : { textShadow: "0 1px 12px rgba(0,0,0,0.45)" }}
          >
            Sarakki Homes
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {LINKS.map((link) => {
              const dropdown = NAV_DROPDOWNS[link.label];
              if (!dropdown) {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "group relative py-1 text-sm font-medium tracking-wide transition-colors duration-300",
                      isSolid
                        ? "text-foreground/75 hover:text-foreground"
                        : "text-background/90 hover:text-background"
                    )}
                    style={isSolid ? undefined : { textShadow: "0 1px 10px rgba(0,0,0,0.45)" }}
                  >
                    {link.label}
                    <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-accent-gold transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100" />
                  </Link>
                );
              }

              return (
                <div key={link.href} className="group/nav relative">
                  <Link
                    href={link.href}
                    className={cn(
                      "group relative flex items-center gap-1 py-1 text-sm font-medium tracking-wide transition-colors duration-300",
                      isSolid
                        ? "text-foreground/75 hover:text-foreground"
                        : "text-background/90 hover:text-background"
                    )}
                    style={isSolid ? undefined : { textShadow: "0 1px 10px rgba(0,0,0,0.45)" }}
                  >
                    {link.label}
                    <ChevronDown
                      size={13}
                      className="transition-transform duration-300 group-hover/nav:rotate-180"
                    />
                    <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-accent-gold transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100" />
                  </Link>

                  {/* Dropdown panel — no gap between trigger and panel so
                      hover intent survives the move down into the panel. */}
                  <div className="invisible absolute left-1/2 top-full z-50 w-72 -translate-x-1/2 translate-y-1 pt-3 opacity-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/nav:visible group-hover/nav:translate-y-0 group-hover/nav:opacity-100">
                    <div className="rounded-lg border border-border bg-background/95 p-2 shadow-soft-lg backdrop-blur-xl">
                      {dropdown.items.map((item) => (
                        // Keyed by label, not href — "Auction Properties" is
                        // a deliberate extra entry pointing at the same
                        // filtered URL as "Bank Auction Properties".
                        <Link
                          key={item.label}
                          href={item.href}
                          className="block rounded-sm px-4 py-2.5 text-sm text-foreground/75 transition-colors duration-200 hover:bg-surface hover:text-foreground"
                        >
                          {item.label}
                        </Link>
                      ))}
                      <div className="mt-1 border-t border-border pt-1">
                        <Link
                          href={dropdown.viewAllHref}
                          className="block rounded-sm px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-accent-gold-dark transition-colors duration-200 hover:bg-surface"
                        >
                          {dropdown.viewAllLabel}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => setModalOpen(true)}
              className={cn(
                "btn-fx hidden items-center gap-2 rounded-pill px-5 py-2.5 text-sm font-semibold transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:scale-[1.02] hover:shadow-soft active:translate-y-0 active:scale-[0.98] active:duration-150 sm:inline-flex",
                isSolid ? "bg-foreground text-background" : "border border-white/15 bg-foreground/20 text-background backdrop-blur-md"
              )}
            >
              <ButtonFX />
              <MessageCircle size={15} />
              Consult Us
            </button>

            {/* Mobile menu toggle */}
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300 md:hidden",
                isSolid
                  ? "text-foreground hover:bg-surface"
                  : "text-background hover:bg-background/10"
              )}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>

        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="mt-3 flex flex-col gap-1 rounded-lg border border-border bg-background/95 p-3 shadow-soft-lg backdrop-blur-xl md:hidden"
            >
              {LINKS.map((link) => {
                const dropdown = NAV_DROPDOWNS[link.label];
                if (!dropdown) {
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-sm px-4 py-3 text-sm font-medium text-foreground/80 transition-colors duration-200 hover:bg-surface hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  );
                }

                const isOpen = mobileOpenAccordion === link.label;
                return (
                  <div key={link.href}>
                    <div className="flex items-center rounded-sm text-foreground/80">
                      <Link
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className="flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 hover:bg-surface hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                      <button
                        type="button"
                        aria-label={isOpen ? `Collapse ${link.label}` : `Expand ${link.label}`}
                        aria-expanded={isOpen}
                        onClick={() => setMobileOpenAccordion((v) => (v === link.label ? null : link.label))}
                        className="flex h-11 w-11 items-center justify-center rounded-sm transition-colors duration-200 hover:bg-surface"
                      >
                        <ChevronDown
                          size={16}
                          className={cn("transition-transform duration-300", isOpen && "rotate-180")}
                        />
                      </button>
                    </div>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: EASE }}
                          className="overflow-hidden pl-3"
                        >
                          {dropdown.items.map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              onClick={() => setMenuOpen(false)}
                              className="block rounded-sm px-4 py-2.5 text-sm text-foreground/70 transition-colors duration-200 hover:bg-surface hover:text-foreground"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setModalOpen(true);
                }}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-pill bg-foreground px-5 py-3 text-sm font-semibold text-background w-full"
              >
                <MessageCircle size={15} />
                Consult Us
              </button>
            </motion.nav>
          )}
        </AnimatePresence>

        {/* ========================================================
            PREMIUM CONTACT DETAILS MODAL
            ======================================================== */}
        <AnimatePresence>
          {modalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
              onClick={() => setModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="relative w-full max-w-lg overflow-hidden rounded-md border border-[#C6A15B]/20 bg-[#F5F1E8] p-8 shadow-soft-lg text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setModalOpen(false)}
                  className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>

                <div className="space-y-6 text-[#171715]">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.15em] text-[#C6A15B] font-semibold">Contact & Location</span>
                    <h3 className="font-display text-2xl tracking-wide mt-1 text-[#171715]">Sarakki Homes</h3>
                    <div className="w-12 h-[1.5px] bg-[#C6A15B] mt-3" />
                  </div>

                  <div className="space-y-4 text-xs leading-relaxed">
                    <div className="flex gap-3 border-b border-border/60 pb-3">
                      <MapPin size={16} className="text-[#C6A15B] shrink-0 mt-0.5" />
                      <p className="font-semibold text-foreground uppercase text-[11px] tracking-wide leading-relaxed">
                        SARAKKI HOMES, # 5A, DR. PUNEETH RAJKUMAR ROAD, NEXT TO UNION BANK OF INDIA, OPP. NANDI GARDEN RESTAURANT, NEAR J P NAGAR METRO STATION, J P NAGAR 6TH PHASE, BENGALURU 560078.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Phone size={14} className="text-[#C6A15B] shrink-0" />
                        <p>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Phone</span>
                          <span className="font-semibold font-mono text-[11px]">080-41550138</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <MessageCircle size={14} className="text-[#C6A15B] shrink-0" />
                        <p>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Mobile / WhatsApp</span>
                          <span className="font-semibold font-mono text-[11px]">9663676464</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail size={14} className="text-[#C6A15B] shrink-0" />
                        <p>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Email</span>
                          <span className="font-semibold text-[11px]">SARAKKIHOMES@GMAIL.COM</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Globe size={14} className="text-[#C6A15B] shrink-0" />
                        <p>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Website</span>
                          <span className="font-semibold text-[11px]">SARAKKIHOMES.COM</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 pt-3 border-t border-border/60">
                      <Clock size={15} className="text-[#C6A15B] shrink-0 mt-0.5" />
                      <p>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Office Timings</span>
                        <span className="font-semibold text-[11px] uppercase">MONDAY TO SATURDAY 10 AM TO 7 PM. SUNDAY HOLIDAY.</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <a
                      href="https://maps.google.com/?q=Sarakki+Homes,+J+P+Nagar+6th+Phase,+Bengaluru"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 border border-[#C6A15B]/50 rounded-sm py-3 text-[10px] font-semibold uppercase tracking-wider text-[#C6A15B] hover:bg-[#E8DFD0] transition-colors"
                    >
                      <Map size={12} /> Location Map
                    </a>
                    <button
                      onClick={() => setModalOpen(false)}
                      className="px-6 rounded-sm bg-[#C6A15B] py-3 text-[10px] font-semibold uppercase tracking-wider text-background hover:bg-[#A98847] transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </motion.div>
  );
}
