import { NextResponse } from "next/server";
import { requireRole, CAN } from "@/lib/authz";

/**
 * Brochure document upload, backed by Supabase Storage — same
 * architecture and same reasoning as /api/admin/upload (property
 * images): Vercel's runtime filesystem is read-only/ephemeral,
 * Supabase Storage is already this project's backing service, and the
 * Storage REST API over plain fetch avoids a second client SDK for one
 * multipart PUT.
 *
 * Separate bucket ("brochures") and separate route from the image
 * uploader rather than widening its allow-list — different file types,
 * different size ceiling (a real brochure can run several MB), and
 * keeping the two buckets/routes apart means a public-bucket
 * misconfiguration on one never silently exposes the other.
 *
 * Not PDF-only: the CRM's "Brochure File" field accepts any common
 * office-document format an admin might actually have a brochure in
 * (PDF, Word, PowerPoint, Excel), plus JPEG/PNG for a brochure that's
 * simply a scanned/designed image rather than a document — deliberately
 * still an explicit allow-list, not a wildcard MIME match, since these
 * files are served publicly from our own origin and an unrestricted
 * upload would be a real risk (arbitrary/executable content hosted
 * under our domain).
 */

const BUCKET = "brochures";
const MAX_BYTES = 20 * 1024 * 1024; // 20 MB — a real multi-page brochure/deck

// Maps each allowed MIME type to the file extension its Storage object
// is saved with — the client-supplied filename is never reused (see
// below), so the extension has to come from somewhere trustworthy.
const ALLOWED_EXTENSIONS: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "image/jpeg": "jpg",
  "image/png": "png",
};

export async function POST(req: Request) {
  const auth = await requireRole(CAN.MANAGE_CONTENT);
  if (!auth.ok) return auth.response;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      {
        error:
          "File uploads are not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel, and create a public Storage bucket named 'brochures' in Supabase. You can paste a file URL instead in the meantime.",
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
    const ext = ALLOWED_EXTENSIONS[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: "Only PDF, Word, PowerPoint, Excel, JPEG, or PNG files are allowed for brochures." },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `Brochure file is too large (max ${MAX_BYTES / 1024 / 1024} MB).` },
        { status: 400 }
      );
    }

    // Never reuse the client-supplied filename — attacker-controlled and
    // can collide with an existing object. A fresh UUID + the extension
    // derived from the validated MIME type (not the client's filename)
    // instead.
    const objectPath = `${crypto.randomUUID()}.${ext}`;

    const uploadRes = await fetch(
      `${supabaseUrl}/storage/v1/object/${BUCKET}/${objectPath}`,
      {
        method: "POST",
        headers: {
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
      console.error("[upload-brochure] Supabase Storage rejected the upload:", uploadRes.status, detail);
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
    console.error("[upload-brochure] Unexpected failure:", error);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
