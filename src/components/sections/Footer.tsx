import Link from "next/link";
import { Mail, MapPin, PhoneCall } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { InstagramIcon } from "@/components/ui/SocialIcons";
import { CATEGORIES } from "@/lib/data";
import { getSiteSettings } from "@/lib/settings";

const COMPANY_LINKS = [
  { label: "Properties", href: "/properties" },
  { label: "Our Process", href: "/process" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "FAQ", href: "/#faq" },
];

export async function Footer() {
  const { contact: CONTACT } = await getSiteSettings();

  return (
    <footer id="site-footer" className="bg-footer text-background">
      <Container className="py-20">
        <div className="grid grid-cols-1 gap-14 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="font-display text-3xl font-medium tracking-[-0.01em]">Sarakki Homes</p>
            <div className="mt-5 h-px w-12 bg-accent-gold/50" />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-background/70">
              A premium Bengaluru real estate consultancy — guiding you
              through property selection, legal verification, financing, and
              registration with complete transparency.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <a
                href={CONTACT.instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-background/20 text-background/70 transition-colors duration-300 hover:border-accent-gold hover:text-accent-gold"
              >
                <InstagramIcon />
              </a>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-gold">
              Services
            </p>
            <ul className="mt-5 flex flex-col gap-3">
              {CATEGORIES.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/services/${category.slug}`}
                    className="text-sm text-background/70 transition-colors duration-300 hover:text-background"
                  >
                    {category.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-gold">
              Company
            </p>
            <ul className="mt-5 flex flex-col gap-3">
              {COMPANY_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-background/70 transition-colors duration-300 hover:text-background"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 text-sm text-background/70">
              <a href={CONTACT.phoneHref} className="flex items-center gap-2 hover:text-background">
                <PhoneCall size={14} /> {CONTACT.phoneDisplay}
              </a>
              <span className="flex items-center gap-2">
                <Mail size={14} /> hello@sarakkihomes.com
              </span>
              <span className="flex items-center gap-2">
                <MapPin size={14} /> Bengaluru, Karnataka
              </span>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col items-center justify-between gap-4 border-t border-background/15 pt-8 text-xs text-background/50 md:flex-row">
          <p>© {new Date().getFullYear()} Sarakki Homes. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-background/80">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-background/80">
              Terms of Service
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
