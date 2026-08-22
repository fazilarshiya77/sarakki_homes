import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, CAN } from "@/lib/authz";

const GENERIC_ERROR = "Something went wrong. Please try again.";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(CAN.MANAGE_CONTENT);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { properties: true } } },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    // Property.categoryId is a required field (every listing must belong
    // to a category), so deleting a category still holding properties
    // would either violate the FK constraint or silently orphan them —
    // neither is acceptable. Move or delete those properties first,
    // same principle as not letting an admin delete a folder that still
    // has files in it.
    if (category._count.properties > 0) {
      return NextResponse.json(
        {
          error: `"${category.title}" still has ${category._count.properties} propert${
            category._count.properties === 1 ? "y" : "ies"
          } assigned to it. Move or delete those first, then remove the category.`,
        },
        { status: 409 }
      );
    }

    await prisma.category.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        userId: auth.user.id,
        action: "DELETE_CATEGORY",
        details: `Deleted category: ${category.title}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[api/admin/categories/[id]] DELETE failed:", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}
