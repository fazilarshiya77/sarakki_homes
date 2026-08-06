"use client";

import { AnimatePresence, motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Brand-entry loading moment — DESIGN_SYSTEM.md §7.
 * A single gold line draws a home silhouette, the wordmark breathes in with
 * a shimmer pass, then the whole moment dissolves into the hero.
 */
export function Loader({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          aria-hidden
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#0b0a08]"
          exit={{
            opacity: 0,
            filter: "blur(14px)",
            scale: 1.02,
            transition: { duration: 0.7, ease: [0.65, 0, 0.35, 1] },
          }}
        >
          <motion.div
            className="flex flex-col items-center"
            exit={{ opacity: 0, transition: { duration: 0.45, ease: EASE } }}
          >
            <svg
              width="128"
              height="102"
              viewBox="0 0 128 102"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="loaderGold"
                  x1="0"
                  y1="0"
                  x2="128"
                  y2="102"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#A8874F" />
                  <stop offset="0.5" stopColor="#E3C98F" />
                  <stop offset="1" stopColor="#C8A96A" />
                </linearGradient>
              </defs>
              <motion.path
                d="M4 56 L64 10 L124 56 M20 44 V92 H108 V44 M10 92 H118"
                stroke="url(#loaderGold)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.25, delay: 0.12, ease: EASE }}
                style={{ filter: "drop-shadow(0 0 8px rgba(200,169,106,0.35))" }}
              />
            </svg>

            <div className="mt-10 flex flex-col items-center">
              <div className="relative">
                <motion.p
                  className="font-display text-[2.35rem] font-medium tracking-[0.3em] text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #A8874F 0%, #C8A96A 38%, #EDDFBA 55%, #C8A96A 72%, #A8874F 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    backgroundSize: "300% 100%",
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.76, duration: 0.55, ease: EASE }}
                >
                  SARAKKI HOMES
                </motion.p>
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 font-display text-[2.35rem] font-medium tracking-[0.3em] text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(105deg, transparent 42%, rgba(255,250,238,0.95) 50%, transparent 58%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    backgroundSize: "300% 100%",
                  }}
                  animate={{ backgroundPosition: ["300% 50%", "-300% 50%"] }}
                  transition={{ delay: 1.7, duration: 0.9, ease: "easeInOut" }}
                >
                  SARAKKI HOMES
                </motion.span>
              </div>

              <motion.div
                className="mt-5 h-px w-40 origin-center bg-gradient-to-r from-transparent via-accent-gold/60 to-transparent"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.95, duration: 0.8, ease: EASE }}
              />
              <motion.p
                className="mt-4 text-[10px] font-medium uppercase tracking-[0.4em] text-background/45"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.05, duration: 0.6 }}
              >
                Trust Before Property
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
