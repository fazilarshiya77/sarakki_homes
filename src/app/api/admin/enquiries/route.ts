import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, CAN } from "@/lib/authz";

const GENERIC_ERROR = "Something went wrong. Please try again.";

export async function GET() {
  const auth = await requireRole(CAN.MANAGE_CRM);
  if (!auth.ok) return auth.response;

  try {
    const enquiries = await prisma.enquiry.findMany({
      include: {
        customer: true,
        property: true,
        assignedTo: { select: { id: true, name: true } },
        requirementCategory: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // For every enquiry that has a structured requirement (bedrooms +
    // category), count how many currently PUBLISHED listings actually
    // match it, so staff can see live inventory fit right in the table
    // without hand-searching Properties. Grouped by the distinct
    // (bedrooms, categoryId) pairs actually present — most enquiries
    // that specify a requirement share the same handful of combos, so
    // this stays a handful of queries rather than one per row.
    const requirementCombos = new Map<string, { beds: number; categoryId: string }>();
    for (const enq of enquiries) {
      if (enq.requirementBedrooms != null && enq.requirementCategoryId) {
        requirementCombos.set(`${enq.requirementBedrooms}:${enq.requirementCategoryId}`, {
          beds: enq.requirementBedrooms,
          categoryId: enq.requirementCategoryId,
        });
      }
    }

    const matchCounts = new Map<string, number>();
    await Promise.all(
      Array.from(requirementCombos.entries()).map(async ([key, { beds, categoryId }]) => {
        const count = await prisma.property.count({
          where: { beds, categoryId, status: "PUBLISHED" },
        });
        matchCounts.set(key, count);
      })
    );

    const enquiriesWithMatches = enquiries.map((enq) => ({
      ...enq,
      matchingPropertiesCount:
        enq.requirementBedrooms != null && enq.requirementCategoryId
          ? matchCounts.get(`${enq.requirementBedrooms}:${enq.requirementCategoryId}`) ?? 0
          : null,
    }));

    return NextResponse.json({ enquiries: enquiriesWithMatches });
  } catch (error: unknown) {
    console.error("[api/admin/enquiries] GET failed:", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}
