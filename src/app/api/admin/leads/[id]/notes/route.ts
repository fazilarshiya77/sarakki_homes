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
    if (!body.content?.trim()) {
      return NextResponse.json({ error: "Note content is required." }, { status: 400 });
    }

    const author = auth.user.name || auth.user.email || "Staff";

    const note = await prisma.leadNote.create({
      data: {
        leadId: id,
        author,
        content: body.content.trim(),
        pinned: !!body.pinned,
      },
    });

    await prisma.leadTimelineEntry.create({
      data: {
        leadId: id,
        type: "NOTE",
        title: "Note added",
        description: body.content.trim().slice(0, 140),
        author,
      },
    });

    return NextResponse.json({ note });
  } catch (error: unknown) {
    console.error("[api/admin/leads/[id]/notes] POST failed:", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}
