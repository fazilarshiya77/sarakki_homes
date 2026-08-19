"use client";

import { useState } from "react";
import { Star, ChevronLeft, ChevronRight, Phone, MapPin, Clock, Mail, Globe, Map } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

export interface TestimonialData {
  name: string;
  initials: string;
  location: string;
  category: string;
  quote: string;
}

// This book-flip layout is physically fixed at 4 pages (see the leafIndex
// choreography below and the hardcoded [0]/[1]/[2]/[3] lookups) — it's not
// a generic list renderer. `testimonials` is expected to carry exactly 4
// live records from the database (see src/lib/testimonials.ts); if fewer
// exist we cycle through the real ones rather than inventing filler copy.
export function Testimonials({ testimonials }: { testimonials: TestimonialData[] }) {
  const CLIENT_TESTIMONIALS: TestimonialData[] =
    testimonials.length >= 4
      ? testimonials.slice(0, 4)
      : Array.from({ length: 4 }, (_, i) => testimonials[i % Math.max(testimonials.length, 1)]).filter(Boolean);

  // Leaf indices flipped (0 to 5)
  // At leafIndex = 0: Closed Cover.
  // At leafIndex = 1: Leaf 0 flipped (Index / Ramesh). — the book's resting, "open" state.
  // At leafIndex = 2: Leaf 0 & 1 flipped (Divya / Kavitha).
  // At leafIndex = 3: Leaf 0, 1, 2 flipped (Rajesh / CTA).
  // At leafIndex = 4: Leaf 0, 1, 2, 3 flipped (Contact / Brand).
  // At leafIndex = 5: All leaves flipped (Back Cover).
  // Book opens straight to the first spread rather than a closed cover —
  // per design, the book always reads as "open" on load.
  const [currentLeaf, setCurrentLeaf] = useState(1);
  const [mobilePage, setMobilePage] = useState(0);

  // The single leaf currently mid-flip, so it can ride the wavy keyframe
  // animation while every other leaf just holds its resting transform.
  const [flip, setFlip] = useState<{ leaf: number; dir: "forward" | "backward" } | null>(null);

  const flipForward = () => {
    if (currentLeaf < 5) {
      setFlip({ leaf: currentLeaf, dir: "forward" });
      setCurrentLeaf((c) => c + 1);
    }
  };

  const flipBackward = () => {
    if (currentLeaf > 0) {
      setFlip({ leaf: currentLeaf - 1, dir: "backward" });
      setCurrentLeaf((c) => c - 1);
    }
  };

  // Jumping straight to a spread (e.g. from the index page) turns multiple
  // leaves at once — a wavy single-page animation doesn't apply, so it just
  // settles via the plain transition below.
  const goToLeaf = (leafIndex: number) => {
    setFlip(null);
    setCurrentLeaf(leafIndex);
  };

  const clearFlip = (leaf: number) => {
    setFlip((prev) => (prev?.leaf === leaf ? null : prev));
  };

  const leafStyle = (leaf: number, zFlipped: number, zUnflipped: number) => {
    const isFlipped = currentLeaf >= leaf + 1;
    if (flip?.leaf === leaf) {
      // Mid-flip: let the animate-flip-forward/backward keyframes drive
      // transform + box-shadow. z-index must stay ABOVE every resting leaf
      // for the whole turn — settling to the post-flip value immediately
      // (as this used to) drops the turning page below its static neighbor
      // within the first ~80ms, hiding almost the entire curl behind it and
      // leaving only a sliver of the 3D bulge visible. A page mid-turn has
      // to arc over the whole book, not disappear behind the page it's
      // landing on.
      return { zIndex: 100 };
    }
    return {
      transform: isFlipped ? "rotateY(-180deg)" : "rotateY(0deg)",
      zIndex: isFlipped ? zFlipped : zUnflipped,
      transition: "transform 0.6s var(--ease-symmetric)",
    };
  };

  const leafClassName = (leaf: number) =>
    flip?.leaf === leaf ? (flip.dir === "forward" ? "animate-flip-forward" : "animate-flip-backward") : "";

  // Front and back faces are coplanar (both sit at inset-0 within the same
  // 3D wrapper, differing only by rotation) — some engines resolve
  // elementFromPoint on that coincident plane ambiguously despite
  // backface-visibility:hidden. Gate hit-testing explicitly from state
  // instead of leaning on that rendering hint, so only the face actually
  // on top can ever receive the click.
  const frontFacePointerEvents = (leaf: number): "auto" | "none" =>
    currentLeaf >= leaf + 1 ? "none" : "auto";
  const backFacePointerEvents = (leaf: number): "auto" | "none" =>
    currentLeaf >= leaf + 1 ? "auto" : "none";

  const nextMobile = () => {
    if (mobilePage < 8) setMobilePage(mobilePage + 1);
  };

  const prevMobile = () => {
    if (mobilePage > 0) setMobilePage(mobilePage - 1);
  };

  // No reviews in the database yet — nothing to show, and never fabricated.
  if (CLIENT_TESTIMONIALS.length === 0) return null;

  return (
    <Section id="testimonials" className="bg-accent-emerald-dark relative overflow-hidden !py-24 md:!py-36">
      {/* Soft radial vignette background — a signature dark-forest brand moment */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,rgba(0,0,0,0.18)_100%)] pointer-events-none" />

      <Container className="relative z-10 flex flex-col items-center">
        <div className="text-center mb-16 max-w-2xl">
          <Eyebrow light className="justify-center">Client Trust</Eyebrow>
          <h2 className="mt-5 font-display text-4xl font-medium leading-[1.08] tracking-[-0.01em] md:text-5xl text-background">
            Client Stories &amp; Office Locations
          </h2>
        </div>

        {/* ========================================================
            DESKTOP VIEW (Real 3D Page Flip Book Layout - 5 Leaves)
            ======================================================== */}
        <div className="hidden md:flex flex-col items-center w-full max-w-5xl">
          {/* Perspective Book Wrapper */}
          <div className="relative w-full aspect-[16/10] select-none book-perspective">
            
            {/* Elegant Ambient Book Shadow under pages */}
            <div className="absolute inset-x-8 bottom-[-20px] h-12 bg-black/10 rounded-full blur-2xl pointer-events-none" />

            {/* Spine seam shadow overlay */}
            {currentLeaf > 0 && currentLeaf < 5 && (
              <div className="absolute top-0 bottom-0 left-[calc(50%-15px)] w-[30px] bg-gradient-to-r from-black/5 via-black/15 to-black/5 z-30 pointer-events-none rounded-sm" />
            )}

            {/* Left Static Shadow to simulate depth under flipped pages */}
            <div 
              className={`absolute top-0 left-[2%] w-[48%] h-full bg-black/5 rounded-l-lg blur-md pointer-events-none z-0 transition-opacity duration-500 ${
                currentLeaf > 0 ? "opacity-100" : "opacity-0"
              }`}
            />
            {/* Right Static Shadow under unflipped pages */}
            <div 
              className={`absolute top-0 right-[2%] w-[48%] h-full bg-black/5 rounded-r-lg blur-md pointer-events-none z-0 transition-opacity duration-500 ${
                currentLeaf < 5 ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* ==================== LEAF 0 (Closed Cover / Index Page) ==================== */}
            <div
              className={`absolute top-0 right-0 w-1/2 h-full origin-left preserve-3d ${leafClassName(0)}`}
              style={{ ...leafStyle(0, 10, 50), willChange: "transform" }}
              onAnimationEnd={() => clearFlip(0)}
            >
              {/* Cover Front Side */}
              <div
                onClick={flipForward}
                style={{ pointerEvents: frontFacePointerEvents(0) }}
                className="page-face-right absolute inset-0 bg-[#052C27] border border-[#C6A15B]/30 shadow-[inset_-2px_0_10px_rgba(0,0,0,0.4)] p-12 flex flex-col justify-between items-center text-center backface-hidden rounded-r-md"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,rgba(0,0,0,0.15)_100%)] mix-blend-overlay pointer-events-none" />
                <div className="absolute inset-4 border border-[#C6A15B]/20 pointer-events-none rounded-sm" />

                <div className="absolute top-6 left-6 w-4 h-4 border-t border-l border-[#C6A15B]/30" />
                <div className="absolute top-6 right-6 w-4 h-4 border-t border-r border-[#C6A15B]/30" />
                <div className="absolute bottom-6 left-6 w-4 h-4 border-b border-l border-[#C6A15B]/30" />
                <div className="absolute bottom-6 right-6 w-4 h-4 border-b border-r border-[#C6A15B]/30" />

                <span className="text-xs uppercase tracking-[0.2em] text-[#C6A15B]/60 font-semibold mt-8">Exclusive Portfolio</span>

                <div className="flex flex-col items-center">
                  <h3 className="font-display text-4xl text-[#F0E3C3] tracking-wider font-bold">
                    SARAKKI HOMES
                  </h3>
                  <div className="w-12 h-[1px] bg-[#C6A15B]/40 my-6" />
                  <p className="font-display text-lg italic text-[#C6A15B] tracking-wide">
                    Trusted Property Stories
                  </p>
                </div>

                <span className="text-[10px] uppercase tracking-[0.15em] text-[#F0E3C3]/40 mb-8 hover:text-[#C6A15B] transition-colors">
                  Click to Open Portfolio →
                </span>
              </div>

              {/* Cover Back Side (Index Page) */}
              <div
                onClick={flipBackward}
                style={{ pointerEvents: backFacePointerEvents(0) }}
                className="page-face-left absolute inset-0 bg-[#F0E3C3] p-12 pr-16 flex flex-col justify-between backface-hidden rotate-y-180 rounded-l-md shadow-[inset_10px_0_20px_rgba(0,0,0,0.03)] border-r border-black/5"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,rgba(248,246,240,0.2)_100%)] pointer-events-none" />

                <div className="flex flex-col h-full justify-between relative z-10">
                  <div>
                    <h4 className="font-display text-2xl tracking-wide text-[#171715]">Client Stories</h4>
                    <p className="text-xs text-muted-foreground mt-1">A curated ledger of successful real estate acquisitions.</p>

                    <div className="mt-8 space-y-4">
                      {CLIENT_TESTIMONIALS.map((t, idx) => (
                        <div
                          key={t.name}
                          onClick={(e) => {
                            e.stopPropagation();
                            goToLeaf(Math.floor(idx / 2) + 1);
                          }}
                          className="flex items-center gap-4 p-3 rounded-sm hover:bg-[#E9D9AE] transition-colors cursor-pointer group border border-transparent hover:border-border/40"
                        >
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#C6A15B]/40 bg-[#F0E3C3] text-xs font-semibold font-display text-[#C6A15B] shadow-sm">
                            {t.initials}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm text-[#171715] group-hover:text-accent-gold-dark transition-colors">
                              {t.name}
                            </span>
                            <span className="text-[10px] uppercase tracking-wide text-muted-foreground mt-0.5">
                              {t.location}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Index Page • Portfolio Vol. I</span>
                </div>
              </div>
            </div>

            {/* ==================== LEAF 1 (Testimonial 1 / Testimonial 2) ==================== */}
            <div
              className={`absolute top-0 right-0 w-1/2 h-full origin-left preserve-3d ${leafClassName(1)}`}
              style={{ ...leafStyle(1, 11, 40), willChange: "transform" }}
              onAnimationEnd={() => clearFlip(1)}
            >
              {/* Leaf 1 Front (Ramesh Iyer) */}
              <div
                onClick={flipForward}
                style={{ pointerEvents: frontFacePointerEvents(1) }}
                className="page-face-right absolute inset-0 bg-[#F0E3C3] p-12 pl-16 flex flex-col justify-between backface-hidden rounded-r-md shadow-[inset_-10px_0_20px_rgba(0,0,0,0.03)] border-l border-black/5"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,rgba(248,246,240,0.2)_100%)] pointer-events-none" />
                <TestimonialPage testimonial={CLIENT_TESTIMONIALS[0]} pageNum={2} />
              </div>

              {/* Leaf 1 Back (Divya & Arjun Rao) */}
              <div
                onClick={flipBackward}
                style={{ pointerEvents: backFacePointerEvents(1) }}
                className="page-face-left absolute inset-0 bg-[#F0E3C3] p-12 pr-16 flex flex-col justify-between backface-hidden rotate-y-180 rounded-l-md shadow-[inset_10px_0_20px_rgba(0,0,0,0.03)] border-r border-black/5"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,rgba(248,246,240,0.2)_100%)] pointer-events-none" />
                <TestimonialPage testimonial={CLIENT_TESTIMONIALS[1]} pageNum={3} />
              </div>
            </div>

            {/* ==================== LEAF 2 (Testimonial 3 / Testimonial 4) ==================== */}
            <div
              className={`absolute top-0 right-0 w-1/2 h-full origin-left preserve-3d ${leafClassName(2)}`}
              style={{ ...leafStyle(2, 12, 30), willChange: "transform" }}
              onAnimationEnd={() => clearFlip(2)}
            >
              {/* Leaf 2 Front (Kavitha Menon) */}
              <div
                onClick={flipForward}
                style={{ pointerEvents: frontFacePointerEvents(2) }}
                className="page-face-right absolute inset-0 bg-[#F0E3C3] p-12 pl-16 flex flex-col justify-between backface-hidden rounded-r-md shadow-[inset_-10px_0_20px_rgba(0,0,0,0.03)] border-l border-black/5"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,rgba(248,246,240,0.2)_100%)] pointer-events-none" />
                <TestimonialPage testimonial={CLIENT_TESTIMONIALS[2]} pageNum={4} />
              </div>

              {/* Leaf 2 Back (Rajesh Khanna) */}
              <div
                onClick={flipBackward}
                style={{ pointerEvents: backFacePointerEvents(2) }}
                className="page-face-left absolute inset-0 bg-[#F0E3C3] p-12 pr-16 flex flex-col justify-between backface-hidden rotate-y-180 rounded-l-md shadow-[inset_10px_0_20px_rgba(0,0,0,0.03)] border-r border-black/5"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,rgba(248,246,240,0.2)_100%)] pointer-events-none" />
                <TestimonialPage testimonial={CLIENT_TESTIMONIALS[3]} pageNum={5} />
              </div>
            </div>

            {/* ==================== LEAF 3 (CTA / Contact Details) ==================== */}
            <div
              className={`absolute top-0 right-0 w-1/2 h-full origin-left preserve-3d ${leafClassName(3)}`}
              style={{ ...leafStyle(3, 13, 20), willChange: "transform" }}
              onAnimationEnd={() => clearFlip(3)}
            >
              {/* Leaf 3 Front (CTA Page) */}
              <div
                onClick={flipForward}
                style={{ pointerEvents: frontFacePointerEvents(3) }}
                className="page-face-right absolute inset-0 bg-[#F0E3C3] p-12 pl-16 flex flex-col justify-between backface-hidden rounded-r-md shadow-[inset_-10px_0_20px_rgba(0,0,0,0.03)] border-l border-black/5"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,rgba(248,246,240,0.2)_100%)] pointer-events-none" />

                <div className="flex flex-col h-full justify-between items-center text-center relative z-10">
                  <div className="my-auto max-w-sm space-y-6">
                    <span className="text-xs uppercase tracking-[0.15em] text-[#C6A15B] font-semibold">Your Next Chapter</span>
                    <h4 className="font-display text-3xl leading-tight text-[#171715]">
                      Begin Your Investment Journey
                    </h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Let our consultants guide your acquisitions with data-backed due diligence, legal verification, and absolute compliance.
                    </p>
                    <div className="pt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          flipForward();
                        }}
                        className="inline-flex items-center justify-center rounded-sm bg-[#C6A15B] px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#F0E3C3] transition-all hover:bg-[#B3955A] hover:shadow-md"
                      >
                        Contact & Location Details
                      </button>
                    </div>
                  </div>

                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground w-full text-right">Page 6 • Sarakki Homes</span>
                </div>
              </div>

              {/* Leaf 3 Back (Office Contact Details & Timings) */}
              <div
                onClick={flipBackward}
                style={{ pointerEvents: backFacePointerEvents(3) }}
                className="page-face-left absolute inset-0 bg-[#F0E3C3] p-12 pr-16 flex flex-col justify-between backface-hidden rotate-y-180 rounded-l-md shadow-[inset_10px_0_20px_rgba(0,0,0,0.03)] border-r border-black/5 text-xs"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,rgba(248,246,240,0.2)_100%)] pointer-events-none" />
                
                <div className="flex flex-col h-full justify-between relative z-10 text-[#171715]">
                  <div className="space-y-5">
                    <h4 className="font-display text-2xl tracking-wide">Office Location</h4>
                    <div className="w-12 h-[1.5px] bg-[#C6A15B]" />
                    
                    <div className="space-y-4 text-xs leading-relaxed">
                      <div className="flex gap-3">
                        <MapPin size={16} className="text-[#C6A15B] shrink-0 mt-0.5" />
                        <p className="font-semibold text-foreground/90 uppercase text-[11px] tracking-wide">
                          SARAKKI HOMES, # 5A, DR. PUNEETH RAJKUMAR ROAD, NEXT TO UNION BANK OF INDIA, OPP. NANDI GARDEN RESTAURANT, NEAR J P NAGAR METRO STATION, J P NAGAR 6TH PHASE, BENGALURU 560078.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-3.5 pt-2 border-t border-border/60">
                        <div className="flex items-center gap-3">
                          <Phone size={14} className="text-[#C6A15B] shrink-0" />
                          <p>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Phone</span>
                            <span className="font-semibold font-mono text-[11px]">080-41550138</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Globe size={14} className="text-[#C6A15B] shrink-0" />
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
                          <Clock size={14} className="text-[#C6A15B] shrink-0" />
                          <p>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Office Timings</span>
                            <span className="font-semibold text-[11px]">Mon to Sat: 10 AM - 7 PM (Sunday Holiday)</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <a
                      href="https://maps.google.com/?q=Sarakki+Homes,+J+P+Nagar+6th+Phase,+Bengaluru"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-2 border border-[#C6A15B]/50 rounded-sm px-4 py-2 hover:bg-[#E9D9AE] transition-colors font-semibold text-[10px] uppercase tracking-wider text-[#C6A15B]"
                    >
                      <Map size={12} /> View Location Map
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* ==================== LEAF 4 (Emblem Page / Back Cover) ==================== */}
            <div
              className={`absolute top-0 right-0 w-1/2 h-full origin-left preserve-3d ${leafClassName(4)}`}
              style={{ ...leafStyle(4, 14, 10), willChange: "transform" }}
              onAnimationEnd={() => clearFlip(4)}
            >
              {/* Leaf 4 Front (Brand Emblem Page) */}
              <div
                onClick={flipForward}
                style={{ pointerEvents: frontFacePointerEvents(4) }}
                className="page-face-right absolute inset-0 bg-[#F0E3C3] p-12 pl-16 flex flex-col justify-between backface-hidden rounded-r-md shadow-[inset_-10px_0_20px_rgba(0,0,0,0.03)] border-l border-black/5"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,rgba(248,246,240,0.2)_100%)] pointer-events-none" />

                <div className="flex flex-col h-full justify-between items-center text-center relative z-10">
                  <div className="my-auto max-w-xs space-y-6">
                    <span className="h-10 w-10 rounded-full border border-[#C6A15B]/30 flex items-center justify-center text-[#C6A15B] font-display text-sm mx-auto">S</span>
                    <h4 className="font-display text-xl tracking-widest text-[#171715] uppercase font-bold">
                      Sarakki Homes
                    </h4>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Guiding the journey through legal validation, structural transparency, and complete real estate compliance.
                    </p>
                    <div className="pt-2">
                      <a
                        href="https://wa.me/919845000000?text=Hi%20Sarakki%20Homes%2C%20I%27d%20like%20to%20book%20a%20consultation."
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center justify-center rounded-sm bg-[#C6A15B] px-6 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#F0E3C3] transition-all hover:bg-[#B3955A]"
                      >
                        Book a Consultation
                      </a>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground w-full text-right">Page 7 • Vol. I</span>
                </div>
              </div>

              {/* Leaf 4 Back (Closed Back Cover) */}
              <div
                onClick={flipBackward}
                style={{ pointerEvents: backFacePointerEvents(4) }}
                className="page-face-left absolute inset-0 bg-[#052C27] border border-[#C6A15B]/30 shadow-[inset_2px_0_10px_rgba(0,0,0,0.4)] p-12 flex flex-col justify-between items-center text-center backface-hidden rotate-y-180 rounded-l-md"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,rgba(0,0,0,0.15)_100%)] mix-blend-overlay pointer-events-none" />
                <div className="absolute inset-4 border border-[#C6A15B]/20 pointer-events-none rounded-sm" />

                <div className="absolute top-6 left-6 w-4 h-4 border-t border-l border-[#C6A15B]/30" />
                <div className="absolute top-6 right-6 w-4 h-4 border-t border-r border-[#C6A15B]/30" />
                <div className="absolute bottom-6 left-6 w-4 h-4 border-b border-l border-[#C6A15B]/30" />
                <div className="absolute bottom-6 right-6 w-4 h-4 border-b border-r border-[#C6A15B]/30" />

                <span className="text-[#C6A15B]/40 text-[10px] uppercase tracking-[0.2em] font-semibold mt-8">End of Portfolio</span>

                <div className="flex flex-col items-center">
                  <span className="h-6 w-6 rounded-full border border-[#C6A15B]/40 flex items-center justify-center text-[#C6A15B] font-display text-xs mb-4">S</span>
                  <p className="font-display text-base tracking-[0.1em] text-[#F0E3C3]/80 font-bold uppercase">
                    Sarakki Homes
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-2">© 2026 All Rights Reserved.</p>
                </div>

                <span className="text-[10px] uppercase tracking-[0.15em] text-[#F0E3C3]/40 mb-8 hover:text-[#C6A15B] transition-colors">
                  ← Go Back
                </span>
              </div>
            </div>

            {/* Navigation Handles on sides */}
            {currentLeaf > 0 && (
              <button
                onClick={flipBackward}
                className="absolute left-[-60px] top-[calc(50%-22px)] h-11 w-11 rounded-full border border-border bg-[#F0E3C3] shadow-soft flex items-center justify-center hover:bg-[#E9D9AE] hover:-translate-x-0.5 transition-all text-[#171715] z-40"
                aria-label="Previous Page"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            {currentLeaf < 5 && (
              <button
                onClick={flipForward}
                className="absolute right-[-60px] top-[calc(50%-22px)] h-11 w-11 rounded-full border border-border bg-[#F0E3C3] shadow-soft flex items-center justify-center hover:bg-[#E9D9AE] hover:translate-x-0.5 transition-all text-[#171715] z-40"
                aria-label="Next Page"
              >
                <ChevronRight size={20} />
              </button>
            )}
          </div>

          {/* Spread Indicator dots */}
          <div className="flex items-center gap-2 mt-8">
            {[0, 1, 2, 3, 4, 5].map((idx) => (
              <button
                key={idx}
                onClick={() => goToLeaf(idx)}
                className={`h-1.5 transition-all duration-300 rounded-full ${
                  currentLeaf === idx ? "w-6 bg-[#C6A15B]" : "w-1.5 bg-[#C6A15B]/20"
                }`}
                aria-label={`Go to page spread ${idx}`}
              />
            ))}
          </div>
        </div>

        {/* ========================================================
            MOBILE VIEW (Swipe/Touch single page helper - 9 states)
            ======================================================== */}
        <div className="flex md:hidden flex-col items-center w-full max-w-sm">
          <div className="relative w-full aspect-[4/5] rounded-md border border-black/10 bg-[#F0E3C3] shadow-[0_20px_50px_rgba(0,0,0,0.12)] overflow-hidden p-8 flex flex-col justify-between select-none">
            
            {mobilePage === 0 && (
              <div className="absolute inset-0 bg-[#052C27] p-8 flex flex-col justify-between items-center text-center">
                <div className="absolute inset-4 border border-[#C6A15B]/20 pointer-events-none rounded-sm" />
                <span className="text-[10px] uppercase tracking-[0.15em] text-[#C6A15B]/60 font-semibold mt-4">Exclusive Portfolio</span>
                <div className="flex flex-col items-center">
                  <h3 className="font-display text-3xl text-[#F0E3C3] tracking-wider font-bold">
                    SARAKKI HOMES
                  </h3>
                  <div className="w-10 h-[1px] bg-[#C6A15B]/40 my-4" />
                  <p className="font-display text-sm italic text-[#C6A15B] tracking-wide">
                    Trusted Property Stories
                  </p>
                </div>
                <span className="text-[9px] uppercase tracking-[0.12em] text-[#F0E3C3]/40 mb-4" onClick={nextMobile}>
                  Tap Next to Open Portfolio →
                </span>
              </div>
            )}

            {mobilePage === 1 && (
              <div className="h-full flex flex-col justify-between">
                <div>
                  <h4 className="font-display text-xl tracking-wide text-[#171715]">Client Stories</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Vetted transaction logs.</p>
                  
                  <div className="mt-6 space-y-2.5">
                    {CLIENT_TESTIMONIALS.map((t, idx) => (
                      <div
                        key={t.name}
                        onClick={() => setMobilePage(idx + 2)}
                        className="flex items-center gap-3 p-2.5 rounded-sm bg-[#E9D9AE]/40 border border-border/20 cursor-pointer"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#C6A15B]/40 bg-[#F0E3C3] text-[10px] font-semibold font-display text-[#C6A15B]">
                          {t.initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs text-[#171715]">
                            {t.name}
                          </span>
                          <span className="text-[9px] uppercase tracking-wide text-muted-foreground">
                            {t.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Index Page • Sarakki Homes</span>
              </div>
            )}

            {mobilePage >= 2 && mobilePage <= 5 && (
              <div className="h-full flex flex-col justify-between">
                <MobileTestimonialPage testimonial={CLIENT_TESTIMONIALS[mobilePage - 2]} pageNum={mobilePage - 1} />
              </div>
            )}

            {mobilePage === 6 && (
              <div className="h-full flex flex-col justify-between items-center text-center">
                <div className="my-auto space-y-4">
                  <span className="text-[10px] uppercase tracking-[0.12em] text-[#C6A15B] font-semibold">Your Next Chapter</span>
                  <h4 className="font-display text-2xl leading-snug text-[#171715]">
                    Begin Your Investment Journey
                  </h4>
                  <p className="text-xs leading-relaxed text-muted-foreground max-w-[280px] mx-auto">
                    Let our consultants guide your acquisitions with data-backed due diligence, legal verification, and absolute compliance.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={nextMobile}
                      className="inline-flex items-center justify-center rounded-sm bg-[#C6A15B] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#F0E3C3]"
                    >
                      Contact & Locations
                    </button>
                  </div>
                </div>
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Page 6 • Sarakki Homes</span>
              </div>
            )}

            {mobilePage === 7 && (
              <div className="h-full flex flex-col justify-between relative z-10 text-[#171715] text-xs">
                <div className="space-y-4">
                  <h4 className="font-display text-xl tracking-wide">Office Contact</h4>
                  
                  <div className="space-y-3.5 leading-relaxed text-[11px]">
                    <div className="flex gap-2">
                      <MapPin size={14} className="text-[#C6A15B] shrink-0 mt-0.5" />
                      <p className="font-semibold text-foreground/90 uppercase text-[9px]">
                        SARAKKI HOMES, # 5A, DR. PUNEETH RAJKUMAR ROAD, NEXT TO UNION BANK, J P NAGAR 6TH PHASE, BENGALURU 560078.
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border/40">
                      <p><span className="text-[9px] uppercase text-muted-foreground">Phone:</span> 080-41550138</p>
                      <p><span className="text-[9px] uppercase text-muted-foreground">WhatsApp:</span> 9663676464</p>
                      <p><span className="text-[9px] uppercase text-muted-foreground">Email:</span> SARAKKIHOMES@GMAIL.COM</p>
                      <p><span className="text-[9px] uppercase text-muted-foreground">Timings:</span> Mon-Sat 10AM-7PM (Sun Holiday)</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center border-t border-border/40">
                  <a
                    href="https://maps.google.com/?q=Sarakki+Homes,+J+P+Nagar+6th+Phase,+Bengaluru"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 border border-[#C6A15B]/50 rounded-sm px-3 py-1.5 text-[9px] uppercase tracking-wider text-[#C6A15B]"
                  >
                    <Map size={10} /> Maps Location
                  </a>
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Page 7</span>
                </div>
              </div>
            )}

            {mobilePage === 8 && (
              <div className="absolute inset-0 bg-[#052C27] p-8 flex flex-col justify-between items-center text-center">
                <div className="absolute inset-4 border border-[#C6A15B]/20 pointer-events-none rounded-sm" />
                <span className="text-[#C6A15B]/40 text-[9px] uppercase tracking-[0.15em] font-semibold mt-4">End of Portfolio</span>
                <div className="flex flex-col items-center">
                  <span className="h-5 w-5 rounded-full border border-[#C6A15B]/40 flex items-center justify-center text-[#C6A15B] font-display text-[10px] mb-3">S</span>
                  <p className="font-display text-sm tracking-[0.1em] text-[#F0E3C3]/80 font-bold uppercase">
                    Sarakki Homes
                  </p>
                  <p className="text-[9px] text-muted-foreground mt-1">© 2026 All Rights Reserved.</p>
                </div>
                <span className="text-[9px] uppercase tracking-[0.12em] text-[#F0E3C3]/40 mb-4" onClick={() => setMobilePage(0)}>
                  ← Restart Portfolio
                </span>
              </div>
            )}

          </div>

          {/* Mobile Arrows controls */}
          <div className="flex items-center justify-between w-full mt-6 px-4">
            <button
              onClick={prevMobile}
              disabled={mobilePage === 0}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#171715] disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              {mobilePage === 0 ? "Cover" : mobilePage === 8 ? "Back" : `${mobilePage} of 7`}
            </span>
            <button
              onClick={nextMobile}
              disabled={mobilePage === 8}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#171715] disabled:opacity-30 disabled:pointer-events-none"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* ========================================================
    DESKTOP TESTIMONIAL PAGE SUB-COMPONENT
    ======================================================== */
function TestimonialPage({ testimonial, pageNum }: { testimonial: TestimonialData; pageNum: number }) {
  return (
    <div className="flex flex-col h-full justify-between relative">
      {/* Elegantly oversized quote symbol background */}
      <span className="absolute top-2 left-[-16px] font-display text-[9rem] text-[#C6A15B]/10 leading-none select-none">
        &ldquo;
      </span>

      <div className="relative z-10 space-y-6">
        {/* Customer Monogram Badge Ring */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#C6A15B]/40 bg-[#F0E3C3] text-lg font-semibold font-display text-[#C6A15B] shadow-sm select-none">
            {testimonial.initials}
          </div>
          <div className="flex flex-col">
            <h5 className="font-display text-xl font-bold tracking-wide text-[#171715]">{testimonial.name}</h5>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
              {testimonial.location}
            </span>
          </div>
        </div>

        {/* Gold Star Ratings */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={11} fill="#C6A15B" className="text-[#C6A15B]" />
          ))}
        </div>

        {/* Large Quote */}
        <p className="font-display text-2xl italic leading-relaxed text-[#171715]/90 font-light pr-2">
          &ldquo;{testimonial.quote}&rdquo;
        </p>

        {/* Signature-style calligraphy loops divider line */}
        <div className="pt-2 flex items-center gap-3">
          <div className="w-16 h-[1px] bg-[#C6A15B]/30" />
          <svg className="w-12 h-6 text-[#C6A15B]/40" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 20 C 30 5, 40 35, 50 20 C 60 5, 70 35, 90 20" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
          <div className="flex-1 h-[1px] bg-[#C6A15B]/30" />
        </div>

        {/* Property Type / Category badge */}
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C6A15B] bg-[#C6A15B]/8 px-3 py-1 rounded-sm">
            {testimonial.category}
          </span>
        </div>
      </div>

      <span className="text-[10px] uppercase tracking-wider text-muted-foreground text-right w-full">
        Page {pageNum} • Ledger Records
      </span>
    </div>
  );
}

/* ========================================================
    MOBILE TESTIMONIAL PAGE SUB-COMPONENT
    ======================================================== */
function MobileTestimonialPage({ testimonial, pageNum }: { testimonial: TestimonialData; pageNum: number }) {
  return (
    <div className="flex flex-col h-full justify-between relative">
      <span className="absolute top-0 left-[-8px] font-display text-[7rem] text-[#C6A15B]/8 leading-none select-none">
        &ldquo;
      </span>

      <div className="relative z-10 space-y-4">
        {/* Customer Badge */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#C6A15B]/40 bg-[#F0E3C3] text-sm font-semibold font-display text-[#C6A15B] shadow-sm">
            {testimonial.initials}
          </div>
          <div className="flex flex-col">
            <h5 className="font-display text-base font-bold text-[#171715]">{testimonial.name}</h5>
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
              {testimonial.location}
            </span>
          </div>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={10} fill="#C6A15B" className="text-[#C6A15B]" />
          ))}
        </div>

        {/* Quote */}
        <p className="font-display text-lg italic leading-relaxed text-[#171715]/90 font-light">
          &ldquo;{testimonial.quote}&rdquo;
        </p>

        {/* Divider SVG */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-[1px] bg-[#C6A15B]/20" />
          <svg className="w-8 h-4 text-[#C6A15B]/30" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 20 C 30 5, 40 35, 50 20 C 60 5, 70 35, 90 20" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
          <div className="flex-1 h-[1px] bg-[#C6A15B]/20" />
        </div>

        {/* Category */}
        <div>
          <span className="text-[8px] font-semibold uppercase tracking-wider text-[#C6A15B] bg-[#C6A15B]/8 px-2 py-0.5 rounded-sm">
            {testimonial.category}
          </span>
        </div>
      </div>

      <span className="text-[9px] uppercase tracking-wider text-muted-foreground w-full text-right">
        Page {pageNum} • stories
      </span>
    </div>
  );
}
