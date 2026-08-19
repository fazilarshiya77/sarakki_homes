"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, MapPin, MessageCircle, Search } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Counter } from "@/components/ui/Counter";
import { HeroButton } from "@/components/ui/HeroButton";
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
            <HeroButton variant="primary" href="#properties">
              Explore Properties
              <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
            </HeroButton>
            <HeroButton variant="secondary" href={CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={16} className="transition-transform duration-300 group-hover:scale-110" />
              WhatsApp Consultation
            </HeroButton>
          </div>

          {/* One cohesive search object — previously three independently
              bordered boxes loosely bagged inside an outer glass panel,
              which read as unrelated components pasted onto the hero
              rather than one module. Fields now share a single surface,
              separated by hairline dividers (not borders), with the
              search button integrated at a slightly smaller radius than
              the outer container. */}
          <motion.div
            className="w-full max-w-4xl rounded-xl border p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.25)]"
            style={{ backgroundColor: "rgba(250,247,240,0.94)", borderColor: "rgba(255,255,255,0.45)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: heroDelayMs(150), ease: EASE }}
          >
            <form className="flex flex-col gap-1.5 md:flex-row md:items-stretch md:gap-0">
              <div className="flex flex-col divide-y divide-[#17231F]/8 md:flex-1 md:flex-row md:divide-x md:divide-y-0">
                <div className="flex flex-1 items-center gap-3 px-4.5 py-3.5">
                  <MapPin size={17} className="shrink-0 text-accent-gold-dark" />
                  <input
                    type="text"
                    placeholder="Location — e.g. Whitefield, Sarjapur Road"
                    className="w-full bg-transparent text-sm text-[#17231F] placeholder:text-[#6F756F] focus:outline-none"
                  />
                </div>
                <div className="relative flex items-center px-4.5 py-3.5 md:w-52">
                  <select
                    className="w-full appearance-none bg-transparent pr-6 text-sm text-[#17231F] focus:outline-none cursor-pointer"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Property Type
                    </option>
                    <option>Bank Auction</option>
                    <option>Rental Income</option>
                    <option>Chance Deal</option>
                    <option>Resale</option>
                    <option>Upcoming Project</option>
                    <option>Ready To Move</option>
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-4.5 text-[#6F756F]" />
                </div>
              </div>

              <button
                type="submit"
                className="group m-0 flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-sm font-semibold transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[2px] active:translate-y-0 md:ml-1"
                style={{ backgroundColor: "#083C35", color: "#F5F1E8" }}
              >
                <Search size={16} className="transition-transform duration-300 group-hover:scale-110" />
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
