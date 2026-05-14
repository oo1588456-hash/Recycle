"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { AppButton } from "@/components/ui/AppButton";
import { Badge } from "@/components/ui/Badge";

type U = {
  id: number;
  email: string;
  role: string;
  full_name: string | null;
  is_blocked: boolean;
  seller_account_status: string;
};

export default function AdminUsersPage() {
  const [rows, setRows] = useState<U[]>([]);
  const [filter, setFilter] = useState<"all" | "pending_sellers">("all");

  const load = useCallback(async () => {
    const params =
      filter === "pending_sellers"
        ? { role: "seller", seller_status: "pending" }
        : undefined;
    const r = await api.get("/admin/users/", { params });
    setRows(r.data as U[]);
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#pending-sellers") {
      setFilter("pending_sellers");
    }
  }, []);

  async function setSellerStatus(id: number, seller_account_status: "approved" | "rejected" | "pending") {
    await api.patch(`/admin/users/${id}/seller-status/`, { seller_account_status });
    await load();
  }

  async function removeUser(id: number, email: string) {
    if (!window.confirm(`Permanently delete user ${email}? This cannot be undone.`)) return;
    await api.delete(`/admin/users/${id}/`);
    await load();
  }

  return (
    <>
      <AdminPageHeader
        title="Users & access"
        description="Approve new sellers, block accounts, and remove buyers or sellers. Superadmin accounts cannot be deleted via the API."
      />

      <div className="mb-6 inline-flex rounded-xl border border-slate-200 bg-slate-50/80 p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            filter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          All users
        </button>
        <button
          type="button"
          onClick={() => setFilter("pending_sellers")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            filter === "pending_sellers" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Pending sellers
        </button>
      </div>

      <AdminPanel className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/90 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3.5">User</th>
              <th className="px-4 py-3.5">Role</th>
              <th className="px-4 py-3.5">Seller status</th>
              <th className="px-4 py-3.5">State</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((u) => (
              <tr key={u.id} className="bg-white transition hover:bg-slate-50/80">
                <td className="px-4 py-3.5">
                  <p className="font-medium text-slate-900">{u.email}</p>
                  <p className="text-xs text-slate-500">{u.full_name || "—"}</p>
                </td>
                <td className="px-4 py-3.5">
                  <Badge tone={u.role === "superadmin" ? "mint" : "neutral"}>{u.role}</Badge>
                </td>
                <td className="px-4 py-3.5">
                  {u.role === "seller" ? (
                    <Badge
                      tone={
                        u.seller_account_status === "approved"
                          ? "success"
                          : u.seller_account_status === "pending"
                            ? "warning"
                            : "neutral"
                      }
                    >
                      {u.seller_account_status}
                    </Badge>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  {u.is_blocked ? (
                    <Badge tone="warning">Blocked</Badge>
                  ) : (
                    <Badge tone="success">Active</Badge>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {(u.role === "buyer" || u.role === "seller") && (
                      <Link
                        href={`/admin/support?peer=${u.id}`}
                        className="inline-flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-emerald-400 hover:text-emerald-800"
                      >
                        Message
                      </Link>
                    )}
                    {!u.is_blocked ? (
                      <AppButton
                        size="sm"
                        variant="outline"
                        onClick={() => void api.patch(`/admin/users/${u.id}/block/`).then(load)}
                      >
                        Block
                      </AppButton>
                    ) : (
                      <AppButton
                        size="sm"
                        variant="outline"
                        onClick={() => void api.patch(`/admin/users/${u.id}/unblock/`).then(load)}
                      >
                        Unblock
                      </AppButton>
                    )}
                    {u.role === "seller" && u.seller_account_status === "pending" && (
                      <>
                        <AppButton size="sm" onClick={() => void setSellerStatus(u.id, "approved")}>
                          Approve
                        </AppButton>
                        <AppButton size="sm" variant="outline" onClick={() => void setSellerStatus(u.id, "rejected")}>
                          Reject
                        </AppButton>
                      </>
                    )}
                    {u.role === "seller" && u.seller_account_status === "rejected" && (
                      <AppButton size="sm" variant="outline" onClick={() => void setSellerStatus(u.id, "approved")}>
                        Approve
                      </AppButton>
                    )}
                    {u.role !== "superadmin" && (
                      <AppButton size="sm" variant="ghost" onClick={() => void removeUser(u.id, u.email)}>
                        Delete
                      </AppButton>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminPanel>
    </>
  );
}
