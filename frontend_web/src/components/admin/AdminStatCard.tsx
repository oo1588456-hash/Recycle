import type { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  /** Tailwind gradient / bg classes for icon tile */
  tone?: "emerald" | "sky" | "violet" | "amber" | "rose" | "slate";
};

const tones: Record<NonNullable<Props["tone"]>, string> = {
  emerald: "from-emerald-500 to-teal-600 shadow-emerald-500/25",
  sky: "from-sky-500 to-blue-600 shadow-sky-500/25",
  violet: "from-violet-500 to-purple-600 shadow-violet-500/25",
  amber: "from-amber-500 to-orange-600 shadow-amber-500/25",
  rose: "from-rose-500 to-pink-600 shadow-rose-500/25",
  slate: "from-slate-600 to-slate-800 shadow-slate-500/20",
};

export function AdminStatCard({ label, value, icon: Icon, tone = "slate" }: Props) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-slate-900">{value}</p>
        </div>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg ${tones[tone]}`}
        >
          <Icon className="h-6 w-6 opacity-95" strokeWidth={1.75} />
        </div>
      </div>
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-slate-100 to-transparent opacity-0 transition group-hover:opacity-100" />
    </div>
  );
}
