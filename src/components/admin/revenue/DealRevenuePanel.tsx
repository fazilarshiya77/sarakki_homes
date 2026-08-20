"use client";

import { useEffect, useMemo, useState } from "react";
import { IndianRupee, Loader2, Lock, Check } from "lucide-react";
import { deriveCommissionLakh, formatMoneyLakh } from "@/lib/crm";
import { cn } from "@/lib/utils";

export interface DealValues {
  dealValueLakh: number | null;
  commissionPct: number | null;
  commissionLakh: number | null;
  propertyId: string | null;
  closedAt: string | null;
}

interface PropertyOption {
  id: string;
  title: string;
  propertyId: string;
}

const inputClass =
  "w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-2.5 px-3 text-xs text-crm-text outline-none focus:border-crm-gold-bright/40";
const labelClass =
  "text-[10px] font-semibold uppercase tracking-wider text-crm-text-secondary";

/**
 * "Deal & Revenue" capture for a single lead.
 *
 * Commission amount is *pre-filled* from deal value × percentage but is
 * a real, independently-editable field — negotiated and flat fees are
 * common, and the stored amount (not the percentage) is what the
 * dashboard's revenue aggregates read. Once the user types into the
 * amount field we stop overwriting it from the percentage.
 */
export function DealRevenuePanel({
  values,
  canEdit,
  onSave,
}: {
  values: DealValues;
  canEdit: boolean;
  onSave: (payload: Record<string, unknown>) => Promise<void>;
}) {
  const [dealValue, setDealValue] = useState(values.dealValueLakh?.toString() ?? "");
  const [pct, setPct] = useState(values.commissionPct?.toString() ?? "");
  const [commission, setCommission] = useState(values.commissionLakh?.toString() ?? "");
  const [propertyId, setPropertyId] = useState(values.propertyId ?? "");
  const [commissionTouched, setCommissionTouched] = useState(
    values.commissionLakh !== null && values.commissionLakh !== undefined
  );
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!canEdit) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/properties?limit=200");
        const data = await res.json();
        if (!cancelled && Array.isArray(data.properties)) {
          setProperties(
            data.properties.map((p: any) => ({
              id: p.id,
              title: p.title,
              propertyId: p.propertyId,
            }))
          );
        }
      } catch {
        /* dropdown just stays empty — the rest of the panel still works */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canEdit]);

  // Auto-fill the amount from the percentage until the user overrides it.
  const derived = useMemo(
    () =>
      deriveCommissionLakh(
        dealValue === "" ? null : Number(dealValue),
        pct === "" ? null : Number(pct)
      ),
    [dealValue, pct]
  );

  useEffect(() => {
    if (commissionTouched) return;
    setCommission(derived === null ? "" : String(derived));
  }, [derived, commissionTouched]);

  if (!canEdit) {
    return (
      <div className="rounded-sm border border-crm-border/20 bg-crm-card/25 p-5">
        <p className={labelClass}>Deal &amp; Revenue</p>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-crm-text-secondary">
          <Lock size={12} />
          <span>Commission figures are visible to managers and admins only.</span>
        </div>
      </div>
    );
  }

  const invalid =
    (dealValue !== "" && (!Number.isFinite(Number(dealValue)) || Number(dealValue) < 0)) ||
    (commission !== "" && (!Number.isFinite(Number(commission)) || Number(commission) < 0)) ||
    (pct !== "" && (!Number.isFinite(Number(pct)) || Number(pct) < 0 || Number(pct) > 100));

  const save = async () => {
    if (invalid) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await onSave({
        dealValueLakh: dealValue === "" ? null : Number(dealValue),
        commissionPct: pct === "" ? null : Number(pct),
        commissionLakh: commission === "" ? null : Number(commission),
        propertyId: propertyId || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err?.message || "Could not save deal details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-sm border border-crm-gold/25 bg-crm-card/25 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className={labelClass}>Deal &amp; Revenue</p>
        <IndianRupee size={13} className="text-crm-gold" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className={labelClass}>Deal Value (₹ L)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={dealValue}
            onChange={(e) => setDealValue(e.target.value)}
            placeholder="e.g. 95"
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Commission %</label>
          <input
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={pct}
            onChange={(e) => setPct(e.target.value)}
            placeholder="e.g. 2"
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className={labelClass}>Commission Amount (₹ L)</label>
          {commissionTouched && derived !== null && (
            <button
              type="button"
              onClick={() => {
                setCommissionTouched(false);
                setCommission(String(derived));
              }}
              className="text-[9px] font-semibold uppercase tracking-wider text-crm-gold hover:text-crm-gold-bright"
            >
              Reset to {formatMoneyLakh(derived)}
            </button>
          )}
        </div>
        <input
          type="number"
          min={0}
          step="0.01"
          value={commission}
          onChange={(e) => {
            setCommissionTouched(true);
            setCommission(e.target.value);
          }}
          placeholder="Auto-filled from deal value × %"
          className={inputClass}
        />
        <p className="text-[10px] text-crm-text-secondary/70">
          Auto-filled from the percentage &mdash; override it for negotiated or flat fees.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Linked Property</label>
        <select
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
          className={cn(inputClass, "cursor-pointer")}
        >
          <option value="">Not linked to a listing</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.propertyId} &mdash; {p.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between gap-3 pt-1 border-t border-crm-border/20">
        <div className="text-[10px] text-crm-text-secondary">
          {values.closedAt ? (
            <>
              Closed{" "}
              {new Date(values.closedAt).toLocaleDateString("en-IN", {
                timeZone: "Asia/Kolkata",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </>
          ) : (
            <>Closing date is set automatically on Won / Lost.</>
          )}
        </div>
        <button
          onClick={save}
          disabled={saving || invalid}
          className="inline-flex items-center gap-1.5 rounded-sm bg-crm-gold px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-black hover:brightness-110 disabled:opacity-50 transition-all"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : saved ? <Check size={12} /> : null}
          {saved ? "Saved" : "Save Deal"}
        </button>
      </div>

      {invalid && (
        <p className="text-[10px] text-red-400">
          Values must be non-negative, and commission % cannot exceed 100.
        </p>
      )}
      {error && <p className="text-[10px] text-red-400">{error}</p>}
    </div>
  );
}
