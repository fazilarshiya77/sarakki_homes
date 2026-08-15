import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // The admin property wizard accepts any pasted image URL (Cloudinary
    // upload isn't wired yet — see PropertyWizard.tsx), so next/image can't
    // be locked to one known host the way it normally would be.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  // The default bottom-left dev indicator collides with BuilderMarquee's
  // fixed bottom ticker (src/components/ui/BuilderMarquee.tsx) — it's
  // rendered in a Shadow DOM with hardcoded inline positioning, so no CSS
  // override can nudge it; the only lever Next.js exposes is one of the
  // four corner presets. Dev-only — has no effect in production.
  devIndicators: {
    position: "top-left",
  },
};

export default nextConfig;
