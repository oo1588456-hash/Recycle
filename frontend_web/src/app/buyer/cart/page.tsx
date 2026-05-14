"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api/client";
import { STORE_CURRENCY } from "@/lib/storeCurrency";
import { mediaUrl } from "@/lib/unwrap";
import type { Cart } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { AppButton } from "@/components/ui/AppButton";

export default function BuyerCartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    try {
      const r = await api.get("/cart/");
      setCart(r.data as Cart);
    } catch {
      setErr("Could not load cart.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function remove(id: number) {
    await api.delete(`/cart/items/${id}/`);
    await load();
  }

  async function clear() {
    await api.delete("/cart/clear/");
    await load();
  }

  const items = cart?.items ?? [];
  const subtotal = items.reduce((s, it) => {
    const p = it.product_detail;
    const price = Number(p?.final_price || p?.original_price || 0);
    return s + price * it.quantity;
  }, 0);
  const cur = items[0]?.product_detail?.currency ?? STORE_CURRENCY;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-recycle-charcoal">Your basket</h1>
      <p className="mt-2 text-recycle-muted">Honest pricing, one seller per checkout group.</p>
      {err && <p className="mt-4 text-recycle-error">{err}</p>}
      {items.length === 0 ? (
        <Card className="mt-10 p-12 text-center">
          <p className="font-semibold text-recycle-charcoal">Your cart is empty</p>
          <p className="mt-2 text-sm text-recycle-muted">Discover pre-loved tech and homeware on the marketplace.</p>
          <Link href="/products" className="mt-6 inline-block">
            <AppButton>Continue shopping</AppButton>
          </Link>
        </Card>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {items.map((it) => {
              const p = it.product_detail;
              const img = p?.images?.[0];
              const src = mediaUrl(img?.image);
              return (
                <Card key={it.id} className="flex gap-4 p-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-recycle-surface">
                    {src && <Image src={src} alt="" fill className="object-cover" sizes="96px" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-recycle-charcoal">{p?.title}</p>
                    <p className="text-xs text-recycle-muted">
                      Seller: {p?.seller?.full_name || p?.seller?.username}
                    </p>
                    <p className="mt-2 text-sm font-bold">
                      {p?.currency} {p?.final_price || p?.original_price} × {it.quantity}
                    </p>
                    <button
                      type="button"
                      className="mt-2 text-sm font-semibold text-recycle-error hover:underline"
                      onClick={() => void remove(it.id)}
                    >
                      Remove
                    </button>
                  </div>
                </Card>
              );
            })}
            <button type="button" className="text-sm font-semibold text-recycle-muted hover:text-recycle-error" onClick={() => void clear()}>
              Clear basket
            </button>
          </div>
          <Card className="h-fit p-6">
            <h2 className="text-lg font-bold">Summary</h2>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-recycle-muted">Subtotal</span>
              <span className="font-semibold">
                {cur} {subtotal.toFixed(2)}
              </span>
            </div>
            <div className="mt-2 flex justify-between border-t border-recycle-border pt-4 text-lg font-bold">
              <span>Total</span>
              <span>
                {cur} {subtotal.toFixed(2)}
              </span>
            </div>
            <Link href="/buyer/checkout" className="mt-6 block">
              <AppButton className="w-full">Proceed to checkout</AppButton>
            </Link>
          </Card>
        </div>
      )}
    </div>
  );
}
