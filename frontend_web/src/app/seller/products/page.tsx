"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api/client";
import { mediaUrl } from "@/lib/unwrap";
import type { Product } from "@/lib/types";
import { unwrapList } from "@/lib/unwrap";
import { Badge } from "@/components/ui/Badge";
import { AppButton } from "@/components/ui/AppButton";

export default function SellerProductsPage() {
  const [items, setItems] = useState<Product[]>([]);

  async function load() {
    const r = await api.get("/seller/products/");
    setItems(unwrapList<Product>(r.data));
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold">My products</h1>
        <Link href="/seller/products/create">
          <AppButton>Create listing</AppButton>
        </Link>
      </div>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-recycle-border bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-recycle-surface text-xs uppercase text-recycle-muted">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">AI</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => {
              const img = p.images?.[0];
              const src = mediaUrl(img?.image);
              return (
                <tr key={p.id} className="border-t border-recycle-border">
                  <td className="px-4 py-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-recycle-surface">
                      {src && <Image src={src} alt="" fill className="object-cover" sizes="48px" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3">
                    <Badge tone="neutral">{p.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {p.currency} {p.final_price || p.original_price}
                  </td>
                  <td className="px-4 py-3 text-xs">{p.is_ai_evaluated ? "Yes" : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/seller/products/${p.id}/edit`} className="text-recycle-primary hover:underline">
                        Edit
                      </Link>
                      <Link href={`/seller/products/${p.id}/ai-analysis`} className="text-recycle-primary hover:underline">
                        AI
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {items.length === 0 && <p className="p-8 text-center text-recycle-muted">No listings yet.</p>}
      </div>
    </div>
  );
}
