"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { Card } from "@/components/ui/Card";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppTextarea } from "@/components/ui/AppTextarea";

export default function CheckoutPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [addr, setAddr] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [pay, setPay] = useState("cash_on_delivery");
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setErr(null);
    try {
      const res = await api.post("/orders/create-from-cart/", {
        shipping_address: addr,
        buyer_phone: phone,
        payment_method: pay,
        notes,
      });
      const orders = res.data as { order_number: string }[];
      const num = orders?.[0]?.order_number ?? "placed";
      router.push(`/buyer/orders?success=${encodeURIComponent(num)}`);
    } catch {
      setErr("Checkout failed. Is your cart empty or are items unavailable?");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-recycle-charcoal">Checkout</h1>
      <p className="mt-2 text-recycle-muted">UK-style address capture — demo payments for coursework.</p>
      <Card className="mt-8 space-y-4 p-6">
        <AppInput label="Shipping address" value={addr} onChange={(e) => setAddr(e.target.value)} />
        <AppInput label="Buyer phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <div>
          <label className="mb-1.5 block text-sm font-medium">Payment method</label>
          <select
            value={pay}
            onChange={(e) => setPay(e.target.value)}
            className="w-full rounded-xl border border-recycle-border px-3 py-2.5 text-sm"
          >
            <option value="cash_on_delivery">Cash on delivery</option>
            <option value="bank_transfer">Bank transfer</option>
            <option value="mock_payment">Mock payment</option>
          </select>
        </div>
        <AppTextarea label="Order notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        {err && <p className="text-sm text-recycle-error">{err}</p>}
        <AppButton className="w-full" disabled={busy} onClick={() => void submit()}>
          {busy ? "Placing order…" : "Place order"}
        </AppButton>
      </Card>
    </div>
  );
}
