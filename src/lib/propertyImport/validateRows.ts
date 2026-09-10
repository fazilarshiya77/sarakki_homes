import {
  DEFAULT_CATEGORY_TITLE,
  DEFAULT_PRICE_TEXT,
  DEFAULT_TYPE,
  PROPERTY_STATUS_VALUES,
} from "./columnMapping";
import { firstNumber, parseBathrooms, parseBhk, parsePrice, parseSqft } from "./fieldResolver";
import type { RawImportRow } from "./workbook";

// A null on any of these means "the sheet didn't give this" — on an
// UPDATE that means "leave the field exactly as it is" (same principle
// as images never being touched); on a CREATE it falls back to the same
// safe default the manual "Add Property" form uses.
export interface ValidatedRowData {
  title: string;
  type: string | null;
  categoryId: string | null;
  categoryName: string | null;
  builderId: string | null;
  builderName: string | null;
  price: string | null;
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
  sourceLabel: string;
  action: "create" | "update";
  targetId?: string;
  propertyId: string;
  data: ValidatedRowData;
  /** Non-blocking assumptions made about this row (guessed category,
   *  created-as-new because no ID, etc.) — surfaced in the preview so
   *  nothing is a silent surprise. */
  notes: string[];
}

export interface ErrorRow {
  rowNumber: number;
  sourceLabel: string;
  propertyId: string;
  propertyName: string;
  errors: string[];
}

export interface ReferenceData {
  categories: Map<string, { id: string; title: string }>;
  builders: Map<string, { id: string; name: string }>;
  existingPropertyIds: Map<string, string>;
}

export interface ValidationResult {
  validRows: ValidRow[];
  errorRows: ErrorRow[];
  newCount: number;
  updateCount: number;
  /** De-duplicated, counted summary of the assumptions above, for the
   *  preview screen. */
  assumptions: string[];
}

/** "rental income properties" and "rental income" should match the same
 *  category — try the value as-is, then with a trailing
 *  "property"/"properties" trimmed off each side. */
function matchByName<T>(map: Map<string, T>, raw: string): T | undefined {
  const norm = (s: string) =>
    s.toLowerCase().replace(/\bproperties?\b/g, "").replace(/[^a-z0-9]/g, "");
  const direct = map.get(raw.toLowerCase().trim());
  if (direct) return direct;
  const target = norm(raw);
  for (const [key, val] of map) {
    if (norm(key) === target) return val;
  }
  return undefined;
}

export function validateAndResolveRows(rawRows: RawImportRow[], ref: ReferenceData): ValidationResult {
  const validRows: ValidRow[] = [];
  const errorRows: ErrorRow[] = [];
  const seenIdsInFile = new Map<string, number>();
  const assumptionCounts = new Map<string, number>();
  const bump = (key: string) => assumptionCounts.set(key, (assumptionCounts.get(key) ?? 0) + 1);

  const defaultCategory = matchByName(ref.categories, DEFAULT_CATEGORY_TITLE);

  rawRows.forEach((row, idx) => {
    const rowNumber = idx + 1; // position among data rows, for the error report
    const v = row.values;
    const errors: string[] = [];
    const notes: string[] = [];

    const title = (v.title ?? "").trim();
    const propertyIdRaw = (v.propertyId ?? "").trim();

    if (!title) {
      errorRows.push({
        rowNumber,
        sourceLabel: row.sourceLabel,
        propertyId: propertyIdRaw,
        propertyName: "",
        errors: ["No property name found in this row."],
      });
      return;
    }

    // --- create vs. update -------------------------------------------------
    let action: "create" | "update" = "create";
    let targetId: string | undefined;
    if (propertyIdRaw) {
      const firstSeenAt = seenIdsInFile.get(propertyIdRaw);
      if (firstSeenAt !== undefined) {
        errors.push(`Duplicate Property ID "${propertyIdRaw}" — already used in row ${firstSeenAt}.`);
      } else {
        seenIdsInFile.set(propertyIdRaw, rowNumber);
      }
      const existingDbId = ref.existingPropertyIds.get(propertyIdRaw);
      if (!existingDbId) {
        errors.push(`Property ID "${propertyIdRaw}" was not found in the CRM.`);
      } else {
        action = "update";
        targetId = existingDbId;
      }
    } else {
      bump("no-id");
    }

    // --- category --------------------------------------------------------
    let categoryId: string | null = null;
    let categoryName: string | null = null;
    const categoryRaw = (v.category ?? "").trim();
    if (categoryRaw) {
      const matched = matchByName(ref.categories, categoryRaw);
      if (matched) {
        categoryId = matched.id;
        categoryName = matched.title;
      } else if (action === "create") {
        if (!defaultCategory) {
          errors.push(
            `Category "${categoryRaw}" doesn't exist, and the fallback category "${DEFAULT_CATEGORY_TITLE}" isn't set up either.`
          );
        } else {
          categoryId = defaultCategory.id;
          categoryName = defaultCategory.title;
          notes.push(`Category "${categoryRaw}" not found — imported into "${defaultCategory.title}".`);
          bump("category-guessed");
        }
      } else {
        notes.push(`Category "${categoryRaw}" not found — kept its current category.`);
        bump("category-kept");
      }
    } else if (action === "create") {
      if (!defaultCategory) {
        errors.push(`No Category given and the fallback category "${DEFAULT_CATEGORY_TITLE}" isn't set up.`);
      } else {
        categoryId = defaultCategory.id;
        categoryName = defaultCategory.title;
        bump("category-defaulted");
      }
    }

    // --- builder (optional, never blocks) --------------------------------
    let builderId: string | null = null;
    let builderName: string | null = null;
    const builderRaw = (v.builder ?? "").trim();
    if (builderRaw) {
      const matched = matchByName(ref.builders, builderRaw);
      if (matched) {
        builderId = matched.id;
        builderName = matched.name;
      } else {
        notes.push(`Builder "${builderRaw}" not found — left unset.`);
        bump("builder-missing");
      }
    }

    // --- price ----------------------------------------------------------
    const priceRaw = (v.price ?? "").trim();
    let price: string | null = null;
    let priceValueLakh: number | null = null;
    if (priceRaw) {
      const parsed = parsePrice(priceRaw);
      price = parsed.display;
      priceValueLakh = parsed.lakh;
    } else if (action === "create") {
      price = DEFAULT_PRICE_TEXT;
      bump("price-missing");
    }
    // An explicit numeric "price in lakh" column always wins if present.
    const explicitLakh = firstNumber((v.priceValueLakh ?? "").trim());
    if (explicitLakh !== null && explicitLakh >= 0) priceValueLakh = explicitLakh;

    // --- everything else (all optional, all lenient) -------------------
    const type = (v.type ?? "").trim() || (action === "create" ? DEFAULT_TYPE : null);

    const beds = v.beds != null ? parseBhk(v.beds) : null;
    const baths = v.baths != null ? parseBathrooms(v.baths) : null;
    const area = (v.area ?? "").trim() || null;
    let areaSqft = v.areaSqft != null ? parseSqft(v.areaSqft) : null;
    if (areaSqft === null && area) areaSqft = parseSqft(area);

    const location = (v.location ?? "").trim() || null;
    const address = (v.address ?? "").trim() || null;
    const mapQuery = (v.mapQuery ?? "").trim() || null;

    const descBase = (v.description ?? "").trim();
    const description = [descBase, row.extra.trim()].filter(Boolean).join("\n\n") || null;

    let status: string | null = null;
    const statusRaw = (v.status ?? "").trim();
    if (statusRaw) {
      status = PROPERTY_STATUS_VALUES.find((s) => s.toLowerCase() === statusRaw.toLowerCase()) ?? null;
    }

    let featured: string | null = null;
    const featuredRaw = (v.featured ?? "").trim();
    if (/^(yes|true|y|1)$/i.test(featuredRaw)) featured = "true";
    else if (/^(no|false|n|0)$/i.test(featuredRaw)) featured = "false";

    if (errors.length > 0) {
      errorRows.push({
        rowNumber,
        sourceLabel: row.sourceLabel,
        propertyId: propertyIdRaw,
        propertyName: title,
        errors,
      });
      return;
    }

    validRows.push({
      rowNumber,
      sourceLabel: row.sourceLabel,
      action,
      targetId,
      propertyId: propertyIdRaw,
      notes,
      data: {
        title,
        type,
        categoryId,
        categoryName,
        builderId,
        builderName,
        price,
        priceValueLakh,
        location,
        address,
        mapQuery,
        beds,
        baths,
        area,
        areaSqft,
        description,
        status,
        featured,
      },
    });
  });

  const label: Record<string, (n: number) => string> = {
    "no-id": (n) => `${n} row${n === 1 ? "" : "s"} have no Property ID — created as new (re-uploading this file later would add them again).`,
    "category-defaulted": (n) => `${n} row${n === 1 ? "" : "s"} had no Category — imported into "${DEFAULT_CATEGORY_TITLE}".`,
    "category-guessed": (n) => `${n} row${n === 1 ? "" : "s"} had a Category that doesn't exist — imported into "${DEFAULT_CATEGORY_TITLE}".`,
    "category-kept": (n) => `${n} existing propert${n === 1 ? "y" : "ies"} had an unknown Category — their category was left unchanged.`,
    "builder-missing": (n) => `${n} row${n === 1 ? "" : "s"} named a Builder that doesn't exist — left unset.`,
    "price-missing": (n) => `${n} row${n === 1 ? "" : "s"} had no Price — set to "${DEFAULT_PRICE_TEXT}".`,
  };
  const assumptions: string[] = [];
  for (const [key, n] of assumptionCounts) {
    assumptions.push(label[key] ? label[key](n) : `${n} rows: ${key}`);
  }
  if (validRows.some((r) => r.action === "create")) {
    assumptions.push("New properties are created as UNPUBLISHED drafts — nothing shows on the website until you publish it.");
  }

  return {
    validRows,
    errorRows,
    newCount: validRows.filter((r) => r.action === "create").length,
    updateCount: validRows.filter((r) => r.action === "update").length,
    assumptions,
  };
}
