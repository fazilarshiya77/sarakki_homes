"use client";

import { useEffect, useState } from "react";
import { FileText, Loader2, Plus, Calendar, CheckCircle2, XCircle } from "lucide-react";

interface Blog {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  createdAt: string;
}

export default function BlogManagerPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [published, setPublished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blogs");
      const data = await res.json();
      if (data.blogs) setBlogs(data.blogs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          featuredImage,
          seoTitle,
          seoDescription,
          published,
        }),
      });
      if (res.ok) {
        setTitle("");
        setContent("");
        setFeaturedImage("");
        setSeoTitle("");
        setSeoDescription("");
        setPublished(false);
        fetchBlogs();
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
          Blog Articles
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Write, edit, and configure SEO fields for educational real estate guides.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Blogs list */}
        <div className="lg:col-span-2 border border-border/20 bg-card/10 rounded-sm overflow-hidden backdrop-blur-sm">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-muted-foreground text-xs font-semibold">
              <Loader2 size={24} className="animate-spin text-accent-gold" />
              <span>Fetching articles...</span>
            </div>
          ) : blogs.length === 0 ? (
            <div className="py-24 text-center text-xs text-muted-foreground">
              No blog articles published.
            </div>
          ) : (
            <div className="divide-y divide-border/10">
              {blogs.map((b) => (
                <div key={b.id} className="p-4 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground flex items-center gap-2">
                      <FileText size={12} className="text-accent-gold-dark" />
                      {b.title}
                    </span>
                    <span className="flex items-center gap-1.5">
                      {b.published ? (
                        <CheckCircle2 size={12} className="text-emerald-500" />
                      ) : (
                        <XCircle size={12} className="text-muted-foreground/40" />
                      )}
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                        {b.published ? "Live" : "Draft"}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60">
                    <Calendar size={10} />
                    <span>{new Date(b.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Blog form */}
        <div className="rounded-sm border border-border/20 bg-card/25 p-6 backdrop-blur-md space-y-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">New Article</span>
            <p className="text-[10px] text-muted-foreground mt-0.5">Write a new guide page.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Article Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Understanding SARFAESI Auction Risks"
                className="w-full rounded-sm border border-border/40 bg-background/40 py-2.5 px-3.5 text-xs text-foreground outline-none focus:border-accent-gold/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Featured Image URL</label>
              <input
                type="text"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="e.g. /media/blog1.jpg"
                className="w-full rounded-sm border border-border/40 bg-background/40 py-2.5 px-3.5 text-xs text-foreground outline-none focus:border-accent-gold/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Content Markdown</label>
              <textarea
                rows={6}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write article details..."
                className="w-full rounded-sm border border-border/40 bg-background/40 py-2.5 px-3.5 text-xs text-foreground outline-none focus:border-accent-gold/40 resize-none"
              />
            </div>

            <div className="space-y-1.5 flex items-center justify-between border border-border/20 bg-background/40 rounded-sm p-4 mt-6">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-foreground">Publish Immediately</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Visible to search crawlers</span>
              </div>
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4 rounded border border-border/40 accent-accent-gold"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-sm bg-gradient-to-r from-accent-gold-dark to-accent-gold py-2.5 text-xs font-semibold uppercase tracking-wider text-black transition-all duration-300 hover:brightness-110 disabled:opacity-50"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <span>Publish Article</span>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
