"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader } from "./Loader";
import { LOADER_DURATION_MS } from "@/lib/heroTiming";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = loading ? "hidden" : "";
    const timer = setTimeout(() => setLoading(false), LOADER_DURATION_MS);
    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <>
      <Loader visible={loading} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </>
  );
}
