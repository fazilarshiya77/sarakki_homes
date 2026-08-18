import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, CAN } from "@/lib/authz";

const GENERIC_ERROR = "Something went wrong. Please try again.";

export async function GET() {
  const auth = await requireRole(CAN.MANAGE_CRM);
  if (!auth.ok) return auth.response;

  try {
    const tasks = await prisma.leadTask.findMany({
      include: { lead: { select: { id: true, name: true } } },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ tasks });
  } catch (error: unknown) {
    console.error("[api/admin/tasks] GET failed:", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}

// Standalone tasks (not tied to a lead) are supported here — the per-lead
// creation route (src/app/api/admin/leads/[id]/tasks) is a thin wrapper
// over the same model for when a task originates from a lead's own page.
export async function POST(req: Request) {
  const auth = await requireRole(CAN.MANAGE_CRM);
  if (!auth.ok) return auth.response;

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
          author: auth.user.name || auth.user.email || "Staff",
        },
      });
    }

    return NextResponse.json({ task });
  } catch (error: unknown) {
    console.error("[api/admin/tasks] POST failed:", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}
