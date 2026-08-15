"use client";

import { useEffect, useState } from "react";
import { Quote, Star, Loader2, Plus } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string | null;
  quote: string;
  rating: number;
  createdAt: string;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState("5");
  const [submitting, setSubmitting] = useState(false);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/testimonials");
      const data = await res.json();
      if (data.testimonials) setTestimonials(data.testimonials);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quote) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, location, quote, rating }),
      });
      if (res.ok) {
        setName("");
        setRole("");
        setLocation("");
        setQuote("");
        setRating("5");
        fetchTestimonials();
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
        <h1 className="font-display text-2xl font-bold tracking-wide text-crm-text">
          Client Testimonials
        </h1>
        <p className="text-xs text-crm-text-secondary mt-0.5">
          Moderate review blocks, ratings, and quotes displayed on the public website.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Testimonials list */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-crm-text-secondary text-xs font-semibold bg-crm-card/25 border border-crm-border/20 rounded-sm">
              <Loader2 size={24} className="animate-spin text-crm-gold-bright" />
              <span>Fetching feedback records...</span>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="py-24 text-center text-xs text-crm-text-secondary bg-crm-card/25 border border-dashed border-crm-border/20 rounded-sm">
              No testimonials logged. Reviews posted here will appear on the testimonials marquee.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="p-5 rounded-sm border border-crm-border/20 bg-crm-card/25 backdrop-blur-md flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-0.5 text-crm-gold-bright">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} size={12} fill="currentColor" />
                        ))}
                      </div>
                      <Quote size={14} className="text-crm-text-secondary/30" />
                    </div>
                    <p className="text-xs text-crm-text-secondary italic leading-relaxed line-clamp-4">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-crm-border/10 flex flex-col">
                    <span className="text-xs font-semibold text-crm-text">{t.name}</span>
                    <span className="text-[10px] text-crm-text-secondary mt-0.5">
                      {t.role}
                      {t.location ? ` · ${t.location}` : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Testimonial form */}
        <div className="rounded-sm border border-crm-border/20 bg-crm-card/25 p-6 backdrop-blur-md space-y-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-crm-text-secondary">Add Testimonial</span>
            <p className="text-[10px] text-crm-text-secondary mt-0.5">Register a new client review.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-crm-text-secondary">Client Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Senthil Kumar"
                className="w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-2.5 px-3.5 text-xs text-crm-text outline-none focus:border-crm-gold-bright/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-crm-text-secondary">Client Designation / Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. IT Consultant, Hebbal"
                className="w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-2.5 px-3.5 text-xs text-crm-text outline-none focus:border-crm-gold-bright/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-crm-text-secondary">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Whitefield, Bengaluru"
                className="w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-2.5 px-3.5 text-xs text-crm-text outline-none focus:border-crm-gold-bright/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-crm-text-secondary">Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-2.5 px-3 text-xs text-crm-text-secondary outline-none focus:border-crm-gold-bright/40 cursor-pointer"
              >
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-crm-text-secondary">Review Quote</label>
              <textarea
                rows={4}
                required
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Share client's feedback about our legal verification or auction guide service..."
                className="w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-2.5 px-3.5 text-xs text-crm-text outline-none focus:border-crm-gold-bright/40 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-sm bg-gradient-to-r from-crm-gold to-crm-gold-bright py-2.5 text-xs font-semibold uppercase tracking-wider text-black transition-all duration-300 hover:brightness-110 disabled:opacity-50"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <span>Add Testimonial</span>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
