"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowRight, MapPin, Star, Wrench } from "lucide-react";
import { serviceService } from "@/services/service.service";
import { technicianService } from "@/services/technician.service";
import { ServiceItem, TechnicianProfile } from "@/types";

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

function getServiceTitle(service: ServiceItem) {
  return service.name || (service as unknown as { title?: string }).title || "Service";
}

function getServicePrice(service: ServiceItem) {
  return service.price ?? (service as unknown as { hourlyRate?: number }).hourlyRate ?? 0;
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

function technicianMatchesService(technician: TechnicianProfile, service: ServiceItem): boolean {
  const targets = [toDisplayText(service.category, "").toLowerCase(), getServiceTitle(service).toLowerCase()].filter(Boolean);
  if (!targets.length) return false;

  const values = getTechCategoryValues(technician);
  if (!values.length) return false;

  return values.some((value) => targets.some((target) => value === target || value.includes(target) || target.includes(value)));
}

export default function ServiceDetailPage() {
  const params = useParams<{ id: string }>();
  const [service, setService] = useState<ServiceItem | null>(null);
  const [technicians, setTechnicians] = useState<TechnicianProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!params?.id) return;

      try {
        const [response, techniciansResponse] = await Promise.all([
          serviceService.detail(params.id),
          technicianService.list(),
        ]);
        setService(response?.service || response?.data || null);
        setTechnicians(techniciansResponse?.technicians || techniciansResponse?.data || []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load service");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params?.id]);

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="surface-card h-56 animate-pulse" />
      </main>
    );
  }

  if (error || !service) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="surface-card p-6 text-sm text-danger">{error || "No service found."}</div>
      </main>
    );
  }

  const title = getServiceTitle(service);
  const categoryText = toDisplayText(service.category, "Service");
  const technicianId =
    toDisplayText((service as unknown as { technicianId?: string }).technicianId, "") ||
    toDisplayText((service as unknown as { technician_id?: string }).technician_id, "") ||
    toDisplayText((service as unknown as { technician?: { id?: string } }).technician?.id, "") ||
    toDisplayText((service as unknown as { technician?: { _id?: string } }).technician?._id, "");
  const serviceTechnicians = technicians.filter((technician) => technicianMatchesService(technician, service));
  const bookingUrl = new URLSearchParams({ serviceId: service.id });

  if (technicianId) {
    bookingUrl.set("techId", technicianId);
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-text-muted">
        <Link href="/services" className="font-semibold text-foreground">Services</Link> / {categoryText} / {title}
      </nav>

      <div className="">
        <section className="space-y-6">
          <div className="surface-card p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent-strong">{categoryText}</span>
              <span className="rounded-full bg-warning-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-warning-strong">Available now</span>
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground">{title}</h1>
            {/* <p className="mt-4 max-w-3xl text-sm leading-7 text-text-muted">{toDisplayText(service.description, "Trusted local service with clear pricing and flexible scheduling.")}</p> */}

            {/* <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-text-muted">
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> {toDisplayText(service.location, "Local area")}</span>
              <span className="inline-flex items-center gap-2"><Star className="h-4 w-4 text-warning-strong" /> 4.8 average rating</span>
            </div> */}
          </div>

          <div className="surface-card p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold text-foreground">Technicians on this service</h2>
              <span className="text-sm text-text-muted">{serviceTechnicians.length} profiles</span>
            </div>

            {serviceTechnicians.length ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {serviceTechnicians.map((technician) => {
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
                      className="rounded-[28px] border border-border bg-slate-50 p-5 transition hover:-translate-y-0.5 max-w-[320px]"
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
              <div className="mt-4 rounded-3xl border border-border bg-slate-50 p-8 text-center text-sm text-text-muted">
                No technicians are assigned to this service yet.
              </div>
            )}
          </div>

          {/* <div className="surface-card p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-foreground">What is included</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                "Clear pre-booking summary",
                "Transparent service details",
                "Secure request flow",
                "Booking status tracking",
              ].map((item) => (
                <div key={item} className="rounded-3xl border border-border bg-slate-50 p-4 text-sm text-foreground">{item}</div>
              ))}
            </div>
          </div> */}
        </section>

        {/* <aside className="lg:sticky lg:top-6 lg:h-fit">
          <div className="surface-card p-6 shadow-(--shadow-lg) sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Booking summary</p>
            <div className="mt-4 space-y-4 rounded-3xl bg-slate-50 p-5">
              <div className="flex items-center justify-between text-sm text-text-muted">
                <span>Service price</span>
                <span className="font-semibold text-foreground">৳{getServicePrice(service)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-text-muted">
                <span>Free cancellation</span>
                <span className="font-semibold text-success-strong">Before acceptance</span>
              </div>
            </div>

            <Link href={`/bookings/new?${bookingUrl.toString()}`} className="btn-primary mt-6 w-full py-3">
              Book Now
              <ArrowRight className="h-4 w-4" />
            </Link>

            <p className="mt-4 text-center text-sm text-text-muted">
              <Wrench className="mr-1 inline h-4 w-4 text-accent" /> Urgent repair? Book now and wait for technician acceptance.
            </p>
          </div>
        </aside> */}
      </div>
    </main>
  );
}