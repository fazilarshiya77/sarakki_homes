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
  IndianRupee,
  Wallet,
  Target,
  Trophy,
} from "lucide-react";
import { formatMoneyLakh } from "@/lib/crm";
import { cn } from "@/lib/utils";

export interface RevenueSummary {
  totalRevenueLakh: number;
  totalDealValueLakh: number;
  openPipelineLakh: number;
  openPipelineCount: number;
  avgDealSizeLakh: number;
  revenueThisMonthLakh: number;
  dealsClosedThisMonth: number;
  wonCount: number;
  lostCount: number;
  winRatePct: number;
}

export interface MonthlyRevenuePoint {
  month: string;
  revenueLakh: number;
  deals: number;
}

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
    publishedProperties: number;
    draftProperties: number;
  };
  revenue: RevenueSummary;
  monthlyRevenue: MonthlyRevenuePoint[];
  recentEnquiries: Array<{
    id: string;
    customer: { name: string; email: string; phone: string };
    property: { title: string };
    message: string;
    createdAt: string;
  }>;
  recentProperties: Array<{
    id: string;
    title: string;
    status: string;
    price: string;
    slug: string;
    createdAt: string;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    details: string;
    userName: string;
    createdAt: string;
  }>;
}

const STATUS_BADGE: Record<string, string> = {
  PUBLISHED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  UNPUBLISHED: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  ARCHIVED: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  SOLD: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  UNDER_PROCESS: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  AUCTION_CLOSED: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function DashboardClient({
  stats,
  revenue,
  monthlyRevenue,
  recentEnquiries,
  recentProperties,
  recentActivity,
}: DashboardClientProps) {
  // The chart series is real, database-derived data (revenue and deals
  // closed per month over the last 6 months, by Lead.closedAt) — it
  // replaces a hardcoded Jan–Jun demo array that used to live here.
  // Months with no closed deals are genuine zeros.
  const maxRevenue = Math.max(...monthlyRevenue.map((d) => d.revenueLakh), 0);
  const maxDeals = Math.max(...monthlyRevenue.map((d) => d.deals), 0);
  const hasChartData = maxRevenue > 0 || maxDeals > 0;
  // Guard every bar height against a zero denominator — an empty CRM
  // must render flat bars, not NaN%.
  const barPct = (value: number, max: number) => (max > 0 ? (value / max) * 100 : 0);

  return (
    <div className="space-y-10">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-body text-3xl font-semibold tracking-wide text-crm-text">
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
            desc: `${stats.publishedProperties} live · ${stats.draftProperties} draft`,
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
                <span className="font-body text-3xl font-bold tracking-tight text-crm-text">{card.value}</span>
              </div>
              <p className="text-[11px] text-crm-text-secondary mt-2 font-medium">
                {card.desc}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue & deal performance */}
      <div className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-body text-2xl font-bold tracking-wide text-crm-text">
              Revenue &amp; Deals
            </h2>
            <p className="text-sm text-crm-text-secondary mt-1">
              Commission earned on won deals, and the value still in play.
            </p>
          </div>
          <Link
            href="/admin/leads"
            className="hidden md:flex items-center gap-1 text-[11px] font-semibold text-crm-gold hover:text-crm-gold-bright uppercase tracking-wider transition-colors"
          >
            <span>Open Pipeline</span>
            <ChevronRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              label: "Revenue Earned",
              value: formatMoneyLakh(revenue.totalRevenueLakh),
              desc: `${formatMoneyLakh(revenue.revenueThisMonthLakh)} this month`,
              icon: IndianRupee,
              accent: true,
            },
            {
              label: "Deal Value Closed",
              value: formatMoneyLakh(revenue.totalDealValueLakh),
              desc:
                revenue.wonCount > 0
                  ? `${revenue.wonCount} won · avg ${formatMoneyLakh(revenue.avgDealSizeLakh)}`
                  : "No deals closed yet",
              icon: Trophy,
            },
            {
              label: "Open Pipeline",
              value: formatMoneyLakh(revenue.openPipelineLakh),
              desc: `${revenue.openPipelineCount} active lead${revenue.openPipelineCount === 1 ? "" : "s"}`,
              icon: Wallet,
            },
            {
              label: "Win Rate",
              value:
                revenue.wonCount + revenue.lostCount > 0
                  ? `${revenue.winRatePct.toFixed(0)}%`
                  : "—",
              desc: `${revenue.wonCount} won · ${revenue.lostCount} lost`,
              icon: Target,
            },
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                key={card.label}
                className={
                  card.accent
                    ? "crm-card p-6 border-crm-gold/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(36,30,25,0.09)]"
                    : "crm-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(36,30,25,0.09)]"
                }
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
                  <span className="font-body text-3xl font-bold tracking-tight text-crm-text">
                    {card.value}
                  </span>
                </div>
                <p className="text-[11px] text-crm-text-secondary mt-2 font-medium">
                  {card.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Revenue closed per month — real data from Lead.closedAt */}
        <div className="crm-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-wide text-crm-text">
                Revenue Closed by Month
              </span>
              <span className="text-xs text-crm-text-secondary mt-0.5">
                Commission earned and deals won over the last 6 months
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-crm-text-secondary">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-crm-gold" /> Revenue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Deals Won
              </span>
            </div>
          </div>

          {!hasChartData && (
            <p className="mb-4 text-[11px] text-crm-text-muted">
              No deals have been closed in the last six months yet — every month below is a
              real zero, not a placeholder.
            </p>
          )}

          <div className="h-64 w-full flex items-end justify-between gap-4 pt-4 border-b border-crm-border">
            {monthlyRevenue.map((d) => (
              <div
                key={d.month}
                className="flex-1 flex flex-col items-center h-full justify-end group"
              >
                <div className="w-full flex items-end gap-2 justify-center h-full relative">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${barPct(d.revenueLakh, maxRevenue)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="w-4 min-h-[2px] rounded-t-sm bg-gradient-to-t from-crm-gold to-crm-gold-bright/50 relative cursor-pointer group-hover:brightness-110"
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-crm-espresso text-crm-ivory text-[9px] px-1.5 py-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {formatMoneyLakh(d.revenueLakh)}
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${barPct(d.deals, maxDeals)}%` }}
                    transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
                    className="w-4 min-h-[2px] rounded-t-sm bg-gradient-to-t from-emerald-600 to-emerald-500/40 relative cursor-pointer group-hover:brightness-110"
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-crm-espresso text-crm-ivory text-[9px] px-1.5 py-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {d.deals} deal{d.deals === 1 ? "" : "s"}
                    </div>
                  </motion.div>
                </div>
                <span className="text-[10px] font-semibold text-crm-text-muted uppercase mt-3">
                  {d.month}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main split row: Charts & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deal performance summary — real figures only */}
        <div className="lg:col-span-2 crm-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-wide text-crm-text">
                Deal Performance
              </span>
              <span className="text-xs text-crm-text-secondary mt-0.5">
                Closed and in-flight business, straight from the CRM
              </span>
            </div>
            <Activity size={14} className="text-crm-gold" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                label: "Average Deal Size (Won)",
                value: revenue.wonCount > 0 ? formatMoneyLakh(revenue.avgDealSizeLakh) : "—",
                desc: `Across ${revenue.wonCount} won deal${revenue.wonCount === 1 ? "" : "s"}`,
              },
              {
                label: "Revenue This Month",
                value: formatMoneyLakh(revenue.revenueThisMonthLakh),
                desc: `${revenue.dealsClosedThisMonth} deal${revenue.dealsClosedThisMonth === 1 ? "" : "s"} closed`,
              },
              {
                label: "Deals Won / Lost",
                value: `${revenue.wonCount} / ${revenue.lostCount}`,
                desc:
                  revenue.wonCount + revenue.lostCount > 0
                    ? `${revenue.winRatePct.toFixed(0)}% win rate`
                    : "No closed deals yet",
              },
              {
                label: "Pipeline Coverage",
                value: formatMoneyLakh(revenue.openPipelineLakh),
                desc: `${revenue.openPipelineCount} lead${revenue.openPipelineCount === 1 ? "" : "s"} still open`,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-sm border border-crm-border/70 bg-crm-bg/60 p-4"
              >
                <span className="text-[10px] uppercase tracking-wider font-semibold text-crm-text-muted">
                  {item.label}
                </span>
                <p className="font-body text-2xl font-bold tracking-tight text-crm-text mt-2">
                  {item.value}
                </p>
                <p className="text-[11px] text-crm-text-secondary mt-1 font-medium">{item.desc}</p>
              </div>
            ))}
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
              Recent Website Enquiries
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
                      &ldquo;{enq.message}&rdquo;
                    </p>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-crm-text-muted shrink-0 pl-4">
                    {/* Explicit timeZone is required, not cosmetic: this
                        component receives fully-loaded data as props from a
                        force-dynamic Server Component (no useEffect/fetch
                        gate), so this exact call runs once during SSR and
                        again during hydration. Without a pinned timeZone,
                        toLocaleDateString uses each machine's own local
                        system timezone -- the server process's timezone vs
                        the visitor's browser -- so a timestamp near a local
                        midnight boundary could render a different calendar
                        day on each pass, which is a real "text content does
                        not match server-rendered HTML" hydration error, not
                        a hypothetical one. Pinned to Asia/Kolkata since this
                        is an India-only CRM -- en-IN formatting already
                        implied IST, this just makes it actually IST on
                        every machine instead of accidentally correct only
                        when the server happens to run in UTC. */}
                    {new Date(enq.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      timeZone: "Asia/Kolkata",
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

      {/* Sub-split: Recent Properties & Recent CRM Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Properties */}
        <div className="crm-card p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-semibold tracking-wide text-crm-text">
              Recently Added Properties
            </span>
            <Link
              href="/admin/properties"
              className="flex items-center gap-1 text-[11px] font-semibold text-crm-gold hover:text-crm-gold-bright uppercase tracking-wider transition-colors"
            >
              <span>View All</span>
              <ChevronRight size={12} />
            </Link>
          </div>

          {recentProperties.length === 0 ? (
            <div className="py-12 text-center text-xs text-crm-text-muted border border-dashed border-crm-border rounded-sm">
              No properties yet — add your first listing.
            </div>
          ) : (
            <div className="space-y-3">
              {recentProperties.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/properties/${p.id}/edit`}
                  className="flex items-center justify-between p-4 rounded-sm bg-crm-bg/60 border border-crm-border/70 hover:border-crm-gold/40 transition-all duration-200"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <span className="block text-xs font-semibold text-crm-text truncate">{p.title}</span>
                    <span className="text-[10px] text-crm-text-muted">{p.price}</span>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 px-2 py-0.5 rounded-full border text-[8px] font-semibold uppercase tracking-wide",
                      STATUS_BADGE[p.status] ?? STATUS_BADGE.UNPUBLISHED
                    )}
                  >
                    {p.status.replace(/_/g, " ")}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent CRM Activity */}
        <div className="crm-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity size={15} className="text-crm-gold" />
            <span className="text-sm font-semibold tracking-wide text-crm-text">
              Recent CRM Activity
            </span>
          </div>

          {recentActivity.length === 0 ? (
            <div className="py-12 text-center text-xs text-crm-text-muted border border-dashed border-crm-border rounded-sm">
              No activity logged yet.
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((a) => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-sm bg-crm-bg/60 border border-crm-border/70">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-crm-gold" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-crm-text-secondary leading-relaxed">
                      <span className="font-semibold text-crm-text">{a.userName}</span> {a.details}
                    </p>
                    <span className="text-[9px] uppercase tracking-wider text-crm-text-muted">
                      {new Date(a.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Asia/Kolkata",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
