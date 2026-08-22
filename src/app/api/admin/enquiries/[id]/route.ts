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
        // `body.staffId || undefined` meant sending `null` to unassign
        // silently did nothing (undefined tells Prisma "skip this
        // field," which null-coalescing away from `|| undefined` also
        // produces for an explicit null). Only fall back to "don't
        // touch this field" when the key is truly absent from the
        // request body.
        staffId: body.staffId !== undefined ? body.staffId : undefined,
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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(CAN.MANAGE_CRM);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {
    const existing = await prisma.enquiry.findUnique({
      where: { id },
      select: { id: true, customer: { select: { name: true } } },
    });
    if (!existing) {
      return NextResponse.json({ error: "Enquiry not found." }, { status: 404 });
    }

    await prisma.enquiry.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        userId: auth.user.id,
        action: "DELETE_ENQUIRY",
        details: `Deleted enquiry from ${existing.customer.name} (ID: ${id})`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[api/admin/enquiries/[id]] DELETE failed:", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}
