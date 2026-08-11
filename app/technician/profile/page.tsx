"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { technicianService } from "@/services/technician.service";
import { ArrowRight, BadgeCheck, Sparkles, User } from "lucide-react";

export default function TechnicianProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ name: "", bio: "", hourlyRate: "", location: "", skills: "" });

  useEffect(() => {
    const load = async () => {
      try {
        const response = await technicianService.profile();
        const profile = response?.profile || response?.data || {};
        setForm({
          name: profile.name || "",
          bio: profile.bio || "",
          hourlyRate: String(profile.hourlyRate || ""),
          location: profile.location || "",
          skills: Array.isArray(profile.skills) ? profile.skills.join(", ") : String(profile.skills || ""),
        });
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load profile");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await technicianService.updateProfile({
        ...form,
        skills: form.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
      });

      const { default: Swal } = await import("sweetalert2");
      await Swal.fire({
        icon: "success",
        title: "Profile saved",
        text: "Your profile has been updated successfully.",
        confirmButtonText: "Go to dashboard",
      });
      router.push("/technician/dashboard");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8"><div className="surface-card h-56 animate-pulse" /></main>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="surface-card p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">
          <User className="h-4 w-4" /> Technician profile
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">Complete your profile.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-text-muted">This is the profile customers will see before they book you.</p>
      </section>

      <section className="mt-8 surface-card p-6 sm:p-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Name</label>
            <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Hourly rate</label>
            <input value={form.hourlyRate} onChange={(event) => setForm((current) => ({ ...current, hourlyRate: event.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Location</label>
            <input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Skills</label>
            <input value={form.skills} onChange={(event) => setForm((current) => ({ ...current, skills: event.target.value }))} className="input-field" placeholder="Repair, Maintenance" />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-foreground">Bio</label>
          <textarea value={form.bio} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} className="input-field min-h-40" />
        </div>

        {error && <div className="mt-4 rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">{error}</div>}

        <button type="button" onClick={handleSave} disabled={isSaving} className="btn-primary mt-6 py-3 disabled:opacity-50">
          {isSaving ? "Saving..." : "Save profile"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </section>

      <section className="mt-8 rounded-3xl border border-border bg-slate-50 p-6 text-sm text-text-muted">
        <div className="inline-flex items-center gap-2 text-foreground">
          <BadgeCheck className="h-4 w-4 text-success" /> Profile completion improves discoverability.
        </div>
        <p className="mt-2 inline-flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent" /> You can tune the layout and avatar upload next.</p>
      </section>
    </main>
  );
}