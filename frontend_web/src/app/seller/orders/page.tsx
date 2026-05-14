"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api/client";
import type { Order } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { AppButton } from "@/components/ui/AppButton";

export default function SellerOrdersPage() {
  const [rows, setRows] = useState<Order[]>([]);

  async function load() {
    const r = await api.get("/seller/orders/");
    setRows(r.data as Order[]);
  }

  useEffect(() => {
    void load();
  }, []);

  async function setStatus(id: number, status: string) {
    await api.patch(`/seller/orders/${id}/status/`, { status });
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">Sales orders</h1>
      <div className="mt-8 space-y-3">
        {rows.map((o) => (
          <Card key={o.id} className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Link href={`/seller/orders/${o.id}`} className="font-semibold text-recycle-primary hover:underline">
                  {o.order_number}
                </Link>
                <p className="text-sm text-recycle-muted">
                  {o.currency} {o.total_amount}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["confirmed", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                  <AppButton key={s} size="sm" variant="outline" onClick={() => void setStatus(o.id, s)}>
                    {s}
                  </AppButton>
                ))}
              </div>
            </div>
          </Card>
        ))}
        {rows.length === 0 && <p className="text-recycle-muted">No orders yet.</p>}
      </div>
      <Link href="/seller/dashboard" className="mt-8 inline-block text-sm font-semibold text-recycle-primary">
        ← Back to dashboard
      </Link>
    </div>
  );
}
