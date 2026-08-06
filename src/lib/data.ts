import {
  Gavel,
  KeyRound,
  Sparkles,
  RefreshCcw,
  Building2,
  Home,
  ShieldCheck,
  Scale,
  Landmark,
  TrendingUp,
  Search,
  FileCheck2,
  Handshake,
  Stamp,
  FileSignature,
  Compass,
  LineChart,
} from "lucide-react";

export const CONTACT = {
  phoneDisplay: "+91 98450 00000",
  phoneHref: "tel:+919845000000",
  whatsappHref:
    "https://wa.me/919845000000?text=Hi%20Sarakki%20Homes%2C%20I%27d%20like%20to%20book%20a%20consultation.",
  instagramHref: "#",
};

export const STATS: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
}[] = [
  { label: "Properties Transacted", value: 500, suffix: "+" },
  { label: "Cr. Transaction Value", value: 250, prefix: "₹", suffix: "+" },
  { label: "Years of Trust", value: 15, suffix: "+" },
  { label: "Families Guided", value: 1000, suffix: "+" },
];

export type MediaTone = "warm" | "emerald" | "gold" | "charcoal";

export const CATEGORIES = [
  {
    title: "Bank Auction Properties",
    slug: "bank-auctions",
    description:
      "Verified auction listings with complete legal due-diligence, guided bidding.",
    heroTagline: "Below-market entry, without the risk.",
    longDescription:
      "Bank auctions offer some of the sharpest pricing in Bengaluru's property market — but only if you know how to navigate SARFAESI notices, reserve prices, and title history. We shortlist auction properties, run independent legal verification before you ever bid, and guide you through the bidding process itself.",
    highlights: [
      "Independent title and encumbrance verification before every listing",
      "Typically 15-25% below comparable open-market pricing",
      "Guided bid strategy backed by local valuation data",
      "Full support through EMD, registration, and possession",
    ],
    idealFor: ["First-time investors seeking value entry points", "Buyers comfortable with a structured, time-bound process"],
    icon: Gavel,
    tone: "charcoal" as MediaTone,
  },
  {
    title: "Rental Income Properties",
    slug: "rental-income",
    description:
      "Assets selected for stable yield, in Bengaluru's strongest micro-markets.",
    heroTagline: "Built for yield, not just appreciation.",
    longDescription:
      "Not every property makes a good rental asset. We evaluate tenant demand, vacancy patterns, and yield history across Bengaluru's tech corridors before recommending anything — so the number on the brochure matches what actually lands in your account.",
    highlights: [
      "Selected specifically for tenant demand, not just price",
      "Average yields of 3.5-4%, above the city median",
      "Micro-market vacancy data reviewed before every recommendation",
      "Ongoing guidance on tenancy and rent structuring available",
    ],
    idealFor: ["Investors prioritizing monthly cash flow", "NRIs seeking hands-off, professionally vetted assets"],
    icon: KeyRound,
    tone: "emerald" as MediaTone,
  },
  {
    title: "Chance Properties",
    slug: "chance-deals",
    description:
      "Rare, time-sensitive opportunities sourced before they reach the open market.",
    heroTagline: "Opportunities that never reach a listing site.",
    longDescription:
      "Some of the best deals never get publicly listed — motivated sellers, estate settlements, relocation sales. Our network surfaces these before they reach brokers or portals, and we move fast on your behalf when the window is short.",
    highlights: [
      "Off-market sourcing through our direct seller network",
      "Priced below comparable public listings",
      "Time-sensitive — verified and ready to move on quickly",
      "Same legal rigor as every other property we present",
    ],
    idealFor: ["Buyers ready to act quickly on a strong opportunity", "Investors seeking below-market off-market deals"],
    icon: Sparkles,
    tone: "gold" as MediaTone,
  },
  {
    title: "Resale Properties",
    slug: "resale",
    description:
      "Pre-owned homes, title-checked and khata-verified before you ever view them.",
    heroTagline: "Established homes, clean paperwork.",
    longDescription:
      "Resale is where most title disputes originate — unclear succession, missing khata records, unpaid dues. Every resale property we present has been through our documentation review first, so what you see is what you can actually buy.",
    highlights: [
      "Full title chain and khata verification before listing",
      "Property tax and dues cleared or disclosed upfront",
      "Access to established, high-demand neighborhoods",
      "Faster registration timelines than new construction",
    ],
    idealFor: ["Buyers who want an established neighborhood now", "Anyone wary of new-construction delivery risk"],
    icon: RefreshCcw,
    tone: "warm" as MediaTone,
  },
  {
    title: "Upcoming Builder Projects",
    slug: "upcoming-projects",
    description:
      "Early access to RERA-approved developments from builders we've vetted.",
    heroTagline: "Early access, vetted builders only.",
    longDescription:
      "We don't work with every builder in Bengaluru — only those with a track record of on-time delivery and clean RERA compliance. Early-access pricing on these projects is typically 15-20% below expected possession-time value.",
    highlights: [
      "Only RERA-registered projects from builders with delivery track records",
      "Pre-launch and early-bird pricing advantages",
      "Construction-linked payment plans structured with you",
      "Site visits and builder due-diligence included",
    ],
    idealFor: ["Buyers comfortable with a construction timeline", "Investors targeting appreciation before possession"],
    icon: Building2,
    tone: "emerald" as MediaTone,
  },
  {
    title: "Ready To Move Properties",
    slug: "ready-to-move",
    description: "Move-in ready homes with occupancy certificates in hand.",
    heroTagline: "No waiting, no possession risk.",
    longDescription:
      "For buyers who can't or don't want to wait on a construction timeline, we present only properties with occupancy certificates already issued — the paperwork that actually lets you move in and get utilities connected.",
    highlights: [
      "Occupancy certificate confirmed before we present the property",
      "Move in or rent out within weeks, not years",
      "Zero construction-delay or builder-default risk",
      "Immediate loan disbursement — no under-construction restrictions",
    ],
    idealFor: ["Buyers needing to move in immediately", "Anyone who has been burned by construction delays before"],
    icon: Home,
    tone: "gold" as MediaTone,
  },
];

export type PropertyCategorySlug =
  | "bank-auctions"
  | "rental-income"
  | "chance-deals"
  | "resale"
  | "upcoming-projects"
  | "ready-to-move";

export interface AuctionInfo {
  bankName: string;
  auctionDate: string;
  reservePrice: string;
  emd: string;
}

export interface LoanEligibility {
  maxLoanAmount: string;
  indicativeEmi: string;
  partnerBanks: string[];
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  location: string;
  price: string;
  priceValueLakh: number;
  type: string;
  categorySlug: PropertyCategorySlug;
  beds: number;
  baths: number;
  area: string;
  areaSqft: number;
  featured: boolean;
  description: string;
  /** Real photograph path (public/) — falls back to the MediaPlaceholder
   *  gradient via `gallery` when not set. */
  image?: string;
  gallery: MediaTone[];
  amenities: string[];
  investmentHighlights: string[];
  auctionInfo?: AuctionInfo;
  loanEligibility: LoanEligibility;
  documents: string[];
  mapQuery: string;
}

const STANDARD_BANKS = ["HDFC Bank", "SBI", "ICICI Bank", "Axis Bank", "LIC Housing Finance"];

const STANDARD_DOCS = [
  "Sale Deed",
  "Encumbrance Certificate (EC)",
  "Khata Certificate",
  "RTC (Record of Rights)",
  "Property Tax Receipts",
  "Approved Building Plan",
];

export const PROPERTIES: Property[] = [
  {
    id: "p1",
    slug: "whitefield-garden-residence",
    title: "Whitefield Garden Residence",
    location: "Whitefield, Bengaluru",
    price: "₹ 2.4 Cr",
    priceValueLakh: 240,
    type: "Bank Auction",
    categorySlug: "bank-auctions",
    beds: 4,
    baths: 4,
    area: "3,200 sq.ft",
    areaSqft: 3200,
    featured: true,
    description:
      "A spacious four-bedroom residence in Whitefield's established garden layout, brought to market through a bank auction with clean, fully verified title.",
    image: "/img1.jpg",
    gallery: ["warm", "charcoal", "gold", "warm"],
    amenities: [
      "24x7 Security",
      "Covered Parking",
      "Power Backup",
      "Landscaped Garden",
      "Lift Access",
      "Rainwater Harvesting",
    ],
    investmentHighlights: [
      "Acquired 18-22% below comparable resale rates via the auction route",
      "Whitefield micro-market has posted 12-15% YoY appreciation over 3 years",
      "Walking distance to Whitefield Metro corridor (under construction)",
    ],
    auctionInfo: {
      bankName: "State Bank of India, SARFAESI Auction",
      auctionDate: "22 September 2026",
      reservePrice: "₹ 2.15 Cr",
      emd: "₹ 21.5 Lakh",
    },
    loanEligibility: {
      maxLoanAmount: "Up to ₹ 1.9 Cr (80% of valuation)",
      indicativeEmi: "≈ ₹ 1.48 Lakh / month at 8.7% for 20 years",
      partnerBanks: STANDARD_BANKS,
    },
    documents: [...STANDARD_DOCS, "SARFAESI Auction Notice"],
    mapQuery: "Whitefield, Bengaluru, Karnataka",
  },
  {
    id: "p2",
    slug: "sarjapur-emerald-villa",
    title: "Sarjapur Emerald Villa",
    location: "Sarjapur Road, Bengaluru",
    price: "₹ 3.1 Cr",
    priceValueLakh: 310,
    type: "Ready To Move",
    categorySlug: "ready-to-move",
    beds: 5,
    baths: 5,
    area: "4,000 sq.ft",
    areaSqft: 4000,
    featured: true,
    description:
      "A move-in ready villa in a gated community off Sarjapur Road, with occupancy certificate in hand and no waiting on construction timelines.",
    image: "/img2.jpg",
    gallery: ["emerald", "warm", "charcoal", "gold"],
    amenities: [
      "Gated Community",
      "Clubhouse & Gym",
      "Children's Play Area",
      "CCTV Surveillance",
      "Covered Parking",
      "Modular Kitchen",
    ],
    investmentHighlights: [
      "Occupancy certificate already issued — zero possession risk",
      "Sarjapur Road corridor benefits from proximity to major tech campuses",
      "Gated villa community with established resale liquidity",
    ],
    loanEligibility: {
      maxLoanAmount: "Up to ₹ 2.48 Cr (80% of valuation)",
      indicativeEmi: "≈ ₹ 1.93 Lakh / month at 8.7% for 20 years",
      partnerBanks: STANDARD_BANKS,
    },
    documents: [...STANDARD_DOCS, "Occupancy Certificate"],
    mapQuery: "Sarjapur Road, Bengaluru, Karnataka",
  },
  {
    id: "p3",
    slug: "indiranagar-heritage-home",
    title: "Indiranagar Heritage Home",
    location: "Indiranagar, Bengaluru",
    price: "₹ 5.8 Cr",
    priceValueLakh: 580,
    type: "Resale",
    categorySlug: "resale",
    beds: 4,
    baths: 3,
    area: "2,800 sq.ft",
    areaSqft: 2800,
    featured: true,
    description:
      "A character-filled independent home on a quiet Indiranagar street, title-checked and khata-verified, in one of Bengaluru's most established addresses.",
    image: "/img3.jpeg",
    gallery: ["gold", "warm", "charcoal", "emerald"],
    amenities: [
      "Covered Parking",
      "Private Garden",
      "Power Backup",
      "Vaastu Compliant",
      "24x7 Security",
    ],
    investmentHighlights: [
      "Indiranagar remains one of Bengaluru's most land-constrained, high-demand addresses",
      "Independent plot with redevelopment upside",
      "Walking distance to Indiranagar Metro station",
    ],
    loanEligibility: {
      maxLoanAmount: "Up to ₹ 4.64 Cr (80% of valuation)",
      indicativeEmi: "≈ ₹ 3.61 Lakh / month at 8.7% for 20 years",
      partnerBanks: STANDARD_BANKS,
    },
    documents: STANDARD_DOCS,
    mapQuery: "Indiranagar, Bengaluru, Karnataka",
  },
  {
    id: "p4",
    slug: "hebbal-skyline-residences",
    title: "Hebbal Skyline Residences",
    location: "Hebbal, Bengaluru",
    price: "₹ 1.9 Cr",
    priceValueLakh: 190,
    type: "Upcoming Project",
    categorySlug: "upcoming-projects",
    beds: 3,
    baths: 3,
    area: "1,950 sq.ft",
    areaSqft: 1950,
    featured: true,
    description:
      "Early-access units in a RERA-approved high-rise overlooking Hebbal Lake, from a builder we've vetted for on-time delivery.",
    image: "/img4.avif",
    gallery: ["charcoal", "gold", "warm", "emerald"],
    amenities: [
      "Clubhouse & Gym",
      "Swimming Pool",
      "Children's Play Area",
      "Landscaped Garden",
      "Covered Parking",
      "Lift Access",
    ],
    investmentHighlights: [
      "Pre-launch pricing, 15-20% below expected possession-time value",
      "Direct lake and airport-road connectivity",
      "Builder track record of on-time delivery across 3 prior projects",
    ],
    loanEligibility: {
      maxLoanAmount: "Up to ₹ 1.52 Cr (80% of valuation)",
      indicativeEmi: "≈ ₹ 1.18 Lakh / month at 8.7% for 20 years",
      partnerBanks: STANDARD_BANKS,
    },
    documents: ["RERA Registration", "Approved Building Plan", "Builder-Buyer Agreement (Draft)"],
    mapQuery: "Hebbal, Bengaluru, Karnataka",
  },
  {
    id: "p5",
    slug: "jp-nagar-courtyard-house",
    title: "JP Nagar Courtyard House",
    location: "JP Nagar, Bengaluru",
    price: "₹ 2.9 Cr",
    priceValueLakh: 290,
    type: "Chance Deal",
    categorySlug: "chance-deals",
    beds: 4,
    baths: 4,
    area: "3,000 sq.ft",
    areaSqft: 3000,
    featured: true,
    description:
      "A time-sensitive off-market opportunity in JP Nagar's Phase 4, sourced directly before it reached broker listings.",
    image: "/img5.jpg",
    gallery: ["warm", "gold", "charcoal", "warm"],
    amenities: [
      "Private Courtyard",
      "Covered Parking",
      "24x7 Security",
      "Power Backup",
      "Vaastu Compliant",
    ],
    investmentHighlights: [
      "Off-market sourcing — priced below current JP Nagar listing averages",
      "Established social infrastructure and metro connectivity",
      "Motivated seller — fast-track registration possible",
    ],
    loanEligibility: {
      maxLoanAmount: "Up to ₹ 2.32 Cr (80% of valuation)",
      indicativeEmi: "≈ ₹ 1.80 Lakh / month at 8.7% for 20 years",
      partnerBanks: STANDARD_BANKS,
    },
    documents: STANDARD_DOCS,
    mapQuery: "JP Nagar, Bengaluru, Karnataka",
  },
  {
    id: "p6",
    slug: "koramangala-rental-suites",
    title: "Koramangala Rental Suites",
    location: "Koramangala, Bengaluru",
    price: "₹ 1.6 Cr",
    priceValueLakh: 160,
    type: "Rental Income",
    categorySlug: "rental-income",
    beds: 2,
    baths: 2,
    area: "1,400 sq.ft",
    areaSqft: 1400,
    featured: true,
    description:
      "A compact, high-yield unit in Koramangala selected specifically for rental income — strong tenant demand from the surrounding startup and tech corridor.",
    image: "/img6.jpg",
    gallery: ["emerald", "charcoal", "warm", "gold"],
    amenities: [
      "Gated Community",
      "Covered Parking",
      "24x7 Security",
      "Lift Access",
      "Modular Kitchen",
    ],
    investmentHighlights: [
      "Average rental yield of 3.5-4%, above the city median",
      "Consistently low vacancy — strong demand from Koramangala's tech workforce",
      "Compact ticket size with high liquidity on resale",
    ],
    loanEligibility: {
      maxLoanAmount: "Up to ₹ 1.28 Cr (80% of valuation)",
      indicativeEmi: "≈ ₹ 0.99 Lakh / month at 8.7% for 20 years",
      partnerBanks: STANDARD_BANKS,
    },
    documents: STANDARD_DOCS,
    mapQuery: "Koramangala, Bengaluru, Karnataka",
  },
  {
    id: "p7",
    slug: "yelahanka-lakeview-bungalow",
    title: "Yelahanka Lakeview Bungalow",
    location: "Yelahanka, Bengaluru",
    price: "₹ 2.1 Cr",
    priceValueLakh: 210,
    type: "Bank Auction",
    categorySlug: "bank-auctions",
    beds: 3,
    baths: 3,
    area: "2,400 sq.ft",
    areaSqft: 2400,
    featured: false,
    description:
      "A bank-auctioned bungalow overlooking Yelahanka Lake, with independent legal verification completed ahead of listing.",
    image: "/img2.jpg",
    gallery: ["warm", "emerald", "gold"],
    amenities: ["24x7 Security", "Covered Parking", "Private Garden", "Power Backup"],
    investmentHighlights: [
      "Lakefront positioning, rare at this price point",
      "Yelahanka's proximity to the airport corridor continues to drive demand",
    ],
    auctionInfo: {
      bankName: "Canara Bank, SARFAESI Auction",
      auctionDate: "5 October 2026",
      reservePrice: "₹ 1.85 Cr",
      emd: "₹ 18.5 Lakh",
    },
    loanEligibility: {
      maxLoanAmount: "Up to ₹ 1.68 Cr (80% of valuation)",
      indicativeEmi: "≈ ₹ 1.30 Lakh / month at 8.7% for 20 years",
      partnerBanks: STANDARD_BANKS,
    },
    documents: [...STANDARD_DOCS, "SARFAESI Auction Notice"],
    mapQuery: "Yelahanka, Bengaluru, Karnataka",
  },
  {
    id: "p8",
    slug: "electronic-city-tech-homes",
    title: "Electronic City Tech Homes",
    location: "Electronic City, Bengaluru",
    price: "₹ 1.2 Cr",
    priceValueLakh: 120,
    type: "Rental Income",
    categorySlug: "rental-income",
    beds: 2,
    baths: 2,
    area: "1,150 sq.ft",
    areaSqft: 1150,
    featured: false,
    description:
      "A tightly-managed apartment community close to Electronic City's tech parks, chosen for consistent rental demand and low upkeep.",
    image: "/img1.jpg",
    gallery: ["charcoal", "warm", "emerald"],
    amenities: ["Gated Community", "Clubhouse & Gym", "Covered Parking", "CCTV Surveillance"],
    investmentHighlights: [
      "Sub-₹1.5 Cr entry point with dependable tenant demand",
      "Direct connectivity via NICE Road and Hosur Road",
    ],
    loanEligibility: {
      maxLoanAmount: "Up to ₹ 96 Lakh (80% of valuation)",
      indicativeEmi: "≈ ₹ 0.74 Lakh / month at 8.7% for 20 years",
      partnerBanks: STANDARD_BANKS,
    },
    documents: STANDARD_DOCS,
    mapQuery: "Electronic City, Bengaluru, Karnataka",
  },
  {
    id: "p9",
    slug: "hsr-layout-corner-plot-home",
    title: "HSR Layout Corner Plot Home",
    location: "HSR Layout, Bengaluru",
    price: "₹ 4.2 Cr",
    priceValueLakh: 420,
    type: "Resale",
    categorySlug: "resale",
    beds: 4,
    baths: 4,
    area: "2,600 sq.ft",
    areaSqft: 2600,
    featured: false,
    description:
      "A corner-plot independent home in HSR Layout's Sector 2, khata-verified with clean, single-owner title history.",
    image: "/img3.jpeg",
    gallery: ["gold", "charcoal", "warm"],
    amenities: ["Covered Parking", "Private Garden", "24x7 Security", "Vaastu Compliant"],
    investmentHighlights: [
      "Corner plot — rare configuration with redevelopment flexibility",
      "HSR Layout continues to command premium resale demand",
    ],
    loanEligibility: {
      maxLoanAmount: "Up to ₹ 3.36 Cr (80% of valuation)",
      indicativeEmi: "≈ ₹ 2.61 Lakh / month at 8.7% for 20 years",
      partnerBanks: STANDARD_BANKS,
    },
    documents: STANDARD_DOCS,
    mapQuery: "HSR Layout, Bengaluru, Karnataka",
  },
  {
    id: "p10",
    slug: "devanahalli-aerocity-plots",
    title: "Devanahalli Aerocity Residences",
    location: "Devanahalli, Bengaluru",
    price: "₹ 1.4 Cr",
    priceValueLakh: 140,
    type: "Upcoming Project",
    categorySlug: "upcoming-projects",
    beds: 3,
    baths: 2,
    area: "1,650 sq.ft",
    areaSqft: 1650,
    featured: false,
    description:
      "Pre-launch inventory near the Devanahalli Aerocity corridor, from a RERA-registered developer with early-bird pricing.",
    image: "/img5.jpg",
    gallery: ["emerald", "gold", "warm"],
    amenities: ["Clubhouse & Gym", "Landscaped Garden", "Covered Parking", "Lift Access"],
    investmentHighlights: [
      "Positioned along Bengaluru's fastest-growing north corridor",
      "Early-bird pricing ahead of Aerocity infrastructure completion",
    ],
    loanEligibility: {
      maxLoanAmount: "Up to ₹ 1.12 Cr (80% of valuation)",
      indicativeEmi: "≈ ₹ 0.87 Lakh / month at 8.7% for 20 years",
      partnerBanks: STANDARD_BANKS,
    },
    documents: ["RERA Registration", "Approved Building Plan", "Builder-Buyer Agreement (Draft)"],
    mapQuery: "Devanahalli, Bengaluru, Karnataka",
  },
  {
    id: "p11",
    slug: "malleshwaram-classic-bungalow",
    title: "Malleshwaram Classic Bungalow",
    location: "Malleshwaram, Bengaluru",
    price: "₹ 6.5 Cr",
    priceValueLakh: 650,
    type: "Chance Deal",
    categorySlug: "chance-deals",
    beds: 5,
    baths: 4,
    area: "3,600 sq.ft",
    areaSqft: 3600,
    featured: false,
    description:
      "A rare full-plot bungalow in Malleshwaram's heritage core, sourced off-market ahead of any public listing.",
    image: "/img4.avif",
    gallery: ["warm", "gold", "emerald"],
    amenities: ["Private Garden", "Covered Parking", "24x7 Security", "Power Backup"],
    investmentHighlights: [
      "Full-plot heritage-zone property — increasingly rare inventory",
      "Off-market pricing below comparable Malleshwaram listings",
    ],
    loanEligibility: {
      maxLoanAmount: "Up to ₹ 5.2 Cr (80% of valuation)",
      indicativeEmi: "≈ ₹ 4.04 Lakh / month at 8.7% for 20 years",
      partnerBanks: STANDARD_BANKS,
    },
    documents: STANDARD_DOCS,
    mapQuery: "Malleshwaram, Bengaluru, Karnataka",
  },
  {
    id: "p12",
    slug: "bannerghatta-road-move-in-ready",
    title: "Bannerghatta Road Move-In Ready Home",
    location: "Bannerghatta Road, Bengaluru",
    price: "₹ 1.75 Cr",
    priceValueLakh: 175,
    type: "Ready To Move",
    categorySlug: "ready-to-move",
    beds: 3,
    baths: 2,
    area: "1,700 sq.ft",
    areaSqft: 1700,
    featured: false,
    description:
      "A ready-to-move apartment near Bannerghatta Road's biotech corridor, occupancy certificate in hand.",
    image: "/img6.jpg",
    gallery: ["charcoal", "emerald", "gold"],
    amenities: ["Gated Community", "Clubhouse & Gym", "Covered Parking", "CCTV Surveillance"],
    investmentHighlights: [
      "Occupancy certificate already issued — move in within weeks",
      "Close to Bannerghatta Road's biotech and healthcare hub",
    ],
    loanEligibility: {
      maxLoanAmount: "Up to ₹ 1.4 Cr (80% of valuation)",
      indicativeEmi: "≈ ₹ 1.09 Lakh / month at 8.7% for 20 years",
      partnerBanks: STANDARD_BANKS,
    },
    documents: [...STANDARD_DOCS, "Occupancy Certificate"],
    mapQuery: "Bannerghatta Road, Bengaluru, Karnataka",
  },
];

export const LOCATIONS = Array.from(
  new Set(PROPERTIES.map((p) => p.location.split(",")[0]))
).sort();

export const BUDGET_RANGES = [
  { label: "Any Budget", min: 0, max: Infinity },
  { label: "Under ₹1.5 Cr", min: 0, max: 150 },
  { label: "₹1.5 Cr – ₹3 Cr", min: 150, max: 300 },
  { label: "₹3 Cr – ₹5 Cr", min: 300, max: 500 },
  { label: "Above ₹5 Cr", min: 500, max: Infinity },
];

export function getPropertyBySlug(slug: string) {
  return PROPERTIES.find((p) => p.slug === slug);
}

export function getRelatedProperties(property: Property, count = 3) {
  return PROPERTIES.filter(
    (p) =>
      p.id !== property.id &&
      (p.categorySlug === property.categorySlug ||
        p.location === property.location)
  ).slice(0, count);
}

export const PILLARS = [
  {
    title: "Trust",
    description:
      "Every relationship starts with transparency — no hidden costs, no rushed decisions.",
    icon: ShieldCheck,
  },
  {
    title: "Legal Support",
    description:
      "Independent legal verification on every title before a rupee changes hands.",
    icon: Scale,
  },
  {
    title: "Loan Assistance",
    description:
      "Bank tie-ups and hands-on support to structure financing that fits you.",
    icon: Landmark,
  },
  {
    title: "Investment Guidance",
    description:
      "Data-led counsel on yield, growth corridors, and long-term value.",
    icon: TrendingUp,
  },
];

export const AUCTION_JOURNEY = [
  {
    title: "Property Identification",
    description:
      "We shortlist auction properties matched to your budget and investment goals.",
    icon: Search,
  },
  {
    title: "Legal Verification",
    description:
      "Full title, encumbrance, and litigation check before you commit any capital.",
    icon: FileCheck2,
  },
  {
    title: "Bidding Support",
    description:
      "Guided participation in the bank auction, with valuation and bid strategy.",
    icon: Handshake,
  },
  {
    title: "Loan Arrangement",
    description: "Financing structured and coordinated with our banking partners.",
    icon: Landmark,
  },
  {
    title: "Registration",
    description: "End-to-end support through sale deed execution and registration.",
    icon: Stamp,
  },
  {
    title: "Khata Transfer",
    description: "Documentation followed through to a clean, transferred khata.",
    icon: FileSignature,
  },
];

export const PROCESS_STEPS = [
  {
    title: "Property Selection",
    description:
      "We shortlist properties matched to your budget, timeline, and investment goals — across every category we work in.",
    detail:
      "Every engagement starts with understanding what you're actually trying to achieve — a home to live in, a yield-generating asset, or a long-term appreciation play. We shortlist from bank auctions, resale, rental-income assets, off-market chance deals, and builder projects based on that goal, not on what happens to be listed that week.",
    icon: Compass,
  },
  {
    title: "Legal Verification",
    description:
      "Independent title, encumbrance, and litigation checks completed before you commit any capital.",
    detail:
      "Before any property reaches you, our legal team runs a full title chain review, encumbrance certificate check, and litigation search. For auction properties this includes SARFAESI notice verification; for resale, khata and succession history. You get a written legal opinion, not a verbal assurance.",
    icon: FileCheck2,
  },
  {
    title: "Bank Auction Process",
    description:
      "Guided participation in SARFAESI bank auctions, from EMD to final bid.",
    detail:
      "Bank auctions move fast and reward preparation. We help you understand reserve pricing, structure your EMD, and set a bid ceiling based on independent valuation — so you're never bidding on emotion or guesswork.",
    icon: Gavel,
  },
  {
    title: "Loan Arrangement",
    description: "Financing structured and coordinated with our banking partners.",
    detail:
      "We work with HDFC Bank, SBI, ICICI, Axis, and LIC Housing Finance to structure financing suited to your profile — including auction-specific lending, which not every bank handles the same way. We coordinate eligibility assessment through disbursement.",
    icon: Landmark,
  },
  {
    title: "Registration",
    description: "End-to-end support through sale deed execution and registration.",
    detail:
      "From stamp duty calculation to sub-registrar appointment, we manage the logistics of registration so the process is predictable rather than a scramble at the end.",
    icon: Stamp,
  },
  {
    title: "Khata Transfer",
    description: "Documentation followed through to a clean, transferred khata.",
    detail:
      "A registered sale deed isn't the finish line — khata transfer is what actually puts the property in your name for municipal and tax purposes. We follow this through to completion, not just to the point of sale.",
    icon: FileSignature,
  },
  {
    title: "Investment Consultation",
    description:
      "Ongoing, data-led counsel on yield, growth corridors, and portfolio strategy.",
    detail:
      "For many clients, one property becomes three or four over time. We stay engaged past the first transaction — advising on when to hold, when to sell, and where the next opportunity in Bengaluru's market is likely to emerge.",
    icon: LineChart,
  },
];

export const BUILDERS = [
  "Prestige Group",
  "Sobha Limited",
  "Brigade Group",
  "Puravankara",
  "Godrej Properties",
  "Embassy Group",
  "Shriram Properties",
  "Salarpuria Sattva",
];

export const TESTIMONIALS = [
  {
    name: "Ramesh Iyer",
    role: "Bank Auction Buyer, Whitefield",
    quote:
      "Sarakki Homes walked us through a bank auction we'd never have attempted alone. Every document was verified before we bid — no surprises after.",
  },
  {
    name: "Divya & Arjun Rao",
    role: "First-time Buyers, Sarjapur",
    quote:
      "What stood out was how little they pushed. It felt like counsel, not sales. We understood every rupee and every clause.",
  },
  {
    name: "Kavitha Menon",
    role: "Investor, Koramangala",
    quote:
      "Their rental yield analysis was more rigorous than what our bank gave us. Three properties later, still the only firm we call first.",
  },
];

export const FAQS = [
  {
    question: "How does the bank auction process work with Sarakki Homes?",
    answer:
      "We identify verified auction properties, complete independent legal due-diligence, guide you through the bidding process, and support financing, registration, and khata transfer end to end.",
  },
  {
    question: "Do you charge for legal verification?",
    answer:
      "Legal verification is included as part of our consultancy engagement for every property we present — it's core to how we work, not an add-on.",
  },
  {
    question: "Can you help arrange a home loan?",
    answer:
      "Yes. We work with multiple banking partners to structure financing suited to your situation, from eligibility assessment through disbursement.",
  },
  {
    question: "What is khata transfer, and do you handle it?",
    answer:
      "Khata transfer registers you as the property's owner in municipal records for tax purposes. We manage this documentation through to completion.",
  },
  {
    question: "Which areas of Bengaluru do you operate in?",
    answer:
      "We're active across Bengaluru's key corridors — Whitefield, Sarjapur Road, Indiranagar, Hebbal, JP Nagar, Koramangala, and surrounding growth areas.",
  },
];
