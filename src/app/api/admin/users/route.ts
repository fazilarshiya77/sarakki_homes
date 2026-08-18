import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, CAN } from "@/lib/authz";

const GENERIC_ERROR = "Something went wrong. Please try again.";

// Minimal, read-only staff list for assignment dropdowns (enquiries,
// leads, tasks) — full staff CRUD (create/edit/delete/roles) lives at
// /admin/staff + /api/admin/staff, which is ADMIN-only. This route stays
// open to CAN.ANY_STAFF since any signed-in staff member needs to see
// who they can assign work to. The `select` deliberately never exposes
// passwordHash.
export async function GET() {
  const auth = await requireRole(CAN.ANY_STAFF);
  if (!auth.ok) return auth.response;

  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ users });
  } catch (error: unknown) {
    console.error("[api/admin/users] GET failed:", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}
