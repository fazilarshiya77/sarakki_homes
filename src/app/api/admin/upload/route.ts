import { NextResponse } from "next/server";
import { requireRole, CAN } from "@/lib/authz";

/**
 * Image upload for the property wizard, backed by Supabase Storage.
 *
 * Why Supabase Storage and not the filesystem: Vercel's runtime
 * filesystem is read-only and ephemeral, so writing into /public at
 * runtime silently fails in production even though it appears to work
 * locally. Supabase is already this project's backing service, so
 * storage there adds no new vendor.
 *
 * Uses the Storage REST API over plain fetch rather than pulling in
 * @supabase/supabase-js — a single multipart PUT doesn't justify the
 * dependency, and the client library would ship a second auth stack
 * alongside NextAuth.
 */

const BUCKET = "property-images";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
// Explicit allow-list, not a `image/*` prefix check: SVG is an image
// MIME type but is also an XSS vector (it can carry inline <script>),
// and these files are served from our own origin.
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function POST(req: Request) {
  const auth = await requireRole(CAN.MANAGE_CONTENT);
  if (!auth.ok) return auth.response;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    // Actionable, non-secret guidance — this is an admin-only route and
    // the message names configuration, never credentials.
    return NextResponse.json(
      {
        error:
          "File uploads are not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel, and create a public Storage bucket named 'property-images' in Supabase. You can paste an image URL instead in the meantime.",
      },
      { status: 501 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file was received." }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, or AVIF images are allowed." },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `Image is too large (max ${MAX_BYTES / 1024 / 1024} MB).` },
        { status: 400 }
      );
    }

    // Never reuse the client-supplied filename in the storage path — it
    // is attacker-controlled and can carry traversal sequences or
    // collide with an existing object. Derive the extension from the
    // validated MIME type instead.
    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const objectPath = `${crypto.randomUUID()}.${ext}`;

    const uploadRes = await fetch(
      `${supabaseUrl}/storage/v1/object/${BUCKET}/${objectPath}`,
      {
        method: "POST",
        headers: {
          // Both headers are required — Supabase's newer `sb_secret_...`
          // project API keys (as opposed to legacy service_role JWTs) are
          // rejected with 403 "Invalid Compact JWS" if `apikey` is
          // missing, even though `Authorization: Bearer` alone used to be
          // enough for JWT-style keys. Sending both is correct/harmless
          // for either key format.
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
          "Content-Type": file.type,
          "cache-control": "public, max-age=31536000, immutable",
        },
        body: await file.arrayBuffer(),
      }
    );

    if (!uploadRes.ok) {
      const detail = await uploadRes.text();
      console.error("[upload] Supabase Storage rejected the upload:", uploadRes.status, detail);
      return NextResponse.json(
        {
          error:
            uploadRes.status === 404
              ? `Storage bucket '${BUCKET}' does not exist. Create it in Supabase → Storage and mark it public.`
              : "Upload failed. Please try again.",
        },
        { status: 502 }
      );
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${objectPath}`;
    return NextResponse.json({ url: publicUrl });
  } catch (error: unknown) {
    console.error("[upload] Unexpected failure:", error);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
