import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
};

export function AppButton({
  className,
  variant = "primary",
  size = "md",
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center font-semibold rounded-xl transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-5 py-2.5 text-sm", lg: "px-6 py-3 text-base" };
  const variants = {
    primary:
      "bg-recycle-primary text-white hover:bg-recycle-primary-dark shadow-soft focus-visible:outline-recycle-primary",
    secondary: "bg-recycle-charcoal text-white hover:bg-zinc-800",
    outline:
      "border-2 border-recycle-border bg-white text-recycle-charcoal hover:border-recycle-primary hover:text-recycle-primary",
    ghost: "text-recycle-charcoal hover:bg-recycle-mint/60",
  };
  return <button className={cn(base, sizes[size], variants[variant], className)} {...props} />;
}
