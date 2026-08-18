"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, Layout } from "lucide-react";

// Scoped to homepage copy only — company info, WhatsApp number, and
// social links used to be editable here too, duplicating the exact same
// fields on /admin/settings (two screens editing one row, easy to
// change one and think you'd changed both). Settings is now the single
// place for business/contact/system configuration; this page is purely
// "what the homepage says."
export default function CmsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [heroTitle, setHeroTitle] = useState("");
  const [heroDescription, setHeroDescription] = useState("");
  const [aboutHeadline, setAboutHeadline] = useState("");
  const [aboutDescription, setAboutDescription] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (data.setting) {
          const s = data.setting;
          setHeroTitle(s.heroTitle || "");
          setHeroDescription(s.heroDescription || "");
          setAboutHeadline(s.aboutHeadline || "");
          setAboutDescription(s.aboutDescription || "");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroTitle,
          heroDescription,
          aboutHeadline,
          aboutDescription,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-crm-text-secondary text-xs font-semibold">
        <Loader2 size={24} className="animate-spin text-crm-gold-bright" />
        <span>Loading website content...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-wide text-crm-text">
            Website Content
          </h1>
          <p className="text-xs text-crm-text-secondary mt-0.5">
            Edit the homepage headline and about copy without touching code. For company info,
            WhatsApp number, or social links, use Settings instead.
          </p>
        </div>

        {success && (
          <span className="text-xs font-semibold text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 rounded-sm animate-pulse">
            Website updated successfully!
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Hero Section */}
        <div className="rounded-sm border border-crm-border/20 bg-crm-card/25 p-6 backdrop-blur-md space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-crm-gold flex items-center gap-2">
            <Layout size={14} />
            Hero Section Content
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-crm-text-secondary">Hero Headline</label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-2.5 px-3.5 text-xs text-crm-text outline-none focus:border-crm-gold-bright/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-crm-text-secondary">Hero Description Subtext</label>
              <textarea
                rows={4}
                value={heroDescription}
                onChange={(e) => setHeroDescription(e.target.value)}
                className="w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-2.5 px-3.5 text-xs text-crm-text outline-none focus:border-crm-gold-bright/40 resize-none"
              />
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="rounded-sm border border-crm-border/20 bg-crm-card/25 p-6 backdrop-blur-md space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-crm-gold flex items-center gap-2">
            About Section Content
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-crm-text-secondary">About Headline</label>
              <input
                type="text"
                value={aboutHeadline}
                onChange={(e) => setAboutHeadline(e.target.value)}
                className="w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-2.5 px-3.5 text-xs text-crm-text outline-none focus:border-crm-gold-bright/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-crm-text-secondary">About Description Paragraph</label>
              <textarea
                rows={4}
                value={aboutDescription}
                onChange={(e) => setAboutDescription(e.target.value)}
                className="w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-2.5 px-3.5 text-xs text-crm-text outline-none focus:border-crm-gold-bright/40 resize-none"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-sm bg-gradient-to-r from-crm-gold to-crm-gold-bright px-6 py-3 text-xs font-semibold uppercase tracking-wider text-black transition-all duration-300 hover:brightness-110 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <>
              <Save size={14} />
              <span>Publish Updates</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
