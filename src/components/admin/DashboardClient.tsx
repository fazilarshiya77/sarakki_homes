"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Building2,
  TrendingUp,
  MessageSquare,
  Users,
  Eye,
  Plus,
  ArrowUpRight,
  Sparkles,
  Activity,
  ChevronRight,
  FileCheck,
} from "lucide-react";

interface DashboardClientProps {
  stats: {
    totalProperties: number;
    featuredProperties: number;
    bankAuctions: number;
    resale: number;
    rentalIncome: number;
    chanceDeals: number;
    upcoming: number;
    readyToMove: number;
    totalEnquiries: number;
    todayEnquiries: number;
    views: number;
  };
  recentEnquiries: Array<{
    id: string;
    customer: { name: string; email: string; phone: string };
    property: { title: string };
    message: string;
    createdAt: string;
  }>;
}

export function DashboardClient({ stats, recentEnquiries }: DashboardClientProps) {
  // Static monthly analytics for custom SVG chart
  const monthlyData = [
    { month: "Jan", views: 240, enquiries: 12 },
    { month: "Feb", views: 360, enquiries: 19 },
    { month: "Mar", views: 480, enquiries: 24 },
    { month: "Apr", views: 600, enquiries: 35 },
    { month: "May", views: 800, enquiries: 48 },
    { month: "Jun", views: 950, enquiries: 62 },
  ];

  const maxViews = Math.max(...monthlyData.map((d) => d.views));

  return (
    <div className="space-y-10">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-wide text-crm-text">
            Overview
          </h1>
          <p className="text-sm text-crm-text-secondary mt-1">
            Welcome back. Sarakki Homes database is synchronized and active.
          </p>
        </div>

        <Link href="/admin/properties/create" className="crm-btn-gold">
          <Plus size={14} />
          <span>New Property</span>
        </Link>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: "Total Properties",
            value: stats.totalProperties,
            desc: `${stats.featuredProperties} featured listings`,
            icon: Building2,
          },
          {
            label: "Today's Enquiries",
            value: stats.todayEnquiries,
            desc: `${stats.totalEnquiries} lifetime enquiries`,
            icon: MessageSquare,
          },
          {
            label: "Auction Listings",
            value: stats.bankAuctions,
            desc: `${stats.chanceDeals} chance deals active`,
            icon: FileCheck,
          },
          {
            label: "Property Views",
            value: stats.views,
            desc: "Updated in real-time",
            icon: Eye,
          },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              key={card.label}
              className="crm-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(36,30,25,0.09)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-crm-text-muted">
                  {card.label}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-crm-gold/12 text-crm-gold">
                  <Icon size={14} strokeWidth={1.75} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-3xl font-bold tracking-tight text-crm-text">{card.value}</span>
              </div>
              <p className="text-[11px] text-crm-text-secondary mt-2 font-medium">
                {card.desc}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Main split row: Charts & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Chart Card */}
        <div className="lg:col-span-2 crm-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-wide text-crm-text">
                Property Views & Leads
              </span>
              <span className="text-xs text-crm-text-secondary mt-0.5">
                Performance tracking over the last 6 months
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-crm-text-secondary">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-crm-gold" /> Views
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Enquiries
              </span>
            </div>
          </div>

          {/* SVG Custom Graph */}
          <div className="h-64 w-full flex items-end justify-between gap-4 pt-4 border-b border-crm-border">
            {monthlyData.map((d) => {
              const viewHeight = (d.views / maxViews) * 100;
              const enquiryHeight = (d.enquiries / 80) * 100;

              return (
                <div key={d.month} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="w-full flex items-end gap-2 justify-center h-full relative">
                    {/* View Bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${viewHeight}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="w-4 rounded-t-sm bg-gradient-to-t from-crm-gold to-crm-gold-bright/50 relative cursor-pointer group-hover:brightness-110"
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-crm-espresso text-crm-ivory text-[9px] px-1.5 py-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {d.views} views
                      </div>
                    </motion.div>
                    {/* Enquiry Bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${enquiryHeight}%` }}
                      transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
                      className="w-4 rounded-t-sm bg-gradient-to-t from-emerald-600 to-emerald-500/40 relative cursor-pointer group-hover:brightness-110"
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-crm-espresso text-crm-ivory text-[9px] px-1.5 py-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {d.enquiries} leads
                      </div>
                    </motion.div>
                  </div>
                  <span className="text-[10px] font-semibold text-crm-text-muted uppercase mt-3">
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="crm-card p-6 flex flex-col justify-between">
          <div>
            <span className="text-sm font-semibold tracking-wide text-crm-text">
              Quick Actions
            </span>
            <p className="text-xs text-crm-text-secondary mt-0.5">
              Speed workflows for managers
            </p>

            <div className="mt-6 space-y-2">
              {[
                { label: "Create Property", href: "/admin/properties/create" },
                { label: "Check Enquiries", href: "/admin/enquiries" },
                { label: "CMS Website Editor", href: "/admin/cms" },
                { label: "Review Settings", href: "/admin/settings" },
              ].map((act) => (
                <Link
                  key={act.label}
                  href={act.href}
                  className="group flex items-center justify-between rounded-sm border border-crm-border bg-crm-bg/60 hover:border-crm-gold/50 hover:bg-crm-gold/5 px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-crm-text-secondary hover:text-crm-text transition-all duration-200"
                >
                  <span>{act.label}</span>
                  <ArrowUpRight size={14} className="text-crm-text-muted group-hover:text-crm-gold transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-crm-border flex items-center gap-3 text-xs text-crm-gold font-semibold">
            <Sparkles size={14} />
            <span>Sarakki Homes Gold Service Tier</span>
          </div>
        </div>
      </div>

      {/* Sub-split: Recent Enquiries & Category distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Enquiries */}
        <div className="lg:col-span-2 crm-card p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-semibold tracking-wide text-crm-text">
              Recent Leads & Enquiries
            </span>
            <Link
              href="/admin/enquiries"
              className="flex items-center gap-1 text-[11px] font-semibold text-crm-gold hover:text-crm-gold-bright uppercase tracking-wider transition-colors"
            >
              <span>View All</span>
              <ChevronRight size={12} />
            </Link>
          </div>

          {recentEnquiries.length === 0 ? (
            <div className="py-12 text-center text-xs text-crm-text-muted border border-dashed border-crm-border rounded-sm">
              No recent enquiries found in database.
            </div>
          ) : (
            <div className="space-y-3">
              {recentEnquiries.map((enq) => (
                <div
                  key={enq.id}
                  className="flex items-start justify-between p-4 rounded-sm bg-crm-bg/60 border border-crm-border/70 hover:border-crm-gold/40 transition-all duration-200"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-crm-text">
                      {enq.customer.name}
                    </span>
                    <p className="text-[11px] text-crm-text-secondary truncate max-w-sm md:max-w-md">
                      Interested in: <strong className="text-crm-text">{enq.property.title}</strong>
                    </p>
                    <p className="text-[11px] text-crm-text-muted italic mt-1 line-clamp-1">
                      "{enq.message}"
                    </p>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-crm-text-muted shrink-0 pl-4">
                    {new Date(enq.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Distribution */}
        <div className="crm-card p-6">
          <span className="text-sm font-semibold tracking-wide text-crm-text">
            Category Breakdown
          </span>
          <p className="text-xs text-crm-text-secondary mt-0.5 mb-6">
            Properties distributed by category
          </p>

          <div className="space-y-4">
            {[
              { label: "Bank Auctions", value: stats.bankAuctions, total: stats.totalProperties },
              { label: "Rental Income", value: stats.rentalIncome, total: stats.totalProperties },
              { label: "Chance Deals", value: stats.chanceDeals, total: stats.totalProperties },
              { label: "Resale", value: stats.resale, total: stats.totalProperties },
              { label: "Upcoming Projects", value: stats.upcoming, total: stats.totalProperties },
              { label: "Ready To Move", value: stats.readyToMove, total: stats.totalProperties },
            ].map((cat) => {
              const pct = cat.total > 0 ? (cat.value / cat.total) * 100 : 0;
              return (
                <div key={cat.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-crm-text-secondary font-medium">{cat.label}</span>
                    <span className="text-crm-text font-semibold">{cat.value}</span>
                  </div>
                  <div className="h-1.5 w-full bg-crm-border/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full rounded-full bg-gradient-to-r from-crm-gold to-crm-gold-bright"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
