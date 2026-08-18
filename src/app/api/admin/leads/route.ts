import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, CAN, type Role } from "@/lib/authz";
import { CLOSED_STAGES } from "@/lib/crm";

export async function GET() {
  const auth = await requireRole(CAN.MANAGE_CRM);
  if (!auth.ok) return auth.response;

  // Revenue columns are stripped for roles without VIEW_REVENUE rather
  // than the whole list being refused — a SALES_EXECUTIVE still needs
  // the pipeline, just not the commission figures on it.
  const canSeeRevenue = (CAN.VIEW_REVENUE as Role[]).includes(auth.user.role);

  try {
    const leads = await prisma.lead.findMany({
      include: {
        agent: { select: { id: true, name: true } },
        tasks: { select: { id: true, status: true } },
        property: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const payload = canSeeRevenue
      ? leads
      : leads.map(({ dealValueLakh, commissionPct, commissionLakh, ...rest }) => rest);

    return NextResponse.json({ leads: payload, canViewRevenue: canSeeRevenue });
  } catch (error: unknown) {
    // Log the real fault server-side; return a generic message so a
    // raw Prisma/database error can't disclose schema details to a client.
    console.error("[api/admin/leads]", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireRole(CAN.MANAGE_CRM);
  if (!auth.ok) return auth.response;
  const user = auth.user;

  try {
    const body = await req.json();

    if (!body.name || !body.phone) {
      return NextResponse.json(
        { error: "Name and phone are required." },
        { status: 400 }
      );
    }

    const canSeeRevenue = (CAN.VIEW_REVENUE as Role[]).includes(user.role);
    const wantsRevenue =
      body.dealValueLakh !== undefined ||
      body.commissionPct !== undefined ||
      body.commissionLakh !== undefined;
    if (wantsRevenue && !canSeeRevenue) {
      return NextResponse.json(
        { error: "Your role does not have permission to set deal or commission values." },
        { status: 403 }
      );
    }

    const num = (raw: unknown, label: string, max?: number): number | null => {
      if (raw === null || raw === undefined || raw === "") return null;
      const n = Number(raw);
      if (!Number.isFinite(n) || n < 0 || (max !== undefined && n > max)) {
        throw new Error(
          max !== undefined
            ? `${label} must be a number between 0 and ${max}.`
            : `${label} must be a non-negative number.`
        );
      }
      return n;
    };

    const stage = body.stage || "NEW";

    const lead = await prisma.lead.create({
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email || null,
        location: body.location || null,
        budgetMinLakh: body.budgetMinLakh ? Number(body.budgetMinLakh) : null,
        budgetMaxLakh: body.budgetMaxLakh ? Number(body.budgetMaxLakh) : null,
        propertyType: body.propertyType || null,
        purpose: body.purpose || "Buy",
        source: body.source || "Website",
        bedrooms: body.bedrooms ? Number(body.bedrooms) : null,
        bathrooms: body.bathrooms ? Number(body.bathrooms) : null,
        areaRequired: body.areaRequired || null,
        possession: body.possession || null,
        priority: body.priority || "MEDIUM",
        stage,
        agentId: body.agentId || null,
        propertyId: body.propertyId || null,
        dealValueLakh: canSeeRevenue ? num(body.dealValueLakh, "Deal value") : null,
        commissionPct: canSeeRevenue ? num(body.commissionPct, "Commission percentage", 100) : null,
        commissionLakh: canSeeRevenue ? num(body.commissionLakh, "Commission amount") : null,
        // Same derivation rule as the PUT route: a lead created directly
        // in a closed stage is stamped now, everything else stays null.
        closedAt: (CLOSED_STAGES as readonly string[]).includes(stage) ? new Date() : null,
        timeline: {
          create: {
            type: "CREATED",
            title: "Lead created",
            author: user.name || user.email || "Staff",
          },
        },
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "CREATE_LEAD",
        details: `Created lead "${lead.name}" (${lead.id})`,
      },
    });

    return NextResponse.json({ lead });
  } catch (error: unknown) {
    // Log the real fault server-side; return a generic message so a
    // raw Prisma/database error can't disclose schema details to a client.
    console.error("[api/admin/leads]", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
