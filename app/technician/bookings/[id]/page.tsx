"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { bookingService } from "@/services/booking.service";
import { technicianService } from "@/services/technician.service";
import { paymentService } from "@/services/payment.service";
import { BookingItem } from "@/types";
import { Clock3, MapPin, NotebookText, ShieldCheck, Wrench } from "lucide-react";

function getBookingTitle(booking: BookingItem) {
  return (
    booking.serviceName ||
    (booking as { service?: { title?: string } }).service?.title ||
    "Booking"
  );
}

function getServiceDescription(booking: BookingItem) {
  return (booking as { service?: { description?: string } }).service?.description || "";
}

function getServicePrice(booking: BookingItem) {
  const servicePrice = (booking as { service?: { price?: number } }).service?.price;
  return typeof servicePrice === "number" ? servicePrice : undefined;
}

function getBookingAddress(booking: BookingItem) {
  return (booking as { address?: string }).address || "";
}

function getBookingNotes(booking: BookingItem) {
  return (booking as { notes?: string }).notes || "";
}

function getScheduledAt(booking: BookingItem): string {
  const scheduledAt = (booking as { scheduledAt?: string }).scheduledAt;
  if (!scheduledAt) return booking.date || "";
  try {
    const date = new Date(scheduledAt);
    if (isNaN(date.getTime())) return scheduledAt;
    return date.toLocaleString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return scheduledAt;
  }
}

function getDurationMinutes(booking: BookingItem): number | undefined {
  const minutes = (booking as { durationMinutes?: number }).durationMinutes;
  return typeof minutes === "number" && minutes > 0 ? minutes : undefined;
}

function getCustomerName(booking: BookingItem): string {
  const customer = (booking as { customer?: { name?: string } }).customer;
  return customer?.name || "";
}

function getCustomerPhone(booking: BookingItem): string {
  const customer = (booking as { customer?: { phone?: string } }).customer;
  return customer?.phone || "";
}

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
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">{getBookingTitle(booking)}</h1>
        {getServiceDescription(booking) && <p className="mt-3 max-w-2xl text-sm leading-7 text-text-muted">{getServiceDescription(booking)}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-text-muted">
          {getCustomerName(booking) && <span className="inline-flex items-center gap-1.5 font-medium text-foreground">Customer: {getCustomerName(booking)}</span>}
          {getCustomerPhone(booking) && <span>{getCustomerPhone(booking)}</span>}
        </div>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="surface-card p-6 sm:p-8">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-border bg-slate-50 p-4">
              <p className="text-sm text-text-muted">Status</p>
              <p className="mt-2 font-semibold text-foreground">{status}</p>
            </div>
            <div className="rounded-3xl border border-border bg-slate-50 p-4">
              <p className="text-sm text-text-muted">Scheduled</p>
              <p className="mt-2 font-semibold text-foreground inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-accent" /> {getScheduledAt(booking) || "Pending"}</p>
            </div>
            <div className="rounded-3xl border border-border bg-slate-50 p-4">
              <p className="text-sm text-text-muted">Est. duration</p>
              <p className="mt-2 font-semibold text-foreground">{getDurationMinutes(booking) ? `${getDurationMinutes(booking)} min` : "Not set"}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-border bg-slate-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Booking amount</p>
              <p className="mt-3 text-2xl font-bold text-foreground">৳{booking.amount ?? 0}</p>
              {getServicePrice(booking) !== undefined && getServicePrice(booking) !== booking.amount && (
                <p className="mt-1 text-xs text-text-muted">Service list price: ৳{getServicePrice(booking)}</p>
              )}
            </div>
            <div className="rounded-3xl border border-border bg-slate-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Booking ID</p>
              <p className="mt-3 text-sm break-all font-semibold text-foreground">{booking.id}</p>
              <p className="mt-1 text-xs text-text-muted">Use this when confirming payment with the customer.</p>
            </div>
          </div>

          {getBookingAddress(booking) && (
            <div className="mt-6 rounded-3xl border border-border bg-slate-50 p-5">
              <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-text-muted"><MapPin className="h-4 w-4 text-accent" /> Job address</p>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-foreground">{getBookingAddress(booking)}</p>
            </div>
          )}

          {getBookingNotes(booking) && (
            <div className="mt-6 rounded-3xl border border-border bg-slate-50 p-5">
              <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-text-muted"><NotebookText className="h-4 w-4 text-accent" /> Notes from customer</p>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-foreground">{getBookingNotes(booking)}</p>
            </div>
          )}
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