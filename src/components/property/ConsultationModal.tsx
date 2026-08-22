"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";
import { ButtonFX } from "@/components/ui/ButtonFX";

const CONTACT_METHODS = ["Phone", "WhatsApp", "Email"] as const;

/**
 * The consultation enquiry form — public site → CRM "Website Enquiries".
 * Shared by every "Consultation" trigger (property cards, the property
 * detail page's EnquiryPanel/AuctionEnquiryPanel) so there's exactly one
 * place that knows the submit contract, one place styled, one place that
 * can go wrong.
 *
 * Deliberately short: only what the site can't already infer (name,
 * phone, email, how to reach them) is asked for. Property id/title,
 * source, and submitted-at are attached automatically by the caller/API
 * — see POST /api/enquiries.
 */
export function ConsultationModal({
  open,
  onClose,
  propertyId,
  propertyTitle,
}: {
  open: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [contactMethod, setContactMethod] = useState<(typeof CONTACT_METHODS)[number] | "">("");
  const [message, setMessage] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  // Honeypot — real visitors never see or fill this (see the visually-
  // hidden input below); a bot filling every field usually fills it too.
  const [website, setWebsite] = useState("");

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const reset = () => {
    setName("");
    setPhone("");
    setEmail("");
    setContactMethod("");
    setMessage("");
    setPreferredDate("");
    setPreferredTime("");
    setWebsite("");
    setStatus("idle");
    setErrorMessage("");
  };

  const handleClose = () => {
    onClose();
    // Wait for the exit animation before wiping the form — resetting
    // immediately would flash the fields empty while it's still closing.
    setTimeout(reset, 250);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting" || status === "success") return; // no double-submit

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          contactMethod,
          message,
          preferredDate,
          preferredTime,
          propertyId,
          website, // honeypot
        }),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(data.error || "Something went wrong. Please try again.");
        setStatus("error");
      }
    } catch {
      setErrorMessage("Couldn't reach the server. Please check your connection and try again.");
      setStatus("error");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-md border border-border bg-card p-7 shadow-soft-lg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="consultation-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="absolute right-5 top-5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X size={18} />
            </button>

            {status === "success" ? (
              <div className="flex flex-col items-center py-6 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-gold/12 text-accent-gold-dark">
                  <CheckCircle2 size={24} />
                </span>
                <p className="mt-5 font-display text-xl">Thank you!</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Your consultation request has been received. Our team will contact you shortly.
                </p>
                <button type="button" onClick={handleClose} className={buttonClasses("secondary", "mt-6")}>
                  Close
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground pr-8">
                  Request a Consultation
                </p>
                <p id="consultation-modal-title" className="mt-1 font-display text-xl leading-snug pr-8">
                  {propertyTitle}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Share a few details and an advisor will reach out to discuss this property.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3.5">
                  {/* Honeypot — off-screen, not just visually hidden with
                      opacity (a bot's DOM scrape would still find that);
                      tabIndex -1 and aria-hidden keep it out of a real
                      visitor's keyboard/screen-reader flow entirely. */}
                  <div className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden" aria-hidden="true">
                    <label htmlFor="consult-website">Website</label>
                    <input
                      id="consult-website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="col-span-2 rounded-sm border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-accent-gold-dark"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="rounded-sm border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-accent-gold-dark"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-sm border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-accent-gold-dark"
                    />
                  </div>

                  <div>
                    <p className="mb-1.5 text-xs text-muted-foreground">Preferred contact method *</p>
                    <div className="grid grid-cols-3 gap-2">
                      {CONTACT_METHODS.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setContactMethod(m)}
                          className={`rounded-sm border px-3 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                            contactMethod === m
                              ? "border-accent-gold-dark bg-accent-gold/10 text-accent-gold-dark"
                              : "border-border text-muted-foreground hover:border-accent-gold-dark/50"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="mb-1.5 text-xs text-muted-foreground">Preferred date (optional)</p>
                      <input
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-accent-gold-dark"
                      />
                    </div>
                    <div>
                      <p className="mb-1.5 text-xs text-muted-foreground">Preferred time (optional)</p>
                      <input
                        type="time"
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                        className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-accent-gold-dark"
                      />
                    </div>
                  </div>

                  <textarea
                    placeholder="Anything else we should know? (optional)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="resize-none rounded-sm border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-accent-gold-dark"
                  />

                  {status === "error" && (
                    <p className="rounded-sm border border-red-300 bg-red-50 px-3 py-2.5 text-xs text-red-700">
                      {errorMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "submitting" || !contactMethod}
                    className={buttonClasses("primary", "relative w-full")}
                  >
                    <ButtonFX />
                    {status === "submitting" ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Request Consultation"
                    )}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
