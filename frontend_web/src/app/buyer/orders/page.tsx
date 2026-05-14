"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api/client";
import type { Order } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function BuyerOrdersPage() {
  const [rows, setRows] = useState<Order[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("success");
    setSuccess(q);
  }, []);

  useEffect(() => {
    void api.get("/orders/my-orders/").then((r) => setRows(r.data as Order[]));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-recycle-charcoal">Order history</h1>
      {success && (
        <Card className="mt-6 border-recycle-mint bg-recycle-mint/40 p-4 text-sm font-medium text-recycle-primary-dark">
          Thank you — order {success} was placed successfully.
        </Card>
      )}
      <div className="mt-8 space-y-3">
        {rows.length === 0 ? (
          <Card className="p-10 text-center text-recycle-muted">No orders yet.</Card>
        ) : (
          rows.map((o) => (
            <Link key={o.id} href={`/buyer/orders/${o.id}`}>
              <Card className="flex flex-wrap items-center justify-between gap-4 p-4 transition hover:border-recycle-primary/40">
                <div>
                  <p className="font-semibold text-recycle-charcoal">{o.order_number}</p>
                  <p className="text-xs text-recycle-muted">{new Date(o.created_at ?? "").toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">
                    {o.currency} {o.total_amount}
                  </p>
                  <Badge tone="neutral">{o.status}</Badge>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
