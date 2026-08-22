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
        <h1 className="crm-page-title tracking-wide text-crm-text">
          Blog Articles
        </h1>
        <p className="crm-body-text text-crm-text-secondary mt-0.5">
          Write, edit, and configure SEO fields for educational real estate guides.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Blogs list */}
        <div className="lg:col-span-2 border border-crm-border/20 bg-crm-card/10 rounded-sm overflow-hidden backdrop-blur-sm">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-crm-text-secondary crm-body-text font-semibold">
              <Loader2 size={24} className="animate-spin text-crm-gold-bright" />
              <span>Fetching articles...</span>
            </div>
          ) : blogs.length === 0 ? (
            <div className="py-24 text-center crm-body-text text-crm-text-secondary">
              No blog articles published.
            </div>
          ) : (
            <div className="divide-y divide-border/10">
              {blogs.map((b) => (
                <div key={b.id} className="p-4 crm-table-text space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-crm-text flex items-center gap-2">
                      <FileText size={12} className="text-crm-gold" />
                      {b.title}
                    </span>
                    <span className="flex items-center gap-1.5">
                      {b.published ? (
                        <CheckCircle2 size={12} className="text-emerald-500" />
                      ) : (
                        <XCircle size={12} className="text-crm-text-secondary/40" />
                      )}
                      <span className="text-[11px] uppercase font-semibold text-crm-text-secondary">
                        {b.published ? "Live" : "Draft"}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-crm-text-secondary/60">
                    <Calendar size={10} />
                    <span>{new Date(b.createdAt).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Blog form */}
        <div className="rounded-sm border border-crm-border/20 bg-crm-card/25 p-6 backdrop-blur-md space-y-4">
          <div>
            <span className="crm-section-heading uppercase tracking-wider text-crm-text-secondary">New Article</span>
            <p className="text-xs text-crm-text-secondary mt-0.5">Write a new guide page.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="crm-label uppercase tracking-wider text-crm-text-secondary">Article Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Understanding SARFAESI Auction Risks"
                className="w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-3 px-4 text-[15px] text-crm-text outline-none focus:border-crm-gold-bright/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="crm-label uppercase tracking-wider text-crm-text-secondary">Featured Image URL</label>
              <input
                type="text"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="e.g. /media/blog1.jpg"
                className="w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-3 px-4 text-[15px] text-crm-text outline-none focus:border-crm-gold-bright/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="crm-label uppercase tracking-wider text-crm-text-secondary">Content Markdown</label>
              <textarea
                rows={6}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write article details..."
                className="w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-3 px-4 text-[15px] text-crm-text outline-none focus:border-crm-gold-bright/40 resize-none"
              />
            </div>

            <div className="space-y-1.5 flex items-center justify-between border border-crm-border/20 bg-crm-bg/40 rounded-sm p-4 mt-6">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-crm-text">Publish Immediately</span>
                <span className="text-xs text-crm-text-secondary mt-0.5">Visible to search crawlers</span>
              </div>
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4 rounded border border-crm-border/40 accent-crm-gold-bright"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-sm bg-gradient-to-r from-crm-gold to-crm-gold-bright py-2.5 text-sm font-semibold uppercase tracking-wider text-black transition-all duration-300 hover:brightness-110 disabled:opacity-50"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <span>Publish Article</span>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
