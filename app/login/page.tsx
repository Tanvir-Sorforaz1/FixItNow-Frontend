"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowRight, BadgeCheck, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { authService } from "@/services/auth.service";

type LoginFormValues = {
  email: string;
  password: string;
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

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>();

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const response = await authService.login(values);
      const token = response?.token || response?.data?.token || "";
      const user = response?.user || response?.data?.user || response?.data || response || null;
      const normalizedRole = user?.role || "CUSTOMER";

      if (!token || !user) {
        throw new Error("Invalid login response from the server.");
      }

      login(token, {
        id: user.id || user._id || "local-user",
        name: user.name || user.fullName || user.email || "User",
        email: user.email || values.email,
        role: normalizedRole,
      });

      router.push(resolveRedirect(normalizedRole));
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hero-gradient hidden overflow-hidden rounded-[32px] p-8 text-white shadow-[var(--shadow-lg)] lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90">
            <Sparkles className="h-4 w-4 text-orange-300" />
            Trusted access for customers, technicians, and admins
          </div>
          <div className="mt-8 flex h-full flex-col justify-between gap-10">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                <Wrench className="h-7 w-7" />
              </div>
              <h1 className="mt-6 text-5xl font-semibold leading-tight">Sign in and keep the job moving.</h1>
              <p className="mt-4 max-w-xl text-white/80">
                Track bookings, accept jobs, and manage the platform from one secure account.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Booking status", "Live updates from request to completion"],
                ["Secure checkout", "Pay when a technician accepts"],
                ["Role-based access", "Different dashboards for every role"],
              ].map(([title, description]) => (
                <div key={title} className="rounded-3xl border border-white/10 bg-white/10 p-4">
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-sm text-white/70">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="glass-panel rounded-[32px] p-6 shadow-[var(--shadow-lg)] sm:p-8">
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
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Welcome back</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">Sign in to continue.</h2>
            <p className="mt-3 max-w-md text-sm leading-7 text-text-muted">
              Access your bookings, technician tools, or admin dashboard with one account.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Email</label>
              <input {...register("email", { required: true })} className="input-field" placeholder="you@example.com" />
              {errors.email && <p className="mt-1 text-sm text-danger">Email is required.</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Password</label>
              <input type="password" {...register("password", { required: true })} className="input-field" placeholder="••••••••" />
              {errors.password && <p className="mt-1 text-sm text-danger">Password is required.</p>}
            </div>

            <div className="rounded-3xl border border-border bg-slate-50 p-4 text-sm text-text-muted">
              <p className="flex items-center gap-2 text-foreground">
                <ShieldCheck className="h-4 w-4 text-success" /> Secure JWT-based session handling.
              </p>
              <p className="mt-2 flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-accent" /> Role-aware redirects after login.
              </p>
            </div>

            {serverError && <p className="rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">{serverError}</p>}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 disabled:opacity-70">
              {isSubmitting ? "Signing in..." : "Sign in"}
              <ArrowRight className="h-4 w-4" />
            </button>

            <p className="text-center text-sm text-text-muted">
              New here? <Link href="/register" className="font-semibold text-accent">Create an account</Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}