"use client";

import { useEffect, useState } from "react";
import { Quote, Star, Loader2, Eye, EyeOff, Pencil, Trash2, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string | null;
  quote: string;
  rating: number;
  published: boolean;
  createdAt: string;
}

/** Shared shape for both the "Add" form and an in-place row edit — same
 *  fields either way, just a different submit target. */
interface DraftFields {
  name: string;
  role: string;
  location: string;
  quote: string;
  rating: string;
}

const EMPTY_DRAFT: DraftFields = { name: "", role: "", location: "", quote: "", rating: "5" };

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [draft, setDraft] = useState<DraftFields>(EMPTY_DRAFT);
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<DraftFields>(EMPTY_DRAFT);
  const [savingEdit, setSavingEdit] = useState(false);

  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchTestimonials = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/testimonials");
      const data = await res.json();
      if (res.ok) setTestimonials(data.testimonials);
      else setError(data.error || "Could not load testimonials.");
    } catch {
      setError("Could not load testimonials. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name || !draft.quote) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (res.ok) {
        setDraft(EMPTY_DRAFT);
        fetchTestimonials();
      } else {
        setError(data.error || "Failed to add testimonial.");
      }
    } catch {
      setError("Failed to add testimonial. Check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (t: Testimonial) => {
    setConfirmingDeleteId(null);
    setEditingId(t.id);
    setEditDraft({
      name: t.name,
      role: t.role,
      location: t.location ?? "",
      quote: t.quote,
      rating: String(t.rating),
    });
  };

  const saveEdit = async (id: string) => {
    setSavingEdit(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editDraft),
      });
      const data = await res.json();
      if (res.ok) {
        setEditingId(null);
        fetchTestimonials();
      } else {
        setError(data.error || "Failed to save changes.");
      }
    } catch {
      setError("Failed to save changes. Check your connection.");
    } finally {
      setSavingEdit(false);
    }
  };

  const togglePublished = async (t: Testimonial) => {
    setTogglingId(t.id);
    setError("");
    // Optimistic — this is a single boolean flip staff will do repeatedly;
    // waiting on the round-trip for every click would feel sluggish.
    setTestimonials((prev) =>
      prev.map((x) => (x.id === t.id ? { ...x, published: !x.published } : x))
    );
    try {
      const res = await fetch(`/api/admin/testimonials/${t.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !t.published }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update visibility.");
        fetchTestimonials(); // revert the optimistic flip
      }
    } catch {
      setError("Failed to update visibility. Check your connection.");
      fetchTestimonials();
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async (id: string) => {
    setDeletingId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setConfirmingDeleteId(null);
        fetchTestimonials();
      } else {
        setError(data.error || "Failed to delete testimonial.");
      }
    } catch {
      setError("Failed to delete testimonial. Check your connection.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="crm-page-title tracking-wide text-crm-text">
          Client Testimonials
        </h1>
        <p className="crm-body-text text-crm-text-secondary mt-0.5">
          Moderate review blocks, ratings, and quotes displayed on the public website. Only
          published testimonials appear there.
        </p>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-sm border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-400/60 hover:text-red-400">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Testimonials list */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-crm-text-secondary crm-body-text font-semibold bg-crm-card/25 border border-crm-border/20 rounded-sm">
              <Loader2 size={24} className="animate-spin text-crm-gold-bright" />
              <span>Fetching feedback records...</span>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="py-24 text-center crm-body-text text-crm-text-secondary bg-crm-card/25 border border-dashed border-crm-border/20 rounded-sm">
              No testimonials logged. Reviews posted here will appear on the testimonials marquee.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testimonials.map((t) => {
                const isEditing = editingId === t.id;
                const isConfirmingDelete = confirmingDeleteId === t.id;

                return (
                  <div
                    key={t.id}
                    className={cn(
                      "p-5 rounded-sm border bg-crm-card/25 backdrop-blur-md flex flex-col justify-between transition-opacity",
                      t.published ? "border-crm-border/20" : "border-crm-border/20 opacity-60"
                    )}
                  >
                    {isEditing ? (
                      <div className="space-y-2.5">
                        <input
                          value={editDraft.name}
                          onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                          placeholder="Client name"
                          className="crm-input"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            value={editDraft.role}
                            onChange={(e) => setEditDraft((d) => ({ ...d, role: e.target.value }))}
                            placeholder="Role"
                            className="crm-input"
                          />
                          <input
                            value={editDraft.location}
                            onChange={(e) => setEditDraft((d) => ({ ...d, location: e.target.value }))}
                            placeholder="Location"
                            className="crm-input"
                          />
                        </div>
                        <textarea
                          value={editDraft.quote}
                          onChange={(e) => setEditDraft((d) => ({ ...d, quote: e.target.value }))}
                          rows={3}
                          placeholder="Quote"
                          className="crm-textarea resize-none"
                        />
                        <select
                          value={editDraft.rating}
                          onChange={(e) => setEditDraft((d) => ({ ...d, rating: e.target.value }))}
                          className="crm-select"
                        >
                          <option value="5">5 Stars</option>
                          <option value="4">4 Stars</option>
                          <option value="3">3 Stars</option>
                        </select>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => saveEdit(t.id)}
                            disabled={savingEdit}
                            className="crm-btn-gold flex-1 py-2"
                          >
                            {savingEdit ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="crm-btn-ghost py-2"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-0.5 text-crm-gold-bright">
                              {Array.from({ length: t.rating }).map((_, i) => (
                                <Star key={i} size={12} fill="currentColor" />
                              ))}
                            </div>
                            <Quote size={14} className="text-crm-text-secondary/30" />
                          </div>
                          <p className="crm-table-text text-crm-text-secondary italic leading-relaxed line-clamp-4">
                            &ldquo;{t.quote}&rdquo;
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-crm-border/10">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="crm-table-text font-semibold text-crm-text">{t.name}</span>
                              <span className="text-xs text-crm-text-secondary mt-0.5">
                                {t.role}
                                {t.location ? ` · ${t.location}` : ""}
                              </span>
                            </div>
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-full border text-[11px] font-semibold uppercase tracking-wide",
                                t.published
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                              )}
                            >
                              {t.published ? "Published" : "Hidden"}
                            </span>
                          </div>

                          {isConfirmingDelete ? (
                            <div className="mt-3 flex items-center gap-2 rounded-sm border border-red-500/20 bg-red-500/5 p-2">
                              <span className="flex-1 text-xs text-red-400">Delete permanently?</span>
                              <button
                                onClick={() => confirmDelete(t.id)}
                                disabled={deletingId === t.id}
                                className="rounded-sm bg-red-500 px-2 py-1 text-xs font-semibold text-white hover:bg-red-600"
                              >
                                {deletingId === t.id ? <Loader2 size={11} className="animate-spin" /> : "Confirm"}
                              </button>
                              <button
                                onClick={() => setConfirmingDeleteId(null)}
                                className="rounded-sm border border-crm-border px-2 py-1 text-xs text-crm-text-secondary"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="mt-3 flex items-center gap-1.5">
                              <button
                                onClick={() => togglePublished(t)}
                                disabled={togglingId === t.id}
                                title={t.published ? "Hide from website" : "Publish to website"}
                                className="flex items-center gap-1 rounded-sm border border-crm-border/40 px-2 py-1 text-xs font-semibold text-crm-text-secondary hover:border-crm-gold/40 hover:text-crm-text transition-colors"
                              >
                                {t.published ? <EyeOff size={11} /> : <Eye size={11} />}
                                {t.published ? "Unpublish" : "Publish"}
                              </button>
                              <button
                                onClick={() => startEdit(t)}
                                title="Edit"
                                className="flex items-center gap-1 rounded-sm border border-crm-border/40 px-2 py-1 text-xs font-semibold text-crm-text-secondary hover:border-crm-gold/40 hover:text-crm-text transition-colors"
                              >
                                <Pencil size={11} />
                                Edit
                              </button>
                              <button
                                onClick={() => setConfirmingDeleteId(t.id)}
                                title="Delete"
                                className="ml-auto flex items-center gap-1 rounded-sm border border-crm-border/40 px-2 py-1 text-xs font-semibold text-crm-text-secondary hover:border-red-500/40 hover:text-red-400 transition-colors"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Testimonial form */}
        <div className="rounded-sm border border-crm-border/20 bg-crm-card/25 p-6 backdrop-blur-md space-y-4">
          <div>
            <span className="crm-section-heading uppercase tracking-wider text-crm-text-secondary">Add Testimonial</span>
            <p className="text-xs text-crm-text-secondary mt-0.5">Register a new client review. New reviews publish immediately — unpublish it from the list if it's not ready to go live.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="crm-label uppercase tracking-wider text-crm-text-secondary">Client Name</label>
              <input
                type="text"
                required
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="e.g. Senthil Kumar"
                className="w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-3 px-4 text-[15px] text-crm-text outline-none focus:border-crm-gold-bright/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="crm-label uppercase tracking-wider text-crm-text-secondary">Client Designation / Role</label>
              <input
                type="text"
                value={draft.role}
                onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))}
                placeholder="e.g. IT Consultant, Hebbal"
                className="w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-3 px-4 text-[15px] text-crm-text outline-none focus:border-crm-gold-bright/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="crm-label uppercase tracking-wider text-crm-text-secondary">Location</label>
              <input
                type="text"
                value={draft.location}
                onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
                placeholder="e.g. Whitefield, Bengaluru"
                className="w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-3 px-4 text-[15px] text-crm-text outline-none focus:border-crm-gold-bright/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="crm-label uppercase tracking-wider text-crm-text-secondary">Rating</label>
              <select
                value={draft.rating}
                onChange={(e) => setDraft((d) => ({ ...d, rating: e.target.value }))}
                className="w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-3 px-4 text-[15px] text-crm-text-secondary outline-none focus:border-crm-gold-bright/40 cursor-pointer"
              >
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="crm-label uppercase tracking-wider text-crm-text-secondary">Review Quote</label>
              <textarea
                rows={4}
                required
                value={draft.quote}
                onChange={(e) => setDraft((d) => ({ ...d, quote: e.target.value }))}
                placeholder="Share client's feedback about our legal verification or auction guide service..."
                className="w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-3 px-4 text-[15px] text-crm-text outline-none focus:border-crm-gold-bright/40 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-sm bg-gradient-to-r from-crm-gold to-crm-gold-bright py-2.5 text-sm font-semibold uppercase tracking-wider text-black transition-all duration-300 hover:brightness-110 disabled:opacity-50"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <span>Add Testimonial</span>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
