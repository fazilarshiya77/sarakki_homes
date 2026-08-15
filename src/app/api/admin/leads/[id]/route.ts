import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        agent: { select: { id: true, name: true } },
        notes: { orderBy: [{ pinned: "desc" }, { createdAt: "desc" }] },
        tasks: { orderBy: { createdAt: "desc" } },
        timeline: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Every field is optional here — this route serves both small inline edits
// (stage drag on the pipeline board, favorite toggle) and the full detail
// form, so it only touches whatever the caller actually sent.
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    const fields = [
      "name",
      "phone",
      "email",
      "location",
      "propertyType",
      "purpose",
      "source",
      "areaRequired",
      "possession",
      "priority",
      "wonDetails",
      "lostReason",
      "agentId",
    ] as const;
    for (const f of fields) {
      if (body[f] !== undefined) data[f] = body[f] || null;
    }
    if (body.budgetMinLakh !== undefined) {
      data.budgetMinLakh = body.budgetMinLakh === null || body.budgetMinLakh === "" ? null : Number(body.budgetMinLakh);
    }
    if (body.budgetMaxLakh !== undefined) {
      data.budgetMaxLakh = body.budgetMaxLakh === null || body.budgetMaxLakh === "" ? null : Number(body.budgetMaxLakh);
    }
    if (body.bedrooms !== undefined) {
      data.bedrooms = body.bedrooms === null || body.bedrooms === "" ? null : Number(body.bedrooms);
    }
    if (body.bathrooms !== undefined) {
      data.bathrooms = body.bathrooms === null || body.bathrooms === "" ? null : Number(body.bathrooms);
    }
    if (body.favorite !== undefined) data.favorite = !!body.favorite;
    if (body.markContacted) data.lastContact = new Date();

    const actor = session.user.name || session.user.email || "Staff";
    const timelineEntries: { type: string; title: string; description?: string; author: string }[] = [];

    if (body.stage !== undefined && body.stage !== existing.stage) {
      data.stage = body.stage;
      timelineEntries.push({
        type: "STAGE_CHANGE",
        title: `Stage moved to ${body.stage.replace(/_/g, " ")}`,
        author: actor,
      });
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...data,
        ...(timelineEntries.length
          ? { timeline: { create: timelineEntries } }
          : {}),
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: (session.user as any).id,
        action: "UPDATE_LEAD",
        details: `Updated lead "${lead.name}" (${id})`,
      },
    });

    return NextResponse.json({ lead });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const lead = await prisma.lead.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        userId: (session.user as any).id,
        action: "DELETE_LEAD",
        details: `Deleted lead "${lead.name}" (${id})`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
