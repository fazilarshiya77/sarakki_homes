import { prisma } from "@/lib/prisma";
import { DashboardClient } from "@/components/admin/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Query the live Supabase database. All 11 queries below are
  // independent of each other, so they're fired together with
  // Promise.all instead of one `await` at a time — previously this page
  // waited for the SUM of 11 sequential network round-trips to
  // Supabase; now it waits for the slowest single one.
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

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
  ]);

  const views = viewAggregate._sum.views || 0;

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

  return <DashboardClient stats={stats} recentEnquiries={recentEnquiries} />;
}
