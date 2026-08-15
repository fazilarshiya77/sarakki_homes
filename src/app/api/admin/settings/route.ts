import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    let setting = await prisma.setting.findFirst();
    if (!setting) {
      // Fallback seed
      setting = await prisma.setting.create({
        data: {
          companyName: "Sarakki Homes",
          whatsappNo: "+91 98450 00000",
        },
      });
    }
    return NextResponse.json({ setting });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const existing = await prisma.setting.findFirst();

    let setting;
    if (existing) {
      setting = await prisma.setting.update({
        where: { id: existing.id },
        data: {
          companyName: body.companyName,
          companyLogo: body.companyLogo,
          favicon: body.favicon,
          smtpHost: body.smtpHost,
          smtpPort: parseInt(body.smtpPort || "587"),
          smtpUser: body.smtpUser,
          smtpPassword: body.smtpPassword,
          whatsappNo: body.whatsappNo,
          instagramUrl: body.instagramUrl,
          linkedinUrl: body.linkedinUrl,
          metaTitle: body.metaTitle,
          metaDesc: body.metaDesc,
          heroTitle: body.heroTitle,
          heroDescription: body.heroDescription,
          aboutHeadline: body.aboutHeadline,
          aboutDescription: body.aboutDescription,
        },
      });
    } else {
      setting = await prisma.setting.create({
        data: {
          companyName: body.companyName,
          companyLogo: body.companyLogo,
          favicon: body.favicon,
          smtpHost: body.smtpHost,
          smtpPort: parseInt(body.smtpPort || "587"),
          smtpUser: body.smtpUser,
          smtpPassword: body.smtpPassword,
          whatsappNo: body.whatsappNo,
          instagramUrl: body.instagramUrl,
          linkedinUrl: body.linkedinUrl,
          metaTitle: body.metaTitle,
          metaDesc: body.metaDesc,
          heroTitle: body.heroTitle,
          heroDescription: body.heroDescription,
          aboutHeadline: body.aboutHeadline,
          aboutDescription: body.aboutDescription,
        },
      });
    }

    await prisma.activityLog.create({
      data: {
        userId: (session.user as any).id,
        action: "UPDATE_SETTINGS",
        details: "Updated global settings parameters.",
      },
    });

    // Settings feed the root layout (contact info, hero copy, SEO
    // metadata) via a single request-time fetch — bust that cache so the
    // change appears on the live site immediately instead of waiting out
    // the revalidate window.
    revalidatePath("/", "layout");

    return NextResponse.json({ setting });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
