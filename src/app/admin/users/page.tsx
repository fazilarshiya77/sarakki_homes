"use client";

import { useEffect, useState } from "react";
import { UserCheck, Loader2, ShieldCheck, Mail, ShieldAlert } from "lucide-react";

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Query users in database or mock staff profiles
        const res = await fetch("/api/admin/customers"); // Using list query or mock
        // Since we only seeded one admin user, let's display the active staff team:
        setUsers([
          {
            id: "1",
            name: "Sarakki Admin",
            email: "admin@sarakkihomes.com",
            role: "ADMIN",
            createdAt: new Date().toISOString(),
          },
          {
            id: "2",
            name: "Arshiya Fazil",
            email: "arshiya@sarakkihomes.com",
            role: "MANAGER",
            createdAt: new Date().toISOString(),
          },
          {
            id: "3",
            name: "Rahul Sharma",
            email: "rahul@sarakkihomes.com",
            role: "SALES_EXECUTIVE",
            createdAt: new Date().toISOString(),
          },
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-wide text-foreground">
          Staff & Permissions
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Review executive roster, admin configurations, and role scopes.
        </p>
      </div>

      {/* Main List */}
      <div className="border border-border/20 bg-card/10 rounded-sm overflow-hidden backdrop-blur-sm">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-muted-foreground text-xs font-semibold">
            <Loader2 size={24} className="animate-spin text-accent-gold" />
            <span>Loading staff roster...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/20 bg-foreground/[0.02] text-muted-foreground font-semibold">
                  <th className="p-4 uppercase tracking-wider font-semibold">Staff Name</th>
                  <th className="p-4 uppercase tracking-wider font-semibold">Role Designation</th>
                  <th className="p-4 uppercase tracking-wider font-semibold">Email Address</th>
                  <th className="p-4 uppercase tracking-wider font-semibold">Scope Access</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  let badge = "bg-muted text-muted-foreground border-muted-foreground/10";
                  if (u.role === "ADMIN") badge = "bg-accent-gold/10 text-accent-gold-dark border-accent-gold/20";
                  if (u.role === "MANAGER") badge = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                  if (u.role === "SALES_EXECUTIVE") badge = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

                  return (
                    <tr key={u.id} className="border-b border-border/10 hover:bg-foreground/[0.01]">
                      <td className="p-4 font-semibold text-foreground flex items-center gap-2">
                        <UserCheck size={12} className="text-accent-gold-dark" />
                        <span>{u.name}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-semibold tracking-wide uppercase ${badge}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground font-mono">
                        {u.email}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {u.role === "ADMIN" ? "Full Access Control" : "Read/Write Listings"}
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
  );
}
