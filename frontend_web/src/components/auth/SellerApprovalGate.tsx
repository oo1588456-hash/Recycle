"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { useAuthStore } from "@/lib/auth/auth-store";

export function SellerApprovalGate({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const access = useAuthStore((s) => s.access);
  const setUser = useAuthStore((s) => s.setUser);
  const pathname = usePathname();
  const router = useRouter();

  // Persist rehydrates `access` after first paint; empty deps would skip /auth/me/ forever.
  // Also refresh when the user returns to the tab so admin approvals show up without re-login.
  useEffect(() => {
    if (!access) return;

    const sync = () => {
      void api.get("/auth/me/").then((r) => setUser(r.data));
    };

    sync();

    const onVisible = () => {
      if (document.visibilityState === "visible") sync();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [access, setUser]);

  useEffect(() => {
    if (!user || user.role !== "seller") return;
    const st = user.seller_account_status;
    if (st !== "pending" && st !== "rejected") return;
    const allowed =
      pathname?.startsWith("/seller/pending-approval") || pathname?.startsWith("/seller/messages");
    if (allowed) return;
    router.replace("/seller/pending-approval");
  }, [user, pathname, router]);

  if (user?.role === "seller" && (user.seller_account_status === "pending" || user.seller_account_status === "rejected")) {
    const allowed =
      pathname?.startsWith("/seller/pending-approval") || pathname?.startsWith("/seller/messages");
    if (!allowed) {
      return (
        <div className="flex min-h-[40vh] items-center justify-center text-recycle-muted">
          Redirecting…
        </div>
      );
    }
  }

  return <>{children}</>;
}
