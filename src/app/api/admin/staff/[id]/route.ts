import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { requireRole, CAN } from "@/lib/authz";
import bcrypt from "bcryptjs";

const VALID_ROLES = ["ADMIN", "MANAGER", "SALES_EXECUTIVE", "CONTENT_MANAGER"];

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(CAN.MANAGE_STAFF);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, email, password, role } = body;

    if (role && !VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (password && password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    // Demoting the last remaining ADMIN would lock everyone out of staff
    // management — block it rather than letting the UI create an
    // unrecoverable state.
    if (role && role !== "ADMIN") {
      const target = await prisma.user.findUnique({ where: { id } });
      if (target?.role === "ADMIN") {
        const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
        if (adminCount <= 1) {
          return NextResponse.json(
            { error: "Cannot change the role of the last remaining admin" },
            { status: 400 }
          );
        }
      }
    }

    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== id) {
        return NextResponse.json({ error: "Another staff member already uses this email" }, { status: 409 });
      }
    }

    const data: Record<string, string> = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (role) data.role = role;
    if (password) data.passwordHash = bcrypt.hashSync(password, 10);

    const staff = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    await prisma.activityLog.create({
      data: {
        userId: auth.user.id,
        action: "UPDATE_STAFF",
        details: `Updated staff member: ${staff.name}`,
      },
    });

    return NextResponse.json({ staff });
  } catch (error: unknown) {
    // Generic to the client, detailed in the server log — a raw error
    // here could leak schema or connection details.
    console.error("[api/admin/staff]", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(CAN.MANAGE_STAFF);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const currentUserId = auth.user.id;

    if (id === currentUserId) {
      return NextResponse.json({ error: "You cannot delete your own account while signed in" }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return NextResponse.json({ error: "Staff member not found" }, { status: 404 });

    if (target.role === "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
        return NextResponse.json({ error: "Cannot delete the last remaining admin" }, { status: 400 });
      }
    }

    await prisma.user.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        userId: currentUserId,
        action: "DELETE_STAFF",
        details: `Removed staff member: ${target.name}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    // Other tables (ActivityLog, Lead, Enquiry) hold a required foreign
    // key back to this user — the DB blocks the delete rather than
    // silently orphaning that history. Surface it as a clear message
    // instead of a generic 500.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P2003" || error.code === "P2014")
    ) {
      return NextResponse.json(
        {
          error:
            "This staff member has linked activity, leads, or enquiries and can't be deleted yet. Reassign their leads/enquiries to another staff member first.",
        },
        { status: 409 }
      );
    }
    // Anything else is unexpected: log the detail, tell the client nothing
    // that could disclose schema or connection internals.
    console.error("[api/admin/staff] delete failed:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
