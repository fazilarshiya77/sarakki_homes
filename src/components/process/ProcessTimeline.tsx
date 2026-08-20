"use client";

import { motion } from "framer-motion";
import { PROCESS_STEPS } from "@/lib/data";

export function ProcessTimeline() {
  return (
    <div className="relative">
      <div className="absolute left-6 top-2 bottom-2 w-px bg-border" />

      <div className="flex flex-col gap-14">
        {PROCESS_STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex gap-8 pl-16"
            >
              <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full border border-accent-gold/40 bg-background text-accent-gold-dark shadow-soft">
                <Icon size={20} strokeWidth={1.75} />
              </div>

              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-gold-dark">
                  Step {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 font-display text-2xl">{step.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-[#4F5752]">
                  {step.description}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {step.detail}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
