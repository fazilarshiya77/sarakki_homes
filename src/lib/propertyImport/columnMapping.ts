// =============================================================================
// PLACEHOLDER COLUMN MAPPING — pending the client's final Excel headers.
// =============================================================================
// This is the ONE file the whole bulk-import/export feature reads its Excel
// column names from. Every header string below (`header:`) is a best-guess
// placeholder built from the current Property schema and the example field
// list the client gave verbatim ("Property Name", "Property Type",
// "Category", "Builder", "Price", "Location", "Address", "Google Maps
// Location", "Bedrooms", "Bathrooms", "Area", "Description", etc.).
//
// When the client sends the exact final headers, update ONLY the `header`
// strings in COLUMN_DEFS below (and PROPERTY_ID_HEADER/STATUS/FEATURED if
// those change too) — nothing else in the import/export pipeline needs to
// change, since every other module reads columns by `field`, not by the
// literal Excel text.
//
// Auction-specific fields (bank name, EMD, reserve price...) and loan
// eligibility are intentionally NOT part of this mapping — those stay a
// manual step in the existing Property Wizard, same as images/gallery.

export type ColumnFieldType = "string" | "number" | "enum";

export interface ColumnDef {
  /** The exact Excel header text this column reads from / writes to. */
  header: string;
  /** Internal field name — matches Property model naming where practical. */
  field: string;
  type: ColumnFieldType;
  /** One of the 4 fields the client named as currently required. */
  required: boolean;
  /** For type: "enum" — the exact values the CRM already accepts. */
  enumValues?: string[];
  /** Shown in the template + validation errors, plain language for a
   *  non-technical admin. */
  description: string;
}

// Existing CRM enums (kept in sync with PropertyWizard.tsx and the
// admin Properties page's own <option> lists — see those files if this
// project's supported types/statuses ever change).
export const PROPERTY_TYPE_VALUES = [
  "Bank Auction",
  "Resale",
  "Ready To Move",
  "Rental Income",
  "Upcoming Project",
] as const;

export const PROPERTY_STATUS_VALUES = [
  "PUBLISHED",
  "UNPUBLISHED",
  "ARCHIVED",
  "SOLD",
  "UNDER_PROCESS",
  "AUCTION_CLOSED",
] as const;

// Fallbacks used when an uploaded sheet simply doesn't have these
// columns at all (common with the free-form listing sheets the client
// keeps). New rows imported this way always land as UNPUBLISHED drafts —
// nothing reaches the public website until staff review and publish it —
// so a guessed category/type is safe to correct afterwards.
export const DEFAULT_CATEGORY_TITLE = "Resale Properties";
export const DEFAULT_TYPE = "Resale";
export const DEFAULT_PRICE_TEXT = "Price on request";

// The identifier column — if a row has a value here that matches an
// existing property, it's an UPDATE; if blank, it's a CREATE; if it has a
// value that matches NOTHING, that's a validation error (never silently
// guessed) per the client's "do not create duplicates" requirement.
export const PROPERTY_ID_HEADER = "Property ID";

export const COLUMN_DEFS: ColumnDef[] = [
  {
    header: "Property Name",
    field: "title",
    type: "string",
    required: true,
    description: "The listing's title, e.g. \"Prestige XYZ\".",
  },
  {
    header: "Property Type",
    field: "type",
    type: "enum",
    required: true,
    enumValues: [...PROPERTY_TYPE_VALUES],
    description: `One of: ${PROPERTY_TYPE_VALUES.join(", ")}.`,
  },
  {
    header: "Category",
    field: "categoryName",
    type: "string",
    required: true,
    description: "Must match an existing category name exactly (case-insensitive).",
  },
  {
    header: "Builder",
    field: "builderName",
    type: "string",
    required: false,
    description: "Optional. Must match an existing builder name exactly (case-insensitive) if given.",
  },
  {
    header: "Price",
    field: "price",
    type: "string",
    required: true,
    description: "The price as shown to customers, e.g. \"₹1.25 Cr\".",
  },
  {
    header: "Price in Lakh",
    field: "priceValueLakh",
    type: "number",
    required: false,
    description: "Numeric price in lakhs, e.g. 125 for ₹1.25 Cr — used for sorting/filtering on the website.",
  },
  {
    header: "Location",
    field: "location",
    type: "string",
    required: false,
    description: "Area/neighbourhood, e.g. \"Whitefield\".",
  },
  {
    header: "Address",
    field: "address",
    type: "string",
    required: false,
    description: "Full postal address.",
  },
  {
    header: "Google Maps Location",
    field: "mapQuery",
    type: "string",
    required: false,
    description: "A Google Maps search text or link for this property.",
  },
  {
    header: "Bedrooms",
    field: "beds",
    type: "number",
    required: false,
    description: "Number of bedrooms (BHK).",
  },
  {
    header: "Bathrooms",
    field: "baths",
    type: "number",
    required: false,
    description: "Number of bathrooms.",
  },
  {
    header: "Area",
    field: "area",
    type: "string",
    required: false,
    description: "Area as shown to customers, e.g. \"1,200 sq.ft\".",
  },
  {
    header: "Area (Sqft)",
    field: "areaSqft",
    type: "number",
    required: false,
    description: "Numeric area in square feet.",
  },
  {
    header: "Description",
    field: "description",
    type: "string",
    required: false,
    description: "Listing description shown on the website.",
  },
  {
    header: "Status",
    field: "status",
    type: "enum",
    required: false,
    enumValues: [...PROPERTY_STATUS_VALUES],
    description:
      `Optional. One of: ${PROPERTY_STATUS_VALUES.join(", ")}. Leave blank to keep the existing status when ` +
      `updating a property, or to default new properties to UNPUBLISHED (draft) until published in the CRM.`,
  },
  {
    header: "Featured",
    field: "featured",
    type: "enum",
    required: false,
    enumValues: ["Yes", "No"],
    description: "Optional. \"Yes\" or \"No\" — whether this shows in the homepage's Featured Properties section.",
  },
];

export const ALL_HEADERS = [PROPERTY_ID_HEADER, ...COLUMN_DEFS.map((c) => c.header)];
