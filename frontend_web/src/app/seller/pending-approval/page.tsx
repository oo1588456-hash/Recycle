"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth/auth-store";
import { api } from "@/lib/api/client";
import { Card } from "@/components/ui/Card";

export default function SellerPendingApprovalPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const access = useAuthStore((s) => s.access);
  const setUser = useAuthStore((s) => s.setUser);
  const [checking, setChecking] = useState(false);

  const rejected = user?.seller_account_status === "rejected";
  const pending = user?.seller_account_status === "pending";
  const approved = user?.role === "seller" && user?.seller_account_status === "approved";

  const recheckStatus = useCallback(async () => {
    if (!access) return;
    setChecking(true);
    try {
      const { data } = await api.get("/auth/me/");
      setUser(data);
    } finally {
      setChecking(false);
    }
  }, [access, setUser]);

  useEffect(() => {
    void recheckStatus();
  }, [recheckStatus]);

  useEffect(() => {
    if (approved) router.replace("/seller/dashboard");
  }, [approved, router]);

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-2xl font-extrabold text-recycle-charcoal">
        {rejected ? "Seller account not approved" : pending ? "Seller account pending" : "Seller account"}
      </h1>
      <Card className="mt-6 p-6 text-sm text-recycle-charcoal">
        {rejected ? (
          <p>
            Your seller application was not approved. You can contact the platform administrator if you believe this is a mistake.
          </p>
        ) : pending ? (
          <p>
            Thank you for registering as a seller. A super administrator must approve your account before you can list
            products. You will use the same login once approved. If you were just approved, use &quot;Check status&quot;
            below or switch back to this tab so we can refresh your profile from the server.
          </p>
        ) : (
          <p>Your seller account is active.</p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          {(pending || rejected) && (
            <button
              type="button"
              disabled={checking || !access}
              onClick={() => void recheckStatus()}
              className="inline-flex items-center justify-center rounded-xl border-2 border-recycle-primary bg-recycle-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {checking ? "Checking…" : "Check approval status"}
            </button>
          )}
          <Link
            href="/seller/messages"
            className="inline-flex items-center justify-center rounded-xl border-2 border-recycle-border bg-white px-5 py-2.5 text-sm font-semibold text-recycle-charcoal hover:border-recycle-primary hover:text-recycle-primary"
          >
            Message admin
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-recycle-charcoal hover:bg-recycle-mint/60"
          >
            Browse store
          </Link>
        </div>
      </Card>
    </div>
  );
}
