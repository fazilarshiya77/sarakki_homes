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
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Properties", href: "/admin/properties", icon: Building },
  { label: "Categories", href: "/admin/categories", icon: Tags },
  { label: "Builders", href: "/admin/builders", icon: Hammer },
  { label: "Enquiries", href: "/admin/enquiries", icon: MessageSquare },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Website CMS", href: "/admin/cms", icon: Globe },
  { label: "Blog", href: "/admin/blog", icon: FileText },
  { label: "Testimonials", href: "/admin/testimonials", icon: Quote },
  { label: "Users", href: "/admin/users", icon: UserCheck },
  { label: "Settings", href: "/admin/settings", icon: Settings },
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
      className="relative flex h-screen flex-col border-r border-border/40 bg-card/45 backdrop-blur-xl shrink-0"
    >
      {/* Top Header */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-border/20">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col"
            >
              <span className="font-display text-sm tracking-[0.12em] uppercase text-accent-gold-dark font-semibold">
                Sarakki Homes
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Enterprise CRM
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-7 w-7 items-center justify-center rounded-sm border border-border/40 bg-background/50 hover:bg-surface text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1.5 scrollbar-thin">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3.5 rounded-sm px-3.5 py-3 text-sm font-medium tracking-wide transition-all duration-300 relative",
                isActive
                  ? "bg-foreground/5 text-foreground"
                  : "text-muted-foreground hover:bg-foreground/[0.02] hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-accent-gold rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                size={18}
                className={cn(
                  "shrink-0 transition-colors duration-300",
                  isActive ? "text-accent-gold-dark" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="truncate"
                >
                  {item.label}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile and Logout */}
      <div className="p-3 border-t border-border/20 bg-background/20">
        {!collapsed && session?.user && (
          <div className="mb-4 px-3.5 py-2.5 rounded-sm bg-surface/50 border border-border/20 flex flex-col">
            <span className="text-xs font-semibold text-foreground truncate">
              {session.user.name}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5 font-medium">
              {(session.user as any).role || "SALES_EXECUTIVE"}
            </span>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={cn(
            "group flex w-full items-center gap-3.5 rounded-sm px-3.5 py-3 text-sm font-medium text-red-600/80 hover:text-red-600 hover:bg-red-500/5 transition-all duration-300"
          )}
        >
          <LogOut size={18} className="shrink-0 text-red-600/70 group-hover:text-red-600" />
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              Logout
            </motion.span>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
