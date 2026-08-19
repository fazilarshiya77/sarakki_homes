import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Buttons that sit directly on the Hero's dark photograph — a distinct
 * context from the site's regular `buttonClasses()` system (Button.tsx),
 * whose "secondary" variant is a dark-text-on-transparent style meant for
 * LIGHT page backgrounds and would be invisible here. Hero previously
 * improvised this with one-off `glass-dark` + ad-hoc gold classes, which
 * is exactly why the two buttons read as visually unrelated rather than
 * one system — this is that missing shared component.
 *
 * Moderate radius (not the site's `rounded-pill`) per the "no huge pill,
 * no excessive rounded corners" brand direction for this redesign pass.
 */
export function heroButtonClasses(variant: "primary" | "secondary", className?: string) {
  // Deliberately no `btn-fx`/<ButtonFX> shine-sweep or sparkle overlay
  // here — the client explicitly asked for restrained hover ("no
  // excessive sparkle/glow") for this redesign pass, and the sparkle
  // animation is exactly that.
  return cn(
    "group inline-flex h-[52px] items-center justify-center gap-2 rounded-lg px-7 text-sm font-semibold tracking-wide transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[3px] active:translate-y-0 active:duration-150",
    variant === "primary"
      ? // Champagne Gold, Deep Charcoal text — dominant per spec.
        "bg-accent-gold text-[#171715] shadow-[0_2px_10px_rgba(0,0,0,0.15)] hover:bg-accent-gold-dark hover:shadow-[0_10px_28px_rgba(0,0,0,0.22)]"
      : // Subtle dark surface + light border — supports, doesn't compete.
        "border border-white/25 bg-white/[0.06] text-background backdrop-blur-sm hover:border-white/40 hover:bg-white/[0.1] hover:shadow-[0_10px_28px_rgba(0,0,0,0.22)]",
    className
  );
}

export function HeroButton({
  variant,
  href,
  target,
  rel,
  onClick,
  className,
  children,
}: {
  variant: "primary" | "secondary";
  href: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a href={href} target={target} rel={rel} onClick={onClick} className={heroButtonClasses(variant, className)}>
      {children}
    </a>
  );
}
