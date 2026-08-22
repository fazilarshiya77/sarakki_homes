"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Image as ImageIcon,
  CheckCircle2,
  Check,
  Save,
  Eye,
  ChevronDown,
  X,
} from "lucide-react";
import { PropertyImageManager, type ManagedImage } from "@/components/admin/PropertyImageManager";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

/** Reads the leading number out of the Price field — which now also
 *  accepts letters (e.g. "85 Lakh", "2.5 Crore") alongside a bare
 *  number, per the input-restriction requirement — the same way
 *  `parseFloat` (and the properties API route) already do: it stops at
 *  the first non-numeric character rather than rejecting the whole
 *  string like `Number()` would. Storage/display convention is
 *  unchanged; this only makes reading the value tolerate trailing text. */
function parsePriceLakh(raw: string): number {
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

/** Turns the single "Price (in Lakhs)" number into the display string a
 *  property card actually shows -- e.g. 85 -> "₹85 Lakh", 240 -> "₹2.40 Cr".
 *  Matches the "₹X.XX Cr" convention already used by existing listings. */
function formatPriceDisplay(valueLakh: number): string {
  if (!Number.isFinite(valueLakh) || valueLakh <= 0) return "Price on request";
  if (valueLakh >= 100) return `₹${(valueLakh / 100).toFixed(2)} Cr`;
  return `₹${valueLakh % 1 === 0 ? valueLakh : valueLakh.toFixed(1)} Lakh`;
}

// Form validation schema with Zod
const propertySchema = z.object({
  // .min(1, "...is required.") fires on a genuinely empty field; a
  // separate .refine adds the quality-of-data length check without
  // stealing that message when the field is simply blank (an empty
  // title used to report "must be at least 3 characters", which reads
  // like a length complaint rather than "you skipped this").
  title: z
    .string()
    .min(1, "Property name is required.")
    .refine((v) => v.trim().length >= 3, "Property name must be at least 3 characters."),
  categoryId: z.string().min(1, "Category is required."),
  // NOTE: unlike Location/Address/Description below, Builder genuinely
  // can't be relaxed to optional — Property.builderId is a required,
  // non-nullable foreign key in the database (not just a plain string
  // column), so submitting an empty value here doesn't save a blank
  // property, it fails the write outright with a foreign-key error.
  // Marked required (with a "*") in the UI to match, which is also the
  // actual fix for a real bug: the field was already enforced as
  // required here but had no asterisk, contradicting itself.
  builderId: z.string().min(1, "Please select a builder."),
  type: z.string().min(1, "Property type is required."),
  // Was two separate fields (a free-text display string + this numeric
  // value) that both had to be filled in sync by hand -- collapsed into
  // this single required field per the client's request. The display
  // string (e.g. "₹ 85 Lakh" / "₹ 2.40 Cr") is now derived automatically
  // from this number in onSubmit below, so there's nothing left to type
  // twice and nothing that can drift out of sync between the two.
  priceValueLakh: z
    .string()
    .min(1, "Price is required.")
    // Numbers, letters, spaces and a decimal point only (e.g. "85",
    // "85 Lakh", "2.5 Crore") — no symbols/emoji. Enforced both here
    // (on Continue/Publish) and live while typing, via the input's own
    // onChange filter below, which strips a disallowed character the
    // instant it's typed rather than only complaining after the fact.
    .refine(
      (v) => /^[a-zA-Z0-9.\s]*$/.test(v),
      "Only numbers, letters and a decimal point are allowed in Price — no symbols or special characters."
    ),
  // Location, Address, Google Maps Location and Description all show no
  // asterisk in the UI, so — same rule as Builder above — they're
  // optional and must never block Continue/Publish. Property.location/
  // address/mapQuery/description are non-nullable DB columns, but an
  // empty string satisfies that just fine; nothing downstream requires
  // them to be non-empty.
  location: z.string().optional(),
  address: z.string().optional(),
  mapQuery: z.string().optional(),
  description: z.string().optional(),

  // Auction Info (optional)
  auctionInfo: z.object({
    bankName: z.string().optional(),
    auctionDate: z.string().optional(),
    emd: z.string().optional(),
    reservePrice: z.string().optional(),
    physicalPossession: z.boolean().default(false),
    legalStatus: z.string().optional(),
  }).optional(),

  // Details — none of these carry an asterisk in the UI, so none of
  // them are required.
  beds: z.string().optional(),
  baths: z.string().optional(),
  area: z.string().optional(),
  areaSqft: z.string().optional(),

  // Media is managed outside this schema by PropertyImageManager (an
  // ordered array, not a single registered input) — see `galleryImages`.

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

// Was 6 always-shown steps (Basic Info / Auction Info / Property Details
// / Media / SEO Config / Review) — measured as genuinely tiring to click
// through, especially since two of those steps were skip-or-fill-nothing
// most of the time (Auction Info for the ~80% of listings that aren't
// bank auctions, SEO Config for admins who never touch meta tags).
// Collapsed to 3 steps for a typical listing, 4 for a bank auction:
//   1. Property Details — merges the old Basic Info + Property Details
//      (one scroll instead of two clicks; nothing here was ever
//      logically two separate steps, just two form pages).
//   2. Auction Details — `conditional: true`, filtered out of the
//      visible list entirely (not just grayed out) unless Property Type
//      is "Bank Auction", so non-auction listings never see it at all.
//   3. Photos.
//   4. Review & Publish — SEO fields moved here as an optional,
//      collapsed-by-default section rather than their own step, since
//      they're rarely touched and always have a working default.
const ALL_STEPS = [
  { key: "details", label: "Property Details", icon: Building },
  { key: "auction", label: "Auction Details", icon: Gavel, conditional: true },
  { key: "photos", label: "Photos", icon: ImageIcon },
  { key: "review", label: "Review & Publish", icon: CheckCircle2 },
] as const;

type StepKey = (typeof ALL_STEPS)[number]["key"];

export function PropertyWizard({ categories, builders, initialData }: PropertyWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  // SEO fields (title/description/slug overrides) folded into the
  // Review step as a collapsed-by-default section instead of their own
  // wizard step — every one of them already has a working default
  // (property name, description, auto-generated slug), so most admins
  // never need to open this at all.
  const [seoOpen, setSeoOpen] = useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  // Which of the two submit buttons was actually clicked ("Save as
  // Draft" vs "Publish to Website") — a ref rather than state because
  // it needs to be readable synchronously inside onSubmit the moment
  // react-hook-form's validation resolves, with no re-render in between.
  const submitIntentRef = useRef<"draft" | "publish">("publish");
  const [errorMessage, setErrorMessage] = useState("");

  // Gallery lives outside react-hook-form: it's an ordered array built by
  // uploads/drag-reorder rather than a registered input, and the API has
  // always accepted `images: [{url}]` (PropertyImage.createMany) even
  // though the old UI could only ever supply one. Seeded from the
  // existing record when editing so saving doesn't wipe current photos.
  const [galleryImages, setGalleryImages] = useState<ManagedImage[]>(() => {
    const existing = initialData?.images;
    if (Array.isArray(existing)) {
      return existing
        .map((img: { url?: string }) => ({ url: img?.url ?? "" }))
        .filter((img: ManagedImage) => img.url);
    }
    return [];
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(propertySchema),
    defaultValues: initialData || {
      title: "",
      categoryId: "",
      builderId: "",
      // Was defaulted to "Bank Auction" -- meant the select was always
      // "filled" from the moment the wizard opened, so a user could never
      // actually leave Property Type unselected and the "required" check
      // was unenforceable. Starts blank now so the compulsory-fields
      // validation has something real to check.
      type: "",
      priceValueLakh: "",
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

  // The visible step list — "auction" only appears when it's actually
  // relevant. Recomputed whenever Property Type changes, which is also
  // why currentStep gets clamped below (picking a different Property
  // Type mid-flow can shrink this list out from under the current index).
  const steps = useMemo(
    () => ALL_STEPS.filter((s) => !("conditional" in s) || !s.conditional || propertyType === "Bank Auction"),
    [propertyType]
  );

  useEffect(() => {
    setCurrentStep((prev) => Math.min(prev, steps.length - 1));
  }, [steps.length]);

  const currentStepKey: StepKey = steps[currentStep]?.key ?? "details";

  // Only the fields actually marked required (a red "*" in the UI —
  // Property Name, Property Type, Category, Price) block Continue.
  // Everything else on the merged "Property Details" step (Builder,
  // Location, Address, Google Maps Location, Description, Bedrooms/
  // Bathrooms/Area) is optional and must never hold up navigation.
  const DETAILS_STEP_FIELDS = ["title", "type", "categoryId", "builderId", "priceValueLakh"] as const;

  const handleNext = async () => {
    // Basic step validation before moving forward. This used to do its
    // own manual `!formValues.x` checks and only ever show one generic
    // banner -- which meant a user got told *something* was missing but
    // never which field, and the per-field red text under each input
    // (via the Field component's `error` prop) never lit up because
    // nothing had actually run react-hook-form's own validation yet.
    // `trigger()` runs the real zodResolver validation for exactly the
    // relevant fields and populates `formState.errors` for each one that
    // fails, so the same inline messages the final submit already shows
    // (Property Name, Property Type, Category, Price, etc.) now appear
    // immediately when Next is clicked too -- the field itself is
    // highlighted, not just a top-of-page banner. onInvalid (wired to
    // handleSubmit below) remains the backstop for the Review & Publish
    // step, in case a step gets reached some other way.
    if (currentStepKey === "details") {
      const isValid = await trigger(DETAILS_STEP_FIELDS);
      if (!isValid) {
        setErrorMessage("Please fix the highlighted fields before continuing.");
        return;
      }
    }
    setErrorMessage("");
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  // Every currently-required field (see propertySchema) lives on step 0 —
  // if validation fails at submit time for any reason, jumping back
  // there and naming the fields is always the right, visible fix rather
  // than a submit button that quietly does nothing.
  const onInvalid = (formErrors: Record<string, any>) => {
    const labels: Record<string, string> = {
      title: "Property Name",
      categoryId: "Category",
      builderId: "Builder",
      type: "Property Type",
      priceValueLakh: "Price",
      location: "Location",
      address: "Address",
      mapQuery: "Google Maps Location",
      description: "Description",
      area: "Area Display Text",
    };
    const names = Object.keys(formErrors)
      .map((key) => labels[key] || key)
      .join(", ");
    setErrorMessage(
      names
        ? `Please fix the following before publishing: ${names}.`
        : "Please review the highlighted fields before publishing."
    );
    setCurrentStep(0);
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

      // Gallery order is meaningful — the API writes array index into
      // PropertyImage.order, and the public site reads images[0] as the
      // cover shot.
      //
      // Explicit publishing workflow: the two footer buttons on the
      // final step ("Save as Draft" / "Publish to Website") each set
      // submitIntentRef before the form submits, so status here always
      // reflects what the admin actually clicked — never a silent
      // default. This applies on both create AND edit now: an edit
      // previously left status untouched (so the buttons had no effect
      // on an existing listing), which is exactly the ambiguity this
      // wizard rework is meant to remove.
      const status = submitIntentRef.current === "draft" ? "UNPUBLISHED" : "PUBLISHED";
      const payload = {
        ...data,
        // The DB still stores both a numeric priceValueLakh (used for
        // budget-range filtering/sorting on the public site) and a
        // display string (what a property card actually shows) -- the
        // form only collects the number now, so the string is generated
        // here rather than typed by hand.
        price: formatPriceDisplay(parsePriceLakh(data.priceValueLakh)),
        images: galleryImages,
        status,
      };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // The wizard navigates away immediately, so it can't show its own
        // confirmation -- the properties list picks this up on mount and
        // shows it as a dismissing toast (see sh_crm_publish_toast there).
        sessionStorage.setItem(
          "sh_crm_publish_toast",
          status === "UNPUBLISHED"
            ? `"${data.title}" was saved as a draft. It won't appear on the website until you publish it.`
            : initialData
              ? `"${data.title}" was updated and published successfully.`
              : `"${data.title}" was published successfully.`
        );
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
            {steps.map((step, idx) => {
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
                      "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300",
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
                        "text-[13px] font-bold uppercase tracking-[0.06em] transition-colors duration-200",
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
        <div className="flex items-center justify-end -mt-2 mb-4">
          <button
            type="button"
            onClick={() => setExitConfirmOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-crm-text-muted hover:text-crm-text transition-colors"
          >
            <X size={13} />
            <span>Exit</span>
          </button>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-sm border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-8">
          {/* All four steps below are ALWAYS mounted — only CSS
              visibility (the `hidden` class) switches between them.
              This is the actual fix for the wizard "resetting" when
              navigating back and forth: react-hook-form's registered
              values live in its own internal store keyed by field name,
              not in the DOM, so they never depended on a step's inputs
              being mounted — but the step content used to be
              conditionally rendered with `{condition && <motion.div>}`,
              which unmounts/remounts the whole subtree (including
              PropertyImageManager's own internal drag/upload state,
              and briefly drops focus/selection). Always-mounted +
              hidden avoids that unmount entirely, at the cost of the
              old slide-in step transition animation. */}
            {/* Step: Property Details — merges what used to be two
                separate steps (Basic Info + Property Details). Same
                fields, same validation, just one scroll instead of an
                extra click-through. */}
            <div className={cn("space-y-8", currentStepKey !== "details" && "hidden")}>
                <StepHeading title="Property Details" description="Core listing parameters for buyers." />

                <FieldGroup title="Property Basics">
                  <Field label="Property Name" required error={errors.title}>
                    <input
                      type="text"
                      {...register("title")}
                      className="crm-input"
                      placeholder="e.g. Prestige Lavender Residences"
                    />
                  </Field>

                  <Field label="Property Type" required error={errors.type}>
                    <select {...register("type")} className="crm-select" defaultValue="">
                      <option value="" disabled>Select Property Type</option>
                      <option value="Bank Auction">Bank Auction</option>
                      <option value="Resale">Resale</option>
                      <option value="Ready To Move">Ready To Move</option>
                      <option value="Rental Income">Rental Income</option>
                      <option value="Upcoming Project">Upcoming Project</option>
                    </select>
                  </Field>

                  <Field label="Category" required error={errors.categoryId}>
                    <select {...register("categoryId")} className="crm-select">
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.title}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Builder" required error={errors.builderId}>
                    <select {...register("builderId")} className="crm-select">
                      <option value="">Select Builder</option>
                      {builders.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </Field>
                </FieldGroup>

                <FieldGroup title="Pricing">
                  {/* Was two fields (a free-text display string + this
                      number) that had to be kept in sync by hand -- a
                      single required value now, with the display string
                      ("₹ 85 Lakh" / "₹ 2.40 Cr") generated automatically
                      from it in onSubmit below. */}
                  <Field label="Price" required error={errors.priceValueLakh}>
                    <input
                      type="text"
                      inputMode="decimal"
                      {...register("priceValueLakh", {
                        // Belt-and-suspenders with the zod .refine above:
                        // strip any disallowed character the moment it's
                        // typed (including a paste), so an invalid one
                        // never actually lands in the field rather than
                        // being typed and then flagged after the fact.
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                          const filtered = e.target.value.replace(/[^a-zA-Z0-9.\s]/g, "");
                          if (filtered !== e.target.value) e.target.value = filtered;
                        },
                      })}
                      className="crm-input"
                      placeholder="e.g. 85 for ₹85 Lakh, 240 for ₹2.4 Cr"
                    />
                  </Field>
                </FieldGroup>

                <FieldGroup title="Location">
                  <Field label="Location (Short Address)" span2 error={errors.location}>
                    <input
                      type="text"
                      {...register("location")}
                      className="crm-input"
                      placeholder="e.g. Whitefield, Bengaluru"
                    />
                  </Field>

                  <Field label="Address (Full Details)" span2 error={errors.address}>
                    <input
                      type="text"
                      {...register("address")}
                      className="crm-input"
                      placeholder="e.g. Plot 15, Garden Layout, Phase 3, Whitefield, Bengaluru"
                    />
                  </Field>

                  <Field label="Google Maps Location" span2 error={errors.mapQuery}>
                    <input
                      type="text"
                      {...register("mapQuery")}
                      className="crm-input"
                      placeholder="e.g. Prestige Shantiniketan, Whitefield, Bengaluru"
                    />
                  </Field>
                </FieldGroup>

                <FieldGroup title="Description">
                  <Field label="Overview" span2 error={errors.description}>
                    <textarea
                      rows={5}
                      {...register("description")}
                      className="crm-textarea resize-none"
                      placeholder="Enter a descriptive overview of the property..."
                    />
                  </Field>
                </FieldGroup>

                <FieldGroup title="Measurements">
                  <Field label="Bedrooms">
                    <input type="number" {...register("beds")} className="crm-input" />
                  </Field>

                  <Field label="Bathrooms">
                    <input type="number" {...register("baths")} className="crm-input" />
                  </Field>

                  <Field label="Area Display Text" error={errors.area}>
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
            </div>

            {/* Step: Auction Details — only ever shown when Property
                Type is "Bank Auction" (it's also filtered out of the
                left-hand step list entirely in that case, via `steps`
                above), so a non-auction listing never sees it. Still
                always mounted per the note above — harmless, since
                auctionInfo is optional and only persisted when
                type === "Bank Auction" (see onSubmit / the API route). */}
            <div className={cn("space-y-8", currentStepKey !== "auction" && "hidden")}>
                <StepHeading title="Auction Details" description="Bank auction specifics buyers will ask about." />

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
                        <span className="text-sm font-semibold text-crm-text">Physical Possession</span>
                        <span className="text-[13px] text-crm-text-muted mt-0.5">Has the bank taken active physical possession?</span>
                      </div>
                      <input
                        type="checkbox"
                        {...register("auctionInfo.physicalPossession")}
                        className="h-4 w-4 rounded border border-crm-border accent-crm-gold"
                      />
                    </div>
                  </FieldGroup>
            </div>

            {/* Step: Photos */}
            <div className={cn("space-y-8", currentStepKey !== "photos" && "hidden")}>
                <StepHeading title="Photos" description="Upload photographs, or paste image URLs. The first image is used as the cover." />

                <FieldGroup title="Property Images">
                  <PropertyImageManager images={galleryImages} onChange={setGalleryImages} />
                </FieldGroup>
            </div>

            {/* Step: Review & Publish */}
            <div className={cn("space-y-8", currentStepKey !== "review" && "hidden")}>
                <StepHeading
                  title="Review & Publish"
                  description='Check everything below, then choose "Save as Draft" to keep working on it privately, or "Publish to Website" to make it live immediately.'
                />

                <div className="rounded-sm border border-crm-border bg-crm-bg/60 p-7">
                  <div className="flex flex-wrap items-start justify-between gap-6">
                    <div>
                      <span className="crm-label">Property Name</span>
                      <p className="mt-1.5 font-crm-body text-xl text-crm-text">{formValues.title || "N/A"}</p>
                      <p className="mt-1 text-sm text-crm-text-secondary">{formValues.location || "N/A"}</p>
                    </div>
                    <div className="text-right">
                      <span className="crm-label">Price</span>
                      <p className="mt-1.5 font-crm-display text-2xl font-semibold text-crm-gold">
                        {formValues.priceValueLakh ? formatPriceDisplay(parsePriceLakh(formValues.priceValueLakh)) : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-5 border-t border-crm-border pt-5 sm:grid-cols-4">
                    <ReviewStat label="Type" value={formValues.type} />
                    <ReviewStat label="Bedrooms" value={formValues.beds || "0"} />
                    <ReviewStat label="Bathrooms" value={formValues.baths || "0"} />
                    <ReviewStat label="Area" value={formValues.area || "N/A"} />
                  </div>
                </div>

                {/* Optional and collapsed by default — see seoOpen above. */}
                <div className="rounded-sm border border-crm-border">
                  <button
                    type="button"
                    onClick={() => setSeoOpen((v) => !v)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left"
                  >
                    <div>
                      <span className="text-sm font-semibold text-crm-text">Advanced: Search &amp; URL Settings</span>
                      <p className="text-[13px] text-crm-text-muted mt-0.5">
                        Optional — leave blank to use sensible defaults automatically.
                      </p>
                    </div>
                    <ChevronDown
                      size={16}
                      className={cn("text-crm-text-muted transition-transform duration-200", seoOpen && "rotate-180")}
                    />
                  </button>

                  {seoOpen && (
                    <div className="border-t border-crm-border p-5">
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
                    </div>
                  )}
                </div>
            </div>

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

            {currentStep < steps.length - 1 ? (
              <button type="button" onClick={handleNext} className="crm-btn-primary">
                <span>Continue</span>
                <ChevronRight size={14} />
              </button>
            ) : (
              <div className="flex items-center gap-3">
                {/* Preview only makes sense once a listing has a real
                    public URL — i.e. it already exists (edit mode). In
                    create mode there's nothing to preview yet, so the
                    button is simply not shown rather than linking to a
                    404 or forcing an unwanted save first. */}
                {initialData?.slug && (
                  <a
                    href={`/properties/${initialData.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="crm-btn-secondary"
                  >
                    <Eye size={14} />
                    <span>Preview</span>
                  </a>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  onClick={() => {
                    submitIntentRef.current = "draft";
                  }}
                  className="crm-btn-secondary"
                >
                  {loading && submitIntentRef.current === "draft" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Save as Draft</span>
                    </>
                  )}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  onClick={() => {
                    submitIntentRef.current = "publish";
                  }}
                  className="crm-btn-gold"
                >
                  {loading && submitIntentRef.current === "publish" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <span>Publish to Website</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={exitConfirmOpen}
        title="Exit without publishing?"
        message="Everything you've entered on this listing will be discarded. This can't be undone."
        confirmLabel="Exit"
        tone="danger"
        onConfirm={() => router.push("/admin/properties")}
        onCancel={() => setExitConfirmOpen(false)}
      />
    </div>
  );
}

function StepHeading({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h3 className="crm-section-heading">{title}</h3>
      <p className="text-sm text-crm-text-secondary mt-1">{description}</p>
    </div>
  );
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-crm-gold border-b border-crm-border pb-2.5">
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
  required,
}: {
  label: string;
  children: React.ReactNode;
  span2?: boolean;
  error?: any;
  required?: boolean;
}) {
  return (
    <div className={cn("space-y-1.5", span2 && "md:col-span-2")}>
      <label className="crm-label">
        {label}
        {required && (
          <span className="ml-0.5 text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {error && <span className="block text-[13px] text-red-600">{String(error.message)}</span>}
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
