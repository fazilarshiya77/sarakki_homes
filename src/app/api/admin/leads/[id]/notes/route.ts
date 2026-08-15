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
    if (!body.content?.trim()) {
      return NextResponse.json({ error: "Note content is required." }, { status: 400 });
    }

    const author = session.user.name || session.user.email || "Staff";

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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
