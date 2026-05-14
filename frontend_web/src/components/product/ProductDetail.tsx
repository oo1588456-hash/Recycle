"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AppButton } from "@/components/ui/AppButton";
import { api } from "@/lib/api/client";
import { useAuthStore } from "@/lib/auth/auth-store";
import { mediaUrl } from "@/lib/unwrap";
import { STORE_CURRENCY } from "@/lib/storeCurrency";
import type { Product } from "@/lib/types";

export function ProductDetail({ product }: { product: Product }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [idx, setIdx] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const images = product.images?.length ? product.images : [];
  const main = images[idx];
  const src = mediaUrl(main?.image);
  const price = product.final_price || product.original_price;
  const isOwner = user?.id === product.seller?.id;

  async function addToCart() {
    setBusy(true);
    setMsg(null);
    try {
      await api.post("/cart/items/", { product_id: product.id, quantity: 1 });
      setMsg("Added to your cart.");
      router.push("/buyer/cart");
    } catch {
      setMsg("Could not add to cart. Are you logged in as a buyer?");
    } finally {
      setBusy(false);
    }
  }

  async function openChat() {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/products/${product.id}`)}`);
      return;
    }
    const messagesBase = user.role === "seller" ? "/seller/messages" : "/buyer/messages";
    router.push(`${messagesBase}?peer=${product.seller.id}&product=${product.id}`);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-recycle-border bg-recycle-surface">
            {src ? (
              <Image src={src} alt={product.title} fill className="object-contain" priority sizes="(max-width:1024px) 100vw, 50vw" />
            ) : (
              <div className="flex h-full items-center justify-center text-recycle-muted">No image</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex gap-2 overflow-x-auto">
              {images.map((im, i) => {
                const u = mediaUrl(im.image);
                return (
                  <button
                    key={im.id}
                    type="button"
                    onClick={() => setIdx(i)}
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 ${i === idx ? "border-recycle-primary" : "border-transparent"}`}
                  >
                    {u && <Image src={u} alt="" fill className="object-cover" sizes="80px" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-recycle-primary">{product.category?.name}</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-recycle-charcoal">{product.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-3xl font-bold text-recycle-charcoal">
              {product.currency} {price}
            </span>
            {product.is_ai_evaluated && <Badge tone="mint">AI priced</Badge>}
            {product.ai_condition_label && <Badge tone="neutral">{product.ai_condition_label}</Badge>}
            {typeof product.ai_condition_score === "number" && (
              <Badge tone="success">Condition {product.ai_condition_score}</Badge>
            )}
          </div>
          <p className="mt-2 text-sm text-recycle-muted">
            {product.location && <span>{product.location} · </span>}
            Stock: {product.stock_quantity}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {user?.role === "buyer" && !isOwner && (
              <AppButton size="lg" onClick={addToCart} disabled={busy} className="gap-2">
                <ShoppingCart className="h-5 w-5" /> Add to cart
              </AppButton>
            )}
            {!isOwner && (
              <AppButton variant="outline" size="lg" className="gap-2" onClick={openChat}>
                <MessageCircle className="h-5 w-5" /> Message seller
              </AppButton>
            )}
          </div>
          {msg && <p className="mt-3 text-sm text-recycle-success">{msg}</p>}

          <Card className="mt-8 p-5">
            <h3 className="font-semibold text-recycle-charcoal">Seller</h3>
            <p className="mt-1 text-sm text-recycle-muted">
              {product.seller?.full_name || product.seller?.username}
            </p>
          </Card>
        </div>
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-lg font-bold">Description</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-recycle-muted">{product.description}</p>
        </Card>
        <Card className="p-6">
          <h2 className="text-lg font-bold">Specifications</h2>
          <dl className="mt-4 space-y-2 text-sm">
            {[
              ["Brand", product.brand],
              ["Model", product.model_name],
              ["Age (months)", product.product_age_months],
              ["Usage (months)", product.usage_duration_months],
              ["Declared condition", product.user_declared_condition],
              ["Storage", product.storage],
              ["RAM", product.ram],
              ["Processor", product.processor],
              ["Battery", product.battery_health],
              ["Screen", product.screen_condition],
              ["Body", product.body_condition],
              ["Warranty", product.warranty_status],
              ["Accessories", product.accessories_included],
              ["Box", product.box_available ? "Yes" : "No"],
            ].map(([k, v]) =>
              v != null && v !== "" ? (
                <div key={String(k)} className="flex justify-between gap-4 border-b border-recycle-border py-1">
                  <dt className="text-recycle-muted">{k}</dt>
                  <dd className="font-medium text-recycle-charcoal">{String(v)}</dd>
                </div>
              ) : null
            )}
          </dl>
        </Card>
      </div>

      {product.is_ai_evaluated && (
        <Card className="mt-8 border-recycle-mint bg-gradient-to-br from-recycle-mint/40 to-white p-8">
          <h2 className="text-xl font-bold text-recycle-charcoal">AI price analysis</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase text-recycle-muted">
                Suggested range ({product.currency ?? STORE_CURRENCY})
              </p>
              <p className="mt-2 text-2xl font-bold text-recycle-charcoal">
                {product.ai_suggested_price_min} – {product.ai_suggested_price_avg} – {product.ai_suggested_price_max}
              </p>
              <div className="mt-4 h-3 w-full rounded-full bg-white">
                <div
                  className="h-3 rounded-full bg-recycle-primary"
                  style={{ width: `${Math.min(100, product.ai_confidence_score ?? 50)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-recycle-muted">
                Confidence score: {product.ai_confidence_score ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-recycle-charcoal">Explanation</p>
              <p className="mt-2 text-sm leading-relaxed text-recycle-muted">{product.ai_price_explanation}</p>
              {product.ai_warnings && product.ai_warnings.length > 0 && (
                <ul className="mt-4 list-disc pl-5 text-sm text-recycle-warning">
                  {product.ai_warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
