import { cn } from "@/lib/utils";

const TONES = {
  warm: "from-[#3a3327] via-[#2a2620] to-[#171717]",
  emerald: "from-[#0e4f46] via-[#0a3831] to-[#0c1f1c]",
  gold: "from-[#4a4438] via-[#332f27] to-[#171717]",
  charcoal: "from-[#2b2b2b] via-[#1c1c1c] to-[#0d0d0d]",
} as const;

export function MediaPlaceholder({
  tone = "warm",
  className,
  grain = true,
}: {
  tone?: keyof typeof TONES;
  className?: string;
  grain?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br",
        TONES[tone],
        className
      )}
    >
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.08), transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.05), transparent 45%)",
        }}
      />
      {grain && (
        <div
          className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      )}
    </div>
  );
}
