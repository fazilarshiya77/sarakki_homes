"use client";

import { useEffect, useState } from "react";
import { Plus, Hammer, Loader2, Trash2 } from "lucide-react";

interface Builder {
  id: string;
  name: string;
  _count: { properties: number };
}

export default function BuildersPage() {
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchBuilders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/builders");
      const data = await res.json();
      if (data.builders) setBuilders(data.builders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuilders();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/builders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        setName("");
        fetchBuilders();
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
          Builders Registry
        </h1>
        <p className="text-xs text-crm-text-secondary mt-0.5">
          Manage builders and developers associated with Sarakki Homes listings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Builders list */}
        <div className="lg:col-span-2 border border-crm-border/20 bg-crm-card/10 rounded-sm overflow-hidden backdrop-blur-sm">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-crm-text-secondary text-xs font-semibold">
              <Loader2 size={24} className="animate-spin text-crm-gold-bright" />
              <span>Fetching builders...</span>
            </div>
          ) : builders.length === 0 ? (
            <div className="py-24 text-center text-xs text-crm-text-secondary">
              No builders registered in the database.
            </div>
          ) : (
            <div className="divide-y divide-border/10">
              {builders.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-4 text-xs">
                  <span className="font-semibold text-crm-text flex items-center gap-2">
                    <Hammer size={12} className="text-crm-gold" />
                    {b.name}
                  </span>
                  <span className="text-crm-text-secondary">
                    {b._count.properties} properties listed
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Builder form */}
        <div className="rounded-sm border border-crm-border/20 bg-crm-card/25 p-6 backdrop-blur-md space-y-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-crm-text-secondary">Add Builder</span>
            <p className="text-[10px] text-crm-text-secondary mt-0.5">Register a new real estate developer.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-crm-text-secondary">Developer Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Prestige Group"
                className="w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-2.5 px-3.5 text-xs text-crm-text outline-none focus:border-crm-gold-bright/40"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-sm bg-gradient-to-r from-crm-gold to-crm-gold-bright py-2.5 text-xs font-semibold uppercase tracking-wider text-black transition-all duration-300 hover:brightness-110 disabled:opacity-50"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <span>Add Builder</span>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
