"use client";

import { useEffect, useState } from "react";
import { Plus, Tags, Loader2, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface Category {
  id: string;
  title: string;
  slug: string;
  description: string;
  _count: { properties: number };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [heroTagline, setHeroTagline] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          heroTagline,
          longDescription,
          highlights: [],
          idealFor: [],
        }),
      });
      if (res.ok) {
        setTitle("");
        setDescription("");
        setHeroTagline("");
        setLongDescription("");
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/admin/categories/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setDeleteTarget(null);
        fetchCategories();
      } else {
        // Keep the dialog open and show the server's actual reason (e.g.
        // "still has 7 properties assigned") rather than closing it and
        // leaving the admin to guess why nothing happened.
        setDeleteError(data.error || "Couldn't delete this category. Please try again.");
      }
    } catch (err) {
      setDeleteError("Couldn't delete this category. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="crm-page-title tracking-wide">
          Category Configuration
        </h1>
        <p className="crm-body-text mt-0.5">
          Organize property segments, taglines, and marketing descriptions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Categories list */}
        <div className="lg:col-span-2 border border-crm-border/20 bg-crm-card/10 rounded-sm overflow-hidden backdrop-blur-sm">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-crm-text-secondary crm-body-text font-semibold">
              <Loader2 size={24} className="animate-spin text-crm-gold-bright" />
              <span>Loading categories...</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="py-24 text-center crm-body-text">
              No categories registered in database.
            </div>
          ) : (
            <div className="divide-y divide-border/10">
              {categories.map((c) => (
                <div key={c.id} className="p-4 crm-table-text space-y-1 group">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-crm-text flex items-center gap-2 min-w-0">
                      <Tags size={12} className="text-crm-gold shrink-0" />
                      <span className="truncate">{c.title}</span>
                    </span>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-crm-text-secondary font-mono text-xs">
                        {c._count.properties} properties
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteError("");
                          setDeleteTarget(c);
                        }}
                        title="Delete category"
                        aria-label={`Delete ${c.title}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-crm-border text-crm-text-muted hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-crm-text-secondary line-clamp-1">
                    {c.description || "No description set"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Category form */}
        <div className="rounded-sm border border-crm-border/20 bg-crm-card/25 p-6 backdrop-blur-md space-y-4">
          <div>
            <span className="crm-section-heading uppercase tracking-wider">Add Category</span>
            <p className="text-xs text-crm-text-secondary mt-0.5">Define a new property segment classification.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="crm-label">Category Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Luxury Penthouses"
                className="crm-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="crm-label">Summary Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Sourced properties built for..."
                className="crm-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="crm-label">Hero Tagline</label>
              <input
                type="text"
                value={heroTagline}
                onChange={(e) => setHeroTagline(e.target.value)}
                placeholder="A penthouse view over Bengaluru."
                className="crm-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="crm-label">Long Description</label>
              <textarea
                rows={3}
                value={longDescription}
                onChange={(e) => setLongDescription(e.target.value)}
                placeholder="Full marketing text explaining details..."
                className="crm-textarea resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-sm bg-gradient-to-r from-crm-gold to-crm-gold-bright py-2.5 text-xs font-semibold uppercase tracking-wider text-black transition-all duration-300 hover:brightness-110 disabled:opacity-50"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <span>Create Category</span>}
            </button>
          </form>
        </div>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title={`Delete "${deleteTarget?.title}"?`}
        message={
          deleteError ||
          "This removes the category permanently. It only works if no properties are assigned to it — move or delete those first."
        }
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
