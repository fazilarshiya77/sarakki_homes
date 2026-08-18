"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

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
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const limit = PAGE_SIZE;

  // Fetch properties from API
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/properties?search=${encodeURIComponent(
          search
        )}&status=${statusFilter}&category=${categoryFilter}&page=${page}&limit=${limit}`
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
  }, [search, statusFilter, categoryFilter, page]);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch((err) => console.error(err));
  }, []);

  // Handle individual delete
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete property "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/properties/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchProperties();
        setSelectedIds(selectedIds.filter((x) => x !== id));
      }
    } catch (err) {
      console.error(err);
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

  // Bulk actions handlers
  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} properties?`)) return;

    try {
      for (const id of selectedIds) {
        await fetch(`/api/admin/properties/${id}`, { method: "DELETE" });
      }
      setSelectedIds([]);
      fetchProperties();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkStatus = async (newStatus: string) => {
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
      setSelectedIds([]);
      fetchProperties();
    } catch (err) {
      console.error(err);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 relative pb-20">
      {/* List Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-wide text-crm-text">
            Properties Portfolio
          </h1>
          <p className="text-xs text-crm-text-secondary mt-0.5">
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
            <option value="PUBLISHED">Published</option>
            <option value="UNPUBLISHED">Unpublished</option>
            <option value="SOLD">Sold</option>
            <option value="UNDER_PROCESS">Under Process</option>
            <option value="AUCTION_CLOSED">Auction Closed</option>
          </select>
        </div>
      </div>

      <p className="text-xs text-crm-text-secondary">
        {total} propert{total === 1 ? "y" : "ies"} total across every category — this is the same inventory the public website reads from.
      </p>

      {/* Main Grid Table */}
      <div className="crm-card overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-crm-text-muted text-xs font-semibold">
            <Loader2 size={24} className="animate-spin text-crm-gold" />
            <span>Retrieving portfolio data...</span>
          </div>
        ) : properties.length === 0 ? (
          <div className="py-24 text-center text-xs text-crm-text-muted">
            No properties found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
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
                  <th className="p-4 uppercase tracking-wider text-[10px] font-bold">Thumbnail</th>
                  <th className="p-4 uppercase tracking-wider text-[10px] font-bold">ID</th>
                  <th className="p-4 uppercase tracking-wider text-[10px] font-bold">Name</th>
                  <th className="p-4 uppercase tracking-wider text-[10px] font-bold">Category</th>
                  <th className="p-4 uppercase tracking-wider text-[10px] font-bold">Location</th>
                  <th className="p-4 uppercase tracking-wider text-[10px] font-bold">Price</th>
                  <th className="p-4 uppercase tracking-wider text-[10px] font-bold">Status</th>
                  <th className="p-4 uppercase tracking-wider text-[10px] font-bold text-center">Featured</th>
                  <th className="p-4 uppercase tracking-wider text-[10px] font-bold text-center">Views</th>
                  <th className="p-4 uppercase tracking-wider text-[10px] font-bold text-right">Actions</th>
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
                      <td className="p-4 font-mono text-[11px] text-crm-text-muted">
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
                      <td className="p-4 font-semibold text-crm-text">
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
                        <Link
                          href={`/admin/properties/${prop.id}/edit`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-crm-border hover:border-crm-gold/50 hover:bg-crm-gold/5 text-crm-text-secondary hover:text-crm-text transition-all duration-200"
                        >
                          <Edit2 size={12} />
                        </Link>
                        <button
                          onClick={() => handleDelete(prop.id, prop.title)}
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
          <span className="text-xs text-crm-text-secondary font-medium">
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
            <span className="text-xs font-semibold px-2 text-crm-text">{page}</span>
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
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 rounded-lg bg-crm-espresso px-6 py-4.5 shadow-[0_20px_50px_rgba(36,30,25,0.45)] text-xs font-medium text-crm-ivory"
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
                <span>Unpublish</span>
              </button>
              <button
                onClick={handleBulkDelete}
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
    <span className={cn("px-2.5 py-1 rounded-full border text-[9px] font-bold tracking-wide uppercase", style)}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

// Simple Helper function
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
