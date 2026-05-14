"use client";

import { useEffect, useState } from "react";
import { Brain } from "lucide-react";
import { api } from "@/lib/api/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { Badge } from "@/components/ui/Badge";

export default function AdminAiPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  useEffect(() => {
    void api.get("/admin/ai-analyses/").then((r) => setRows(r.data as Record<string, unknown>[]));
  }, []);
  return (
    <>
      <AdminPageHeader
        title="AI analyses"
        description="Recent automated pricing and condition runs against seller uploads."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.slice(0, 50).map((a) => (
          <AdminPanel key={String(a.id)} className="p-4 transition hover:shadow-md">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                <Brain className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{String(a.input_title ?? "—")}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Avg {String(a.suggested_price_avg ?? "—")} · {String(a.predicted_condition_label ?? "—")}
                </p>
                <div className="mt-2">
                  <Badge tone={a.success === true ? "success" : "neutral"}>
                    {a.success === true ? "Success" : "Recorded"}
                  </Badge>
                </div>
              </div>
            </div>
          </AdminPanel>
        ))}
      </div>
      {rows.length === 0 && (
        <AdminPanel className="p-12 text-center text-sm text-slate-500">No AI analyses recorded.</AdminPanel>
      )}
    </>
  );
}
