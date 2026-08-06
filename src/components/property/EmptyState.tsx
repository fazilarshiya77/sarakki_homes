import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 rounded-md border border-dashed border-border py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-accent-gold-dark">
        <SearchX size={26} strokeWidth={1.5} />
      </div>
      <div>
        <h3 className="font-display text-2xl">No properties match those filters</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Try widening your budget range or exploring a different location —
          or let our advisors find something off-market for you.
        </p>
      </div>
      <Button variant="secondary" onClick={onReset}>
        Clear All Filters
      </Button>
    </div>
  );
}
