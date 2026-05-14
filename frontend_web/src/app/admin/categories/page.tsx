"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { unwrapList } from "@/lib/unwrap";
import type { Category } from "@/lib/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { AppInput } from "@/components/ui/AppInput";
import { AppTextarea } from "@/components/ui/AppTextarea";
import { AppButton } from "@/components/ui/AppButton";
import { FolderPlus, Library } from "lucide-react";

export default function AdminCategoriesPage() {
  const [rows, setRows] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [seedMsg, setSeedMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const r = await api.get("/categories/");
    setRows(unwrapList<Category>(r.data));
  }

  useEffect(() => {
    void load();
  }, []);

  async function create() {
    if (!name.trim()) return;
    setBusy(true);
    try {
      await api.post("/categories/", {
        name: name.trim(),
        description: description.trim(),
        is_active: true,
      });
      setName("");
      setDescription("");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function seedDefaults() {
    if (!window.confirm("Create or refresh the 12 default marketplace categories (Mobile Phones, Laptops, …)?")) {
      return;
    }
    setBusy(true);
    setSeedMsg(null);
    try {
      const r = await api.post("/admin/categories/seed-defaults/");
      const d = r.data as { created: number; updated: number };
      setSeedMsg(`Done: ${d.created} created, ${d.updated} updated.`);
      await load();
    } catch (e: unknown) {
      setSeedMsg("Could not seed categories. Are you logged in as superadmin?");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Categories"
        description="Taxonomy for listings. Superadmins can install the default set in one click, or add custom categories below. Sellers pick these when creating products."
      />
      <div className="grid gap-6 lg:grid-cols-5">
        <AdminPanel className="space-y-5 p-5 lg:col-span-2">
          <div>
            <div className="mb-3 flex items-center gap-2 text-slate-900">
              <Library className="h-5 w-5 text-emerald-600" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Default set</h2>
            </div>
            <p className="text-sm text-slate-600">
              Installs or updates twelve top-level categories (Mobile Phones, Laptops, Tablets, …) with the
              marketplace blurbs used on the home page.
            </p>
            <AppButton className="mt-3" variant="secondary" disabled={busy} onClick={() => void seedDefaults()}>
              Install / refresh default categories
            </AppButton>
            {seedMsg && <p className="mt-2 text-xs text-slate-600">{seedMsg}</p>}
          </div>
          <div className="border-t border-slate-100 pt-5">
            <div className="mb-4 flex items-center gap-2 text-slate-900">
              <FolderPlus className="h-5 w-5 text-emerald-600" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Custom category</h2>
            </div>
            <AppInput label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Wearables" />
            <AppTextarea
              className="mt-3"
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short line for buyers (optional)."
              rows={3}
            />
            <AppButton className="mt-4 w-full sm:w-auto" disabled={busy} onClick={() => void create()}>
              Create category
            </AppButton>
          </div>
        </AdminPanel>
        <AdminPanel className="p-0 lg:col-span-3">
          <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-700">All active categories ({rows.length})</h2>
          </div>
          <ul className="max-h-[min(28rem,55vh)] divide-y divide-slate-100 overflow-y-auto">
            {rows.map((c) => (
              <li key={c.id} className="px-4 py-3 text-sm hover:bg-slate-50/80">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span className="font-medium text-slate-900">{c.name}</span>
                  <code className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{c.slug}</code>
                </div>
                {c.description ? (
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{c.description}</p>
                ) : (
                  <p className="mt-1 text-xs italic text-slate-400">No description</p>
                )}
              </li>
            ))}
          </ul>
        </AdminPanel>
      </div>
    </>
  );
}
