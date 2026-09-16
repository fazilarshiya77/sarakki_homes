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
    const propertyType = await prisma.propertyType.findUnique({
      where: { id },
      include: { _count: { select: { properties: true } } },
    });

    if (!propertyType) {
      return NextResponse.json({ error: "Property type not found." }, { status: 404 });
    }

    // Property.propertyTypeId is required (every listing must have a
    // type), so deleting a type still assigned to properties would
    // either violate the FK constraint or leave them without a valid
    // type. Same guard as Category/Builder delete.
    if (propertyType._count.properties > 0) {
      return NextResponse.json(
        {
          error: `"${propertyType.name}" is still assigned to ${propertyType._count.properties} propert${
            propertyType._count.properties === 1 ? "y" : "ies"
          }. Change those to a different property type first, then remove it.`,
        },
        { status: 409 }
      );
    }

    await prisma.propertyType.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        userId: auth.user.id,
        action: "DELETE_PROPERTY_TYPE",
        details: `Deleted property type: ${propertyType.name}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[api/admin/property-types/[id]] DELETE failed:", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}
