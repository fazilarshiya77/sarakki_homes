"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  UserCheck,
  UserPlus,
  Pencil,
  Trash2,
  X,
  Check,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "MANAGER", label: "Manager" },
  { value: "SALES_EXECUTIVE", label: "Sales Executive" },
  { value: "CONTENT_MANAGER", label: "Content Manager" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function roleBadge(role: string) {
  if (role === "ADMIN") return "bg-crm-gold-bright/10 text-crm-gold border-crm-gold-bright/20";
  if (role === "MANAGER") return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  if (role === "SALES_EXECUTIVE") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  if (role === "CONTENT_MANAGER") return "bg-purple-500/10 text-purple-400 border-purple-500/20";
  return "bg-muted text-crm-text-secondary border-muted-foreground/10";
}

function roleLabel(role: string) {
  return ROLE_OPTIONS.find((r) => r.value === role)?.label ?? role;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
}

const inputClass =
  "w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-3 px-4 text-[15px] text-crm-text outline-none focus:border-crm-gold-bright/40";
const selectClass =
  "w-full rounded-sm border border-crm-border/40 bg-crm-bg/40 py-3 px-4 text-[15px] text-crm-text-secondary outline-none focus:border-crm-gold-bright/40 cursor-pointer";
const labelClass = "crm-label uppercase tracking-wider text-crm-text-secondary";

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Create form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("SALES_EXECUTIVE");
  const [submitting, setSubmitting] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState("SALES_EXECUTIVE");
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // `showSpinner` is false for the initial mount fetch: `loading` already
  // starts true, and calling setState synchronously inside the effect body
  // would trigger a cascading render (react-hooks/set-state-in-effect).
  const fetchStaff = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await fetch("/api/admin/staff");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to load the staff roster.");
        setStaff([]);
      } else {
        setStaff(data.staff || []);
      }
    } catch {
      setError("Network error while loading the staff roster.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchStaff(false);
  }, []);

  const flashSuccess = (msg: string) => {
    setError(null);
    setSuccess(msg);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) return setError("Name is required.");
    if (!EMAIL_RE.test(email.trim())) return setError("Enter a valid email address.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not add this staff member.");
      } else {
        setName("");
        setEmail("");
        setPassword("");
        setRole("SALES_EXECUTIVE");
        flashSuccess(`${data.staff?.name || "Staff member"} was added to the roster.`);
        fetchStaff();
      }
    } catch {
      setError("Network error while adding the staff member.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (member: StaffMember) => {
    setConfirmDeleteId(null);
    setError(null);
    setSuccess(null);
    setEditingId(member.id);
    setEditName(member.name);
    setEditEmail(member.email);
    setEditPassword("");
    setEditRole(member.role);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditPassword("");
  };

  const handleUpdate = async (id: string) => {
    setError(null);
    setSuccess(null);

    if (!editName.trim()) return setError("Name is required.");
    if (!EMAIL_RE.test(editEmail.trim())) return setError("Enter a valid email address.");
    if (editPassword && editPassword.length < 8)
      return setError("Password must be at least 8 characters.");

    setSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/staff/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          email: editEmail.trim(),
          role: editRole,
          ...(editPassword ? { password: editPassword } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not update this staff member.");
      } else {
        setEditingId(null);
        setEditPassword("");
        flashSuccess(`${data.staff?.name || "Staff member"} was updated.`);
        fetchStaff();
      }
    } catch {
      setError("Network error while updating the staff member.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    setSuccess(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/staff/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not remove this staff member.");
      } else {
        flashSuccess("Staff member removed from the roster.");
        fetchStaff();
      }
    } catch {
      setError("Network error while removing the staff member.");
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="crm-page-title tracking-wide text-crm-text">
          Staff Management
        </h1>
        <p className="crm-body-text text-crm-text-secondary mt-0.5">
          Create, edit, and remove staff accounts and their role permissions. Admin access only.
        </p>
      </div>

      {/* Feedback banners */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-sm border border-red-500/25 bg-red-500/[0.07] px-4 py-3 text-sm text-red-300">
          <AlertTriangle size={14} className="mt-px shrink-0 text-red-400" />
          <span className="leading-relaxed">{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto shrink-0 text-red-400/70 transition-colors hover:text-red-300"
            aria-label="Dismiss error"
          >
            <X size={13} />
          </button>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2.5 rounded-sm border border-emerald-500/25 bg-emerald-500/[0.07] px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 size={14} className="mt-px shrink-0 text-emerald-400" />
          <span className="leading-relaxed">{success}</span>
          <button
            type="button"
            onClick={() => setSuccess(null)}
            className="ml-auto shrink-0 text-emerald-400/70 transition-colors hover:text-emerald-300"
            aria-label="Dismiss message"
          >
            <X size={13} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Roster */}
        <div className="lg:col-span-2">
          <div className="border border-crm-border/20 bg-crm-card/10 rounded-sm overflow-hidden backdrop-blur-sm">
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3 text-crm-text-secondary crm-body-text font-semibold">
                <Loader2 size={24} className="animate-spin text-crm-gold-bright" />
                <span>Loading staff roster...</span>
              </div>
            ) : staff.length === 0 ? (
              <div className="py-24 text-center crm-body-text text-crm-text-secondary">
                No staff accounts yet. Use the form to add your first team member.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse crm-table-text">
                  <thead>
                    <tr className="border-b border-crm-border/20 bg-foreground/[0.02] text-crm-text-secondary font-semibold">
                      <th className="p-4 uppercase tracking-wider font-semibold">Staff Name</th>
                      <th className="p-4 uppercase tracking-wider font-semibold">Email Address</th>
                      <th className="p-4 uppercase tracking-wider font-semibold">Role</th>
                      <th className="p-4 uppercase tracking-wider font-semibold">Joined</th>
                      <th className="p-4 uppercase tracking-wider font-semibold text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((m) => {
                      const isEditing = editingId === m.id;
                      const isConfirming = confirmDeleteId === m.id;

                      if (isEditing) {
                        return (
                          <tr key={m.id} className="border-b border-crm-border/10 bg-foreground/[0.02]">
                            <td colSpan={5} className="p-5">
                              <div className="space-y-4">
                                <span className="crm-section-heading uppercase tracking-wider text-crm-gold">
                                  Editing {m.name}
                                </span>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-1.5">
                                    <label className={labelClass}>Full Name</label>
                                    <input
                                      type="text"
                                      value={editName}
                                      onChange={(e) => setEditName(e.target.value)}
                                      className={inputClass}
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className={labelClass}>Email Address</label>
                                    <input
                                      type="email"
                                      value={editEmail}
                                      onChange={(e) => setEditEmail(e.target.value)}
                                      className={inputClass}
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className={labelClass}>Role</label>
                                    <select
                                      value={editRole}
                                      onChange={(e) => setEditRole(e.target.value)}
                                      className={selectClass}
                                    >
                                      {ROLE_OPTIONS.map((r) => (
                                        <option key={r.value} value={r.value}>
                                          {r.label}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className={labelClass}>New Password</label>
                                    <input
                                      type="password"
                                      value={editPassword}
                                      onChange={(e) => setEditPassword(e.target.value)}
                                      placeholder="Leave blank to keep current"
                                      className={inputClass}
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center gap-2.5">
                                  <button
                                    type="button"
                                    disabled={savingEdit}
                                    onClick={() => handleUpdate(m.id)}
                                    className="inline-flex items-center gap-2 rounded-sm bg-gradient-to-r from-crm-gold to-crm-gold-bright py-2 px-4 text-xs font-semibold uppercase tracking-wider text-black transition-all duration-300 hover:brightness-110 disabled:opacity-50"
                                  >
                                    {savingEdit ? (
                                      <Loader2 size={12} className="animate-spin" />
                                    ) : (
                                      <Check size={12} />
                                    )}
                                    <span>Save Changes</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="inline-flex items-center gap-2 rounded-sm border border-crm-border/40 py-2 px-4 text-xs font-semibold uppercase tracking-wider text-crm-text-secondary transition-colors hover:text-crm-text"
                                  >
                                    <X size={12} />
                                    <span>Cancel</span>
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr
                          key={m.id}
                          className="border-b border-crm-border/10 hover:bg-foreground/[0.01] align-middle"
                        >
                          <td className="p-4 font-semibold text-crm-text">
                            <span className="flex items-center gap-2">
                              <UserCheck size={12} className="text-crm-gold" />
                              {m.name}
                            </span>
                          </td>
                          <td className="p-4 text-crm-text-secondary font-mono">{m.email}</td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold tracking-wide uppercase ${roleBadge(
                                m.role
                              )}`}
                            >
                              {roleLabel(m.role)}
                            </span>
                          </td>
                          <td className="p-4 text-crm-text-secondary">{formatDate(m.createdAt)}</td>
                          <td className="p-4">
                            {isConfirming ? (
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-xs text-crm-text-secondary">
                                  Remove permanently?
                                </span>
                                <button
                                  type="button"
                                  disabled={deleting}
                                  onClick={() => handleDelete(m.id)}
                                  className="inline-flex items-center gap-1.5 rounded-sm border border-red-500/30 bg-red-500/10 py-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-red-300 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                                >
                                  {deleting ? (
                                    <Loader2 size={11} className="animate-spin" />
                                  ) : (
                                    <Check size={11} />
                                  )}
                                  <span>Confirm</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="inline-flex items-center gap-1.5 rounded-sm border border-crm-border/40 py-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-crm-text-secondary transition-colors hover:text-crm-text"
                                >
                                  <X size={11} />
                                  <span>Cancel</span>
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => startEdit(m)}
                                  className="inline-flex items-center gap-1.5 rounded-sm border border-crm-border/30 py-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-crm-text-secondary transition-colors hover:border-crm-gold-bright/40 hover:text-crm-gold"
                                >
                                  <Pencil size={11} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingId(null);
                                    setConfirmDeleteId(m.id);
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-sm border border-crm-border/30 py-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-crm-text-secondary transition-colors hover:border-red-500/40 hover:text-red-300"
                                >
                                  <Trash2 size={11} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Add Staff form */}
        <div className="rounded-sm border border-crm-border/20 bg-crm-card/25 p-6 backdrop-blur-md space-y-4">
          <div>
            <span className="crm-section-heading uppercase tracking-wider text-crm-text-secondary">
              Add Staff
            </span>
            <p className="text-xs text-crm-text-secondary mt-0.5">
              Create a new account and assign its role scope.
            </p>
          </div>

          <form onSubmit={handleCreate} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label className={labelClass}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Arshiya Fazil"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. arshiya@sarakkihomes.com"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className={inputClass}
              />
              <p className="text-xs text-crm-text-secondary/70">
                Shared with the staff member privately &mdash; they can change it later.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={selectClass}
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-crm-text-secondary/70">
                Only admins can manage staff accounts.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-sm bg-gradient-to-r from-crm-gold to-crm-gold-bright py-2.5 text-sm font-semibold uppercase tracking-wider text-black transition-all duration-300 hover:brightness-110 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  <UserPlus size={14} />
                  <span>Add Staff Member</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
