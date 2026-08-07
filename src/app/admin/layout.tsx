"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground font-body">
      {/* Collapsible Sidebar */}
      <Sidebar />

      {/* Main Panel */}
      <div className="flex flex-1 flex-col overflow-hidden bg-background">
        {/* Top Header Bar */}
        <header className="flex h-16 items-center justify-between border-b border-border/20 px-8 bg-card/25 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground tracking-wide font-medium">CRM</span>
            <span className="text-xs text-muted-foreground/40">/</span>
            <span className="text-xs font-semibold text-accent-gold-dark uppercase tracking-wider">Console</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
              Live Database Mode
            </span>
          </div>
        </header>

        {/* Content Render Outlet */}
        <main className="flex-1 overflow-y-auto p-8 scrollbar-thin">
          <div className="mx-auto max-w-7xl space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
