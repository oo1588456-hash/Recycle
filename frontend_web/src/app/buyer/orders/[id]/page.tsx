"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api/client";
import type { Order } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function BuyerOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [o, setO] = useState<Order | null>(null);

  useEffect(() => {
    if (!id) return;
    void api.get(`/orders/${id}/`).then((r) => setO(r.data as Order));
  }, [id]);

  if (!o) return <div className="p-10 text-center text-recycle-muted">Loading…</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-extrabold">{o.order_number}</h1>
      <Badge tone="neutral" className="mt-2">
        {o.status}
      </Badge>
      <Card className="mt-6 space-y-2 p-6 text-sm">
        <p>
          <span className="text-recycle-muted">Total:</span>{" "}
          <strong>
            {o.currency} {o.total_amount}
          </strong>
        </p>
        <p>
          <span className="text-recycle-muted">Payment:</span> {o.payment_method} / {o.payment_status}
        </p>
        <p>
          <span className="text-recycle-muted">Ship to:</span> {o.shipping_address}
        </p>
        <p>
          <span className="text-recycle-muted">Phone:</span> {o.buyer_phone}
        </p>
      </Card>
    </div>
  );
}
