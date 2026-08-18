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
        userId: auth.user.id,
        action: "UPDATE_ENQUIRY",
        details: `Updated enquiry status to ${body.status} for enquiry ID: ${id}`,
      },
    });

    return NextResponse.json({ enquiry });
  } catch (error: unknown) {
    console.error("[api/admin/enquiries/[id]] PUT failed:", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}
