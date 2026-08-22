import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// SECURITY: this route is public (no auth — it's the website's contact
// form), so every response is deliberately generic. Raw Prisma/DB errors
// are logged server-side only, never echoed to the browser.
const GENERIC_ERROR = "Something went wrong. Please try again in a moment.";

const CONTACT_METHODS = ["Phone", "WhatsApp", "Email"] as const;
type ContactMethod = (typeof CONTACT_METHODS)[number];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Loose, international-friendly: digits/spaces/+/-/() as typed, but at
// least 7 actual digits once those are stripped — rejects "abc" or a
// three-digit typo without being fussy about country-code formatting.
const PHONE_DIGITS_MIN = 7;

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid request.");
  }

  // Honeypot: a field named to look legitimate to a scraper/bot
  // ("website") but never rendered for a real visitor to see or fill in
  // the actual form (see ConsultationModal). Anything filling it in gets
  // a fake success — no error that would teach a bot to adjust and
  // retry, and no row is written.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ success: true });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phoneRaw = typeof body.phone === "string" ? body.phone.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const contactMethod = CONTACT_METHODS.includes(body.contactMethod) ? (body.contactMethod as ContactMethod) : "";
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 2000) : "";
  const preferredDate = typeof body.preferredDate === "string" ? body.preferredDate.trim().slice(0, 40) : "";
  const preferredTime = typeof body.preferredTime === "string" ? body.preferredTime.trim().slice(0, 40) : "";
  const propertyId = typeof body.propertyId === "string" ? body.propertyId.trim() : "";

  if (!name || name.length < 2) return badRequest("Please enter your full name.");
  if (!EMAIL_RE.test(email)) return badRequest("Please enter a valid email address.");
  const phoneDigits = phoneRaw.replace(/\D/g, "");
  if (phoneDigits.length < PHONE_DIGITS_MIN) return badRequest("Please enter a valid phone number.");
  if (!contactMethod) return badRequest("Please choose a preferred contact method.");
  if (!propertyId) return badRequest("Missing property reference.");

  try {
    // #8: link to the real Property row, never just save a name as free
    // text — if the id the client sent doesn't match an actual listing,
    // reject rather than silently writing an orphaned enquiry.
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true },
    });
    if (!property) return badRequest("This property could not be found.");

    // Basic spam/duplicate guard: the same person re-submitting for the
    // same property within a short window (an accidental double-click,
    // a network retry after a slow response) reuses the existing row
    // instead of creating a near-identical duplicate.
    const existingCustomer = await prisma.customer.findUnique({ where: { email } });
    if (existingCustomer) {
      const recentDuplicate = await prisma.enquiry.findFirst({
        where: {
          customerId: existingCustomer.id,
          propertyId,
          createdAt: { gte: new Date(Date.now() - 2 * 60 * 1000) },
        },
      });
      if (recentDuplicate) {
        return NextResponse.json({ success: true, enquiryId: recentDuplicate.id });
      }
    }

    // Customer is keyed by email (schema: Customer.email @unique) — an
    // existing customer's contact details are refreshed to what they
    // just typed (they're self-reporting current info), a new one is
    // created otherwise. Reuses the exact same Customer/Enquiry
    // relationship the admin-side CRM already reads (#9) — no new table.
    const customer = existingCustomer
      ? await prisma.customer.update({
          where: { id: existingCustomer.id },
          data: { name, phone: phoneRaw },
        })
      : await prisma.customer.create({
          data: { name, phone: phoneRaw, email },
        });

    const enquiry = await prisma.enquiry.create({
      data: {
        customerId: customer.id,
        propertyId,
        message: message || "Requested a consultation for this property.",
        status: "NEW",
        enquiryType: "Consultation",
        contactMethod,
        preferredDate: preferredDate || null,
        preferredTime: preferredTime || null,
      },
    });

    return NextResponse.json({ success: true, enquiryId: enquiry.id });
  } catch (error: unknown) {
    console.error("[api/enquiries] POST failed:", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}
