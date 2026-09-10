import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, CAN } from "@/lib/authz";
import { revalidateCategoryPage } from "@/lib/brochures";

const GENERIC_ERROR = "Something went wrong. Please try again.";

// ?categoryId=<id> narrows the list to one category's brochures (used by
// the per-category CRM management page); omitted, it returns every
// brochure across every category (used by the standalone brochure list,
// if one is ever added) — same optional-filter convention as other
// admin list routes in this project.
export async function GET(req: Request) {
  const auth = await requireRole(CAN.MANAGE_CONTENT);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId") || undefined;

  try {
    const brochures = await prisma.brochure.findMany({
      where: categoryId ? { categoryId } : undefined,
      include: { category: { select: { id: true, title: true, slug: true } } },
      orderBy: [{ categoryId: "asc" }, { order: "asc" }],
    });
    return NextResponse.json({ brochures });
  } catch (error: unknown) {
    console.error("[api/admin/brochures] GET failed:", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireRole(CAN.MANAGE_CONTENT);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();

    // Only title, category, and the actual file are required — everything
    // else (description, thumbnail, publish state) is genuinely optional
    // per spec, and must never block creating the brochure.
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const categoryId = typeof body.categoryId === "string" ? body.categoryId.trim() : "";
    const fileUrl = typeof body.fileUrl === "string" ? body.fileUrl.trim() : "";

    if (!title) return NextResponse.json({ error: "Brochure title is required." }, { status: 400 });
    if (!categoryId) return NextResponse.json({ error: "A category is required." }, { status: 400 });
    if (!fileUrl) return NextResponse.json({ error: "A brochure file is required." }, { status: 400 });

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) return NextResponse.json({ error: "That category could not be found." }, { status: 400 });

    // New brochures land after every existing one in the same category by
    // default — the admin can still reorder afterward — rather than all
    // defaulting to 0 and needing to be manually resequenced immediately.
    const last = await prisma.brochure.findFirst({
      where: { categoryId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const brochure = await prisma.brochure.create({
      data: {
        title,
        categoryId,
        fileUrl,
        description: body.description || null,
        thumbnailUrl: body.thumbnailUrl || null,
        published: body.published === undefined ? true : !!body.published,
        order: (last?.order ?? -1) + 1,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: auth.user.id,
        action: "CREATE_BROCHURE",
        details: `Added brochure "${title}" to category "${category.title}"`,
      },
    });

    revalidateCategoryPage(category.slug);

    return NextResponse.json({ brochure });
  } catch (error: unknown) {
    console.error("[api/admin/brochures] POST failed:", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}
