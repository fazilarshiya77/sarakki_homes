import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, CAN } from "@/lib/authz";

// SECURITY: unexpected exceptions are logged server-side (visible in the
// Vercel logs) but never echoed to the client — raw Prisma errors leak
// table/column names and connection details. Deliberate validation
// messages below are safe and stay verbatim.
const GENERIC_ERROR = "Something went wrong. Please try again.";

export async function GET() {
  const auth = await requireRole(CAN.MANAGE_CONTENT);
  if (!auth.ok) return auth.response;

  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ blogs });
  } catch (error: unknown) {
    console.error("[api/admin/blogs] GET failed:", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireRole(CAN.MANAGE_CONTENT);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    if (!body.title || !body.content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const blog = await prisma.blog.create({
      data: {
        title: body.title,
        slug,
        content: body.content,
        featuredImage: body.featuredImage || "/placeholder.jpg",
        seoTitle: body.seoTitle || body.title,
        seoDescription: body.seoDescription || "",
        seoKeywords: JSON.stringify(body.seoKeywords || []),
        published: body.published === true,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: auth.user.id,
        action: "CREATE_BLOG",
        details: `Published blog article: ${body.title}`,
      },
    });

    return NextResponse.json({ blog });
  } catch (error: unknown) {
    console.error("[api/admin/blogs] POST failed:", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}
