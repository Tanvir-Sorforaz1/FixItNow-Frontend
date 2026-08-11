"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Building2, CalendarDays, ChevronDown, Compass, CreditCard, House, LayoutGrid, LogOut, ShieldCheck, Sparkles, Tag } from "lucide-react";

interface PageShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "U";
}

function getMenuItems(role: string | undefined) {
  switch (role) {
    case "ADMIN":
      return [
        { label: "Dashboard", href: "/admin", icon: LayoutGrid },
        { label: "Bookings", href: "/admin/bookings", icon: ShieldCheck },
        { label: "Categories", href: "/admin/categories", icon: Tag },
        { label: "payments", href: "/admin/payments", icon: CreditCard },
        {label: "users", href: "/admin/users", icon: House},

      ];
    case "TECHNICIAN":
      return [
        { label: "Dashboard", href: "/technician/dashboard", icon: LayoutGrid },
        { label: "Bookings", href: "/technician/bookings", icon: ShieldCheck },
        { label: "Services", href: "/technician/services", icon: Compass },
        { label: "Availability", href: "/technician/availability", icon: CalendarDays },
      ];
    default:
      return [
        { label: "Dashboard", href: "/dashboard/customer", icon: LayoutGrid },
        { label: "Bookings", href: "/bookings", icon: ShieldCheck },
        { label: "Services", href: "/services", icon: Compass },
      ];
  }
}

export function PageShell({ title, description, children }: PageShellProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = useMemo(() => getMenuItems(user?.role), [user?.role]);
  const isDashboard = pathname?.startsWith("/dashboard") ?? false;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="relative z-50 border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-medium">FixItNow</p>
              <p className="text-sm text-text-muted">Home services marketplace</p>
            </div>
          </Link>

          <nav className="flex items-center gap-3 text-sm text-text-muted">
            <Link href="/services" className="rounded-full px-3 py-2 transition hover:bg-surface-muted hover:text-foreground">
              Services
            </Link>
            {isAuthenticated && user ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-full border border-border bg-surface-muted px-3 py-2 transition hover:border-accent"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-sm font-medium text-accent">
                    {getInitials(user.name)}
                  </span>
                  <span className="font-medium text-foreground">{user.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {isMenuOpen ? (
                  <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-border bg-surface p-2 shadow-(--shadow)">
                    <div className="mb-2 rounded-xl bg-surface-muted px-3 py-2">
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-text-muted">{user.email}</p>
                      <span className="mt-2 inline-flex rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent">
                        {user.role}
                      </span>
                    </div>
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-text-muted transition hover:bg-surface-muted hover:text-foreground"
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="mt-2 flex w-full items-center gap-2 rounded-xl border border-border px-3 py-2 text-left text-sm font-medium text-danger transition hover:bg-danger-soft"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="rounded-full px-3 py-2 transition hover:bg-surface-muted hover:text-foreground">
                  Login
                </Link>
                <Link href="/auth/register" className="btn-secondary">
                  Join now
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isDashboard ? (
          <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
            <aside className="surface-card p-4 lg:sticky lg:top-6 lg:h-fit">
              <div className="mb-6">
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-text-muted">Workspace</p>
                <h2 className="mt-2 text-lg font-medium">{user?.role ? `${user.role.toLowerCase()} area` : "Dashboard"}</h2>
              </div>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${active ? "bg-accent-soft text-accent" : "text-text-muted hover:bg-surface-muted hover:text-foreground"}`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </aside>

            <div className="space-y-6">
              <section className="surface-card p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-surface-muted px-3 py-1 text-sm text-text-muted">
                      <Sparkles className="h-4 w-4 text-accent" />
                      Trusted platform for local professionals
                    </div>
                    <h1 className="text-3xl font-medium tracking-tight">{title}</h1>
                    <p className="mt-2 max-w-2xl text-sm text-text-muted">{description}</p>
                  </div>
                  <Link href="/services" className="btn-primary">
                    Explore services
                  </Link>
                </div>
              </section>

              {children}
            </div>
          </div>
        ) : (
          <>
            {/* <section className="mb-8 surface-card p-6 sm:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-surface-muted px-3 py-1 text-sm text-text-muted">
                    <House className="h-4 w-4 text-accent" />
                    Trusted platform for local professionals
                  </div>
                  <h1 className="text-3xl font-medium tracking-tight">{title}</h1>
                  <p className="mt-2 max-w-2xl text-sm text-text-muted">{description}</p>
                </div>
                <Link href="/services" className="btn-primary">
                  Explore services
                </Link>
              </div>
            </section> */}

            {children}
          </>
        )}
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-text-muted sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© 2026 FixItNow. Reliable service bookings made simple.</p>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-accent" />
            Secure booking experience
          </div>
        </div>
      </footer>
    </div>
  );
}