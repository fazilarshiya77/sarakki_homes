import { Gavel } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function AuctionEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 rounded-md border border-dashed border-border py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-accent-gold-dark">
        <Gavel size={26} strokeWidth={1.5} />
      </div>
      <div>
        <h3 className="font-display text-2xl">No auction properties match those filters</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Try widening your reserve price range or clearing a filter — or ask
          our advisors to alert you when a matching auction is listed.
        </p>
      </div>
      <Button variant="secondary" onClick={onReset}>
        Clear All Filters
      </Button>
    </div>
  );
}
