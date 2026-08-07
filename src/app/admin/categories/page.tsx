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
        <h1 className="font-display text-2xl font-semibold tracking-wide text-foreground">
          Category Configuration
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Organize property segments, taglines, and marketing descriptions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Categories list */}
        <div className="lg:col-span-2 border border-border/20 bg-card/10 rounded-sm overflow-hidden backdrop-blur-sm">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-muted-foreground text-xs font-semibold">
              <Loader2 size={24} className="animate-spin text-accent-gold" />
              <span>Loading categories...</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="py-24 text-center text-xs text-muted-foreground">
              No categories registered in database.
            </div>
          ) : (
            <div className="divide-y divide-border/10">
              {categories.map((c) => (
                <div key={c.id} className="p-4 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground flex items-center gap-2">
                      <Tags size={12} className="text-accent-gold-dark" />
                      {c.title}
                    </span>
                    <span className="text-muted-foreground font-mono text-[10px]">
                      {c._count.properties} properties
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">
                    {c.description || "No description set"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Category form */}
        <div className="rounded-sm border border-border/20 bg-card/25 p-6 backdrop-blur-md space-y-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Add Category</span>
            <p className="text-[10px] text-muted-foreground mt-0.5">Define a new property segment classification.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Category Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Luxury Penthouses"
                className="w-full rounded-sm border border-border/40 bg-background/40 py-2.5 px-3.5 text-xs text-foreground outline-none focus:border-accent-gold/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Summary Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Sourced properties built for..."
                className="w-full rounded-sm border border-border/40 bg-background/40 py-2.5 px-3.5 text-xs text-foreground outline-none focus:border-accent-gold/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Hero Tagline</label>
              <input
                type="text"
                value={heroTagline}
                onChange={(e) => setHeroTagline(e.target.value)}
                placeholder="A penthouse view over Bengaluru."
                className="w-full rounded-sm border border-border/40 bg-background/40 py-2.5 px-3.5 text-xs text-foreground outline-none focus:border-accent-gold/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Long Description</label>
              <textarea
                rows={3}
                value={longDescription}
                onChange={(e) => setLongDescription(e.target.value)}
                placeholder="Full marketing text explaining details..."
                className="w-full rounded-sm border border-border/40 bg-background/40 py-2.5 px-3.5 text-xs text-foreground outline-none focus:border-accent-gold/40 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-sm bg-gradient-to-r from-accent-gold-dark to-accent-gold py-2.5 text-xs font-semibold uppercase tracking-wider text-black transition-all duration-300 hover:brightness-110 disabled:opacity-50"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <span>Create Category</span>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
