"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  Upload,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
} from "lucide-react";

// -----------------------------------------------------------------------
// Types mirrored from src/lib/propertyImport/validateRows.ts — kept as a
// plain local shape (not imported) since this file is a Client Component
// and that module pulls in Prisma types not meant to ship to the browser.
// -----------------------------------------------------------------------
interface ValidatedRowData {
  title: string;
  [key: string]: unknown;
}
interface ValidRow {
  rowNumber: number;
  action: "create" | "update";
  targetId?: string;
  propertyId: string;
  data: ValidatedRowData;
}
interface ErrorRow {
  rowNumber: number;
  propertyId: string;
  propertyName: string;
  errors: string[];
}
interface PreviewResult {
  validRows: ValidRow[];
  errorRows: ErrorRow[];
  newCount: number;
  updateCount: number;
}
interface CommitRowResult {
  rowNumber: number;
  propertyId: string;
  propertyName: string;
  action: "create" | "update";
  ok: boolean;
  error?: string;
}

type Step = "instructions" | "previewing" | "preview" | "confirming" | "importing" | "done";

const CHUNK_SIZE = 50;

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function ImportPropertiesModal({
  open,
  onClose,
  onImported,
}: {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}) {
  const [step, setStep] = useState<Step>("instructions");
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [commitResults, setCommitResults] = useState<CommitRowResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep("instructions");
    setFileName("");
    setPreview(null);
    setUploadError("");
    setProgress({ done: 0, total: 0 });
    setCommitResults([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setUploadError("");
    setStep("previewing");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/properties/import/preview", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || "Something went wrong reading that file.");
        setStep("instructions");
        return;
      }
      setPreview(data);
      setStep("preview");
    } catch {
      setUploadError("Could not reach the server. Please check your connection and try again.");
      setStep("instructions");
    }
  };

  const runImport = async () => {
    if (!preview || preview.validRows.length === 0) return;
    setStep("importing");
    setProgress({ done: 0, total: preview.validRows.length });

    const allResults: CommitRowResult[] = [];
    for (let i = 0; i < preview.validRows.length; i += CHUNK_SIZE) {
      const chunk = preview.validRows.slice(i, i + CHUNK_SIZE);
      try {
        const res = await fetch("/api/admin/properties/import/commit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rows: chunk }),
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.results)) {
          allResults.push(...data.results);
        } else {
          // The whole chunk failed before per-row processing (e.g. a
          // network hiccup) — record every row in it as failed rather
          // than silently losing track of them.
          for (const row of chunk) {
            allResults.push({
              rowNumber: row.rowNumber,
              propertyId: row.propertyId,
              propertyName: row.data.title,
              action: row.action,
              ok: false,
              error: data.error || "This batch could not be saved.",
            });
          }
        }
      } catch {
        for (const row of chunk) {
          allResults.push({
            rowNumber: row.rowNumber,
            propertyId: row.propertyId,
            propertyName: row.data.title,
            action: row.action,
            ok: false,
            error: "Could not reach the server.",
          });
        }
      }
      setProgress({ done: Math.min(i + CHUNK_SIZE, preview.validRows.length), total: preview.validRows.length });
    }

    setCommitResults(allResults);
    setStep("done");
    onImported();
  };

  const downloadErrorReport = () => {
    const rows: string[][] = [["Row Number", "Property ID", "Property Name", "Error"]];
    for (const e of preview?.errorRows ?? []) {
      rows.push([String(e.rowNumber), e.propertyId, e.propertyName, e.errors.join(" | ")]);
    }
    for (const r of commitResults.filter((r) => !r.ok)) {
      rows.push([String(r.rowNumber), r.propertyId, r.propertyName, r.error || "Failed to save."]);
    }
    downloadCsv("property-import-errors.csv", rows);
  };

  if (!open) return null;

  const created = commitResults.filter((r) => r.ok && r.action === "create").length;
  const updated = commitResults.filter((r) => r.ok && r.action === "update").length;
  const failed = commitResults.filter((r) => !r.ok).length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        onClick={step === "instructions" || step === "preview" || step === "done" ? handleClose : undefined}
      >
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-sm border border-crm-border/40 bg-crm-card p-8 shadow-2xl scrollbar-thin"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-crm-gold/10 text-crm-gold">
                <FileSpreadsheet size={20} />
              </div>
              <h2 className="text-xl font-bold text-crm-text">Import Properties</h2>
            </div>
            {(step === "instructions" || step === "preview" || step === "done") && (
              <button
                onClick={handleClose}
                className="p-2 hover:bg-crm-bg text-crm-text-secondary hover:text-crm-text rounded-sm transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* -------------------- STEP 1: UPLOAD -------------------- */}
          {step === "instructions" && (
            <div className="space-y-6">
              {uploadError && (
                <div className="flex items-start gap-2 rounded-sm border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-500">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="import-file-input"
                />
                <label
                  htmlFor="import-file-input"
                  className="flex flex-col items-center justify-center gap-2 rounded-sm border-2 border-dashed border-crm-gold/30 bg-crm-gold/5 py-10 cursor-pointer hover:bg-crm-gold/10 transition-colors"
                >
                  <Upload size={28} className="text-crm-gold" />
                  <span className="text-base font-semibold text-crm-text">Click to upload your file</span>
                  <span className="text-sm text-crm-text-secondary">Excel (.xlsx) or CSV works best</span>
                </label>
              </div>
            </div>
          )}

          {/* -------------------- STEP: READING FILE -------------------- */}
          {step === "previewing" && (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <Loader2 size={32} className="animate-spin text-crm-gold" />
              <p className="text-base text-crm-text">Reading {fileName}…</p>
            </div>
          )}

          {/* -------------------- STEP: PREVIEW -------------------- */}
          {step === "preview" && preview && (
            <div className="space-y-6">
              <p className="text-base font-semibold text-crm-text">Import Preview</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-sm border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-500">{preview.newCount}</p>
                  <p className="text-xs uppercase tracking-wide text-crm-text-secondary mt-1">New Properties</p>
                </div>
                <div className="rounded-sm border border-crm-gold/20 bg-crm-gold/5 p-4 text-center">
                  <p className="text-2xl font-bold text-crm-gold">{preview.updateCount}</p>
                  <p className="text-xs uppercase tracking-wide text-crm-text-secondary mt-1">To Update</p>
                </div>
                <div className={`rounded-sm border p-4 text-center ${preview.errorRows.length > 0 ? "border-red-500/20 bg-red-500/5" : "border-crm-border bg-crm-bg/40"}`}>
                  <p className={`text-2xl font-bold ${preview.errorRows.length > 0 ? "text-red-500" : "text-crm-text-muted"}`}>
                    {preview.errorRows.length}
                  </p>
                  <p className="text-xs uppercase tracking-wide text-crm-text-secondary mt-1">Rows with Errors</p>
                </div>
              </div>

              {preview.errorRows.length > 0 && (
                <div className="rounded-sm border border-red-500/20 bg-red-500/5 p-4 max-h-56 overflow-y-auto scrollbar-thin">
                  <p className="text-sm font-semibold text-red-500 mb-2">
                    These rows will be skipped — fix them in Excel and upload again if you want them included:
                  </p>
                  <ul className="space-y-2 text-sm text-crm-text">
                    {preview.errorRows.map((e) => (
                      <li key={e.rowNumber}>
                        <span className="font-semibold">Row {e.rowNumber}</span>
                        {e.propertyName ? ` (${e.propertyName})` : ""}: {e.errors.join(" ")}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {preview.validRows.length === 0 ? (
                <p className="text-sm text-crm-text-secondary">
                  No valid rows to import — please fix the errors above and upload the file again.
                </p>
              ) : (
                <div className="rounded-sm border border-crm-border bg-crm-bg/40 p-4 text-base text-crm-text">
                  You are about to <strong>create {preview.newCount}</strong> new propert{preview.newCount === 1 ? "y" : "ies"} and{" "}
                  <strong>update {preview.updateCount}</strong> existing propert{preview.updateCount === 1 ? "y" : "ies"}.
                  {preview.errorRows.length > 0 && ` ${preview.errorRows.length} row(s) with errors will be skipped.`}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button onClick={handleClose} className="crm-btn-secondary">
                  Cancel
                </button>
                <button
                  onClick={runImport}
                  disabled={preview.validRows.length === 0}
                  className="crm-btn-gold disabled:opacity-50"
                >
                  Import Properties
                </button>
              </div>
            </div>
          )}

          {/* -------------------- STEP: IMPORTING -------------------- */}
          {step === "importing" && (
            <div className="py-16 flex flex-col items-center justify-center gap-5">
              <Loader2 size={32} className="animate-spin text-crm-gold" />
              <p className="text-lg font-semibold text-crm-text">Importing properties…</p>
              <p className="text-base text-crm-text-secondary">
                {progress.done} / {progress.total}
              </p>
              <div className="w-full max-w-xs h-2.5 rounded-full bg-crm-border/40 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-crm-gold to-crm-gold-bright transition-all duration-300"
                  style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          {/* -------------------- STEP: DONE -------------------- */}
          {step === "done" && (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-3 py-4">
                <CheckCircle2 size={40} className="text-emerald-500" />
                <p className="text-lg font-semibold text-crm-text">Import completed</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-sm border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-500">{created}</p>
                  <p className="text-xs uppercase tracking-wide text-crm-text-secondary mt-1">Created</p>
                </div>
                <div className="rounded-sm border border-crm-gold/20 bg-crm-gold/5 p-4 text-center">
                  <p className="text-2xl font-bold text-crm-gold">{updated}</p>
                  <p className="text-xs uppercase tracking-wide text-crm-text-secondary mt-1">Updated</p>
                </div>
                <div className={`rounded-sm border p-4 text-center ${failed > 0 ? "border-red-500/20 bg-red-500/5" : "border-crm-border bg-crm-bg/40"}`}>
                  <p className={`text-2xl font-bold ${failed > 0 ? "text-red-500" : "text-crm-text-muted"}`}>{failed}</p>
                  <p className="text-xs uppercase tracking-wide text-crm-text-secondary mt-1">Failed</p>
                </div>
              </div>

              {(failed > 0 || (preview?.errorRows.length ?? 0) > 0) && (
                <button onClick={downloadErrorReport} className="crm-btn-secondary w-full justify-center">
                  <Download size={14} />
                  <span>Download Error Report</span>
                </button>
              )}

              <button onClick={handleClose} className="crm-btn-gold w-full justify-center">
                Done
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
