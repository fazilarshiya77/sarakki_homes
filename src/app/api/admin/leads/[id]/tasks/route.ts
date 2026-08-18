import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, CAN } from "@/lib/authz";

const GENERIC_ERROR = "Something went wrong. Please try again.";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(CAN.MANAGE_CRM);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {
    const body = await req.json();
    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Task title is required." }, { status: 400 });
    }

    const task = await prisma.leadTask.create({
      data: {
        leadId: id,
        title: body.title.trim(),
        description: body.description || null,
        assignedTo: body.assignedTo || null,
        priority: body.priority || "MEDIUM",
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
      },
    });

    await prisma.leadTimelineEntry.create({
      data: {
        leadId: id,
        type: "TASK",
        title: `Task added: ${task.title}`,
        author: auth.user.name || auth.user.email || "Staff",
      },
    });

    return NextResponse.json({ task });
  } catch (error: unknown) {
    console.error("[api/admin/leads/[id]/tasks] POST failed:", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}
