import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, CAN } from "@/lib/authz";

const GENERIC_ERROR = "Something went wrong. Please try again.";

export async function GET() {
  const auth = await requireRole(CAN.MANAGE_CONTENT);
  if (!auth.ok) return auth.response;

  try {
    const builders = await prisma.builder.findMany({
      include: { _count: { select: { properties: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ builders });
  } catch (error: unknown) {
    console.error("[api/admin/builders] GET failed:", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireRole(CAN.MANAGE_CONTENT);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    if (!body.name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const builder = await prisma.builder.create({
      data: { name: body.name },
    });

    await prisma.activityLog.create({
      data: {
        userId: auth.user.id,
        action: "CREATE_BUILDER",
        details: `Created builder: ${body.name}`,
      },
    });

    return NextResponse.json({ builder });
  } catch (error: unknown) {
    console.error("[api/admin/builders] POST failed:", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}
