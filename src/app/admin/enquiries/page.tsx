"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  User,
  Phone,
  Mail,
  Building,
  Calendar,
  Clock,
  UserCheck,
  ChevronRight,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface Enquiry {
  id: string;
  customerId: string;
  customer: { name: string; email: string; phone: string };
  property: { title: string; price: string; location: string };
  message: string;
  status: string;
  notes: string;
  createdAt: string;
  staffId?: string | null;
  assignedTo?: { id: string; name: string } | null;
  // Consultation-flow fields — "General" enquiryType and null
  // contactMethod/preferredDate/preferredTime cover every enquiry that
  // predates this (or comes from a future non-consultation source).
  enquiryType: string;
  contactMethod: string | null;
  preferredDate: string | null;
  preferredTime: string | null;
  // What the client is actually asking for, captured by staff — separate
  // from `property` above (whichever single listing, if any, they clicked
  // through on). Optional: filling this in is never required.
  requirementBedrooms: number | null;
  requirementCategoryId: string | null;
  requirementCategory: { id: string; title: string; slug: string } | null;
  // Computed server-side: how many PUBLISHED listings currently match
  // (beds + category). Null when no requirement has been logged yet.
  matchingPropertiesCount: number | null;
}

interface StaffOption {
  id: string;
  name: string;
  role: string;
}

interface CategoryOption {
  id: string;
  title: string;
  slug: string;
}

const STATUS_BADGE_CLASS: Record<string, string> = {
  NEW: "bg-red-500/10 text-red-400 border-red-500/20",
  CONTACTED: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  FOLLOW_UP: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  CONVERTED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  CLOSED: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

const STATUS_LABEL: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  FOLLOW_UP: "Follow-up",
  CONVERTED: "Converted",
  CLOSED: "Closed",
};

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [staff, setStaff] = useState<StaffOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Enquiry | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Notes and status editing state
  const [editNotes, setEditNotes] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editStaffId, setEditStaffId] = useState("");
  const [editRequirementBedrooms, setEditRequirementBedrooms] = useState("");
  const [editRequirementCategoryId, setEditRequirementCategoryId] = useState("");

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/enquiries");
      const data = await res.json();
      if (data.enquiries) {
        setEnquiries(data.enquiries);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Standard fetch-on-mount — setState happens inside fetchEnquiries
    // after its own await, not synchronously in this effect body.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEnquiries();
    // Staff list for the assignment dropdown below — a lightweight
    // read of who exists, no CRUD (that's /admin/staff).
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => setStaff(data.users || []))
      .catch(() => {});
    // Category list for the Requirements editor's dropdown.
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  const openDetails = (enq: Enquiry) => {
    setSelectedEnquiry(enq);
    setEditNotes(enq.notes || "");
    setEditStatus(enq.status);
    setEditStaffId(enq.staffId || "");
    setEditRequirementBedrooms(enq.requirementBedrooms != null ? String(enq.requirementBedrooms) : "");
    setEditRequirementCategoryId(enq.requirementCategoryId || "");
  };

  const handleUpdate = async () => {
    if (!selectedEnquiry) return;
    setSavingId(selectedEnquiry.id);

    try {
      const res = await fetch(`/api/admin/enquiries/${selectedEnquiry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus,
          notes: editNotes,
          staffId: editStaffId || null,
          requirementBedrooms: editRequirementBedrooms ? Number(editRequirementBedrooms) : null,
          requirementCategoryId: editRequirementCategoryId || null,
        }),
      });

      if (res.ok) {
        // Refetch rather than patch locally — the matching-properties
        // count is computed server-side and there's no cheap way to
        // recompute it client-side without duplicating that query logic.
        await fetchEnquiries();
        setSelectedEnquiry(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/enquiries/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        setEnquiries((prev) => prev.filter((e) => e.id !== deleteTarget.id));
        if (selectedEnquiry?.id === deleteTarget.id) setSelectedEnquiry(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 relative h-full">
      {/* Header */}
      <div>
        <h1 className="crm-page-title tracking-wide">
          Website Enquiries
        </h1>
        <p className="crm-body-text mt-0.5">
          Contact-form submissions from the public website. For actively-managed sales
          opportunities with a pipeline stage, see Leads.
        </p>
      </div>

      <div className={cn("grid grid-cols-1 gap-8 items-start", selectedEnquiry && "xl:grid-cols-3")}>
        {/* Enquiries Table — full width until a row is selected; the
            side panel below only claims a column once it actually has
            something to show, instead of permanently reserving a third
            of the screen and forcing the table into a horizontal scroll. */}
        <div className={cn("crm-card overflow-hidden", selectedEnquiry && "xl:col-span-2")}>
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-crm-text-secondary crm-body-text font-semibold">
              <Loader2 size={24} className="animate-spin text-crm-gold-bright" />
              <span>Fetching client enquiries...</span>
            </div>
          ) : enquiries.length === 0 ? (
            <div className="py-24 text-center crm-body-text">
              No enquiries active. All client submissions show up here automatically.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse crm-table-text">
                <thead>
                  <tr className="border-b border-crm-border bg-crm-bg/70 text-crm-text-muted font-semibold">
                    <th className="p-4 uppercase tracking-wider text-[11px] font-bold">Name</th>
                    <th className="p-4 uppercase tracking-wider text-[11px] font-bold">Contact</th>
                    <th className="p-4 uppercase tracking-wider text-[11px] font-bold">Property</th>
                    <th className="p-4 uppercase tracking-wider text-[11px] font-bold">Requirements</th>
                    <th className="p-4 uppercase tracking-wider text-[11px] font-bold">Type</th>
                    <th className="p-4 uppercase tracking-wider text-[11px] font-bold">Status</th>
                    <th className="p-4 uppercase tracking-wider text-[11px] font-bold">Assigned</th>
                    <th className="p-4 uppercase tracking-wider text-[11px] font-bold">Submitted</th>
                    <th className="p-4 uppercase tracking-wider text-[11px] font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.map((enq) => {
                    const isActive = selectedEnquiry?.id === enq.id;
                    const badgeClass = STATUS_BADGE_CLASS[enq.status] ?? STATUS_BADGE_CLASS.NEW;

                    return (
                      <tr
                        key={enq.id}
                        onClick={() => openDetails(enq)}
                        className={cn(
                          "border-b border-crm-border/70 cursor-pointer transition-colors duration-150 hover:bg-crm-gold/[0.035]",
                          isActive && "bg-crm-gold/[0.05]"
                        )}
                      >
                        <td className="p-4 max-w-[160px]">
                          <span className="block font-semibold text-crm-text truncate">{enq.customer.name}</span>
                          {enq.contactMethod && (
                            <span className="block text-xs text-crm-text-muted mt-0.5">
                              Prefers {enq.contactMethod}
                            </span>
                          )}
                        </td>
                        <td className="p-4 max-w-[190px]">
                          <span className="block truncate">{enq.customer.phone}</span>
                          <span className="block text-xs text-crm-text-muted truncate mt-0.5">
                            {enq.customer.email}
                          </span>
                        </td>
                        <td className="p-4 max-w-[180px]">
                          <div className="flex items-center gap-1.5 text-crm-text-secondary">
                            <Building size={12} className="shrink-0" />
                            <span className="truncate">{enq.property.title}</span>
                          </div>
                        </td>
                        <td className="p-4 max-w-[200px]">
                          {enq.requirementBedrooms != null || enq.requirementCategory ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-crm-text-secondary truncate">
                                {enq.requirementBedrooms != null ? `${enq.requirementBedrooms} BHK` : "Any BHK"}
                                {enq.requirementCategory ? ` · ${enq.requirementCategory.title}` : ""}
                              </span>
                              {enq.matchingPropertiesCount != null && (
                                <span
                                  className={cn(
                                    "text-[11px] font-semibold whitespace-nowrap",
                                    enq.matchingPropertiesCount > 0 ? "text-emerald-500" : "text-crm-text-muted"
                                  )}
                                >
                                  {enq.matchingPropertiesCount} matching {enq.matchingPropertiesCount === 1 ? "listing" : "listings"}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-crm-text-muted">Not logged</span>
                          )}
                        </td>
                        <td className="p-4">
                          {enq.enquiryType === "Consultation" ? (
                            <span className="px-2 py-0.5 rounded-full border border-crm-gold/30 bg-crm-gold/10 text-crm-gold text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap">
                              Consultation
                            </span>
                          ) : (
                            <span className="text-xs text-crm-text-muted">{enq.enquiryType}</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={cn("px-2.5 py-1 rounded-full border text-[11px] font-bold tracking-wide uppercase whitespace-nowrap", badgeClass)}>
                            {STATUS_LABEL[enq.status] ?? enq.status}
                          </span>
                        </td>
                        <td className="p-4">
                          {enq.assignedTo ? (
                            <span className="flex items-center gap-1 text-xs font-semibold text-crm-gold whitespace-nowrap">
                              <UserCheck size={11} />
                              {enq.assignedTo.name}
                            </span>
                          ) : (
                            <span className="text-xs text-crm-text-muted">Unassigned</span>
                          )}
                        </td>
                        <td className="p-4 text-xs text-crm-text-secondary whitespace-nowrap">
                          {new Date(enq.createdAt).toLocaleDateString("en-IN", {
                            timeZone: "Asia/Kolkata",
                            day: "numeric",
                            month: "short",
                          })}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetails(enq);
                            }}
                            title="View details"
                            aria-label="View details"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-crm-border hover:border-crm-gold/50 hover:bg-crm-gold/5 text-crm-text-secondary hover:text-crm-text transition-all duration-200"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sliding Details & Notes Side Panel */}
        <AnimatePresence>
          {selectedEnquiry && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="rounded-sm border border-crm-border/20 bg-crm-card/50 p-6 backdrop-blur-xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-crm-border/20 pb-4">
                <div className="flex flex-col">
                  <span className="crm-section-heading uppercase tracking-wider">
                    Lead Details
                  </span>
                  <span className="text-xs text-crm-text-secondary mt-0.5">
                    Update notes and contact details
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setDeleteTarget(selectedEnquiry)}
                    title="Delete enquiry"
                    aria-label="Delete enquiry"
                    className="p-1.5 hover:bg-red-50 text-crm-text-secondary hover:text-red-600 rounded-sm transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    onClick={() => setSelectedEnquiry(null)}
                    className="p-1.5 hover:bg-crm-bg text-crm-text-secondary hover:text-crm-text rounded-sm transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Customer contact Info */}
              <div className="space-y-3.5 crm-table-text">
                <div className="flex items-center gap-3">
                  <User size={14} className="text-crm-text-secondary" />
                  <span className="font-semibold text-crm-text">{selectedEnquiry.customer.name}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Phone size={14} className="text-crm-text-secondary" />
                    <a href={`tel:${selectedEnquiry.customer.phone}`} className="text-crm-gold hover:text-crm-gold-bright transition-colors font-medium">
                      {selectedEnquiry.customer.phone}
                    </a>
                  </div>
                  {/* Quick WhatsApp action — the customer's number, not
                      the company's, so this opens a chat TO them.
                      Surfaced whenever WhatsApp is their stated
                      preference, but available regardless since it's
                      just as valid a way for staff to reach out. */}
                  <a
                    href={`https://wa.me/${selectedEnquiry.customer.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Message on WhatsApp"
                    className="flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                  >
                    <MessageSquare size={11} />
                    WhatsApp
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={14} className="text-crm-text-secondary" />
                  <a href={`mailto:${selectedEnquiry.customer.email}`} className="text-crm-gold hover:text-crm-gold-bright transition-colors font-medium">
                    {selectedEnquiry.customer.email}
                  </a>
                </div>
                <div className="flex items-center gap-3 border-t border-crm-border/20 pt-3">
                  <Building size={14} className="text-crm-text-secondary" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-crm-text">{selectedEnquiry.property.title}</span>
                    <span className="text-xs text-crm-text-secondary mt-0.5">{selectedEnquiry.property.location} • {selectedEnquiry.property.price}</span>
                  </div>
                </div>

                {/* Consultation-specific detail — only present when this
                    enquiry actually came from the "Request a
                    Consultation" flow (enquiryType === "Consultation");
                    a plain contact-form enquiry has none of these. */}
                {(selectedEnquiry.contactMethod || selectedEnquiry.preferredDate || selectedEnquiry.preferredTime) && (
                  <div className="grid grid-cols-2 gap-3 border-t border-crm-border/20 pt-3 text-xs">
                    {selectedEnquiry.contactMethod && (
                      <div>
                        <span className="block text-crm-text-secondary">Preferred Contact</span>
                        <span className="font-semibold text-crm-text">{selectedEnquiry.contactMethod}</span>
                      </div>
                    )}
                    {selectedEnquiry.enquiryType && (
                      <div>
                        <span className="block text-crm-text-secondary">Enquiry Type</span>
                        <span className="font-semibold text-crm-text">{selectedEnquiry.enquiryType}</span>
                      </div>
                    )}
                    {selectedEnquiry.preferredDate && (
                      <div className="flex items-center gap-1.5">
                        <Calendar size={11} className="text-crm-text-secondary" />
                        <span className="font-semibold text-crm-text">{selectedEnquiry.preferredDate}</span>
                      </div>
                    )}
                    {selectedEnquiry.preferredTime && (
                      <div className="flex items-center gap-1.5">
                        <Clock size={11} className="text-crm-text-secondary" />
                        <span className="font-semibold text-crm-text">{selectedEnquiry.preferredTime}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t border-crm-border/20 pt-3 text-xs">
                  <span className="block text-crm-text-secondary">Submitted</span>
                  <span className="font-semibold text-crm-text">
                    {new Date(selectedEnquiry.createdAt).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {/* Status and Notes Editing Form */}
              <div className="space-y-4 pt-4 border-t border-crm-border/20">
                <div className="space-y-1.5">
                  <label className="crm-label">
                    Lead Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="crm-select"
                  >
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="FOLLOW_UP">Follow-up</option>
                    <option value="CONVERTED">Converted</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="crm-label">
                    Client Requirements
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={editRequirementBedrooms}
                      onChange={(e) => setEditRequirementBedrooms(e.target.value)}
                      className="crm-select"
                    >
                      <option value="">Any BHK</option>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} BHK
                        </option>
                      ))}
                    </select>
                    <select
                      value={editRequirementCategoryId}
                      onChange={(e) => setEditRequirementCategoryId(e.target.value)}
                      className="crm-select"
                    >
                      <option value="">Any category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedEnquiry.matchingPropertiesCount != null && (
                    <p className="text-xs text-crm-text-secondary pt-0.5">
                      <span
                        className={cn(
                          "font-semibold",
                          selectedEnquiry.matchingPropertiesCount > 0 ? "text-emerald-500" : "text-crm-text-muted"
                        )}
                      >
                        {selectedEnquiry.matchingPropertiesCount} live listing
                        {selectedEnquiry.matchingPropertiesCount === 1 ? "" : "s"}
                      </span>{" "}
                      currently match{selectedEnquiry.matchingPropertiesCount === 1 ? "es" : ""} this requirement.
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="crm-label">
                    Assigned To
                  </label>
                  <select
                    value={editStaffId}
                    onChange={(e) => setEditStaffId(e.target.value)}
                    className="crm-select"
                  >
                    <option value="">Unassigned</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} · {s.role.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="crm-label">
                    Follow-up Notes
                  </label>
                  <textarea
                    rows={6}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Log client call details, appointment times, specific requests..."
                    className="crm-textarea resize-none"
                  />
                </div>

                <button
                  onClick={handleUpdate}
                  disabled={savingId !== null}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-sm bg-gradient-to-r from-crm-gold to-crm-gold-bright py-2.5 text-xs font-semibold uppercase tracking-wider text-black transition-all duration-300 hover:brightness-110 disabled:opacity-50"
                >
                  {savingId !== null ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <span>Save Update</span>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title={`Delete enquiry from "${deleteTarget?.customer.name}"?`}
        message="This permanently removes the enquiry record — this can't be undone."
        confirmLabel="Delete"
        tone="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

// Simple Helper function
function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
