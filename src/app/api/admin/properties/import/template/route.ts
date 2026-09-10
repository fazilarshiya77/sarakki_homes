import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, CAN } from "@/lib/authz";
import { buildTemplateWorkbook } from "@/lib/propertyImport/workbook";

// Blank downloadable Excel template for bulk property import — headers +
// one example row + a read-only reference sheet of the categories/
// builders/types/statuses this CRM currently recognizes, generated fresh
// on every request so it never goes stale as the admin adds categories.
export async function GET() {
  const auth = await requireRole(CAN.MANAGE_CONTENT);
  if (!auth.ok) return auth.response;

  try {
    const [categories, builders] = await Promise.all([
      prisma.category.findMany({ select: { title: true }, orderBy: { title: "asc" } }),
      prisma.builder.findMany({ select: { name: true }, orderBy: { name: "asc" } }),
    ]);

    const buffer = await buildTemplateWorkbook({
      categories: categories.map((c) => c.title),
      builders: builders.map((b) => b.name),
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="sarakki-homes-property-import-template.xlsx"',
      },
    });
  } catch (error: unknown) {
    console.error("[api/admin/properties/import/template] failed:", error);
    return NextResponse.json({ error: "Could not generate the template. Please try again." }, { status: 500 });
  }
}
