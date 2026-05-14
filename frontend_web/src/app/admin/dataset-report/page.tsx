"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPanel } from "@/components/admin/AdminPanel";

export default function AdminDatasetPage() {
  const [data, setData] = useState<unknown>(null);
  useEffect(() => {
    void api.get("/admin/dataset-report/").then((r) => setData(r.data));
  }, []);
  return (
    <>
      <AdminPageHeader
        title="Dataset report"
        description="Scanned dataset summary or documentation from the backend pipeline."
      />
      <AdminPanel className="overflow-x-auto p-0">
        <pre className="max-h-[min(32rem,70vh)] overflow-auto p-5 text-xs leading-relaxed text-slate-700">
          {JSON.stringify(data, null, 2)}
        </pre>
      </AdminPanel>
    </>
  );
}
