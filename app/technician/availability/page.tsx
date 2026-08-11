"use client";

import { useEffect, useRef, useState } from "react";
import { technicianService } from "@/services/technician.service";
import { ArrowRight, CalendarDays, CheckCircle2 } from "lucide-react";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const slots = ["09:00-12:00", "12:00-15:00", "15:00-18:00"];

export default function TechnicianAvailabilityPage() {
  const [availability, setAvailability] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragMode, setDragMode] = useState<"add" | "remove" | null>(null);
  const draggedSlots = useRef(new Set<string>());

  useEffect(() => {
    const stopDragging = () => {
      setDragging(false);
      setDragMode(null);
      draggedSlots.current.clear();
    };

    window.addEventListener("mouseup", stopDragging);
    return () => window.removeEventListener("mouseup", stopDragging);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await technicianService.availability();
        setAvailability(response?.availability || response?.data || {});
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const toggleSlot = (day: string, slot: string) => {
    setAvailability((current) => {
      const nextSlots = new Set(current[day] || []);
      if (nextSlots.has(slot)) nextSlots.delete(slot); else nextSlots.add(slot);
      return { ...current, [day]: Array.from(nextSlots) };
    });
  };

  const beginDrag = (day: string, slot: string) => {
    const active = availability[day]?.includes(slot) ?? false;
    setDragMode(active ? "remove" : "add");
    setDragging(true);
    draggedSlots.current = new Set([`${day}:${slot}`]);
    toggleSlot(day, slot);
  };

  const continueDrag = (day: string, slot: string) => {
    if (!dragging || !dragMode) {
      return;
    }

    const key = `${day}:${slot}`;
    if (draggedSlots.current.has(key)) {
      return;
    }

    draggedSlots.current.add(key);
    setAvailability((current) => {
      const nextSlots = new Set(current[day] || []);
      if (dragMode === "add") nextSlots.add(slot); else nextSlots.delete(slot);
      return { ...current, [day]: Array.from(nextSlots) };
    });
  };

  const saveAvailability = async () => {
    setSaving(true);
    try {
      await technicianService.updateAvailability(availability);
      alert("Availability saved.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8"><div className="surface-card h-56 animate-pulse" /></main>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="surface-card p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">
          <CalendarDays className="h-4 w-4" /> Availability
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">Set your weekly schedule.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-text-muted">Toggle time blocks to show when you are available for incoming bookings.</p>
      </section>

      <section className="mt-8 surface-card p-6 sm:p-8">
        <div className="grid gap-4 lg:grid-cols-7">
          {days.map((day) => (
            <div key={day} className="rounded-3xl border border-border bg-slate-50 p-4">
              <p className="text-sm font-semibold text-foreground">{day}</p>
              <div className="mt-4 space-y-2">
                {slots.map((slot) => {
                  const active = availability[day]?.includes(slot) ?? false;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onMouseDown={() => beginDrag(day, slot)}
                      onMouseEnter={() => continueDrag(day, slot)}
                      className={`w-full rounded-2xl border px-3 py-2 text-left text-sm ${active ? "border-transparent bg-foreground text-white" : "border-border bg-white text-text-muted"}`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-4 mt-6 rounded-[28px] border border-border bg-white/95 p-4 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Weekly availability</p>
              <p className="mt-1 text-sm text-text-muted">Drag across blocks to paint availability. Current blocks: {Object.values(availability).reduce((count, items) => count + items.length, 0)}</p>
            </div>
            <button type="button" onClick={saveAvailability} disabled={saving} className="btn-primary py-3 disabled:opacity-50">
              {saving ? "Saving..." : "Save availability"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-border bg-slate-50 p-6 text-sm text-text-muted">
        <div className="inline-flex items-center gap-2 text-foreground">
          <CheckCircle2 className="h-4 w-4 text-success" /> This can later become a drag-and-drop grid.
        </div>
      </section>
    </main>
  );
}