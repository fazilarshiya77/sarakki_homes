import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
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
        author: session.user.name || session.user.email || "Staff",
      },
    });

    return NextResponse.json({ task });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
