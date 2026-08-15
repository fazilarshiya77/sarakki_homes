// Shared constants/helpers for the CRM admin pages (Leads, Lead detail,
// Tasks). Kept in one place so the pipeline stage list, colors, and labels
// never drift between the kanban board, list view, and detail page.

export const STAGES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "SITE_VISIT",
  "NEGOTIATION",
  "WON",
  "LOST",
] as const;

export type Stage = (typeof STAGES)[number];

export const STAGE_LABELS: Record<Stage, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  SITE_VISIT: "Site Visit",
  NEGOTIATION: "Negotiation",
  WON: "Won",
  LOST: "Lost",
};

export const STAGE_BADGE_CLASS: Record<Stage, string> = {
  NEW: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  CONTACTED: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  QUALIFIED: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  SITE_VISIT: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  NEGOTIATION: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  WON: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  LOST: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;

export const PRIORITY_BADGE_CLASS: Record<string, string> = {
  LOW: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  MEDIUM: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  HIGH: "bg-red-500/10 text-red-400 border-red-500/20",
};

export const TASK_STATUSES = ["PENDING", "IN_PROGRESS", "DONE"] as const;

export const TASK_STATUS_BADGE_CLASS: Record<string, string> = {
  PENDING: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  IN_PROGRESS: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  DONE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export const LEAD_SOURCES = [
  "Website",
  "Referral",
  "WhatsApp",
  "Walk-in",
  "Property Portal",
  "Bank Auction Enquiry",
  "Phone Call",
  "Other",
];

export const LEAD_PURPOSES = ["Buy", "Rent", "Invest"];

export const PROPERTY_TYPES = [
  "Apartment",
  "Villa",
  "Independent House",
  "Plot",
  "Commercial",
  "Bank Auction Property",
];

export const POSSESSION_OPTIONS = ["Ready to Move", "Under Construction", "Any"];

export function formatLakh(value?: number | null): string {
  if (value === null || value === undefined) return "—";
  return `₹${value.toLocaleString("en-IN")}L`;
}

export function budgetRangeLabel(min?: number | null, max?: number | null): string {
  if (!min && !max) return "Not specified";
  if (min && max) return `${formatLakh(min)} – ${formatLakh(max)}`;
  if (min) return `${formatLakh(min)}+`;
  return `Up to ${formatLakh(max)}`;
}
