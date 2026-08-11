import Link from "next/link";
import { ArrowRight, BadgeCheck, ShieldCheck, Users } from "lucide-react";

const recentSignups = [
  { name: "Maya Rahman", role: "CUSTOMER", time: "2 min ago" },
  { name: "Aminul Hoque", role: "TECHNICIAN", time: "18 min ago" },
  { name: "Sadia Khan", role: "CUSTOMER", time: "34 min ago" },
];

const recentBookings = [
  { title: "Pipe leak repair", status: "REQUESTED", time: "5 min ago" },
  { title: "Fan installation", status: "ACCEPTED", time: "1 hr ago" },
  { title: "AC service", status: "COMPLETED", time: "3 hrs ago" },
];

export default function AdminDashboardPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="surface-card p-6 sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">
              <ShieldCheck className="h-4 w-4" /> Admin dashboard
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">Platform overview.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-text-muted">
              Monitor users, bookings, and platform activity from a single place.
            </p>
          </div>
          <Link href="/admin/users" className="btn-primary">
            Open users
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-4">
        {[
          ["Total users", "148"],
          ["Active technicians", "32"],
          ["Bookings this week", "86"],
          ["Revenue", "৳124k"],
        ].map(([label, value]) => (
          <div key={label} className="metric-card">
            <p className="text-sm text-text-muted">{label}</p>
            <p className="mt-2 text-4xl font-semibold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      <section className="mt-8 surface-card p-6 sm:p-8">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Users className="h-4 w-4 text-success" /> User moderation, categories, and bookings management will be built next.
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/admin/users" className="btn-secondary text-sm">Users</Link>
          <Link href="/admin/categories" className="btn-secondary text-sm">Categories</Link>
          <Link href="/admin/bookings" className="btn-secondary text-sm">Bookings</Link>
          <Link href="/admin/payments" className="btn-secondary text-sm">Payments</Link>
        </div>
        <p className="mt-4 flex items-center gap-2 text-sm text-text-muted">
          <BadgeCheck className="h-4 w-4 text-success" /> This is the first implementation slice for the admin area.
        </p>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="surface-card p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Recent signups</p>
          <div className="mt-4 space-y-3">
            {recentSignups.map((signup) => (
              <div key={signup.name} className="flex items-center justify-between rounded-3xl border border-border bg-slate-50 px-4 py-3">
                <div>
                  <p className="font-semibold text-foreground">{signup.name}</p>
                  <p className="text-sm text-text-muted">{signup.role}</p>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-text-muted">{signup.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Recent bookings</p>
          <div className="mt-4 space-y-3">
            {recentBookings.map((booking) => (
              <div key={booking.title} className="flex items-center justify-between rounded-3xl border border-border bg-slate-50 px-4 py-3">
                <div>
                  <p className="font-semibold text-foreground">{booking.title}</p>
                  <p className="text-sm text-text-muted">{booking.time}</p>
                </div>
                <span className="rounded-full bg-warning-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-warning-strong">{booking.status}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}