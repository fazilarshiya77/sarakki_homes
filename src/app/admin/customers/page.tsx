"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Phone,
  Mail,
  Building,
  Calendar,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
  enquiries: Array<{
    id: string;
    message: string;
    status: string;
    notes: string;
    createdAt: string;
    property: { title: string; price: string };
  }>;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/customers");
      const data = await res.json();
      if (data.customers) {
        setCustomers(data.customers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-wide text-foreground">
          Customer Database
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Review customer contact cards, their historical inquiries, and note summaries.
        </p>
      </div>

      {/* Main Table card */}
      <div className="border border-border/20 bg-card/10 rounded-sm overflow-hidden backdrop-blur-sm">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-muted-foreground text-xs font-semibold">
            <Loader2 size={24} className="animate-spin text-accent-gold" />
            <span>Loading customer list...</span>
          </div>
        ) : customers.length === 0 ? (
          <div className="py-24 text-center text-xs text-muted-foreground">
            No customer profiles registered.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/20 bg-foreground/[0.02] text-muted-foreground font-semibold">
                  <th className="p-4 w-8"></th>
                  <th className="p-4 uppercase tracking-wider font-semibold">Customer Name</th>
                  <th className="p-4 uppercase tracking-wider font-semibold">Phone</th>
                  <th className="p-4 uppercase tracking-wider font-semibold">Email Address</th>
                  <th className="p-4 uppercase tracking-wider font-semibold">Total Leads</th>
                  <th className="p-4 uppercase tracking-wider font-semibold">Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((cust) => {
                  const isExpanded = expandedId === cust.id;
                  return (
                    <>
                      <tr
                        key={cust.id}
                        onClick={() => toggleExpand(cust.id)}
                        className="border-b border-border/10 hover:bg-foreground/[0.01] cursor-pointer transition-all"
                      >
                        <td className="p-4 text-center">
                          {isExpanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                        </td>
                        <td className="p-4 font-semibold text-foreground flex items-center gap-2">
                          <User size={12} className="text-accent-gold-dark" />
                          <span>{cust.name}</span>
                        </td>
                        <td className="p-4 font-medium text-muted-foreground">
                          {cust.phone}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {cust.email}
                        </td>
                        <td className="p-4 font-semibold text-accent-gold">
                          {cust.enquiries.length}
                        </td>
                        <td className="p-4 text-muted-foreground/60">
                          {new Date(cust.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      </tr>

                      {/* Collapsible history view */}
                      <AnimatePresence>
                        {isExpanded && (
                          <tr className="bg-foreground/[0.01]">
                            <td colSpan={6} className="p-6 border-b border-border/10">
                              <div className="space-y-4 max-w-4xl ml-8">
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Enquiry History</h4>
                                {cust.enquiries.map((enq) => (
                                  <div
                                    key={enq.id}
                                    className="p-4 rounded-sm border border-border/10 bg-background/50 space-y-2"
                                  >
                                    <div className="flex items-center justify-between text-[10px]">
                                      <span className="font-semibold text-accent-gold flex items-center gap-1.5">
                                        <Building size={10} /> {enq.property.title} ({enq.property.price})
                                      </span>
                                      <span className="text-muted-foreground/60 flex items-center gap-1">
                                        <Calendar size={10} /> {new Date(enq.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-muted-foreground text-xs italic">"{enq.message}"</p>
                                    {enq.notes && (
                                      <div className="pt-2 border-t border-border/10 text-[10px] text-muted-foreground">
                                        <strong>Staff Note: </strong> {enq.notes}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
