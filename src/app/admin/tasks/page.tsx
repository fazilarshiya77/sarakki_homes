"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckSquare, Loader2, User, Calendar, Target } from "lucide-react";
import { PRIORITY_BADGE_CLASS, TASK_STATUSES, TASK_STATUS_BADGE_CLASS } from "@/lib/crm";
import { cn } from "@/lib/utils";

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  assignedTo: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
  createdAt: string;
  lead: { id: string; name: string } | null;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tasks");
      const data = await res.json();
      if (data.tasks) setTasks(data.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    try {
      await fetch(`/api/admin/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch (err) {
      console.error(err);
      fetchTasks();
    }
  };

  const filtered = useMemo(
    () => (statusFilter ? tasks.filter((t) => t.status === statusFilter) : tasks),
    [tasks, statusFilter]
  );

  const isOverdue = (task: TaskRow) =>
    task.dueDate && task.status !== "DONE" && new Date(task.dueDate) < new Date(new Date().toDateString());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wide text-crm-text flex items-center gap-2.5">
          <CheckSquare size={22} className="text-crm-gold" />
          Tasks
        </h1>
        <p className="text-xs text-crm-text-secondary mt-0.5">
          Every follow-up across every lead, in one place.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-sm border border-crm-border/20 bg-crm-card/25 p-3 w-fit">
        <button
          onClick={() => setStatusFilter("")}
          className={cn(
            "rounded-sm px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-colors",
            statusFilter === "" ? "bg-crm-gold text-black" : "text-crm-text-secondary hover:text-crm-text"
          )}
        >
          All ({tasks.length})
        </button>
        {TASK_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "rounded-sm px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-colors",
              statusFilter === s ? "bg-crm-gold text-black" : "text-crm-text-secondary hover:text-crm-text"
            )}
          >
            {s.replace(/_/g, " ")} ({tasks.filter((t) => t.status === s).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-crm-text-secondary text-xs font-semibold bg-crm-card/25 border border-crm-border/20 rounded-sm">
          <Loader2 size={24} className="animate-spin text-crm-gold-bright" />
          <span>Loading tasks...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center text-xs text-crm-text-secondary bg-crm-card/25 border border-dashed border-crm-border/20 rounded-sm">
          No tasks here. Add one from a lead&apos;s detail page.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((task) => (
            <div
              key={task.id}
              className={cn(
                "flex items-center justify-between gap-4 p-5 rounded-sm border bg-crm-card/25 transition-colors",
                isOverdue(task) ? "border-red-500/30" : "border-crm-border/20"
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-semibold text-crm-text truncate">{task.title}</span>
                  <span className={cn("px-2 py-0.5 rounded-full border text-[8px] font-semibold uppercase", PRIORITY_BADGE_CLASS[task.priority])}>
                    {task.priority}
                  </span>
                  {isOverdue(task) && (
                    <span className="px-2 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-[8px] font-semibold uppercase">
                      Overdue
                    </span>
                  )}
                </div>
                {task.description && (
                  <p className="mt-1.5 text-[11px] text-crm-text-secondary leading-relaxed">{task.description}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-crm-text-secondary">
                  {task.lead && (
                    <Link href={`/admin/leads/${task.lead.id}`} className="flex items-center gap-1.5 text-crm-gold hover:text-crm-gold-bright transition-colors">
                      <Target size={11} /> {task.lead.name}
                    </Link>
                  )}
                  {task.assignedTo && (
                    <span className="flex items-center gap-1.5"><User size={11} /> {task.assignedTo}</span>
                  )}
                  {task.dueDate && (
                    <span className="flex items-center gap-1.5">
                      <Calendar size={11} />
                      {new Date(task.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" })}
                    </span>
                  )}
                </div>
              </div>

              <select
                value={task.status}
                onChange={(e) => updateStatus(task.id, e.target.value)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-[9px] font-semibold uppercase outline-none cursor-pointer",
                  TASK_STATUS_BADGE_CLASS[task.status]
                )}
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
