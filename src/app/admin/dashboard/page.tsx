import { prisma } from "@/lib/prisma";
import { DashboardClient } from "@/components/admin/DashboardClient";
import { safePercent } from "@/lib/crm";

export const dynamic = "force-dynamic";

const CLOSED = ["WON", "LOST"];

/** The last 6 calendar months, oldest first, as half-open [start, end) ranges. */
function lastSixMonths(now: Date) {
  const months: { label: string; start: Date; end: Date }[] = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    months.push({
      label: start.toLocaleDateString("en-IN", { month: "short" }),
      start,
      end,
    });
  }
  return months;
}

export default async function DashboardPage() {
  // Query the live Supabase database. Every query below is independent
  // of the others, so they're fired together with Promise.all instead of
  // one `await` at a time — previously this page waited for the SUM of
  // all sequential network round-trips to Supabase; now it waits for the
  // slowest single one. Anything added here MUST join this array rather
  // than being awaited separately.
  const now = new Date();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const months = lastSixMonths(now);

  const [
    totalProperties,
    featuredProperties,
    bankAuctions,
    resale,
    rentalIncome,
    chanceDeals,
    upcoming,
    readyToMove,
    totalEnquiries,
    todayEnquiries,
    viewAggregate,
    recentEnquiriesDb,
    publishedProperties,
    draftProperties,
    recentPropertiesDb,
    recentActivityDb,
    // --- revenue aggregates, all summed by the database ---
    wonAggregate,
    openPipelineAggregate,
    monthRevenueAggregate,
    stageCounts,
    monthlyAggregates,
  ] = await Promise.all([
    prisma.property.count(),
    prisma.property.count({ where: { featured: "true" } }),
    prisma.property.count({ where: { category: { slug: "bank-auctions" } } }),
    prisma.property.count({ where: { category: { slug: "resale" } } }),
    prisma.property.count({ where: { category: { slug: "rental-income" } } }),
    prisma.property.count({ where: { category: { slug: "chance-deals" } } }),
    prisma.property.count({ where: { category: { slug: "upcoming-projects" } } }),
    prisma.property.count({ where: { category: { slug: "ready-to-move" } } }),
    prisma.enquiry.count(),
    prisma.enquiry.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.property.aggregate({ _sum: { views: true } }),
    prisma.enquiry.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { customer: true, property: true },
    }),
    prisma.property.count({ where: { status: "PUBLISHED" } }),
    prisma.property.count({ where: { status: "UNPUBLISHED" } }),
    prisma.property.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, status: true, price: true, createdAt: true, slug: true },
    }),
    prisma.activityLog.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
    // Revenue earned, deal value closed and average deal size — one pass.
    prisma.lead.aggregate({
      where: { stage: "WON" },
      _sum: { commissionLakh: true, dealValueLakh: true },
      _avg: { dealValueLakh: true },
      _count: { _all: true },
    }),
    // Open pipeline: everything not yet closed either way.
    prisma.lead.aggregate({
      where: { stage: { notIn: CLOSED } },
      _sum: { dealValueLakh: true },
      _count: { _all: true },
    }),
    // Revenue booked this calendar month, by closedAt (not updatedAt).
    prisma.lead.aggregate({
      where: { stage: "WON", closedAt: { gte: monthStart } },
      _sum: { commissionLakh: true },
      _count: { _all: true },
    }),
    // Won/lost counts for the win rate, in a single grouped query.
    prisma.lead.groupBy({
      by: ["stage"],
      where: { stage: { in: CLOSED } },
      _count: { _all: true },
    }),
    // The 6-month chart series: one bounded aggregate per month, all
    // issued concurrently as part of this same Promise.all (the inner
    // Promise.all does not serialize them). No lead rows are pulled into
    // JS to be reduced.
    Promise.all(
      months.map((m) =>
        prisma.lead.aggregate({
          where: { stage: "WON", closedAt: { gte: m.start, lt: m.end } },
          _sum: { commissionLakh: true },
          _count: { _all: true },
        })
      )
    ),
  ]);

  const views = viewAggregate._sum.views || 0;

  const wonCount = stageCounts.find((s) => s.stage === "WON")?._count._all ?? 0;
  const lostCount = stageCounts.find((s) => s.stage === "LOST")?._count._all ?? 0;

  const revenue = {
    totalRevenueLakh: wonAggregate._sum.commissionLakh ?? 0,
    totalDealValueLakh: wonAggregate._sum.dealValueLakh ?? 0,
    openPipelineLakh: openPipelineAggregate._sum.dealValueLakh ?? 0,
    openPipelineCount: openPipelineAggregate._count._all ?? 0,
    avgDealSizeLakh: wonAggregate._avg.dealValueLakh ?? 0,
    revenueThisMonthLakh: monthRevenueAggregate._sum.commissionLakh ?? 0,
    dealsClosedThisMonth: monthRevenueAggregate._count._all ?? 0,
    wonCount,
    lostCount,
    // A brand-new CRM has zero of both — safePercent returns 0 rather
    // than NaN so the card never renders "NaN%".
    winRatePct: safePercent(wonCount, wonCount + lostCount),
  };

  // Real per-month figures — this replaces the hardcoded Jan–Jun demo
  // series that used to live in DashboardClient. A month with no closed
  // deals reports zero; nothing is interpolated or invented.
  const monthlyRevenue = months.map((m, i) => ({
    month: m.label,
    revenueLakh: Number((monthlyAggregates[i]._sum.commissionLakh ?? 0).toFixed(2)),
    deals: monthlyAggregates[i]._count._all ?? 0,
  }));

  // Map database entries to match the client component interface
  const stats = {
    totalProperties,
    featuredProperties,
    bankAuctions,
    resale,
    rentalIncome,
    chanceDeals,
    upcoming,
    readyToMove,
    totalEnquiries,
    todayEnquiries,
    views,
    publishedProperties,
    draftProperties,
  };

  const recentEnquiries = recentEnquiriesDb.map((enq) => ({
    id: enq.id,
    customer: {
      name: enq.customer.name,
      email: enq.customer.email,
      phone: enq.customer.phone,
    },
    property: {
      title: enq.property.title,
    },
    message: enq.message,
    createdAt: enq.createdAt.toISOString(),
  }));

  const recentProperties = recentPropertiesDb.map((p) => ({
    id: p.id,
    title: p.title,
    status: p.status,
    price: p.price,
    slug: p.slug,
    createdAt: p.createdAt.toISOString(),
  }));

  const recentActivity = recentActivityDb.map((a) => ({
    id: a.id,
    action: a.action,
    details: a.details,
    userName: a.user?.name ?? "System",
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <DashboardClient
      stats={stats}
      revenue={revenue}
      monthlyRevenue={monthlyRevenue}
      recentEnquiries={recentEnquiries}
      recentProperties={recentProperties}
      recentActivity={recentActivity}
    />
  );
}
