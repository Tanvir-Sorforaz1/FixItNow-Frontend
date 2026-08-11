"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { bookingService } from "@/services/booking.service";
import { technicianService } from "@/services/technician.service";
import { BookingItem } from "@/types";
import { ArrowRight, Clock3, Search, ShieldCheck, Sparkles } from "lucide-react";

const tabs = ["ALL", "REQUESTED", "ACCEPTED", "PAID", "IN_PROGRESS", "COMPLETED", "DECLINED"] as const;

export default function TechnicianBookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("ALL");

  useEffect(() => {
    const load = async () => {
      const response = await bookingService.list();
      setBookings(response?.bookings || response?.data || []);
      setLoading(false);
    };

    load();
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return bookings.filter((booking) => {
      const status = String(booking.status || "").toUpperCase();
      const title = String(booking.serviceName || "").toLowerCase();
      return (activeTab === "ALL" || status === activeTab) && (!normalized || title.includes(normalized) || status.toLowerCase().includes(normalized));
    });
  }, [activeTab, bookings, query]);

  const updateStatus = async (bookingId: string, status: string) => {
    await technicianService.updateBookingStatus(bookingId, { status });
    const response = await bookingService.list();
    setBookings(response?.bookings || response?.data || []);
  };

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="surface-card p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">
          <Sparkles className="h-4 w-4" /> Technician bookings
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">Manage incoming work.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-text-muted">Accept, decline, start, and complete bookings from one queue.</p>

        <div className="mt-6 grid gap-3 rounded-[28px] bg-slate-50 p-3 sm:grid-cols-[1fr_200px]">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
            <Search className="h-4 w-4 text-text-muted" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search requests" className="w-full border-0 bg-transparent p-0 text-sm outline-none" />
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-text-muted">
            <Clock3 className="h-4 w-4" /> Live queue
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`rounded-full px-4 py-2 text-sm font-semibold ${activeTab === tab ? "bg-foreground text-white" : "bg-slate-100 text-text-muted"}`}>
              {tab}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8 surface-card p-6 sm:p-8">
        {loading ? (
          <div className="space-y-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="surface-panel h-20 animate-pulse" />)}</div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking) => {
              const status = String(booking.status || "REQUESTED").toUpperCase();
              const actions = status === "REQUESTED"
                ? ["ACCEPTED", "DECLINED"]
                : status === "ACCEPTED"
                  ? ["IN_PROGRESS"]
                  : status === "PAID"
                    ? ["IN_PROGRESS"]
                    : status === "IN_PROGRESS"
                      ? ["COMPLETED"]
                      : [];

              return (
                <article key={booking.id} className="flex flex-col gap-4 rounded-[28px] border border-border bg-slate-50 p-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{booking.serviceName || "Booking request"}</p>
                    <p className="mt-1 text-sm text-text-muted">{booking.date || "Scheduled soon"}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-warning-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-warning-strong">{status}</span>
                    <Link href={`/technician/bookings/${booking.id}`} className="btn-secondary text-sm">View</Link>
                    {actions.map((nextStatus) => (
                      <button key={nextStatus} type="button" onClick={() => updateStatus(booking.id, nextStatus)} className="btn-primary text-sm">
                        {nextStatus.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-8 rounded-3xl border border-border bg-slate-50 p-6 text-sm text-text-muted">
        <div className="inline-flex items-center gap-2 text-foreground">
          <ShieldCheck className="h-4 w-4 text-success" /> Status changes are wired to the technician booking endpoint.
        </div>
        <Link href="/technician/dashboard" className="mt-4 inline-flex items-center gap-2 font-semibold text-accent">Back to dashboard <ArrowRight className="h-4 w-4" /></Link>
      </section>
    </main>
  );
}