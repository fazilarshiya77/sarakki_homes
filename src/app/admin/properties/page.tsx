"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Star,
  StarOff,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Copy,
  Archive,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useDebounce } from "@/lib/useDebounce";

interface Property {
  id: string;
  propertyId: string;
  slug: string;
  title: string;
  location: string;
  price: string;
  type: string;
  status: string;
  featured: string;
  views: number;
  category: { title: string; slug: string };
  builder: { name: string };
  images: Array<{ url: string }>;
}

interface CategoryOption {
  slug: string;
  title: string;
  _count: { properties: number };
}

// 25/page (up from 8) — at 8/page the 7 bank-auction properties (all
// created in one batch) filled all of page 1 on their own, making the
// other 6 published properties invisible without paging forward. This
// made the CRM's single real inventory look like two separate ones.
const PAGE_SIZE = 25;

export default function PropertiesListPage() {
  return (
    <Suspense fallback={null}>
      <PropertiesListPageInner />
    </Suspense>
  );
}

// Reads an initial `?status=` deep-link (e.g. from the Dashboard's
// "Draft Properties" attention card) — under Suspense because
// useSearchParams opts the page out of static rendering otherwise.
function PropertiesListPageInner() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get("status") || "");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sort, setSort] = useState("newest");
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [publishToast, setPublishToast] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{
    kind: "delete" | "bulkDelete" | "archive" | "bulkArchive";
    id?: string;
    name?: string;
  } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const limit = PAGE_SIZE;
  const hasActiveFilters = Boolean(search || statusFilter || categoryFilter);

  // The wizard has no other page to hand a confirmation to -- it
  // navigates here right after a successful publish/save. It stores a
  // one-shot flag in sessionStorage before navigating; this reads and
  // clears it on mount so the banner shows exactly once, even on a
  // manual refresh of this page afterwards.
  useEffect(() => {
    const raw = sessionStorage.getItem("sh_crm_publish_toast");
    if (raw) {
      sessionStorage.removeItem("sh_crm_publish_toast");
      setPublishToast(raw);
    }
  }, []);

  // Generic auto-dismiss for every toast this page shows — not just the
  // sessionStorage-sourced one above, also the ones set directly after
  // delete/archive/duplicate actions below.
  useEffect(() => {
    if (!publishToast) return;
    const timer = setTimeout(() => setPublishToast(null), 5000);
    return () => clearTimeout(timer);
  }, [publishToast]);

  // Fetch properties from API
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/properties?search=${encodeURIComponent(
          debouncedSearch
        )}&status=${statusFilter}&category=${categoryFilter}&sort=${sort}&page=${page}&limit=${limit}`
      );
      const data = await res.json();
      if (data.properties) {
        setProperties(data.properties);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [debouncedSearch, statusFilter, categoryFilter, sort, page]);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch((err) => console.error(err));
  }, []);

  // Individual delete — permanent, so it's gated behind the styled
  // confirm dialog (see confirmState) rather than firing straight away.
  const requestDelete = (id: string, name: string) => setConfirmState({ kind: "delete", id, name });

  const requestArchive = (id: string, name: string) => setConfirmState({ kind: "archive", id, name });

  const runConfirmedAction = async () => {
    if (!confirmState) return;
    setConfirmLoading(true);
    try {
      if (confirmState.kind === "delete" && confirmState.id) {
        const res = await fetch(`/api/admin/properties/${confirmState.id}`, { method: "DELETE" });
        if (res.ok) {
          setSelectedIds((prev) => prev.filter((x) => x !== confirmState.id));
          setPublishToast(`"${confirmState.name}" was deleted.`);
        }
      } else if (confirmState.kind === "bulkDelete") {
        for (const id of selectedIds) {
          await fetch(`/api/admin/properties/${id}`, { method: "DELETE" });
        }
        setPublishToast(`${selectedIds.length} properties deleted.`);
        setSelectedIds([]);
      } else if (confirmState.kind === "archive" && confirmState.id) {
        const prop = properties.find((p) => p.id === confirmState.id);
        if (prop) {
          await fetch(`/api/admin/properties/${confirmState.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...prop,
              categoryId: (prop as any).categoryId,
              builderId: (prop as any).builderId,
              status: "ARCHIVED",
            }),
          });
        }
        setPublishToast(`"${confirmState.name}" was archived. It's hidden from the website but not deleted.`);
      } else if (confirmState.kind === "bulkArchive") {
        await handleBulkStatus("ARCHIVED", false);
        setPublishToast(`${selectedIds.length} properties archived.`);
        setSelectedIds([]);
      }
      fetchProperties();
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmLoading(false);
      setConfirmState(null);
    }
  };

  // Toggle Featured status
  const toggleFeatured = async (property: Property) => {
    const nextFeatured = property.featured === "true" ? "false" : "true";
    try {
      const res = await fetch(`/api/admin/properties/${property.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...property,
          categoryId: (property as any).categoryId,
          builderId: (property as any).builderId,
          featured: nextFeatured,
        }),
      });
      if (res.ok) {
        fetchProperties();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Duplicate — clones a listing as a new DRAFT so the admin can reuse a
  // similar property (e.g. another unit in the same project) without
  // retyping every field, and can't accidentally publish two identical
  // listings (the copy always lands as UNPUBLISHED regardless of the
  // source's status).
  const handleDuplicate = async (id: string) => {
    setDuplicatingId(id);
    try {
      const getRes = await fetch(`/api/admin/properties/${id}`);
      const { property } = await getRes.json();
      if (!property) return;

      const res = await fetch("/api/admin/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...property,
          title: `${property.title} (Copy)`,
          slug: undefined,
          status: "UNPUBLISHED",
          featured: "false",
          images: property.images?.map((img: { url: string }) => ({ url: img.url })) ?? [],
          auctionInfo: property.auctionInfo ?? undefined,
          loanEligibility: property.loanEligibility ?? undefined,
        }),
      });
      if (res.ok) {
        setPublishToast(`"${property.title}" duplicated as a new draft.`);
        fetchProperties();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleBulkStatus = async (newStatus: string, andClose = true) => {
    try {
      for (const id of selectedIds) {
        // Find property
        const prop = properties.find((p) => p.id === id);
        if (prop) {
          await fetch(`/api/admin/properties/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...prop,
              categoryId: (prop as any).categoryId,
              builderId: (prop as any).builderId,
              status: newStatus,
            }),
          });
        }
      }
      if (andClose) {
        setPublishToast(
          `${selectedIds.length} propert${selectedIds.length === 1 ? "y" : "ies"} ${
            newStatus === "PUBLISHED" ? "published" : "unpublished"
          }.`
        );
        setSelectedIds([]);
        fetchProperties();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 relative pb-20">
      {/* Publish/save confirmation toast — see the sessionStorage effect
          above for why this lives here rather than in the wizard itself
          (the wizard navigates away before the user could read it). */}
      <AnimatePresence>
        {publishToast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-6 top-6 z-50 flex items-center gap-3 rounded-sm border border-emerald-500/25 bg-crm-card px-5 py-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.18)]"
          >
            <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
            <span className="text-sm font-semibold text-crm-text">{publishToast}</span>
            <button
              type="button"
              onClick={() => setPublishToast(null)}
              aria-label="Dismiss"
              className="ml-2 text-crm-text-muted transition-colors hover:text-crm-text"
            >
              <XCircle size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmState !== null}
        title={
          confirmState?.kind === "delete"
            ? `Delete "${confirmState.name}"?`
            : confirmState?.kind === "bulkDelete"
              ? `Delete ${selectedIds.length} properties?`
              : confirmState?.kind === "archive"
                ? `Archive "${confirmState.name}"?`
                : `Archive ${selectedIds.length} properties?`
        }
        message={
          confirmState?.kind === "delete" || confirmState?.kind === "bulkDelete"
            ? "This permanently removes the listing and its photos — this can't be undone. If you might need it again, Archive instead."
            : "The listing comes off the live website immediately but stays in the CRM, so you can restore or edit it later."
        }
        confirmLabel={
          confirmState?.kind === "delete" || confirmState?.kind === "bulkDelete" ? "Delete" : "Archive"
        }
        tone={confirmState?.kind === "delete" || confirmState?.kind === "bulkDelete" ? "danger" : "default"}
        loading={confirmLoading}
        onConfirm={runConfirmedAction}
        onCancel={() => setConfirmState(null)}
      />

      {/* List Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="crm-page-title tracking-wide">
            Properties Portfolio
          </h1>
          <p className="text-sm text-crm-text-secondary mt-1">
            Manage listings, change statuses, and adjust featured properties.
          </p>
        </div>

        <Link href="/admin/properties/create" className="crm-btn-gold">
          <Plus size={14} />
          <span>Add Property</span>
        </Link>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-center gap-4 crm-card p-4">
        <div className="relative flex-1 w-full">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-crm-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by ID, name, location..."
            // `.crm-input`'s own CSS sets a `padding` shorthand (globals.css)
            // that, due to stylesheet load order, wins over Tailwind's
            // `pl-10` and silently resets left padding back down — text was
            // rendering right under the search icon. `pl-10!` forces
            // Tailwind's `!important` variant so the icon offset actually
            // sticks regardless of cascade order.
            className="crm-input pl-10!"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
          <Filter size={14} className="text-crm-text-muted shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="crm-select"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.title} ({cat._count.properties})
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="crm-select"
          >
            <option value="">All Statuses</option>
            <option value="PUBLISHED">Published (live on website)</option>
            <option value="UNPUBLISHED">Draft (not on website yet)</option>
            <option value="ARCHIVED">Archived</option>
            <option value="SOLD">Sold</option>
            <option value="UNDER_PROCESS">Under Process</option>
            <option value="AUCTION_CLOSED">Auction Closed</option>
          </select>
          <div className="flex items-center gap-1.5">
            <ArrowUpDown size={14} className="text-crm-text-muted shrink-0" />
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="crm-select"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="name_asc">Name: A–Z</option>
              <option value="name_desc">Name: Z–A</option>
            </select>
          </div>
        </div>
      </div>

      <p className="text-sm text-crm-text-secondary">
        {total} propert{total === 1 ? "y" : "ies"} total across every category — this is the same inventory the public website reads from.
      </p>

      {/* Main Grid Table */}
      <div className="crm-card overflow-hidden">
        {loading ? (
          <div className="divide-y divide-crm-border/70 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="h-10 w-14 shrink-0 rounded-sm bg-crm-border/50" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-2/5 rounded-full bg-crm-border/50" />
                  <div className="h-3 w-1/4 rounded-full bg-crm-border/30" />
                </div>
                <div className="h-3.5 w-20 rounded-full bg-crm-border/40" />
                <div className="h-6 w-20 rounded-full bg-crm-border/40" />
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-center px-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-crm-bg text-crm-text-muted">
              <Search size={20} />
            </div>
            {hasActiveFilters ? (
              <>
                <p className="crm-section-heading !text-base">No properties found</p>
                <p className="crm-body-text max-w-sm">
                  Try changing your search or filters — nothing in the portfolio matches those criteria right now.
                </p>
              </>
            ) : (
              <>
                <p className="crm-section-heading !text-base">No properties yet</p>
                <p className="crm-body-text max-w-sm">
                  Add your first listing to start building the portfolio — it'll appear here and can be published to the website whenever you're ready.
                </p>
              </>
            )}
            <Link href="/admin/properties/create" className="crm-btn-gold mt-2">
              <Plus size={14} />
              <span>Add Property</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse crm-table-text">
              <thead>
                <tr className="border-b border-crm-border bg-crm-bg/70 text-crm-text-muted font-semibold">
                  <th className="p-4 w-12">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === properties.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(properties.map((p) => p.id));
                        } else {
                          setSelectedIds([]);
                        }
                      }}
                      className="h-3.5 w-3.5 accent-crm-gold cursor-pointer"
                    />
                  </th>
                  <th className="p-4 uppercase tracking-wider text-[11px] font-bold">Thumbnail</th>
                  <th className="p-4 uppercase tracking-wider text-[11px] font-bold">ID</th>
                  <th className="p-4 uppercase tracking-wider text-[11px] font-bold">Name</th>
                  <th className="p-4 uppercase tracking-wider text-[11px] font-bold">Category</th>
                  <th className="p-4 uppercase tracking-wider text-[11px] font-bold">Location</th>
                  <th className="p-4 uppercase tracking-wider text-[11px] font-bold">Price</th>
                  <th className="p-4 uppercase tracking-wider text-[11px] font-bold">Status</th>
                  <th className="p-4 uppercase tracking-wider text-[11px] font-bold text-center">Featured</th>
                  <th className="p-4 uppercase tracking-wider text-[11px] font-bold text-center">Views</th>
                  <th className="p-4 uppercase tracking-wider text-[11px] font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((prop) => {
                  const isChecked = selectedIds.includes(prop.id);
                  const isFeatured = prop.featured === "true";

                  return (
                    <tr
                      key={prop.id}
                      className={cn(
                        "border-b border-crm-border/70 hover:bg-crm-gold/[0.035] transition-colors duration-150",
                        isChecked && "bg-crm-gold/[0.05]"
                      )}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds([...selectedIds, prop.id]);
                            } else {
                              setSelectedIds(selectedIds.filter((x) => x !== prop.id));
                            }
                          }}
                          className="h-3.5 w-3.5 accent-crm-gold cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        <div className="h-10 w-14 rounded-sm bg-crm-bg overflow-hidden relative border border-crm-border shrink-0">
                          {prop.images[0] ? (
                            <img
                              src={prop.images[0].url}
                              alt={prop.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-crm-border/40" />
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-mono text-[13px] text-crm-text-muted">
                        {prop.propertyId}
                      </td>
                      <td className="p-4 font-semibold text-crm-text">
                        {prop.title}
                      </td>
                      <td className="p-4 text-crm-text-secondary">
                        {prop.category.title}
                      </td>
                      <td className="p-4 text-crm-text-secondary">
                        {prop.location}
                      </td>
                      <td className="p-4 crm-value">
                        {prop.price}
                      </td>
                      <td className="p-4">
                        <PropertyStatusBadge status={prop.status} />
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleFeatured(prop)}
                          className={cn(
                            "p-1 hover:bg-crm-bg rounded-sm transition-colors",
                            isFeatured ? "text-crm-gold" : "text-crm-text-muted/50 hover:text-crm-gold"
                          )}
                        >
                          {isFeatured ? <Star size={14} fill="currentColor" /> : <StarOff size={14} />}
                        </button>
                      </td>
                      <td className="p-4 text-center text-crm-text-secondary">
                        {prop.views}
                      </td>
                      <td className="p-4 text-right space-x-1 whitespace-nowrap">
                        {prop.status === "PUBLISHED" && (
                          <a
                            href={publicUrlFor(prop)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View on Website"
                            aria-label="View on Website"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-crm-border hover:border-crm-gold/50 hover:bg-crm-gold/5 text-crm-text-secondary hover:text-crm-text transition-all duration-200"
                          >
                            <ExternalLink size={12} />
                          </a>
                        )}
                        <Link
                          href={`/admin/properties/${prop.id}/edit`}
                          title="Edit"
                          aria-label="Edit"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-crm-border hover:border-crm-gold/50 hover:bg-crm-gold/5 text-crm-text-secondary hover:text-crm-text transition-all duration-200"
                        >
                          <Edit2 size={12} />
                        </Link>
                        <button
                          onClick={() => handleDuplicate(prop.id)}
                          disabled={duplicatingId === prop.id}
                          title="Duplicate"
                          aria-label="Duplicate"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-crm-border hover:border-crm-gold/50 hover:bg-crm-gold/5 text-crm-text-secondary hover:text-crm-text transition-all duration-200 disabled:opacity-40"
                        >
                          {duplicatingId === prop.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                        {prop.status !== "ARCHIVED" && (
                          <button
                            onClick={() => requestArchive(prop.id, prop.title)}
                            title="Archive"
                            aria-label="Archive"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-crm-border hover:border-amber-300 hover:bg-amber-50 text-crm-text-secondary hover:text-amber-600 transition-all duration-200"
                          >
                            <Archive size={12} />
                          </button>
                        )}
                        <button
                          onClick={() => requestDelete(prop.id, prop.title)}
                          title="Delete"
                          aria-label="Delete"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-red-200 hover:bg-red-50 text-red-500/80 hover:text-red-600 transition-all duration-200"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-crm-border pt-6">
          <span className="text-sm text-crm-text-secondary font-medium">
            Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)} of {total} properties
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-sm border border-crm-border disabled:opacity-30 hover:border-crm-gold/50 hover:bg-crm-gold/5 text-crm-text-secondary hover:text-crm-text transition-all duration-200"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold px-2 text-crm-text">{page}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-sm border border-crm-border disabled:opacity-30 hover:border-crm-gold/50 hover:bg-crm-gold/5 text-crm-text-secondary hover:text-crm-text transition-all duration-200"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Bulk Actions Bar (Notion/Linear style) */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 rounded-lg bg-crm-espresso px-6 py-4.5 shadow-[0_20px_50px_rgba(36,30,25,0.45)] text-sm font-medium text-crm-ivory"
          >
            <div className="flex items-center gap-2 pr-4 border-r border-white/10">
              <span className="h-2 w-2 rounded-full bg-crm-gold" />
              <span>{selectedIds.length} properties selected</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleBulkStatus("PUBLISHED")}
                className="flex items-center gap-1.5 px-3 py-2 border border-white/10 hover:bg-white/5 rounded-sm text-white/70 hover:text-white transition-all duration-200"
              >
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span>Publish</span>
              </button>
              <button
                onClick={() => handleBulkStatus("UNPUBLISHED")}
                className="flex items-center gap-1.5 px-3 py-2 border border-white/10 hover:bg-white/5 rounded-sm text-white/70 hover:text-white transition-all duration-200"
              >
                <XCircle size={12} className="text-amber-400" />
                <span>Move to Draft</span>
              </button>
              <button
                onClick={() => setConfirmState({ kind: "bulkArchive" })}
                className="flex items-center gap-1.5 px-3 py-2 border border-white/10 hover:bg-white/5 rounded-sm text-white/70 hover:text-white transition-all duration-200"
              >
                <Archive size={12} className="text-amber-400" />
                <span>Archive</span>
              </button>
              <button
                onClick={() => setConfirmState({ kind: "bulkDelete" })}
                className="flex items-center gap-1.5 px-3 py-2 border border-red-400/20 hover:bg-red-500/10 text-red-300 hover:text-red-200 rounded-sm transition-all duration-200"
              >
                <Trash2 size={12} />
                <span>Delete</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Restrained, consistent status colors — champagne gold reserved for
// "in-progress/auction" states, muted tones elsewhere, per the CRM
// redesign brief (never every status bright).
const STATUS_BADGE_STYLES: Record<string, string> = {
  PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  UNPUBLISHED: "bg-crm-bg text-crm-text-secondary border-crm-border",
  DRAFT: "bg-crm-bg text-crm-text-secondary border-crm-border",
  SOLD: "bg-zinc-100 text-zinc-500 border-zinc-200",
  ARCHIVED: "bg-zinc-100 text-zinc-500 border-zinc-200",
  UNDER_PROCESS: "bg-crm-gold/12 text-crm-brown border-crm-gold/30",
  AUCTION_CLOSED: "bg-zinc-100 text-zinc-500 border-zinc-200",
};

function PropertyStatusBadge({ status }: { status: string }) {
  const style = STATUS_BADGE_STYLES[status] ?? "bg-crm-bg text-crm-text-secondary border-crm-border";
  return (
    <span className={cn("px-2.5 py-1 rounded-full border text-[11px] font-bold tracking-wide uppercase", style)}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

// Simple Helper function
// Bank-auction listings live at a different public route (keyed by the
// short propertyId, not the slug) than every other category — mirrors
// the routing in src/app/properties/bank-auctions/[propertyId] vs
// src/app/properties/[slug].
function publicUrlFor(prop: Property): string {
  return prop.category.slug === "bank-auctions"
    ? `/properties/bank-auctions/${prop.propertyId}`
    : `/properties/${prop.slug}`;
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
