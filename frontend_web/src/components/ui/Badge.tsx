import { cn } from "@/lib/cn";

export function Badge({
  children,
  className,
  tone = "neutral",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "neutral" | "success" | "warning" | "mint";
}) {
  const tones = {
    neutral: "bg-zinc-100 text-zinc-800",
    success: "bg-emerald-100 text-emerald-900",
    warning: "bg-amber-100 text-amber-900",
    mint: "bg-recycle-mint text-recycle-primary-dark",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
