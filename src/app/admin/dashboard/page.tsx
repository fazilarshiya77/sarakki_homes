import { prisma } from "@/lib/prisma";
import { DashboardClient } from "@/components/admin/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Query actual data from local SQLite database
  const totalProperties = await prisma.property.count();
  const featuredProperties = await prisma.property.count({ where: { featured: "true" } });
  
  const bankAuctions = await prisma.property.count({
    where: { category: { slug: "bank-auctions" } },
  });
  const resale = await prisma.property.count({
    where: { category: { slug: "resale" } },
  });
  const rentalIncome = await prisma.property.count({
    where: { category: { slug: "rental-income" } },
  });
  const chanceDeals = await prisma.property.count({
    where: { category: { slug: "chance-deals" } },
  });
  const upcoming = await prisma.property.count({
    where: { category: { slug: "upcoming-projects" } },
  });
  const readyToMove = await prisma.property.count({
    where: { category: { slug: "ready-to-move" } },
  });

  const totalEnquiries = await prisma.enquiry.count();
  
  // Calculate today's start date
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnquiries = await prisma.enquiry.count({
    where: { createdAt: { gte: todayStart } },
  });

  // Calculate sum of views
  const viewAggregate = await prisma.property.aggregate({
    _sum: { views: true },
  });
  const views = viewAggregate._sum.views || 0;

  // Query recent enquiries
  const recentEnquiriesDb = await prisma.enquiry.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      property: true,
    },
  });

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
