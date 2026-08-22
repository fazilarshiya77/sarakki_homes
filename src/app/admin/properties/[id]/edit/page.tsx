import { prisma } from "@/lib/prisma";
import { PropertyWizard } from "@/components/admin/PropertyWizard";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Retrieve property with relations
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      auctionInfo: true,
      loanEligibility: true,
      images: { orderBy: { order: "asc" } },
    },
  });

  if (!property) {
    notFound();
  }

  // Load lists
  const categories = await prisma.category.findMany({
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  const builders = await prisma.builder.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Map database entity to form friendly format
  const initialData = {
    id: property.id,
    title: property.title,
    categoryId: property.categoryId,
    builderId: property.builderId,
    type: property.type,
    price: property.price,
    priceValueLakh: String(property.priceValueLakh),
    location: property.location,
    address: property.address,
    mapQuery: property.mapQuery,
    description: property.description,
    status: property.status,
    featured: property.featured,
    beds: String(property.beds),
    baths: String(property.baths),
    area: property.area,
    areaSqft: String(property.areaSqft),
    // Full ordered gallery, not just the cover — the wizard now manages
    // every image, so passing only images[0] here would silently drop
    // the rest of an existing property's photos on save.
    images: property.images.map((img) => ({ url: img.url })),
    seoTitle: property.title,
    seoDescription: property.description.substring(0, 155),
    slug: property.slug,
    auctionInfo: property.auctionInfo
      ? {
          bankName: property.auctionInfo.bankName,
          auctionDate: property.auctionInfo.auctionDate.toISOString().split("T")[0],
          emd: property.auctionInfo.emd,
          reservePrice: property.auctionInfo.reservePrice,
          physicalPossession: property.auctionInfo.physicalPossession,
          legalStatus: property.auctionInfo.legalStatus,
        }
      : undefined,
    loanEligibility: property.loanEligibility
      ? {
          maxLoanAmount: property.loanEligibility.maxLoanAmount,
          indicativeEmi: property.loanEligibility.indicativeEmi,
          partnerBanks: JSON.parse(property.loanEligibility.partnerBanks || "[]"),
        }
      : undefined,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="crm-page-title tracking-wide">
          Modify Listing
        </h1>
        <p className="text-sm text-crm-text-secondary mt-1">
          Edit listing details, update pricing, or change auction statuses.
        </p>
      </div>

      <PropertyWizard categories={categories} builders={builders} initialData={initialData} />
    </div>
  );
}
