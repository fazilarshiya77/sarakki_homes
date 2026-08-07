import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();

    const enquiry = await prisma.enquiry.update({
      where: { id },
      data: {
        status: body.status,
        notes: body.notes,
        staffId: body.staffId || undefined,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_ENQUIRY",
        details: `Updated enquiry status to ${body.status} for enquiry ID: ${id}`,
      },
    });

    return NextResponse.json({ enquiry });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
