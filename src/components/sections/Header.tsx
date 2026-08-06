"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, MessageCircle, X } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ButtonFX } from "@/components/ui/ButtonFX";
import { CONTACT } from "@/lib/data";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Properties", href: "/properties" },
  { label: "Services", href: "/services" },
  { label: "Our Process", href: "/process" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "FAQ", href: "/#faq" },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export function Header({ solid = false }: { solid?: boolean }) {
  const [scrolled, setScrolled] = useState(solid);
  const [menuOpen, setMenuOpen] = useState(false);

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
            {LINKS.map((link) => (
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
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <a
              href={CONTACT.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "btn-fx hidden items-center gap-2 rounded-pill px-5 py-2.5 text-sm font-semibold transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:scale-[1.02] hover:shadow-soft active:translate-y-0 active:scale-[0.98] active:duration-150 sm:inline-flex",
                isSolid ? "bg-foreground text-background" : "border border-white/15 bg-foreground/20 text-background backdrop-blur-md"
              )}
            >
              <ButtonFX />
              <MessageCircle size={15} />
              Consult Us
            </a>

            {/* Mobile menu toggle — the nav links above are md:hidden, so
                this is the only way to reach Properties/Services/Our
                Process/Testimonials/FAQ on a phone. */}
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
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-sm px-4 py-3 text-sm font-medium text-foreground/80 transition-colors duration-200 hover:bg-surface hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <a
                href={CONTACT.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-pill bg-foreground px-5 py-3 text-sm font-semibold text-background"
              >
                <MessageCircle size={15} />
                Consult Us
              </a>
            </motion.nav>
          )}
        </AnimatePresence>
      </Container>
    </motion.div>
  );
}
