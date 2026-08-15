import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { properties: true } } },
      orderBy: { title: "asc" },
    });
    return NextResponse.json({ categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
        userId: (session.user as any).id,
        action: "CREATE_CATEGORY",
        details: `Created category: ${body.title}`,
      },
    });

    return NextResponse.json({ category });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
