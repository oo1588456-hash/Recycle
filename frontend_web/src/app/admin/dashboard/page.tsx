"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Package,
  ShoppingCart,
  Brain,
  UserPlus,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";

type StatDef = {
  key: string;
  label: string;
  icon: typeof Users;
  tone: "emerald" | "sky" | "violet" | "amber" | "rose" | "slate";
};

const PRIMARY_STATS: StatDef[] = [
  {
    key: "pending_seller_accounts",
    label: "Pending seller approvals",
    icon: UserPlus,
    tone: "amber",
  },
  { key: "total_buyers", label: "Registered buyers", icon: Users, tone: "sky" },
  { key: "total_sellers", label: "Registered sellers", icon: Users, tone: "violet" },
  { key: "active_products", label: "Active listings", icon: Package, tone: "emerald" },
  { key: "sold_products", label: "Sold listings", icon: CheckCircle2, tone: "slate" },
  { key: "pending_orders", label: "Orders to action", icon: ShoppingCart, tone: "rose" },
  { key: "total_orders", label: "Total orders", icon: ShoppingCart, tone: "sky" },
  { key: "total_products", label: "All products", icon: Package, tone: "slate" },
  { key: "total_ai_analyses", label: "AI analyses run", icon: Brain, tone: "violet" },
];

export default function AdminDashboardPage() {
  const [s, setS] = useState<Record<string, number> | null>(null);
  useEffect(() => {
    void api.get("/admin/dashboard/stats/").then((r) => setS(r.data as Record<string, number>));
  }, []);

  const pending = s?.pending_seller_accounts ?? 0;
  const shortcuts = useMemo(
    () => [
      {
        href: pending > 0 ? "/admin/users#pending-sellers" : "/admin/users",
        label: "User directory",
        desc: "Approve sellers, block accounts",
        highlight: pending > 0,
      },
      { href: "/admin/support", label: "Messages", desc: "Chat with buyers & sellers" },
      { href: "/admin/products", label: "Product moderation", desc: "Status & removals" },
    ],
    [pending],
  );

  if (!s) {
    return (
      <>
        <AdminPageHeader title="Overview" description="Loading platform metrics…" />
        <div className="grid animate-pulse gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200/60" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Overview"
        description="Live snapshot of marketplace health, onboarding queue, and operations."
      />

      {pending > 0 && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50/80 px-5 py-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
              <UserPlus className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-amber-950">{pending} seller account{pending === 1 ? "" : "s"} awaiting approval</p>
              <p className="mt-0.5 text-sm text-amber-900/80">Review registrations before they can list inventory.</p>
            </div>
          </div>
          <Link
            href="/admin/users#pending-sellers"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-amber-700"
          >
            Open users
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {PRIMARY_STATS.map((def) => (
          <AdminStatCard
            key={def.key}
            label={def.label}
            value={s[def.key] ?? 0}
            icon={def.icon}
            tone={def.tone}
          />
        ))}
      </div>

      <div className="mt-12">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-900">Shortcuts</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shortcuts.map((sc) => (
            <Link
              key={sc.href}
              href={sc.href}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:border-emerald-300/80 hover:shadow-md"
            >
              {sc.highlight && (
                <span className="absolute right-4 top-4 flex h-2 w-2 rounded-full bg-amber-500 ring-4 ring-amber-100" />
              )}
              <p className="font-semibold text-slate-900">{sc.label}</p>
              <p className="mt-1 text-sm text-slate-500">{sc.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 group-hover:gap-2">
                Go
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
