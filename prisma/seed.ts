import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Seed Settings
  const settingsCount = await prisma.setting.count();
  if (settingsCount === 0) {
    await prisma.setting.create({
      data: {
        companyName: "Sarakki Homes",
        companyLogo: "/logo.png",
        favicon: "/favicon.ico",
        whatsappNo: "+91 98450 00000",
        metaTitle: "Sarakki Homes | Premium Real Estate Consultancy, Bengaluru",
        metaDesc: "Sarakki Homes guides you through the complete property journey — selection, legal verification, bank auction process, loan arrangement, registration, and khata transfer. Trust before property.",
      },
    });
    console.log("✅ Seeded default settings.");
  }

  // 2. Seed Admin User
  const adminEmail = "admin@sarakkihomes.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = bcrypt.hashSync("adminpassword123", 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Sarakki Admin",
        passwordHash,
        role: "ADMIN",
      },
    });
    console.log(`✅ Seeded admin user: ${adminEmail} (password: adminpassword123)`);
  }

  // 3. Seed Builders
  const builders = [
    "Prestige Group",
    "Sobha Limited",
    "Brigade Group",
    "Puravankara",
    "Godrej Properties",
    "Embassy Group",
    "Shriram Properties",
    "Salarpuria Sattva",
  ];

  const seededBuilders: Record<string, string> = {};

  for (const name of builders) {
    const b = await prisma.builder.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    seededBuilders[name] = b.id;
  }
  console.log("✅ Seeded builders.");

  // 4. Seed Categories
  const categories = [
    {
      title: "Bank Auction Properties",
      slug: "bank-auctions",
      description: "Verified auction listings with complete legal due-diligence, guided bidding.",
      heroTagline: "Below-market entry, without the risk.",
      longDescription: "Bank auctions offer some of the sharpest pricing in Bengaluru's property market — but only if you know how to navigate SARFAESI notices, reserve prices, and title history. We shortlist auction properties, run independent legal verification before you ever bid, and guide you through the bidding process itself.",
      highlights: JSON.stringify([
        "Independent title and encumbrance verification before every listing",
        "Typically 15-25% below comparable open-market pricing",
        "Guided bid strategy backed by local valuation data",
        "Full support through EMD, registration, and possession",
      ]),
      idealFor: JSON.stringify([
        "First-time investors seeking value entry points",
        "Buyers comfortable with a structured, time-bound process",
      ]),
      tone: "charcoal",
    },
    {
      title: "Rental Income Properties",
      slug: "rental-income",
      description: "Assets selected for stable yield, in Bengaluru's strongest micro-markets.",
      heroTagline: "Built for yield, not just appreciation.",
      longDescription: "Not every property makes a good rental asset. We evaluate tenant demand, vacancy patterns, and yield history across Bengaluru's tech corridors before recommending anything — so the number on the brochure matches what actually lands in your account.",
      highlights: JSON.stringify([
        "Selected specifically for tenant demand, not just price",
        "Average yields of 3.5-4%, above the city median",
        "Micro-market vacancy data reviewed before every recommendation",
        "Ongoing guidance on tenancy and rent structuring available",
      ]),
      idealFor: JSON.stringify([
        "Investors prioritizing monthly cash flow",
        "NRIs seeking hands-off, professionally vetted assets",
      ]),
      tone: "emerald",
    },
    {
      title: "Chance Properties",
      slug: "chance-deals",
      description: "Rare, time-sensitive opportunities sourced before they reach the open market.",
      heroTagline: "Opportunities that never reach a listing site.",
      longDescription: "Some of the best deals never get publicly listed — motivated sellers, estate settlements, relocation sales. Our network surfaces these before they reach brokers or portals, and we move fast on your behalf when the window is short.",
      highlights: JSON.stringify([
        "Off-market sourcing through our direct seller network",
        "Priced below comparable public listings",
        "Time-sensitive — verified and ready to move on quickly",
        "Same legal rigor as every other property we present",
      ]),
      idealFor: JSON.stringify([
        "Buyers ready to act quickly on a strong opportunity",
        "Investors seeking below-market off-market deals",
      ]),
      tone: "gold",
    },
    {
      title: "Resale Properties",
      slug: "resale",
      description: "Pre-owned homes, title-checked and khata-verified before you ever view them.",
      heroTagline: "Established homes, clean paperwork.",
      longDescription: "Resale is where most title disputes originate — unclear succession, missing khata records, unpaid dues. Every resale property we present has been through our documentation review first, so what you see is what you can actually buy.",
      highlights: JSON.stringify([
        "Full title chain and khata verification before listing",
        "Property tax and dues cleared or disclosed upfront",
        "Access to established, high-demand neighborhoods",
        "Faster registration timelines than new construction",
      ]),
      idealFor: JSON.stringify([
        "Buyers who want an established neighborhood now",
        "Anyone wary of new-construction delivery risk",
      ]),
      tone: "warm",
    },
    {
      title: "Upcoming Builder Projects",
      slug: "upcoming-projects",
      description: "Early access to RERA-approved developments from builders we've vetted.",
      heroTagline: "Early access, vetted builders only.",
      longDescription: "We don't work with every builder in Bengaluru — only those with a track record of on-time delivery and clean RERA compliance. Early-access pricing on these projects is typically 15-20% below expected possession-time value.",
      highlights: JSON.stringify([
        "Only RERA-registered projects from builders with delivery track records",
        "Pre-launch and early-bird pricing advantages",
        "Construction-linked payment plans structured with you",
        "Site visits and builder due-diligence included",
      ]),
      idealFor: JSON.stringify([
        "Buyers comfortable with a construction timeline",
        "Investors targeting appreciation before possession",
      ]),
      tone: "emerald",
    },
    {
      title: "Ready To Move Properties",
      slug: "ready-to-move",
      description: "Move-in ready homes with occupancy certificates in hand.",
      heroTagline: "No waiting, no possession risk.",
      longDescription: "For buyers who can't or don't want to wait on a construction timeline, we present only properties with occupancy certificates already issued — the paperwork that actually lets you move in and get utilities connected.",
      highlights: JSON.stringify([
        "Occupancy certificate confirmed before we present the property",
        "Move in or rent out within weeks, not years",
        "Zero construction-delay or builder-default risk",
        "Immediate loan disbursement — no under-construction restrictions",
      ]),
      idealFor: JSON.stringify([
        "Buyers needing to move in immediately",
        "Anyone who has been burned by construction delays before",
      ]),
      tone: "gold",
    },
  ];

  const seededCategories: Record<string, string> = {};

  for (const cat of categories) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    seededCategories[cat.slug] = c.id;
  }
  console.log("✅ Seeded categories.");

  // Testimonials — the public homepage's book-flip section reads these
  // live from the database (src/lib/testimonials.ts), not from hardcoded
  // copy, so admin-added reviews actually appear on the site.
  const testimonials = [
    {
      name: "Ramesh Iyer",
      role: "Purchased Bank Auction Property",
      location: "Whitefield, Bengaluru",
      quote:
        "Sarakki Homes walked us through a bank auction we'd never have attempted alone. Every document was verified before we bid — no surprises after.",
      rating: 5,
    },
    {
      name: "Divya & Arjun Rao",
      role: "Luxury Villa Buyers",
      location: "Sarjapur, Bengaluru",
      quote:
        "What stood out was how little they pushed. It felt like counsel, not sales. We understood every rupee, every clause, and felt in completely safe hands.",
      rating: 5,
    },
    {
      name: "Kavitha Menon",
      role: "Rental Income Investors",
      location: "Koramangala, Bengaluru",
      quote:
        "Their rental yield analysis was more rigorous than what our bank gave us. Three properties later, they are still the only firm we call first.",
      rating: 5,
    },
    {
      name: "Rajesh Khanna",
      role: "Ready To Move Property Buyer",
      location: "Attibele, Bengaluru",
      quote:
        "The transition from our old home was seamless. Sarakki Homes took care of all the khata registration transfer details quickly and transparently.",
      rating: 5,
    },
  ];

  const testimonialCount = await prisma.testimonial.count();
  if (testimonialCount === 0) {
    for (const t of testimonials) {
      await prisma.testimonial.create({ data: t });
    }
    console.log("✅ Seeded testimonials.");
  }

  console.log("🌱 Database seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
