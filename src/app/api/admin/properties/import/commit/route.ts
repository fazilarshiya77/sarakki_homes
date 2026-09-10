import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireRole, CAN } from "@/lib/authz";
import { commitRowsChunk } from "@/lib/propertyImport/commitRows";
import type { ValidRow } from "@/lib/propertyImport/validateRows";

const MAX_CHUNK = 50; // keeps each request/transaction small enough to never risk a timeout

// Commits ONE chunk of already-validated rows (see the preview route) —
// the browser calls this repeatedly, chunk by chunk, to import a large
// file without either one giant request or hundreds of tiny ones, and to
// show real "45 / 250" progress in between calls.
export async function POST(req: Request) {
  const auth = await requireRole(CAN.MANAGE_CONTENT);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const rows: ValidRow[] = Array.isArray(body.rows) ? body.rows : [];

    if (rows.length === 0) {
      return NextResponse.json({ error: "No rows to import." }, { status: 400 });
    }
    if (rows.length > MAX_CHUNK) {
      return NextResponse.json({ error: `Send at most ${MAX_CHUNK} rows per request.` }, { status: 400 });
    }

    const results = await commitRowsChunk(rows, auth.user.id);

    // Only bust the public-site cache if this chunk actually changed
    // something — an all-failed chunk (e.g. a stale category deleted
    // between preview and commit) has nothing new to show.
    if (results.some((r) => r.ok)) {
      revalidatePath("/");
      revalidatePath("/properties");
      revalidatePath("/properties/bank-auctions");
      for (const r of results) {
        if (r.ok && r.slug) revalidatePath(`/properties/${r.slug}`);
      }
    }

    return NextResponse.json({ results });
  } catch (error: unknown) {
    console.error("[api/admin/properties/import/commit] failed:", error);
    return NextResponse.json({ error: "Something went wrong saving these rows. Please try again." }, { status: 500 });
  }
}
