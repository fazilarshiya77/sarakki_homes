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

  // Baseline security headers, applied to every route.
  //
  // Deliberately NOT included: Content-Security-Policy. This app relies on
  // Next.js's inline bootstrap scripts, Google Fonts (fonts.googleapis.com /
  // fonts.gstatic.com via next/font), and a Google Maps iframe embed on the
  // property detail pages. A CSP bolted on without per-directive testing and
  // a nonce strategy for the inline scripts would break all three, so it is
  // left as deliberate future work rather than shipped half-configured.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Nothing in this app is meant to be framed — blocks clickjacking.
          { key: "X-Frame-Options", value: "DENY" },
          // Stops browsers guessing a response's type from its bytes.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Send the full referrer same-origin, origin-only cross-origin,
          // and nothing at all when downgrading to http.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // The site never needs these — deny them outright.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Force HTTPS for 2 years, subdomains included. Ignored by
          // browsers over plain http, so it's inert in local dev.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
