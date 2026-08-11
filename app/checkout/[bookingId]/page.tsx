"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { bookingService } from "@/services/booking.service";
import { paymentService } from "@/services/payment.service";
import { BookingItem } from "@/types";
import { ArrowRight, CreditCard, ShieldCheck, Sparkles } from "lucide-react";

export default function CheckoutPage() {
  const params = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!params?.bookingId) return;

      try {
        const response = await bookingService.detail(params.bookingId);
        setBooking(response?.booking || response?.data || null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load booking");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params?.bookingId]);

  const handlePay = async () => {
    if (!booking) return;

    setIsPaying(true);
    setError(null);

    try {
      // Create a payment session against the backend, then redirect straight
      // to the returned Stripe checkout URL.
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

      setError(
        transactionId
          ? `No checkout URL was returned. Share transaction ID ${transactionId} with your technician to confirm the payment.`
          : "No checkout URL was returned. Please try again.",
      );
    } catch (payError) {
      setError(payError instanceof Error ? payError.message : "Payment failed");
    } finally {
      setIsPaying(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="surface-card h-56 animate-pulse" />
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="surface-card p-6 text-sm text-danger">{error || "No booking found."}</div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="surface-card p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">
          <CreditCard className="h-4 w-4" /> Checkout
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">Pay for booking #{booking.id}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-text-muted">
          Payment only appears after technician acceptance. This screen creates the payment session and then redirects you to the secure Stripe checkout.
        </p>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="surface-card p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-foreground">Payment element placeholder</h2>
          <div className="mt-4 rounded-3xl border border-border bg-slate-50 p-5 text-sm text-text-muted">
            Stripe or another provider can be mounted here once the backend response indicates the processor to use.
          </div>
          <button onClick={handlePay} disabled={isPaying} className="btn-primary mt-6 w-full py-3 disabled:opacity-50">
            {isPaying ? "Processing..." : `Pay ৳${booking.amount ?? 0}`}
            <ArrowRight className="h-4 w-4" />
          </button>
          {error && <div className="mt-4 rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">{error}</div>}
        </div>

        <aside className="surface-card p-6 sm:p-8 lg:sticky lg:top-6 lg:h-fit">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Order summary</p>
          <div className="mt-4 space-y-4 rounded-3xl bg-slate-50 p-5">
            <p className="text-sm text-text-muted">Booking</p>
            <p className="font-semibold text-foreground">{booking.serviceName || "Service booking"}</p>
            <p className="text-sm text-text-muted">Amount</p>
            <p className="font-semibold text-foreground">৳{booking.amount ?? 0}</p>
          </div>

          <div className="mt-5 space-y-3 text-sm text-text-muted">
            <p className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-success" /> Secure payment flow</p>
            <p className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent" /> You’ll be redirected to Stripe; the technician confirms your payment with the transaction ID.</p>
          </div>

          <Link href={`/bookings/${booking.id}`} className="mt-6 block text-center text-sm font-semibold text-accent">
            Back to booking
          </Link>
        </aside>
      </section>
    </main>
  );
}