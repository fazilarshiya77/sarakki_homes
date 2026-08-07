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
  category: { title: string };
  builder: { name: string };
  images: Array<{ url: string }>;
}

export default function PropertiesListPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const limit = 8;

  // Fetch properties from API
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/properties?search=${encodeURIComponent(
          search
        )}&status=${statusFilter}&page=${page}&limit=${limit}`
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
  }, [search, statusFilter, page]);

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
          <h1 className="font-display text-2xl font-semibold tracking-wide text-foreground">
            Properties Portfolio
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage listings, change statuses, and adjust featured properties.
          </p>
        </div>

        <Link
          href="/admin/properties/create"
          className="inline-flex items-center gap-2 rounded-sm bg-gradient-to-r from-accent-gold-dark to-accent-gold px-4 py-2 text-xs font-semibold uppercase tracking-wider text-black transition-all duration-300 hover:brightness-110 shadow-lg shadow-accent-gold/10"
        >
          <Plus size={14} />
          <span>Add Property</span>
        </Link>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-center gap-4 border border-border/20 bg-card/25 p-4 rounded-sm backdrop-blur-md">
        <div className="relative flex-1 w-full">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by ID, name, location..."
            className="w-full rounded-sm border border-border/40 bg-background/40 py-2.5 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-accent-gold/40"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
          <Filter size={14} className="text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-sm border border-border/40 bg-background/40 py-2.5 px-4 text-xs text-muted-foreground outline-none focus:border-accent-gold/40 cursor-pointer"
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

      {/* Main Grid Table */}
      <div className="border border-border/20 bg-card/10 rounded-sm overflow-hidden backdrop-blur-sm">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-muted-foreground text-xs font-semibold">
            <Loader2 size={24} className="animate-spin text-accent-gold" />
            <span>Retrieving portfolio data...</span>
          </div>
        ) : properties.length === 0 ? (
          <div className="py-24 text-center text-xs text-muted-foreground">
            No properties found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/20 bg-foreground/[0.02] text-muted-foreground font-semibold">
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
                      className="h-3.5 w-3.5 accent-accent-gold cursor-pointer"
                    />
                  </th>
                  <th className="p-4 uppercase tracking-wider font-semibold">Thumbnail</th>
                  <th className="p-4 uppercase tracking-wider font-semibold">ID</th>
                  <th className="p-4 uppercase tracking-wider font-semibold">Name</th>
                  <th className="p-4 uppercase tracking-wider font-semibold">Category</th>
                  <th className="p-4 uppercase tracking-wider font-semibold">Location</th>
                  <th className="p-4 uppercase tracking-wider font-semibold">Price</th>
                  <th className="p-4 uppercase tracking-wider font-semibold">Status</th>
                  <th className="p-4 uppercase tracking-wider font-semibold text-center">Featured</th>
                  <th className="p-4 uppercase tracking-wider font-semibold text-center">Views</th>
                  <th className="p-4 uppercase tracking-wider font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((prop) => {
                  const isChecked = selectedIds.includes(prop.id);
                  const isFeatured = prop.featured === "true";

                  // Status badge helpers
                  let badgeClass = "bg-muted text-muted-foreground border-muted-foreground/10";
                  if (prop.status === "PUBLISHED") badgeClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                  if (prop.status === "UNPUBLISHED") badgeClass = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                  if (prop.status === "SOLD") badgeClass = "bg-red-500/10 text-red-400 border-red-500/20";

                  return (
                    <tr
                      key={prop.id}
                      className={cn(
                        "border-b border-border/10 hover:bg-foreground/[0.01] transition-colors duration-150",
                        isChecked && "bg-accent-gold/[0.01]"
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
                          className="h-3.5 w-3.5 accent-accent-gold cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        <div className="h-10 w-14 rounded-sm bg-surface overflow-hidden relative border border-border/20 shrink-0">
                          {prop.images[0] ? (
                            <img
                              src={prop.images[0].url}
                              alt={prop.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-border/25" />
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-muted-foreground">
                        {prop.propertyId}
                      </td>
                      <td className="p-4 font-medium text-foreground">
                        {prop.title}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {prop.category.title}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {prop.location}
                      </td>
                      <td className="p-4 font-semibold text-foreground">
                        {prop.price}
                      </td>
                      <td className="p-4">
                        <span className={cn("px-2 py-1 rounded-full border text-[9px] font-semibold tracking-wide uppercase", badgeClass)}>
                          {prop.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleFeatured(prop)}
                          className={cn(
                            "p-1 hover:bg-background rounded-sm transition-colors",
                            isFeatured ? "text-accent-gold" : "text-muted-foreground/30 hover:text-accent-gold"
                          )}
                        >
                          {isFeatured ? <Star size={14} fill="currentColor" /> : <StarOff size={14} />}
                        </button>
                      </td>
                      <td className="p-4 text-center text-muted-foreground">
                        {prop.views}
                      </td>
                      <td className="p-4 text-right space-x-1 whitespace-nowrap">
                        <Link
                          href={`/admin/properties/${prop.id}/edit`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-border/40 hover:bg-surface text-muted-foreground hover:text-foreground transition-all duration-200"
                        >
                          <Edit2 size={12} />
                        </Link>
                        <button
                          onClick={() => handleDelete(prop.id, prop.title)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-red-500/10 hover:bg-red-500/5 text-red-500/80 hover:text-red-500 transition-all duration-200"
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
        <div className="flex items-center justify-between border-t border-border/20 pt-6">
          <span className="text-xs text-muted-foreground font-medium">
            Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)} of {total} properties
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-sm border border-border/40 disabled:opacity-30 hover:bg-surface text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-semibold px-2">{page}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-sm border border-border/40 disabled:opacity-30 hover:bg-surface text-muted-foreground hover:text-foreground transition-all duration-200"
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
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 rounded-lg border border-white/5 bg-black px-6 py-4.5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-md text-xs font-medium"
          >
            <div className="flex items-center gap-2 pr-4 border-r border-border/20">
              <span className="h-2 w-2 rounded-full bg-accent-gold" />
              <span>{selectedIds.length} properties selected</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleBulkStatus("PUBLISHED")}
                className="flex items-center gap-1.5 px-3 py-2 border border-border/40 hover:bg-surface rounded-sm hover:text-foreground text-muted-foreground transition-all duration-200"
              >
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span>Publish</span>
              </button>
              <button
                onClick={() => handleBulkStatus("UNPUBLISHED")}
                className="flex items-center gap-1.5 px-3 py-2 border border-border/40 hover:bg-surface rounded-sm hover:text-foreground text-muted-foreground transition-all duration-200"
              >
                <XCircle size={12} className="text-amber-500" />
                <span>Unpublish</span>
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 px-3 py-2 border border-red-500/10 hover:bg-red-500/5 text-red-500/80 hover:text-red-500 rounded-sm transition-all duration-200"
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

// Simple Helper function
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
