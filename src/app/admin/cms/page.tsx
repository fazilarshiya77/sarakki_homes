"use client";

import { useEffect, useState } from "react";
import { Globe, Save, Loader2, Layout } from "lucide-react";

export default function CmsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states matching database settings columns
  const [companyName, setCompanyName] = useState("");
  const [whatsappNo, setWhatsappNo] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
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
          setCompanyName(s.companyName || "");
          setWhatsappNo(s.whatsappNo || "");
          setInstagramUrl(s.instagramUrl || "");
          setLinkedinUrl(s.linkedinUrl || "");
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
          companyName,
          whatsappNo,
          instagramUrl,
          linkedinUrl,
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
        <span>Loading CMS content...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-wide text-crm-text">
            Website CMS Editor
          </h1>
          <p className="text-xs text-crm-text-secondary mt-0.5">
            Modify text blocks, headlines, and call-to-actions without touching code.
          </p>
        </div>

        {success && (
          <span className="text-xs font-semibold text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 rounded-sm animate-pulse">
            Website updated successfully!
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Core Sections */}
        <div className="lg:col-span-2 space-y-6">
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
        </div>

        {/* Channels & Submit */}
        <div className="space-y-6">
          <div className="rounded-sm border border-crm-border/20 bg-crm-card/25 p-6 backdrop-blur-md space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-crm-gold flex items-center gap-2">
              <Globe size={14} />
              Communication Channels
            </h3>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-crm-text-secondary">WhatsApp Number</label>
                <input
                  type="text"
                  value={whatsappNo}
                  onChange={(e) => setWhatsappNo(e.target.value)}
                  className="w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-2.5 px-3.5 text-xs text-crm-text outline-none focus:border-crm-gold-bright/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-crm-text-secondary">Instagram URL</label>
                <input
                  type="text"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  className="w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-2.5 px-3.5 text-xs text-crm-text outline-none focus:border-crm-gold-bright/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-crm-text-secondary">LinkedIn URL</label>
                <input
                  type="text"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-2.5 px-3.5 text-xs text-crm-text outline-none focus:border-crm-gold-bright/40"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 rounded-sm bg-gradient-to-r from-crm-gold to-crm-gold-bright py-3 text-xs font-semibold uppercase tracking-wider text-black transition-all duration-300 hover:brightness-110 disabled:opacity-50"
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
        </div>
      </form>
    </div>
  );
}
