import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
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
          whatsappNo: "+91 9663676464",
        },
      });
    }
    // SECURITY: smtpPassword is a credential, not display copy — it must
    // never round-trip to the browser in plaintext (it was previously
    // pre-filling the settings form's password input, readable via
    // devtools by anyone with MANAGE_SETTINGS, not just ADMIN). The PUT
    // handler below treats a blank submission as "leave unchanged", so
    // omitting the real value here doesn't risk it being wiped on save.
    const { smtpPassword, ...safeSetting } = setting;
    return NextResponse.json({ setting: { ...safeSetting, smtpPasswordSet: Boolean(smtpPassword) } });
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
          smtpPort: body.smtpPort !== undefined ? parseInt(body.smtpPort) : existing.smtpPort,
          smtpUser: body.smtpUser,
          // A blank submission means "leave the stored password
          // unchanged" — the GET handler no longer sends the real value
          // back to the browser, so an untouched field arrives here
          // empty, not as the actual current password.
          smtpPassword: body.smtpPassword ? body.smtpPassword : existing.smtpPassword,
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
    revalidateTag("settings", { expire: 0 });

    return NextResponse.json({ setting });
  } catch (error: unknown) {
    console.error("[api/admin/settings] PUT failed:", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}
