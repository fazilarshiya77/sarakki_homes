"use client";

import { useEffect, useState } from "react";
import { Settings, Save, Loader2, Sparkles } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState("Sarakki Homes");
  const [companyLogo, setCompanyLogo] = useState("/logo.png");
  const [favicon, setFavicon] = useState("/favicon.ico");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [whatsappNo, setWhatsappNo] = useState("+91 98450 00000");
  const [instagramUrl, setInstagramUrl] = useState("#");
  const [linkedinUrl, setLinkedinUrl] = useState("#");
  const [metaTitle, setMetaTitle] = useState("Sarakki Homes");
  const [metaDesc, setMetaDesc] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (data.setting) {
          const s = data.setting;
          setCompanyName(s.companyName || "");
          setCompanyLogo(s.companyLogo || "");
          setFavicon(s.favicon || "");
          setSmtpHost(s.smtpHost || "");
          setSmtpPort(String(s.smtpPort || "587"));
          setSmtpUser(s.smtpUser || "");
          setSmtpPassword(s.smtpPassword || "");
          setWhatsappNo(s.whatsappNo || "");
          setInstagramUrl(s.instagramUrl || "");
          setLinkedinUrl(s.linkedinUrl || "");
          setMetaTitle(s.metaTitle || "");
          setMetaDesc(s.metaDesc || "");
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
          companyLogo,
          favicon,
          smtpHost,
          smtpPort,
          smtpUser,
          smtpPassword,
          whatsappNo,
          instagramUrl,
          linkedinUrl,
          metaTitle,
          metaDesc,
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
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-crm-text-secondary crm-body-text font-semibold">
        <Loader2 size={24} className="animate-spin text-crm-gold-bright" />
        <span>Loading system settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="crm-page-title tracking-wide text-crm-text">
            Global Settings
          </h1>
          <p className="crm-body-text text-crm-text-secondary mt-0.5">
            Configure SMTP, WhatsApp lines, SEO parameters, and meta branding.
          </p>
        </div>

        {success && (
          <span className="text-sm font-semibold text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 rounded-sm animate-pulse">
            Settings saved successfully!
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Core fields (Left) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Company details */}
          <div className="rounded-sm border border-crm-border/20 bg-crm-card/25 p-6 backdrop-blur-md space-y-4">
            <h3 className="crm-section-heading uppercase tracking-wider text-crm-gold flex items-center gap-2">
              <Settings size={14} />
              Company Profile
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="crm-label uppercase tracking-wider text-crm-text-secondary">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-3 px-4 text-[15px] text-crm-text outline-none focus:border-crm-gold-bright/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="crm-label uppercase tracking-wider text-crm-text-secondary">WhatsApp Primary Number</label>
                <input
                  type="text"
                  value={whatsappNo}
                  onChange={(e) => setWhatsappNo(e.target.value)}
                  className="w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-3 px-4 text-[15px] text-crm-text outline-none focus:border-crm-gold-bright/40"
                />
              </div>
            </div>
          </div>

          {/* Card 2: SMTP Mail Gateways */}
          <div className="rounded-sm border border-crm-border/20 bg-crm-card/25 p-6 backdrop-blur-md space-y-4">
            <h3 className="crm-section-heading uppercase tracking-wider text-crm-gold flex items-center gap-2">
              SMTP Mail Gateway
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="crm-label uppercase tracking-wider text-crm-text-secondary">SMTP Host</label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="smtp.mailgun.org"
                  className="w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-3 px-4 text-[15px] text-crm-text outline-none focus:border-crm-gold-bright/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="crm-label uppercase tracking-wider text-crm-text-secondary">SMTP Port</label>
                <input
                  type="text"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  placeholder="587"
                  className="w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-3 px-4 text-[15px] text-crm-text outline-none focus:border-crm-gold-bright/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="crm-label uppercase tracking-wider text-crm-text-secondary">SMTP Username</label>
                <input
                  type="text"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  className="w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-3 px-4 text-[15px] text-crm-text outline-none focus:border-crm-gold-bright/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="crm-label uppercase tracking-wider text-crm-text-secondary">SMTP Password</label>
                <input
                  type="password"
                  value={smtpPassword}
                  onChange={(e) => setSmtpPassword(e.target.value)}
                  className="w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-3 px-4 text-[15px] text-crm-text outline-none focus:border-crm-gold-bright/40"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SEO Defaults & Saves (Right) */}
        <div className="space-y-6">
          <div className="rounded-sm border border-crm-border/20 bg-crm-card/25 p-6 backdrop-blur-md space-y-4">
            <h3 className="crm-section-heading uppercase tracking-wider text-crm-gold">
              Default SEO Metadata
            </h3>

            <div className="space-y-4 crm-body-text">
              <div className="space-y-1.5">
                <label className="crm-label uppercase tracking-wider text-crm-text-secondary">Meta Title</label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-3 px-4 text-[15px] text-crm-text outline-none focus:border-crm-gold-bright/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="crm-label uppercase tracking-wider text-crm-text-secondary">Meta Description</label>
                <textarea
                  rows={4}
                  value={metaDesc}
                  onChange={(e) => setMetaDesc(e.target.value)}
                  className="w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-3 px-4 text-[15px] text-crm-text outline-none focus:border-crm-gold-bright/40 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 rounded-sm bg-gradient-to-r from-crm-gold to-crm-gold-bright py-3 text-sm font-semibold uppercase tracking-wider text-black transition-all duration-300 hover:brightness-110 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                <Save size={14} />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
