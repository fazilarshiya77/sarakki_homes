import {
  COLUMN_DEFS,
  PROPERTY_ID_HEADER,
  PROPERTY_STATUS_VALUES,
  PROPERTY_TYPE_VALUES,
} from "./columnMapping";
import type { RawImportRow } from "./workbook";

// Every field that isn't one of the 4 always-required ones is `... | null`,
// where **null means "the Excel cell was blank"**. On an UPDATE that means
// "leave this field exactly as it is" (same principle as images never
// being touched) — so an admin can export, change only the Price column,
// and re-import without wiping every field they left alone. On a CREATE,
// null falls back to the same safe default the manual "Add Property" form
// uses (0 / "" / UNPUBLISHED / not-featured).
export interface ValidatedRowData {
  title: string;
  type: string;
  categoryId: string;
  categoryName: string;
  builderId: string | null;
  builderName: string;
  price: string;
  priceValueLakh: number | null;
  location: string | null;
  address: string | null;
  mapQuery: string | null;
  beds: number | null;
  baths: number | null;
  area: string | null;
  areaSqft: number | null;
  description: string | null;
  status: string | null;
  featured: string | null;
}

export interface ValidRow {
  rowNumber: number;
  action: "create" | "update";
  /** Only present for action: "update" — the Property.id (uuid) to write to. */
  targetId?: string;
  propertyId: string; // existing SH-xxxx for update, "" for a new row
  data: ValidatedRowData;
}

export interface ErrorRow {
  rowNumber: number;
  propertyId: string;
  propertyName: string;
  errors: string[];
}

export interface ReferenceData {
  /** lowercase, trimmed title -> {id, title} */
  categories: Map<string, { id: string; title: string }>;
  /** lowercase, trimmed name -> {id, name} */
  builders: Map<string, { id: string; name: string }>;
  /** propertyId (e.g. "SH-1001") -> Property.id (uuid) */
  existingPropertyIds: Map<string, string>;
}

export interface ValidationResult {
  validRows: ValidRow[];
  errorRows: ErrorRow[];
  newCount: number;
  updateCount: number;
}

// Blank -> null (meaning "not provided" — see ValidatedRowData). A
// non-blank value that isn't a number -> ok:false so the row is reported
// as an error instead of silently becoming 0.
function num(raw: string): { value: number | null; ok: boolean } {
  if (raw.trim() === "") return { value: null, ok: true };
  const cleaned = raw.replace(/,/g, "").trim();
  const parsed = Number(cleaned);
  if (Number.isNaN(parsed) || !Number.isFinite(parsed) || parsed < 0) return { value: null, ok: false };
  return { value: parsed, ok: true };
}

/** Blank cell -> null ("leave unchanged on update / default on create"). */
function str(raw: string): string | null {
  const t = raw.trim();
  return t === "" ? null : t;
}

/** Shared by both the preview and commit API routes so they can never
 *  disagree about what's valid — preview shows exactly what commit will
 *  do, and commit re-validates from the same raw rows rather than
 *  trusting whatever the browser sends back. */
export function validateAndResolveRows(rawRows: RawImportRow[], ref: ReferenceData): ValidationResult {
  const validRows: ValidRow[] = [];
  const errorRows: ErrorRow[] = [];
  const seenIdsInFile = new Map<string, number>(); // propertyId -> first row number seen

  for (const row of rawRows) {
    const errors: string[] = [];
    const get = (header: string) => (row.values[header] ?? "").trim();

    const propertyIdRaw = get(PROPERTY_ID_HEADER);
    const title = get("Property Name");
    const typeRaw = get("Property Type");
    const categoryRaw = get("Category");
    const builderRaw = get("Builder");
    const price = get("Price");

    // --- Required fields (the 4 the client named) -----------------------
    if (!title) errors.push("Missing Property Name.");
    if (!typeRaw) errors.push("Missing Property Type.");
    if (!categoryRaw) errors.push("Missing Category.");
    if (!price) errors.push("Missing Price.");

    // --- Property Type enum ----------------------------------------------
    const matchedType = PROPERTY_TYPE_VALUES.find((v) => v.toLowerCase() === typeRaw.toLowerCase());
    if (typeRaw && !matchedType) {
      errors.push(`Invalid Property Type "${typeRaw}". Must be one of: ${PROPERTY_TYPE_VALUES.join(", ")}.`);
    }

    // --- Category / Builder matching (never auto-created) ----------------
    const matchedCategory = categoryRaw ? ref.categories.get(categoryRaw.toLowerCase()) : undefined;
    if (categoryRaw && !matchedCategory) {
      errors.push(`Category "${categoryRaw}" does not exist.`);
    }
    let builderId: string | null = null;
    if (builderRaw) {
      const matchedBuilder = ref.builders.get(builderRaw.toLowerCase());
      if (!matchedBuilder) {
        errors.push(`Builder "${builderRaw}" does not exist.`);
      } else {
        builderId = matchedBuilder.id;
      }
    }

    // --- Numbers -----------------------------------------------------------
    const priceValueLakh = num(get("Price in Lakh"));
    if (!priceValueLakh.ok) errors.push(`Invalid number in "Price in Lakh": "${get("Price in Lakh")}".`);
    const beds = num(get("Bedrooms"));
    if (!beds.ok) errors.push(`Invalid number in "Bedrooms": "${get("Bedrooms")}".`);
    const baths = num(get("Bathrooms"));
    if (!baths.ok) errors.push(`Invalid number in "Bathrooms": "${get("Bathrooms")}".`);
    const areaSqft = num(get("Area (Sqft)"));
    if (!areaSqft.ok) errors.push(`Invalid number in "Area (Sqft)": "${get("Area (Sqft)")}".`);

    // --- Status / Featured (optional enums) ---------------------------------
    const statusRaw = get("Status");
    let status: string | null = null;
    if (statusRaw) {
      const matchedStatus = PROPERTY_STATUS_VALUES.find((v) => v.toLowerCase() === statusRaw.toLowerCase());
      if (!matchedStatus) {
        errors.push(`Invalid Status "${statusRaw}". Must be one of: ${PROPERTY_STATUS_VALUES.join(", ")}.`);
      } else {
        status = matchedStatus;
      }
    }
    const featuredRaw = get("Featured");
    let featured: string | null = null;
    if (featuredRaw) {
      if (/^yes$/i.test(featuredRaw)) featured = "true";
      else if (/^no$/i.test(featuredRaw)) featured = "false";
      else errors.push(`Invalid Featured value "${featuredRaw}". Must be "Yes" or "No".`);
    }

    // --- Identify create vs. update, and catch in-file duplicates ----------
    let action: "create" | "update" = "create";
    let targetId: string | undefined;
    if (propertyIdRaw) {
      const firstSeenAt = seenIdsInFile.get(propertyIdRaw);
      if (firstSeenAt !== undefined) {
        errors.push(`Duplicate Property ID "${propertyIdRaw}" — already used in row ${firstSeenAt}.`);
      } else {
        seenIdsInFile.set(propertyIdRaw, row.rowNumber);
      }
      const existingDbId = ref.existingPropertyIds.get(propertyIdRaw);
      if (!existingDbId) {
        errors.push(`Property ID "${propertyIdRaw}" was not found in the CRM.`);
      } else {
        action = "update";
        targetId = existingDbId;
      }
    }

    if (errors.length > 0) {
      errorRows.push({ rowNumber: row.rowNumber, propertyId: propertyIdRaw, propertyName: title, errors });
      continue;
    }

    validRows.push({
      rowNumber: row.rowNumber,
      action,
      targetId,
      propertyId: propertyIdRaw,
      data: {
        title,
        type: matchedType!,
        categoryId: matchedCategory!.id,
        categoryName: matchedCategory!.title,
        builderId,
        builderName: builderRaw,
        price,
        priceValueLakh: priceValueLakh.value,
        location: str(get("Location")),
        address: str(get("Address")),
        mapQuery: str(get("Google Maps Location")),
        beds: beds.value === null ? null : Math.round(beds.value),
        baths: baths.value === null ? null : Math.round(baths.value),
        area: str(get("Area")),
        areaSqft: areaSqft.value === null ? null : Math.round(areaSqft.value),
        description: str(get("Description")),
        status,
        featured,
      },
    });
  }

  return {
    validRows,
    errorRows,
    newCount: validRows.filter((r) => r.action === "create").length,
    updateCount: validRows.filter((r) => r.action === "update").length,
  };
}

// Re-exported so API routes/UI don't need to reach into columnMapping.ts
// directly for these.
export { COLUMN_DEFS, PROPERTY_ID_HEADER };
