"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Star,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Loader2,
  Pin,
  Plus,
  StickyNote,
  CheckSquare,
  History,
  Check,
} from "lucide-react";
import {
  STAGES,
  STAGE_LABELS,
  STAGE_BADGE_CLASS,
  PRIORITIES,
  PRIORITY_BADGE_CLASS,
  TASK_STATUSES,
  TASK_STATUS_BADGE_CLASS,
  budgetRangeLabel,
} from "@/lib/crm";
import { cn } from "@/lib/utils";

interface LeadDetail {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  location: string | null;
  budgetMinLakh: number | null;
  budgetMaxLakh: number | null;
  propertyType: string | null;
  purpose: string;
  source: string;
  bedrooms: number | null;
  bathrooms: number | null;
  areaRequired: string | null;
  possession: string | null;
  priority: string;
  stage: string;
  favorite: boolean;
  wonDetails: string | null;
  lostReason: string | null;
  lastContact: string | null;
  createdAt: string;
  agent: { id: string; name: string } | null;
  notes: { id: string; author: string; content: string; pinned: boolean; createdAt: string }[];
  tasks: { id: string; title: string; description: string | null; status: string; priority: string; dueDate: string | null; assignedTo: string | null; createdAt: string }[];
  timeline: { id: string; type: string; title: string; description: string | null; author: string | null; createdAt: string }[];
}

type Tab = "notes" | "tasks" | "timeline";

const inputClass =
  "w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-2.5 px-3 text-xs text-crm-text outline-none focus:border-crm-gold-bright/40";
const labelClass = "text-[10px] font-semibold uppercase tracking-wider text-crm-text-secondary";

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("notes");
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", assignedTo: "", priority: "MEDIUM", dueDate: "" });
  const [savingTask, setSavingTask] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchLead = async () => {
    try {
      const res = await fetch(`/api/admin/leads/${id}`);
      const data = await res.json();
      if (data.lead) setLead(data.lead);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const patchLead = async (body: Record<string, unknown>) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.lead) await fetchLead();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const addNote = async () => {
    if (!noteText.trim()) return;
    setSavingNote(true);
    try {
      const res = await fetch(`/api/admin/leads/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: noteText }),
      });
      if (res.ok) {
        setNoteText("");
        await fetchLead();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNote(false);
    }
  };

  const addTask = async () => {
    if (!taskForm.title.trim()) return;
    setSavingTask(true);
    try {
      const res = await fetch(`/api/admin/leads/${id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskForm),
      });
      if (res.ok) {
        setTaskForm({ title: "", assignedTo: "", priority: "MEDIUM", dueDate: "" });
        await fetchLead();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingTask(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      await fetch(`/api/admin/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await fetchLead();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-crm-text-secondary text-xs font-semibold">
        <Loader2 size={24} className="animate-spin text-crm-gold-bright" />
        <span>Loading lead...</span>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="py-24 text-center text-xs text-crm-text-secondary">
        Lead not found.{" "}
        <Link href="/admin/leads" className="text-crm-gold hover:underline">
          Back to Leads
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/leads"
        className="inline-flex items-center gap-1.5 text-xs text-crm-text-secondary hover:text-crm-text transition-colors"
      >
        <ArrowLeft size={13} /> Back to Leads
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-wide text-crm-text">{lead.name}</h1>
            <button onClick={() => patchLead({ favorite: !lead.favorite })} disabled={updating}>
              <Star
                size={18}
                className={cn(
                  "transition-colors",
                  lead.favorite ? "fill-crm-gold-bright text-crm-gold-bright" : "text-crm-text-secondary hover:text-crm-gold-bright"
                )}
              />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={cn("px-2.5 py-1 rounded-full border text-[9px] font-semibold uppercase", STAGE_BADGE_CLASS[lead.stage as keyof typeof STAGE_BADGE_CLASS])}>
              {STAGE_LABELS[lead.stage as keyof typeof STAGE_LABELS] ?? lead.stage}
            </span>
            <span className={cn("px-2.5 py-1 rounded-full border text-[9px] font-semibold uppercase", PRIORITY_BADGE_CLASS[lead.priority])}>
              {lead.priority} Priority
            </span>
            <span className="text-[10px] text-crm-text-secondary">
              Added {new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>

        <select
          value={lead.stage}
          onChange={(e) => patchLead({ stage: e.target.value })}
          disabled={updating}
          className="rounded-sm border border-crm-gold-bright/40 bg-crm-bg/40 py-2.5 px-4 text-xs font-semibold text-crm-text outline-none cursor-pointer"
        >
          {STAGES.map((s) => (
            <option key={s} value={s}>{STAGE_LABELS[s]}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Left: contact + requirements */}
        <div className="xl:col-span-1 space-y-6">
          <div className="rounded-sm border border-crm-border/20 bg-crm-card/25 p-5 space-y-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-crm-text-secondary mb-1">Contact</p>
            <a href={`tel:${lead.phone}`} className="flex items-center gap-3 text-xs text-crm-gold hover:text-crm-gold-bright transition-colors">
              <Phone size={14} /> {lead.phone}
            </a>
            {lead.email && (
              <a href={`mailto:${lead.email}`} className="flex items-center gap-3 text-xs text-crm-gold hover:text-crm-gold-bright transition-colors">
                <Mail size={14} /> {lead.email}
              </a>
            )}
            {lead.location && (
              <div className="flex items-center gap-3 text-xs text-crm-text">
                <MapPin size={14} className="text-crm-text-secondary" /> {lead.location}
              </div>
            )}
            <div className="flex gap-2 pt-2 border-t border-crm-border/20">
              <a
                href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-sm border border-crm-border/40 py-2 text-[10px] font-semibold uppercase tracking-wider text-crm-text-secondary hover:border-crm-gold-bright/40 hover:text-crm-text transition-colors"
              >
                <MessageCircle size={12} /> WhatsApp
              </a>
              <button
                onClick={() => patchLead({ markContacted: true })}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-sm border border-crm-border/40 py-2 text-[10px] font-semibold uppercase tracking-wider text-crm-text-secondary hover:border-crm-gold-bright/40 hover:text-crm-text transition-colors"
              >
                <Check size={12} /> Mark Contacted
              </button>
            </div>
            {lead.lastContact && (
              <p className="text-[10px] text-crm-text-secondary/70">
                Last contacted {new Date(lead.lastContact).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </p>
            )}
          </div>

          <div className="rounded-sm border border-crm-border/20 bg-crm-card/25 p-5 space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-crm-text-secondary mb-1">Requirement</p>
            <DetailRow label="Budget" value={budgetRangeLabel(lead.budgetMinLakh, lead.budgetMaxLakh)} />
            <DetailRow label="Property Type" value={lead.propertyType || "Not specified"} />
            <DetailRow label="Purpose" value={lead.purpose} />
            <DetailRow label="Bedrooms" value={lead.bedrooms ? `${lead.bedrooms} BHK` : "Not specified"} />
            <DetailRow label="Area Required" value={lead.areaRequired || "Not specified"} />
            <DetailRow label="Possession" value={lead.possession || "Not specified"} />
            <DetailRow label="Source" value={lead.source} />
            {lead.agent && <DetailRow label="Assigned Agent" value={lead.agent.name} />}
          </div>

          {(lead.stage === "WON" || lead.stage === "LOST") && (
            <div className="rounded-sm border border-crm-border/20 bg-crm-card/25 p-5 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-crm-text-secondary">
                {lead.stage === "WON" ? "Win Details" : "Loss Reason"}
              </p>
              <textarea
                rows={3}
                defaultValue={lead.stage === "WON" ? lead.wonDetails ?? "" : lead.lostReason ?? ""}
                onBlur={(e) =>
                  patchLead(
                    lead.stage === "WON"
                      ? { wonDetails: e.target.value }
                      : { lostReason: e.target.value }
                  )
                }
                placeholder={lead.stage === "WON" ? "Deal value, property closed, commission..." : "Why this lead was lost..."}
                className={cn(inputClass, "resize-none")}
              />
            </div>
          )}
        </div>

        {/* Right: tabs */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center gap-1 rounded-sm border border-crm-border/20 bg-crm-card/25 p-1 w-fit">
            <TabButton active={tab === "notes"} onClick={() => setTab("notes")} icon={StickyNote} label={`Notes (${lead.notes.length})`} />
            <TabButton active={tab === "tasks"} onClick={() => setTab("tasks")} icon={CheckSquare} label={`Tasks (${lead.tasks.length})`} />
            <TabButton active={tab === "timeline"} onClick={() => setTab("timeline")} icon={History} label="Timeline" />
          </div>

          {tab === "notes" && (
            <div className="space-y-3">
              <div className="rounded-sm border border-crm-border/20 bg-crm-card/25 p-4 space-y-2.5">
                <textarea
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Log a call, site visit outcome, or client preference..."
                  className={cn(inputClass, "resize-none")}
                />
                <button
                  onClick={addNote}
                  disabled={savingNote || !noteText.trim()}
                  className="inline-flex items-center gap-1.5 rounded-sm bg-crm-gold px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-black hover:brightness-110 disabled:opacity-50 transition-all"
                >
                  {savingNote ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Add Note
                </button>
              </div>

              {lead.notes.length === 0 ? (
                <EmptyState text="No notes yet." />
              ) : (
                lead.notes.map((note) => (
                  <div key={note.id} className="rounded-sm border border-crm-border/20 bg-crm-card/25 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-crm-text flex items-center gap-1.5">
                        {note.pinned && <Pin size={11} className="text-crm-gold-bright" />}
                        {note.author}
                      </span>
                      <span className="text-[10px] text-crm-text-secondary/60">
                        {new Date(note.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-crm-text-secondary leading-relaxed">{note.content}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "tasks" && (
            <div className="space-y-3">
              <div className="rounded-sm border border-crm-border/20 bg-crm-card/25 p-4 space-y-2.5">
                <input
                  value={taskForm.title}
                  onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Task title — e.g. Call to confirm site visit"
                  className={inputClass}
                />
                <div className="grid grid-cols-3 gap-2.5">
                  <input
                    value={taskForm.assignedTo}
                    onChange={(e) => setTaskForm((f) => ({ ...f, assignedTo: e.target.value }))}
                    placeholder="Assigned to"
                    className={inputClass}
                  />
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm((f) => ({ ...f, priority: e.target.value }))}
                    className={inputClass}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm((f) => ({ ...f, dueDate: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <button
                  onClick={addTask}
                  disabled={savingTask || !taskForm.title.trim()}
                  className="inline-flex items-center gap-1.5 rounded-sm bg-crm-gold px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-black hover:brightness-110 disabled:opacity-50 transition-all"
                >
                  {savingTask ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Add Task
                </button>
              </div>

              {lead.tasks.length === 0 ? (
                <EmptyState text="No tasks yet." />
              ) : (
                lead.tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between rounded-sm border border-crm-border/20 bg-crm-card/25 p-4">
                    <div className="min-w-0 flex-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-crm-text truncate">{task.title}</span>
                        <span className={cn("px-2 py-0.5 rounded-full border text-[8px] font-semibold uppercase", PRIORITY_BADGE_CLASS[task.priority])}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-[10px] text-crm-text-secondary">
                        {task.assignedTo && <span>{task.assignedTo}</span>}
                        {task.dueDate && (
                          <span>Due {new Date(task.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                        )}
                      </div>
                    </div>
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                      className={cn(
                        "shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase outline-none cursor-pointer",
                        TASK_STATUS_BADGE_CLASS[task.status]
                      )}
                    >
                      {TASK_STATUSES.map((s) => (
                        <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "timeline" && (
            <div className="space-y-3">
              {lead.timeline.length === 0 ? (
                <EmptyState text="No activity yet." />
              ) : (
                <div className="relative pl-5">
                  <div className="absolute left-[3px] top-1 bottom-1 w-px bg-border/40" />
                  {lead.timeline.map((entry) => (
                    <div key={entry.id} className="relative pb-5">
                      <span className="absolute -left-5 top-1 h-2 w-2 rounded-full bg-crm-gold-bright" />
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-crm-text">{entry.title}</span>
                        <span className="text-[10px] text-crm-text-secondary/60">
                          {new Date(entry.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      {entry.description && (
                        <p className="mt-1 text-[11px] text-crm-text-secondary leading-relaxed">{entry.description}</p>
                      )}
                      {entry.author && <p className="mt-0.5 text-[10px] text-crm-text-secondary/50">by {entry.author}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-crm-text-secondary">{label}</span>
      <span className="font-medium text-crm-text">{value}</span>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-sm px-3.5 py-2 text-[11px] font-semibold transition-colors relative",
        active ? "text-black" : "text-crm-text-secondary hover:text-crm-text"
      )}
    >
      {active && (
        <motion.div
          layoutId="leadTabActive"
          className="absolute inset-0 rounded-sm bg-crm-gold"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
      <Icon size={13} className="relative z-10" />
      <span className="relative z-10">{label}</span>
    </button>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-12 text-center text-xs text-crm-text-secondary bg-crm-card/25 border border-dashed border-crm-border/20 rounded-sm">
      {text}
    </div>
  );
}
