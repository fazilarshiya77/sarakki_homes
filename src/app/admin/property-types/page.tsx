"use client";

import { useEffect, useState } from "react";
import { Home, Loader2, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface PropertyType {
  id: string;
  name: string;
  _count: { properties: number };
}

export default function PropertyTypesPage() {
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<PropertyType | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const fetchPropertyTypes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/property-types");
      const data = await res.json();
      if (data.propertyTypes) setPropertyTypes(data.propertyTypes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Standard fetch-on-mount -- setState happens inside fetchPropertyTypes
    // after its own await, not synchronously in this effect body.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPropertyTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/admin/property-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (res.ok) {
        setName("");
        fetchPropertyTypes();
      } else {
        setSubmitError(data.error || "Couldn't add that property type. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setSubmitError("Couldn't add that property type. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/admin/property-types/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setDeleteTarget(null);
        fetchPropertyTypes();
      } else {
        setDeleteError(data.error || "Couldn't delete this property type. Please try again.");
      }
    } catch {
      setDeleteError("Couldn't delete this property type. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="crm-page-title tracking-wide">
          Property Types
        </h1>
        <p className="crm-body-text mt-0.5">
          Manage the property type options (Independent Building, Flat, Villa, Site, ...) available in the listing form.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Property types list */}
        <div className="lg:col-span-2 border border-crm-border/20 bg-crm-card/10 rounded-sm overflow-hidden backdrop-blur-sm">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-crm-text-secondary crm-body-text font-semibold">
              <Loader2 size={24} className="animate-spin text-crm-gold-bright" />
              <span>Fetching property types...</span>
            </div>
          ) : propertyTypes.length === 0 ? (
            <div className="py-24 text-center crm-body-text">
              No property types registered in the database.
            </div>
          ) : (
            <div className="divide-y divide-border/10">
              {propertyTypes.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-4 crm-table-text">
                  <span className="font-semibold text-crm-text flex items-center gap-2 min-w-0">
                    <Home size={12} className="text-crm-gold shrink-0" />
                    <span className="truncate">{t.name}</span>
                  </span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-crm-text-secondary">
                      {t._count.properties} properties listed
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError("");
                        setDeleteTarget(t);
                      }}
                      title="Delete property type"
                      aria-label={`Delete ${t.name}`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-crm-border text-crm-text-muted hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Property Type form */}
        <div className="rounded-sm border border-crm-border/20 bg-crm-card/25 p-6 backdrop-blur-md space-y-4">
          <div>
            <span className="crm-section-heading uppercase tracking-wider">Add Property Type</span>
            <p className="text-xs text-crm-text-secondary mt-0.5">Register a new property type option.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="crm-label">Type Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Villa"
                className="crm-input"
              />
              {submitError && <p className="text-[13px] text-red-600">{submitError}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-sm bg-gradient-to-r from-crm-gold to-crm-gold-bright py-2.5 text-xs font-semibold uppercase tracking-wider text-black transition-all duration-300 hover:brightness-110 disabled:opacity-50"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <span>Add Property Type</span>}
            </button>
          </form>
        </div>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title={`Delete "${deleteTarget?.name}"?`}
        message={
          deleteError ||
          "This removes the property type permanently. It only works if no properties are currently assigned to it — change those to a different type first."
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
