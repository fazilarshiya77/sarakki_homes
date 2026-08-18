import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, CAN } from "@/lib/authz";

const GENERIC_ERROR = "Something went wrong. Please try again.";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(CAN.MANAGE_CRM);
  if (!auth.ok) return auth.response;

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
          author: auth.user.name || auth.user.email || "Staff",
        },
      });
    }

    return NextResponse.json({ task });
  } catch (error: unknown) {
    console.error("[api/admin/tasks/[id]] PUT failed:", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // CRM workflow data, not public-facing content — DELETE_CONTENT is
  // about published inventory, so deleting a task stays MANAGE_CRM.
  const auth = await requireRole(CAN.MANAGE_CRM);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {
    await prisma.leadTask.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[api/admin/tasks/[id]] DELETE failed:", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}
