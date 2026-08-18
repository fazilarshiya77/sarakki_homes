import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, CAN } from "@/lib/authz";

const GENERIC_ERROR = "Something went wrong. Please try again.";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(CAN.MANAGE_CONTENT);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const body = await req.json();

    const data: Record<string, unknown> = {};
    if (typeof body.name === "string") data.name = body.name;
    if (typeof body.role === "string") data.role = body.role;
    if (typeof body.location === "string" || body.location === null) data.location = body.location;
    if (typeof body.quote === "string") data.quote = body.quote;
    if (body.rating !== undefined) data.rating = parseInt(body.rating);
    if (typeof body.published === "boolean") data.published = body.published;

    const testimonial = await prisma.testimonial.update({ where: { id }, data });

    await prisma.activityLog.create({
      data: {
        userId: auth.user.id,
        action: "UPDATE_TESTIMONIAL",
        details: `Updated testimonial by ${testimonial.name}${
          typeof body.published === "boolean" ? ` (${body.published ? "published" : "unpublished"})` : ""
        }`,
      },
    });

    // The public homepage reads only published testimonials — bust its
    // cache so a publish/unpublish toggle (or any edit) shows up
    // immediately instead of waiting out the 60s ISR window.
    revalidatePath("/");
    revalidatePath("/process");

    return NextResponse.json({ testimonial });
  } catch (error: unknown) {
    console.error("[api/admin/testimonials/:id] PUT failed:", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(CAN.DELETE_CONTENT);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const testimonial = await prisma.testimonial.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        userId: auth.user.id,
        action: "DELETE_TESTIMONIAL",
        details: `Deleted testimonial by ${testimonial.name}`,
      },
    });

    revalidatePath("/");
    revalidatePath("/process");

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[api/admin/testimonials/:id] DELETE failed:", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}
