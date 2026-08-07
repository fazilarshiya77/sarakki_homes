import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        category: true,
        builder: true,
        auctionInfo: true,
        loanEligibility: true,
        images: { orderBy: { order: "asc" } },
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    return NextResponse.json({ property });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();

    // Check if property exists
    const existing = await prisma.property.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Update property details in transaction
    const property = await prisma.property.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        location: body.location,
        price: body.price,
        priceValueLakh: parseFloat(body.priceValueLakh || "0"),
        type: body.type,
        status: body.status,
        featured: body.featured,
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

    // Handle AuctionInfo
    if (body.type === "Bank Auction" && body.auctionInfo) {
      await prisma.auctionInfo.upsert({
        where: { propertyId: id },
        update: {
          bankName: body.auctionInfo.bankName,
          auctionDate: new Date(body.auctionInfo.auctionDate),
          emd: body.auctionInfo.emd,
          reservePrice: body.auctionInfo.reservePrice,
          physicalPossession: body.auctionInfo.physicalPossession === true,
          legalStatus: body.auctionInfo.legalStatus,
        },
        create: {
          propertyId: id,
          bankName: body.auctionInfo.bankName,
          auctionDate: new Date(body.auctionInfo.auctionDate),
          emd: body.auctionInfo.emd,
          reservePrice: body.auctionInfo.reservePrice,
          physicalPossession: body.auctionInfo.physicalPossession === true,
          legalStatus: body.auctionInfo.legalStatus,
        },
      });
    } else {
      // If type changed from Bank Auction, clean it up
      await prisma.auctionInfo.deleteMany({ where: { propertyId: id } });
    }

    // Handle LoanEligibility
    if (body.loanEligibility) {
      await prisma.loanEligibility.upsert({
        where: { propertyId: id },
        update: {
          maxLoanAmount: body.loanEligibility.maxLoanAmount,
          indicativeEmi: body.loanEligibility.indicativeEmi,
          partnerBanks: JSON.stringify(body.loanEligibility.partnerBanks || []),
        },
        create: {
          propertyId: id,
          maxLoanAmount: body.loanEligibility.maxLoanAmount,
          indicativeEmi: body.loanEligibility.indicativeEmi,
          partnerBanks: JSON.stringify(body.loanEligibility.partnerBanks || []),
        },
      });
    }

    // Handle Images updates (replace all or update)
    if (body.images) {
      // Clean old images
      await prisma.propertyImage.deleteMany({ where: { propertyId: id } });
      // Create new ones
      if (body.images.length > 0) {
        await prisma.propertyImage.createMany({
          data: body.images.map((img: any, idx: number) => ({
            url: img.url,
            publicId: img.publicId || `manual_${property.slug}_${idx}`,
            order: idx,
            propertyId: id,
          })),
        });
      }
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_PROPERTY",
        details: `Updated property ${property.title} (${property.propertyId})`,
      },
    });

    return NextResponse.json({ property });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.property.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Delete property
    await prisma.property.delete({
      where: { id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE_PROPERTY",
        details: `Deleted property ${existing.title} (${existing.propertyId})`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
