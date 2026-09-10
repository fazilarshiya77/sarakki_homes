import ExcelJS from "exceljs";
import { ALL_HEADERS, COLUMN_DEFS, PROPERTY_ID_HEADER } from "./columnMapping";

export interface RawImportRow {
  /** The actual Excel row number (1-based, header is row 1) — shown to
   *  the admin in error messages so they can find the row in Excel. */
  rowNumber: number;
  /** Header text -> raw cell value as trimmed text. Every header from
   *  ALL_HEADERS is present as a key, even if the cell was empty (""). */
  values: Record<string, string>;
}

/** Reads the first worksheet of an uploaded workbook into header-keyed rows.
 *  Never throws on a malformed row — a genuinely unreadable file (not an
 *  .xlsx/.xls at all) is the only thing that surfaces as an error, since
 *  everything else is meant to be caught by validation and shown to the
 *  admin as a fixable row error instead of a hard failure. */
export async function parseUploadedWorkbook(buffer: ArrayBuffer): Promise<{
  rows: RawImportRow[];
  headerRow: string[];
} | null> {
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(buffer);
  } catch {
    return null;
  }

  const sheet = workbook.worksheets[0];
  if (!sheet) return null;

  const headerRowCells = sheet.getRow(1);
  const headerRow: string[] = [];
  headerRowCells.eachCell({ includeEmpty: false }, (cell) => {
    headerRow.push(String(cell.value ?? "").trim());
  });

  const rows: RawImportRow[] = [];
  const lastRow = sheet.actualRowCount;

  for (let r = 2; r <= lastRow; r++) {
    const row = sheet.getRow(r);
    // Skip fully blank rows (common in exported/edited sheets) rather
    // than reporting them as errors — they carry no data to validate.
    if (row.cellCount === 0 || row.values === undefined) continue;

    const values: Record<string, string> = {};
    let hasAnyValue = false;

    headerRow.forEach((header, idx) => {
      const cell = row.getCell(idx + 1);
      const raw = cellToText(cell.value);
      values[header] = raw;
      if (raw !== "") hasAnyValue = true;
    });

    if (!hasAnyValue) continue;

    rows.push({ rowNumber: r, values });
  }

  return { rows, headerRow };
}

function cellToText(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    // Rich text / formula result / hyperlink objects.
    if ("text" in value && typeof value.text === "string") return value.text.trim();
    if ("result" in value && value.result !== undefined && value.result !== null) {
      return String(value.result).trim();
    }
    if (value instanceof Date) return value.toISOString();
    return "";
  }
  return String(value).trim();
}

const HEADER_STYLE: Partial<ExcelJS.Style> = {
  font: { bold: true, color: { argb: "FFFFFFFF" } },
  fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF171715" } },
  alignment: { vertical: "middle", horizontal: "left" },
};

/** The blank downloadable template: headers only, plus one filled-in
 *  example row so a non-technical admin can see the expected format at a
 *  glance, plus a read-only "Reference" sheet listing the exact category/
 *  builder/type/status values the CRM currently recognizes (so the admin
 *  never has to guess or invent a category name that doesn't exist). */
export async function buildTemplateWorkbook(reference: {
  categories: string[];
  builders: string[];
}): Promise<ExcelJS.Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Properties");

  sheet.columns = ALL_HEADERS.map((header) => ({ header, key: header, width: Math.max(18, header.length + 4) }));
  sheet.getRow(1).eachCell((cell) => Object.assign(cell, { style: HEADER_STYLE }));

  const exampleRow: Record<string, string> = {
    [PROPERTY_ID_HEADER]: "",
    "Property Name": "Prestige Lakeside Habitat",
    "Property Type": "Resale",
    Category: reference.categories[0] ?? "Rental Income Properties",
    Builder: reference.builders[0] ?? "",
    Price: "₹1.25 Cr",
    "Price in Lakh": "125",
    Location: "Whitefield",
    Address: "123, Lakeside Habitat, Whitefield, Bengaluru",
    "Google Maps Location": "Prestige Lakeside Habitat Whitefield Bengaluru",
    Bedrooms: "3",
    Bathrooms: "2",
    Area: "1,450 sq.ft",
    "Area (Sqft)": "1450",
    Description: "A well-maintained 3BHK apartment close to Whitefield's tech corridor.",
    Status: "",
    Featured: "No",
  };
  sheet.addRow(exampleRow);

  const refSheet = workbook.addWorksheet("Reference (do not edit)");
  refSheet.columns = [
    { header: "Existing Categories", key: "cat", width: 32 },
    { header: "Existing Builders", key: "builder", width: 32 },
    { header: "Property Type values", key: "type", width: 22 },
    { header: "Status values", key: "status", width: 20 },
  ];
  refSheet.getRow(1).eachCell((cell) => Object.assign(cell, { style: HEADER_STYLE }));
  const typeDef = COLUMN_DEFS.find((c) => c.field === "type");
  const statusDef = COLUMN_DEFS.find((c) => c.field === "status");
  const maxLen = Math.max(
    reference.categories.length,
    reference.builders.length,
    typeDef?.enumValues?.length ?? 0,
    statusDef?.enumValues?.length ?? 0
  );
  for (let i = 0; i < maxLen; i++) {
    refSheet.addRow({
      cat: reference.categories[i] ?? "",
      builder: reference.builders[i] ?? "",
      type: typeDef?.enumValues?.[i] ?? "",
      status: statusDef?.enumValues?.[i] ?? "",
    });
  }

  return workbook.xlsx.writeBuffer();
}

/** Export: same headers as the template, one row per existing property,
 *  Property ID filled in so a re-upload of the edited file updates
 *  (never duplicates) those exact rows. */
export async function buildExportWorkbook(
  properties: Array<{
    propertyId: string;
    title: string;
    type: string;
    categoryTitle: string;
    builderName: string | null;
    price: string;
    priceValueLakh: number;
    location: string;
    address: string;
    mapQuery: string;
    beds: number;
    baths: number;
    area: string;
    areaSqft: number;
    description: string;
    status: string;
    featured: string;
  }>
): Promise<ExcelJS.Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Properties");
  sheet.columns = ALL_HEADERS.map((header) => ({ header, key: header, width: Math.max(18, header.length + 4) }));
  sheet.getRow(1).eachCell((cell) => Object.assign(cell, { style: HEADER_STYLE }));

  for (const p of properties) {
    sheet.addRow({
      [PROPERTY_ID_HEADER]: p.propertyId,
      "Property Name": p.title,
      "Property Type": p.type,
      Category: p.categoryTitle,
      Builder: p.builderName ?? "",
      Price: p.price,
      "Price in Lakh": String(p.priceValueLakh),
      Location: p.location,
      Address: p.address,
      "Google Maps Location": p.mapQuery,
      Bedrooms: String(p.beds),
      Bathrooms: String(p.baths),
      Area: p.area,
      "Area (Sqft)": String(p.areaSqft),
      Description: p.description,
      Status: p.status,
      Featured: p.featured === "true" ? "Yes" : "No",
    });
  }

  return workbook.xlsx.writeBuffer();
}
