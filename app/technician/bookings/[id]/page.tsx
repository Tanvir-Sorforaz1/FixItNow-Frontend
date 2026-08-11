"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { bookingService } from "@/services/booking.service";
import { technicianService } from "@/services/technician.service";
import { paymentService } from "@/services/payment.service";
import { BookingItem } from "@/types";
import { Clock3, ShieldCheck, Sparkles, Wrench } from "lucide-react";

export default function TechnicianBookingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactionId, setTransactionId] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [confirmSuccess, setConfirmSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!params?.id) return;
      const response = await bookingService.detail(params.id);
      setBooking(response?.booking || response?.data || null);
      setLoading(false);
    };

    load();
  }, [params?.id]);

  const updateStatus = async (status: string) => {
    await technicianService.updateBookingStatus(String(params?.id || ""), { status });
    // Update local state so the Actions buttons re-render immediately
    // (router.refresh() alone won't update this client-held booking).
    setBooking((prev) => (prev ? { ...prev, status } : prev));
    router.refresh();
  };

  const confirmPayment = async () => {
    if (!transactionId.trim()) return;

    setIsConfirming(true);
    setConfirmError(null);
    setConfirmSuccess(false);

    try {
      await paymentService.confirm({ transactionId: transactionId.trim(), status: "COMPLETED" });
      setConfirmSuccess(true);
      router.refresh();
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : "Could not confirm payment");
    } finally {
      setIsConfirming(false);
    }
  };

  if (loading) {
    return <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8"><div className="surface-card h-56 animate-pulse" /></main>;
  }

  if (!booking) {
    return <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8"><div className="surface-card p-6 text-sm text-danger">No booking found.</div></main>;
  }

  const status = String(booking.status || "REQUESTED").toUpperCase();

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="surface-card p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">
          <Wrench className="h-4 w-4" /> Booking detail
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">{booking.serviceName || "Booking"}</h1>
        <p className="mt-3 text-sm text-text-muted">Technician view for status transitions and job completion.</p>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="surface-card p-6 sm:p-8">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-border bg-slate-50 p-4">
              <p className="text-sm text-text-muted">Status</p>
              <p className="mt-2 font-semibold text-foreground">{status}</p>
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

          <div className="mt-6 rounded-3xl border border-border bg-slate-50 p-5 text-sm text-text-muted">
            <Sparkles className="mb-2 h-4 w-4 text-accent" />
            Review notes, customer address, and chat can be added once those APIs are available.
          </div>
        </div>

        <aside className="surface-card p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Actions</p>
          <div className="mt-4 space-y-3">
            {status === "REQUESTED" && (
              <>
                <button onClick={() => updateStatus("ACCEPTED")} className="btn-primary w-full py-3">Accept</button>
                <button onClick={() => updateStatus("DECLINED")} className="btn-secondary w-full py-3">Decline</button>
              </>
            )}
            {status === "ACCEPTED" && <button onClick={() => updateStatus("IN_PROGRESS")} className="btn-primary w-full py-3">Start job</button>}
            {status === "PAID" && <button onClick={() => updateStatus("IN_PROGRESS")} className="btn-primary w-full py-3">Start job</button>}
            {status === "IN_PROGRESS" && <button onClick={() => updateStatus("COMPLETED")} className="btn-primary w-full py-3">Mark complete</button>}
            {/* <div className="mt-6 space-y-3 rounded-3xl border border-border bg-slate-50 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Confirm payment</p>
              <p className="text-xs text-text-muted">Ask the customer for the transaction ID they received.</p>
              <input
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter transaction ID"
                className="input-field"
              />
              <button
                onClick={confirmPayment}
                disabled={isConfirming || !transactionId.trim()}
                className="btn-primary w-full py-3 disabled:opacity-50"
              >
                {isConfirming ? "Confirming..." : "Confirm payment"}
              </button>
              {confirmSuccess && <p className="text-sm font-semibold text-success-strong">Payment confirmed.</p>}
              {confirmError && <p className="text-sm text-danger">{confirmError}</p>}
            </div> */}
            <Link href="/technician/bookings" className="btn-secondary w-full py-3">Back to list</Link>
          </div>

          <div className="mt-5 rounded-3xl border border-border bg-slate-50 p-4 text-sm text-text-muted">
            <ShieldCheck className="mb-2 h-4 w-4 text-success" /> Status updates are wired to the technician booking endpoint.
          </div>
        </aside>
      </section>
    </main>
  );
}