import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, CAN } from "@/lib/authz";

const GENERIC_ERROR = "Something went wrong. Please try again.";

export async function GET() {
  const auth = await requireRole(CAN.MANAGE_CONTENT);
  if (!auth.ok) return auth.response;

  try {
    const propertyTypes = await prisma.propertyType.findMany({
      include: { _count: { select: { properties: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ propertyTypes });
  } catch (error: unknown) {
    console.error("[api/admin/property-types] GET failed:", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireRole(CAN.MANAGE_CONTENT);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    if (!body.name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const propertyType = await prisma.propertyType.create({
      data: { name: body.name },
    });

    await prisma.activityLog.create({
      data: {
        userId: auth.user.id,
        action: "CREATE_PROPERTY_TYPE",
        details: `Created property type: ${body.name}`,
      },
    });

    return NextResponse.json({ propertyType });
  } catch (error: unknown) {
    console.error("[api/admin/property-types] POST failed:", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}
