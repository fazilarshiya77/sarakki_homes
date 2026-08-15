import { prisma } from "@/lib/prisma";
import { PropertyWizard } from "@/components/admin/PropertyWizard";

export const dynamic = "force-dynamic";

export default async function CreatePropertyPage() {
  // Query categories and builders for form selection options
  const categories = await prisma.category.findMany({
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  const builders = await prisma.builder.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-wide text-crm-text">
          Create Listing
        </h1>
        <p className="text-xs text-crm-text-secondary mt-0.5">
          Follow the steps below to populate a new luxury property listing in database.
        </p>
      </div>

      <PropertyWizard categories={categories} builders={builders} />
    </div>
  );
}
