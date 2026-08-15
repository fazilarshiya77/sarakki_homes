"use client";

import { createContext, useContext } from "react";
import type { SiteSettings } from "@/lib/settings";

const SettingsContext = createContext<SiteSettings | null>(null);

/** Hydrates every client component that needs live, admin-editable contact
 *  info / hero copy — populated once, server-side, in the root layout
 *  (src/app/layout.tsx), so there's a single Prisma fetch per request
 *  rather than one per component. */
export function SettingsProvider({
  settings,
  children,
}: {
  settings: SiteSettings;
  children: React.ReactNode;
}) {
  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export function useSiteSettings(): SiteSettings {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSiteSettings must be used within <SettingsProvider>");
  }
  return ctx;
}
