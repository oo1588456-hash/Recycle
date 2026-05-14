"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api/client";
import { Card } from "@/components/ui/Card";
import { AppButton } from "@/components/ui/AppButton";
import { Badge } from "@/components/ui/Badge";

export default function SellerAiPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    try {
      const r = await api.post(`/seller/products/${id}/analyze-with-ai/`);
      setData(r.data as Record<string, unknown>);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-extrabold">AI analysis</h1>
      <Card className="mt-6 p-6">
        <AppButton onClick={() => void run()} disabled={busy}>
          {busy ? "Running…" : "Run / refresh analysis"}
        </AppButton>
        {data && (
          <div className="mt-6 space-y-2 text-sm">
            <Badge tone="mint">Condition {String(data.condition_label)}</Badge>
            <p>Score: {String(data.condition_score)}</p>
            <p>
              Range: {String(data.suggested_price_min)} – {String(data.suggested_price_avg)} –{" "}
              {String(data.suggested_price_max)}
            </p>
            <p className="text-recycle-muted">{String(data.explanation)}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
