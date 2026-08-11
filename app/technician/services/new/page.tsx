"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { serviceService } from "@/services/service.service";
import { categoryService } from "@/services/category.service";
import { CategoryItem } from "@/types";
import { ArrowRight, Sparkles } from "lucide-react";

export default function NewTechnicianServicePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [form, setForm] = useState({ title: "", description: "", price: "", location: "", category: "" });

  useEffect(() => {
    const load = async () => {
      try {
        const response = await categoryService.list();
        setCategories(response?.categories || response?.data || []);
      } catch {
        setCategories([]);
      }
    };

    load();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await serviceService.create({
        name: form.title,
        description: form.description,
        price: Number(form.price || 0),
        location: form.location,
        category: form.category,
        isActive: true,
      });
      const serviceId = response?.service?.id || response?.data?.id || response?.id;
      router.push(serviceId ? `/technician/services/${serviceId}/edit` : "/technician/services");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="surface-card p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">
          <Sparkles className="h-4 w-4" /> New service
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">Add a service listing.</h1>
      </section>

      <section className="mt-8 surface-card p-6 sm:p-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Title</label>
            <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="input-field" />
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

        <button type="button" onClick={handleSave} disabled={isSaving} className="btn-primary mt-6 py-3 disabled:opacity-50">
          {isSaving ? "Saving..." : "Create service"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </section>
    </main>
  );
}