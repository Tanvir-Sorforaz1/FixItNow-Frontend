"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Calendar, Clock, MapPin, Sparkles, Star, Wrench } from "lucide-react";
import { bookingService } from "@/services/booking.service";
import { technicianService } from "@/services/technician.service";
import { TechnicianProfile } from "@/types";

type ServiceEntry = {
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  price?: number | string;
};

type ReviewEntry = {
  id?: string;
  rating?: number;
  comment?: string;
  author?: string;
  user?: { name?: string };
};

type Availability = Record<string, string[]>;

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

function getInitials(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function getAvatar(technician: TechnicianProfile) {
  return (
    (technician as unknown as { avatar?: string }).avatar ||
    (technician as unknown as { user?: { avatar?: string } }).user?.avatar ||
    null
  );
}

function getExperience(technician: TechnicianProfile) {
  return Number((technician as unknown as { experience?: number }).experience ?? 0);
}

function getRate(technician: TechnicianProfile) {
  return Number((technician as unknown as { hourlyRate?: number | string }).hourlyRate ?? 0);
}

function getAvailable(technician: TechnicianProfile) {
  return (technician as unknown as { isAvailable?: boolean }).isAvailable ?? true;
}

function getRating(technician: TechnicianProfile) {
  return Number(technician.rating ?? (technician as unknown as { averageRating?: number }).averageRating ?? 0);
}

function getServices(technician: TechnicianProfile): ServiceEntry[] {
  return (technician as unknown as { services?: ServiceEntry[] }).services || [];
}

function getReviews(technician: TechnicianProfile): ReviewEntry[] {
  return (technician as unknown as { reviews?: ReviewEntry[] }).reviews || [];
}

function getAvailability(technician: TechnicianProfile): Availability | null {
  return (technician as unknown as { availability?: Availability | null }).availability || null;
}

function getServiceTitle(service: ServiceEntry) {
  return service.title || service.name || "Service";
}

function getReviewAuthor(review: ReviewEntry) {
  return review.author || review.user?.name || "Customer";
}

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function nextDateForWeekday(dayName: string, timeHHMM: string) {
  const targetIndex = WEEKDAYS.indexOf(dayName.toLowerCase());
  if (targetIndex === -1) return null;

  const [hours, minutes] = timeHHMM.split(":").map(Number);
  const result = new Date();
  const currentIndex = result.getDay();
  let diff = targetIndex - currentIndex;
  if (diff < 0) diff += 7;

  result.setDate(result.getDate() + diff);
  result.setHours(hours || 0, minutes || 0, 0, 0);
  return result;
}

export default function TechnicianDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [technician, setTechnician] = useState<TechnicianProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("10:00");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!params?.id) return;

      try {
        const response = await technicianService.detail(params.id);
        const data = response?.technician || response?.data || null;
        setTechnician(data);

        if (data) {
          // Initialize booking defaults once the technician data has arrived.
          const svcs = getServices(data);
          if (svcs.length) {
            setSelectedServiceId(svcs[0].id || null);
          }

          const avail = getAvailability(data);
          const days = avail ? Object.keys(avail) : [];
          if (days.length && avail) {
            setSelectedDay(days[0]);
            setSelectedSlot(avail[days[0]]?.[0] || null);
          }
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load technician");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params?.id]);

  const availability = useMemo(() => (technician ? getAvailability(technician) : null), [technician]);
  const availableDays = useMemo(() => (availability ? Object.keys(availability) : []), [availability]);
  const services = useMemo(() => (technician ? getServices(technician) : []), [technician]);

  const skills = technician?.skills?.length ? technician.skills : [];

  const showBookingError = async (message: string) => {
    try {
      const { default: Swal } = await import("sweetalert2");

      await Swal.fire({
        icon: "error",
        title: "Booking unavailable",
        text: message,
        confirmButtonText: "OK",
      });
    } catch {
      // Fall back silently if the modal library is not available yet.
    }
  };
  // handle booking function 
  const handleBooking = async () => {
    if (!technician) return;

    if (!selectedServiceId) {
      await showBookingError("This technician hasn't listed a bookable service yet.");
      return;
    }

    setIsBooking(true);

    try {
      let scheduledAt: Date | null = null;

      if (availableDays.length && selectedDay && selectedSlot) {
        const startTime = selectedSlot.split("-")[0]?.trim();
        scheduledAt = startTime ? nextDateForWeekday(selectedDay, startTime) : null;
      } else if (customDate && customTime) {
        scheduledAt = new Date(`${customDate}T${customTime}:00`);
      }

      if (!scheduledAt || Number.isNaN(scheduledAt.getTime())) {
        await showBookingError("Pick a valid day and time before booking.");
        setIsBooking(false);
        return;
      }

      const response = await bookingService.create({
        technicianId: technician.id,
        serviceId: selectedServiceId,
        scheduledAt: scheduledAt.toISOString(),
        address: address.trim() || undefined,
        notes: note.trim() || undefined,
      });
      const bookingId = response?.booking?.id || response?.data?.id || response?.id;
      const { default: Swal } = await import("sweetalert2");

      await Swal.fire({
        icon: "success",
        title: "Booking request sent",
        text: "Your booking was created. Let’s set up your payment.",
        confirmButtonText: "Continue to payment",
      });

      // Send the customer to create a payment for the booking they just requested.
      router.push(bookingId ? `/payments/create?bookingId=${bookingId}` : "/payments");
    } catch (bookingError) {
      const message = bookingError instanceof Error ? bookingError.message : "Booking failed";
      await showBookingError(message);
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="surface-card h-56 animate-pulse" />
      </main>
    );
  }

  if (error || !technician) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="surface-card p-6 text-sm text-danger">{error || "No technician profile found."}</div>
      </main>
    );
  }

  const name = getTechName(technician);
  const avatarUrl = getAvatar(technician);
  const initials = getInitials(name);
  const rating = getRating(technician);
  const experience = getExperience(technician);
  const rate = getRate(technician);
  const isAvailable = getAvailable(technician);
  const reviews = getReviews(technician);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-text-muted">
        <Link href="/technicians" className="font-semibold text-foreground">Technicians</Link> / {name}
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_420px]">
        <section className="space-y-6">
          <div className="surface-card p-6 sm:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-4">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-20 w-20 flex-none rounded-[28px] object-cover" />
                ) : (
                  <div className="flex h-20 w-20 flex-none items-center justify-center rounded-[28px] bg-accent-soft text-xl font-semibold text-accent-strong">
                    {initials}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Verified professional</p>
                  <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">{name}</h1>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {rating > 0 ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-warning-soft px-3 py-1 text-sm font-semibold text-warning-strong">
                        <Star className="h-4 w-4" /> {rating.toFixed(1)} ({reviews.length})
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-text-muted">New technician</span>
                    )}
                    {isAvailable && (
                      <span className="rounded-full bg-success-soft px-3 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-success-strong">
                        Available
                      </span>
                    )}
                    {experience > 0 && (
                      <span className="inline-flex items-center gap-2 text-sm text-text-muted">
                        <Wrench className="h-4 w-4" /> {experience} yrs experience
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-slate-50 px-4 py-3 text-sm text-text-muted">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-accent" /> {technician.location || "Local area"}
                </div>
                <div className="mt-2 font-semibold text-foreground">
                  {rate > 0 ? `৳${rate}/hour` : "Rate on request"}
                </div>
              </div>
            </div>

            <p className="mt-6 max-w-3xl text-sm leading-7 text-text-muted">
              {toDisplayText(technician.bio, "This technician hasn't added a bio yet.")}
            </p>
          </div>

          <div className="surface-card p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-foreground">Skills</h2>
            {skills.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span key={skill} className="rounded-full border border-border bg-slate-50 px-4 py-2 text-sm font-medium capitalize text-foreground">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-text-muted">No skills listed yet.</p>
            )}
          </div>

          <div className="surface-card p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-foreground">Services offered</h2>
            {services.length ? (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {services.map((service, index) => (
                  <div key={service.id || index} className="rounded-3xl border border-border bg-slate-50 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-foreground">{getServiceTitle(service)}</h3>
                      {service.price !== undefined && (
                        <span className="whitespace-nowrap text-sm font-semibold text-accent-strong">৳{service.price}</span>
                      )}
                    </div>
                    {service.description && <p className="mt-2 text-sm text-text-muted">{service.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-3xl border border-border bg-slate-50 p-6 text-center text-sm text-text-muted">
                No services listed yet.
              </div>
            )}
          </div>

          <div className="surface-card p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-foreground">Reviews</h2>
            {reviews.length ? (
              <div className="mt-4 space-y-4">
                {reviews.map((review, index) => (
                  <div key={review.id || index} className="rounded-3xl border border-border bg-slate-50 p-5">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground">{getReviewAuthor(review)}</p>
                      {review.rating !== undefined && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning-strong">
                          <Star className="h-3.5 w-3.5" /> {review.rating}
                        </span>
                      )}
                    </div>
                    {review.comment && <p className="mt-2 text-sm text-text-muted">{review.comment}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-3xl border border-border bg-slate-50 p-6 text-center text-sm text-text-muted">
                No reviews yet — be the first to book and review.
              </div>
            )}
          </div>
        </section>

        {/* booking section  */}
        <aside className="lg:sticky lg:top-6 lg:h-fit">
          <div className="surface-card p-6 shadow-(--shadow-lg) sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Book a service</p>
            <div className="mt-4 rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-text-muted">Hourly rate</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">
                {rate > 0 ? `৳${rate}` : "On request"}
              </p>
            </div>

            {services.length ? (
              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-foreground">select Service</label>
                <select
                  value={selectedServiceId ?? ""}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="input-field"
                >
                  {services.map((service, index) => (
                    <option key={service.id || index} value={service.id}>
                      {getServiceTitle(service)}
                      {service.price !== undefined ? ` — ৳${service.price}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-warning/20 bg-warning-soft px-4 py-3 text-sm text-warning-strong">
                This technician hasn&apos;t listed any bookable services yet.
              </div>
            )}



            {/* if availability is given by the technician then first one .if not then second one  */}
              
            {availableDays.length > 0 ? (
              // first one 
              <>
                <div className="mt-5">
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                    <Calendar className="h-4 w-4" /> Choose a day
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableDays.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setSelectedDay(day)}
                        className={
                          day === selectedDay
                            ? "rounded-full border border-accent bg-accent-soft px-3 py-1.5 text-xs font-semibold capitalize text-accent-strong"
                            : "rounded-full border border-border px-3 py-1.5 text-xs font-medium capitalize text-text-muted"
                        }
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                    <Clock className="h-4 w-4" /> Choose a time slot
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(selectedDay && availability?.[selectedDay]?.length ? availability[selectedDay] : []).map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={
                          slot === selectedSlot
                            ? "rounded-xl border border-accent bg-accent-soft px-3 py-2 text-sm font-semibold text-accent-strong"
                            : "rounded-xl border border-border bg-white px-3 py-2 text-sm font-medium text-foreground transition hover:border-accent"
                        }
                      >
                        {slot}
                      </button>
                    ))}
                    {!(selectedDay && availability?.[selectedDay]?.length) && (
                      <span className="col-span-2 text-xs text-text-muted">No open slots this day.</span>
                    )}
                  </div>
                </div>
              </>
            ) : 
            // second one
            (
              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                    <Calendar className="h-4 w-4" /> Preferred date
                  </label>
                  <input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                    <Clock className="h-4 w-4" /> Preferred time
                  </label>
                  <input type="time" value={customTime} onChange={(e) => setCustomTime(e.target.value)} className="input-field" />
                </div>
                <p className="text-xs text-text-muted">
                  This technician hasn&apos;t set fixed hours — pick a time and we&apos;ll confirm.
                </p>
              </div>
            )}

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-foreground">Address</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House, street, area"
                className="input-field"
              />
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-foreground">Note (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="write your note here"
                className="input-field resize-none"
              />
            </div>

            <button
              onClick={handleBooking}
              disabled={isBooking || !selectedServiceId}
              className="btn-primary mt-5 w-full py-3 disabled:opacity-50"
            >
              {isBooking ? "Sending..." : "Book a service"}
              <ArrowRight className="h-4 w-4" />
            </button>

            <Link href="/services" className="mt-3 block text-center text-sm font-semibold text-accent">
              Back to services
            </Link>
          </div>

          <div className="mt-4 rounded-3xl border border-border bg-slate-50 p-5 text-sm text-text-muted">
            <Sparkles className="mb-2 h-4 w-4 text-accent" />
            You won&apos;t be charged yet — the technician confirms before the job is scheduled.
          </div>
        </aside>
      </div>
    </main>
  );
}