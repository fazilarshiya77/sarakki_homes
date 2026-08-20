"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Target,
  Plus,
  Search,
  LayoutGrid,
  List as ListIcon,
  Star,
  Phone,
  MapPin,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { AddLeadModal } from "@/components/admin/AddLeadModal";
import {
  STAGES,
  STAGE_LABELS,
  STAGE_BADGE_CLASS,
  PRIORITY_BADGE_CLASS,
  budgetRangeLabel,
} from "@/lib/crm";
import { cn } from "@/lib/utils";

interface LeadRow {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  location: string | null;
  budgetMinLakh: number | null;
  budgetMaxLakh: number | null;
  propertyType: string | null;
  priority: string;
  stage: string;
  favorite: boolean;
  source: string;
  createdAt: string;
  agent: { id: string; name: string } | null;
  tasks: { id: string; status: string }[];
}

type ViewMode = "list" | "kanban";

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("kanban");
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/leads");
      const data = await res.json();
      if (data.leads) setLeads(data.leads);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (stageFilter && l.stage !== stageFilter) return false;
      if (priorityFilter && l.priority !== priorityFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${l.name} ${l.phone} ${l.email ?? ""} ${l.location ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [leads, search, stageFilter, priorityFilter]);

  const grouped = useMemo(() => {
    const map: Record<string, LeadRow[]> = {};
    for (const stage of STAGES) map[stage] = [];
    for (const lead of filtered) {
      (map[lead.stage] ??= []).push(lead);
    }
    return map;
  }, [filtered]);

  const updateStage = async (id: string, stage: string) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, stage } : l)));
    try {
      await fetch(`/api/admin/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });
    } catch (err) {
      console.error(err);
      fetchLeads();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-wide text-crm-text flex items-center gap-2.5">
            <Target size={22} className="text-crm-gold" />
            Leads Pipeline
          </h1>
          <p className="text-xs text-crm-text-secondary mt-0.5">
            Track every enquiry from first contact through to a closed deal.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-sm bg-gradient-to-r from-crm-gold to-crm-gold-bright px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black transition-all duration-300 hover:brightness-110"
        >
          <Plus size={14} /> Add Lead
        </button>
      </div>

      {/* Filters + View toggle */}
      <div className="flex flex-wrap items-center gap-3 rounded-sm border border-crm-border/20 bg-crm-card/25 p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-crm-text-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, email, location..."
            className="w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-2.5 pl-9 pr-3 text-xs text-crm-text outline-none focus:border-crm-gold-bright/40"
          />
        </div>

        {view === "list" && (
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="rounded-sm border border-crm-border/40 bg-crm-bg/40 py-2.5 px-3 text-xs text-crm-text-secondary outline-none focus:border-crm-gold-bright/40 cursor-pointer"
          >
            <option value="">All Stages</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>{STAGE_LABELS[s]}</option>
            ))}
          </select>
        )}

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-sm border border-crm-border/40 bg-crm-bg/40 py-2.5 px-3 text-xs text-crm-text-secondary outline-none focus:border-crm-gold-bright/40 cursor-pointer"
        >
          <option value="">All Priorities</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <div className="ml-auto flex items-center gap-1 rounded-sm border border-crm-border/40 p-1">
          <button
            onClick={() => setView("kanban")}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-sm transition-colors",
              view === "kanban" ? "bg-crm-gold text-black" : "text-crm-text-secondary hover:text-crm-text"
            )}
            aria-label="Kanban view"
          >
            <LayoutGrid size={14} />
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-sm transition-colors",
              view === "list" ? "bg-crm-gold text-black" : "text-crm-text-secondary hover:text-crm-text"
            )}
            aria-label="List view"
          >
            <ListIcon size={14} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-crm-text-secondary text-xs font-semibold bg-crm-card/25 border border-crm-border/20 rounded-sm">
          <Loader2 size={24} className="animate-spin text-crm-gold-bright" />
          <span>Loading leads...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center text-xs text-crm-text-secondary bg-crm-card/25 border border-dashed border-crm-border/20 rounded-sm">
          No leads match those filters yet.
        </div>
      ) : view === "kanban" ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => (
            <div
              key={stage}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverStage(stage);
              }}
              onDragLeave={() => setDragOverStage((s) => (s === stage ? null : s))}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/lead-id");
                if (id) updateStage(id, stage);
                setDragOverStage(null);
              }}
              className={cn(
                "flex w-72 shrink-0 flex-col rounded-sm border bg-crm-card/20 transition-colors",
                dragOverStage === stage ? "border-crm-gold-bright/50 bg-crm-gold-bright/5" : "border-crm-border/20"
              )}
            >
              <div className="flex items-center justify-between border-b border-crm-border/20 px-4 py-3">
                <span className="text-xs font-semibold text-crm-text">{STAGE_LABELS[stage]}</span>
                <span className="text-[10px] font-semibold text-crm-text-secondary/60">
                  {grouped[stage]?.length ?? 0}
                </span>
              </div>
              <div className="flex flex-col gap-2.5 p-3 min-h-[80px]">
                {grouped[stage]?.map((lead) => (
                  <motion.div
                    key={lead.id}
                    layoutId={`lead_${lead.id}`}
                    draggable
                    onDragStart={(e: any) => e.dataTransfer.setData("text/lead-id", lead.id)}
                    className="cursor-grab rounded-sm border border-crm-border/20 bg-crm-card p-3.5 shadow-sm hover:border-crm-gold-bright/30 active:cursor-grabbing transition-colors"
                  >
                    <Link href={`/admin/leads/${lead.id}`} className="block">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-crm-text truncate">{lead.name}</span>
                        {lead.favorite && <Star size={12} className="shrink-0 fill-crm-gold-bright text-crm-gold-bright" />}
                      </div>
                      <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-crm-text-secondary">
                        <Phone size={10} className="shrink-0" />
                        <span className="truncate">{lead.phone}</span>
                      </div>
                      {lead.location && (
                        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-crm-text-secondary">
                          <MapPin size={10} className="shrink-0" />
                          <span className="truncate">{lead.location}</span>
                        </div>
                      )}
                      <div className="mt-2.5 flex items-center justify-between">
                        <span className={cn("px-2 py-0.5 rounded-full border text-[8px] font-semibold uppercase", PRIORITY_BADGE_CLASS[lead.priority])}>
                          {lead.priority}
                        </span>
                        <span className="text-[9px] text-crm-text-secondary/60">{budgetRangeLabel(lead.budgetMinLakh, lead.budgetMaxLakh)}</span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((lead) => (
            <Link
              key={lead.id}
              href={`/admin/leads/${lead.id}`}
              className="flex items-center justify-between p-5 rounded-sm border border-crm-border/20 bg-crm-card/25 hover:bg-crm-card/75 transition-all duration-300"
            >
              <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-crm-text truncate">{lead.name}</span>
                  {lead.favorite && <Star size={12} className="fill-crm-gold-bright text-crm-gold-bright shrink-0" />}
                  <span className={cn("px-2 py-0.5 rounded-full border text-[8px] font-semibold uppercase", STAGE_BADGE_CLASS[lead.stage as keyof typeof STAGE_BADGE_CLASS])}>
                    {STAGE_LABELS[lead.stage as keyof typeof STAGE_LABELS] ?? lead.stage}
                  </span>
                  <span className={cn("px-2 py-0.5 rounded-full border text-[8px] font-semibold uppercase", PRIORITY_BADGE_CLASS[lead.priority])}>
                    {lead.priority}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-crm-text-secondary">
                  <span className="flex items-center gap-1.5"><Phone size={11} />{lead.phone}</span>
                  {lead.location && <span className="flex items-center gap-1.5"><MapPin size={11} />{lead.location}</span>}
                  <span>{budgetRangeLabel(lead.budgetMinLakh, lead.budgetMaxLakh)}</span>
                  <span>{lead.propertyType || "Any type"}</span>
                  {lead.agent && <span>Agent: {lead.agent.name}</span>}
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-[10px] font-semibold text-crm-text-secondary/45">
                  {new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" })}
                </span>
                <ChevronRight size={14} className="text-crm-text-secondary/40" />
              </div>
            </Link>
          ))}
        </div>
      )}

      <AddLeadModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={fetchLeads} />
    </div>
  );
}
