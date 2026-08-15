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
    const tasks = await prisma.leadTask.findMany({
      include: { lead: { select: { id: true, name: true } } },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ tasks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Standalone tasks (not tied to a lead) are supported here — the per-lead
// creation route (src/app/api/admin/leads/[id]/tasks) is a thin wrapper
// over the same model for when a task originates from a lead's own page.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Task title is required." }, { status: 400 });
    }

    const task = await prisma.leadTask.create({
      data: {
        leadId: body.leadId || null,
        title: body.title.trim(),
        description: body.description || null,
        assignedTo: body.assignedTo || null,
        priority: body.priority || "MEDIUM",
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
      },
    });

    if (body.leadId) {
      await prisma.leadTimelineEntry.create({
        data: {
          leadId: body.leadId,
          type: "TASK",
          title: `Task added: ${task.title}`,
          author: session.user.name || session.user.email || "Staff",
        },
      });
    }

    return NextResponse.json({ task });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
