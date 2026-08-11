"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { paymentService } from "@/services/payment.service";
import { bookingService } from "@/services/booking.service";
import { PaymentItem } from "@/types";
import { ArrowRight, CreditCard, ShieldCheck } from "lucide-react";

function getStatusTone(status: string) {
  if (status === "COMPLETED") return "bg-success-soft text-success-strong";
  if (status === "PENDING") return "bg-warning-soft text-warning-strong";
  if (status === "CANCELED" || status === "CANCELLED" || status === "FAILED" || status === "DECLINED")
    return "bg-danger-soft text-danger-strong";
  return "bg-slate-200 text-text-muted";
}

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

export default function PaymentDetailPage() {
  const params = useParams<{ id: string }>();
  const [payment, setPayment] = useState<PaymentItem | null>(null);
  const [enrichedBooking, setEnrichedBooking] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!params?.id) return;

      try {
        const response = await paymentService.detail(params.id);
        const payment = response?.payment || response?.data || response || null;
        setPayment(payment);

        if (payment?.bookingId) {
          try {
            const bookingResponse = await bookingService.detail(payment.bookingId);
            const booking = (bookingResponse?.booking || bookingResponse?.data || bookingResponse || {}) as unknown;
            setEnrichedBooking(booking);
          } catch {
            /* enrichment is best-effort */
          }
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load payment");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params?.id]);

  const status = String(payment?.status || "").toUpperCase();

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="surface-card h-56 animate-pulse" />
      </main>
    );
  }

  if (error || !payment) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="surface-card p-6 text-sm text-danger">{error || "No payment found."}</div>
        <Link href="/payments" className="btn-secondary mt-6">
          Back to payments
        </Link>
      </main>
    );
  }

  const { extended, paidAt } = getMeta(payment);
  const { service, customer, technician } = getBookingParties(payment, enrichedBooking || undefined);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${getStatusTone(status)}`}>
          {status || "PAID"}
        </span>
        <p className="text-sm text-text-muted">Payment #{payment.id}</p>
      </div>

      <section className="surface-card mt-6 p-6 sm:p-8">
        {/* <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">
          <CreditCard className="h-4 w-4" /> Payment details
        </div> */}
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
          Transaction details
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-text-muted">
          Review the amount, booking reference, and current status of this transaction.
        </p>
      </section>

      <section className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-3xl border border-border bg-slate-50 p-5">
          <p className="text-sm text-text-muted">Amount</p>
          <p className="mt-2 font-semibold text-foreground">৳{payment.amount ?? 0}</p>
        </div>
        <div className="rounded-3xl border border-border bg-slate-50 p-5">
          <p className="text-sm text-text-muted">Status</p>
          <p className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${getStatusTone(status)}`}>
            {status || "PAID"}
          </p>
        </div>
        {/* <div className="rounded-3xl border border-border bg-slate-50 p-5">
          <p className="text-sm text-text-muted">Booking</p>
          <p className="mt-2 font-semibold text-foreground">#{payment.bookingId || "N/A"}</p>
        </div> */}
        <div className="rounded-3xl border border-border bg-slate-50 p-5">
          <p className="text-sm text-text-muted">Service</p>
          <p className="mt-2 font-semibold text-foreground">{service || "—"}</p>
        </div>
        <div className="rounded-3xl border border-border bg-slate-50 p-5">
          <p className="text-sm text-text-muted">Customer</p>
          <p className="mt-2 font-semibold text-foreground">{customer || "—"}</p>
        </div>
        <div className="rounded-3xl border border-border bg-slate-50 p-5">
          <p className="text-sm text-text-muted">Technician</p>
          <p className="mt-2 font-semibold text-foreground">{technician || "—"}</p>
        </div>
        <div className="rounded-3xl border border-border bg-slate-50 p-5">
          <p className="text-sm text-text-muted">Transaction ID</p>
          <p className="mt-2 break-all font-semibold text-foreground">{extended.transactionId || "—"}</p>
        </div>
        <div className="rounded-3xl border border-border bg-slate-50 p-5">
          <p className="text-sm text-text-muted">Method</p>
          <p className="mt-2 font-semibold text-foreground">{extended.method ? `${extended.method}${extended.provider ? ` · ${extended.provider}` : ""}${extended.currency ? ` · ${extended.currency}` : ""}` : "—"}</p>
        </div>
        <div className="rounded-3xl border border-border bg-slate-50 p-5">
          <p className="text-sm text-text-muted">Paid at</p>
          <p className="mt-2 font-semibold text-foreground">{paidAt || "—"}</p>
        </div>
        <div className="rounded-3xl border border-border bg-slate-50 p-5">
          <p className="text-sm text-text-muted">Created</p>
          <p className="mt-2 font-semibold text-foreground">{payment.createdAt || "—"}</p>
        </div>
      </section>

      <section className="mt-6 surface-card p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Full reference</h2>
        <div className="mt-4 space-y-3 rounded-3xl bg-slate-50 p-5 text-sm text-text-muted">
          <p className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-success" /> Payment ID: {payment.id}</p>
          <p className="inline-flex items-center gap-2"><CreditCard className="h-4 w-4 text-accent" /> Booking ID: {payment.bookingId || "N/A"}</p>
        </div>
        <Link href="/payments" className="btn-secondary mt-6">
          Back to payments
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </main>
  );
}