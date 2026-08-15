import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ testimonials });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    if (!body.name || !body.quote) {
      return NextResponse.json({ error: "Name and quote are required" }, { status: 400 });
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        name: body.name,
        role: body.role || "Homebuyer",
        location: body.location || null,
        quote: body.quote,
        rating: parseInt(body.rating || "5"),
        imagePublic: body.imagePublic || null,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: (session.user as any).id,
        action: "CREATE_TESTIMONIAL",
        details: `Created testimonial by ${body.name}`,
      },
    });

    // The homepage's testimonials book reads these live — bust its cache
    // so a newly added review appears immediately, not after 60s.
    revalidatePath("/");
    revalidatePath("/process");

    return NextResponse.json({ testimonial });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
