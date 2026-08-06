"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import type { MediaTone } from "@/lib/data";
import { cn } from "@/lib/utils";

export function PropertyGallery({ images, title }: { images: MediaTone[]; title: string }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const next = () => setActive((a) => (a + 1) % images.length);
  const prev = () => setActive((a) => (a - 1 + images.length) % images.length);

  return (
    <div>
      <div className="relative h-[60vh] max-h-[560px] w-full overflow-hidden rounded-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <MediaPlaceholder tone={images[active]} className="h-full w-full" />
          </motion.div>
        </AnimatePresence>

        <button
          onClick={() => setLightbox(true)}
          aria-label="Expand gallery"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-foreground transition-transform duration-300 hover:scale-105"
        >
          <Expand size={16} />
        </button>

        <button
          onClick={prev}
          aria-label="Previous image"
          className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground transition-transform duration-300 hover:scale-105"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={next}
          aria-label="Next image"
          className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground transition-transform duration-300 hover:scale-105"
        >
          <ChevronRight size={18} />
        </button>

        <span className="absolute bottom-4 right-4 rounded-pill bg-background/90 px-3 py-1 text-xs font-semibold text-foreground">
          {active + 1} / {images.length}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-3">
        {images.map((tone, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              "h-20 overflow-hidden rounded-sm ring-2 ring-offset-2 ring-offset-background transition-all duration-300",
              i === active ? "ring-accent-gold" : "ring-transparent opacity-70 hover:opacity-100"
            )}
          >
            <MediaPlaceholder tone={tone} className="h-full w-full" grain={false} />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-foreground/95 p-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => setLightbox(false)}
          >
            <button
              aria-label="Close gallery"
              className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full border border-background/30 text-background transition-colors hover:bg-background/10"
            >
              <X size={18} />
            </button>
            <motion.div
              className="relative h-[80vh] w-full max-w-5xl overflow-hidden rounded-md"
              onClick={(e) => e.stopPropagation()}
            >
              <MediaPlaceholder tone={images[active]} className="h-full w-full" />
              <button
                onClick={prev}
                aria-label="Previous image"
                className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={next}
                aria-label="Next image"
                className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground"
              >
                <ChevronRight size={18} />
              </button>
            </motion.div>
            <p className="absolute bottom-8 font-display text-lg text-background/80">{title}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
