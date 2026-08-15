"use client";

import { useEffect, useState } from "react";
import { Plus, Tags, Loader2 } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-wide text-crm-text">
          Category Configuration
        </h1>
        <p className="text-xs text-crm-text-secondary mt-0.5">
          Organize property segments, taglines, and marketing descriptions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Categories list */}
        <div className="lg:col-span-2 border border-crm-border/20 bg-crm-card/10 rounded-sm overflow-hidden backdrop-blur-sm">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-crm-text-secondary text-xs font-semibold">
              <Loader2 size={24} className="animate-spin text-crm-gold-bright" />
              <span>Loading categories...</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="py-24 text-center text-xs text-crm-text-secondary">
              No categories registered in database.
            </div>
          ) : (
            <div className="divide-y divide-border/10">
              {categories.map((c) => (
                <div key={c.id} className="p-4 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-crm-text flex items-center gap-2">
                      <Tags size={12} className="text-crm-gold" />
                      {c.title}
                    </span>
                    <span className="text-crm-text-secondary font-mono text-[10px]">
                      {c._count.properties} properties
                    </span>
                  </div>
                  <p className="text-[10px] text-crm-text-secondary line-clamp-1">
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
            <span className="text-xs font-semibold uppercase tracking-wider text-crm-text-secondary">Add Category</span>
            <p className="text-[10px] text-crm-text-secondary mt-0.5">Define a new property segment classification.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-crm-text-secondary">Category Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Luxury Penthouses"
                className="w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-2.5 px-3.5 text-xs text-crm-text outline-none focus:border-crm-gold-bright/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-crm-text-secondary">Summary Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Sourced properties built for..."
                className="w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-2.5 px-3.5 text-xs text-crm-text outline-none focus:border-crm-gold-bright/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-crm-text-secondary">Hero Tagline</label>
              <input
                type="text"
                value={heroTagline}
                onChange={(e) => setHeroTagline(e.target.value)}
                placeholder="A penthouse view over Bengaluru."
                className="w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-2.5 px-3.5 text-xs text-crm-text outline-none focus:border-crm-gold-bright/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-crm-text-secondary">Long Description</label>
              <textarea
                rows={3}
                value={longDescription}
                onChange={(e) => setLongDescription(e.target.value)}
                placeholder="Full marketing text explaining details..."
                className="w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-2.5 px-3.5 text-xs text-crm-text outline-none focus:border-crm-gold-bright/40 resize-none"
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
    </div>
  );
}
