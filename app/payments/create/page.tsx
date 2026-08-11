"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { bookingService } from "@/services/booking.service";
import { paymentService } from "@/services/payment.service";
import { BookingItem } from "@/types";
import { ArrowRight, CheckCircle2, CreditCard, ShieldCheck, Sparkles } from "lucide-react";

export default function CreatePaymentPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") || "";

  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [session, setSession] = useState<{ transactionId: string; url: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!bookingId) {
        setError("Missing booking reference. Please start from a booking request.");
        setLoading(false);
        return;
      }

      try {
        const response = await bookingService.detail(bookingId);
        setBooking(response?.booking || response?.data || null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load booking");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [bookingId]);
const handlePay = async () => {
    if (!booking) return;

    setIsPaying(true);
    setError(null);

    try {
      // Create a payment session. The customer does NOT confirm the payment
      // directly - the technician confirms it later via the transaction ID.
      const response = await paymentService.create({
        bookingId: booking.id,
        method: "CARD",
        amount: booking.amount,
      });

      const data = response?.data || response?.payment || response;
      const transactionId =
        typeof data?.transactionId === "string"
          ? data.transactionId
          : typeof data?.id === "string"
            ? data.id
            : "";

      const url =
        typeof data?.rawResponse?.url === "string"
          ? data.rawResponse.url
          : typeof data?.url === "string"
            ? data.url
            : typeof data?.redirectUrl === "string"
              ? data.redirectUrl
              : "";

      setSession({ transactionId, url });
    } catch (payError) {
      setError(payError instanceof Error ? payError.message : "Payment failed");
    } finally {
      setIsPaying(false);
    }
  };

  const redirectToStripe = () => {
    if (session?.url) {
      window.location.href = session.url;
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
        <Link href="/bookings" className="btn-secondary mt-6">
          Back to bookings
        </Link>
      </main>
    );
  }

  if (session) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="surface-card w-full p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-warning-strong" />
          <h1 className="mt-4 text-3xl font-semibold text-foreground">Payment session created</h1>
          <p className="mt-3 text-sm text-text-muted">
            Share this transaction ID with your technician - they will confirm the payment once it is completed.
          </p>

          <div className="mx-auto mt-6 max-w-md rounded-3xl border border-border bg-slate-50 p-5">
            <p className="text-sm text-text-muted">Transaction ID</p>
            <p className="mt-2 break-all font-mono text-sm font-semibold text-foreground">
              {session.transactionId || "Pending"}
            </p>
          </div>

          {session.url ? (
            <>
              <button onClick={redirectToStripe} className="btn-primary mt-6">
                Continue to Stripe checkout
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-3 text-xs text-text-muted">You will be redirected to the secure payment page.</p>
            </>
          ) : (
            <p className="mt-6 text-xs text-text-muted">
              No checkout URL was returned - share the transaction ID above to confirm the payment.
            </p>
          )}

          <Link href={`/bookings/${booking.id}`} className="mt-6 block text-center text-sm font-semibold text-accent">
            Back to booking
          </Link>
        </div>
      </main>
    );
  }
return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="surface-card p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">
          <CreditCard className="h-4 w-4" /> Create payment
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">Pay for booking #{booking.id}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-text-muted">
          A payment session is created for this booking. Your technician confirms it after the transaction is completed.
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
            <p className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent" /> The technician confirms your payment with the transaction ID.</p>
          </div>

          <Link href={`/bookings/${booking.id}`} className="mt-6 block text-center text-sm font-semibold text-accent">
            Back to booking
          </Link>
        </aside>
      </section>
    </main>
  );
}
