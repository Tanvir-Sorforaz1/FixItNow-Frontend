"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/services/admin.service";
import { CategoryItem } from "@/types";
import { PlusCircle, Sparkles } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const load = async () => {
      const response = await adminService.getCategories();
      setCategories(response?.categories || response?.data || []);
      setLoading(false);
    };

    load();
  }, []);

  const addCategory = async () => {
    await adminService.createCategory({ name, description });
    const response = await adminService.getCategories();
    setCategories(response?.categories || response?.data || []);
    setName("");
    setDescription("");
  };

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="surface-card p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">
          <Sparkles className="h-4 w-4" /> Categories
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">Manage service categories.</h1>
      </section>

      <section className="mt-8 surface-card p-6 sm:p-8">
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Category name" className="input-field" />
          <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description" className="input-field" />
          <button type="button" onClick={addCategory} className="btn-primary w-full">
            <PlusCircle className="h-4 w-4" /> Add
          </button>
        </div>

        {loading ? (
          <div className="mt-6 space-y-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="surface-panel h-20 animate-pulse" />)}</div>
        ) : (
          <div className="mt-6 space-y-4">
            {categories.map((category) => (
              <article key={category.id} className="rounded-3xl border border-border bg-slate-50 p-5">
                <p className="text-lg font-semibold text-foreground">{category.name}</p>
                <p className="mt-1 text-sm text-text-muted">{category.description || "Service category"}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}