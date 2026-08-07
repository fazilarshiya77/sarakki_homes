import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const builders = await prisma.builder.findMany({
      include: { _count: { select: { properties: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ builders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    if (!body.name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const builder = await prisma.builder.create({
      data: { name: body.name },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_BUILDER",
        details: `Created builder: ${body.name}`,
      },
    });

    return NextResponse.json({ builder });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
