import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const category = searchParams.get("category") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  try {
    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { location: { contains: search } },
        { propertyId: { contains: search } },
      ];
    }
    if (status) {
      where.status = status;
    }
    if (category) {
      where.category = { slug: category };
    }

    const [properties, total] = await prisma.$transaction([
      prisma.property.findMany({
        where,
        include: {
          category: true,
          builder: true,
          images: { orderBy: { order: "asc" } },
        },
        skip,
        take: limit,
        orderBy: [{ category: { slug: "asc" } }, { createdAt: "desc" }],
      }),
      prisma.property.count({ where }),
    ]);

    return NextResponse.json({ properties, total, page, limit });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Auto-generate Property ID: find the last property and increment
    const lastProperty = await prisma.property.findFirst({
      orderBy: { propertyId: "desc" },
    });

    let newPropertyId = "SH-1001";
    if (lastProperty && lastProperty.propertyId) {
      const match = lastProperty.propertyId.match(/SH-(\d+)/);
      if (match) {
        const lastNum = parseInt(match[1]);
        newPropertyId = `SH-${lastNum + 1}`;
      }
    }

    // Generate slug from title if not provided
    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    // Create property in transaction
    const property = await prisma.property.create({
      data: {
        propertyId: newPropertyId,
        slug,
        title: body.title,
        location: body.location,
        price: body.price,
        priceValueLakh: parseFloat(body.priceValueLakh || "0"),
        type: body.type,
        status: body.status || "UNPUBLISHED",
        featured: body.featured || "false",
        beds: parseInt(body.beds || "0"),
        baths: parseInt(body.baths || "0"),
        area: body.area,
        areaSqft: parseInt(body.areaSqft || "0"),
        description: body.description,
        address: body.address,
        mapQuery: body.mapQuery,
        categoryId: body.categoryId,
        builderId: body.builderId,
      },
    });

    // Create auction details if provided
    if (body.type === "Bank Auction" && body.auctionInfo) {
      await prisma.auctionInfo.create({
        data: {
          propertyId: property.id,
          bankName: body.auctionInfo.bankName,
          auctionDate: new Date(body.auctionInfo.auctionDate),
          emd: body.auctionInfo.emd,
          reservePrice: body.auctionInfo.reservePrice,
          physicalPossession: body.auctionInfo.physicalPossession === true,
          legalStatus: body.auctionInfo.legalStatus,
        },
      });
    }

    // Create loan eligibility if provided
    if (body.loanEligibility) {
      await prisma.loanEligibility.create({
        data: {
          propertyId: property.id,
          maxLoanAmount: body.loanEligibility.maxLoanAmount,
          indicativeEmi: body.loanEligibility.indicativeEmi,
          partnerBanks: JSON.stringify(body.loanEligibility.partnerBanks || []),
        },
      });
    }

    // Create image attachments
    if (body.images && body.images.length > 0) {
      await prisma.propertyImage.createMany({
        data: body.images.map((img: any, idx: number) => ({
          url: img.url,
          publicId: img.publicId || `manual_${property.slug}_${idx}`,
          order: idx,
          propertyId: property.id,
        })),
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: (session.user as any).id,
        action: "CREATE_PROPERTY",
        details: `Created property ${property.title} (${property.propertyId})`,
      },
    });

    // Public listings/detail pages are ISR-cached (revalidate = 60) —
    // bust that so a newly published property shows up immediately.
    revalidatePath("/");
    revalidatePath("/properties");
    revalidatePath("/properties/bank-auctions");
    revalidatePath(`/properties/${property.slug}`);

    return NextResponse.json({ property });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
