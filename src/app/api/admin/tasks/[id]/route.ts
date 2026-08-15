import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
    const data: Record<string, unknown> = {};
    const fields = ["title", "description", "assignedTo", "priority", "status"] as const;
    for (const f of fields) {
      if (body[f] !== undefined) data[f] = body[f];
    }
    if (body.dueDate !== undefined) {
      data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    }

    const task = await prisma.leadTask.update({ where: { id }, data });

    if (body.status !== undefined && task.leadId) {
      await prisma.leadTimelineEntry.create({
        data: {
          leadId: task.leadId,
          type: "TASK",
          title: `Task "${task.title}" marked ${body.status.replace(/_/g, " ").toLowerCase()}`,
          author: session.user.name || session.user.email || "Staff",
        },
      });
    }

    return NextResponse.json({ task });
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
    await prisma.leadTask.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
