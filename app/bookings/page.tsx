"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { bookingService } from "@/services/booking.service";
import { BookingItem } from "@/types";
import { ArrowRight, Clock3, Search, Wrench } from "lucide-react";

const tabs = ["ALL", "REQUESTED", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;

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



// function getBookingTitle(booking: BookingItem) {
//   console.log("Booking object:", booking);
//   return booking.serviceName || (booking as unknown as { service?: { name?: string }; title?: string }).service?.name || (booking as unknown as { title?: string }).title || "Booking";
// }
function getBookingTitle(booking: BookingItem) {
  return (
    booking.serviceName ||
    (booking as { service?: { title?: string } }).service?.title ||
    "Booking"
  );
}


export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("ALL");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await bookingService.list();
        setBookings(response?.bookings || response?.data || []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load bookings");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredBookings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return bookings.filter((booking) => {
      const title = getBookingTitle(booking).toLowerCase();
      const status = String(booking.status || "").toUpperCase();
      const matchesQuery = !normalizedQuery || title.includes(normalizedQuery) || status.toLowerCase().includes(normalizedQuery);
      const matchesTab = activeTab === "ALL" || status === activeTab;
      return matchesQuery && matchesTab;
    });
  }, [activeTab, bookings, query]);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="surface-card p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">
              <Wrench className="h-4 w-4" /> Your bookings
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">Track every job in one place.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-text-muted">
              Keep requests, accepted jobs, in-progress work, and completed jobs visible with clear status labels.
            </p>
          </div>
          <Link href="/services" className="btn-primary w-fit">
            Find a service
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-3 rounded-[28px] bg-slate-50 p-3 sm:grid-cols-[1fr_200px]">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
            <Search className="h-4 w-4 text-text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search bookings"
              className="w-full border-0 bg-transparent p-0 text-sm outline-none placeholder:text-text-muted"
            />
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-text-muted">
            <Clock3 className="h-4 w-4" /> Latest first
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active ? "bg-foreground text-white" : "bg-slate-100 text-text-muted hover:bg-slate-200"}`}
              >
                {tab.replace("_", " ")}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-8 surface-card p-6 sm:p-8">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => <div key={index} className="surface-panel h-20 animate-pulse" />)}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-danger/20 bg-danger-soft p-4 text-sm text-danger">{error}</div>
        ) : filteredBookings.length ? (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <article key={booking.id} className="flex flex-col gap-4 rounded-[28px] border border-border bg-slate-50 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-foreground">{getBookingTitle(booking)}</p>
                  <p className="mt-1 text-sm text-text-muted">
                    {/* {toDisplayText(booking.technicianName, "Technician")} */}
                    {toDisplayText(
                      (booking as BookingItem & { technician?: { name?: string } }).technician?.name,
                      "Technician"
                    )}
                    {booking.date ? ` • ${booking.date}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-warning-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-warning-strong">
                    {String(booking.status || "REQUESTED")}
                  </span>
                  <span className="text-sm font-semibold text-foreground">৳{booking.amount ?? 0}</span>
                  <Link href={`/bookings/${booking.id}`} className="btn-secondary text-sm">
                    View
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-border bg-slate-50 p-8 text-center text-sm text-text-muted">
            No bookings found for this filter.
          </div>
        )}
      </section>
    </main>
  );
}