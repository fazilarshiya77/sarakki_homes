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
        <h1 className="font-display text-2xl font-semibold tracking-wide text-crm-text">
          Customer Database
        </h1>
        <p className="text-xs text-crm-text-secondary mt-0.5">
          Review customer contact cards, their historical inquiries, and note summaries.
        </p>
      </div>

      {/* Main Table card */}
      <div className="border border-crm-border/20 bg-crm-card/10 rounded-sm overflow-hidden backdrop-blur-sm">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-crm-text-secondary text-xs font-semibold">
            <Loader2 size={24} className="animate-spin text-crm-gold-bright" />
            <span>Loading customer list...</span>
          </div>
        ) : customers.length === 0 ? (
          <div className="py-24 text-center text-xs text-crm-text-secondary">
            No customer profiles registered.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-crm-border/20 bg-foreground/[0.02] text-crm-text-secondary font-semibold">
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
                        className="border-b border-crm-border/10 hover:bg-foreground/[0.01] cursor-pointer transition-all"
                      >
                        <td className="p-4 text-center">
                          {isExpanded ? <ChevronUp size={14} className="text-crm-text-secondary" /> : <ChevronDown size={14} className="text-crm-text-secondary" />}
                        </td>
                        <td className="p-4 font-semibold text-crm-text flex items-center gap-2">
                          <User size={12} className="text-crm-gold" />
                          <span>{cust.name}</span>
                        </td>
                        <td className="p-4 font-medium text-crm-text-secondary">
                          {cust.phone}
                        </td>
                        <td className="p-4 text-crm-text-secondary">
                          {cust.email}
                        </td>
                        <td className="p-4 font-semibold text-crm-gold-bright">
                          {cust.enquiries.length}
                        </td>
                        <td className="p-4 text-crm-text-secondary/60">
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
                            <td colSpan={6} className="p-6 border-b border-crm-border/10">
                              <div className="space-y-4 max-w-4xl ml-8">
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-crm-text-secondary">Enquiry History</h4>
                                {cust.enquiries.map((enq) => (
                                  <div
                                    key={enq.id}
                                    className="p-4 rounded-sm border border-crm-border/10 bg-crm-bg/50 space-y-2"
                                  >
                                    <div className="flex items-center justify-between text-[10px]">
                                      <span className="font-semibold text-crm-gold-bright flex items-center gap-1.5">
                                        <Building size={10} /> {enq.property.title} ({enq.property.price})
                                      </span>
                                      <span className="text-crm-text-secondary/60 flex items-center gap-1">
                                        <Calendar size={10} /> {new Date(enq.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-crm-text-secondary text-xs italic">&ldquo;{enq.message}&rdquo;</p>
                                    {enq.notes && (
                                      <div className="pt-2 border-t border-crm-border/10 text-[10px] text-crm-text-secondary">
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
