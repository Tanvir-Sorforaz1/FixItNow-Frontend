"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { adminService } from "@/services/admin.service";
import { BookingItem } from "@/types";
import { ArrowRight, Search, ShieldCheck } from "lucide-react";

const statuses = ["ALL", "REQUESTED", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "DECLINED", "CANCELLED"] as const;

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statuses)[number]>("ALL");

  useEffect(() => {
    const load = async () => {
      const response = await adminService.getBookings();
      setBookings(response?.bookings || response?.data || []);
      setLoading(false);
    };

    load();
  }, []);

  const visibleBookings = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return bookings.filter((booking) => {
      const status = String(booking.status || "").toUpperCase();
      const title = String(booking.serviceName || "").toLowerCase();
      const date = String(booking.date || "").toLowerCase();
      const matchesQuery = !normalized || title.includes(normalized) || date.includes(normalized) || status.toLowerCase().includes(normalized);
      const matchesStatus = statusFilter === "ALL" || status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [bookings, query, statusFilter]);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="surface-card p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">
          <ShieldCheck className="h-4 w-4" /> Bookings
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">Platform booking oversight.</h1>
      </section>

      <section className="mt-8 surface-card p-6 sm:p-8">
        <div className="grid gap-4 md:grid-cols-[1.4fr_0.8fr]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by service, date, or status"
              className="input-field pl-10"
            />
          </label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as (typeof statuses)[number])} className="input-field">
            {statuses.map((status) => (
              <option key={status} value={status}>{status === "ALL" ? "All statuses" : status.replace("_", " ")}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="space-y-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="surface-panel h-20 animate-pulse" />)}</div>
        ) : (
          <div className="space-y-4">
            {visibleBookings.map((booking) => (
              <article key={booking.id} className="flex flex-col gap-4 rounded-3xl border border-border bg-slate-50 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-foreground">{booking.serviceName || "Booking"}</p>
                  <p className="mt-1 text-sm text-text-muted">{booking.date || "No date"}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">{String(booking.status || "REQUESTED")}</span>
                  <Link href={`/bookings/${booking.id}`} className="btn-secondary text-sm">
                    View booking
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
            {!visibleBookings.length && <p className="rounded-3xl border border-dashed border-border px-4 py-8 text-center text-sm text-text-muted">No bookings match those filters.</p>}
          </div>
        )}
      </section>
    </main>
  );
}