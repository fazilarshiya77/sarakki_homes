import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, CAN } from "@/lib/authz";
import bcrypt from "bcryptjs";

// Full CRUD for staff accounts (the User model) — distinct from
// /api/admin/users, which is a pre-existing, unrelated minimal endpoint
// used only for CRM agent-assignment dropdowns. This one backs the
// dedicated /admin/staff management page.
const VALID_ROLES = ["ADMIN", "MANAGER", "SALES_EXECUTIVE", "CONTENT_MANAGER"];

export async function GET() {
  const auth = await requireRole(CAN.MANAGE_STAFF);
  if (!auth.ok) return auth.response;

  try {
    const staff = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ staff });
  } catch (error: unknown) {
    // Generic to the client, detailed in the server log — a raw error
    // here could leak schema or connection details.
    console.error("[api/admin/staff]", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireRole(CAN.MANAGE_STAFF);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    if (role && !VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "A staff member with this email already exists" }, { status: 409 });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const staff = await prisma.user.create({
      data: { name, email, passwordHash, role: role || "SALES_EXECUTIVE" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    await prisma.activityLog.create({
      data: {
        userId: auth.user.id,
        action: "CREATE_STAFF",
        details: `Added staff member: ${name} (${role || "SALES_EXECUTIVE"})`,
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
