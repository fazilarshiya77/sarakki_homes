import { TrendingUp } from "lucide-react";

export function InvestmentHighlights({ highlights }: { highlights: string[] }) {
  if (highlights.length === 0) return null;

  return (
    <div>
      <h2 className="font-display text-2xl">Investment Highlights</h2>
      <ul className="mt-5 flex flex-col gap-4">
        {highlights.map((highlight) => (
          <li key={highlight} className="flex items-start gap-3 text-sm leading-relaxed text-[#4F5752]">
            <TrendingUp size={16} className="mt-0.5 shrink-0 text-accent-gold-dark" />
            {highlight}
          </li>
        ))}
      </ul>
    </div>
  );
}
