import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, CAN } from "@/lib/authz";

const GENERIC_ERROR = "Something went wrong. Please try again.";

// Minimal staff list for agent-assignment dropdowns (CRM leads/tasks).
// The existing /admin/users management page has its own (unrelated,
// pre-existing) data source — this route is scoped to the CRM only.
// Read-only and needed by every CRM role, hence CAN.ANY_STAFF; note the
// `select` deliberately never exposes passwordHash.
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
