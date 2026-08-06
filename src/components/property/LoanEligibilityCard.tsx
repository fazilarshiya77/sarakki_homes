import { Landmark } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";
import { ButtonFX } from "@/components/ui/ButtonFX";
import type { LoanEligibility } from "@/lib/data";
import { CONTACT } from "@/lib/data";

export function LoanEligibilityCard({ loan }: { loan: LoanEligibility }) {
  return (
    <div className="rounded-md border border-border bg-surface p-8">
      <h2 className="flex items-center gap-2.5 font-display text-2xl">
        <Landmark size={20} className="text-accent-gold-dark" />
        Loan Eligibility
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
            Estimated Max Loan
          </p>
          <p className="mt-1.5 font-display text-xl">{loan.maxLoanAmount}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
            Indicative EMI
          </p>
          <p className="mt-1.5 font-display text-xl">{loan.indicativeEmi}</p>
        </div>
      </div>

      <p className="mt-6 text-xs uppercase tracking-[0.1em] text-muted-foreground">
        Partner Banks
      </p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {loan.partnerBanks.map((bank) => (
          <span
            key={bank}
            className="rounded-pill border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground/80"
          >
            {bank}
          </span>
        ))}
      </div>

      <a
        href={CONTACT.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClasses("primary", "mt-7 w-fit")}
      >
        <ButtonFX />
        Check My Eligibility
      </a>
    </div>
  );
}
