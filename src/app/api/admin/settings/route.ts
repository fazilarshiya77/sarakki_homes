import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, CAN } from "@/lib/authz";

const GENERIC_ERROR = "Something went wrong. Please try again.";

export async function GET() {
  const auth = await requireRole(CAN.MANAGE_SETTINGS);
  if (!auth.ok) return auth.response;

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
  } catch (error: unknown) {
    console.error("[api/admin/settings] GET failed:", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const auth = await requireRole(CAN.MANAGE_SETTINGS);
  if (!auth.ok) return auth.response;

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
        userId: auth.user.id,
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
  } catch (error: unknown) {
    console.error("[api/admin/settings] PUT failed:", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}
