import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, CAN } from "@/lib/authz";

const GENERIC_ERROR = "Something went wrong. Please try again.";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(CAN.MANAGE_CONTENT);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {
    const builder = await prisma.builder.findUnique({
      where: { id },
      include: { _count: { select: { properties: true } } },
    });

    if (!builder) {
      return NextResponse.json({ error: "Builder not found." }, { status: 404 });
    }

    // Same principle as Category delete: Builder is now a nullable FK
    // (onDelete: SetNull in schema), so deleting one that's still in use
    // wouldn't technically break anything at the database level — but
    // silently clearing the builder off N live listings behind the
    // admin's back is exactly the kind of surprise a confirmation
    // dialog can't undo. Require moving/clearing those properties'
    // builder first, same as categories.
    if (builder._count.properties > 0) {
      return NextResponse.json(
        {
          error: `"${builder.name}" is still assigned to ${builder._count.properties} propert${
            builder._count.properties === 1 ? "y" : "ies"
          }. Change those to a different builder (or "None") first, then remove it.`,
        },
        { status: 409 }
      );
    }

    await prisma.builder.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        userId: auth.user.id,
        action: "DELETE_BUILDER",
        details: `Deleted builder: ${builder.name}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[api/admin/builders/[id]] DELETE failed:", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}
