"use client";

import { useEffect, useState } from "react";
import { userService } from "@/services/user.service";
import { ArrowRight, BadgeCheck, User } from "lucide-react";

export default function CustomerProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });

  useEffect(() => {
    const load = async () => {
      try {
        const response = await userService.getMe();
        const user = response?.user || response?.data || {};
        setForm({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
        });
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load profile");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    setError(null);
    try {
      await userService.updateMe(form);
      alert("Profile saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8"><div className="surface-card h-56 animate-pulse" /></main>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="surface-card p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">
          <User className="h-4 w-4" /> Customer profile
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">Edit your profile.</h1>
      </section>

      <section className="mt-8 surface-card p-6 sm:p-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Name</label>
            <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Email</label>
            <input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Phone</label>
            <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Address</label>
            <input value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} className="input-field" />
          </div>
        </div>

        {error && <div className="mt-4 rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">{error}</div>}

        <button type="button" onClick={saveProfile} disabled={saving} className="btn-primary mt-6 py-3 disabled:opacity-50">
          {saving ? "Saving..." : "Save profile"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </section>

      <section className="mt-8 rounded-3xl border border-border bg-slate-50 p-6 text-sm text-text-muted">
        <BadgeCheck className="mb-2 h-4 w-4 text-success" />
        Address and contact data are used to prefill bookings.
      </section>
    </main>
  );
}