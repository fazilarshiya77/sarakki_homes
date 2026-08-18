import type { AuctionStatus } from "@/lib/auctionHelpers";
import { cn } from "@/lib/utils";

const TONE_CLASSES: Record<AuctionStatus["tone"], string> = {
  gold: "border-accent-gold/50 bg-accent-gold/10 text-accent-gold-dark",
  emerald: "border-accent-emerald/35 bg-accent-emerald/10 text-accent-emerald",
  muted: "border-muted-foreground/30 bg-muted-foreground/10 text-muted-foreground",
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
