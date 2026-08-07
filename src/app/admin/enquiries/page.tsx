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
  UserCheck,
  ClipboardList,
  ChevronRight,
  Loader2,
  X,
} from "lucide-react";

interface Enquiry {
  id: string;
  customerId: string;
  customer: { name: string; email: string; phone: string };
  property: { title: string; price: string; location: string };
  message: string;
  status: string;
  notes: string;
  createdAt: string;
  assignedTo?: { name: string };
}

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Notes and status editing state
  const [editNotes, setEditNotes] = useState("");
  const [editStatus, setEditStatus] = useState("");

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
  }, []);

  const openDetails = (enq: Enquiry) => {
    setSelectedEnquiry(enq);
    setEditNotes(enq.notes || "");
    setEditStatus(enq.status);
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
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update local state
        setEnquiries(
          enquiries.map((e) =>
            e.id === selectedEnquiry.id
              ? { ...e, status: editStatus, notes: editNotes }
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

  return (
    <div className="space-y-6 relative h-full">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-wide text-foreground">
          Enquiries & Leads
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Follow up with clients, log interaction history, and update lead statuses.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Enquiries List Panel */}
        <div className="xl:col-span-2 space-y-4">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-muted-foreground text-xs font-semibold bg-card/25 border border-border/20 rounded-sm">
              <Loader2 size={24} className="animate-spin text-accent-gold" />
              <span>Fetching client enquiries...</span>
            </div>
          ) : enquiries.length === 0 ? (
            <div className="py-24 text-center text-xs text-muted-foreground bg-card/25 border border-dashed border-border/20 rounded-sm">
              No enquiries active. All client submissions show up here automatically.
            </div>
          ) : (
            <div className="space-y-3">
              {enquiries.map((enq) => {
                const isActive = selectedEnquiry?.id === enq.id;
                let badgeClass = "bg-muted text-muted-foreground border-muted-foreground/10";
                if (enq.status === "NEW") badgeClass = "bg-red-500/10 text-red-400 border-red-500/20";
                if (enq.status === "CONTACTED") badgeClass = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                if (enq.status === "CONVERTED") badgeClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                if (enq.status === "CLOSED") badgeClass = "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";

                return (
                  <motion.div
                    key={enq.id}
                    layoutId={`card_${enq.id}`}
                    onClick={() => openDetails(enq)}
                    className={cn(
                      "flex items-center justify-between p-5 rounded-sm border cursor-pointer transition-all duration-300 bg-card/25 hover:bg-card/75",
                      isActive ? "border-accent-gold/40" : "border-border/20"
                    )}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-foreground truncate">
                          {enq.customer.name}
                        </span>
                        <span className={cn("px-2 py-0.5 rounded-full border text-[8px] font-semibold tracking-wide uppercase", badgeClass)}>
                          {enq.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Building size={12} className="shrink-0" />
                        <span className="truncate">{enq.property.title}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground/75 line-clamp-1 italic mt-1.5">
                        "{enq.message}"
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-[10px] font-semibold text-muted-foreground/45">
                        {new Date(enq.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <ChevronRight size={14} className="text-muted-foreground/40" />
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
              className="rounded-sm border border-border/20 bg-card/50 p-6 backdrop-blur-xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-border/20 pb-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    Lead Details
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    Update notes and contact details
                  </span>
                </div>
                <button
                  onClick={() => setSelectedEnquiry(null)}
                  className="p-1 hover:bg-surface text-muted-foreground hover:text-foreground rounded-sm transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Customer contact Info */}
              <div className="space-y-3.5 text-xs">
                <div className="flex items-center gap-3">
                  <User size={14} className="text-muted-foreground" />
                  <span className="font-semibold text-foreground">{selectedEnquiry.customer.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={14} className="text-muted-foreground" />
                  <a href={`tel:${selectedEnquiry.customer.phone}`} className="text-accent-gold-dark hover:text-accent-gold transition-colors font-medium">
                    {selectedEnquiry.customer.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={14} className="text-muted-foreground" />
                  <a href={`mailto:${selectedEnquiry.customer.email}`} className="text-accent-gold-dark hover:text-accent-gold transition-colors font-medium">
                    {selectedEnquiry.customer.email}
                  </a>
                </div>
                <div className="flex items-center gap-3 border-t border-border/20 pt-3">
                  <Building size={14} className="text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{selectedEnquiry.property.title}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">{selectedEnquiry.property.location} • {selectedEnquiry.property.price}</span>
                  </div>
                </div>
              </div>

              {/* Status and Notes Editing Form */}
              <div className="space-y-4 pt-4 border-t border-border/20">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Lead Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full rounded-sm border border-border/40 bg-background/40 py-2.5 px-3 text-xs text-muted-foreground outline-none focus:border-accent-gold/40 cursor-pointer"
                  >
                    <option value="NEW">New Lead</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="CONVERTED">Converted Client</option>
                    <option value="CLOSED">Closed/Not Interested</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Follow-up Notes
                  </label>
                  <textarea
                    rows={6}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Log client call details, appointment times, specific requests..."
                    className="w-full rounded-sm border border-border/40 bg-background/40 py-2.5 px-3.5 text-xs text-foreground outline-none focus:border-accent-gold/40 resize-none"
                  />
                </div>

                <button
                  onClick={handleUpdate}
                  disabled={savingId !== null}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-sm bg-gradient-to-r from-accent-gold-dark to-accent-gold py-2.5 text-xs font-semibold uppercase tracking-wider text-black transition-all duration-300 hover:brightness-110 disabled:opacity-50"
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
    </div>
  );
}

// Simple Helper function
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
