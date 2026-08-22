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
  ClipboardList,
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
}

interface StaffOption {
  id: string;
  name: string;
  role: string;
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
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Enquiry | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Notes and status editing state
  const [editNotes, setEditNotes] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editStaffId, setEditStaffId] = useState("");

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
    fetchEnquiries();
    // Staff list for the assignment dropdown below — a lightweight
    // read of who exists, no CRUD (that's /admin/staff).
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => setStaff(data.users || []))
      .catch(() => {});
  }, []);

  const openDetails = (enq: Enquiry) => {
    setSelectedEnquiry(enq);
    setEditNotes(enq.notes || "");
    setEditStatus(enq.status);
    setEditStaffId(enq.staffId || "");
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
        }),
      });

      if (res.ok) {
        const assignedStaff = staff.find((s) => s.id === editStaffId);
        setEnquiries(
          enquiries.map((e) =>
            e.id === selectedEnquiry.id
              ? {
                  ...e,
                  status: editStatus,
                  notes: editNotes,
                  staffId: editStaffId || null,
                  assignedTo: assignedStaff ? { id: assignedStaff.id, name: assignedStaff.name } : null,
                }
              : e
          )
        );
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Enquiries List Panel */}
        <div className="xl:col-span-2 space-y-4">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-crm-text-secondary crm-body-text font-semibold bg-crm-card/25 border border-crm-border/20 rounded-sm">
              <Loader2 size={24} className="animate-spin text-crm-gold-bright" />
              <span>Fetching client enquiries...</span>
            </div>
          ) : enquiries.length === 0 ? (
            <div className="py-24 text-center crm-body-text bg-crm-card/25 border border-dashed border-crm-border/20 rounded-sm">
              No enquiries active. All client submissions show up here automatically.
            </div>
          ) : (
            <div className="space-y-3">
              {enquiries.map((enq) => {
                const isActive = selectedEnquiry?.id === enq.id;
                const badgeClass = STATUS_BADGE_CLASS[enq.status] ?? STATUS_BADGE_CLASS.NEW;

                return (
                  <motion.div
                    key={enq.id}
                    layoutId={`card_${enq.id}`}
                    onClick={() => openDetails(enq)}
                    className={cn(
                      "flex items-center justify-between p-5 rounded-sm border cursor-pointer transition-all duration-300 bg-crm-card/25 hover:bg-crm-card/75",
                      isActive ? "border-crm-gold-bright/40" : "border-crm-border/20"
                    )}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-3">
                        <span className="crm-table-text font-semibold text-crm-text truncate">
                          {enq.customer.name}
                        </span>
                        <span className={cn("px-2 py-0.5 rounded-full border text-[11px] font-semibold tracking-wide uppercase", badgeClass)}>
                          {STATUS_LABEL[enq.status] ?? enq.status}
                        </span>
                        {enq.enquiryType === "Consultation" && (
                          <span className="px-2 py-0.5 rounded-full border border-crm-gold/30 bg-crm-gold/10 text-crm-gold text-[11px] font-semibold tracking-wide uppercase">
                            Consultation
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-crm-text-secondary">
                        <Building size={12} className="shrink-0" />
                        <span className="truncate">{enq.property.title}</span>
                      </div>
                      <p className="text-xs text-crm-text-secondary line-clamp-1 italic mt-1.5">
                        &ldquo;{enq.message}&rdquo;
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {enq.assignedTo && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-crm-gold">
                          <UserCheck size={11} />
                          {enq.assignedTo.name}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-crm-text-secondary">
                        {new Date(enq.createdAt).toLocaleDateString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <ChevronRight size={14} className="text-crm-text-secondary/40" />
                    </div>
                  </motion.div>
                );
              })}
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
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
