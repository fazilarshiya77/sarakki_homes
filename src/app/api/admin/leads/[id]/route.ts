import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, CAN, type Role } from "@/lib/authz";
import { CLOSED_STAGES, REVENUE_FIELDS, formatMoneyLakh } from "@/lib/crm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(CAN.MANAGE_CRM);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        agent: { select: { id: true, name: true } },
        property: { select: { id: true, title: true, propertyId: true, priceValueLakh: true } },
        notes: { orderBy: [{ pinned: "desc" }, { createdAt: "desc" }] },
        tasks: { orderBy: { createdAt: "desc" } },
        timeline: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (error: unknown) {
    // Log the real fault server-side; return a generic message so a
    // raw Prisma/database error can't disclose schema details to a client.
    console.error("[api/admin/leads]", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

/** Parse a money/percentage input into a Float? column value.
 *  Empty string, null and undefined all mean "clear the field". */
function parseOptionalNumber(
  raw: unknown,
  label: string,
  opts: { max?: number } = {}
): { ok: true; value: number | null } | { ok: false; error: string } {
  if (raw === null || raw === "" || raw === undefined) return { ok: true, value: null };
  const n = Number(raw);
  if (!Number.isFinite(n)) return { ok: false, error: `${label} must be a number.` };
  if (n < 0) return { ok: false, error: `${label} cannot be negative.` };
  if (opts.max !== undefined && n > opts.max) {
    return { ok: false, error: `${label} cannot exceed ${opts.max}.` };
  }
  return { ok: true, value: n };
}

// Every field is optional here — this route serves both small inline edits
// (stage drag on the pipeline board, favorite toggle) and the full detail
// form, so it only touches whatever the caller actually sent.
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Ordinary lead editing is open to the whole sales workflow...
  const auth = await requireRole(CAN.MANAGE_CRM);
  if (!auth.ok) return auth.response;
  const session = auth.user;

  const { id } = await params;

  try {
    const body = await req.json();

    // ...but the revenue fields are ADMIN/MANAGER only. A
    // SALES_EXECUTIVE may move their own lead to WON; they may not set
    // what the house earned on it. Checked before anything is written.
    const touchesRevenue = REVENUE_FIELDS.some((f) => body[f] !== undefined);
    if (touchesRevenue && !(CAN.VIEW_REVENUE as Role[]).includes(session.role)) {
      return NextResponse.json(
        { error: "Your role does not have permission to edit deal or commission values." },
        { status: 403 }
      );
    }

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    const fields = [
      "name",
      "phone",
      "email",
      "location",
      "propertyType",
      "purpose",
      "source",
      "areaRequired",
      "possession",
      "priority",
      "wonDetails",
      "lostReason",
      "agentId",
    ] as const;
    for (const f of fields) {
      if (body[f] !== undefined) data[f] = body[f] || null;
    }
    if (body.budgetMinLakh !== undefined) {
      data.budgetMinLakh = body.budgetMinLakh === null || body.budgetMinLakh === "" ? null : Number(body.budgetMinLakh);
    }
    if (body.budgetMaxLakh !== undefined) {
      data.budgetMaxLakh = body.budgetMaxLakh === null || body.budgetMaxLakh === "" ? null : Number(body.budgetMaxLakh);
    }
    if (body.bedrooms !== undefined) {
      data.bedrooms = body.bedrooms === null || body.bedrooms === "" ? null : Number(body.bedrooms);
    }
    if (body.bathrooms !== undefined) {
      data.bathrooms = body.bathrooms === null || body.bathrooms === "" ? null : Number(body.bathrooms);
    }
    if (body.favorite !== undefined) data.favorite = !!body.favorite;
    if (body.markContacted) data.lastContact = new Date();

    const actor = session.name || session.email || "Staff";
    const timelineEntries: { type: string; title: string; description?: string; author: string }[] = [];

    // --- Deal / revenue fields ----------------------------------------
    const numericSpecs: {
      key: "dealValueLakh" | "commissionPct" | "commissionLakh";
      label: string;
      max?: number;
    }[] = [
      { key: "dealValueLakh", label: "Deal value" },
      { key: "commissionPct", label: "Commission percentage", max: 100 },
      { key: "commissionLakh", label: "Commission amount" },
    ];
    const revenueChanges: string[] = [];

    for (const spec of numericSpecs) {
      if (body[spec.key] === undefined) continue;
      const parsed = parseOptionalNumber(body[spec.key], spec.label, { max: spec.max });
      if (!parsed.ok) {
        return NextResponse.json({ error: parsed.error }, { status: 400 });
      }
      const before = existing[spec.key] ?? null;
      if (parsed.value !== before) {
        data[spec.key] = parsed.value;
        const fmt = (v: number | null) =>
          v === null ? "cleared" : spec.key === "commissionPct" ? `${v}%` : formatMoneyLakh(v);
        revenueChanges.push(`${spec.label}: ${fmt(before)} → ${fmt(parsed.value)}`);
      }
    }

    if (body.propertyId !== undefined) {
      const nextPropertyId = body.propertyId || null;
      if (nextPropertyId) {
        const property = await prisma.property.findUnique({
          where: { id: nextPropertyId },
          select: { id: true, title: true },
        });
        if (!property) {
          return NextResponse.json({ error: "Linked property not found." }, { status: 400 });
        }
        if (nextPropertyId !== existing.propertyId) {
          revenueChanges.push(`Linked property: ${property.title}`);
        }
      } else if (existing.propertyId) {
        revenueChanges.push("Linked property: cleared");
      }
      data.propertyId = nextPropertyId;
    }

    if (revenueChanges.length) {
      timelineEntries.push({
        type: "DEAL_UPDATE",
        title: "Deal details updated",
        description: revenueChanges.join(" · "),
        author: actor,
      });
    }

    if (body.stage !== undefined && body.stage !== existing.stage) {
      data.stage = body.stage;
      timelineEntries.push({
        type: "STAGE_CHANGE",
        title: `Stage moved to ${String(body.stage).replace(/_/g, " ")}`,
        author: actor,
      });

      // closedAt is derived, never user-entered: stamped when the lead
      // first reaches WON/LOST and cleared if it is reopened, so
      // revenue-by-period reporting can't be skewed by an unrelated edit
      // bumping updatedAt.
      const wasClosed = (CLOSED_STAGES as readonly string[]).includes(existing.stage);
      const isClosed = (CLOSED_STAGES as readonly string[]).includes(body.stage);
      if (isClosed && !wasClosed) {
        data.closedAt = new Date();
      } else if (!isClosed && wasClosed) {
        data.closedAt = null;
      }
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...data,
        ...(timelineEntries.length ? { timeline: { create: timelineEntries } } : {}),
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.id,
        action: "UPDATE_LEAD",
        details: `Updated lead "${lead.name}" (${id})`,
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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(CAN.MANAGE_CRM);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {
    const lead = await prisma.lead.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        userId: auth.user.id,
        action: "DELETE_LEAD",
        details: `Deleted lead "${lead.name}" (${id})`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    // Log the real fault server-side; return a generic message so a
    // raw Prisma/database error can't disclose schema details to a client.
    console.error("[api/admin/leads]", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
