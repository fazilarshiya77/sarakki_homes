import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ButtonFX } from "@/components/ui/ButtonFX";

export type ButtonVariant = "primary" | "secondary" | "ghost";

// Lift, scale and shadow are shared by every variant per DESIGN_SYSTEM.md §5
// — a Porsche/Apple-style press, never bouncy: 6px lift, 1.02x scale on
// hover, easing back to a gentle 0.98x press on click.
const PREMIUM_INTERACTION =
  "btn-fx hover:-translate-y-1.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98] active:duration-150";

const variantStyles: Record<ButtonVariant, string> = {
  primary: cn(
    "bg-accent-gold text-foreground shadow-soft hover:shadow-soft-lg active:shadow-soft",
    PREMIUM_INTERACTION
  ),
  // Was `.glass` (a translucent white blur) — designed for sitting over
  // dark hero photography, where it works, but `secondary` is also used
  // in 6+ plain-light-background contexts (enquiry panels, empty
  // states, "View All" links) where a translucent-white-on-white-card
  // reads as an almost invisible ghost box. A real border works on any
  // surface, light or dark, and `.glass-dark` remains the dedicated
  // choice for anything that specifically needs to sit over a photo.
  secondary: cn(
    "border border-foreground/25 bg-transparent text-foreground hover:border-accent-gold hover:bg-accent-gold/5 active:bg-accent-gold/10",
    PREMIUM_INTERACTION
  ),
  ghost: "bg-transparent text-foreground hover:text-accent-gold-dark",
};

export function buttonClasses(variant: ButtonVariant = "primary", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-pill px-8 py-4 text-sm font-semibold tracking-wide transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:opacity-40 disabled:pointer-events-none",
    variantStyles[variant],
    className
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", children, ...props }, ref) => {
    return (
      <button ref={ref} className={buttonClasses(variant, className)} {...props}>
        {variant !== "ghost" && <ButtonFX />}
        <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      </button>
    );
  }
);
Button.displayName = "Button";
