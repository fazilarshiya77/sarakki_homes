"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";

/**
 * Shared confirmation modal for destructive/consequential CRM actions —
 * replaces scattered native `confirm()` calls (no styling, generic
 * browser copy, easy to click through without reading) with one
 * consistent, on-brand dialog that always explains what's about to
 * happen in plain language.
 *
 * Usage: keep a `{ open, title, message, ... } | null` bit of state in
 * the calling page, render `<ConfirmDialog {...state} onConfirm={...}
 * onCancel={() => setState(null)} />` unconditionally (it no-ops when
 * `open` is false), and set `loading` while the action's request is in
 * flight so the buttons disable and show a spinner instead of double-
 * firing on a slow connection.
 */
export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" (red, permanent-delete style) vs "default" (gold, e.g. archive). */
  tone?: "danger" | "default";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] px-4"
          onClick={() => !loading && onCancel()}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="crm-card w-full max-w-sm p-6"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3.5">
              <span
                className={
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full " +
                  (tone === "danger" ? "bg-red-50 text-red-500" : "bg-crm-gold/12 text-crm-gold")
                }
              >
                <AlertTriangle size={17} />
              </span>
              <div className="min-w-0">
                <h2 id="confirm-dialog-title" className="crm-section-heading !text-[17px]">
                  {title}
                </h2>
                <p className="mt-1.5 crm-body-text">{message}</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button type="button" className="crm-btn-secondary" onClick={onCancel} disabled={loading}>
                {cancelLabel}
              </button>
              <button
                type="button"
                className={tone === "danger" ? "crm-btn-primary !bg-red-600 hover:!bg-red-700" : "crm-btn-gold"}
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <span>{confirmLabel}</span>}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
