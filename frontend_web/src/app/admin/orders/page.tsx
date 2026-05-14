"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import type { Order } from "@/lib/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { AppButton } from "@/components/ui/AppButton";
import { Badge } from "@/components/ui/Badge";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;

export default function AdminOrdersPage() {
  const [rows, setRows] = useState<Order[]>([]);
  async function load() {
    const r = await api.get("/admin/orders/");
    setRows(r.data as Order[]);
  }
  useEffect(() => {
    void load();
  }, []);
  return (
    <>
      <AdminPageHeader
        title="Orders"
        description="Update order status for operations and buyer communication."
      />
      <div className="space-y-3">
        {rows.map((o) => (
          <AdminPanel key={o.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-sm font-semibold text-slate-900">{o.order_number}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone="mint">{o.status}</Badge>
                <span className="text-sm text-slate-600">
                  {o.total_amount} {o.currency}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((s) => (
                <AppButton
                  key={s}
                  size="sm"
                  variant={o.status === s ? "primary" : "outline"}
                  className="capitalize"
                  onClick={() => void api.patch(`/admin/orders/${o.id}/status/`, { status: s }).then(load)}
                >
                  {s}
                </AppButton>
              ))}
            </div>
          </AdminPanel>
        ))}
        {rows.length === 0 && (
          <AdminPanel className="p-12 text-center text-sm text-slate-500">No orders yet.</AdminPanel>
        )}
      </div>
    </>
  );
}
