import type { Metadata } from "next";
import { Bodoni_Moda, Cormorant_Garamond, Manrope } from "next/font/google";
import { FloatingSocialDock } from "@/components/ui/FloatingSocialDock";
import { AuthProvider } from "@/components/admin/AuthProvider";
import "./globals.css";

const bodoniModa = Bodoni_Moda({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const cormorantGaramond = Cormorant_Garamond({
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
const TITLE = "Sarakki Homes | Premium Real Estate Consultancy, Bengaluru";
const DESCRIPTION =
  "Sarakki Homes guides you through the complete property journey — selection, legal verification, bank auction process, loan arrangement, registration, and khata transfer. Trust before property.";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "Sarakki Homes",
    "Bengaluru real estate",
    "bank auction properties Bengaluru",
    "property consultancy Bengaluru",
    "khata transfer",
    "ready to move properties Bengaluru",
  ],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: BASE_URL,
    siteName: "Sarakki Homes",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bodoniModa.variable} ${cormorantGaramond.variable} ${manrope.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-background text-foreground font-body"
        suppressHydrationWarning
      >
        <AuthProvider>
          {children}
          <FloatingSocialDock />
        </AuthProvider>
      </body>
    </html>
  );
}
