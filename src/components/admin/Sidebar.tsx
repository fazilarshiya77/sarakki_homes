"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Building,
  Tags,
  Hammer,
  MessageSquare,
  Users,
  Globe,
  FileText,
  Quote,
  UserCheck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Target,
  CheckSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Grouped, matching the operational shape of the CRM rather than a flat
// alphabetical list — overview, then the CRM's own workflow, then the
// property inventory, then the public site's content.
const NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "CRM",
    items: [
      { label: "Leads", href: "/admin/leads", icon: Target },
      { label: "Tasks", href: "/admin/tasks", icon: CheckSquare },
      { label: "Enquiries", href: "/admin/enquiries", icon: MessageSquare },
      { label: "Customers", href: "/admin/customers", icon: Users },
    ],
  },
  {
    label: "Inventory",
    items: [
      { label: "Properties", href: "/admin/properties", icon: Building },
      { label: "Categories", href: "/admin/categories", icon: Tags },
      { label: "Builders", href: "/admin/builders", icon: Hammer },
    ],
  },
  {
    label: "Website",
    items: [
      { label: "Website CMS", href: "/admin/cms", icon: Globe },
      { label: "Blog", href: "/admin/blog", icon: FileText },
      { label: "Testimonials", href: "/admin/testimonials", icon: Quote },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Users", href: "/admin/users", icon: UserCheck },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleLogout = () => {
    signOut({ callbackUrl: "/admin/login" });
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 260 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex h-screen shrink-0 flex-col bg-crm-espresso"
    >
      {/* Top Header */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-white/[0.06]">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col"
            >
              <span className="font-display text-sm tracking-[0.14em] uppercase text-crm-ivory font-bold">
                Sarakki Homes
              </span>
              <span className="text-[9px] uppercase tracking-[0.18em] text-crm-gold/80 mt-0.5 font-semibold">
                Enterprise CRM
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-white/10 bg-white/[0.03] text-white/50 hover:border-crm-gold/40 hover:text-crm-gold transition-colors duration-200"
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 scrollbar-thin">
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label} className={cn(gi > 0 && "mt-5")}>
            {!collapsed && (
              <p className="px-3.5 pb-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-sm px-3.5 py-2.5 text-[13px] tracking-wide transition-all duration-200",
                      isActive
                        ? "bg-white/[0.06] text-crm-ivory font-semibold"
                        : "text-white/50 font-medium hover:bg-white/[0.035] hover:text-white/85"
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="crmActiveIndicator"
                        className="absolute left-0 top-1.5 bottom-1.5 w-[2.5px] rounded-full bg-crm-gold"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <Icon
                      size={16}
                      strokeWidth={1.75}
                      className={cn(
                        "shrink-0 transition-colors duration-200",
                        isActive ? "text-crm-gold" : "text-white/40 group-hover:text-white/70"
                      )}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Profile and Logout */}
      <div className="p-3 border-t border-white/[0.06]">
        {!collapsed && session?.user && (
          <div className="mb-3 flex items-center gap-2.5 rounded-sm bg-white/[0.03] border border-white/[0.06] px-3.5 py-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-crm-gold/15 text-[10px] font-bold text-crm-gold">
              {session.user.name?.charAt(0) ?? "A"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-crm-ivory truncate">
                {session.user.name}
              </span>
              <span className="text-[9px] text-white/40 uppercase tracking-wide font-medium">
                {(session.user as any).role || "SALES_EXECUTIVE"}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="group flex w-full items-center gap-3 rounded-sm px-3.5 py-2.5 text-[13px] font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.06] transition-all duration-200"
        >
          <LogOut size={16} strokeWidth={1.75} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}
