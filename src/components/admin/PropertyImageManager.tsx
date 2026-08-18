"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Upload, X, Link2, GripVertical, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Multi-image manager for the property wizard.
 *
 * Replaces the previous single "Primary Image URL" text field. The
 * database and the POST/PUT property routes already accepted an array
 * of images (PropertyImage[] + createMany) — only the wizard was
 * limited to one, so this closes that gap rather than adding new
 * backend capability.
 *
 * The first image in the list is the cover shot: the public site reads
 * `images[0]` as the card/hero image (see toPublicProperty in
 * src/lib/properties.ts), and the API persists array order into
 * PropertyImage.order.
 */
export interface ManagedImage {
  url: string;
}

export function PropertyImageManager({
  images,
  onChange,
}: {
  images: ManagedImage[];
  onChange: (next: ManagedImage[]) => void;
}) {
  const [urlDraft, setUrlDraft] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = async (files: FileList | File[]) => {
    setError("");
    const list = Array.from(files);
    if (list.length === 0) return;

    setUploading(true);
    const uploaded: ManagedImage[] = [];

    for (const file of list) {
      try {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body });
        const data = await res.json();

        if (!res.ok) {
          // Surface the server's actual guidance (unconfigured storage,
          // file too large, wrong type) rather than a generic failure —
          // each has a different fix for the admin.
          setError(data.error || "Upload failed.");
          break;
        }
        uploaded.push({ url: data.url });
      } catch {
        setError("Upload failed. Check your connection and try again.");
        break;
      }
    }

    if (uploaded.length > 0) onChange([...images, ...uploaded]);
    setUploading(false);
  };

  const addUrl = () => {
    const url = urlDraft.trim();
    if (!url) return;
    if (images.some((i) => i.url === url)) {
      setError("That image has already been added.");
      return;
    }
    setError("");
    onChange([...images, { url }]);
    setUrlDraft("");
  };

  const removeAt = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  /** Reorder by dragging one thumbnail onto another — the first slot is
   *  the cover image, so ordering is meaningful, not cosmetic. */
  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  return (
    <div className="md:col-span-2 space-y-4">
      {/* Drop zone.
          Every one of these handlers calls preventDefault, including
          onDragOver. Without it the browser's default drop behaviour
          takes over and NAVIGATES THE TAB TO THE DROPPED FILE — which
          is exactly the "image opens in another tab" bug this replaces.
          preventDefault on dragOver is what marks the element as a
          valid drop target; omitting it there is the usual cause. */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border border-dashed px-6 py-10 text-center transition-colors duration-200",
          isDragging
            ? "border-crm-gold bg-crm-gold/5"
            : "border-crm-border bg-crm-bg/60 hover:border-crm-gold/50"
        )}
      >
        {uploading ? (
          <Loader2 size={20} className="animate-spin text-crm-gold" />
        ) : (
          <Upload size={20} className="text-crm-text-muted" />
        )}
        <span className="text-xs font-semibold text-crm-text">
          {uploading ? "Uploading…" : "Drag images here, or click to choose files"}
        </span>
        <span className="text-[10px] text-crm-text-muted">
          JPEG, PNG, WebP or AVIF · up to 5 MB each
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) uploadFiles(e.target.files);
            // Reset so re-picking the same file still fires onChange.
            e.target.value = "";
          }}
        />
      </div>

      {/* URL fallback — still supported, and the only path that works
          until Supabase Storage is configured. */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Link2
            size={13}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-crm-text-muted"
          />
          <input
            type="text"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addUrl();
              }
            }}
            placeholder="…or paste an image URL"
            className="crm-input pl-9!"
          />
        </div>
        <button type="button" onClick={addUrl} className="crm-btn-secondary shrink-0">
          Add URL
        </button>
      </div>

      {error && (
        <p className="flex items-start gap-2 rounded-sm border border-red-500/20 bg-red-500/5 px-3 py-2 text-[11px] leading-relaxed text-red-400">
          <AlertCircle size={13} className="mt-px shrink-0" />
          {error}
        </p>
      )}

      {images.length > 0 && (
        <div>
          <p className="crm-label mb-2">
            {images.length} image{images.length === 1 ? "" : "s"} · drag to reorder · first is the
            cover
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((img, i) => (
              <div
                key={`${img.url}-${i}`}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragIndex !== null) reorder(dragIndex, i);
                  setDragIndex(null);
                }}
                className={cn(
                  "group relative aspect-[4/3] overflow-hidden rounded-sm border bg-crm-bg",
                  i === 0 ? "border-crm-gold" : "border-crm-border/40"
                )}
              >
                <Image
                  src={img.url}
                  alt={`Property image ${i + 1}`}
                  fill
                  sizes="200px"
                  className="object-cover"
                  // Admin-pasted URLs can point anywhere, including hosts
                  // that fail the optimizer; showing the raw image is a
                  // better preview than a broken tile.
                  unoptimized
                />
                {i === 0 && (
                  <span className="absolute left-1.5 top-1.5 rounded-sm bg-crm-gold px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-crm-espresso">
                    Cover
                  </span>
                )}
                <span className="absolute bottom-1.5 left-1.5 rounded-sm bg-black/60 p-0.5 text-white/70 opacity-0 transition-opacity group-hover:opacity-100">
                  <GripVertical size={11} />
                </span>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  aria-label={`Remove image ${i + 1}`}
                  className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-sm bg-black/60 text-white opacity-0 transition-all hover:bg-red-500 group-hover:opacity-100"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
