"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ChevronRight,
  ChevronLeft,
  Loader2,
  Building,
  DollarSign,
  Gavel,
  Sliders,
  Image as ImageIcon,
  Search,
  CheckCircle2,
} from "lucide-react";

// Form validation schema with Zod
const propertySchema = z.object({
  title: z.string().min(3, "Property name must be at least 3 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  builderId: z.string().min(1, "Please select a builder"),
  type: z.string().min(1, "Please select a type (e.g. Bank Auction, Resale)"),
  price: z.string().min(1, "Price description is required (e.g. ₹ 2.4 Cr)"),
  priceValueLakh: z.string().transform((val) => parseFloat(val) || 0),
  location: z.string().min(1, "Location is required (e.g. Whitefield, Bengaluru)"),
  address: z.string().min(1, "Address is required"),
  mapQuery: z.string().min(1, "Google Maps query is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  
  // Auction Info (optional)
  auctionInfo: z.object({
    bankName: z.string().optional(),
    auctionDate: z.string().optional(),
    emd: z.string().optional(),
    reservePrice: z.string().optional(),
    physicalPossession: z.boolean().default(false),
    legalStatus: z.string().optional(),
  }).optional(),

  // Details
  beds: z.string().transform((val) => parseInt(val) || 0),
  baths: z.string().transform((val) => parseInt(val) || 0),
  area: z.string().min(1, "Area display value is required (e.g. 3,200 sq.ft)"),
  areaSqft: z.string().transform((val) => parseInt(val) || 0),

  // Media
  imageUrl: z.string().url("Must be a valid image URL").or(z.string().length(0)),

  // SEO
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  slug: z.string().optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface PropertyWizardProps {
  categories: Array<{ id: string; title: string }>;
  builders: Array<{ id: string; name: string }>;
  initialData?: any;
}

const STEPS = [
  { label: "Basic Info", icon: Building },
  { label: "Auction Info", icon: Gavel },
  { label: "Property Details", icon: Sliders },
  { label: "Media & Attachments", icon: ImageIcon },
  { label: "SEO Config", icon: Search },
  { label: "Review & Publish", icon: CheckCircle2 },
];

export function PropertyWizard({ categories, builders, initialData }: PropertyWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: initialData || {
      title: "",
      categoryId: "",
      builderId: "",
      type: "Bank Auction",
      price: "",
      priceValueLakh: "0",
      location: "",
      address: "",
      mapQuery: "",
      description: "",
      auctionInfo: {
        bankName: "",
        auctionDate: "",
        emd: "",
        reservePrice: "",
        physicalPossession: false,
        legalStatus: "Title Verified",
      },
      beds: "0",
      baths: "0",
      area: "",
      areaSqft: "0",
      imageUrl: "",
      seoTitle: "",
      seoDescription: "",
      slug: "",
    },
  });

  const propertyType = watch("type");
  const formValues = watch();

  const handleNext = () => {
    // Basic step validation before moving forward
    if (currentStep === 0) {
      if (!formValues.title || !formValues.categoryId || !formValues.builderId || !formValues.location) {
        setErrorMessage("Please fill in all required Basic Info fields.");
        return;
      }
    }
    setErrorMessage("");
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setErrorMessage("");
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const endpoint = initialData ? `/api/admin/properties/${initialData.id}` : "/api/admin/properties";
      const method = initialData ? "PUT" : "POST";

      // Map image url to structure expected by database schema
      const payload = {
        ...data,
        images: data.imageUrl ? [{ url: data.imageUrl }] : [],
      };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/admin/properties");
        router.refresh();
      } else {
        const errData = await res.json();
        setErrorMessage(errData.error || "Failed to submit property. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Wizard Step Navigation (Left Panel) */}
      <div className="lg:col-span-1 space-y-3">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;

          return (
            <div
              key={step.label}
              className={cn(
                "flex items-center gap-3.5 rounded-sm p-3.5 border transition-all duration-300",
                isActive
                  ? "border-accent-gold/40 bg-accent-gold/[0.02] text-foreground font-semibold"
                  : isCompleted
                  ? "border-border/20 bg-background text-muted-foreground"
                  : "border-border/10 bg-background/40 text-muted-foreground/50"
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold shrink-0",
                  isActive
                    ? "border-accent-gold text-accent-gold-dark"
                    : isCompleted
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                    : "border-border/40 text-muted-foreground/40"
                )}
              >
                {isCompleted ? "✓" : idx + 1}
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wider">{step.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form Steps Panel (Right Panel) */}
      <div className="lg:col-span-3 rounded-sm border border-border/20 bg-card/25 p-8 backdrop-blur-md">
        {errorMessage && (
          <div className="mb-6 rounded-sm border border-red-500/10 bg-red-500/5 px-4 py-3 text-xs text-red-400">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Information */}
            {currentStep === 0 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-sm font-semibold tracking-wide text-foreground">Basic Information</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Core listing parameters for buyers.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Property Name</label>
                    <input
                      type="text"
                      {...register("title")}
                      className="w-full rounded-sm border border-border/40 bg-background/40 py-2.5 px-3.5 text-xs text-foreground outline-none focus:border-accent-gold/40"
                      placeholder="e.g. Prestige Lavender Residences"
                    />
                    {errors.title && <span className="text-[10px] text-red-400">{errors.title.message}</span>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Property Type</label>
                    <select
                      {...register("type")}
                      className="w-full rounded-sm border border-border/40 bg-background/40 py-2.5 px-3.5 text-xs text-muted-foreground outline-none focus:border-accent-gold/40"
                    >
                      <option value="Bank Auction">Bank Auction</option>
                      <option value="Resale">Resale</option>
                      <option value="Ready To Move">Ready To Move</option>
                      <option value="Rental Income">Rental Income</option>
                      <option value="Upcoming Project">Upcoming Project</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
                    <select
                      {...register("categoryId")}
                      className="w-full rounded-sm border border-border/40 bg-background/40 py-2.5 px-3.5 text-xs text-muted-foreground outline-none focus:border-accent-gold/40"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Builder</label>
                    <select
                      {...register("builderId")}
                      className="w-full rounded-sm border border-border/40 bg-background/40 py-2.5 px-3.5 text-xs text-muted-foreground outline-none focus:border-accent-gold/40"
                    >
                      <option value="">Select Builder</option>
                      {builders.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Price (Display Text)</label>
                    <input
                      type="text"
                      {...register("price")}
                      className="w-full rounded-sm border border-border/40 bg-background/40 py-2.5 px-3.5 text-xs text-foreground outline-none focus:border-accent-gold/40"
                      placeholder="e.g. ₹ 2.4 Cr or ₹ 85 Lakh"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Price Value in Lakhs</label>
                    <input
                      type="number"
                      {...register("priceValueLakh")}
                      className="w-full rounded-sm border border-border/40 bg-background/40 py-2.5 px-3.5 text-xs text-foreground outline-none focus:border-accent-gold/40"
                      placeholder="e.g. 240 or 85"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Location (Short Address)</label>
                    <input
                      type="text"
                      {...register("location")}
                      className="w-full rounded-sm border border-border/40 bg-background/40 py-2.5 px-3.5 text-xs text-foreground outline-none focus:border-accent-gold/40"
                      placeholder="e.g. Whitefield, Bengaluru"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Address (Full Details)</label>
                    <input
                      type="text"
                      {...register("address")}
                      className="w-full rounded-sm border border-border/40 bg-background/40 py-2.5 px-3.5 text-xs text-foreground outline-none focus:border-accent-gold/40"
                      placeholder="e.g. Plot 15, Garden Layout, Phase 3, Whitefield, Bengaluru"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Google Maps Location Query</label>
                    <input
                      type="text"
                      {...register("mapQuery")}
                      className="w-full rounded-sm border border-border/40 bg-background/40 py-2.5 px-3.5 text-xs text-foreground outline-none focus:border-accent-gold/40"
                      placeholder="e.g. Prestige Shantiniketan, Whitefield, Bengaluru"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Description</label>
                    <textarea
                      rows={5}
                      {...register("description")}
                      className="w-full rounded-sm border border-border/40 bg-background/40 py-2.5 px-3.5 text-xs text-foreground outline-none focus:border-accent-gold/40 resize-none"
                      placeholder="Enter a descriptive overview of the property..."
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Auction Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-sm font-semibold tracking-wide text-foreground">Auction Information</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Required fields only if the type is "Bank Auction".</p>
                </div>

                {propertyType !== "Bank Auction" ? (
                  <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border/20 rounded-sm">
                    This property is not categorized as a Bank Auction. You can skip this step.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Bank Name / Notice Info</label>
                      <input
                        type="text"
                        {...register("auctionInfo.bankName")}
                        className="w-full rounded-sm border border-border/40 bg-background/40 py-2.5 px-3.5 text-xs text-foreground outline-none focus:border-accent-gold/40"
                        placeholder="e.g. State Bank of India, SARFAESI Auction"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Auction Date</label>
                      <input
                        type="date"
                        {...register("auctionInfo.auctionDate")}
                        className="w-full rounded-sm border border-border/40 bg-background/40 py-2.5 px-3.5 text-xs text-muted-foreground outline-none focus:border-accent-gold/40"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">EMD Amount</label>
                      <input
                        type="text"
                        {...register("auctionInfo.emd")}
                        className="w-full rounded-sm border border-border/40 bg-background/40 py-2.5 px-3.5 text-xs text-foreground outline-none focus:border-accent-gold/40"
                        placeholder="e.g. ₹ 21.5 Lakh"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Reserve Price</label>
                      <input
                        type="text"
                        {...register("auctionInfo.reservePrice")}
                        className="w-full rounded-sm border border-border/40 bg-background/40 py-2.5 px-3.5 text-xs text-foreground outline-none focus:border-accent-gold/40"
                        placeholder="e.g. ₹ 2.15 Cr"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Legal Status</label>
                      <input
                        type="text"
                        {...register("auctionInfo.legalStatus")}
                        className="w-full rounded-sm border border-border/40 bg-background/40 py-2.5 px-3.5 text-xs text-foreground outline-none focus:border-accent-gold/40"
                        placeholder="e.g. Title Verified, Clear Deed"
                      />
                    </div>

                    <div className="space-y-1.5 flex items-center justify-between border border-border/20 bg-background/40 rounded-sm p-4 mt-6 md:col-span-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-foreground">Physical Possession</span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">Has the bank taken active physical possession?</span>
                      </div>
                      <input
                        type="checkbox"
                        {...register("auctionInfo.physicalPossession")}
                        className="h-4 w-4 rounded border border-border/40 accent-accent-gold"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Property Details */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-sm font-semibold tracking-wide text-foreground">Property Details</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Specific metrics and structural definitions.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Bedrooms</label>
                    <input
                      type="number"
                      {...register("beds")}
                      className="w-full rounded-sm border border-border/40 bg-background/40 py-2.5 px-3.5 text-xs text-foreground outline-none focus:border-accent-gold/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Bathrooms</label>
                    <input
                      type="number"
                      {...register("baths")}
                      className="w-full rounded-sm border border-border/40 bg-background/40 py-2.5 px-3.5 text-xs text-foreground outline-none focus:border-accent-gold/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Area Display Text</label>
                    <input
                      type="text"
                      {...register("area")}
                      className="w-full rounded-sm border border-border/40 bg-background/40 py-2.5 px-3.5 text-xs text-foreground outline-none focus:border-accent-gold/40"
                      placeholder="e.g. 3,200 sq.ft"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Area in Sqft (Value)</label>
                    <input
                      type="number"
                      {...register("areaSqft")}
                      className="w-full rounded-sm border border-border/40 bg-background/40 py-2.5 px-3.5 text-xs text-foreground outline-none focus:border-accent-gold/40"
                      placeholder="e.g. 3200"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Media & Images */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-sm font-semibold tracking-wide text-foreground">Media & Attachments</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Attach the primary header image URL.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Primary Image URL</label>
                    <input
                      type="text"
                      {...register("imageUrl")}
                      className="w-full rounded-sm border border-border/40 bg-background/40 py-2.5 px-3.5 text-xs text-foreground outline-none focus:border-accent-gold/40"
                      placeholder="e.g. /media/re.jpg or an external link"
                    />
                    {errors.imageUrl && <span className="text-[10px] text-red-400">{errors.imageUrl.message}</span>}
                  </div>

                  <div className="p-12 text-center text-xs text-muted-foreground border border-dashed border-border/20 bg-background/40 rounded-sm">
                    Drag and Drop uploads will route through Cloudinary API key settings once keys are supplied in settings panel.
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: SEO Configuration */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-sm font-semibold tracking-wide text-foreground">SEO Config</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Define metadata parameters for search indexing.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">SEO Title Override</label>
                    <input
                      type="text"
                      {...register("seoTitle")}
                      className="w-full rounded-sm border border-border/40 bg-background/40 py-2.5 px-3.5 text-xs text-foreground outline-none focus:border-accent-gold/40"
                      placeholder="Keep empty to use Property Name"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">SEO Meta Description</label>
                    <textarea
                      rows={3}
                      {...register("seoDescription")}
                      className="w-full rounded-sm border border-border/40 bg-background/40 py-2.5 px-3.5 text-xs text-foreground outline-none focus:border-accent-gold/40 resize-none"
                      placeholder="Summarize listing in 150-160 characters..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Slug (URL endpoint)</label>
                    <input
                      type="text"
                      {...register("slug")}
                      className="w-full rounded-sm border border-border/40 bg-background/40 py-2.5 px-3.5 text-xs text-foreground outline-none focus:border-accent-gold/40"
                      placeholder="e.g. sarjapur-emerald-villa"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 6: Review & Submit */}
            {currentStep === 5 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-sm font-semibold tracking-wide text-foreground">Review & Publish</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Please review listing details before saving to local database.</p>
                </div>

                <div className="border border-border/20 bg-background/30 rounded-sm p-6 space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-muted-foreground font-medium block">Name</span>
                      <strong className="text-foreground text-sm font-semibold">{formValues.title || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground font-medium block">Type</span>
                      <strong className="text-foreground">{formValues.type}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground font-medium block">Price</span>
                      <strong className="text-foreground font-semibold">{formValues.price || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Location</span>
                      <strong className="text-foreground">{formValues.location || "N/A"}</strong>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Actions Buttons */}
          <div className="flex items-center justify-between border-t border-border/20 pt-6 mt-8">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0 || loading}
              className="inline-flex items-center gap-1.5 rounded-sm border border-border/40 hover:bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-all duration-200 disabled:opacity-30"
            >
              <ChevronLeft size={14} />
              <span>Back</span>
            </button>

            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 rounded-sm bg-foreground/5 hover:bg-foreground/10 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-foreground transition-all duration-200"
              >
                <span>Continue</span>
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-sm bg-gradient-to-r from-accent-gold-dark to-accent-gold px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-black transition-all duration-300 hover:brightness-110 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <span>Publish Property</span>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// Simple Helper function
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
