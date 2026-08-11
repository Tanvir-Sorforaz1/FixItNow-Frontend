"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { serviceService } from "@/services/service.service";
import { ArrowRight, PlusCircle, Search, Wrench } from "lucide-react";

type ServiceRecord = {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  price?: number;
  isActive?: boolean;
};

function getServiceTitle(service: ServiceRecord) {
  return service.name || service.title || "Service";
}

export default function TechnicianServicesPage() {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      const response = await serviceService.list();
      setServices(response?.services || response?.data || []);
      setLoading(false);
    };

    load();
  }, []);

  const filteredServices = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return services;
    return services.filter((service) => getServiceTitle(service).toLowerCase().includes(normalized));
  }, [query, services]);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="surface-card p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">
          <Wrench className="h-4 w-4" /> My services
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">Manage what you sell.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-text-muted">List, edit, and keep your active services visible to customers.</p>
      </section>

      <section className="mt-8 surface-card p-6 sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 md:w-96">
            <Search className="h-4 w-4 text-text-muted" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search services" className="w-full border-0 bg-transparent p-0 text-sm outline-none" />
          </div>
          <Link href="/technician/services/new" className="btn-primary w-fit">
            <PlusCircle className="h-4 w-4" /> New service
          </Link>
        </div>

        {loading ? (
          <div className="mt-6 space-y-4">
            {Array.from({ length: 4 }).map((_, index) => <div key={index} className="surface-panel h-20 animate-pulse" />)}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filteredServices.map((service) => (
              <article key={service.id} className="flex flex-col gap-4 rounded-3xl border border-border bg-slate-50 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-foreground">{getServiceTitle(service)}</p>
                  <p className="mt-1 text-sm text-text-muted">{service.description || "Service description"}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${service.isActive ? "bg-success-soft text-success-strong" : "bg-slate-200 text-text-muted"}`}>
                    {service.isActive ? "Active" : "Draft"}
                  </span>
                  <span className="text-sm font-semibold text-foreground">৳{service.price ?? 0}</span>
                  <Link href={`/technician/services/${service.id}/edit`} className="btn-secondary text-sm">
                    Edit
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8 rounded-3xl border border-border bg-slate-50 p-6 text-sm text-text-muted">
        <div className="inline-flex items-center gap-2 text-foreground">
          <ArrowRight className="h-4 w-4 text-accent" /> Creation and editing are wired in the next two route files.
        </div>
      </section>
    </main>
  );
}