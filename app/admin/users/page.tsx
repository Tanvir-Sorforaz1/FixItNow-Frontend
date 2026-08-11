"use client";

import { useMemo, useEffect, useState } from "react";
import { adminService } from "@/services/admin.service";
import { AuthUser } from "@/types";
import { Search, ShieldCheck, UserPlus, Ban } from "lucide-react";

type AdminUserRow = AuthUser & {
  status?: string;
  joinedAt?: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    const load = async () => {
      const response = await adminService.getUsers();
      setUsers(response?.users || response?.data || []);
      setLoading(false);
    };

    load();
  }, []);

  const toggleStatus = async (userId: string, userName: string, status: string) => {
    const banning = status === "BANNED";
    const actionLabel = banning ? "Ban" : "Unban";

    try {
      const { default: Swal } = await import("sweetalert2");

      const result = await Swal.fire({
        icon: banning ? "warning" : "question",
        title: `${actionLabel} ${userName}?`,
        text: banning
          ? "This user will no longer be able to access the platform."
          : "This will restore the user's access to the platform.",
        showCancelButton: true,
        confirmButtonText: banning ? "Yes, ban them" : "Yes, unban them",
        cancelButtonText: "Cancel",
        confirmButtonColor: banning ? "#dc2626" : "#16a34a",
        cancelButtonColor: "#64748b",
      });

      if (!result.isConfirmed) {
        return;
      }

      await adminService.updateUserStatus(userId, { status });

      const response = await adminService.getUsers();
      setUsers(response?.users || response?.data || []);

      await Swal.fire({
        icon: "success",
        title: `User ${actionLabel.toLowerCase()}ed`,
        text: `${userName} was successfully ${banning ? "banned" : "unbanned"}.`,
        confirmButtonText: "OK",
        confirmButtonColor: "#16a34a",
        timer: 2000,
        timerProgressBar: true,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : `${actionLabel} failed`;
      const { default: Swal } = await import("sweetalert2");
      await Swal.fire({
        icon: "error",
        title: `${actionLabel} failed`,
        text: message,
        confirmButtonText: "OK",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  const visibleUsers = useMemo(() => {
    return users.filter((user) => {
      const userStatus = user.status || "ACTIVE";
      const matchesSearch = `${user.name} ${user.email}`.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      const matchesStatus = statusFilter === "ALL" || userStatus === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, roleFilter, search, statusFilter]);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="surface-card p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">
          <ShieldCheck className="h-4 w-4" /> Users
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">Moderate platform users.</h1>
      </section>

      <section className="mt-8 surface-card p-6 sm:p-8">
        <div className="grid gap-4 md:grid-cols-[1.3fr_0.8fr_0.8fr]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or email"
              className="input-field pl-10"
            />
          </label>
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="input-field">
            <option value="ALL">All roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="TECHNICIAN">Technician</option>
            <option value="ADMIN">Admin</option>
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="input-field">
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="BANNED">Banned</option>
          </select>
        </div>

        {loading ? (
          <div className="space-y-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="surface-panel h-20 animate-pulse" />)}</div>
        ) : (
          <div className="space-y-4">
            {visibleUsers.map((user) => (
              <article key={user.id} className="flex flex-col gap-4 rounded-3xl border border-border bg-slate-50 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-foreground">{user.name}</p>
                  <p className="mt-1 text-sm text-text-muted">{user.email}</p>
                  {(() => {
                    const phone = (user as { phone?: string }).phone;
                    const city = (user as { city?: string }).city;
                    const address = (user as { address?: string }).address;
                    const location = [city, address].filter(Boolean).join(", ");
                    if (!phone && !location) return null;
                    return (
                      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-text-muted">
                        {[phone, location].filter(Boolean).join(" · ")}
                      </p>
                    );
                  })()}
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-text-muted">Joined {user.joinedAt || "recently"}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">{user.role}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${user.status === "BANNED" ? "bg-danger-soft text-danger-strong" : "bg-success-soft text-success-strong"}`}>
                    {user.status || "ACTIVE"}
                  </span>
                  {user.status === "BANNED" ? (
                    <button onClick={() => toggleStatus(user.id, user.name, "ACTIVE")} className="btn-success text-sm">
                      <UserPlus className="h-4 w-4" /> Unban
                    </button>
                  ) : (
                    <button onClick={() => toggleStatus(user.id, user.name, "BANNED")} className="btn-danger text-sm">
                      <Ban className="h-4 w-4" /> Ban
                    </button>
                  )}
                </div>
              </article>
            ))}
            {!visibleUsers.length && <p className="rounded-3xl border border-dashed border-border px-4 py-8 text-center text-sm text-text-muted">No users match those filters.</p>}
          </div>
        )}
      </section>
    </main>
  );
}