"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { bookingService } from "@/services/booking.service";
import { ArrowRight, CalendarClock, ClipboardList, MapPin, Star } from "lucide-react";

type Step = 1 | 2 | 3 | 4;

export default function NewBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const serviceId = searchParams.get("serviceId") || "";
  const technicianId = searchParams.get("techId") || "";
  const [formData, setFormData] = useState({
    serviceId,
    technicianId,
    scheduledAt: "",
    durationMinutes: "60",
    address: "",
    notes: "",
  });

  const canAdvance = useMemo(() => {
    if (step === 1) return Boolean(formData.serviceId && formData.technicianId);
    if (step === 2) return Boolean(formData.scheduledAt && formData.durationMinutes);
    if (step === 3) return Boolean(formData.address.trim());
    return true;
  }, [formData.address, formData.durationMinutes, formData.scheduledAt, formData.serviceId, formData.technicianId, step]);

  const nextStep = () => setStep((current) => ((current + 1) > 4 ? 4 : (current + 1)) as Step);
  const previousStep = () => setStep((current) => ((current - 1) < 1 ? 1 : (current - 1)) as Step);

  const getFriendlyErrorMessage = (message: string) => {
    const normalized = message.toLowerCase();

    if (normalized.includes("only customers can create bookings")) {
      return "Only customers can book a service.";
    }

    if (normalized.includes("prisma") || normalized.includes("invalid `prisma") || normalized.includes("service.findunique") || normalized.includes("undefined")) {
      return "We could not create this booking because the service or technician is missing.";
    }

    return message.split("\n")[0].trim();
  };

  const showError = async (message: string) => {
    const friendlyMessage = getFriendlyErrorMessage(message);

    try {
      const { default: Swal } = await import("sweetalert2");

      await Swal.fire({
        icon: "error",
        title: "Booking failed",
        text: friendlyMessage,
        confirmButtonText: "OK",
      });
    } catch {
      // Keep the inline fallback if the popup library is unavailable.
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await bookingService.create(formData as unknown as Record<string, unknown>);
      const bookingId = response?.booking?.id || response?.data?.id || response?.id;
      router.push(bookingId ? `/bookings/${bookingId}` : "/bookings");
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Could not create booking";
      setError(message);
      void showError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="surface-card p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">
          <ClipboardList className="h-4 w-4" /> New booking
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">Book a service in four steps.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-text-muted">
          Confirm the service, set the schedule, enter your address, and review before submitting.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className={`rounded-full px-4 py-2 text-sm font-semibold ${step === index ? "bg-foreground text-white" : index < step ? "bg-success-soft text-success-strong" : "bg-slate-100 text-text-muted"}`}>
              Step {index}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="surface-card p-6 sm:p-8">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Confirm service and technician</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Service ID</label>
                  <input value={formData.serviceId} onChange={(event) => setFormData((current) => ({ ...current, serviceId: event.target.value }))} className="input-field" placeholder="service id" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Technician ID</label>
                  <input
                    value={formData.technicianId}
                    onChange={(event) => setFormData((current) => ({ ...current, technicianId: event.target.value }))}
                    className="input-field"
                    placeholder="technician id"
                    readOnly={Boolean(technicianId)}
                  />
                </div>
              </div>
              <div className="rounded-3xl border border-border bg-slate-50 p-5 text-sm text-text-muted">
                <p className="font-semibold text-foreground">Summary</p>
                <p className="mt-2">Once the API returns richer metadata, this step will show the actual service and technician cards.</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Choose schedule</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Scheduled time</label>
                  <input type="datetime-local" value={formData.scheduledAt} onChange={(event) => setFormData((current) => ({ ...current, scheduledAt: event.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Duration minutes</label>
                  <input value={formData.durationMinutes} onChange={(event) => setFormData((current) => ({ ...current, durationMinutes: event.target.value }))} className="input-field" placeholder="60" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Address and notes</h2>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Address</label>
                <input value={formData.address} onChange={(event) => setFormData((current) => ({ ...current, address: event.target.value }))} className="input-field" placeholder="House, street, area" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Notes</label>
                <textarea value={formData.notes} onChange={(event) => setFormData((current) => ({ ...current, notes: event.target.value }))} className="input-field min-h-36" placeholder="Additional instructions" />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Review & confirm</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ["Service", formData.serviceId || "Not set"],
                  ["Technician", formData.technicianId || "Not set"],
                  ["Schedule", formData.scheduledAt || "Not set"],
                  ["Duration", `${formData.durationMinutes || "60"} minutes`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-3xl border border-border bg-slate-50 p-5">
                    <p className="text-sm text-text-muted">{label}</p>
                    <p className="mt-2 font-semibold text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <div className="mt-6 rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">{error}</div>}

          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={previousStep} disabled={step === 1} className="btn-secondary disabled:opacity-50">
              Back
            </button>
            {step < 4 ? (
              <button type="button" onClick={nextStep} disabled={!canAdvance} className="btn-primary disabled:opacity-50">
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="btn-primary disabled:opacity-50">
                {isSubmitting ? "Submitting..." : "Submit booking"}
              </button>
            )}
          </div>
        </div>

        <aside className="surface-card p-6 sm:p-8 lg:sticky lg:top-6 lg:h-fit">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Booking summary</p>
          <div className="mt-4 space-y-4 rounded-3xl bg-slate-50 p-5 text-sm text-text-muted">
            <p className="inline-flex items-center gap-2"><Star className="h-4 w-4 text-warning-strong" /> Booking flow matches the wireframe stepper.</p>
            <p className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /> Address and schedule are captured before submission.</p>
            <p className="inline-flex items-center gap-2"><CalendarClock className="h-4 w-4 text-success" /> No payment happens until the technician accepts.</p>
          </div>

          <Link href="/bookings" className="mt-6 block text-center text-sm font-semibold text-accent">
            Back to bookings
          </Link>
        </aside>
      </section>
    </main>
  );
}