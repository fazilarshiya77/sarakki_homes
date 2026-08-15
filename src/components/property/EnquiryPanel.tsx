"use client";

import { useState } from "react";
import { CalendarCheck, MessageCircle, PhoneCall } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/Button";
import { ButtonFX } from "@/components/ui/ButtonFX";
import { useSiteSettings } from "@/components/providers/SettingsProvider";

export function EnquiryPanel({ propertyTitle }: { propertyTitle: string }) {
  const { contact } = useSiteSettings();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const scheduleVisitHref = `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(
    `Hi Sarakki Homes, I'd like to schedule a visit for "${propertyTitle}".`
  )}`;

  const submitEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hi Sarakki Homes, I'm enquiring about "${propertyTitle}".\nName: ${name || "-"}\nPhone: ${
      phone || "-"
    }\nMessage: ${message || "-"}`;
    window.open(`https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="rounded-md border border-border bg-card p-7 shadow-soft">
      <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
        Interested in this property?
      </p>
      <p className="mt-1 font-display text-xl">Talk to an advisor</p>

      <div className="mt-6 flex flex-col gap-3">
        <a
          href={contact.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses("primary", "w-full")}
        >
          <ButtonFX />
          <MessageCircle size={16} />
          WhatsApp Us
        </a>
        <a href={contact.phoneHref} className={buttonClasses("secondary", "w-full")}>
          <ButtonFX />
          <PhoneCall size={16} />
          {contact.phoneDisplay}
        </a>
        <a
          href={scheduleVisitHref}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses("secondary", "w-full")}
        >
          <ButtonFX />
          <CalendarCheck size={16} />
          Schedule a Visit
        </a>
      </div>

      <form onSubmit={submitEnquiry} className="mt-7 flex flex-col gap-3 border-t border-border pt-6">
        <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
          Or send an enquiry
        </p>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-sm border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-accent-gold-dark"
        />
        <input
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="rounded-sm border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-accent-gold-dark"
        />
        <textarea
          placeholder="Your message (optional)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="resize-none rounded-sm border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-accent-gold-dark"
        />
        <Button type="submit" variant="primary" className="w-full">
          Send Enquiry
        </Button>
      </form>
    </div>
  );
}
