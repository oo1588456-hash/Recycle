import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { Sliders, Shield, CreditCard } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <>
      <AdminPageHeader
        title="Platform settings"
        description="Operational controls for a production deployment. This demo uses static configuration."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Sliders, title: "Commerce", body: "Currency defaults, fees, and tax display." },
          { icon: Shield, title: "Moderation", body: "Auto-hold rules, blocked keywords, dispute flows." },
          { icon: CreditCard, title: "Payments", body: "Gateway keys, COD regions, refund policy." },
        ].map((x) => (
          <AdminPanel key={x.title} className="p-5">
            <x.icon className="h-8 w-8 text-emerald-600/90" strokeWidth={1.5} />
            <h2 className="mt-3 font-semibold text-slate-900">{x.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{x.body}</p>
            <p className="mt-4 text-xs font-medium text-amber-700/90">Not wired in this demo build.</p>
          </AdminPanel>
        ))}
      </div>
    </>
  );
}
