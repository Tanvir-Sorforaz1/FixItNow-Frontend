"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Filter, MapPin, Search, Sparkles, Star, Wrench } from "lucide-react";
import { technicianService } from "@/services/technician.service";
import { TechnicianProfile } from "@/types";

function toDisplayText(value: unknown, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.name === "string") return record.name;
    if (typeof record.title === "string") return record.title;
    if (typeof record.description === "string") return record.description;
  }
  return fallback;
}

function getTechName(technician: TechnicianProfile) {
  return (
    technician.name ||
    (technician as unknown as { user?: { name?: string } }).user?.name ||
    "Technician"
  );
}

function getTechInitials(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getTechAvatar(technician: TechnicianProfile) {
  return (
    (technician as unknown as { avatar?: string }).avatar ||
    (technician as unknown as { user?: { avatar?: string } }).user?.avatar ||
    null
  );
}

function getTechSkills(technician: TechnicianProfile) {
  return (technician as unknown as { skills?: string[] }).skills || [];
}

function getTechRate(technician: TechnicianProfile) {
  return Number((technician as unknown as { hourlyRate?: number | string }).hourlyRate ?? 0);
}

function getTechAvailable(technician: TechnicianProfile) {
  return (technician as unknown as { isAvailable?: boolean }).isAvailable ?? true;
}

function getTechRating(technician: TechnicianProfile) {
  return Number(technician.rating ?? 0);
}

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<TechnicianProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await technicianService.list();
        setTechnicians(response?.technicians || response?.data || []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load technicians");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredTechnicians = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return technicians;
    return technicians.filter((technician) => {
      const name = toDisplayText(technician.name, "").toLowerCase();
      const bio = toDisplayText(technician.bio, "").toLowerCase();
      const skills = (technician.skills || []).join(" ").toLowerCase();
      return name.includes(normalized) || bio.includes(normalized) || skills.includes(normalized);
    });
  }, [query, technicians]);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* <section className="surface-card overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">
              <Sparkles className="h-4 w-4" /> Browse technicians
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">Find someone you trust.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-text-muted">
              Compare verified technicians by skill, rate, location, and availability.
            </p>
          </div>
          <Link href="/register" className="btn-primary w-fit">
            Join as technician
            <Wrench className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-3 rounded-[28px] bg-slate-50 p-3 sm:grid-cols-[1fr_220px_150px]">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
            <Search className="h-4 w-4 text-text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or skill"
              className="w-full border-0 bg-transparent p-0 text-sm outline-none placeholder:text-text-muted"
            />
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-text-muted">
            <MapPin className="h-4 w-4" /> Dhaka
          </div>
          <button type="button" className="btn-primary justify-center">
            <Filter className="h-4 w-4" /> Filters
          </button>
        </div>
      </section> */}

      <section className="mt-8 surface-card p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Technicians</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">Top-rated professionals</h2>
          </div>
          <span className="text-sm text-text-muted">{filteredTechnicians.length} results</span>
        </div>

        {loading ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => <div key={index} className="surface-panel h-56 animate-pulse" />)}
          </div>
        ) : error ? (
          <div className="mt-6 rounded-2xl border border-danger/20 bg-danger-soft p-4 text-sm text-danger">{error}</div>
        ) : filteredTechnicians.length ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredTechnicians.map((technician) => {
              const name = getTechName(technician);
              const avatarUrl = getTechAvatar(technician);
              const initials = getTechInitials(name);
              const rating = getTechRating(technician);
              const skills = getTechSkills(technician);
              const rate = getTechRate(technician);
              const isAvailable = getTechAvailable(technician);

              return (
                <article
                  key={technician.id}
                  className="rounded-[28px] border border-border bg-slate-50 p-5 transition hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-3">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="h-12 w-12 flex-none rounded-full object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent-strong">
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate text-lg font-semibold text-foreground">{name}</h3>
                        {rating > 0 ? (
                          <span className="inline-flex flex-none items-center gap-1 rounded-full bg-warning-soft px-2.5 py-1 text-xs font-semibold text-warning-strong">
                            <Star className="h-3.5 w-3.5" /> {rating.toFixed(1)}
                          </span>
                        ) : (
                          <span className="flex-none rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-text-muted">
                            New
                          </span>
                        )}
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
                        <MapPin className="h-3.5 w-3.5" /> {technician.location || "Local area"}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 line-clamp-2 text-sm text-text-muted">
                    {toDisplayText(technician.bio, "Trusted home-service professional")}
                  </p>

                  {skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-border px-2.5 py-0.5 text-xs capitalize text-text-muted"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {rate > 0 ? `৳${rate}/hr` : "Rate on request"}
                      </span>
                      {isAvailable && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          Available
                        </span>
                      )}
                    </div>
                    <Link href={`/technicians/${technician.id}`} className="font-semibold text-accent">
                      View profile
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-border bg-slate-50 p-8 text-center text-sm text-text-muted">
            No technicians match your filters.
          </div>
        )}
      </section>
    </main>
  );
}