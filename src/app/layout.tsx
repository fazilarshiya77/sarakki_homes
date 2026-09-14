import type { Metadata } from "next";
import Script from "next/script";
import { Roboto } from "next/font/google";
import { FloatingSocialDock } from "@/components/ui/FloatingSocialDock";
import { BuilderMarquee } from "@/components/ui/BuilderMarquee";
import { AuthProvider } from "@/components/admin/AuthProvider";
import { SettingsProvider } from "@/components/providers/SettingsProvider";
import { getSiteSettings } from "@/lib/settings";
import "./globals.css";

// Client-requested brand font: Roboto (Google Fonts, variable — 3 axes,
// so no weight array needed, every weight from Thin to Black is
// available as a real cut, not synthetic/faux bold). Applied
// everywhere: public site AND CRM, superseding the previous Concert
// One + Google Sans pairing. Loaded once here via next/font/google
// (self-hosted at build time, no runtime request to Google) and mapped
// through every one of the five --font-display/--font-accent/
// --font-body/--font-crm-display/--font-crm-body CSS theme tokens (see
// globals.css @theme block), so every existing `font-display`/
// `font-crm-body`/etc. className in the codebase picks it up with no
// per-component edits.
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  display: "swap",
});

// TODO: replace with the real production domain once the site is hosted —
// set NEXT_PUBLIC_SITE_URL in the deployment environment.
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sarakkihomes.com";

// Title/description are pulled from the admin-managed Setting row (Website
// CMS → SEO fields) so editing them there actually changes what search
// engines and social previews show — not just hardcoded copy.
export async function generateMetadata(): Promise<Metadata> {
  const { metaTitle, metaDesc } = await getSiteSettings();

  return {
    metadataBase: new URL(BASE_URL),
    title: metaTitle,
    description: metaDesc,
    keywords: [
      "Sarakki Homes",
      "Bengaluru real estate",
      "bank auction properties Bengaluru",
      "property consultancy Bengaluru",
      "khata transfer",
      "ready to move properties Bengaluru",
    ],
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      url: BASE_URL,
      siteName: "Sarakki Homes",
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDesc,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${roboto.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-background text-foreground font-body"
        suppressHydrationWarning
      >
        {/* Some security-suite browser extensions (e.g. Bitdefender's
            "Browser Integrity Shield") inject a `bis_skin_checked`
            attribute onto every element in the page before React
            hydrates, which React reports as a hydration mismatch even
            though nothing in this app ever renders that attribute —
            it's real for anyone running that extension, but harmless
            (no visual/behavioral bug) and never reaches production
            visitors, since Next only prints hydration warnings in dev.
            `suppressHydrationWarning` doesn't help here — it isn't
            recursive, and the extension touches every descendant node,
            not just html/body. Stripping the attribute the instant it's
            added (via MutationObserver, started as early as possible so
            it wins the race against hydration) is the only fix that
            actually reaches every node without hand-adding the prop
            everywhere. */}
        <Script id="strip-extension-attrs" strategy="beforeInteractive">
          {`
            (function () {
              var ATTR = "bis_skin_checked";
              function strip(node) {
                if (node.nodeType === 1 && node.hasAttribute(ATTR)) {
                  node.removeAttribute(ATTR);
                }
              }
              document.querySelectorAll("[" + ATTR + "]").forEach(strip);
              new MutationObserver(function (mutations) {
                for (var i = 0; i < mutations.length; i++) {
                  var m = mutations[i];
                  if (m.type === "attributes") strip(m.target);
                }
              }).observe(document.documentElement, {
                attributes: true,
                attributeFilter: [ATTR],
                subtree: true,
              });
            })();
          `}
        </Script>
        <AuthProvider>
          <SettingsProvider settings={settings}>
            {children}
            <BuilderMarquee />
            <FloatingSocialDock />
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
