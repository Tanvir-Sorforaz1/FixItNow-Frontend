"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { bookingService } from "@/services/booking.service";
import { paymentService } from "@/services/payment.service";
import { BookingItem } from "@/types";
import { ArrowRight, Clock3, MapPin, ShieldCheck, Star } from "lucide-react";

function toDisplayText(value: unknown, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.name === "string") return record.name;
    if (typeof record.title === "string") return record.title;
  }
  return fallback;
}

function getBookingTitle(booking: BookingItem) {
  return booking.serviceName || (booking as unknown as { service?: { name?: string }; title?: string }).service?.name || (booking as unknown as { title?: string }).title || "Booking";
}

const stepOrder = ["REQUESTED", "ACCEPTED", "IN_PROGRESS", "COMPLETED"];

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!params?.id) return;

      try {
        const response = await bookingService.detail(params.id);
        setBooking(response?.booking || response?.data || null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load booking");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params?.id]);

  const status = String(booking?.status || "REQUESTED").toUpperCase();
  const activeStepIndex = Math.max(stepOrder.indexOf(status), 0);

  const handlePayNow = async () => {
    if (!booking) return;

    setIsPaying(true);
    setPayError(null);

    try {
      // Create a payment session against the backend, then redirect straight
      // to the returned Stripe checkout URL (no internal checkout route).
      const response = await paymentService.create({
        bookingId: booking.id,
        method: "CARD",
        amount: booking.amount,
      });

      const data = response?.data || response?.payment || response;
      const url =
        typeof data?.rawResponse?.url === "string"
          ? data.rawResponse.url
          : typeof data?.url === "string"
            ? data.url
            : typeof data?.redirectUrl === "string"
              ? data.redirectUrl
              : "";

      if (url) {
        window.location.href = url;
        return;
      }

      const transactionId =
        typeof data?.transactionId === "string"
          ? data.transactionId
          : typeof data?.id === "string"
            ? data.id
            : "";

      setPayError(
        transactionId
          ? `No checkout URL was returned. Share transaction ID ${transactionId} with your technician to confirm the payment.`
          : "No checkout URL was returned. Please try again.",
      );
    } catch (payNowError) {
      setPayError(payNowError instanceof Error ? payNowError.message : "Payment failed");
    } finally {
      setIsPaying(false);
    }
  };

  const actionZone = useMemo(() => {
    if (status === "REQUESTED") {
      return <button className="btn-secondary w-full py-3 text-sm font-semibold text-danger">Cancel booking</button>;
    }

    if (status === "ACCEPTED") {
      return (
        <button onClick={handlePayNow} disabled={isPaying} className="btn-primary w-full py-3 disabled:opacity-50">
          {isPaying ? "Processing..." : "Pay Now"}
          <ArrowRight className="h-4 w-4" />
        </button>
      );
    }

    if (status === "COMPLETED") {
      return <button className="btn-primary w-full py-3">Leave a review</button>;
    }

    return <button className="btn-secondary w-full py-3">Booking in progress</button>;
  }, [booking?.id, isPaying, status]);

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="surface-card h-56 animate-pulse" />
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="surface-card p-6 text-sm text-danger">{error || "No booking found."}</div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-warning-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-warning-strong">{status}</span>
        <p className="text-sm text-text-muted">Booking #{booking.id}</p>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_380px]">
        <section className="space-y-6">
          <div className="surface-card p-6 sm:p-8">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">{getBookingTitle(booking)}</h1>
            <p className="mt-3 text-sm leading-7 text-text-muted">Follow the booking from request to completion. The action changes based on status.</p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-border bg-slate-50 p-4">
                <p className="text-sm text-text-muted">Service</p>
                <p className="mt-2 font-semibold text-foreground">{getBookingTitle(booking)}</p>
              </div>
              <div className="rounded-3xl border border-border bg-slate-50 p-4">
                <p className="text-sm text-text-muted">Date</p>
                <p className="mt-2 font-semibold text-foreground inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-accent" /> {booking.date || "Pending"}</p>
              </div>
              <div className="rounded-3xl border border-border bg-slate-50 p-4">
                <p className="text-sm text-text-muted">Amount</p>
                <p className="mt-2 font-semibold text-foreground">৳{booking.amount ?? 0}</p>
              </div>
            </div>
          </div>

          <div className="surface-card p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-foreground">Technician</h2>
            <div className="mt-4 rounded-3xl border border-border bg-slate-50 p-5">
              <p className="text-lg font-semibold text-foreground">{toDisplayText(booking.technicianName, "Technician")}</p>
              <p className="mt-2 text-sm text-text-muted">Contact, profile, and messaging can be layered in once chat support is available.</p>
            </div>
          </div>

          <div className="surface-card p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-foreground">Status timeline</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {stepOrder.map((step, index) => {
                const active = index <= activeStepIndex;
                return (
                  <div key={step} className={`rounded-3xl border p-4 ${active ? "border-transparent bg-foreground text-white" : "border-border bg-slate-50 text-text-muted"}`}>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-80">Step {index + 1}</p>
                    <p className="mt-3 font-semibold">{step.replace("_", " ")}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:h-fit">
          <div className="surface-card p-6 shadow-[var(--shadow-lg)] sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Action zone</p>
            <div className="mt-5">{actionZone}</div>
            {payError && <div className="mt-4 rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">{payError}</div>}
          </div>

          <div className="surface-card p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Booking notes</p>
            <div className="mt-4 space-y-3 text-sm text-text-muted">
              <p className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-success" /> Payments become visible after acceptance.</p>
              <p className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /> Address and notes will appear here once the booking form is completed.</p>
              <p className="inline-flex items-center gap-2"><Star className="h-4 w-4 text-warning-strong" /> Review prompt appears after completion.</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}