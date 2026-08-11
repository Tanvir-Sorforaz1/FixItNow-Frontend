"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowRight, BadgeCheck, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { authService } from "@/services/auth.service";

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
  role: "CUSTOMER" | "TECHNICIAN";
};

function resolveRedirect(role: string | undefined) {
  switch (role) {
    case "TECHNICIAN":
      return "/technician/dashboard";
    case "ADMIN":
      return "/admin";
    default:
      return "/dashboard";
  }
}

export default function RegisterPage() {
  const router = useRouter();
  const { register: saveAuth } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState<RegisterFormValues["role"]>("CUSTOMER");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({ defaultValues: { role: "CUSTOMER" } });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const response = await authService.register(values);
      const token = response?.token || response?.data?.token || "";
      const user = response?.user || response?.data?.user || response?.data || response || null;
      const normalizedRole = user?.role || values.role;

      if (!token || !user) {
        throw new Error("Invalid registration response from the server.");
      }

      saveAuth(token, {
        id: user.id || user._id || "local-user",
        name: user.name || user.fullName || user.email || values.name,
        email: user.email || values.email,
        role: normalizedRole,
      });

      router.push(resolveRedirect(normalizedRole));
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="glass-panel rounded-[32px] p-6 shadow-[var(--shadow-lg)] sm:p-8 lg:order-2">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground text-white">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">FixItNow</p>
              <p className="text-sm text-text-muted">Home services marketplace</p>
            </div>
          </Link>

          <div className="mt-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Create account</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">Choose how you want to use FixItNow.</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-text-muted">
              Start as a customer or technician. You can finish your technician profile after signup.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              { value: "CUSTOMER" as const, title: "I need a service", description: "Book trusted home repairs." },
              { value: "TECHNICIAN" as const, title: "I provide a service", description: "Offer your skills and accept jobs." },
            ].map((option) => {
              const active = role === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setRole(option.value);
                    setValue("role", option.value, { shouldDirty: true, shouldTouch: true });
                  }}
                  className={`rounded-[28px] border p-5 text-left transition ${active ? "border-transparent bg-foreground text-white shadow-[var(--shadow)]" : "border-border bg-white text-foreground hover:border-accent"}`}
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] opacity-80">{option.value}</p>
                  <p className="mt-3 text-lg font-semibold">{option.title}</p>
                  <p className={`mt-2 text-sm ${active ? "text-white/75" : "text-text-muted"}`}>{option.description}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-8 rounded-3xl border border-border bg-slate-50 p-4 text-sm text-text-muted">
            <p className="flex items-center gap-2 text-foreground">
              <ShieldCheck className="h-4 w-4 text-success" /> Role-aware onboarding and redirects.
            </p>
            <p className="mt-2 flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-accent" /> Technician accounts can complete profile setup after signup.
            </p>
          </div>
        </section>

        <section className="hero-gradient rounded-[32px] p-6 text-white shadow-[var(--shadow-lg)] sm:p-8 lg:order-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90">
            <Sparkles className="h-4 w-4 text-orange-300" /> Trusted access for every role
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5 rounded-[28px] bg-white p-6 text-foreground shadow-[var(--shadow-lg)] sm:p-8">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Full name</label>
              <input {...register("name", { required: true })} className="input-field" />
              {errors.name && <p className="mt-1 text-sm text-danger">Name is required.</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Email</label>
              <input {...register("email", { required: true })} className="input-field" placeholder="you@example.com" />
              {errors.email && <p className="mt-1 text-sm text-danger">Email is required.</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Password</label>
              <input type="password" {...register("password", { required: true, minLength: 6 })} className="input-field" placeholder="••••••••" />
              {errors.password && <p className="mt-1 text-sm text-danger">Password must be at least 6 characters.</p>}
            </div>

            <input type="hidden" {...register("role")} />

            {serverError && <p className="rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">{serverError}</p>}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 disabled:opacity-70">
              {isSubmitting ? "Creating account..." : "Create account"}
              <ArrowRight className="h-4 w-4" />
            </button>

            <p className="text-center text-sm text-text-muted">
              Already have an account? <Link href="/login" className="font-semibold text-accent">Sign in</Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}