import { cn } from "@/lib/cn";
import { forwardRef, type InputHTMLAttributes } from "react";

export const AppInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }>(
  function AppInput({ className, label, error, ...props }, ref) {
    return (
      <label className="block w-full">
        {label && (
          <span className="mb-1.5 block text-sm font-medium text-recycle-charcoal">{label}</span>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full rounded-xl border border-recycle-border bg-white px-4 py-2.5 text-sm text-recycle-charcoal shadow-sm placeholder:text-recycle-muted focus:border-recycle-primary focus:outline-none focus:ring-2 focus:ring-recycle-mint",
            error && "border-recycle-error",
            className
          )}
          {...props}
        />
        {error && <span className="mt-1 block text-xs text-recycle-error">{error}</span>}
      </label>
    );
  }
);

AppInput.displayName = "AppInput";
