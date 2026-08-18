"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, MapPin, MessageCircle, Search } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Counter } from "@/components/ui/Counter";
import { ButtonFX } from "@/components/ui/ButtonFX";
import { STATS } from "@/lib/data";
import { useSiteSettings } from "@/components/providers/SettingsProvider";
import { heroDelayMs } from "@/lib/heroTiming";

const EASE = [0.22, 1, 0.36, 1] as const;

/** A simple, static hero — the property photograph, headline, CTAs, search
 *  and stats are all in place immediately. No scroll-linked expansion or
 *  crossfade; the only motion is a one-time staggered fade-in on load. */
export function Hero() {
  const { contact: CONTACT, heroTitle, heroDescription } = useSiteSettings();

  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col overflow-hidden bg-foreground"
    >
      <div className="absolute inset-0">
        <Image
          src="/media/re.jpg"
          alt="Sarakki Homes — premium residential property"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Cinematic wash for text contrast. Keeps the center of the image bright and clear. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
      {/* Film grain — 2% opacity. */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Architectural grid lines — quiet structural motif. */}
      <div className="pointer-events-none absolute inset-0 z-[1] hidden md:block">
        <Container className="relative h-full">
          <div className="absolute inset-y-0 left-1/4 w-px bg-background/10" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-background/10" />
          <div className="absolute inset-y-0 left-3/4 w-px bg-background/10" />
        </Container>
      </div>

      <Container className="relative z-10 flex flex-1 flex-col justify-between gap-16 pb-28 pt-44">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <motion.div
            className="md:col-span-9 lg:col-span-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: heroDelayMs(0), ease: EASE }}
          >
            <Eyebrow light>Bengaluru&rsquo;s Trusted Property Consultancy</Eyebrow>
            <h1
              className="mt-7 font-display text-7xl font-medium leading-[0.98] tracking-[-0.02em] text-background sm:text-8xl md:text-[7.5rem]"
              style={{ textShadow: "0 2px 16px rgba(0,0,0,0.3)" }}
            >
              {heroTitle}
            </h1>
          </motion.div>

          <motion.div
            className="flex items-end md:col-span-3 lg:col-span-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: heroDelayMs(80), ease: EASE }}
          >
            <div className="border-l border-accent-gold/40 pl-6">
              <p className="max-w-xs text-lg leading-relaxed text-background/85 md:text-xl">
                {heroDescription}
              </p>
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col gap-16">
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#properties"
              className="btn-fx group inline-flex items-center gap-2 rounded-pill bg-accent-gold px-7 py-3.5 text-sm font-semibold text-foreground shadow-soft transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-soft-lg active:translate-y-0 active:scale-[0.98] active:duration-150"
            >
              <ButtonFX />
              Explore Properties
              <ArrowUpRight
                size={16}
                className="transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </a>
            <a
              href={CONTACT.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-fx glass-dark inline-flex items-center gap-2 rounded-pill px-7 py-3.5 text-sm font-semibold text-background transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-soft-lg active:translate-y-0 active:scale-[0.98] active:duration-150"
            >
              <ButtonFX />
              <MessageCircle size={16} />
              WhatsApp Consultation
            </a>
          </div>

          <motion.div
            className="glass-dark w-full max-w-4xl rounded-md border border-white/10 p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: heroDelayMs(150), ease: EASE }}
          >
            <form className="flex flex-col gap-3.5 md:flex-row md:items-center">
              <div className="flex flex-1 items-center gap-3 rounded-md border border-white/10 bg-background/5 px-4.5 py-3 transition-all duration-300 focus-within:border-accent-gold focus-within:bg-background/10">
                <MapPin size={17} className="shrink-0 text-accent-gold" />
                <input
                  type="text"
                  placeholder="Location — e.g. Whitefield, Sarjapur Road"
                  className="w-full bg-transparent text-sm text-background placeholder:text-background/40 focus:outline-none"
                />
              </div>
              <select
                className="rounded-md border border-white/10 bg-background/5 px-4.5 py-3 text-sm text-background/90 transition-all duration-300 focus:outline-none focus:border-accent-gold focus:bg-background/10 md:w-56 cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled className="bg-foreground text-background">
                  Property Type
                </option>
                <option className="bg-foreground text-background">Bank Auction</option>
                <option className="bg-foreground text-background">Rental Income</option>
                <option className="bg-foreground text-background">Chance Deal</option>
                <option className="bg-foreground text-background">Resale</option>
                <option className="bg-foreground text-background">Upcoming Project</option>
                <option className="bg-foreground text-background">Ready To Move</option>
              </select>
              <button
                type="submit"
                className="btn-fx inline-flex items-center justify-center gap-2 rounded-md bg-accent-gold px-6 py-3 text-sm font-semibold text-foreground transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:scale-[1.02] hover:bg-accent-gold-dark hover:shadow-soft-lg active:translate-y-0 active:scale-[0.98] active:duration-150"
              >
                <ButtonFX />
                <Search size={16} className="text-foreground" />
                Search
              </button>
            </form>
          </motion.div>

          <motion.div
            className="flex w-fit flex-wrap gap-x-10 gap-y-5 border-t border-background/15 pt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: heroDelayMs(300), ease: EASE }}
          >
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className={i > 0 ? "border-l border-background/15 pl-10" : ""}
              >
                <Counter
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  className="font-display text-3xl font-medium text-background md:text-4xl"
                />
                <p className="mt-1.5 text-xs uppercase tracking-[0.14em] text-background/60">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </Container>

      <motion.div
        className="pointer-events-none absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-background/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: heroDelayMs(500), ease: EASE }}
      >
        <p className="text-xs uppercase tracking-[0.24em]">Scroll to Explore</p>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={20} />
        </motion.div>
      </motion.div>
    </section>
  );
}
