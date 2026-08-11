"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { serviceService } from "@/services/service.service";
import { categoryService } from "@/services/category.service";
import { CategoryItem } from "@/types";
import { ArrowRight, PenSquare } from "lucide-react";

export default function EditTechnicianServicePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", location: "", category: "", isActive: true });

  useEffect(() => {
    const load = async () => {
      const categoriesResponse = await categoryService.list();
      setCategories(categoriesResponse?.categories || categoriesResponse?.data || []);

      if (!params?.id) return;
      const response = await serviceService.detail(params.id);
      const service = response?.service || response?.data || {};
      setForm({
        name: service.name || service.title || "",
        description: service.description || "",
        price: String(service.price || ""),
        location: service.location || "",
        category: service.category || "",
        isActive: Boolean(service.isActive ?? true),
      });
      setLoading(false);
    };

    load();
  }, [params?.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await serviceService.update(String(params?.id || ""), {
        ...form,
        price: Number(form.price || 0),
      });
      router.push("/technician/services");
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
          <PenSquare className="h-4 w-4" /> Edit service
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">Update your listing.</h1>
      </section>

      <section className="mt-8 surface-card p-6 sm:p-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Name</label>
            <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Price</label>
            <input value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Category</label>
            <select
              value={form.category}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              className="input-field"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Location</label>
            <input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} className="input-field" />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-foreground">Description</label>
          <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="input-field min-h-40" />
        </div>

        <button type="button" onClick={handleSave} disabled={saving} className="btn-primary mt-6 py-3 disabled:opacity-50">
          {saving ? "Saving..." : "Save changes"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </section>
    </main>
  );
}