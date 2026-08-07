import { NextResponse } from "next/server";
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
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    if (!body.name || !body.quote) {
      return NextResponse.json({ error: "Name and quote are required" }, { status: 400 });
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        name: body.name,
        role: body.role || "Homebuyer",
        quote: body.quote,
        rating: parseInt(body.rating || "5"),
        imagePublic: body.imagePublic || null,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_TESTIMONIAL",
        details: `Created testimonial by ${body.name}`,
      },
    });

    return NextResponse.json({ testimonial });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
