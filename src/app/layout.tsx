import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { FloatingSocialDock } from "@/components/ui/FloatingSocialDock";
import { BuilderMarquee } from "@/components/ui/BuilderMarquee";
import { AuthProvider } from "@/components/admin/AuthProvider";
import { SettingsProvider } from "@/components/providers/SettingsProvider";
import { getSiteSettings } from "@/lib/settings";
import "./globals.css";

// Editorial serif for every major headline — swapped from Bodoni Moda
// (a heavier didone that read as generic "luxury template") to
// Cormorant Garamond per the v2 brand direction: elegant, editorial,
// not flashy. Loaded twice at different variables (both the same
// typeface) so display headings and rare italic pull-quote moments can
// carry different weight/style without a third font ever entering the
// page — the brand rule is exactly two typefaces, serif + sans.
const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const cormorantGaramondAccent = Cormorant_Garamond({
  variable: "--font-accent",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
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
      className={`${cormorantGaramond.variable} ${cormorantGaramondAccent.variable} ${manrope.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-background text-foreground font-body"
        suppressHydrationWarning
      >
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
