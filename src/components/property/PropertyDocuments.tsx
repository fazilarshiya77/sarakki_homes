import { FileCheck2, ShieldCheck } from "lucide-react";

export function PropertyDocuments({ documents }: { documents: string[] }) {
  if (documents.length === 0) return null;

  return (
    <div>
      <h2 className="flex items-center gap-2.5 font-display text-2xl">
        <ShieldCheck size={20} className="text-accent-gold-dark" />
        Property Documents
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Every document below has been independently verified by our legal team
        before this property was listed.
      </p>
      <ul className="mt-5 flex flex-col divide-y divide-border rounded-md border border-border">
        {documents.map((doc) => (
          <li key={doc} className="flex items-center justify-between px-5 py-4 text-sm">
            <span className="text-[#4F5752]">{doc}</span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-success">
              <FileCheck2 size={14} />
              Verified
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
