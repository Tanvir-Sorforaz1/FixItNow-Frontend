"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock3, Wrench } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

const recentBookings = [
  { title: "Pipe leak repair", status: "REQUESTED", date: "Today, 10:00 AM" },
  { title: "Fan installation", status: "ACCEPTED", date: "Tomorrow, 1:30 PM" },
  { title: "AC service", status: "COMPLETED", date: "Last week" },
];

function getFirstName(name: string | undefined) {
  if (!name) return "there";
  return name.trim().split(" ")[0];
}

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const firstName = getFirstName(user?.name);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="surface-card p-6 sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">
              <Wrench className="h-4 w-4" /> Customer dashboard
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">Welcome back, {firstName}.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-text-muted">
              Track upcoming bookings, jump back into open requests, and continue with payment when a technician accepts.
            </p>
          </div>
          <Link href="/services" className="btn-primary">
            Find a service
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="metric-card">
          <p className="text-sm text-text-muted">Active bookings</p>
          <p className="mt-2 text-4xl font-semibold text-foreground">2</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-text-muted">Next appointment</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">Today, 3:30 PM</p>
          <p className="mt-2 text-sm text-text-muted">Electrician arriving in Dhanmondi</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-text-muted">Quick actions</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href="/services" className="btn-secondary text-sm">Find service</Link>
            <Link href="/bookings" className="btn-secondary text-sm">View bookings</Link>
            <Link href="/profile" className="btn-secondary text-sm">Profile</Link>
            <Link href="/payments" className="btn-secondary text-sm">Payments</Link>
          </div>
        </div>
      </div>

      <section className="mt-8 surface-card p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Recent bookings</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">Your latest requests</h2>
          </div>
          <div className="hidden items-center gap-2 text-sm text-text-muted md:flex">
            <BadgeCheck className="h-4 w-4 text-success" /> Ready for follow-up
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {recentBookings.map((booking) => (
            <div key={booking.title} className="flex flex-col gap-3 rounded-3xl border border-border bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-foreground">{booking.title}</p>
                <p className="mt-1 flex items-center gap-2 text-sm text-text-muted">
                  <Clock3 className="h-4 w-4" /> {booking.date}
                </p>
              </div>
              <span className="inline-flex w-fit rounded-full bg-warning-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-warning-strong">
                {booking.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="surface-card p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Top technician</p>
          <div className="mt-4 flex items-center justify-between rounded-3xl border border-border bg-slate-50 p-5">
            <div>
              <p className="text-lg font-semibold text-foreground">Aminul Hoque</p>
              <p className="mt-1 text-sm text-text-muted">Plumbing · Dhanmondi</p>
            </div>
            <div className="rounded-full bg-warning-soft px-3 py-1 text-sm font-semibold text-warning-strong">★ 4.9</div>
          </div>
        </div>
        <div className="surface-card p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Need something else?</p>
          <div className="mt-4 space-y-3">
            <Link href="/services" className="block rounded-3xl border border-border bg-slate-50 px-4 py-4 font-semibold text-foreground transition hover:border-accent">Browse services</Link>
            <Link href="/technicians" className="block rounded-3xl border border-border bg-slate-50 px-4 py-4 font-semibold text-foreground transition hover:border-accent">Browse technicians</Link>
          </div>
        </div>
      </section>
    </main>
  );
}