"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { AppButton } from "@/components/ui/AppButton";
import { api } from "@/lib/api/client";

export default function BuyerSupportPage() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function openChat() {
    setErr(null);
    setLoading(true);
    try {
      const r = await api.get("/auth/support-contact/");
      const id = (r.data as { id: number }).id;
      router.push(`/buyer/messages?peer=${id}`);
    } catch {
      setErr("Could not reach support. Ensure a super admin account exists (run backend seed script).");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-extrabold text-recycle-charcoal">Contact platform admin</h1>
      <Card className="mt-6 p-6 text-sm text-recycle-charcoal">
        <p>
          Message the ReCycle administrator for account issues, disputes, or general help. Your conversation is private
          and not tied to a specific product listing.
        </p>
        {err && <p className="mt-4 text-sm text-recycle-error">{err}</p>}
        <AppButton className="mt-6" onClick={() => void openChat()} disabled={loading}>
          {loading ? "Opening…" : "Open message thread"}
        </AppButton>
      </Card>
    </div>
  );
}
