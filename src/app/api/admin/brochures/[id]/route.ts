import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, CAN } from "@/lib/authz";

const GENERIC_ERROR = "Something went wrong. Please try again.";

// Handles every kind of edit a single brochure needs: the full edit
// form, the Publish/Unpublish toggle, and reordering (the CRM sends
// `{ order: n }` alone for a reorder move) — one route, whatever fields
// the caller actually sent are the only ones touched.
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(CAN.MANAGE_CONTENT);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {
    const body = await req.json();
    const existing = await prisma.brochure.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Brochure not found." }, { status: 404 });

    const data: Record<string, unknown> = {};

    if (body.title !== undefined) {
      const title = String(body.title).trim();
      if (!title) return NextResponse.json({ error: "Brochure title is required." }, { status: 400 });
      data.title = title;
    }
    if (body.categoryId !== undefined) {
      const category = await prisma.category.findUnique({ where: { id: body.categoryId } });
      if (!category) return NextResponse.json({ error: "That category could not be found." }, { status: 400 });
      data.categoryId = body.categoryId;
    }
    if (body.fileUrl !== undefined) {
      const fileUrl = String(body.fileUrl).trim();
      if (!fileUrl) return NextResponse.json({ error: "A brochure file is required." }, { status: 400 });
      data.fileUrl = fileUrl;
    }
    if (body.description !== undefined) data.description = body.description || null;
    if (body.thumbnailUrl !== undefined) data.thumbnailUrl = body.thumbnailUrl || null;
    if (body.published !== undefined) data.published = !!body.published;
    if (body.order !== undefined) data.order = Number(body.order);

    const brochure = await prisma.brochure.update({ where: { id }, data });

    await prisma.activityLog.create({
      data: {
        userId: auth.user.id,
        action: "UPDATE_BROCHURE",
        details: `Updated brochure "${brochure.title}"`,
      },
    });

    return NextResponse.json({ brochure });
  } catch (error: unknown) {
    console.error("[api/admin/brochures/[id]] PUT failed:", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(CAN.MANAGE_CONTENT);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {
    const brochure = await prisma.brochure.findUnique({ where: { id } });
    if (!brochure) return NextResponse.json({ error: "Brochure not found." }, { status: 404 });

    // No "still in use elsewhere" guard needed — unlike Builder/Category,
    // nothing else references a Brochure, so deleting one is always safe
    // at the data level. The confirmation dialog on the CRM side is what
    // protects against an accidental click, same as every other
    // permanent-delete action in the CRM.
    await prisma.brochure.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        userId: auth.user.id,
        action: "DELETE_BROCHURE",
        details: `Deleted brochure "${brochure.title}"`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[api/admin/brochures/[id]] DELETE failed:", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}
