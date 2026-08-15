"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader } from "./Loader";
import { LOADER_DURATION_MS } from "@/lib/heroTiming";

const INTRO_SEEN_KEY = "sarakki-intro-seen";

export function AppShell({ children }: { children: React.ReactNode }) {
  // Always start "true" to match the server-rendered markup (no `window` on
  // the server) — flipping it off happens in the layout effect below, never
  // in the initial state, so hydration never sees a mismatched tree.
  const [loading, setLoading] = useState(true);

  // The brand intro is a once-per-session flourish, not something that
  // should replay every time the homepage route remounts — e.g. clicking
  // "Testimonials"/"FAQ" from another page navigates to "/#testimonials"
  // or "/#faq", and re-running the full ~2.1s loader (with body scroll
  // locked while it plays) was blocking the browser's hash-anchor scroll,
  // so those links appeared to just dump the user back at the homepage
  // top instead of the section they clicked. A URL hash also skips the
  // intro outright, since the destination is a specific section, not the
  // hero moment the loader is building toward. Runs in a layout effect
  // (before paint) so a repeat visit never flashes the loader first.
  useLayoutEffect(() => {
    if (window.location.hash || sessionStorage.getItem(INTRO_SEEN_KEY) === "1") {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = loading ? "hidden" : "";
    if (!loading) return;
    const timer = setTimeout(() => {
      sessionStorage.setItem(INTRO_SEEN_KEY, "1");
      setLoading(false);
    }, LOADER_DURATION_MS);
    return () => clearTimeout(timer);
  }, [loading]);

  // Once the shell is ready, honor any hash in the URL — covers both the
  // rare case the loader still played (fresh session landing on "/#faq"
  // directly) and belt-and-braces for browsers that skip the native
  // hash-scroll during a client-side route transition.
  useEffect(() => {
    if (loading) return;
    const hash = window.location.hash;
    if (!hash) return;
    const target = document.getElementById(hash.slice(1));
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [loading]);

  return (
    <>
      <Loader visible={loading} />
      <motion.div
        initial={{ opacity: loading ? 0 : 1 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </>
  );
}
