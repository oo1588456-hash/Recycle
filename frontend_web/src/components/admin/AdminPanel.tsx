import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

/** Primary content surface for admin tables and forms */
export function AdminPanel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm",
        className,
      )}
      {...props}
    />
  );
}
