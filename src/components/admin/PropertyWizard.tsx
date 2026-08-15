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
  Check,
} from "lucide-react";

// Form validation schema with Zod
const propertySchema = z.object({
  title: z.string().min(3, "Property name must be at least 3 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  builderId: z.string().min(1, "Please select a builder"),
  type: z.string().min(1, "Please select a type (e.g. Bank Auction, Resale)"),
  price: z.string().min(1, "Price description is required (e.g. ₹ 2.4 Cr)"),
  priceValueLakh: z.string().min(1, "Price value in lakhs is required"),
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
  beds: z.string(),
  baths: z.string(),
  area: z.string().min(1, "Area display value is required (e.g. 3,200 sq.ft)"),
  areaSqft: z.string(),

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
  } = useForm<any>({
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
      {/* Wizard Step Navigation (Left Panel) — premium vertical stepper.
          Upcoming steps stay clearly readable (never near-invisible) per
          the redesign brief; only the connecting rail + circle fill
          communicate progress. */}
      <div className="lg:col-span-1">
        <div className="relative pl-1">
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-crm-border" />
          <div className="flex flex-col gap-1">
            {STEPS.map((step, idx) => {
              const isCompleted = idx < currentStep;
              const isActive = idx === currentStep;

              return (
                <button
                  key={step.label}
                  type="button"
                  onClick={() => idx <= currentStep && setCurrentStep(idx)}
                  disabled={idx > currentStep}
                  className={cn(
                    "group relative flex items-center gap-3.5 rounded-sm px-3 py-3 text-left transition-all duration-200",
                    isActive ? "bg-crm-espresso/[0.04]" : "hover:bg-crm-espresso/[0.02]",
                    idx > currentStep && "cursor-default"
                  )}
                >
                  <div
                    className={cn(
                      "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold transition-all duration-300",
                      isActive
                        ? "border-crm-gold bg-crm-gold text-crm-espresso shadow-[0_0_0_4px_rgba(196,166,107,0.16)]"
                        : isCompleted
                        ? "border-crm-gold bg-crm-card text-crm-gold"
                        : "border-crm-border bg-crm-card text-crm-text-muted"
                    )}
                  >
                    {isCompleted ? <Check size={13} strokeWidth={3} /> : String(idx + 1).padStart(2, "0")}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span
                      className={cn(
                        "text-[11px] font-bold uppercase tracking-[0.08em] transition-colors duration-200",
                        isActive
                          ? "text-crm-text"
                          : isCompleted
                          ? "text-crm-text-secondary"
                          : "text-crm-text-muted"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form Steps Panel (Right Panel) */}
      <div className="lg:col-span-3 crm-card p-8">
        {errorMessage && (
          <div className="mb-6 rounded-sm border border-red-300 bg-red-50 px-4 py-3 text-xs text-red-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Information */}
            {currentStep === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-8"
              >
                <StepHeading title="Basic Information" description="Core listing parameters for buyers." />

                <FieldGroup title="Property Basics">
                  <Field label="Property Name" error={errors.title}>
                    <input
                      type="text"
                      {...register("title")}
                      className="crm-input"
                      placeholder="e.g. Prestige Lavender Residences"
                    />
                  </Field>

                  <Field label="Property Type">
                    <select {...register("type")} className="crm-select">
                      <option value="Bank Auction">Bank Auction</option>
                      <option value="Resale">Resale</option>
                      <option value="Ready To Move">Ready To Move</option>
                      <option value="Rental Income">Rental Income</option>
                      <option value="Upcoming Project">Upcoming Project</option>
                    </select>
                  </Field>

                  <Field label="Category">
                    <select {...register("categoryId")} className="crm-select">
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.title}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Builder">
                    <select {...register("builderId")} className="crm-select">
                      <option value="">Select Builder</option>
                      {builders.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </Field>
                </FieldGroup>

                <FieldGroup title="Pricing">
                  <Field label="Price (Display Text)">
                    <input
                      type="text"
                      {...register("price")}
                      className="crm-input"
                      placeholder="e.g. ₹ 2.4 Cr or ₹ 85 Lakh"
                    />
                  </Field>

                  <Field label="Price Value in Lakhs">
                    <input
                      type="number"
                      {...register("priceValueLakh")}
                      className="crm-input"
                      placeholder="e.g. 240 or 85"
                    />
                  </Field>
                </FieldGroup>

                <FieldGroup title="Location">
                  <Field label="Location (Short Address)" span2>
                    <input
                      type="text"
                      {...register("location")}
                      className="crm-input"
                      placeholder="e.g. Whitefield, Bengaluru"
                    />
                  </Field>

                  <Field label="Address (Full Details)" span2>
                    <input
                      type="text"
                      {...register("address")}
                      className="crm-input"
                      placeholder="e.g. Plot 15, Garden Layout, Phase 3, Whitefield, Bengaluru"
                    />
                  </Field>

                  <Field label="Google Maps Location Query" span2>
                    <input
                      type="text"
                      {...register("mapQuery")}
                      className="crm-input"
                      placeholder="e.g. Prestige Shantiniketan, Whitefield, Bengaluru"
                    />
                  </Field>
                </FieldGroup>

                <FieldGroup title="Description">
                  <Field label="Overview" span2>
                    <textarea
                      rows={5}
                      {...register("description")}
                      className="crm-textarea resize-none"
                      placeholder="Enter a descriptive overview of the property..."
                    />
                  </Field>
                </FieldGroup>
              </motion.div>
            )}

            {/* Step 2: Auction Information */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-8"
              >
                <StepHeading title="Auction Information" description='Required fields only if the type is "Bank Auction".' />

                {propertyType !== "Bank Auction" ? (
                  <div className="py-10 text-center text-xs text-crm-text-muted border border-dashed border-crm-border rounded-sm bg-crm-bg/60">
                    This property is not categorized as a Bank Auction. You can skip this step.
                  </div>
                ) : (
                  <FieldGroup title="Auction Details">
                    <Field label="Bank Name / Notice Info">
                      <input
                        type="text"
                        {...register("auctionInfo.bankName")}
                        className="crm-input"
                        placeholder="e.g. State Bank of India, SARFAESI Auction"
                      />
                    </Field>

                    <Field label="Auction Date">
                      <input type="date" {...register("auctionInfo.auctionDate")} className="crm-input" />
                    </Field>

                    <Field label="EMD Amount">
                      <input
                        type="text"
                        {...register("auctionInfo.emd")}
                        className="crm-input"
                        placeholder="e.g. ₹ 21.5 Lakh"
                      />
                    </Field>

                    <Field label="Reserve Price">
                      <input
                        type="text"
                        {...register("auctionInfo.reservePrice")}
                        className="crm-input"
                        placeholder="e.g. ₹ 2.15 Cr"
                      />
                    </Field>

                    <Field label="Legal Status">
                      <input
                        type="text"
                        {...register("auctionInfo.legalStatus")}
                        className="crm-input"
                        placeholder="e.g. Title Verified, Clear Deed"
                      />
                    </Field>

                    <div className="md:col-span-2 flex items-center justify-between rounded-sm border border-crm-border bg-crm-bg/60 p-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-crm-text">Physical Possession</span>
                        <span className="text-[10px] text-crm-text-muted mt-0.5">Has the bank taken active physical possession?</span>
                      </div>
                      <input
                        type="checkbox"
                        {...register("auctionInfo.physicalPossession")}
                        className="h-4 w-4 rounded border border-crm-border accent-crm-gold"
                      />
                    </div>
                  </FieldGroup>
                )}
              </motion.div>
            )}

            {/* Step 3: Property Details */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-8"
              >
                <StepHeading title="Property Details" description="Specific metrics and structural definitions." />

                <FieldGroup title="Measurements">
                  <Field label="Bedrooms">
                    <input type="number" {...register("beds")} className="crm-input" />
                  </Field>

                  <Field label="Bathrooms">
                    <input type="number" {...register("baths")} className="crm-input" />
                  </Field>

                  <Field label="Area Display Text">
                    <input
                      type="text"
                      {...register("area")}
                      className="crm-input"
                      placeholder="e.g. 3,200 sq.ft"
                    />
                  </Field>

                  <Field label="Area in Sqft (Value)">
                    <input
                      type="number"
                      {...register("areaSqft")}
                      className="crm-input"
                      placeholder="e.g. 3200"
                    />
                  </Field>
                </FieldGroup>
              </motion.div>
            )}

            {/* Step 4: Media & Images */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-8"
              >
                <StepHeading title="Media & Attachments" description="Attach the primary header image URL." />

                <FieldGroup title="Primary Image">
                  <Field label="Primary Image URL" span2 error={errors.imageUrl}>
                    <input
                      type="text"
                      {...register("imageUrl")}
                      className="crm-input"
                      placeholder="e.g. /media/re.jpg or an external link"
                    />
                  </Field>

                  <div className="md:col-span-2 p-12 text-center text-xs text-crm-text-muted border border-dashed border-crm-border bg-crm-bg/60 rounded-sm">
                    Drag and Drop uploads will route through Cloudinary API key settings once keys are supplied in settings panel.
                  </div>
                </FieldGroup>
              </motion.div>
            )}

            {/* Step 5: SEO Configuration */}
            {currentStep === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-8"
              >
                <StepHeading title="SEO Config" description="Define metadata parameters for search indexing." />

                <FieldGroup title="Search Metadata">
                  <Field label="SEO Title Override" span2>
                    <input
                      type="text"
                      {...register("seoTitle")}
                      className="crm-input"
                      placeholder="Keep empty to use Property Name"
                    />
                  </Field>

                  <Field label="SEO Meta Description" span2>
                    <textarea
                      rows={3}
                      {...register("seoDescription")}
                      className="crm-textarea resize-none"
                      placeholder="Summarize listing in 150-160 characters..."
                    />
                  </Field>

                  <Field label="Slug (URL endpoint)" span2>
                    <input
                      type="text"
                      {...register("slug")}
                      className="crm-input"
                      placeholder="e.g. sarjapur-emerald-villa"
                    />
                  </Field>
                </FieldGroup>
              </motion.div>
            )}

            {/* Step 6: Review & Submit */}
            {currentStep === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-8"
              >
                <StepHeading title="Review & Publish" description="Please review listing details before saving to local database." />

                <div className="rounded-sm border border-crm-border bg-crm-bg/60 p-7">
                  <div className="flex flex-wrap items-start justify-between gap-6">
                    <div>
                      <span className="crm-label">Property Name</span>
                      <p className="mt-1.5 font-display text-xl text-crm-text">{formValues.title || "N/A"}</p>
                      <p className="mt-1 text-xs text-crm-text-secondary">{formValues.location || "N/A"}</p>
                    </div>
                    <div className="text-right">
                      <span className="crm-label">Price</span>
                      <p className="mt-1.5 font-display text-2xl font-semibold text-crm-gold">{formValues.price || "N/A"}</p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-5 border-t border-crm-border pt-5 sm:grid-cols-4">
                    <ReviewStat label="Type" value={formValues.type} />
                    <ReviewStat label="Bedrooms" value={formValues.beds || "0"} />
                    <ReviewStat label="Bathrooms" value={formValues.baths || "0"} />
                    <ReviewStat label="Area" value={formValues.area || "N/A"} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Actions Buttons */}
          <div className="flex items-center justify-between border-t border-crm-border pt-6 mt-8">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0 || loading}
              className="crm-btn-secondary"
            >
              <ChevronLeft size={14} />
              <span>Back</span>
            </button>

            {currentStep < STEPS.length - 1 ? (
              <button type="button" onClick={handleNext} className="crm-btn-primary">
                <span>Continue</span>
                <ChevronRight size={14} />
              </button>
            ) : (
              <button type="submit" disabled={loading} className="crm-btn-gold">
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

function StepHeading({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h3 className="font-display text-xl font-semibold text-crm-text">{title}</h3>
      <p className="text-xs text-crm-text-secondary mt-1">{description}</p>
    </div>
  );
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-crm-gold border-b border-crm-border pb-2.5">
        {title}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
  span2,
  error,
}: {
  label: string;
  children: React.ReactNode;
  span2?: boolean;
  error?: any;
}) {
  return (
    <div className={cn("space-y-1.5", span2 && "md:col-span-2")}>
      <label className="crm-label">{label}</label>
      {children}
      {error && <span className="block text-[10px] text-red-600">{String(error.message)}</span>}
    </div>
  );
}

function ReviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="crm-label">{label}</span>
      <p className="mt-1 text-sm font-semibold text-crm-text">{value}</p>
    </div>
  );
}

// Simple Helper function
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
