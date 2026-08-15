import type { AuctionStatus } from "@/lib/auctions";
import { cn } from "@/lib/utils";

const TONE_CLASSES: Record<AuctionStatus["tone"], string> = {
  gold: "border-[#C4A66B]/50 bg-[#C4A66B]/10 text-[#8A6F3E]",
  emerald: "border-[#0E6B5C]/35 bg-[#0E6B5C]/10 text-[#0E6B5C]",
  muted: "border-[#67615B]/30 bg-[#67615B]/10 text-[#67615B]",
};

/** Renders nothing when there's no status to report — never fabricates one. */
export function AuctionStatusBadge({ status, className }: { status: AuctionStatus | null; className?: string }) {
  if (!status) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em]",
        TONE_CLASSES[status.tone],
        className
      )}
    >
      {status.label}
    </span>
  );
}
