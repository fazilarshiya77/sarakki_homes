"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  FileText,
  Loader2,
  Plus,
  Trash2,
  Eye,
  ChevronUp,
  ChevronDown,
  Upload,
  X,
} from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { cn } from "@/lib/utils";

interface Brochure {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  thumbnailUrl: string | null;
  order: number;
  published: boolean;
}

interface CategoryLite {
  id: string;
  title: string;
}

const emptyForm = { title: "", description: "", fileUrl: "", thumbnailUrl: "", published: true };

export default function CategoryBrochuresPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: categoryId } = use(params);

  const [category, setCategory] = useState<CategoryLite | null>(null);
  const [brochures, setBrochures] = useState<Brochure[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Brochure | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [catRes, broRes] = await Promise.all([
        fetch("/api/admin/categories"),
        fetch(`/api/admin/brochures?categoryId=${categoryId}`),
      ]);
      const catData = await catRes.json();
      const broData = await broRes.json();
      const found = (catData.categories || []).find((c: CategoryLite) => c.id === categoryId);
      setCategory(found || null);
      setBrochures(broData.brochures || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Standard fetch-on-mount — setState happens inside fetchAll after
    // its own await, not synchronously in this effect body.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (b: Brochure) => {
    setEditingId(b.id);
    setForm({
      title: b.title,
      description: b.description || "",
      fileUrl: b.fileUrl,
      thumbnailUrl: b.thumbnailUrl || "",
      published: b.published,
    });
    setFormError("");
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
  };

  const uploadFile = async (file: File, kind: "brochure" | "thumbnail") => {
    const setUploading = kind === "brochure" ? setUploadingFile : setUploadingThumb;
    const endpoint = kind === "brochure" ? "/api/admin/upload-brochure" : "/api/admin/upload";
    setUploading(true);
    setFormError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(endpoint, { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Upload failed.");
        return;
      }
      setForm((f) => (kind === "brochure" ? { ...f, fileUrl: data.url } : { ...f, thumbnailUrl: data.url }));
    } catch {
      setFormError("Upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setFormError("Brochure title is required.");
      return;
    }
    if (!form.fileUrl) {
      setFormError("Please upload the brochure file.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const url = editingId ? `/api/admin/brochures/${editingId}` : "/api/admin/brochures";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || null,
          fileUrl: form.fileUrl,
          thumbnailUrl: form.thumbnailUrl || null,
          published: form.published,
          ...(editingId ? {} : { categoryId }),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        closeForm();
        fetchAll();
      } else {
        setFormError(data.error || "Couldn't save this brochure. Please try again.");
      }
    } catch {
      setFormError("Couldn't save this brochure. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (b: Brochure) => {
    setBrochures((prev) => prev.map((x) => (x.id === b.id ? { ...x, published: !x.published } : x)));
    try {
      await fetch(`/api/admin/brochures/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !b.published }),
      });
    } catch (err) {
      console.error(err);
      fetchAll();
    }
  };

  // Swaps this brochure's `order` with its neighbor's — simplest possible
  // reorder UI for a non-technical admin (two buttons, no drag-and-drop
  // to get wrong on a touchscreen), persisted immediately per click.
  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= brochures.length) return;
    const a = brochures[index];
    const b = brochures[target];
    const next = [...brochures];
    [next[index], next[target]] = [next[target], next[index]];
    setBrochures(next);
    try {
      await Promise.all([
        fetch(`/api/admin/brochures/${a.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: b.order }),
        }),
        fetch(`/api/admin/brochures/${b.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: a.order }),
        }),
      ]);
      fetchAll();
    } catch (err) {
      console.error(err);
      fetchAll();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/admin/brochures/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setDeleteTarget(null);
        fetchAll();
      } else {
        setDeleteError(data.error || "Couldn't delete this brochure. Please try again.");
      }
    } catch {
      setDeleteError("Couldn't delete this brochure. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/admin/categories"
        className="inline-flex items-center gap-1.5 text-sm text-crm-text-secondary hover:text-crm-text transition-colors"
      >
        <ArrowLeft size={13} /> Back to Categories
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="crm-page-title flex items-center gap-2.5">
            <FileText size={22} className="text-crm-gold" />
            Brochures — {category?.title || "…"}
          </h1>
          <p className="crm-body-text mt-0.5">
            Downloadable brochures shown on the public website for this category. Optional — a category
            with no brochures simply shows no brochure section on the site.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-sm bg-gradient-to-r from-crm-gold to-crm-gold-bright px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black transition-all duration-300 hover:brightness-110"
        >
          <Plus size={14} /> Add Brochure
        </button>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-crm-text-secondary text-sm font-semibold bg-crm-card/25 border border-crm-border/20 rounded-sm">
          <Loader2 size={24} className="animate-spin text-crm-gold-bright" />
          <span>Loading brochures...</span>
        </div>
      ) : brochures.length === 0 ? (
        <div className="py-24 text-center text-sm text-crm-text-secondary bg-crm-card/25 border border-dashed border-crm-border/20 rounded-sm">
          No brochures yet for this category. Click &ldquo;Add Brochure&rdquo; to upload one.
        </div>
      ) : (
        <div className="space-y-2.5">
          {brochures.map((b, i) => (
            <div
              key={b.id}
              className="flex items-center gap-4 rounded-sm border border-crm-border/20 bg-crm-card/25 p-4"
            >
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-sm border border-crm-border/40 bg-crm-bg">
                {b.thumbnailUrl ? (
                  <Image src={b.thumbnailUrl} alt="" fill sizes="80px" className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <FileText size={18} className="text-crm-gold" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-crm-text truncate">{b.title}</span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase shrink-0",
                      b.published
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-crm-border text-crm-text-muted"
                    )}
                  >
                    {b.published ? "Published" : "Unpublished"}
                  </span>
                </div>
                {b.description && (
                  <p className="mt-1 text-xs text-crm-text-secondary line-clamp-1">{b.description}</p>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  title="Move up"
                  className="flex h-7 w-7 items-center justify-center rounded-sm border border-crm-border text-crm-text-muted hover:text-crm-text disabled:opacity-30 transition-colors"
                >
                  <ChevronUp size={13} />
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === brochures.length - 1}
                  title="Move down"
                  className="flex h-7 w-7 items-center justify-center rounded-sm border border-crm-border text-crm-text-muted hover:text-crm-text disabled:opacity-30 transition-colors"
                >
                  <ChevronDown size={13} />
                </button>
                <a
                  href={b.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Preview"
                  className="flex h-7 w-7 items-center justify-center rounded-sm border border-crm-border text-crm-text-muted hover:text-crm-text transition-colors"
                >
                  <Eye size={13} />
                </a>
                <button
                  onClick={() => togglePublished(b)}
                  className="rounded-sm border border-crm-border px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-crm-text-secondary hover:text-crm-text transition-colors"
                >
                  {b.published ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={() => openEdit(b)}
                  className="rounded-sm border border-crm-border px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-crm-text-secondary hover:text-crm-text transition-colors"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteError("");
                    setDeleteTarget(b);
                  }}
                  title="Delete brochure"
                  aria-label={`Delete ${b.title}`}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-crm-border text-crm-text-muted hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit panel — a slide-down form rather than a modal, same
          lightweight footprint as the inline "Add Category" form this
          page is one click away from. */}
      {formOpen && (
        <div className="rounded-sm border border-crm-border/20 bg-crm-card/25 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="crm-section-heading uppercase tracking-wider">
              {editingId ? "Edit Brochure" : "Add Brochure"}
            </span>
            <button
              type="button"
              onClick={closeForm}
              className="flex h-7 w-7 items-center justify-center rounded-sm border border-crm-border text-crm-text-muted hover:text-crm-text transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="crm-label">Brochure Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Bank Auction Property Guide"
                className="crm-input"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="crm-label">Short Description (optional)</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="What's inside this brochure..."
                className="crm-textarea resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="crm-label">Brochure File *</label>
              <label className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-sm border border-dashed border-crm-border bg-crm-bg/40 text-center hover:border-crm-gold-bright/40 transition-colors">
                {uploadingFile ? (
                  <Loader2 size={18} className="animate-spin text-crm-gold-bright" />
                ) : form.fileUrl ? (
                  <>
                    <FileText size={18} className="text-crm-gold" />
                    <span className="text-xs text-crm-text-secondary px-2 truncate max-w-full">File uploaded</span>
                  </>
                ) : (
                  <>
                    <Upload size={18} className="text-crm-text-muted" />
                    <span className="text-xs text-crm-text-muted px-2">Click to upload — PDF, Word, PowerPoint, Excel, JPEG, or PNG</span>
                  </>
                )}
                <input
                  type="file"
                  accept="application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadFile(file, "brochure");
                  }}
                />
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="crm-label">Cover / Thumbnail Image (optional)</label>
              <label className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-sm border border-dashed border-crm-border bg-crm-bg/40 text-center hover:border-crm-gold-bright/40 transition-colors">
                {uploadingThumb ? (
                  <Loader2 size={18} className="animate-spin text-crm-gold-bright" />
                ) : form.thumbnailUrl ? (
                  <div className="relative h-full w-full">
                    <Image src={form.thumbnailUrl} alt="" fill className="object-cover rounded-sm" />
                  </div>
                ) : (
                  <>
                    <Upload size={18} className="text-crm-text-muted" />
                    <span className="text-xs text-crm-text-muted">Click to upload image</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadFile(file, "thumbnail");
                  }}
                />
              </label>
            </div>

            <label className="flex items-center gap-2 md:col-span-2 text-sm text-crm-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                className="h-4 w-4 rounded-sm accent-crm-gold"
              />
              Published — visible on the public website immediately
            </label>

            {formError && <p className="md:col-span-2 text-[13px] text-red-600">{formError}</p>}

            <div className="md:col-span-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={saving || uploadingFile || uploadingThumb}
                className="inline-flex items-center gap-2 rounded-sm bg-gradient-to-r from-crm-gold to-crm-gold-bright px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black transition-all duration-300 hover:brightness-110 disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <span>{editingId ? "Save Changes" : "Add Brochure"}</span>}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="crm-btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title={`Delete "${deleteTarget?.title}"?`}
        message={deleteError || "This removes the brochure permanently and it will no longer appear on the public website."}
        confirmLabel="Delete"
        tone="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteTarget(null);
          setDeleteError("");
        }}
      />
    </div>
  );
}
