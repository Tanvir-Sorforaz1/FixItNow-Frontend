import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock3, Wrench } from "lucide-react";

const requests = [
  { title: "AC not cooling", status: "REQUESTED", time: "11:00 AM" },
  { title: "Kitchen faucet leak", status: "ACCEPTED", time: "1:15 PM" },
];

const schedule = [
  { time: "09:00", label: "Pipe inspection in Mirpur" },
  { time: "11:30", label: "AC maintenance in Banani" },
  { time: "15:00", label: "Fan installation in Uttara" },
];

export default function TechnicianDashboardPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="surface-card p-6 sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">
              <Wrench className="h-4 w-4" /> Technician dashboard
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">Today’s jobs at a glance.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-text-muted">
              Accept new requests, track progress, and keep availability visible.
            </p>
          </div>
          <Link href="/technician/profile" className="btn-primary">
            Complete profile
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-4">
        <div className="metric-card">
          <p className="text-sm text-text-muted">Pending requests</p>
          <p className="mt-2 text-4xl font-semibold text-foreground">2</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-text-muted">Jobs today</p>
          <p className="mt-2 text-4xl font-semibold text-foreground">4</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-text-muted">This month</p>
          <p className="mt-2 text-4xl font-semibold text-foreground">৳28k</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-text-muted">Average rating</p>
          <p className="mt-2 text-4xl font-semibold text-foreground">4.9</p>
        </div>
      </div>

      <section className="mt-8 surface-card p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Incoming requests</p>
        <div className="mt-4 space-y-4">
          {requests.map((request) => (
            <div key={request.title} className="flex flex-col gap-3 rounded-3xl border border-border bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-foreground">{request.title}</p>
                <p className="mt-1 flex items-center gap-2 text-sm text-text-muted"><Clock3 className="h-4 w-4" /> {request.time}</p>
              </div>
              <span className="inline-flex w-fit rounded-full bg-warning-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-warning-strong">
                {request.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 surface-card p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Today&apos;s schedule</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">Accepted jobs for today</h2>
          </div>
          <div className="rounded-full bg-success-soft px-3 py-1 text-sm font-semibold text-success-strong">3 confirmed</div>
        </div>

        <div className="mt-6 space-y-4">
          {schedule.map((item) => (
            <div key={item.time} className="flex flex-col gap-3 rounded-3xl border border-border bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-text-muted">{item.time}</p>
                <p className="mt-1 font-semibold text-foreground">{item.label}</p>
              </div>
              <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary-strong">Scheduled</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 surface-card p-6 sm:p-8">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <BadgeCheck className="h-4 w-4 text-success" /> Availability and service management will follow in the next slice.
        </div>
      </section>
    </main>
  );
}