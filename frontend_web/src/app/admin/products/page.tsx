"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { api } from "@/lib/api/client";
import type { Product } from "@/lib/types";
import { mediaUrl } from "@/lib/unwrap";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { AppButton } from "@/components/ui/AppButton";
import { Badge } from "@/components/ui/Badge";

export default function AdminProductsPage() {
  const [rows, setRows] = useState<Product[]>([]);
  async function load() {
    const r = await api.get("/admin/products/");
    setRows(r.data as Product[]);
  }
  useEffect(() => {
    void load();
  }, []);
  return (
    <>
      <AdminPageHeader
        title="Products"
        description="Moderate listings: activate, reject, or remove items that violate marketplace rules."
      />
      <div className="space-y-3">
        {rows.map((p) => {
          const src = mediaUrl(p.images?.[0]?.image);
          return (
            <AdminPanel key={p.id} className="flex flex-wrap items-center gap-4 p-4 transition hover:shadow-md">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200/80">
                {src && <Image src={src} alt="" fill className="object-cover" sizes="64px" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{p.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge tone="neutral">{p.status}</Badge>
                  <span className="text-xs text-slate-500">
                    {p.final_price} {p.currency}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <AppButton
                  size="sm"
                  variant="outline"
                  onClick={() => void api.patch(`/admin/products/${p.id}/status/`, { status: "active" }).then(load)}
                >
                  Set active
                </AppButton>
                <AppButton
                  size="sm"
                  variant="outline"
                  onClick={() => void api.patch(`/admin/products/${p.id}/status/`, { status: "rejected" }).then(load)}
                >
                  Reject
                </AppButton>
                <AppButton size="sm" variant="ghost" onClick={() => void api.delete(`/admin/products/${p.id}/`).then(load)}>
                  Delete
                </AppButton>
              </div>
            </AdminPanel>
          );
        })}
        {rows.length === 0 && (
          <AdminPanel className="p-12 text-center text-sm text-slate-500">No products in the system yet.</AdminPanel>
        )}
      </div>
    </>
  );
}
