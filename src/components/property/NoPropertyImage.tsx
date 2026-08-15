import { Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The deliberate, premium substitute for a missing property photo — many
 * bank auction records genuinely have no photograph (banks rarely supply
 * one), and a broken-image icon or "Image not available" box reads as an
 * error, not a design choice. This reads as an editorial cover instead:
 * the Sarakki Homes mark, the category, and the property's own ID, on a
 * dark architectural surface with a restrained gold glow.
 */
export function NoPropertyImage({
  propertyId,
  category = "Bank Auction",
  className,
}: {
  propertyId: string;
  category?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center overflow-hidden",
        className
      )}
      style={{ backgroundColor: "#241E19" }}
    >
      {/* Subtle architectural line grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(#C4A66B 1px, transparent 1px), linear-gradient(90deg, #C4A66B 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Deep-brown center wash for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 40%, #332C26 0%, transparent 70%)",
        }}
      />
      {/* Champagne glow, very restrained */}
      <div
        className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[50px]"
        style={{ backgroundColor: "#C4A66B" }}
      />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full border"
          style={{ borderColor: "rgba(196,166,107,0.45)", backgroundColor: "rgba(196,166,107,0.06)" }}
        >
          <Landmark size={22} strokeWidth={1.5} style={{ color: "#C4A66B" }} />
        </div>

        <p
          className="mt-5 text-[10px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: "rgba(246,243,238,0.5)" }}
        >
          Sarakki Homes
        </p>
        <p className="mt-1.5 font-display text-lg uppercase tracking-[0.14em]" style={{ color: "#C4A66B" }}>
          {category}
        </p>

        <div
          className="mt-5 border-t pt-3"
          style={{ borderColor: "rgba(196,166,107,0.2)" }}
        >
          <p
            className="text-[9px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "rgba(246,243,238,0.4)" }}
          >
            Property ID
          </p>
          <p className="mt-1 font-display text-base tracking-wide" style={{ color: "#F6F3EE" }}>
            {propertyId}
          </p>
        </div>
      </div>
    </div>
  );
}
