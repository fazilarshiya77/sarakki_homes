"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, ChevronLeft, ChevronRight, X, Expand } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import type { PublicBrochure } from "@/lib/brochures";

/**
 * Category-level brochure "library" — deliberately NOT built on the
 * PropertyCard visual language so a visitor can never mistake a
 * brochure for a property listing. Per client request, stripped down to
 * just the image itself: no card border/box, no title/description
 * copy, no "View"/"Download" links — click the image to view it
 * (fullscreen lightbox for an image brochure, the file itself in a new
 * tab for a PDF/Word/Excel one with nothing to preview).
 *
 * Renders nothing at all (not an empty state, not a heading with no
 * content under it) when `brochures` is empty — a category with no
 * brochures uploaded must show no trace of this section to a visitor,
 * per spec.
 */

// A brochure uploaded as a JPEG/PNG (the "any form of document" upload
// widens to plain images too, see /api/admin/upload-brochure) has no
// separate thumbnail to speak of — the file IS the image. Show it
// directly instead of falling back to the generic document icon, which
// otherwise hid the actual brochure content behind a placeholder.
const IMAGE_FILE_RE = /\.(jpe?g|png)$/i;

function previewSrcFor(brochure: PublicBrochure): string | null {
  return brochure.thumbnailUrl || (IMAGE_FILE_RE.test(brochure.fileUrl) ? brochure.fileUrl : null);
}

export function BrochureShowcase({ brochures }: { brochures: PublicBrochure[] }) {
  // Only brochures with an actual image to show are navigable in the
  // fullscreen lightbox — a PDF/Word/Excel brochure has no image to pop
  // up; clicking its tile opens the real file in a new tab instead.
  const imageBrochures = brochures.filter((b) => previewSrcFor(b) !== null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (brochure: PublicBrochure) => {
    const idx = imageBrochures.findIndex((b) => b.id === brochure.id);
    if (idx !== -1) setLightboxIndex(idx);
  };
  const closeLightbox = () => setLightboxIndex(null);
  const next = () => setLightboxIndex((i) => (i === null ? i : (i + 1) % imageBrochures.length));
  const prev = () => setLightboxIndex((i) => (i === null ? i : (i - 1 + imageBrochures.length) % imageBrochures.length));

  const active = lightboxIndex !== null ? imageBrochures[lightboxIndex] : null;

  // Esc closes the lightbox, left/right arrows slide — only listens
  // while the lightbox is actually open, so it never intercepts these
  // keys elsewhere on the page.
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxIndex]);

  if (brochures.length === 0) return null;

  // Sits directly between the category intro and the property grid —
  // Section's default py-16/py-24 on both this section AND the grid
  // section below it was stacking into a huge empty gap (each side
  // contributing its own top+bottom padding). Tightened to a single
  // reasonable gap instead of double padding (the grid section below
  // also drops its own top padding when brochures are present — see
  // the pages that render this component).
  return (
    <Section className="bg-surface !pb-10 md:!pb-14">
      <Container>
        <RevealOnScroll>
          <Eyebrow>Resource Library</Eyebrow>
          <h2 className="mt-3 font-display text-3xl leading-[1.1] tracking-[-0.01em] md:text-4xl">
            Property Brochures
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Downloadable guides covering pricing, process, and documentation for this category.
          </p>
        </RevealOnScroll>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {brochures.map((brochure, i) => (
            <RevealOnScroll key={brochure.id} delay={i * 0.05}>
              <BrochureTile brochure={brochure} onImageClick={() => openLightbox(brochure)} />
            </RevealOnScroll>
          ))}
        </div>
      </Container>

      {/* Fullscreen image lightbox — same close/slide pattern as
          PropertyGallery's lightbox elsewhere on the site, so this
          behaves the way a visitor already expects an image popup to. */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-foreground/95 p-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              aria-label="Close"
              className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full border border-background/30 text-background transition-colors hover:bg-background/10"
            >
              <X size={18} />
            </button>

            <motion.div
              key={active.id}
              className="relative h-[80vh] w-full max-w-5xl overflow-hidden rounded-md"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={previewSrcFor(active) as string}
                alt={active.title}
                fill
                sizes="100vw"
                className="object-contain"
              />

              {imageBrochures.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    aria-label="Previous brochure"
                    className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground transition-transform duration-300 hover:scale-105"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={next}
                    aria-label="Next brochure"
                    className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground transition-transform duration-300 hover:scale-105"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </motion.div>

            {imageBrochures.length > 1 && (
              <p className="absolute bottom-8 text-sm text-background/50">
                {lightboxIndex! + 1} / {imageBrochures.length}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}

function BrochureTile({
  brochure,
  onImageClick,
}: {
  brochure: PublicBrochure;
  onImageClick: () => void;
}) {
  const previewSrc = previewSrcFor(brochure);

  // Image brochures open the fullscreen lightbox; a document with no
  // image to preview (PDF/Word/Excel, no thumbnail) opens the real file
  // directly in a new tab instead — there's nothing else to click into.
  if (previewSrc) {
    return (
      <button
        type="button"
        onClick={onImageClick}
        aria-label={`Expand ${brochure.title}`}
        className="group relative block aspect-[4/3] w-full overflow-hidden rounded-md bg-card"
      >
        {/* object-contain, not object-cover — the whole flyer/brochure
            should be readable in the tile, not cropped to fill a fixed
            box. bg-card fills the letterboxed space around it. */}
        <Image src={previewSrc} alt={brochure.title} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" className="object-contain transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-foreground/0 transition-colors duration-200 group-hover:bg-foreground/10">
          <Expand size={20} className="text-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        </div>
      </button>
    );
  }

  return (
    <a
      href={brochure.fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${brochure.title}`}
      className="group relative block aspect-[4/3] w-full overflow-hidden rounded-md bg-gradient-to-br from-accent-emerald to-accent-emerald-dark transition-transform duration-300 hover:scale-[1.02]"
    >
      <div className="flex h-full w-full items-center justify-center">
        <FileText size={32} className="text-accent-gold" strokeWidth={1.5} />
      </div>
    </a>
  );
}
