"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Filter, MapPin, Search, Star, Wrench } from "lucide-react";

import { categoryService } from "@/services/category.service";
import { serviceService } from "@/services/service.service";
import { technicianService } from "@/services/technician.service";

import { CategoryItem, ServiceItem, TechnicianProfile } from "@/types";

function toDisplayText(value: unknown, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.name === "string") return record.name;
    if (typeof record.title === "string") return record.title;
    if (typeof record.description === "string") return record.description;
    if (typeof record.slug === "string") return record.slug;
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

function getServiceTitle(service: ServiceItem) {
  return service.name || (service as unknown as { title?: string }).title || "Service";
}

function getServicePrice(service: ServiceItem) {
  return service.price ?? (service as unknown as { hourlyRate?: number }).hourlyRate ?? 0;
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

function getServiceCategory(service: ServiceItem) {
  return toDisplayText(service.category, "").toLowerCase();
}

function getTechCategoryValues(technician: TechnicianProfile): string[] {
  const values: string[] = [];

  // direct category field on the technician
  const directCategory = toDisplayText((technician as unknown as { category?: unknown }).category, "");
  if (directCategory) values.push(directCategory.toLowerCase());

  // legacy single service field
  const service = toDisplayText((technician as unknown as { service?: unknown }).service, "");
  if (service) values.push(service.toLowerCase());

  // services array (each entry may carry a title/name and/or category)
  const services = (technician as unknown as { services?: Array<Record<string, unknown>> }).services || [];
  for (const entry of services) {
    const title = toDisplayText(entry.title, "") || toDisplayText(entry.name, "");
    if (title) values.push(title.toLowerCase());
    const category = toDisplayText(entry.category, "");
    if (category) values.push(category.toLowerCase());
  }

  return values;
}

function titleCase(value: string) {
  return value.replace(/\S+/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function getTechCategoryNames(technician: TechnicianProfile): string[] {
  // Reuse the same values used for filtering, then dedupe + clean them for display.
  const raw = getTechCategoryValues(technician);
  return [...new Set(raw)].slice(0, 3).map(titleCase);
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianProfile[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [servicesResponse, techniciansResponse, categoriesResponse] = await Promise.all([
          serviceService.list(),
          technicianService.list(),
          categoryService.list(),
        ]);

        setServices(servicesResponse?.services || servicesResponse?.data || []);
        setTechnicians(techniciansResponse?.technicians || techniciansResponse?.data || []);
        setCategories(categoriesResponse?.categories || categoriesResponse?.data || []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load listings");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredServices = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return services.filter((service) => {
      // text search
      if (normalized) {
        const name = getServiceTitle(service).toLowerCase();
        const description = toDisplayText(service.description, "").toLowerCase();
        const matchesText = name.includes(normalized) || description.includes(normalized);
        if (!matchesText) return false;
      }

      // category filter
      if (categoryFilter) {
        const cat = getServiceCategory(service);
        if (cat !== categoryFilter.toLowerCase()) return false;
      }

      // location filter
      if (locationFilter) {
        const loc = String(service.location || "").toLowerCase();
        if (!loc.includes(locationFilter.toLowerCase())) return false;
      }

      // price filter
      const price = Number(service.price ?? 0);
      if (minPrice) {
        const min = Number(minPrice) || 0;
        if (price < min) return false;
      }
      if (maxPrice) {
        const max = Number(maxPrice) || 0;
        if (price > max) return false;
      }

      return true;
    });
  }, [query, services, categoryFilter, locationFilter, minPrice, maxPrice]);

  const filteredTechnicians = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return technicians.filter((tech) => {
      // text search
      if (normalized) {
        const name = toDisplayText(tech.name, "").toLowerCase();
        const bio = toDisplayText(tech.bio, "").toLowerCase();
        const matchesText = name.includes(normalized) || bio.includes(normalized);
        if (!matchesText) return false;
      }

      // category filter
      if (categoryFilter) {
        const categories = getTechCategoryValues(tech);
        const target = categoryFilter.toLowerCase();
        if (!categories.some((c) => c.includes(target))) return false;
      }

      // location filter
      if (locationFilter) {
        const loc = String(tech.location || "").toLowerCase();
        if (!loc.includes(locationFilter.toLowerCase())) return false;
      }

      // price filter
      const rate = getTechRate(tech);
      if (minPrice) {
        const min = Number(minPrice) || 0;
        if (rate < min) return false;
      }
      if (maxPrice) {
        const max = Number(maxPrice) || 0;
        if (rate > max) return false;
      }

      return true;
    });
  }, [query, technicians, categoryFilter, locationFilter, minPrice, maxPrice]);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="surface-card overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">
              <Wrench className="h-4 w-4" /> Browse services
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">Find the right fix, fast.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-text-muted">
              Filter out trusted technicians and services by location, skill, and category. Keep the booking path obvious from the start.
            </p>
          </div>

          {/* <Link href="/register" className="btn-primary w-fit">
            Join as technician
            <Star className="h-4 w-4" />
          </Link> */}
        </div>

          {/* <div className="mt-6 grid gap-3 rounded-[28px] bg-slate-50 p-3 sm:grid-cols-[1fr_220px_150px]">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
            <Search className="h-4 w-4 text-text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="What do you need help with?"
              className="w-full border-0 bg-transparent p-0 text-sm outline-none placeholder:text-text-muted"
            />
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-text-muted">
            <MapPin className="h-4 w-4" />
            <input
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              placeholder="Location (e.g. Dhaka)"
              className="w-full border-0 bg-transparent p-0 text-sm outline-none placeholder:text-text-muted"
            />
          </div>
          <button type="button" className="btn-primary justify-center">
            <Filter className="h-4 w-4" /> Filters
          </button>
        </div> */}
      </section>


      <section className="mt-8 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* filter section */}
        <aside className="surface-card h-fit p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Filters</p>
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Category</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input-field">
                <option value="">All services</option>
                {categories.map((category) => (
                  <option key={category.id} value={toDisplayText(category.name, "")}>{toDisplayText(category.name, "Category")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Location</label>
              <input value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="input-field" placeholder="Dhaka" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Price range</label>
              <div className="grid grid-cols-2 gap-3">
                <input value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="input-field" placeholder="Min" />
                <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="input-field" placeholder="Max" />
              </div>
            </div>
          </div>
        </aside>
        {/* main content section  (services) */}
        <div className="space-y-8">
          <section className="surface-card p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Services</p>
                <h2 className="mt-2 text-2xl font-semibold text-foreground">Popular services</h2>
              </div>
              <span className="text-sm text-text-muted">{filteredServices.length} results</span>
            </div>

            {loading ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => <div key={index} className="surface-panel h-56 animate-pulse" />)}
              </div>
            ) : error ? (
              <div className="mt-6 rounded-2xl border border-danger/20 bg-danger-soft p-4 text-sm text-danger">{error}</div>
            ) : filteredServices.length ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredServices.map((service) => {
                  const serviceId = service.id;
                  const categoryText = toDisplayText(service.category, "Service");

                  return (
                    <article key={serviceId} className="overflow-hidden rounded-[28px] border border-border bg-white shadow-[var(--shadow)] transition hover:-translate-y-0.5">
                      <div className="h-44 bg-gradient-to-br from-slate-200 to-slate-100">
                        
                        <div className="flex h-full items-center justify-center text-text-muted">
                          <span className="rounded-full bg-white px-4 py-2 text-sm font-medium shadow-sm">{categoryText}</span>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">{getServiceTitle(service)}</h3>
                            <p className="mt-2 line-clamp-2 text-sm text-text-muted">{toDisplayText(service.description, "High-quality local service")}</p>
                          </div>
                          <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent-strong">
                            {categoryText}
                          </span>
                        </div>

                        <div className="mt-5 flex items-center justify-between text-sm text-text-muted">
                          <span>From ৳{getServicePrice(service)}</span>
                          <Link href={`/services/${serviceId}`} className="font-semibold text-accent">
                            View details
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="mt-6 rounded-3xl border border-border bg-slate-50 p-8 text-center text-sm text-text-muted">
                No services match your filters.
              </div>
            )}
          </section>
          
          {/* technicians section */}
          <section className="surface-card p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Technicians</p>
                <h2 className="mt-2 text-2xl font-semibold text-foreground">Top-rated professionals</h2>
              </div>
              <span className="text-sm text-text-muted">{filteredTechnicians.length} profiles</span>
            </div>

            {loading ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => <div key={index} className="surface-panel h-48 animate-pulse" />)}
              </div>
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
        </div>
      </section>
    </main>
  );
}