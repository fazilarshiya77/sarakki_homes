import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, CAN } from "@/lib/authz";

const GENERIC_ERROR = "Something went wrong. Please try again.";

export async function GET() {
  const auth = await requireRole(CAN.MANAGE_CONTENT);
  if (!auth.ok) return auth.response;

  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { properties: true } } },
      orderBy: { title: "asc" },
    });
    return NextResponse.json({ categories });
  } catch (error: unknown) {
    console.error("[api/admin/categories] GET failed:", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireRole(CAN.MANAGE_CONTENT);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    if (!body.title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const category = await prisma.category.create({
      data: {
        title: body.title,
        slug,
        description: body.description || "",
        heroTagline: body.heroTagline || "",
        longDescription: body.longDescription || "",
        highlights: JSON.stringify(body.highlights || []),
        idealFor: JSON.stringify(body.idealFor || []),
        tone: body.tone || "warm",
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: auth.user.id,
        action: "CREATE_CATEGORY",
        details: `Created category: ${body.title}`,
      },
    });

    return NextResponse.json({ category });
  } catch (error: unknown) {
    console.error("[api/admin/categories] POST failed:", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}
