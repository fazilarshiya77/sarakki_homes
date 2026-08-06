import { CalendarClock, Gavel, Landmark, Wallet } from "lucide-react";
import type { AuctionInfo } from "@/lib/data";

export function AuctionInfoCard({ info }: { info: AuctionInfo }) {
  const rows = [
    { label: "Conducting Bank", value: info.bankName, icon: Landmark },
    { label: "Auction Date", value: info.auctionDate, icon: CalendarClock },
    { label: "Reserve Price", value: info.reservePrice, icon: Wallet },
    { label: "EMD Amount", value: info.emd, icon: Gavel },
  ];

  return (
    <div className="rounded-md border border-accent-gold/30 bg-accent-emerald p-8 text-background">
      <h2 className="flex items-center gap-2.5 font-display text-2xl">
        <Gavel size={20} className="text-accent-gold" />
        Auction Information
      </h2>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <div key={row.label}>
              <p className="flex items-center gap-1.5 text-xs uppercase tracking-[0.1em] text-accent-gold/80">
                <Icon size={13} />
                {row.label}
              </p>
              <p className="mt-1.5 text-lg">{row.value}</p>
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-xs leading-relaxed text-background/60">
        Sarakki Homes independently verifies title and encumbrance status ahead
        of every auction we present — ask your advisor for the full legal report.
      </p>
    </div>
  );
}
