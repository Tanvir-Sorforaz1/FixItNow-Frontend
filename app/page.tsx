"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock3, Search, ShieldCheck, Sparkles, Star, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { categoryService } from "@/services/category.service";
import { technicianService } from "@/services/technician.service";

const steps = [
  { title: "Book", description: "Search by service, location, and price." },
  { title: "Confirm", description: "Pick a technician, time, and address." },
  { title: "Fixed", description: "Track the job, pay securely, and review it." },
];

export default function HomePage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [catResp, techResp] = await Promise.all([categoryService.list(), technicianService.list()]);
        setCategories((catResp?.categories || catResp?.data || []).map((c: any) => c.name || c));
        setTechnicians((techResp?.technicians || techResp?.data || []).slice(0, 3));
      } catch (e) {
        // silent fallback to empty arrays
      }
    };
    load();
  }, []);

  return (
    <main className="min-h-screen">
      {/* <header className="sticky top-0 z-40 border-b border-white/40 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground text-white shadow-[var(--shadow)]">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">FixItNow</p>
              <p className="text-sm text-text-muted">Home services marketplace</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-text-muted md:flex">
            <Link href="/services" className="transition hover:text-foreground">Services</Link>
            <Link href="/technicians" className="transition hover:text-foreground">Technicians</Link>
            <Link href="/login" className="transition hover:text-foreground">Login</Link>
            <Link href="/register" className="btn-primary">Sign up</Link>
          </nav>
        </div>
      </header> */}

      <section className="hero-gradient text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-24">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90">
              <Sparkles className="h-4 w-4 text-orange-300" />
              Urgent repairs, handled by trusted local professionals
            </div>
            <h1 className="text-display text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">Home repairs, fixed now.</h1>
            <p className="max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
              Browse vetted technicians, book in minutes, pay securely, and keep every job visible from request to completion.
            </p>

            <div className="glass-panel grid gap-3 rounded-[20px] p-3 sm:grid-cols-[1fr_220px_150px]">
              <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-foreground">
                {/* <Search className="h-4 w-4 text-text-muted" /> */}
                <span className="text-sm text-text-muted">What do you need fixed?</span>
              </div>
              {/* <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-foreground">
                <Clock3 className="h-4 w-4 text-text-muted" />
                <span className="text-sm text-text-muted">Dhaka</span>
              </div> */}
              <Link href="/services" className="btn-primary justify-center whitespace-nowrap">
                Go to services
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-white/80">
              <span className="inline-flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-300" /> 4.8 average rating
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-300" /> Verified professionals
              </span>
              <span className="inline-flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-sky-300" /> 2,000+ local jobs completed
              </span>
            </div>
          </div>

          <aside className="glass-panel rounded-[28px] p-6 text-foreground shadow-[var(--shadow-lg)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Popular categories</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {categories.map((category) => (
                <span key={category} className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground">
                  {category}
                </span>
              ))}
            </div>

            {/* <div className="mt-8 space-y-4 rounded-3xl bg-slate-50 p-4">
              {steps.map((step, index) => (
                <div key={step.title} className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 font-semibold text-amber-700">0{index + 1}</div>
                  <div>
                    <p className="font-semibold">{step.title}</p>
                    <p className="mt-1 text-sm text-text-muted">{step.description}</p>
                  </div>
                </div>
              ))}
            </div> */}
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="surface-card p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">A calm booking flow for urgent home problems.</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-text-muted">
              The interface keeps the primary action visible, shows trust signals early, and reduces friction between browsing and booking.
            </p>
            <div className="mt-8 space-y-4">
              {steps.map((step) => (
                <div key={step.title} className="surface-panel p-4">
                  <p className="text-sm font-semibold text-foreground">{step.title}</p>
                  <p className="mt-1 text-sm text-text-muted">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Top technicians</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">Available now</h2>
              </div>
              <Link href="/technicians" className="btn-secondary">View all</Link>
            </div>

            <div className="mt-6 space-y-4">
              {technicians.map((technician) => (
                <article key={technician.id} className="flex items-center justify-between rounded-3xl border border-border bg-slate-50 p-4">
                  <div>
                    <p className="font-semibold text-foreground">{technician.name}</p>
                    <p className="mt-1 text-sm text-text-muted">{technician.skill} · {technician.location}</p>
                  </div>
                  <div className="rounded-full bg-warning-soft px-3 py-1 text-sm font-semibold text-warning-strong">★ {technician.rating}</div>
                </article>
              ))}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Link href="/services" className="glass-panel rounded-3xl p-5 transition hover:-translate-y-0.5">
                <p className="text-sm font-semibold text-text-muted">Need a fix?</p>
                <p className="mt-2 text-lg font-semibold text-foreground">Find a technician</p>
              </Link>
              <Link href="/register" className="glass-panel rounded-3xl p-5 transition hover:-translate-y-0.5">
                <p className="text-sm font-semibold text-text-muted">Are you a pro?</p>
                <p className="mt-2 text-lg font-semibold text-foreground">Join as technician</p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
