"use client";

import { useEffect, useState } from "react";
import { paymentService } from "@/services/payment.service";
import { bookingService } from "@/services/booking.service";
import { PaymentItem } from "@/types";
import { ArrowRight, CreditCard } from "lucide-react";
import Link from "next/link";

function getMeta(payment: PaymentItem) {
  const extended = payment as PaymentItem & { transactionId?: string; method?: string; provider?: string; paidAt?: string; currency?: string };
  let paidAt = extended.paidAt || "";
  if (paidAt) {
    try {
      const date = new Date(paidAt);
      if (!isNaN(date.getTime())) paidAt = date.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      /* keep raw */
    }
  }
  return { extended, paidAt };
}

function getBookingParties(payment: PaymentItem, enrichedBooking?: unknown) {
  const p = payment as PaymentItem & {
    customer?: { name?: string };
    booking?: {
      service?: { title?: string; name?: string };
      customer?: { name?: string };
      technician?: { name?: string };
      serviceName?: string;
    };
    serviceName?: string;
    customerName?: string;
    technicianName?: string;
  };
  const booking = (enrichedBooking || p.booking) as
    | {
        service?: { title?: string; name?: string };
        customer?: { name?: string };
        technician?: { name?: string };
        serviceName?: string;
      }
    | undefined;
  return {
    service: booking?.service?.title || booking?.service?.name || booking?.serviceName || p.serviceName || "",
    customer: p.customer?.name || booking?.customer?.name || p.customerName || "",
    technician: booking?.technician?.name || p.technicianName || "",
  };
}

function needsBookingEnrichment(payment: PaymentItem) {
  const parties = getBookingParties(payment);
  const hasEmbedded = Boolean(
    (payment as { booking?: unknown }).booking &&
      (parties.service || parties.customer || parties.technician)
  );
  return !hasEmbedded && Boolean(payment.bookingId);
}

async function enrichPaymentBookings(payments: PaymentItem[]) {
  const map: Record<string, unknown> = {};
  const pending = payments.filter(needsBookingEnrichment);
  const results = await Promise.allSettled(
    pending.map(async (payment) => {
      const response = await bookingService.detail(payment.bookingId as string);
      const booking = (response?.booking || response?.data || response || {}) as unknown;
      return [payment.bookingId, booking] as const;
    })
  );
  results.forEach((result) => {
    if (result.status === "fulfilled" && result.value) {
      const [bookingId, booking] = result.value;
      map[bookingId as string] = booking;
    }
  });
  return map;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [enrichMap, setEnrichMap] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await paymentService.list();
        const list = response?.payments || response?.data || [];
        setPayments(list);
        try {
          const map = await enrichPaymentBookings(list);
          setEnrichMap((prev) => ({ ...prev, ...map }));
        } catch {
          /* enrichment is best-effort */
        }
      } catch {
        /* ignore list errors */
      }
      setLoading(false);
    };

    load();
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="surface-card p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">
          <CreditCard className="h-4 w-4" /> Payments
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">Platform payment oversight.</h1>
      </section>

      <section className="mt-8 surface-card p-6 sm:p-8">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="surface-panel h-20 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => {
              const status = String(payment.status || "").toUpperCase();
              const { extended, paidAt } = getMeta(payment);
              const { service, customer, technician } = getBookingParties(payment, payment.bookingId ? enrichMap[payment.bookingId] : undefined);
              return (
              <article key={payment.id} className="flex flex-col gap-4 rounded-3xl border border-border bg-slate-50 p-5 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-foreground">৳{payment.amount ?? 0}</p>
                  {/* <p className="mt-1 text-sm text-text-muted">Booking #{payment.bookingId || "N/A"}</p> */}
                  {service && <p className="mt-1 text-sm font-semibold text-foreground">{service}</p>}
                  {(customer || technician) && (
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-muted">
                      {customer && <span>Customer: {customer}</span>}
                      {technician && <span>Technician: {technician}</span>}
                    </div>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs uppercase tracking-[0.12em] text-text-muted">
                    {/* {extended.transactionId && <span>Tx {extended.transactionId}</span>} */}
                    {extended.method && <span>{extended.method}</span>}
                    {extended.provider && <span>{extended.provider}</span>}
                    {paidAt && <span>{paidAt}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                      status === "COMPLETED"
                        ? "bg-success-soft text-success-strong"
                        : status === "PENDING"
                        ? "bg-warning-soft text-warning-strong"
                        : status === "CANCELED" || status === "CANCELLED" || status === "FAILED" || status === "DECLINED"
                        ? "bg-danger-soft text-danger-strong"
                        : "bg-slate-200 text-text-muted"
                    }`}
                  >
                    {status || "PAID"}
                  </span>
                  <Link href={`/payments/${payment.id}`} className="btn-secondary text-sm">
                    View payment details
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
              );
            })}
          </div>
        )}
      </section>

      {/* <section className="mt-8 rounded-3xl border border-border bg-slate-50 p-6 text-sm text-text-muted">
        <div className="inline-flex items-center gap-2 text-foreground">
          <ShieldCheck className="h-4 w-4 text-success" /> This view is read-only until payment reconciliation actions are exposed by the backend.
        </div>
      </section> */}
    </main>
  );
}