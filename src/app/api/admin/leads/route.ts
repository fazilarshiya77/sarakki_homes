import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const leads = await prisma.lead.findMany({
      include: {
        agent: { select: { id: true, name: true } },
        tasks: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ leads });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (!body.name || !body.phone) {
      return NextResponse.json(
        { error: "Name and phone are required." },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email || null,
        location: body.location || null,
        budgetMinLakh: body.budgetMinLakh ? Number(body.budgetMinLakh) : null,
        budgetMaxLakh: body.budgetMaxLakh ? Number(body.budgetMaxLakh) : null,
        propertyType: body.propertyType || null,
        purpose: body.purpose || "Buy",
        source: body.source || "Website",
        bedrooms: body.bedrooms ? Number(body.bedrooms) : null,
        bathrooms: body.bathrooms ? Number(body.bathrooms) : null,
        areaRequired: body.areaRequired || null,
        possession: body.possession || null,
        priority: body.priority || "MEDIUM",
        agentId: body.agentId || null,
        timeline: {
          create: {
            type: "CREATED",
            title: "Lead created",
            author: session.user.name || session.user.email || "Staff",
          },
        },
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: (session.user as any).id,
        action: "CREATE_LEAD",
        details: `Created lead "${lead.name}" (${lead.id})`,
      },
    });

    return NextResponse.json({ lead });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
